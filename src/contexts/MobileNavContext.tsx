import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface MobileNavContextType {
  isNavVisible: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
  registerScrollContainer: (element: HTMLElement | null) => void;
}

const MobileNavContext = createContext<MobileNavContextType>({
  isNavVisible: true,
  toggle: () => {},
  show: () => {},
  hide: () => {},
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
  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  // Use ref to store scroll handler to avoid stale closures
  const scrollHandlerRef = useRef<(() => void) | null>(null);

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

  // Define handleScroll before registerScrollContainer
  const handleScroll = useCallback(() => {
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
    <MobileNavContext.Provider value={{ isNavVisible, toggle, show, hide, registerScrollContainer }}>
      {children}
    </MobileNavContext.Provider>
  );
}
