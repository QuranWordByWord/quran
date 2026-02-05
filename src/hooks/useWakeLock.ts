/**
 * useWakeLock - Prevents screen from sleeping while reading
 *
 * Uses the Screen Wake Lock API to keep the screen on during reading sessions.
 * Automatically handles visibility changes (re-acquires lock when app returns to foreground).
 * Only activates on mobile/touch devices to preserve battery on desktop.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface WakeLockState {
  /** Whether wake lock is currently active */
  isActive: boolean;
  /** Whether the device supports wake lock */
  isSupported: boolean;
  /** Any error that occurred */
  error: Error | null;
}

interface UseWakeLockOptions {
  /** Whether to enable the wake lock (default: true) */
  enabled?: boolean;
}

export function useWakeLock(options: UseWakeLockOptions = {}): WakeLockState {
  const { enabled = true } = options;

  const [state, setState] = useState<WakeLockState>({
    isActive: false,
    isSupported: typeof navigator !== 'undefined' && 'wakeLock' in navigator,
    error: null,
  });

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Check if device is mobile/touch (wake lock is mainly useful on mobile)
  const isMobileDevice = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // Check for touch capability and mobile viewport
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileViewport = window.innerWidth <= 1024;

    return hasTouchScreen && isMobileViewport;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!state.isSupported || !enabled || !isMobileDevice()) {
      return;
    }

    try {
      // Release existing lock first if any
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }

      // Request new wake lock
      const wakeLock = await navigator.wakeLock.request('screen');
      wakeLockRef.current = wakeLock;

      setState(prev => ({ ...prev, isActive: true, error: null }));

      // Handle wake lock release (e.g., when tab loses visibility)
      wakeLock.addEventListener('release', () => {
        setState(prev => ({ ...prev, isActive: false }));
      });
    } catch (err) {
      // Wake lock request can fail if:
      // - Document is not visible
      // - Device is low on battery
      // - User denied permission
      const error = err instanceof Error ? err : new Error('Failed to acquire wake lock');
      setState(prev => ({ ...prev, isActive: false, error }));
    }
  }, [state.isSupported, enabled, isMobileDevice]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setState(prev => ({ ...prev, isActive: false }));
      } catch {
        // Ignore release errors
      }
    }
  }, []);

  // Request wake lock when component mounts and conditions are met
  useEffect(() => {
    if (enabled && state.isSupported && isMobileDevice()) {
      requestWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [enabled, state.isSupported, isMobileDevice, requestWakeLock, releaseWakeLock]);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    if (!enabled || !state.isSupported) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMobileDevice()) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, state.isSupported, isMobileDevice, requestWakeLock]);

  // Handle window resize (in case viewport changes from desktop to mobile)
  useEffect(() => {
    if (!enabled || !state.isSupported) return;

    const handleResize = () => {
      if (isMobileDevice() && !wakeLockRef.current) {
        requestWakeLock();
      } else if (!isMobileDevice() && wakeLockRef.current) {
        releaseWakeLock();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, state.isSupported, isMobileDevice, requestWakeLock, releaseWakeLock]);

  return state;
}
