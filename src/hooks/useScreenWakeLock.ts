import { useEffect, useRef } from 'react';

async function requestWakeLock(wakeLockRef: React.RefObject<WakeLockSentinel | null>) {
    if (!('wakeLock' in navigator)) {
        console.warn('Screen Wake Lock API not supported.');
        return;
    }

    try {
        const sentinel = await navigator.wakeLock.request('screen');
        wakeLockRef.current = sentinel;
        sentinel.addEventListener('release', () => {
            // Ensure we only nullify if it's the current lock
            if (wakeLockRef.current === sentinel) {
                wakeLockRef.current = null;
            }
        });
    } catch (err) {
        console.error(`Screen Wake Lock request failed: ${err}.`);
        wakeLockRef.current = null;
    }
};


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
};


/**
 * Custom React hook to manage the Screen Wake Lock API.
 * @param {boolean} enabled - Whether to enable the wake lock.
 */
export const useScreenWakeLock = (enabled: boolean) => {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        if (!enabled) {
            releaseWakeLock(wakeLockRef);
            return;
        }

        requestWakeLock(wakeLockRef);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && enabled) {
                requestWakeLock(wakeLockRef);
            }
        };

        // If page is not visible, release the lock automatically.
        // Therefore, we need to request the lock again when the page becomes visible.
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Release the lock when the component unmounts or `enabled` becomes false
            releaseWakeLock(wakeLockRef);
        };
    }, [enabled]);
};
