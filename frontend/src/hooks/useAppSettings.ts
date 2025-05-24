import { useState } from 'react';
import { AppSettings } from '../types/timer';

const defaultSettings: AppSettings = {
  darkMode: true,
  fontSize: window.innerWidth < 768 ? 6 : 10,
  embedOverflow: true,
  wakeLockEnabled: true
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('durerSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateEmbedSettings = (
    links: string[],
    linkSwitchDurationSec: number,
    embedFadeOutSec: number
  ) => {
    setSettings(prev => {
      return {
        ...prev,
        embedSettings: {
          links,
          linkSwitchDurationSec,
          embedFadeOutSec
        }
      };
    });
  };

  return {
    settings,
    setSettings,
    updateEmbedSettings
  };
};
