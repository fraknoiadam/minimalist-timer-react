import { useState, useEffect, useRef, useMemo } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsMenu } from './components/SettingsMenu';
import { TimerSetupForm } from './components/TimerSetupForm';
import { ContentEmbed } from './components/ContentEmbed';
import { SavedTimerStates } from './components/SavedTimerStates';
import { TimerCodeInput } from './components/TimerCodeInput';
import { ShareDialog } from './components/ShareDialog';
import { useTimer } from './hooks/useTimer';
import { useSavedTimerStates } from './hooks/useSavedTimerStates';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';
import { useAppSettings } from './hooks/useAppSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';
import { SavedState } from './types/timer';
import Box from '@mui/material/Box';

async function loadTimerFromURL(timerId: string, onLoadState: (state: SavedState) => void) {
  try {
    const timerService = (await import('./services/timerService')).timerService;
    const state = await timerService.getTimerState(timerId);
    if (!state) {
      console.error('No timer state found for ID:', timerId);
      return;
    }          
    onLoadState(state);
  } catch (error) {
    console.error('Error loading timer from URL:', error);
  };
};


const CountdownTimer = () => {
  const [showForm, setShowForm] = useState(true);
  const timerRef = useRef<HTMLDivElement>(null);
  const [timerHeight, setTimerHeight] = useState(0);
  const [isLoadingSharedTimer, setIsLoadingSharedTimer] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareableTimerState, setShareableTimerState] = useState<SavedState | undefined>(undefined);

  const { time, paused, timerState, addSecondsToTimer, toggleTimer, setTimerState } = useTimer(90 * 60 * 1000);
  const { settings, setSettings, updateEmbedSettings } = useAppSettings();
  const { savedStates, updateSavedState, deleteSavedState, addSavedState, setCurrentID, currentID } = useSavedTimerStates();
  

  function onLoadState(state: SavedState) {
    setTimerState(state.timerState);
    setSettings(state.appSettings);
    setCurrentID(state.id);
    setShowForm(false);
  }
  

  useEffect(() => {
    const fetchTimer = async () => {
      setIsLoadingSharedTimer(true);
      const params = new URLSearchParams(window.location.search);
      const timerId = params.get('timer');
      if (!timerId) {
        setIsLoadingSharedTimer(false)
        return;
      }
      await loadTimerFromURL(timerId, onLoadState);
      setIsLoadingSharedTimer(false)
    };
    
    fetchTimer();
  }, []);

  // Create the current timer state object for sharing
  const currentTimerState = useMemo<SavedState | undefined>(() => {
    if (!currentID) return undefined;
    
    return {
      id: currentID,
      name: `Timer ${new Date().toLocaleString()}`,
      savedAt: Date.now(),
      timerState: timerState,
      appSettings: settings
    };
  }, [currentID, timerState, settings]);

  const remainingSeconds = time.seconds + time.minutes * 60 + time.hours * 3600;

  const formatTimeForTitle = (hours: number, minutes: number, seconds: number): string => {
    return `${hours > 0 ? `${hours}:` : ''}${hours > 0 ? String(minutes).padStart(2, '0') : minutes}:${String(seconds).padStart(2, '0')} - Timer`;
  };

  useKeyboardShortcuts({ addSecondsToTimer, setSettings });
  useScreenWakeLock(settings.wakeLockEnabled, setSettings);

  // Update document title with remaining time
  useEffect(() => {
    if (!showForm) {
      document.title = formatTimeForTitle(time.hours, time.minutes, time.seconds);
    } else {
      document.title = 'Timer';
    }
  }, [time, showForm]);

  useEffect(() => {
    updateSavedState(timerState, settings);
  }, [timerState, settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const processSetupFormSubmission = (
    links: string[],
    linkSwitchDurationSec: number,
    embedFadeOutSec: number
  ) => {
    links = links.filter(link => link.trim() !== '');
    updateEmbedSettings(links, linkSwitchDurationSec, embedFadeOutSec);
    addSavedState(timerState, settings); // settings is not updated yet, but useEffect will update it
    setShowForm(false);

    try {
      document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Failed to enter fullscreen mode:', error);
    }
  };

  useEffect(() => {
    const updateTimerHeight = () => {
      if (timerRef.current) {
        setTimerHeight(timerRef.current.offsetHeight);
      }
    };

    updateTimerHeight();
    window.addEventListener('resize', updateTimerHeight);
    return () => window.removeEventListener('resize', updateTimerHeight);
  }, [settings.fontSize]); // Update when font size changes

  return (
    <ThemeProvider theme={settings.darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {isLoadingSharedTimer ? (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl mb-4">Loading shared timer...</h2>
          </div>
        </div>
      ) : (
        <div className={`h-screen w-screen ${showForm ? 'overflow-auto' : 'overflow-hidden'}`}>
          <SettingsMenu
            settings={settings}
            setSettings={setSettings}
            addSecondsToTimer={addSecondsToTimer}
            isSetupMode={showForm}
            onShareClick={!showForm && currentTimerState ? () => {
              setShareableTimerState(currentTimerState);
              setIsShareDialogOpen(true);
            } : undefined}
        />

        <div ref={timerRef}>
          <TimerDisplay
            time={time}
            isPaused={paused}
            fontSize={settings.fontSize}
            marginBottom={10}
            onClick={toggleTimer}
          />
        </div>

        {showForm && (
          <Box sx={{ width: '100%', p: 2, mt: 2, position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'flex-start' },
                gap: 3,
                width: '100%',
              }}
            >
              <Box sx={{ width: { xs: '100%', md: 250 }, flexShrink: 0, mb: { xs: 2, md: 0 } }}>
                <SavedTimerStates
                  savedStates={savedStates}
                  onLoadState={(id) => {
                    const state = savedStates.find(state => state.id === id)!;
                    setTimerState(state.timerState);
                    setSettings(state.appSettings);
                    setCurrentID(id);
                    setShowForm(false);
                  }}
                  onDeleteState={deleteSavedState}
                  onShareState={(state) => {
                    setShareableTimerState(state);
                    setIsShareDialogOpen(true);
                  }}
                />
              </Box>
              <Box
                sx={{
                  position: { md: 'absolute' },
                  // If screen width >= 850px, change left offset.
                  // Since 'md' breakpoint (900px) is >= 850px, this applies to all 'md' screens.
                  left: { md: '50%' },
                  transform: { md: 'translateX(-50%)' },
                  width: '100%',
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <TimerCodeInput 
                    onLoadState={(state) => {
                      setTimerState(state.timerState);
                      setSettings(state.appSettings);
                      if (state.id) {
                        setCurrentID(state.id);
                      }
                      setShowForm(false);
                    }} 
                  />
                </Box>
                <TimerSetupForm onStart={processSetupFormSubmission} />
              </Box>
            </Box>
          </Box>
        )}

        {!showForm &&
          <ContentEmbed
            remainingSeconds={remainingSeconds}
            appSettings={settings}
            timerHeight={timerHeight}
          />
        }
      </div>
      )}
      
      {/* Share Dialog - outside of conditional rendering to avoid unmounting when editing */}
      {shareableTimerState && (
        <ShareDialog
          open={isShareDialogOpen}
          onClose={() => {
            setIsShareDialogOpen(false);
            setShareableTimerState(undefined);
          }}
          currentTimerState={shareableTimerState}
        />
      )}
    </ThemeProvider>
  );
};

export default CountdownTimer;
