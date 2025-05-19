import { useState, Dispatch, SetStateAction } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, ToggleButtonGroup, ToggleButton, Tooltip, IconButton } from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import { DarkMode, LightMode } from '@mui/icons-material';
import { AppSettings } from '../types/timer';

interface SettingsMenuProps {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  addSecondsToTimer: (seconds: number) => void;
  isSetupMode: boolean;  // Add this prop
}

export const SettingsMenu = ({
  settings,
  setSettings,
  addSecondsToTimer,
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
              value={settings.darkMode}
              exclusive
              onChange={(_, value) => value !== null && setSettings(prev => ({ ...prev, darkMode: value }))}
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
                onClick={() => setSettings(prev => ({ ...prev, fontSize: prev.fontSize - 1 }))}
              >
                -
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSettings(prev => ({ ...prev, fontSize: prev.fontSize + 1 }))}
              >
                +
              </Button>
            </div>
            </div>

          <div className="flex items-center justify-between">
            <span>Embedding overflow</span>
            <Switch
              checked={settings.embedOverflow}
              onChange={(e) => setSettings(prev => ({ ...prev, embedOverflow: e.target.checked}))}
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

            <div className="flex items-center justify-between">
            <span className="flex items-center">
              Keep Screen Awake
              <Tooltip title="Keeps your device's screen on while this tab is active. If you switch tabs or minimize the window, the screen will be allowed to sleep until you return.">
              <IconButton size="medium" sx={{ ml: 1 }}>
                <InfoIcon fontSize="medium" />
              </IconButton>
              </Tooltip>
            </span>
            <Switch
              checked={settings.wakeLockEnabled}
              onChange={e => setSettings(prev => ({ ...prev, wakeLockEnabled: e.target.checked }))}
              color="primary"
            />
            </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
