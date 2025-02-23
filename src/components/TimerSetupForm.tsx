import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Box, Button, TextField } from '@mui/material';

interface TimerSetupFormProps {
  onStart: (links: string[], animationPauseTime: number) => void;
}

export const TimerSetupForm = ({ onStart }: TimerSetupFormProps) => {
  const [links, setLinks] = useState(['']);
  const [animationPauseTime, setAnimationPauseTime] = useState(15);

  const addLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  const handleStart = () => {
    onStart(links, animationPauseTime);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent
        className="p-6"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <h3 className="text-xl font-bold mb-4">How to use?</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Please use fullscreen mode (F11)</li>
          <li>Make spreadsheets fullscreen: View menu (top left) - Fullscreen</li>
          <li>After starting the timer, move cursor to the edge of the screen</li>
        </ul>

        <div className="space-y-4">
          {links.map((link, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2 }}>
              <TextField
              fullWidth
              size="small"
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
              placeholder="Spreadsheet URL"
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
              label="Animation pause time (seconds)"
              value={animationPauseTime}
              onChange={(e) => setAnimationPauseTime(Math.max(1, Number(e.target.value)))}
              />
            </Box>

          )}

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
