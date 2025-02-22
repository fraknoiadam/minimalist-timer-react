import { useState, useRef, useEffect } from 'react';
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
  const [time, setTime] = useState<TimerState>(secondsToTimerState(initialTotalMs));
  const [paused, setPaused] = useState(true);
  const [totalMs, setTotalMs] = useState(initialTotalMs);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pauseStart, setPauseStart] = useState<Date>(new Date());
  const [totalPauseMs, setTotalPauseMs] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const calculateRemainingMs = (): number => {
    if (startTime === null) {
      return totalMs;
    }
    if (paused) {
      return totalMs - (pauseStart.getTime() - startTime.getTime() - totalPauseMs)
    }
    const currentTime = new Date;
    const elapsedTime = (currentTime.getTime() - startTime.getTime() - totalPauseMs);
    return totalMs - elapsedTime;
  };

  const addSecondsToTimer = (seconds: number) => {
    setTotalMs(prevTotalMs => prevTotalMs + seconds * 1000);
  }

  useEffect(() => {
    const updateTime = () => {
      setTime(secondsToTimerState(calculateRemainingMs()));
    };

    // Update immediately
    updateTime();

    // If not paused, set up interval
    if (!paused) {
      intervalRef.current = window.setInterval(updateTime, 20);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paused, totalMs, startTime, totalPauseMs, pauseStart]);

  const toggleTimer = () => {
    const now = new Date;
    if (startTime === null) {
      setStartTime(new Date);
    } else if (paused) {
      setTotalPauseMs(
        prevTotalPauseMs => prevTotalPauseMs + now.getTime() - pauseStart.getTime()
      );
    }

    setPaused(prevPaused => {
      if (prevPaused === false) { // Resuming
        setPauseStart(now);
      }
      return !prevPaused;
    });
  };

  return { time, paused, addSecondsToTimer, toggleTimer };
};
