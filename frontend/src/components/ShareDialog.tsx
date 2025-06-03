import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { shareService } from '../services/shareService';
import { SavedState } from '../types/timer';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  currentTimerState?: SavedState;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose, currentTimerState }) => {
  const [shareLink, setShareLink] = useState('');
  const [customId, setCustomId] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Generate default share link when dialog opens
  const handleDialogOpen = async () => {
    if (!currentTimerState) return;
    
    const result = await shareService.createDefaultShareLink(currentTimerState);
    
    if (result.success) {
      setShareLink(result.shareLink);
    } else {
      setSnackbarMessage(result.error || 'Failed to create share link');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle custom ID share creation
  const handleCustomShare = async () => {
    if (!currentTimerState) return;
    
    const result = await shareService.createCustomShareLink(currentTimerState, customId);
    
    if (result.success) {
      setShareLink(result.shareLink);
      setSnackbarMessage('Custom timer link created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage(result.error || 'Failed to create custom link');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Copy link to clipboard
  const copyLinkToClipboard = async () => {
    const result = await shareService.copyLinkToClipboard(shareLink);
    
    setSnackbarMessage(result.message);
    setSnackbarSeverity(result.success ? 'success' : 'error');
    setSnackbarOpen(true);
  };

  // Generate default share link when dialog opens
  if (open && !shareLink && currentTimerState) {
    handleDialogOpen();
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Share Timer</DialogTitle>
        <DialogContent className="space-y-4">
          <div className="mt-4 mb-6">
            <p className="mb-2">Share this link with others:</p>
            <div className="flex gap-2 items-center">
              <TextField
                fullWidth
                size="small"
                value={shareLink}
                InputProps={{
                  readOnly: true,
                }}
              />
              <IconButton
                onClick={copyLinkToClipboard}
                color="primary"
              >
                <ContentCopyIcon />
              </IconButton>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="mb-2">Or create a custom link:</p>
            <div className="flex gap-2 items-center">
              <TextField
                fullWidth
                size="small"
                placeholder="Enter custom ID"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleCustomShare}
                disabled={!customId.trim()}
              >
                Create
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Note: If this ID already exists, it will be overwritten.
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
