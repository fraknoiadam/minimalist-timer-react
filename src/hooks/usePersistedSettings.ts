import { useState, useEffect } from 'react';

interface AppSettings {
  darkMode: boolean;
  fontSize: number;
  embedOverflow: boolean;
  embedSettings?: {
    links: string[];
    linkSwitchDurationSec: number;
    embedFadeOutSec: number;
  };
}

const defaultSettings: AppSettings = {
  darkMode: true,
  fontSize: window.innerWidth < 768 ? 6 : 10,
  embedOverflow: true
};

export const usePersistedSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('durerSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('durerSettings', JSON.stringify(settings));
  }, [settings]);

  const updateEmbedSettings = (
    links: string[],
    linkSwitchDurationSec: number,
    embedFadeOutSec: number
  ) => {
    setSettings(prev => ({
      ...prev,
      embedSettings: {
        links,
        linkSwitchDurationSec,
        embedFadeOutSec
      }
    }));
  };

  return {
    settings,
    setSettings,
    updateEmbedSettings
  };
};
