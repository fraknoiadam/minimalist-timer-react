import React, { useState, useEffect } from 'react';
import { Card, Button, Box, Typography, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SavedState } from '../types/timer';
import { formatDistance } from 'date-fns';
import { calculateRemainingTime } from '../hooks/useTimer';

interface SavedTimerStatesProps {
  savedStates: SavedState[];
  onLoadState: (id: string) => void;
  onDeleteState: (id: string) => void;
}

export const SavedTimerStates: React.FC<SavedTimerStatesProps> = ({
  savedStates,
  onLoadState,
  onDeleteState
}) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate current remaining time for a saved state
  const getCurrentRemainingTime = (state: SavedState) => {
    return calculateRemainingTime(state.timerState).hours + 'h ' +
            calculateRemainingTime(state.timerState).minutes + 'm ' +
            calculateRemainingTime(state.timerState).seconds + 's';
  };

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      {savedStates.length !== 0 && (<>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h5">Recently used</Typography>
        </Box>
        <Grid container spacing={2}>
          {savedStates.map((state) => (
            <Grid size={{ md: 1.5 }} key={state.id}>
              <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' } }>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  Remaining: {getCurrentRemainingTime(state)}
                </Typography>
                {state.appSettings.embedSettings?.links && state.appSettings.embedSettings.links.length > 0 && (
                  <Tooltip
                    title={
                      <Box>
                        {state.appSettings.embedSettings.links.map((link, index) => (
                          <Typography key={index} variant="caption" display="block">
                            {link}
                          </Typography>
                        ))}
                      </Box>
                    }
                    arrow
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, cursor: 'pointer' }}>
                      Links: {state.appSettings.embedSettings.links.length}
                    </Typography>
                  </Tooltip>
                )}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2 }}
                  title={new Date(state.savedAt).toLocaleString()}
                >
                  Created {formatDistance(state.savedAt, currentTime, { addSuffix: true })}
                </Typography>

                <Box sx={{ flexGrow: 1 }} /> {/* This flex spacer pushes buttons to bottom */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => onLoadState(state.id)}
                  >
                    Load
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => onDeleteState(state.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>)}
    </Box>
  );
};
