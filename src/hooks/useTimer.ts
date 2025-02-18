import { useState, useRef, useEffect } from 'react';
import { TimerState } from '../types/timer';

export const useTimer = (initialTime: TimerState) => {
  const [time, setTime] = useState<TimerState>(initialTime);
  const [isPaused, setIsPaused] = useState(true);
  
  const startTimeRef = useRef<Date | null>(null);
  const pauseTimeRef = useRef<number>(0);
  const pauseMomentRef = useRef<Date | null>(null);
  const timerRef = useRef<number | null>(null);

  const addSecondsToTimer = (seconds: number) => {
    const totalCurrentSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;
    const newTotalSeconds = Math.max(0, totalCurrentSeconds + seconds);

    setTime({
      hours: Math.floor(newTotalSeconds / 3600),
      minutes: Math.floor((newTotalSeconds % 3600) / 60),
      seconds: newTotalSeconds % 60
    });
  };

  useEffect(() => {
    if (!isPaused) {
      const clockTick = () => {
        const curTime = new Date();
        const elapsed = startTimeRef.current ? curTime.getTime() - startTimeRef.current.getTime() : 0;
        let mils = -elapsed + pauseTimeRef.current + 5400 * 1000;
        mils = Math.max(mils, 0);

        const totalSeconds = Math.floor(mils / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTime({ hours, minutes, seconds });

        if (totalSeconds > 0) {
          timerRef.current = requestAnimationFrame(clockTick);
        }
      };

      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }
      timerRef.current = requestAnimationFrame(clockTick);
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [isPaused]);

  const handleTimerToggle = () => {
    setIsPaused(prev => {
      if (prev) {
        pauseTimeRef.current += pauseMomentRef.current 
          ? (new Date().getTime() - pauseMomentRef.current.getTime())
          : 0;
        startTimeRef.current = new Date();
      } else {
        pauseMomentRef.current = new Date();
      }
      return !prev;
    });
  };

  return { time, isPaused, addSecondsToTimer, handleTimerToggle };
};
