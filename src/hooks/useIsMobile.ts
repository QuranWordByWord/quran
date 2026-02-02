import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect if we're on mobile, with zoom compensation.
 * Uses devicePixelRatio to prevent layout mode switching during browser zoom.
 *
 * @param layoutMode - 'auto' | 'desktop' | 'mobile'
 *   - 'auto': Uses zoom-compensated viewport width (< 1024px = mobile)
 *   - 'desktop': Always returns false
 *   - 'mobile': Always returns true
 */
export function useIsMobile(layoutMode: 'auto' | 'desktop' | 'mobile' = 'auto') {
  // Capture the base devicePixelRatio on initial load (before any zoom changes)
  const baseDprRef = useRef<number | null>(null);

  const [isMobile, setIsMobile] = useState(() => {
    if (layoutMode === 'desktop') return false;
    if (layoutMode === 'mobile') return true;
    if (typeof window === 'undefined') return false;

    // Initialize baseDpr
    baseDprRef.current = window.devicePixelRatio;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    if (layoutMode === 'desktop') {
      setIsMobile(false);
      return;
    }
    if (layoutMode === 'mobile') {
      setIsMobile(true);
      return;
    }

    // Initialize baseDpr if not set
    if (baseDprRef.current === null) {
      baseDprRef.current = window.devicePixelRatio;
    }

    const checkMobile = () => {
      const baseDpr = baseDprRef.current ?? 1;
      const currentDpr = window.devicePixelRatio;

      // Calculate zoom factor relative to initial page load
      // If user zoomed in, currentDpr > baseDpr
      const zoomFactor = currentDpr / baseDpr;

      // Compensate for zoom: multiply innerWidth by zoom factor
      // to get the "original" width before zoom was applied
      const compensatedWidth = window.innerWidth * zoomFactor;

      setIsMobile(compensatedWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [layoutMode]);

  return isMobile;
}
