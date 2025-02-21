import { useState, useRef, useEffect } from 'react';
import { TimerState } from '../types/timer';

const secondsToTimerState = (totalSeconds: number): TimerState => {
  if (totalSeconds <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
};


export const useTimer = (initialSeconds: number) => {
  const [time, setTime] = useState<TimerState>(secondsToTimerState(initialSeconds));
  const [paused, setPaused] = useState(true);

  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pauseStart, setPauseStart] = useState<Date>(new Date());
  const [totalPauseMs, setTotalPauseMs] = useState(0);
  const intervalRef = useRef<number | null>(null);  // Changed from timerRef


  const calculateRemainingSeconds = (): number => {
    if (startTime === null) {
      return totalSeconds;
    }
    if (paused) {
      console.log(
        totalSeconds - (pauseStart.getTime() - startTime.getTime() - totalPauseMs) / 1000
      );
      return Math.ceil(
        totalSeconds - (pauseStart.getTime() - startTime.getTime() - totalPauseMs) / 1000
      );
    }
    const currentTime = new Date;
    const elapsedTime = (currentTime.getTime() - startTime.getTime() - totalPauseMs) / 1000;
    console.log(totalSeconds - elapsedTime);
    return Math.ceil(totalSeconds - elapsedTime);
  };

  const addSecondsToTimer = (seconds: number) => {
    setTotalSeconds(prevTotalSeconds => prevTotalSeconds + seconds);
  }

  useEffect(() => {
    setTime(secondsToTimerState(calculateRemainingSeconds()));
  },
    [totalSeconds, startTime, totalPauseMs, pauseStart]);


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

  useEffect(() => {
    if (!paused) {
      intervalRef.current = window.setInterval(() => {
        setTime(secondsToTimerState(calculateRemainingSeconds()));
      }, 20);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paused]);


  return { time, paused, addSecondsToTimer, toggleTimer };
};
