import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './components/ui/card';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsMenu } from './components/SettingsMenu';
import { useTimer } from './hooks/useTimer';

const CountdownTimer = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(10);
  const [marginBottom, setMarginBottom] = useState(0);
  const [links, setLinks] = useState(['']);
  const [showForm, setShowForm] = useState(true);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [animationPauseTime, setAnimationPauseTime] = useState(15);

  const { time, paused, addSecondsToTimer, toggleTimer } = useTimer(1 * 60);

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

  const addLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((link, i) => i === index ? value : link));
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

        {showForm && (
          <Card className="max-w-2xl mx-auto">
            <CardContent
              className="p-6"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              <h3 className="text-xl font-bold mb-4">How to use?</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Please use fullscreen mode (F11)</li>
                <li>Make spreadsheets fullscreen: View menu (top left) - Fullscreen</li>
                <li>After starting the timer, move cursor to the edge of the screen</li>
              </ul>

              <div className="space-y-4">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded text-black"
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      placeholder="Spreadsheet URL"
                    />
                    {index === links.length - 1 && (
                      <button
                        onClick={addLink}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}

                {links.length > 1 && (
                  <div>
                    <label className="block mb-2">Animation pause time (seconds):</label>
                    <input
                      type="number"
                      className="p-2 border rounded text-black"
                      value={animationPauseTime}
                      onChange={(e) => setAnimationPauseTime(Number(e.target.value))}
                    />
                  </div>
                )}

                <button
                  onClick={() => setShowForm(false)}
                  className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Start Timer
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Shortcuts</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Shortcut</th>
                      <th className="border p-2 text-left">Function</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">alt+q/Q</td>
                      <td className="border p-2">Toggle dark mode</td>
                    </tr>
                    <tr>
                      <td className="border p-2">alt+h/H</td>
                      <td className="border p-2">Decrease/increase by 1 hour</td>
                    </tr>
                    <tr>
                      <td className="border p-2">alt+m/M</td>
                      <td className="border p-2">Decrease/increase by 1 minute</td>
                    </tr>
                    <tr>
                      <td className="border p-2">alt+s/S</td>
                      <td className="border p-2">Decrease/increase by 1 second</td>
                    </tr>
                    <tr>
                      <td className="border p-2">alt+b/B</td>
                      <td className="border p-2">Decrease/increase timer size</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

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

export function Home() {
  return (
    <h1 className="text-5xl font-bold underline">
      Hello world!
    </h1>
  )
}
