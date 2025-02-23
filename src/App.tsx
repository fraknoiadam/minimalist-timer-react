import { useState, useEffect, useRef } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsMenu } from './components/SettingsMenu';
import { TimerSetupForm } from './components/TimerSetupForm';
import { ContentEmbed } from './components/ContentEmbed';
import { useTimer } from './hooks/useTimer';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';

const CountdownTimer = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(window.innerWidth < 768 ? 6 : 10);  // Smaller on mobile
  const [marginBottom, setMarginBottom] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [links, setLinks] = useState<string[]>([]);
  const [linkSwitchDurationSec, setLinkSwitchDurationSec] = useState(0);
  const [embedFadeOutSec, setEmbedFadeOutSec] = useState(0);
  const timerRef = useRef<HTMLDivElement>(null);
  const [timerHeight, setTimerHeight] = useState(0);
  const [embedOverflow, setEmbedOverflow] = useState(true);

  const { time, paused, addSecondsToTimer, toggleTimer } = useTimer(90*60*1000);
  const remainingSeconds = time.seconds+time.minutes*60+time.hours*3600;

  const processSetupFormSubmission = (newLinks: string[], linkSwitchDurationSec: number, embedFadeOutSec: number) => {
    setLinks(newLinks);
    setLinkSwitchDurationSec(linkSwitchDurationSec);
    setShowForm(false);
    setEmbedFadeOutSec(embedFadeOutSec);
    
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
            setDarkMode(!event.shiftKey);
            break;
          case 'b':
            setFontSize(prev => Math.max(1, prev + (event.shiftKey ? 1 : -1)));
            break;
          case 'v':
            setMarginBottom(prev => Math.max(0, prev + (event.shiftKey ? 1 : -1)));
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
  }, [fontSize]); // Update when font size changes

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className="h-screen w-screen overflow-hidden">
        <SettingsMenu
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          addSecondsToTimer={addSecondsToTimer}
          setFontSize={setFontSize}
          embedOverflow={embedOverflow}
          setEmbedOverflow={setEmbedOverflow}
          isSetupMode={showForm}  // Add this prop
        />

        <div ref={timerRef}>
          <TimerDisplay
            time={time}
            isPaused={paused}
            fontSize={fontSize}
            marginBottom={marginBottom}
            onClick={toggleTimer}
          />
        </div>

        {showForm && <TimerSetupForm
          onStart={processSetupFormSubmission} 
        />}

        {!showForm && remainingSeconds > embedFadeOutSec-5 && (
            <div className={`transition-opacity ease-out duration-4000 ${remainingSeconds < embedFadeOutSec ? 'opacity-0' : 'opacity-100'}`}>
            <ContentEmbed 
              links={links} 
              animationPauseTime={linkSwitchDurationSec} 
              timerHeight={timerHeight}
              embedOverflow={embedOverflow}
            />
            </div>
        )}

      </div>
    </ThemeProvider>
  );
};

export default CountdownTimer;
