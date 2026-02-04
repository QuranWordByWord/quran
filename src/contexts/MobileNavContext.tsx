import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface MobileNavContextType {
  isNavVisible: boolean;
  headerHeight: number; // 0 when hidden, 56 when visible
  isMushafMode: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
  showTemporarily: () => void; // Show header for 3s then auto-hide (for Mushaf tap)
  setMushafMode: (enabled: boolean) => void;
  registerScrollContainer: (element: HTMLElement | null) => void;
}

const MobileNavContext = createContext<MobileNavContextType>({
  isNavVisible: true,
  headerHeight: 56,
  isMushafMode: false,
  toggle: () => {},
  show: () => {},
  hide: () => {},
  showTemporarily: () => {},
  setMushafMode: () => {},
  registerScrollContainer: () => {},
});

export const useMobileNav = () => useContext(MobileNavContext);

interface MobileNavProviderProps {
  children: ReactNode;
  hideDelay?: number;
  scrollThreshold?: number;
}

export function MobileNavProvider({
  children,
  hideDelay = 3000,
  scrollThreshold = 50,
}: MobileNavProviderProps) {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMushafMode, setIsMushafModeState] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  // Use ref to store scroll handler to avoid stale closures
  const scrollHandlerRef = useRef<(() => void) | null>(null);

  // Header height: 0 when hidden, 56 when visible
  const headerHeight = isNavVisible ? 56 : 0;

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsNavVisible(false);
    }, hideDelay);
  }, [clearHideTimeout, hideDelay]);

  const show = useCallback(() => {
    setIsNavVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const hide = useCallback(() => {
    clearHideTimeout();
    setIsNavVisible(false);
  }, [clearHideTimeout]);

  const toggle = useCallback(() => {
    setIsNavVisible(prev => {
      const newValue = !prev;
      if (newValue) {
        scheduleHide();
      } else {
        clearHideTimeout();
      }
      return newValue;
    });
  }, [scheduleHide, clearHideTimeout]);

  // Show header temporarily (for Mushaf tap) - shows for 3s then auto-hides
  const showTemporarily = useCallback(() => {
    setIsNavVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  // Set Mushaf mode - hides header immediately and disables scroll-based show/hide
  const setMushafMode = useCallback((enabled: boolean) => {
    setIsMushafModeState(enabled);
    if (enabled) {
      // In Mushaf mode, start with header hidden
      clearHideTimeout();
      setIsNavVisible(false);
    } else {
      // Exiting Mushaf mode, show header
      setIsNavVisible(true);
    }
  }, [clearHideTimeout]);

  // Define handleScroll before registerScrollContainer
  // Use ref to track Mushaf mode in scroll handler without stale closure
  const isMushafModeRef = useRef(isMushafMode);
  useEffect(() => {
    isMushafModeRef.current = isMushafMode;
  }, [isMushafMode]);

  const handleScroll = useCallback(() => {
    // Skip scroll-based show/hide in Mushaf mode (use tap instead)
    if (isMushafModeRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const currentScrollY = container.scrollTop;
    const scrollDiff = currentScrollY - lastScrollY.current;

    // Only trigger if scroll exceeds threshold
    if (Math.abs(scrollDiff) > scrollThreshold) {
      if (scrollDiff > 0 && currentScrollY > 100) {
        // Scrolling down (and not at top) - hide
        clearHideTimeout();
        setIsNavVisible(false);
      } else if (scrollDiff < 0) {
        // Scrolling up - show
        setIsNavVisible(true);
        scheduleHide();
      }
      lastScrollY.current = currentScrollY;
    }
  }, [scrollThreshold, clearHideTimeout, scheduleHide]);

  // Keep scroll handler ref updated
  useEffect(() => {
    scrollHandlerRef.current = handleScroll;
  }, [handleScroll]);

  const registerScrollContainer = useCallback((element: HTMLElement | null) => {
    const currentContainer = scrollContainerRef.current;

    // Remove listener from old container
    if (currentContainer && scrollHandlerRef.current) {
      currentContainer.removeEventListener('scroll', scrollHandlerRef.current);
    }

    scrollContainerRef.current = element;

    if (element && scrollHandlerRef.current) {
      lastScrollY.current = element.scrollTop;
      element.addEventListener('scroll', scrollHandlerRef.current, { passive: true });
      // Start with nav visible, schedule auto-hide
      setIsNavVisible(true);
      scheduleHide();
    }
  }, [scheduleHide]);

  // Update scroll listener when handleScroll changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Remove old listener and add new one with updated handler
      const oldHandler = scrollHandlerRef.current;
      if (oldHandler) {
        container.removeEventListener('scroll', oldHandler);
      }
      container.addEventListener('scroll', handleScroll, { passive: true });
      scrollHandlerRef.current = handleScroll;
    }
    return () => {
      if (container && scrollHandlerRef.current) {
        container.removeEventListener('scroll', scrollHandlerRef.current);
      }
    };
  }, [handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHideTimeout();
      // Cleanup scroll listener on unmount
      const container = scrollContainerRef.current;
      if (container && scrollHandlerRef.current) {
        container.removeEventListener('scroll', scrollHandlerRef.current);
      }
    };
  }, [clearHideTimeout]);

  return (
    <MobileNavContext.Provider value={{
      isNavVisible,
      headerHeight,
      isMushafMode,
      toggle,
      show,
      hide,
      showTemporarily,
      setMushafMode,
      registerScrollContainer,
    }}>
      {children}
    </MobileNavContext.Provider>
  );
}
