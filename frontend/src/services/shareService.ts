import { SavedState } from '../types/timer';
import { timerService } from './timerService';

interface ShareResult {
  shareLink: string;
  success: boolean;
  error?: string;
}

export const shareService = {
  /**
   * Generates a default share link using a UUID
   */
  async createDefaultShareLink(timerState: SavedState): Promise<ShareResult> {
    try {
      // Generate default link immediately
      const defaultId = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const shareLink = `${baseUrl}?timer=${defaultId}`;
      
      // Save the timer state with the default ID
      const sharedState = {
        ...timerState,
        id: defaultId
      };
      await timerService.saveTimerState(sharedState);
      
      return {
        shareLink,
        success: true
      };
    } catch (error) {
      console.error('Error creating default shared link:', error);
      return {
        shareLink: '',
        success: false,
        error: 'Failed to create share link'
      };
    }
  },
  
  /**
   * Creates a custom share link with user-provided ID
   */
  async createCustomShareLink(timerState: SavedState, customId: string): Promise<ShareResult> {
    if (!customId.trim()) {
      return {
        shareLink: '',
        success: false,
        error: 'Custom ID cannot be empty'
      };
    }
    
    try {
      const sharedState = {
        ...timerState,
        id: customId.trim()
      };
      await timerService.saveTimerState(sharedState);
      
      const baseUrl = window.location.origin;
      const shareLink = `${baseUrl}?timer=${customId.trim()}`;
      
      return {
        shareLink,
        success: true
      };
    } catch (error) {
      console.error('Error creating custom shared link:', error);
      return {
        shareLink: '',
        success: false,
        error: 'Failed to create custom share link'
      };
    }
  },
  
  /**
   * Copy link to clipboard
   */
  async copyLinkToClipboard(link: string): Promise<{success: boolean, message: string}> {
    try {
      await navigator.clipboard.writeText(link);
      return {
        success: true,
        message: 'Link copied to clipboard!'
      };
    } catch (err) {
      console.error('Failed to copy link:', err);
      return {
        success: false,
        message: 'Failed to copy link'
      };
    }
  }
};
