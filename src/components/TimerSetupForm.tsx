import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Box, Button, TextField } from '@mui/material';
import { useQuickLinks } from '../hooks/useQuickLinks';
import {
  getAppSettingsOverrides,
  QuickLinkAppSettings,
  QuickLinkPreset,
} from '../quickLinksConfig';

interface TimerSetupFormProps {
  onStart: (
    links: string[],
    animationPauseTime: number,
    embedFadeOutSec: number,
  ) => void;
  onApplyAppSettings: (overrides: QuickLinkAppSettings) => void;
}

export const TimerSetupForm = ({ onStart, onApplyAppSettings }: TimerSetupFormProps) => {
  const [links, setLinks] = useState(['']);
  const [linkSwitchDurationSec, setLinkSwitchDurationSec] = useState(15);
  const [embedFadeOutMin, setEmbedFadeOutMin] = useState(10);
  const { presets } = useQuickLinks();


  const addLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  // Fields the preset does not set (neither itself nor via defaults) keep their current value.
  const handlePresetClick = ({ settings }: QuickLinkPreset) => {
    if (settings.links) setLinks(settings.links);
    if (settings.linkSwitchDurationSec !== undefined) setLinkSwitchDurationSec(settings.linkSwitchDurationSec);
    if (settings.embedFadeOutMin !== undefined) setEmbedFadeOutMin(settings.embedFadeOutMin);

    const appSettings = getAppSettingsOverrides(settings);
    if (Object.keys(appSettings).length > 0) onApplyAppSettings(appSettings);
  };

  const handleStart = () => {
    onStart(links, linkSwitchDurationSec, embedFadeOutMin*60);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent
        className="p-6"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <h3 className="text-xl font-bold mb-4">How to use?</h3>
        <ul className="list-disc pl-6 mb-4">
            <li>Set up URLs to be displayed below the timer.</li>
            <li>There is a settings button in the top left corner.</li>
            <li>You can start the timer by clicking on it.</li>
        </ul>

        {presets.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {presets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        <div className="space-y-4">
          {links.map((link, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2 }}>
              <TextField
              fullWidth
              size="small"
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
              placeholder="URL"
              sx={{ flex: 1 }}
              />
              {index === links.length - 1 && (
              <Button
                variant="contained"
                onClick={addLink}
                sx={{ minWidth: '40px', px: 1 }}
              >
                +
              </Button>
              )}
            </Box>
          ))}

          {links.length > 1 && (
            <Box sx={{ my: 2 }}>
              <TextField
              fullWidth
              size="small"
              type="number"
              label="Link switch time (seconds)"
              value={linkSwitchDurationSec}
              onChange={(e) => setLinkSwitchDurationSec(Math.max(1, Number(e.target.value)))}
              />
            </Box>

          )}
          <Box sx={{ my: 2 }}>
            <TextField
            fullWidth
            size="small"
            type="number"
            label="Fade out time (minutes)"
            value={embedFadeOutMin}
            onChange={(e) => setEmbedFadeOutMin(Math.max(0, Number(e.target.value)))}
            />
          </Box>


            <Button
            onClick={handleStart}
            variant="contained"
            color="success"
            fullWidth
            sx={{ p: 2 }}
            >
            Load sites
            </Button>

        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Shortcuts</h3>
          <table>
            <thead>
              <tr>
                <th className="border p-2 text-left">Shortcut</th>
                <th className="border p-2 text-left">Function</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">alt+q/Q</td>
                <td className="border p-2">Toggle dark mode</td>
              </tr>
              <tr>
                <td className="border p-2">alt+h/H</td>
                <td className="border p-2">Decrease/increase by 1 hour</td>
              </tr>
              <tr>
                <td className="border p-2">alt+m/M</td>
                <td className="border p-2">Decrease/increase by 1 minute</td>
              </tr>
              <tr>
                <td className="border p-2">alt+s/S</td>
                <td className="border p-2">Decrease/increase by 1 second</td>
              </tr>
              <tr>
                <td className="border p-2">alt+b/B</td>
                <td className="border p-2">Decrease/increase timer size</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
