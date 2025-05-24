import { useState, useEffect } from 'react';
import { AppSettings, SavedState, TimerState } from '../types/timer';
import { calculateRemainingMs } from './useTimer';

const savedStatesInLocalStorage = (): SavedState[] => {
  const savedTimersJson = localStorage.getItem('durerTimerSavedStates');
  if (savedTimersJson) {
    try {
      const parsed = JSON.parse(savedTimersJson);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const tenMinutesInMs = 10 * 60 * 1000;
      const statesToKeep = parsed.filter(state => state.timerState && calculateRemainingMs(state.timerState) >= -tenMinutesInMs);

      // If the number of states to keep is less than the original number of states, update localStorage.
      if (statesToKeep.length < parsed.length) {
        localStorage.setItem('durerTimerSavedStates', JSON.stringify(statesToKeep));
      }
      return statesToKeep;
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

  const updateSavedState = (newTimerState: TimerState, newAppSettings: AppSettings) => {
    if (!currentID) {
      return;
    }
    setSavedStates(prevSavedStates =>
      prevSavedStates.map(state =>
        state.id === currentID
          ? { ...state, timerState: newTimerState, appSettings: newAppSettings }
          : state
      )
    );
  };

  const addSavedState = (newTimerState: TimerState, newAppSettings: AppSettings, name: string = "") => {
    const newSavedState: SavedState = {
      id: crypto.randomUUID(),
      name: name,
      savedAt: Date.now(),
      timerState: newTimerState,
      appSettings: newAppSettings,
    };
    setSavedStates(prev => [...prev, newSavedState]);
    setCurrentID(newSavedState.id);
  }

  const deleteSavedState = (id: string) => {
    if (currentID !== null) {
      throw new Error("Cannot delete saved state when there is an active ID.");
    }
    setSavedStates(prevSavedStates => prevSavedStates.filter(state => state.id !== id));
  };

  return {
    savedStates,
    updateSavedState,
    deleteSavedState,
    addSavedState,
    setCurrentID,
  };
};
