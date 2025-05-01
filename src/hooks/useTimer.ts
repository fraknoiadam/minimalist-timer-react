import { useState, useEffect, useRef, useReducer } from 'react';
import { TimeRemaining, TimerState } from '../types/timer';

// This is for the visual display of time
const secondsToTimerState = (totalMs: number): TimeRemaining => {
  if (totalMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSec = Math.ceil(totalMs / 1000);
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60
  };
};

export const useTimer = (initialTotalMs: number) => {
  const intervalRef = useRef<number | null>(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [timerState, setTimerState] = useState<TimerState>(() => ({
    totalMs: initialTotalMs,
    paused: true,
    startTime: null,
    pauseStart: Date.now(),
    totalPauseMs: 0
  }));

  useEffect(() => {
    localStorage.setItem('durerTimer', JSON.stringify(timerState));
  }, [timerState]);

  const calculateRemainingMs = (): number => {
    if (timerState.startTime === null) {
      return timerState.totalMs;
    }
    if (timerState.paused) {
      return timerState.totalMs - (timerState.pauseStart - timerState.startTime - timerState.totalPauseMs);
    }
    const currentTime = Date.now();
    const elapsedTime = (currentTime - timerState.startTime - timerState.totalPauseMs);
    return timerState.totalMs - elapsedTime;
  };

  const addSecondsToTimer = (seconds: number) => {
    setTimerState(prevState => ({
      ...prevState,
      totalMs: prevState.totalMs + seconds * 1000
    }));
  }

  useEffect(() => {    
    if (!timerState.paused) {
      intervalRef.current = window.setInterval(forceUpdate, 20);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.paused, timerState.totalMs, timerState.startTime, timerState.totalPauseMs, timerState.pauseStart]);

  const toggleTimer = () => {
    const now = Date.now();
    if (timerState.startTime === null) {
      setTimerState(prevState => ({
        ...prevState,
        startTime: now
      }));
    } else if (timerState.paused) {
      setTimerState(prevState => ({
        ...prevState,
        totalPauseMs: prevState.totalPauseMs + now - prevState.pauseStart
      }));
    }

    setTimerState(prevState => ({
      ...prevState,
      paused: !prevState.paused,
      pauseStart: prevState.paused ? prevState.pauseStart : now
    }));
  };

  return {
    time: secondsToTimerState(calculateRemainingMs()),
    paused: timerState.paused,
    addSecondsToTimer,
    toggleTimer
  };
};
