/**
 * QuranSpread - React component for rendering double-page Quran spreads
 *
 * Displays two pages side-by-side with support for RTL layout,
 * automatic mode switching based on viewport, and navigation.
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { MushafConfig, PageSpreadConfig } from '@digitalkhatt/quran-engine';
import { QuranPage } from './QuranPage';
import type { QuranPageProps } from './QuranPage';

// ============================================
// Types
// ============================================

export type SpreadMode = 'single' | 'double' | 'auto';
export type ReadingDirection = 'rtl' | 'ltr';

export interface QuranSpreadProps
  extends Omit<QuranPageProps, 'pageNumber' | 'width' | 'style'> {
  /** Current page number (1-indexed) */
  pageNumber: number;
  /** Total number of pages in the mushaf */
  totalPages?: number;
  /** Display mode: single page, double spread, or auto based on viewport */
  mode?: SpreadMode;
  /**
   * Reading direction - affects page layout in spread mode
   * - 'rtl': Right-to-left (Arabic/Quran) - right page has lower number, left page has higher number
   * - 'ltr': Left-to-right (Western) - left page has lower number, right page has higher number
   * Default: 'rtl' for Quran
   */
  readingDirection?: ReadingDirection;
  /** Viewport width breakpoint for auto mode (default: 800) */
  autoBreakpoint?: number;
  /** Gap between pages in double mode (default: 10) */
  pageGap?: number;
  /** MushafConfig for advanced configuration */
  mushafConfig?: MushafConfig;
  /** Container width (default: 100%) */
  width?: number | string;
  /** Container height (default: auto) */
  height?: number | string;
  /** Page width in single mode (default: 400) */
  pageWidth?: number;
  /** Callback when page changes - reports the lower and higher page numbers in the spread */
  onPageChange?: (lowerPage: number, higherPage: number | null) => void;
  /** Callback when spread mode changes */
  onModeChange?: (mode: 'single' | 'double') => void;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export interface QuranSpreadRef {
  /** Navigate to a specific page */
  goToPage: (pageNumber: number) => void;
  /** Navigate to previous spread (lower page numbers) */
  goToPrevious: () => void;
  /** Navigate to next spread (higher page numbers) */
  goToNext: () => void;
  /** Get current spread state */
  getSpreadState: () => {
    mode: 'single' | 'double';
    /** The page with lower number in the spread */
    lowerPage: number;
    /** The page with higher number in the spread (null in single mode) */
    higherPage: number | null;
  };
  /** Set display mode */
  setMode: (mode: SpreadMode) => void;
}

// ============================================
// Helper Functions
// ============================================

function getSpreadConfig(mushafConfig?: MushafConfig): PageSpreadConfig {
  if (mushafConfig?.spread) {
    return mushafConfig.spread;
  }
  return {
    defaultMode: 'auto',
    autoBreakpoint: 800,
    spread: {
      gutterWidth: 40,
      sharedHeader: false,
      sharedFooter: true,
      rightPageParity: 'even',
      pageGap: 10,
    },
  };
}

/**
 * Calculate which pages to show in a spread based on page number.
 * Returns lowerPage (smaller page number) and higherPage (larger page number).
 */
function calculateSpreadPages(
  pageNumber: number,
  totalPages: number
): { lowerPage: number; higherPage: number | null } {
  // Determine which spread this page belongs to
  // Pages are paired: (1,2), (3,4), (5,6), etc.
  const isOddPage = pageNumber % 2 === 1;

  let lowerPage: number;
  let higherPage: number | null;

  if (isOddPage) {
    // Odd page is the lower page in the spread
    lowerPage = pageNumber;
    higherPage = pageNumber + 1;
  } else {
    // Even page is the higher page in the spread
    lowerPage = pageNumber - 1;
    higherPage = pageNumber;
  }

  // Handle edge cases
  if (lowerPage < 1) {
    lowerPage = 1;
    higherPage = totalPages > 1 ? 2 : null;
  }
  if (higherPage && higherPage > totalPages) {
    higherPage = null;
  }

  return { lowerPage, higherPage };
}

// ============================================
// Component
// ============================================

export const QuranSpread = forwardRef<QuranSpreadRef, QuranSpreadProps>(
  function QuranSpread(
    {
      pageNumber,
      totalPages = 604,
      mode = 'auto',
      readingDirection = 'rtl',
      autoBreakpoint = 800,
      pageGap = 10,
      mushafConfig,
      width = '100%',
      height = 'auto',
      pageWidth = 400,
      layoutType,
      onPageChange,
      onModeChange,
      className,
      style,
      ...pageProps
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentMode, setCurrentMode] = useState<'single' | 'double'>(
      mode === 'auto' ? 'single' : mode
    );
    const [currentPage, setCurrentPage] = useState(pageNumber);

    // Get spread config from mushafConfig or use defaults
    const spreadConfig = useMemo(
      () => getSpreadConfig(mushafConfig),
      [mushafConfig]
    );

    const effectiveBreakpoint =
      spreadConfig.autoBreakpoint || autoBreakpoint;
    const effectivePageGap = spreadConfig.spread?.pageGap ?? pageGap;

    // Calculate which pages to show (lowerPage has smaller number, higherPage has larger number)
    const { lowerPage, higherPage } = useMemo(() => {
      if (currentMode === 'single') {
        return { lowerPage: currentPage, higherPage: null };
      }
      return calculateSpreadPages(currentPage, totalPages);
    }, [currentPage, currentMode, totalPages]);

    // Handle viewport resize for auto mode
    useEffect(() => {
      if (mode !== 'auto') {
        setCurrentMode(mode);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const updateMode = () => {
        const containerWidth = container.clientWidth;
        const newMode = containerWidth >= effectiveBreakpoint ? 'double' : 'single';
        if (newMode !== currentMode) {
          setCurrentMode(newMode);
          onModeChange?.(newMode);
        }
      };

      // Initial check
      updateMode();

      // Watch for resize
      const resizeObserver = new ResizeObserver(updateMode);
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }, [mode, effectiveBreakpoint, currentMode, onModeChange]);

    // Notify page change
    useEffect(() => {
      onPageChange?.(lowerPage, higherPage);
    }, [lowerPage, higherPage, onPageChange]);

    // Sync with external pageNumber prop
    useEffect(() => {
      if (pageNumber !== currentPage) {
        setCurrentPage(pageNumber);
      }
    }, [pageNumber]);

    // Navigation handlers
    const goToPage = useCallback(
      (page: number) => {
        const clampedPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(clampedPage);
      },
      [totalPages]
    );

    const goToPrevious = useCallback(() => {
      if (currentMode === 'single') {
        goToPage(currentPage - 1);
      } else {
        // In double mode, go back 2 pages (to lower page numbers)
        goToPage(lowerPage - 2);
      }
    }, [currentMode, currentPage, lowerPage, goToPage]);

    const goToNext = useCallback(() => {
      if (currentMode === 'single') {
        goToPage(currentPage + 1);
      } else {
        // In double mode, go forward 2 pages (to higher page numbers)
        goToPage((higherPage || lowerPage) + 1);
      }
    }, [currentMode, currentPage, lowerPage, higherPage, goToPage]);

    const getSpreadState = useCallback(() => {
      return {
        mode: currentMode,
        lowerPage,
        higherPage,
      };
    }, [currentMode, lowerPage, higherPage]);

    const setMode = useCallback((newMode: SpreadMode) => {
      if (newMode === 'auto') {
        // Let the resize observer handle it
        return;
      }
      setCurrentMode(newMode);
      onModeChange?.(newMode);
    }, [onModeChange]);

    // Expose ref methods
    useImperativeHandle(
      ref,
      () => ({
        goToPage,
        goToPrevious,
        goToNext,
        getSpreadState,
        setMode,
      }),
      [goToPage, goToPrevious, goToNext, getSpreadState, setMode]
    );

    // Calculate page dimensions
    const calculatedPageWidth = useMemo(() => {
      if (currentMode === 'single') {
        return pageWidth;
      }
      // In double mode, each page is half the container minus gap
      // This will be handled by flex layout
      return pageWidth;
    }, [currentMode, pageWidth]);

    // Keyboard navigation - respects reading direction
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Only handle if not in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        switch (e.key) {
          case 'ArrowLeft':
            // In RTL, left arrow goes to higher page numbers (next)
            // In LTR, left arrow goes to lower page numbers (previous)
            if (readingDirection === 'rtl') {
              goToNext();
            } else {
              goToPrevious();
            }
            e.preventDefault();
            break;
          case 'ArrowRight':
            // In RTL, right arrow goes to lower page numbers (previous)
            // In LTR, right arrow goes to higher page numbers (next)
            if (readingDirection === 'rtl') {
              goToPrevious();
            } else {
              goToNext();
            }
            e.preventDefault();
            break;
          case 'PageDown':
            goToNext();
            e.preventDefault();
            break;
          case 'PageUp':
            goToPrevious();
            e.preventDefault();
            break;
          case 'Home':
            goToPage(1);
            e.preventDefault();
            break;
          case 'End':
            goToPage(totalPages);
            e.preventDefault();
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrevious, goToPage, totalPages, readingDirection]);

    // Determine which page goes on which side based on reading direction
    // RTL (Arabic/Quran): lower page number on RIGHT, higher page number on LEFT
    // LTR (Western): lower page number on LEFT, higher page number on RIGHT
    const leftSidePage = readingDirection === 'rtl' ? higherPage : lowerPage;
    const rightSidePage = readingDirection === 'rtl' ? lowerPage : higherPage;

    return (
      <div
        ref={containerRef}
        className={`quran-spread spread-${currentMode} direction-${readingDirection} ${className || ''}`}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: currentMode === 'double' ? effectivePageGap : 0,
          width,
          height,
          // Use LTR for the flex container so we can control page placement explicitly
          direction: 'ltr',
          ...style,
        }}
        role="region"
        aria-label={
          currentMode === 'double' && higherPage
            ? `Quran spread showing pages ${lowerPage} and ${higherPage}`
            : `Quran page ${lowerPage}`
        }
      >
        {/* Left side of the spread */}
        {currentMode === 'double' && leftSidePage && (
          <QuranPage
            pageNumber={leftSidePage}
            layoutType={layoutType}
            width={calculatedPageWidth}
            {...pageProps}
          />
        )}

        {/* Right side of the spread (or single page) */}
        <QuranPage
          pageNumber={currentMode === 'double' ? (rightSidePage ?? lowerPage) : lowerPage}
          layoutType={layoutType}
          width={calculatedPageWidth}
          {...pageProps}
        />
      </div>
    );
  }
);

export default QuranSpread;
