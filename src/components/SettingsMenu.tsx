import { useState } from 'react';

interface SettingsMenuProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  addSecondsToTimer: (seconds: number) => void;
  setFontSize: (cb: (prev: number) => number) => void;
}

export const SettingsMenu = ({
  darkMode,
  setDarkMode,
  addSecondsToTimer,
  setFontSize
}: SettingsMenuProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div
      className="fixed top-0 right-0 w-16 h-16 z-50"
      onMouseEnter={() => setShowSettings(true)}
      onMouseLeave={() => setShowSettings(false)}
    >
      {showSettings && (
        <div className="fixed top-0 right-0 w-64 bg-gray-800 text-white p-4 rounded-bl-lg shadow-lg">
          {/* ... existing settings menu content ... */}
        </div>
      )}
    </div>
  );
};
