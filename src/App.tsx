import { useState, useEffect, useRef } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsMenu } from './components/SettingsMenu';
import { useTimer } from './hooks/useTimer';
import { TimerSetupForm } from './components/TimerSetupForm';

const CountdownTimer = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(10);
  const [marginBottom, setMarginBottom] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [currentSheet, setCurrentSheet] = useState(0);
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

  useEffect(() => {
    if (!showForm && links.length > 1) {
      const interval = setInterval(() => {
        setCurrentSheet(prev => (prev + 1) % links.length);
      }, animationPauseTime * 1000);

      return () => clearInterval(interval);
    }
  }, [showForm, links.length, animationPauseTime]);

  return (
    <div className={`min-h-screen w-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <SettingsMenu
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        addSecondsToTimer={addSecondsToTimer}
        setFontSize={setFontSize}
      />

      <div className="w-screen">
        <TimerDisplay
          time={time}
          isPaused={paused}
          fontSize={fontSize}
          marginBottom={marginBottom}
          onClick={toggleTimer}
        />

        {showForm && <TimerSetupForm onStart={handleFormSubmit} />}

        {!showForm && links[0] && (
          <div className="fixed inset-0 w-screen h-screen">
            {links.map((link, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSheet ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <iframe
                  src={link}
                  className="w-full h-full border-0"
                  title={`Spreadsheet ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
