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

const CountdownTimer = () => {
  const [showForm, setShowForm] = useState(true);
  const timerRef = useRef<HTMLDivElement>(null);
  const [timerHeight, setTimerHeight] = useState(0);
  
  const { time, paused, timerState, addSecondsToTimer, toggleTimer, setTimerState } = useTimer(90 * 60 * 1000);
  const { settings, setSettings, updateEmbedSettings } = useAppSettings();
  const { savedStates, updateSavedState, deleteSavedState, addSavedState, setCurrentID } = useSavedTimerStates();

  const remainingSeconds = time.seconds + time.minutes * 60 + time.hours * 3600;

  useEffect(() => {
    console.log('Timer state updated');
    updateSavedState(timerState, settings);
  }, [timerState, settings]);

  const processSetupFormSubmission = (
    links: string[],
    linkSwitchDurationSec: number,
    embedFadeOutSec: number
  ) => {
    links = links.filter(link => link.trim() !== '');
    const updatedSettings = updateEmbedSettings(links, linkSwitchDurationSec, embedFadeOutSec);
    console.log('Updated settings:', updatedSettings);
    addSavedState(timerState, updatedSettings);
    setShowForm(false);

    try {
      document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Failed to enter fullscreen mode:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'q':
            setSettings(prev => ({ ...prev, darkMode: !event.shiftKey }));
            break;
          case 'b':
            setSettings(prev => ({ ...prev, fontSize: Math.max(1, prev.fontSize + (event.shiftKey ? 1 : -1)) }));
            break;
          case 'h':
            addSecondsToTimer(event.shiftKey ? 3600 : -3600);
            break;
          case 'm':
            addSecondsToTimer(event.shiftKey ? 60 : -60);
            break;
          case 's':
            addSecondsToTimer(event.shiftKey ? 1 : -1);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [time]);

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
          <>
            <SavedTimerStates
              savedStates={savedStates}
              onLoadState={(id) => {
                const state = savedStates.find(state => state.id === id);
                if (!state) throw new Error('State not found');
                setTimerState(state.timerState);
                setSettings(state.appSettings);
                setCurrentID(id);
                setShowForm(false);
              }}
              onDeleteState={deleteSavedState}
            />
            <TimerSetupForm onStart={processSetupFormSubmission} />
          </>
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
