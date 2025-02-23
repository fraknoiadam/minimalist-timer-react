import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, ToggleButtonGroup, ToggleButton } from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import { DarkMode, LightMode } from '@mui/icons-material';

interface SettingsMenuProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  addSecondsToTimer: (seconds: number) => void;
  setFontSize: (cb: (prev: number) => number) => void;
  embedOverflow: boolean;
  setEmbedOverflow: (value: boolean) => void;
  isSetupMode: boolean;  // Add this prop
}

export const SettingsMenu = ({
  darkMode,
  setDarkMode,
  addSecondsToTimer,
  setFontSize,
  embedOverflow,
  setEmbedOverflow,
  isSetupMode
}: SettingsMenuProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="fixed top-0 left-0 w-20 h-20 z-50"
        onMouseEnter={() => !isSetupMode && setIsHovered(true)}
        onMouseLeave={() => !isSetupMode && setIsHovered(false)}
      >
        <div
          className={`absolute top-0 left-0 p-4 transition-transform duration-300 ease-in-out ${
        isSetupMode || isHovered ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{ transitionDelay: isHovered ? '0ms' : '400ms' }}
        >
          <Button
        onClick={() => setIsModalOpen(true)}
        variant="contained"
        color="primary"
          >
        <Settings className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent className="space-y-4">
            <div className="flex items-center justify-between">
            <span>Theme</span>
            <ToggleButtonGroup
              value={darkMode}
              exclusive
              onChange={(_, value) => value !== null && setDarkMode(value)}
              size="small"
            >
                <ToggleButton value={false} className="px-8 py-8">
                <LightMode /> Light
                </ToggleButton>
                <ToggleButton value={true} className="px-4 py-2">
                <DarkMode /> Dark
                </ToggleButton>
            </ToggleButtonGroup>
            </div>

          <div className="flex items-center justify-between">
            <span>Font Size</span>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                onClick={() => setFontSize(prev => prev - 1)}
              >
                -
              </Button>
              <Button
                variant="outlined"
                onClick={() => setFontSize(prev => prev + 1)}
              >
                +
              </Button>
            </div>
            </div>

          <div className="flex items-center justify-between">
            <span>Embedding overflow</span>
            <Switch
              checked={embedOverflow}
              onChange={(e) => setEmbedOverflow(e.target.checked)}
              color="primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Adjust Timer</span>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(-1)}>-1s</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(-10)}>-10s</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(-60)}>-1m</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(-600)}>-10m</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(-3600)}>-1h</Button>
              <div className="w-full"></div>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(1)}>+1s</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(10)}>+10s</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(60)}>+1m</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(600)}>+10m</Button>
              <Button variant="outlined" size="small" onClick={() => addSecondsToTimer(3600)}>+1h</Button>
            </div>

          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
