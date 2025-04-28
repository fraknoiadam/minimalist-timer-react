import { useState, useEffect, useRef } from 'react';
import { TimerState } from '../types/timer';

const secondsToTimerState = (totalMs: number): TimerState => {
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
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('durerTimer');
    return saved ? JSON.parse(saved) : {
      totalMs: initialTotalMs,
      paused: true,
      startTime: null,
      pauseStart: Date.now(),
      totalPauseMs: 0
    };
  });

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
    const updateTime = () => {
      setTimerState(prevState => ({
        ...prevState,
        time: secondsToTimerState(calculateRemainingMs())
      }));
    };

    // Update immediately
    updateTime();

    // If not paused, set up interval
    if (!timerState.paused) {
      intervalRef.current = window.setInterval(updateTime, 20);
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
