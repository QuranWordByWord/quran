/**
 * QuranViewer - Multi-page virtualized Quran viewer component
 *
 * Displays multiple pages with virtualization for performance.
 * Uses SVG rendering via QuranPage components.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { MushafLayoutTypeString, WordClickInfo, VerseClickInfo, HighlightGroup } from '../core/types';
import type { VerseNumberFormat } from '@digitalkhatt/quran-engine';
import { QuranPage } from './QuranPage';
import { useDigitalKhatt } from './QuranProvider';
import { MushafBorder } from './MushafBorder';

// ============================================
// Types
// ============================================

export interface QuranViewerProps {
  /** Mushaf layout type */
  layoutType: MushafLayoutTypeString;
  /** Initial page number (1-indexed) */
  initialPage?: number;

  // Viewport
  /** Container width */
  width?: number | string;
  /** Container height */
  height?: number | string;
  /** Page width in pixels */
  pageWidth?: number;

  // Zoom/Pan
  /** Minimum scale factor */
  minScale?: number;
  /** Maximum scale factor */
  maxScale?: number;
  /** Initial scale (used if scale prop is not provided) */
  initialScale?: number;
  /** Controlled scale (overrides internal state when provided) */
  scale?: number;
  /** Called when scale changes (for controlled mode) */
  onScaleChange?: (scale: number) => void;
  /** Enable pinch zoom on touch devices */
  enablePinchZoom?: boolean;

  // Navigation
  /** Called when page changes */
  onPageChange?: (pageNumber: number) => void;

  // Styling
  /** Enable Tajweed coloring */
  tajweedEnabled?: boolean;
  /** Page background color */
  backgroundColor?: string;
  /** Verse number format (default: 'arabic') */
  verseNumberFormat?: VerseNumberFormat;
  /** Font scale factor (0.5 to 1.2, default: 0.75) */
  fontScale?: number;
  /** Gap between pages */
  pageGap?: number;

  // Highlighting
  /** Verses to highlight (single color, uses highlightColor) */
  highlightedVerses?: Array<{ surah: number; ayah: number }>;
  /** Words to highlight (single color, uses highlightColor) */
  highlightedWords?: Array<{ page: number; line: number; word: number }>;
  /** Highlight color (used for highlightedVerses and highlightedWords) */
  highlightColor?: string;
  /** Multiple highlight groups with different colors */
  highlightGroups?: HighlightGroup[];

  // Events
  /** Called when a word is clicked */
  onWordClick?: (info: WordClickInfo) => void;
  /** Called when a verse is clicked */
  onVerseClick?: (info: VerseClickInfo) => void;
  /** Called when mouse hovers over a word */
  onWordHover?: (info: WordClickInfo | null) => void;

  // Virtualization
  /** Number of pages to pre-render above and below viewport */
  overscanPages?: number;

  // Border
  /** Show decorative border around pages */
  showBorder?: boolean;

  // Single page mode
  /** Display only one page at a time, fitting to container (for mobile) */
  singlePageMode?: boolean;

  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

// ============================================
// Component
// ============================================

export function QuranViewer({
  layoutType,
  initialPage = 1,
  width = '100%',
  height = '100%',
  pageWidth = 400,
  minScale = 0.5,
  maxScale = 3,
  initialScale = 1,
  scale: controlledScale,
  onScaleChange,
  enablePinchZoom = true,
  onPageChange,
  tajweedEnabled = true,
  backgroundColor,
  verseNumberFormat = 'arabic',
  fontScale,
  pageGap = 20,
  highlightedVerses = [],
  highlightedWords = [],
  highlightColor = 'rgba(255, 255, 0, 0.3)',
  highlightGroups = [],
  onWordClick,
  onVerseClick,
  onWordHover,
  overscanPages = 2,
  showBorder = false,
  singlePageMode = false,
  className,
  style,
}: QuranViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalScale, setInternalScale] = useState(initialScale);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  // Pan offset for single page mode when zoomed
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Use controlled scale if provided, otherwise use internal state
  const scale = controlledScale ?? internalScale;
  const setScale = (newScale: number) => {
    if (onScaleChange) {
      onScaleChange(newScale);
    } else {
      setInternalScale(newScale);
    }
  };

  const { isReady, getTextService } = useDigitalKhatt();
  const textService = useMemo(
    () => getTextService(layoutType === 'newMadinah' ? 1 : layoutType === 'oldMadinah' ? 2 : 3),
    [getTextService, layoutType]
  );

  const totalPages = textService?.nbPages ?? 604;

  // Calculate page height based on aspect ratio
  const pageHeight = useMemo(() => {
    return (pageWidth * 410) / 255;
  }, [pageWidth]);

  // Border frame dimensions - MushafBorder maintains SVG aspect ratio (437:740)
  // SVG dimensions: 437x740, inner: 387x690
  const SVG_WIDTH = 437;
  const SVG_HEIGHT = 740;
  const SVG_INNER_WIDTH = 387;
  const SVG_INNER_HEIGHT = 690;

  // Helper to calculate border offset for any scale value
  const calculateBorderOffsetForScale = useCallback((s: number): number => {
    if (!showBorder) return 0;

    const scaledPageWidth = pageWidth * s;
    const scaledPageHeight = pageHeight * s;

    const frameFromWidth = scaledPageWidth * (SVG_WIDTH / SVG_INNER_WIDTH);
    const heightFromWidth = frameFromWidth * (SVG_HEIGHT / SVG_WIDTH);
    const innerHeightFromWidth = heightFromWidth * (SVG_INNER_HEIGHT / SVG_HEIGHT);
    const frameFromHeight = scaledPageHeight * (SVG_HEIGHT / SVG_INNER_HEIGHT);

    const frameHeight = innerHeightFromWidth >= scaledPageHeight
      ? Math.round(heightFromWidth)
      : Math.round(frameFromHeight);

    const headerFooterH = (24 + 32) * s;
    return (frameHeight - scaledPageHeight) + headerFooterH;
  }, [showBorder, pageWidth, pageHeight]);

  // Calculate frame dimensions that match MushafBorder's calculation
  const { frameWidth: borderFrameWidth, frameHeight: borderFrameHeight } = useMemo(() => {
    if (!showBorder) return { frameWidth: 0, frameHeight: 0 };

    const scaledPageWidth = pageWidth * scale;
    const scaledPageHeight = pageHeight * scale;

    // Size based on content width (same logic as MushafBorder)
    const frameFromWidth = scaledPageWidth * (SVG_WIDTH / SVG_INNER_WIDTH);
    const heightFromWidth = frameFromWidth * (SVG_HEIGHT / SVG_WIDTH);
    const innerHeightFromWidth = heightFromWidth * (SVG_INNER_HEIGHT / SVG_HEIGHT);

    // Size based on content height
    const frameFromHeight = scaledPageHeight * (SVG_HEIGHT / SVG_INNER_HEIGHT);
    const widthFromHeight = frameFromHeight * (SVG_WIDTH / SVG_HEIGHT);

    if (innerHeightFromWidth >= scaledPageHeight) {
      return { frameWidth: Math.round(frameFromWidth), frameHeight: Math.round(heightFromWidth) };
    } else {
      return { frameWidth: Math.round(widthFromHeight), frameHeight: Math.round(frameFromHeight) };
    }
  }, [showBorder, pageWidth, pageHeight, scale]);

  const headerFooterHeight = showBorder ? (24 + 32) * scale : 0;

  // Total border offset: frame height - content height + header/footer
  const totalBorderOffset = showBorder
    ? (borderFrameHeight - pageHeight * scale) + headerFooterHeight
    : 0;

  // Calculate total content height (including border offset)
  const totalHeight = useMemo(() => {
    return totalPages * (pageHeight * scale + totalBorderOffset + pageGap) - pageGap;
  }, [totalPages, pageHeight, scale, pageGap, totalBorderOffset]);

  // Calculate total content width (frame width or scaled page width)
  const totalWidth = useMemo(() => {
    return showBorder ? borderFrameWidth : pageWidth * scale;
  }, [showBorder, borderFrameWidth, pageWidth, scale]);

  // Calculate visible pages based on scroll position (only for multi-page scroll mode)
  const calculateVisibleRange = useCallback(() => {
    // Skip for single page mode - navigation is handled by swipe gestures
    if (singlePageMode) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    const scaledPageHeight = pageHeight * scale + totalBorderOffset + pageGap;

    const startPage = Math.max(0, Math.floor(scrollTop / scaledPageHeight) - overscanPages);
    const endPage = Math.min(
      totalPages - 1,
      Math.ceil((scrollTop + viewportHeight) / scaledPageHeight) + overscanPages
    );

    setVisibleRange({ start: startPage, end: endPage });

    // Calculate current page (the one most visible in the center)
    const centerY = scrollTop + viewportHeight / 2;
    const centerPage = Math.floor(centerY / scaledPageHeight);
    const newCurrentPage = Math.max(1, Math.min(totalPages, centerPage + 1));

    if (newCurrentPage !== currentPage) {
      setCurrentPage(newCurrentPage);
      onPageChange?.(newCurrentPage);
    }
  }, [singlePageMode, pageHeight, scale, pageGap, totalBorderOffset, overscanPages, totalPages, currentPage, onPageChange]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(calculateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    calculateVisibleRange(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [calculateVisibleRange]);

  // Recalculate on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleRange();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [calculateVisibleRange]);

  // Track previous values to detect external changes
  const prevInitialPageRef = useRef(initialPage);
  const prevScaleRef = useRef(scale);

  // Refs to always have current values for touch handlers (avoid stale closures)
  const initialPageRef = useRef(initialPage);
  initialPageRef.current = initialPage;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // Maintain current page position when scale changes externally
  useEffect(() => {
    if (scale !== prevScaleRef.current) {
      const prevScale = prevScaleRef.current;
      prevScaleRef.current = scale;

      // Reset pan offset when scale returns to 1 (or close to it)
      if (scale <= 1.05) {
        setPanOffset({ x: 0, y: 0 });
      }

      // In single page mode, nothing to do for scroll - page is controlled by initialPage prop
      if (singlePageMode) return;

      const container = containerRef.current;
      if (!container) return;

      // Calculate scroll position to maintain the same page in view
      // Use the helper function to get correct border offset for both scales
      const prevBorderOffset = calculateBorderOffsetForScale(prevScale);
      const prevScaledPageHeight = pageHeight * prevScale + prevBorderOffset + pageGap;
      const newScaledPageHeight = pageHeight * scale + totalBorderOffset + pageGap;

      // Get the current fractional page position from scroll
      const scrollTop = container.scrollTop;
      const pageAtTop = scrollTop / prevScaledPageHeight;

      // Adjust scroll to maintain the same fractional page position
      container.scrollTop = pageAtTop * newScaledPageHeight;

      // Recalculate visible range after scale change
      requestAnimationFrame(calculateVisibleRange);
    }
  }, [scale, pageHeight, pageGap, totalBorderOffset, singlePageMode, calculateVisibleRange, calculateBorderOffsetForScale]);

  // Sync with external initialPage prop changes (e.g., navigation, toolbar)
  useEffect(() => {
    // Only process if initialPage actually changed from what we tracked
    if (initialPage !== prevInitialPageRef.current) {
      prevInitialPageRef.current = initialPage;

      const targetPage = Math.max(1, Math.min(totalPages, initialPage));
      setCurrentPage(targetPage);

      // Reset pan offset when page changes
      setPanOffset({ x: 0, y: 0 });

      // In single page mode, we just update the current page state - no scrolling needed
      if (singlePageMode) return;

      const container = containerRef.current;
      if (!container) return;

      // Include totalBorderOffset in scroll calculation to center the page properly
      const scaledPageHeight = pageHeight * scale + totalBorderOffset + pageGap;
      const pageTop = (targetPage - 1) * scaledPageHeight;

      // Center the page vertically in the viewport
      const viewportHeight = container.clientHeight;
      const pageWithBorderHeight = pageHeight * scale + totalBorderOffset;
      const scrollTop = Math.max(0, pageTop - (viewportHeight - pageWithBorderHeight) / 2);

      container.scrollTo({
        top: scrollTop,
        behavior: 'instant',
      });
    }
  }, [initialPage, totalPages, pageHeight, scale, pageGap, totalBorderOffset, singlePageMode]);

  // Navigate to a specific page
  const goToPage = useCallback(
    (pageNumber: number) => {
      const container = containerRef.current;
      if (!container) return;

      const targetPage = Math.max(1, Math.min(totalPages, pageNumber));
      // Include totalBorderOffset in scroll calculation to center the page properly
      const scaledPageHeight = pageHeight * scale + totalBorderOffset + pageGap;
      const pageTop = (targetPage - 1) * scaledPageHeight;

      // Center the page vertically in the viewport
      const viewportHeight = container.clientHeight;
      const pageWithBorderHeight = pageHeight * scale + totalBorderOffset;
      const scrollTop = Math.max(0, pageTop - (viewportHeight - pageWithBorderHeight) / 2);

      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    },
    [totalPages, pageHeight, scale, pageGap, totalBorderOffset]
  );

  // Handle zoom
  const handleZoom = useCallback(
    (newScale: number) => {
      const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
      // Just update scale - the useEffect handles scroll position adjustment
      setScale(clampedScale);
    },
    [minScale, maxScale]
  );

  // Combined touch handling: pinch zoom + panning + vertical swipe navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDistance = 0;
    let pinchInitialScale = scaleRef.current;
    let touchStartX = 0;
    let touchStartY = 0;
    let isSingleTouch = false;
    let isPanning = false;
    let panStartOffset = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2 && enablePinchZoom) {
        // Pinch zoom start
        isSingleTouch = false;
        isPanning = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        pinchInitialScale = scaleRef.current;
      } else if (e.touches.length === 1) {
        // Single touch - could be swipe or pan
        isSingleTouch = true;
        isPanning = false;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        // Capture current pan offset at start of touch
        setPanOffset(current => {
          panStartOffset = { ...current };
          return current;
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0 && enablePinchZoom) {
        e.preventDefault();
        isSingleTouch = false;
        isPanning = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const newScale = pinchInitialScale * (distance / initialDistance);
        handleZoom(newScale);
      } else if (isSingleTouch && singlePageMode && scaleRef.current > 1 && e.touches.length === 1) {
        // Pan when zoomed in single page mode
        e.preventDefault();
        isPanning = true;
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        setPanOffset({
          x: panStartOffset.x + deltaX,
          y: panStartOffset.y + deltaY,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Handle swipe navigation only when not zoomed or not panning significantly
      if (isSingleTouch && singlePageMode && e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const currentPage = initialPageRef.current;

        // If zoomed in and was panning, don't navigate
        // If not zoomed (scale <= 1), use swipe for navigation
        const minSwipeDistance = 50;
        if (scaleRef.current <= 1 && !isPanning && Math.abs(deltaY) > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
          if (deltaY > 0) {
            // Swipe down - go to previous page
            onPageChange?.(Math.max(1, currentPage - 1));
          } else {
            // Swipe up - go to next page
            onPageChange?.(Math.min(totalPages, currentPage + 1));
          }
        }
      }

      // Reset state
      initialDistance = 0;
      isSingleTouch = false;
      isPanning = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePinchZoom, handleZoom, singlePageMode, totalPages, onPageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PageDown' || e.key === 'ArrowRight') {
        goToPage(currentPage + 1);
        e.preventDefault();
      } else if (e.key === 'PageUp' || e.key === 'ArrowLeft') {
        goToPage(currentPage - 1);
        e.preventDefault();
      } else if (e.key === 'Home') {
        goToPage(1);
        e.preventDefault();
      } else if (e.key === 'End') {
        goToPage(totalPages);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, goToPage]);

  // Filter highlighted words for a specific page
  const getHighlightedWordsForPage = useCallback(
    (pageNumber: number) => {
      return highlightedWords
        .filter((w) => w.page === pageNumber)
        .map((w) => ({ line: w.line, word: w.word }));
    },
    [highlightedWords]
  );

  // Generate visible pages
  const visiblePages = useMemo(() => {
    const pages: React.ReactNode[] = [];

    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      const pageNumber = i + 1;
      const scaledPageHeight = pageHeight * scale;
      const scaledPageWidth = pageWidth * scale;

      const pageContent = (
        <QuranPage
          pageNumber={pageNumber}
          layoutType={layoutType}
          width={pageWidth}
          scale={scale}
          tajweedEnabled={tajweedEnabled}
          backgroundColor={backgroundColor}
          verseNumberFormat={verseNumberFormat}
          fontScale={fontScale}
          highlightedVerses={highlightedVerses}
          highlightedWords={getHighlightedWordsForPage(pageNumber)}
          highlightColor={highlightColor}
          highlightGroups={highlightGroups}
          onWordClick={onWordClick}
          onVerseClick={onVerseClick}
          onWordHover={onWordHover}
        />
      );

      pages.push(
        <div
          key={pageNumber}
          style={{
            position: 'absolute',
            top: i * (scaledPageHeight + totalBorderOffset + pageGap),
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {showBorder ? (
            <MushafBorder
              pageNumber={pageNumber}
              contentWidth={scaledPageWidth}
              contentHeight={scaledPageHeight}
              scale={scale}
              borderColor="var(--mushaf-border, #2d5a27)"
            >
              {pageContent}
            </MushafBorder>
          ) : (
            pageContent
          )}
        </div>
      );
    }

    return pages;
  }, [
    visibleRange,
    pageHeight,
    scale,
    pageGap,
    pageWidth,
    layoutType,
    tajweedEnabled,
    backgroundColor,
    verseNumberFormat,
    fontScale,
    highlightedVerses,
    highlightColor,
    highlightGroups,
    onWordClick,
    onVerseClick,
    onWordHover,
    getHighlightedWordsForPage,
    showBorder,
    totalBorderOffset,
  ]);

  if (!isReady) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor || '#f5f5f5',
          ...style,
        }}
      >
        <span>Loading Quran viewer...</span>
      </div>
    );
  }

  // Single page mode - display only the current page centered, fitting to container
  // In single page mode, we use initialPage directly as the source of truth
  // since navigation is controlled externally via URL/props
  if (singlePageMode) {
    const displayPage = Math.max(1, Math.min(totalPages, initialPage));
    const scaledPageHeight = pageHeight * scale;
    const scaledPageWidth = pageWidth * scale;

    const singlePageContent = (
      <QuranPage
        pageNumber={displayPage}
        layoutType={layoutType}
        width={pageWidth}
        scale={scale}
        tajweedEnabled={tajweedEnabled}
        backgroundColor={backgroundColor}
        verseNumberFormat={verseNumberFormat}
        fontScale={fontScale}
        highlightedVerses={highlightedVerses}
        highlightedWords={getHighlightedWordsForPage(displayPage)}
        highlightColor={highlightColor}
        highlightGroups={highlightGroups}
        onWordClick={onWordClick}
        onVerseClick={onVerseClick}
        onWordHover={onWordHover}
      />
    );

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width,
          height,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: backgroundColor || '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: scale > 1 ? 'none' : 'pan-y',
          ...style,
        }}
        tabIndex={0}
        role="document"
        aria-label={`Quran viewer - Page ${displayPage} of ${totalPages}`}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: scale <= 1 ? 'transform 0.2s ease-out' : 'none',
          }}
        >
          {showBorder ? (
            <MushafBorder
              pageNumber={displayPage}
              contentWidth={scaledPageWidth}
              contentHeight={scaledPageHeight}
              scale={scale}
              borderColor="var(--mushaf-border, #2d5a27)"
            >
              {singlePageContent}
            </MushafBorder>
          ) : (
            singlePageContent
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        overflow: 'auto',
        position: 'relative',
        backgroundColor: backgroundColor || '#f5f5f5',
        ...style,
      }}
      tabIndex={0}
      role="document"
      aria-label={`Quran viewer - Page ${currentPage} of ${totalPages}`}
    >
      {/* Content container with total height for scrollbar */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minWidth: totalWidth,
          height: totalHeight,
          minHeight: '100%',
        }}
      >
        {visiblePages}
      </div>

      {/* Page indicator */}
      <div
        style={{
          position: 'sticky',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: 14,
          zIndex: 10,
          pointerEvents: 'none',
          width: 'fit-content',
        }}
      >
        Page {currentPage} / {totalPages}
      </div>
    </div>
  );
}

// ============================================
// Navigation Hook
// ============================================

export interface QuranViewerRef {
  goToPage: (pageNumber: number) => void;
  getCurrentPage: () => number;
  setScale: (scale: number) => void;
  getScale: () => number;
}

export default QuranViewer;
