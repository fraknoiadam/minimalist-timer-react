import { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { AppSettings } from '../types/timer';

async function requestWakeLock(
  wakeLockRef: React.RefObject<WakeLockSentinel | null>,
  setSettings?: Dispatch<SetStateAction<AppSettings>>
) {
  if (!('wakeLock' in navigator)) {
    console.warn('Screen Wake Lock API not supported.');
    return;
  }

  try {
    const sentinel = await navigator.wakeLock.request('screen');
    wakeLockRef.current = sentinel;
    sentinel.addEventListener('release', () => {
      if (wakeLockRef.current === sentinel) {
        wakeLockRef.current = null;
      }
    });
  } catch (err) {
    console.error(`Screen Wake Lock request failed: ${err}.`);
    wakeLockRef.current = null;
    if (setSettings) setSettings(prev => ({ ...prev, wakeLockEnabled: false }));
  }
}

async function releaseWakeLock(wakeLockRef: React.RefObject<WakeLockSentinel | null>) {
  if (wakeLockRef.current) {
    try {
      await wakeLockRef.current.release();
    } catch (err) {
      console.error(`Screen Wake Lock release failed: ${err}`);
    } finally {
      wakeLockRef.current = null;
    }
  }
}

/**
 * Custom React hook to manage the Screen Wake Lock API.
 * @param enabled - Whether to enable the wake lock.
 * @param setSettings - Optional setSettings function to update AppSettings on error.
 */
export const useScreenWakeLock = (
  enabled: boolean,
  setSettings?: Dispatch<SetStateAction<AppSettings>>
) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) {
      releaseWakeLock(wakeLockRef);
      return;
    }

    requestWakeLock(wakeLockRef, setSettings);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock(wakeLockRef, setSettings);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock(wakeLockRef);
    };
  }, [enabled, setSettings]);
};
