import { useState, useEffect } from 'react';
import { AppSettings, SavedState, TimerState } from '../types/timer';

const savedStatesInLocalStorage = (): SavedState[] => {
  const savedTimersJson = localStorage.getItem('durerTimerSavedStates');
  if (savedTimersJson) {
    try {
      const parsed = JSON.parse(savedTimersJson);
      return Array.isArray(parsed) ? parsed : [];
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
    const updatedStates = savedStates.map(state => {
      if (state.id === currentID) {
        return { ...state, timerState: newTimerState, appSettings: newAppSettings };
      }
      return state;
    }
    );
    setSavedStates(updatedStates);
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
    const updatedStates = savedStates.filter(state => state.id !== id);
    setSavedStates(updatedStates);
    localStorage.setItem('durerTimerSavedStates', JSON.stringify(updatedStates));
  };

  return {
    savedStates,
    updateSavedState,
    deleteSavedState,
    addSavedState,
    setCurrentID,
  };
};
