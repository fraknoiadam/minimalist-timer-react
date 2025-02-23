import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Settings from '@mui/icons-material/Settings';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="fixed top-0 left-0 w-20 h-20 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`absolute top-0 left-0 p-4 transition-transform duration-300 ease-in-out ${
            isHovered ? 'translate-y-0' : '-translate-y-full'
          }`}
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
            <span>Dark Mode</span>
            <Button 
              variant="outlined"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? 'Disable' : 'Enable'}
            </Button>
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
            <span>Adjust Timer</span>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                onClick={() => addSecondsToTimer(-60)}
              >
                -1m
              </Button>
              <Button
                variant="outlined"
                onClick={() => addSecondsToTimer(60)}
              >
                +1m
              </Button>
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
