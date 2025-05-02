import { useState } from 'react';
import { AppSettings } from '../types/timer';

const defaultSettings: AppSettings = {
  darkMode: true,
  fontSize: window.innerWidth < 768 ? 6 : 10,
  embedOverflow: true
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('durerSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateEmbedSettings = (
    links: string[],
    linkSwitchDurationSec: number,
    embedFadeOutSec: number
  ): AppSettings => {
    let updatedSettings: AppSettings;
  
    setSettings(prev => {
      updatedSettings = {
        ...prev,
        embedSettings: {
          links,
          linkSwitchDurationSec,
          embedFadeOutSec
        }
      };
      return updatedSettings;
    });
    return updatedSettings!;
  };

  return {
    settings,
    setSettings,
    updateEmbedSettings
  };
};
