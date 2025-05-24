import { useState, useEffect, useRef } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsMenu } from './components/SettingsMenu';
import { TimerSetupForm } from './components/TimerSetupForm';
import { ContentEmbed } from './components/ContentEmbed';
import { SavedTimerStates } from './components/SavedTimerStates';
import { useTimer } from './hooks/useTimer';
import { useSavedTimerStates } from './hooks/useSavedTimerStates';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';
import { useAppSettings } from './hooks/useAppSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';
import Box from '@mui/material/Box';

const CountdownTimer = () => {
  const [showForm, setShowForm] = useState(true);
  const timerRef = useRef<HTMLDivElement>(null);
  const [timerHeight, setTimerHeight] = useState(0);

  const { time, paused, timerState, addSecondsToTimer, toggleTimer, setTimerState } = useTimer(90 * 60 * 1000);
  const { settings, setSettings, updateEmbedSettings } = useAppSettings();
  const { savedStates, updateSavedState, deleteSavedState, addSavedState, setCurrentID } = useSavedTimerStates();

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
      <div className={`h-screen w-screen ${showForm ? 'overflow-auto' : 'overflow-hidden'}`}>
        <SettingsMenu
          settings={settings}
          setSettings={setSettings}
          addSecondsToTimer={addSecondsToTimer}
          isSetupMode={showForm}
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
    </ThemeProvider>
  );
};

export default CountdownTimer;
