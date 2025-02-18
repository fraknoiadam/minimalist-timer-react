import { useState, useRef, useEffect } from 'react';
import { TimerState } from '../types/timer';

export const useTimer = (initialTime: TimerState) => {
  const [time, setTime] = useState<TimerState>(initialTime);
  const [isPaused, setIsPaused] = useState(true);

  // Convert initial time to total seconds
  const initialSeconds = useRef(
    initialTime.hours * 3600 + initialTime.minutes * 60 + initialTime.seconds
  );
  
  const startTimeRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const totalPauseTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const formatTimeState = (totalSeconds: number): TimerState => ({
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  });

  const addSecondsToTimer = (seconds: number) => {
    initialSeconds.current = Math.max(0, initialSeconds.current + seconds);
    if (isPaused) {
      setTime(formatTimeState(initialSeconds.current));
    }
  };

  useEffect(() => {
    if (!isPaused) {
      const now = Date.now();
      if (!startTimeRef.current) {
        startTimeRef.current = now;
      }

      const tick = () => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor(
          (currentTime - startTimeRef.current! - totalPauseTimeRef.current) / 1000
        );
        const remainingSeconds = Math.max(0, initialSeconds.current - elapsedTime);
        
        setTime(formatTimeState(remainingSeconds));

        if (remainingSeconds > 0) {
          timerRef.current = requestAnimationFrame(tick);
        }
      };

      timerRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [isPaused]);

  const handleTimerToggle = () => {
    const now = Date.now();
    
    setIsPaused(prev => {
      if (prev) { // Resuming
        if (pauseStartRef.current) {
          totalPauseTimeRef.current += now - pauseStartRef.current;
        }
        pauseStartRef.current = null;
      } else { // Pausing
        pauseStartRef.current = now;
      }
      return !prev;
    });
  };

  return { time, isPaused, addSecondsToTimer, handleTimerToggle };
};
