import { useState, useEffect } from 'react';
import { AppSettings, SavedState, TimerState } from '../types/timer';
import { calculateRemainingMs } from './useTimer';
import { timerService } from '../services/timerService';

export const pruneExpiredSavedStates = (states: SavedState[]): SavedState[] => {
  if (!Array.isArray(states)) {
    return [];
  }
  const tenMinutesInMs = 10 * 60 * 1000;
  return states.filter(state => state.timerState && calculateRemainingMs(state.timerState) >= -tenMinutesInMs);
};

const savedStatesInLocalStorage = (): SavedState[] => {
  const savedTimersJson = localStorage.getItem('durerTimerSavedStates');
  if (savedTimersJson) {
    try {
      const parsed = JSON.parse(savedTimersJson);
      const prunedStates = pruneExpiredSavedStates(parsed);
      
      // If the number of states to keep is less than the original number of states, update localStorage.
      if (prunedStates.length < parsed.length) {
        localStorage.setItem('durerTimerSavedStates', JSON.stringify(prunedStates));
      }
      return prunedStates;
    } catch (e) {
      console.error('Failed to parse saved timer states:', e);
      return [];
    }
  }
  return [];
};

export const useSavedTimerStates = () => {
  const [savedStates, setSavedStates] = useState<SavedState[]>(savedStatesInLocalStorage);
  const [currentID, setCurrentID] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('durerTimerSavedStates', JSON.stringify(savedStates));
  }, [savedStates]);

  const updateSavedState = async (newTimerState: TimerState, newAppSettings: AppSettings) => {
    if (!currentID) {
      return;
    }
    
    // Update local state
    setSavedStates(prevSavedStates =>
      prevSavedStates.map(state =>
        state.id === currentID
          ? { ...state, timerState: newTimerState, appSettings: newAppSettings }
          : state
      )
    );
    
    // If we have a current ID, also update on the backend
    try {
      const stateToUpdate = savedStates.find(state => state.id === currentID);
      if (stateToUpdate) {
        const updatedState = {
          ...stateToUpdate,
          timerState: newTimerState,
          appSettings: newAppSettings
        };
        
        // Try to save to backend
        await timerService.saveTimerState(updatedState);
      }
    } catch (error) {
      console.error('Failed to update timer state on server:', error);
    }
  };

  const addSavedState = async (newTimerState: TimerState, newAppSettings: AppSettings, name: string = "") => {
    const newSavedState: SavedState = {
      id: crypto.randomUUID(),
      name: name,
      savedAt: Date.now(),
      timerState: newTimerState,
      appSettings: newAppSettings,
    };
    
    // Add to local state
    setSavedStates(prev => [...prev, newSavedState]);
    setCurrentID(newSavedState.id);
    
    // Also save to backend
    try {
      await timerService.saveTimerState(newSavedState);
    } catch (error) {
      console.error('Failed to save timer state to server:', error);
    }
  }

  const deleteSavedState = (id: string) => {
    if (currentID !== null) {
      console.error("Cannot delete saved state when there is an active ID.");
    }
    setSavedStates(prevSavedStates => prevSavedStates.filter(state => state.id !== id));
  };

  return {
    savedStates,
    updateSavedState,
    deleteSavedState,
    addSavedState,
    setCurrentID,
    currentID
  };
};
