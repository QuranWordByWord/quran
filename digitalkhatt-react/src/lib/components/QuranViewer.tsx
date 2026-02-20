/**
 * QuranViewer - Multi-page virtualized Quran viewer component
 *
 * Displays multiple pages with virtualization for performance.
 * Uses SVG rendering via QuranPage components.
 */

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import type { MushafLayoutTypeString, WordClickInfo, VerseClickInfo, HighlightGroup } from '../core/types';
import type { VerseNumberFormat } from '@digitalkhatt/quran-engine';
import { MemoizedQuranPage } from './QuranPage';
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
  /** Target frame height for MushafBorder (mobile height fill) */
  targetFrameHeight?: number;

  // Free scroll mode
  /** Disable onPageChange during scroll (for desktop free scrolling) */
  freeScroll?: boolean;

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
  targetFrameHeight,
  freeScroll = false,
  className,
  style,
}: QuranViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalScale, setInternalScale] = useState(initialScale);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  // Flag to suppress onPageChange during scale/resize transitions and initial mount
  // Must be declared early so it's available in calculateVisibleRange callback
  // Start as true to prevent spurious onPageChange during initial render before scroll is set
  const isTransitioningRef = useRef(true);

  // Pan offset for single page mode when zoomed
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Gesture scale for responsive pinch-zoom (applied via CSS transform during gesture)
  // null = not in gesture, use the committed scale value
  const [gestureScale, setGestureScale] = useState<number | null>(null);

  // Swipe navigation state for single page mode
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipePhase, setSwipePhase] = useState<'idle' | 'dragging' | 'animating'>('idle');
  const totalPageHeightRef = useRef(0);

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

  // Border frame dimensions - MushafBorder maintains SVG aspect ratio (437:740)
  // SVG dimensions: 437x740, inner: 387x690
  const SVG_WIDTH = 437;
  const SVG_HEIGHT = 740;
  const SVG_INNER_WIDTH = 387;
  const SVG_INNER_HEIGHT = 690;

  // Calculate page height based on aspect ratio
  const pageHeight = useMemo(() => {
    return (pageWidth * 410) / 255;
  }, [pageWidth]);

  // Swipe navigation configuration
  const SWIPE_THRESHOLD = 80; // Min distance to trigger page change (px)
  const SWIPE_RESISTANCE = 0.3; // Resistance factor at boundaries
  const ANIMATION_DURATION = 250; // Transition duration in ms
  const PAGE_GAP = 16; // Gap between pages during swipe

  // Helper to calculate border offset for any scale value
  const calculateBorderOffsetForScale = useCallback((s: number): number => {
    if (!showBorder) return 0;

    const scaledPageWidth = pageWidth * s;
    const scaledPageHeight = pageHeight * s;

    const frameFromWidth = scaledPageWidth * (SVG_WIDTH / SVG_INNER_WIDTH);
    const heightFromWidth = frameFromWidth * (SVG_HEIGHT / SVG_WIDTH);
    const innerHeightFromWidth = heightFromWidth * (SVG_INNER_HEIGHT / SVG_HEIGHT);
    const frameFromHeight = scaledPageHeight * (SVG_HEIGHT / SVG_INNER_HEIGHT);

    let frameHeight = innerHeightFromWidth >= scaledPageHeight
      ? Math.round(heightFromWidth)
      : Math.round(frameFromHeight);

    // Apply targetFrameHeight override for mobile height fill (only at scale 1)
    if (targetFrameHeight !== undefined && s === 1) {
      const maxFrameHeight = Math.round(frameHeight * 1.20);
      frameHeight = Math.min(targetFrameHeight, maxFrameHeight);
    }

    const headerFooterH = (24 + 32) * s;
    return (frameHeight - scaledPageHeight) + headerFooterH;
  }, [showBorder, pageWidth, pageHeight, targetFrameHeight]);

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

    let fw: number, fh: number;
    if (innerHeightFromWidth >= scaledPageHeight) {
      fw = Math.round(frameFromWidth);
      fh = Math.round(heightFromWidth);
    } else {
      fw = Math.round(widthFromHeight);
      fh = Math.round(frameFromHeight);
    }

    // Apply targetFrameHeight override for mobile height fill (only at scale 1)
    if (targetFrameHeight !== undefined && scale === 1) {
      const maxFh = Math.round(fh * 1.20);
      fh = Math.min(targetFrameHeight, maxFh);
    }

    return { frameWidth: fw, frameHeight: fh };
  }, [showBorder, pageWidth, pageHeight, scale, targetFrameHeight]);

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
      // Only update page state and notify parent if not in the middle of a scale/resize transition
      // This prevents unwanted navigation and state changes when zooming in/out or browser zoom changes
      if (!isTransitioningRef.current) {
        setCurrentPage(newCurrentPage);
        // Only fire onPageChange if not in freeScroll mode (allows desktop free scrolling)
        if (!freeScroll) {
          onPageChange?.(newCurrentPage);
        }
      }
    }
  }, [singlePageMode, pageHeight, scale, pageGap, totalBorderOffset, overscanPages, totalPages, currentPage, onPageChange, freeScroll]);

  // Track previous singlePageMode to detect mode transitions
  const prevSinglePageModeRef = useRef(singlePageMode);

  // Set initial scroll position on mount AND when transitioning from single-page to scroll mode
  // This must run before we allow onPageChange to fire
  useEffect(() => {
    const wasInSinglePageMode = prevSinglePageModeRef.current;
    prevSinglePageModeRef.current = singlePageMode;

    if (singlePageMode) {
      // In single page mode, no scrolling needed - clear the flag immediately
      requestAnimationFrame(() => {
        isTransitioningRef.current = false;
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Set scroll position to center the current page
    // Use initialPage (from URL) as the source of truth
    const targetPage = initialPage;
    const scaledPageHeight = pageHeight * scale + totalBorderOffset + pageGap;
    const pageTop = (targetPage - 1) * scaledPageHeight;
    const viewportHeight = container.clientHeight;
    const pageWithBorderHeight = pageHeight * scale + totalBorderOffset;
    const scrollTop = Math.max(0, pageTop - (viewportHeight - pageWithBorderHeight) / 2);

    // When transitioning from single-page mode to scroll mode, suppress onPageChange during scroll adjustment
    if (wasInSinglePageMode) {
      isTransitioningRef.current = true;
    }

    container.scrollTop = scrollTop;

    // Clear the transition flag after scroll is set, allowing onPageChange to work
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isTransitioningRef.current = false;
      });
    });
  }, [singlePageMode, initialPage, pageHeight, scale, totalBorderOffset, pageGap]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(calculateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    calculateVisibleRange(); // Initial calculation (won't trigger onPageChange due to isTransitioningRef)

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [calculateVisibleRange]);

  // Track the current page for maintaining position during resize
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  // Also track initialPage for resize handling - this is the source of truth from the URL
  const initialPageForResizeRef = useRef(initialPage);
  initialPageForResizeRef.current = initialPage;

  // Recalculate on resize (e.g., browser zoom, window resize)
  // Note: We skip resize handling during scale transitions (isTransitioningRef is true)
  // because the scale change effect already handles scroll position adjustment
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip resize handling for single page mode
    if (singlePageMode) return;

    const resizeObserver = new ResizeObserver(() => {
      // Skip if we're already in a scale transition - the scale change effect handles this
      if (isTransitioningRef.current) {
        return;
      }

      // In freeScroll mode, just recalculate visible range
      // Scroll position is maintained by the scale change effect
      if (freeScroll) {
        calculateVisibleRange();
        return;
      }

      // Suppress onPageChange during resize to prevent unwanted navigation
      // (e.g., when browser zoom changes)
      isTransitioningRef.current = true;

      // Maintain scroll position to keep the same page centered after resize
      // Use initialPage (from URL) as the source of truth, not internal currentPage state
      // This prevents navigation drift when resize events occur
      const targetPage = initialPageForResizeRef.current;
      const scaledPageHeight = pageHeight * scale + totalBorderOffset + pageGap;
      const pageTop = (targetPage - 1) * scaledPageHeight;

      // Center the page vertically in the viewport
      const viewportHeight = container.clientHeight;
      const pageWithBorderHeight = pageHeight * scale + totalBorderOffset;
      const scrollTop = Math.max(0, pageTop - (viewportHeight - pageWithBorderHeight) / 2);

      container.scrollTop = scrollTop;

      // Recalculate visible range after scroll adjustment
      calculateVisibleRange();

      // Clear the flag after a short delay to allow the layout to settle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isTransitioningRef.current = false;
        });
      });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [calculateVisibleRange, singlePageMode, freeScroll, pageHeight, scale, totalBorderOffset, pageGap]);

  // Track previous values to detect external changes
  const prevInitialPageRef = useRef(initialPage);
  const prevScaleRef = useRef(scale);

  // Refs to always have current values for touch handlers (avoid stale closures)
  const initialPageRef = useRef(initialPage);
  initialPageRef.current = initialPage;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // Maintain current page position when scale changes externally
  // Use useLayoutEffect to adjust scroll BEFORE browser paints, preventing visual jump
  useLayoutEffect(() => {
    if (scale !== prevScaleRef.current) {
      const prevScale = prevScaleRef.current;
      prevScaleRef.current = scale;

      // Set flag to suppress onPageChange during scale transition
      isTransitioningRef.current = true;

      // Reset pan offset when scale returns to 1 (or close to it)
      if (scale <= 1.05) {
        setPanOffset({ x: 0, y: 0 });
      }

      // In single page mode, nothing to do for scroll - page is controlled by initialPage prop
      if (singlePageMode) {
        // Clear the flag after a short delay
        requestAnimationFrame(() => {
          isTransitioningRef.current = false;
        });
        return;
      }

      const container = containerRef.current;
      if (!container) {
        isTransitioningRef.current = false;
        return;
      }

      // Calculate scroll position to maintain the same page in view
      // Use the helper function to get correct border offset for both scales
      const prevBorderOffset = calculateBorderOffsetForScale(prevScale);
      const prevScaledPageHeight = pageHeight * prevScale + prevBorderOffset + pageGap;
      const newScaledPageHeight = pageHeight * scale + totalBorderOffset + pageGap;

      // Get viewport dimensions for center-based calculation
      const viewportHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Calculate the center point of the viewport in document coordinates
      const centerY = scrollTop + viewportHeight / 2;

      // Convert to fractional page position at the center
      const pageAtCenter = centerY / prevScaledPageHeight;

      // Calculate where that same fractional page position should be after zoom
      const newCenterY = pageAtCenter * newScaledPageHeight;

      // Calculate new scroll position to keep content centered
      const newScrollTop = newCenterY - viewportHeight / 2;

      // Adjust scroll so the same content remains at the center of the viewport
      container.scrollTop = newScrollTop;

      // Recalculate visible range after scale change, then clear the flag
      requestAnimationFrame(() => {
        calculateVisibleRange();
        // Clear the flag after the visible range calculation is complete
        requestAnimationFrame(() => {
          isTransitioningRef.current = false;
        });
      });
    }
  }, [scale, pageHeight, pageGap, totalBorderOffset, singlePageMode, calculateVisibleRange, calculateBorderOffsetForScale]);

  // Sync with external initialPage prop changes (e.g., navigation, toolbar)
  useEffect(() => {
    // Only process if initialPage actually changed from what we tracked
    if (initialPage !== prevInitialPageRef.current) {
      prevInitialPageRef.current = initialPage;

      const targetPage = Math.max(1, Math.min(totalPages, initialPage));

      // In single page mode during swipe animation, currentPage is already updated
      // Only sync if not already on the target page (external navigation like toolbar)
      if (singlePageMode) {
        // Only update if this is a different page (external nav, not our own swipe)
        setCurrentPage(prev => prev !== targetPage ? targetPage : prev);
        setPanOffset({ x: 0, y: 0 });
        return;
      }

      setCurrentPage(targetPage);

      // Reset pan offset when page changes
      setPanOffset({ x: 0, y: 0 });

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
    let isPinching = false;
    let panStartOffset = { x: 0, y: 0 };
    let lastGestureScale = scaleRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Multi-touch: always cancel single-touch tracking to prevent swipe
        isSingleTouch = false;
        isPanning = false;

        if (enablePinchZoom) {
          // Pinch zoom start
          isPinching = true;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          initialDistance = Math.sqrt(dx * dx + dy * dy);
          pinchInitialScale = scaleRef.current;
          lastGestureScale = scaleRef.current;
        }
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
        isPinching = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const rawScale = pinchInitialScale * (distance / initialDistance);
        // Clamp to min/max bounds
        const clampedScale = Math.max(minScale, Math.min(maxScale, rawScale));
        lastGestureScale = clampedScale;
        // Use gestureScale for instant visual feedback (CSS transform, no re-render)
        setGestureScale(clampedScale);
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
      } else if (isSingleTouch && singlePageMode && scaleRef.current <= 1 && e.touches.length === 1) {
        // Swipe navigation with visual feedback when not zoomed
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        // Only start dragging if vertical movement exceeds horizontal
        if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
          e.preventDefault();
          setSwipePhase('dragging');

          const currentPage = initialPageRef.current;
          const atFirstPage = currentPage <= 1;
          const atLastPage = currentPage >= totalPages;

          // Apply rubber-band resistance at boundaries
          let adjustedDelta = deltaY;
          if ((deltaY > 0 && atFirstPage) || (deltaY < 0 && atLastPage)) {
            adjustedDelta = deltaY * SWIPE_RESISTANCE;
          }

          setSwipeOffset(adjustedDelta);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Commit pinch zoom scale on gesture end
      if (isPinching) {
        setGestureScale(null); // Clear gesture scale
        handleZoom(lastGestureScale); // Commit final scale to state
        isPinching = false;
        initialDistance = 0;
        return;
      }

      // Handle swipe navigation with animated transitions
      if (isSingleTouch && singlePageMode && e.changedTouches.length === 1) {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        const currentPage = initialPageRef.current;

        // If zoomed in and was panning, don't navigate
        if (scaleRef.current > 1 || isPanning) {
          initialDistance = 0;
          isSingleTouch = false;
          isPanning = false;
          return;
        }

        const shouldChangePage = Math.abs(deltaY) > SWIPE_THRESHOLD;
        const atFirstPage = currentPage <= 1;
        const atLastPage = currentPage >= totalPages;

        if (shouldChangePage && deltaY > 0 && !atFirstPage) {
          // Swipe down - go to previous page
          const newPage = currentPage - 1;
          const targetOffset = totalPageHeightRef.current + PAGE_GAP;

          // Animate swipe to completion (slide previous page into view)
          setSwipePhase('animating');
          setSwipeOffset(targetOffset);

          // After animation: change page and reset offset instantly
          setTimeout(() => {
            setSwipePhase('idle');
            setCurrentPage(newPage);
            setSwipeOffset(0);
            onPageChange?.(newPage);
            // Reset any native scroll offset that may have accumulated
            container.scrollTop = 0;
          }, ANIMATION_DURATION);

        } else if (shouldChangePage && deltaY < 0 && !atLastPage) {
          // Swipe up - go to next page
          const newPage = currentPage + 1;
          const targetOffset = -(totalPageHeightRef.current + PAGE_GAP);

          // Animate swipe to completion (slide next page into view)
          setSwipePhase('animating');
          setSwipeOffset(targetOffset);

          // After animation: change page and reset offset instantly
          setTimeout(() => {
            setSwipePhase('idle');
            setCurrentPage(newPage);
            setSwipeOffset(0);
            onPageChange?.(newPage);
            // Reset any native scroll offset that may have accumulated
            container.scrollTop = 0;
          }, ANIMATION_DURATION);

        } else {
          // Snap back to center instantly (no animation)
          setSwipeOffset(0);
          setSwipePhase('idle');
          container.scrollTop = 0;
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
  }, [enablePinchZoom, handleZoom, singlePageMode, totalPages, onPageChange, minScale, maxScale]);

  // Reset swipe state when page changes externally (button nav)
  // Skip if we're already animating (our own swipe triggered the page change)
  useEffect(() => {
    if (singlePageMode && swipePhase === 'idle') {
      setSwipeOffset(0);
    }
  }, [initialPage, singlePageMode, swipePhase]);

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
        <MemoizedQuranPage
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
              verseNumberFormat={verseNumberFormat}
              layoutType={layoutType}
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
  // In single page mode, use internal currentPage for immediate updates during swipe
  // The currentPage is synced with initialPage via the effect above
  if (singlePageMode) {
    const displayPage = Math.max(1, Math.min(totalPages, currentPage));
    const scaledPageHeight = pageHeight * scale;
    const scaledPageWidth = pageWidth * scale;

    // During pinch gesture, apply additional scale via CSS transform for instant feedback
    // gestureScale is the target scale, so we compute relative scale from current committed scale
    const isGesturing = gestureScale !== null;
    const gestureTransformScale = isGesturing ? gestureScale / scale : 1;

    // Determine swipe animation state
    const isAnimating = swipePhase === 'animating';
    const isDragging = swipePhase === 'dragging';
    const isSwipeActive = isDragging || isAnimating;

    // Calculate total page height including border for positioning adjacent pages
    const borderOffset = calculateBorderOffsetForScale(scale);
    const totalPageHeight = scaledPageHeight + borderOffset;
    totalPageHeightRef.current = totalPageHeight;

    // Determine which adjacent pages to render during swipe
    const hasPrevPage = displayPage > 1;
    const hasNextPage = displayPage < totalPages;
    const showPrevPage = isSwipeActive && hasPrevPage && swipeOffset > 0;
    const showNextPage = isSwipeActive && hasNextPage && swipeOffset < 0;

    // Helper to render a page with optional border
    const renderPage = (pageNum: number) => {
      const pageContent = (
        <MemoizedQuranPage
          pageNumber={pageNum}
          layoutType={layoutType}
          width={pageWidth}
          scale={scale}
          tajweedEnabled={tajweedEnabled}
          backgroundColor={backgroundColor}
          verseNumberFormat={verseNumberFormat}
          fontScale={fontScale}
          highlightedVerses={highlightedVerses}
          highlightedWords={getHighlightedWordsForPage(pageNum)}
          highlightColor={highlightColor}
          highlightGroups={highlightGroups}
          onWordClick={onWordClick}
          onVerseClick={onVerseClick}
          onWordHover={onWordHover}
        />
      );

      if (showBorder) {
        return (
          <MushafBorder
            pageNumber={pageNum}
            contentWidth={scaledPageWidth}
            contentHeight={scaledPageHeight}
            scale={scale}
            targetFrameHeight={targetFrameHeight}
            borderColor="var(--mushaf-border, #2d5a27)"
            verseNumberFormat={verseNumberFormat}
            layoutType={layoutType}
          >
            {pageContent}
          </MushafBorder>
        );
      }
      return pageContent;
    };

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
          touchAction: 'none', // We handle all touch interactions (swipe, pinch, pan)
          ...style,
        }}
        tabIndex={0}
        role="document"
        aria-label={`Quran viewer - Page ${displayPage} of ${totalPages}`}
      >
        {/* Previous page - positioned above current page */}
        {showPrevPage && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(${panOffset.x}px, ${panOffset.y + swipeOffset - totalPageHeight - PAGE_GAP}px) scale(${gestureTransformScale})`,
              transition: isAnimating
                ? `transform ${ANIMATION_DURATION}ms ease-out`
                : 'none',
              willChange: 'transform',
            }}
          >
            {renderPage(displayPage - 1)}
          </div>
        )}

        {/* Current page */}
        <div
          style={{
            // Apply gesture scale and swipe offset via CSS transform
            transform: `translate(${panOffset.x}px, ${panOffset.y + swipeOffset}px) scale(${gestureTransformScale})`,
            // Transition only during page change animation, none otherwise
            transition: isAnimating
              ? `transform ${ANIMATION_DURATION}ms ease-out`
              : 'none',
            willChange: (isGesturing || swipePhase !== 'idle') ? 'transform' : 'auto',
          }}
        >
          {renderPage(displayPage)}
        </div>

        {/* Next page - positioned below current page */}
        {showNextPage && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(${panOffset.x}px, ${panOffset.y + swipeOffset + totalPageHeight + PAGE_GAP}px) scale(${gestureTransformScale})`,
              transition: isAnimating
                ? `transform ${ANIMATION_DURATION}ms ease-out`
                : 'none',
              willChange: 'transform',
            }}
          >
            {renderPage(displayPage + 1)}
          </div>
        )}
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
