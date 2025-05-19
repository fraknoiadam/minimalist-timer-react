import { useEffect, useRef } from 'react';

/**
 * Custom React hook to manage the Screen Wake Lock API.
 * @param enabled Whether to enable the wake lock.
 */
export const useScreenWakeLock = (enabled: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (enabled && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((sentinel) => {
        if (isMounted) {
          wakeLockRef.current = sentinel;
          sentinel.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        }
      }).catch(() => {});
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    return () => {
      isMounted = false;
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);
};
