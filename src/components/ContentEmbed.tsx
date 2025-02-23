import { useEffect, useState } from 'react';

interface ContentEmbedProps {
  links: string[];
  animationPauseTime: number;
}

export const ContentEmbed = ({ links, animationPauseTime }: ContentEmbedProps) => {
    const [currentLink, setCurrentLink] = useState(0);

    useEffect(() => {
      if (links.length > 1) {
        const interval = setInterval(() => {
          setCurrentLink(prev => (prev + 1) % links.length);
        }, animationPauseTime * 1000);
  
        return () => clearInterval(interval);
      }
    }, [links.length, animationPauseTime]);
  
    if (!links[0]) return null;

    return (
    <div className="flex-1 relative mx-10">
      {links.map((link, index) => (
      <div
        key={index}
        className={`absolute inset-0 transition-opacity duration-500 ${
        index === currentLink ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        // Pointer events allows to click on the current iframe (not on the hidden ones).
        style={{ 
        height: `calc(100vh - 100px)`
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
  );
};
