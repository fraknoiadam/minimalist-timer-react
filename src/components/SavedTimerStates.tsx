import React, { useState, useEffect } from 'react';
import { Card, Button, Box, Typography, Grid2 } from '@mui/material';
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
        <Grid2 container spacing={2}>
          {savedStates.map((state) => (
            <Grid2 item xs={12} sm={6} md={4} key={state.id}>
              <Card sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  Remaining: {getCurrentRemainingTime(state)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2 }}
                  title={new Date(state.savedAt).toLocaleString()}
                >
                  Created {formatDistance(state.savedAt, currentTime, { addSuffix: true })}
                </Typography>
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
            </Grid2>
          ))}
        </Grid2>
      </>)}
    </Box>
  );
};
