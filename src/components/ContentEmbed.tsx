import { useEffect, useState } from 'react';
import { AppSettings } from '../types/timer';

interface ContentEmbedProps {
  remainingSeconds: number;
  appSettings: AppSettings;
  timerHeight: number;
}

export const ContentEmbed = ({
  remainingSeconds,
  appSettings,
  timerHeight,
}: ContentEmbedProps) => {
  const { embedSettings, embedOverflow } = appSettings;
  const links = embedSettings?.links ?? [];
  const linkSwitchDurationSec = embedSettings?.linkSwitchDurationSec ?? 0;
  const [currentLink, setCurrentLink] = useState(0);

  const shouldHide =
    !embedSettings ||
    links.length === 0 ||
    links.every(link => !link) ||
    remainingSeconds < embedSettings.embedFadeOutSec - 5;

  useEffect(() => {
    if (links.length > 1) {
      const interval = setInterval(() => {
        setCurrentLink(prev => (prev + 1) % links.length);
      }, linkSwitchDurationSec * 1000);

      return () => clearInterval(interval);
    }
  }, [links.length, linkSwitchDurationSec]);

  if (shouldHide) {
    return null; // No links to display
  }

  return (
    <div className={`transition-opacity ease-out duration-4000 ${remainingSeconds < embedSettings.embedFadeOutSec ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex-1 relative mx-10">
        {links.map((link, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentLink ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            // Pointer events allows to click on the current iframe (not on the hidden ones).
            style={{
              height: `calc(100vh - ${timerHeight}px + ${embedOverflow ? 50 : 0}px)` // 50px for hide
            }}
          >
            <iframe
              src={link}
              className="w-full h-full border-0"
              title={`Embedded content ${index + 1}`}  // Updated title to be more generic
            />
          </div>
        ))}
      </div>
    </div>
  );
};
