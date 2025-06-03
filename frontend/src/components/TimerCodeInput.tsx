import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { timerService } from '../services/timerService';
import { SavedState } from '../types/timer';

interface TimerCodeInputProps {
  onLoadState: (state: SavedState) => void;
}

export const TimerCodeInput: React.FC<TimerCodeInputProps> = ({ onLoadState }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadState = async () => {
    if (!code.trim()) {
      setError('Please enter a timer code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const state = await timerService.getTimerState(code.trim());
      
      if (state) {
        onLoadState(state);
        setCode('');
      } else {
        setError('Invalid timer code or timer not found');
        console.error('Invalid timer code or timer not found');
      }
    } catch (err) {
      setError('Error loading timer');
      console.error('Error loading timer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Load a shared timer:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter timer code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={loading}
        />
        <Button 
          variant="contained" 
          onClick={handleLoadState}
          disabled={loading || !code.trim()}
        >
          Load
        </Button>
      </Box>
    </Box>
  );
};
