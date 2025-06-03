import { Dispatch, SetStateAction, useEffect } from 'react';
import { AppSettings } from '../types/timer';

interface UseKeyboardShortcutsProps {
  addSecondsToTimer: (seconds: number) => void;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
}

export const useKeyboardShortcuts = ({
  addSecondsToTimer,
  setSettings,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'q':
            setSettings(prev => ({ ...prev, darkMode: !event.shiftKey }));
            break;
          case 'b':
            setSettings(prev => ({
              ...prev,
              fontSize: Math.max(1, prev.fontSize + (event.shiftKey ? 1 : -1)),
            }));
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
  }, [addSecondsToTimer, setSettings]);
};
