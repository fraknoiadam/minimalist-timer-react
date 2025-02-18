import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './components/ui/card';

const CountdownTimer = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [time, setTime] = useState({ hours: 1, minutes: 30, seconds: 0 });
  const [isPaused, setIsPaused] = useState(true);
  const [fontSize, setFontSize] = useState(10);
  const [marginBottom, setMarginBottom] = useState(0);
  const [links, setLinks] = useState(['']);
  const [showForm, setShowForm] = useState(true);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [animationPauseTime, setAnimationPauseTime] = useState(15);
  const [showSettings, setShowSettings] = useState(false);

  const startTimeRef = useRef<Date | null>(null);
  const pauseTimeRef = useRef<number>(0);
  const pauseMomentRef = useRef<Date | null>(null);
  const timerRef = useRef<number | null>(null);

  // Add helper function
  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, '0');

  // Timer logic
  useEffect(() => {
    if (!isPaused && !showForm) {
      const clockTick = () => {
        const curTime = new Date();
        // Ensure startTimeRef.current is not null (it is set below)
        const elapsed = startTimeRef.current ? curTime.getTime() - startTimeRef.current.getTime() : 0;
        let mils = -elapsed + pauseTimeRef.current + 5400 * 1000;
        mils = Math.max(mils, 0);

        const totalSeconds = Math.floor(mils / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTime({ hours, minutes, seconds });

        if (totalSeconds > 0) {
          timerRef.current = requestAnimationFrame(clockTick);
        }
      };

      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }
      timerRef.current = requestAnimationFrame(clockTick);
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [isPaused, showForm]);
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

  const addSecondsToTimer = (seconds: number) => {
    const totalCurrentSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;
    const newTotalSeconds = Math.max(0, totalCurrentSeconds + seconds);

    setTime({
      hours: Math.floor(newTotalSeconds / 3600),
      minutes: Math.floor((newTotalSeconds % 3600) / 60),
      seconds: newTotalSeconds % 60
    });
  };

  const handleTimerClick = () => {
    if (showForm) {
      pauseTimeRef.current += pauseMomentRef.current 
        ? (new Date().getTime() - pauseMomentRef.current.getTime()) 
        : 0;
      setIsPaused(false);
      startTimeRef.current = new Date();
    } else {
      setIsPaused(prev => {
        if (prev) {
          // Fix the Date arithmetic by using getTime()
          pauseTimeRef.current += pauseMomentRef.current 
            ? (new Date().getTime() - pauseMomentRef.current.getTime())
            : 0;
        } else {
          pauseMomentRef.current = new Date();
        }
        return !prev;
      });
    }
  };

  const addLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((link, i) => i === index ? value : link));
  };
  // Using the properly typed updateLink; the duplicate has been removed.
  // Auto-switch sheets
  useEffect(() => {
    if (!showForm && links.length > 1) {
      const interval = setInterval(() => {
        setCurrentSheet(prev => (prev + 1) % links.length);
      }, animationPauseTime * 1000);

      return () => clearInterval(interval);
    }
  }, [showForm, links.length, animationPauseTime]);

  return (
    <div
      className={`min-h-screen w-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Settings Menu */}
      <div
        className="fixed top-0 right-0 w-16 h-16 z-50"
        onMouseEnter={() => setShowSettings(true)}
      >
        {showSettings && (
          <div
            className="fixed top-0 right-0 w-64 bg-gray-800 text-white p-4 rounded-bl-lg shadow-lg"
            onMouseLeave={() => setShowSettings(false)}
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            <div className="space-y-2">
              <button
                onClick={() => setDarkMode(false)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                Light mode
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                Dark mode
              </button>
              <button
                onClick={() => addSecondsToTimer(-3600)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                -1 hour
              </button>
              <button
                onClick={() => addSecondsToTimer(-60)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                -1 min
              </button>
              <button
                onClick={() => addSecondsToTimer(-1)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                -1 sec
              </button>
              <button
                onClick={() => addSecondsToTimer(1)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                +1 sec
              </button>
              <button
                onClick={() => addSecondsToTimer(60)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                +1 min
              </button>
              <button
                onClick={() => addSecondsToTimer(3600)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                +1 hour
              </button>
              <button
                onClick={() => setFontSize(prev => Math.max(1, prev - 1))}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                Decrease size
              </button>
              <button
                onClick={() => setFontSize(prev => prev + 1)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
              >
                Increase size
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-screen">
        {/* Timer Display */}
        <div
          className={`text-center py-8 cursor-pointer ${isPaused ? 'opacity-50' : ''}`}
          style={{
            marginBottom: `${marginBottom}px`,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 'bold'
          }}
          onClick={handleTimerClick}
        >
          <div style={{ fontSize: `${fontSize}rem` }}>
            {`${time.hours}:${formatTimeUnit(time.minutes)}:${formatTimeUnit(time.seconds)}`}
          </div>
        </div>

        {/* Setup Form */}
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

        {/* Spreadsheet iframes */}
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
