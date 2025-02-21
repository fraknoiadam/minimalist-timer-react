import { useState, useEffect } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsMenu } from './components/SettingsMenu';
import { TimerSetupForm } from './components/TimerSetupForm';
import { ContentEmbed } from './components/ContentEmbed';
import { useTimer } from './hooks/useTimer';

const CountdownTimer = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(10);
  const [marginBottom, setMarginBottom] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [links, setLinks] = useState<string[]>([]);
  const [animationPauseTime, setAnimationPauseTime] = useState(15);

  const { time, paused, addSecondsToTimer, toggleTimer } = useTimer(60 * 60 * 1000);

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

  const handleFormSubmit = (newLinks: string[], newAnimationPauseTime: number) => {
    setLinks(newLinks);
    setAnimationPauseTime(newAnimationPauseTime);
    setShowForm(false);
  };

  return (
    <div className={`min-h-screen w-screen ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`
    }>
      <SettingsMenu
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        addSecondsToTimer={addSecondsToTimer}
        setFontSize={setFontSize}
      />

      <TimerDisplay
        time={time}
        isPaused={paused}
        fontSize={fontSize}
        marginBottom={marginBottom}
        onClick={toggleTimer}
      />

      {showForm && <TimerSetupForm onStart={handleFormSubmit} />}

      {!showForm && <ContentEmbed 
        links={links} 
        animationPauseTime={animationPauseTime} 
      />}
    </div>
  );
};

export default CountdownTimer;
