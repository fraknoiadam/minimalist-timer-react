import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Paper, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@mui/material';
import { SavedState } from '../types/timer';
import { formatDistance } from 'date-fns';
import { calculateRemainingTime } from '../hooks/useTimer';
import DeleteIcon from '@mui/icons-material/Delete';
import { SettingsBackupRestore, Share } from '@mui/icons-material';
import { timerService } from '../services/timerService';

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingState, setSharingState] = useState<SavedState | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentRemainingTime = (state: SavedState) => {
    const { hours, minutes, seconds } = calculateRemainingTime(state.timerState);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleShareClick = (state: SavedState) => {
    setSharingState(state);
    setShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    setSharedId(null);
  };

  const handleShareTimer = async () => {
    if (!sharingState) return;
    
    setIsSharing(true);
    try {
      const id = await timerService.shareTimerState(sharingState);
      if (id) {
        setSharedId(id);
        setSnackbarMessage('Timer shared successfully!');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to share timer.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error sharing timer:', error);
      setSnackbarMessage('Error sharing timer.');
      setSnackbarSeverity('error');
    } finally {
      setIsSharing(false);
      setSnackbarOpen(true);
    }
  };

  const handleCopyShareLink = () => {
    if (!sharedId) return;
    
    navigator.clipboard.writeText(sharedId).then(() => {
      setSnackbarMessage('Timer ID copied to clipboard!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setSnackbarMessage('Failed to copy to clipboard');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  };

  return (
    <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}> 
      {savedStates.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1.5, textAlign: 'center', fontSize: '1.1rem' }}>
            Recently Used Timers
          </Typography>
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {savedStates.map((state) => (
              <Paper elevation={0} sx={{ mb: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }} key={state.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <>
                      <Tooltip title="Share Timer">
                        <IconButton size="small" edge="end" aria-label="share" onClick={() => handleShareClick(state)} color="primary" sx={{ mr: 0.5 }}>
                          <Share fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Restore Timer">
                        <IconButton size="small" edge="end" aria-label="load" onClick={() => onLoadState(state.id)} color="primary" sx={{ mr: 0.5 }}>
                          <SettingsBackupRestore fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Timer">
                        <IconButton size="small" edge="end" aria-label="delete" onClick={() => onDeleteState(state.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemText
                    sx={{ pl: 1.5, pr: 8 }}
                    primary={
                      <Typography variant="subtitle2" component="div">
                        {`Time: ${getCurrentRemainingTime(state)}`}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          title={new Date(state.savedAt).toLocaleString()}
                        >
                          {formatDistance(state.savedAt, currentTime, { addSuffix: true })}
                        </Typography>
                        {state.appSettings.embedSettings?.links && state.appSettings.embedSettings.links.length > 0 && (
                          <Tooltip
                            title={
                              <Box>
                                {state.appSettings.embedSettings.links.map((link, index) => (
                                  <Typography key={index} variant="caption" display="block">
                                    {link || 'Empty link'}
                                  </Typography>
                                ))}
                              </Box>
                            }
                            arrow
                          >
                            <Typography component="span" variant="caption" display="block" sx={{ cursor: 'pointer', mt: 0.25, color: 'primary.main' }}>
                              {`Links: ${state.appSettings.embedSettings.links.length}`}
                            </Typography>
                          </Tooltip>
                        )}
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        </>
      )}
      {savedStates.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p:2, minHeight: 150 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            No Saved Timers
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            Setup a new timer and it will appear here.
          </Typography>
        </Box>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Share Timer</DialogTitle>
        <DialogContent>
          {!sharedId ? (
            <DialogContentText>
              Share this timer with others. They can load it using the timer code.
            </DialogContentText>
          ) : (
            <>
              <DialogContentText>
                Your timer has been shared! Copy the timer code below:
              </DialogContentText>
              <TextField
                fullWidth
                margin="dense"
                value={sharedId}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {sharedId ? (
            <>
              <Button onClick={handleCopyShareLink} color="primary">
                Copy Code
              </Button>
              <Button onClick={handleCloseShareDialog} color="primary">
                Close
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCloseShareDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleShareTimer} 
                color="primary" 
                disabled={isSharing}
              >
                {isSharing ? 'Sharing...' : 'Share'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
