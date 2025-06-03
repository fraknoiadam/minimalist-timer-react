import axios from 'axios';
import { SavedState } from '../types/timer';

const API_URL = 'http://localhost:8000/api';

export const timerService = {
  async getTimerState(id: string): Promise<SavedState | null> {
    try {
      const response = await axios.get(`${API_URL}/states/${id}`);
      // FastAPI returns the timer state directly in timer_data field
      return response.data.timer_data as SavedState;
    } catch (error) {
      console.error('Error fetching timer state:', error);
      return null;
    }
  },

  async saveTimerState(state: SavedState): Promise<SavedState | null> {
    try {
      const response = await axios.put(`${API_URL}/states/${state.id}`, state);
      // FastAPI returns the timer state directly in timer_data field
      return response.data.timer_data as SavedState;
    } catch (error) {
      console.error('Error saving timer state:', error);
      return null;
    }
  },
  
  async shareTimerState(state: SavedState): Promise<string | null> {
    try {
      // Generate a new random UUID for the shared state
      const sharedId = crypto.randomUUID();
      
      // Create a copy of the state with the new ID
      const sharedState = {
        ...state,
        id: sharedId,
        name: `${state.name} (Shared)`,
      };
      
      // Save the shared state to the server
      const response = await axios.put(`${API_URL}/states/${sharedId}`, sharedState);
      
      // Return the shared ID if successful
      if (response.status === 200) {
        return sharedId;
      }
      return null;
    } catch (error) {
      console.error('Error sharing timer state:', error);
      return null;
    }
  }
};
