import { useState, useEffect, useRef } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsMenu } from './components/SettingsMenu';
import { TimerSetupForm } from './components/TimerSetupForm';
import { ContentEmbed } from './components/ContentEmbed';
import { useTimer } from './hooks/useTimer';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';
import { usePersistedSettings } from './hooks/usePersistedSettings';

const CountdownTimer = () => {
  const { settings, setSettings, updateEmbedSettings } = usePersistedSettings();
  const [showForm, setShowForm] = useState(true);
  const timerRef = useRef<HTMLDivElement>(null);
  const [timerHeight, setTimerHeight] = useState(0);

  const { time, paused, addSecondsToTimer, toggleTimer } = useTimer(90 * 60 * 1000);
  const remainingSeconds = time.seconds + time.minutes * 60 + time.hours * 3600;

  const processSetupFormSubmission = (
    links: string[],
    linkSwitchDurationSec: number,
    embedFadeOutSec: number
  ) => {
    updateEmbedSettings(links, linkSwitchDurationSec, embedFadeOutSec);
    setShowForm(false);
    // Request fullscreen on form submission
    try {
      document.documentElement.requestFullscreen();
    } catch (error) {
      console.warn('Failed to enter fullscreen mode:', error);
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
          case 'v':
            setSettings(prev => ({ ...prev, marginBottom: Math.max(0, prev.marginBottom + (event.shiftKey ? 1 : -1)) }));
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
      <div className="h-screen w-screen overflow-hidden">
        <SettingsMenu
          darkMode={settings.darkMode}
          setDarkMode={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
          addSecondsToTimer={addSecondsToTimer}
          setFontSize={(cb) => setSettings(prev => ({ ...prev, fontSize: cb(prev.fontSize) }))}
          embedOverflow={settings.embedOverflow}
          setEmbedOverflow={(value) => setSettings(prev => ({ ...prev, embedOverflow: value }))}
          isSetupMode={showForm}
        />

        <div ref={timerRef}>
          <TimerDisplay
            time={time}
            isPaused={paused}
            fontSize={settings.fontSize}
            marginBottom={settings.marginBottom}
            onClick={toggleTimer}
          />
        </div>

        {showForm && <TimerSetupForm
          onStart={processSetupFormSubmission} 
        />}

        {!showForm && remainingSeconds > settings.embedFadeOutSec-5 && (
            <div className={`transition-opacity ease-out duration-4000 ${remainingSeconds < settings.embedFadeOutSec ? 'opacity-0' : 'opacity-100'}`}>
            <ContentEmbed 
              links={settings.links} 
              animationPauseTime={settings.linkSwitchDurationSec} 
              timerHeight={timerHeight}
              embedOverflow={settings.embedOverflow}
            />
            </div>
        )}

      </div>
    </ThemeProvider>
  );
};

export default CountdownTimer;
