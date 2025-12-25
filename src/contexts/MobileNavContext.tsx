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

  const registerScrollContainer = useCallback((element: HTMLElement | null) => {
    // Remove listener from old container
    if (scrollContainerRef.current) {
      scrollContainerRef.current.removeEventListener('scroll', handleScroll);
    }

    scrollContainerRef.current = element;

    if (element) {
      lastScrollY.current = element.scrollTop;
      element.addEventListener('scroll', handleScroll, { passive: true });
      // Start with nav visible, schedule auto-hide
      setIsNavVisible(true);
      scheduleHide();
    }
  }, []);

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

  // Update handleScroll when dependencies change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.removeEventListener('scroll', handleScroll);
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, [clearHideTimeout]);

  return (
    <MobileNavContext.Provider value={{ isNavVisible, toggle, show, hide, registerScrollContainer }}>
      {children}
    </MobileNavContext.Provider>
  );
}
