/**
 * QuranPage - React component for rendering a single Quran page
 *
 * Supports multiple rendering engines via @digitalkhatt/quran-engine:
 * - harfbuzz-svg: SVG-based rendering (default)
 * - harfbuzz-css: CSS-based DOM rendering
 * - precomputed: Canvas-based rendering (not yet implemented in React)
 */

import React, { useRef, useEffect, useLayoutEffect, useCallback, useMemo, useState } from 'react';
import type {
  MushafLayoutType,
  MushafLayoutTypeString,
  WordClickInfo,
  VerseClickInfo,
  PageFormat,
  HighlightGroup,
  RendererEngineType,
} from '../core/types';
import { LAYOUT_TYPE_MAP, PAGE_WIDTH } from '../core/types';
import { useDigitalKhatt } from './QuranProvider';
import type { SVGWordClickInfo, SVGHighlightGroup, VerseNumberFormat, CSSWordClickInfo, CSSHighlightGroup } from '@digitalkhatt/quran-engine';
import { JustStyleEnum, getWordsForVerse } from '@digitalkhatt/quran-engine';
import { AyaGlyph, getAyaSvgGroup } from './AyaGlyph';

// Note: CSS styles are imported in lib/index.ts from @digitalkhatt/quran-engine/styles/quran-renderer.css

// ============================================
// Types
// ============================================

export interface QuranPageProps {
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Mushaf layout type */
  layoutType: MushafLayoutTypeString;

  // Dimensions
  /** Page width in pixels (default: 400) */
  width?: number;
  /** Scale factor (default: 1) */
  scale?: number;

  // Styling
  /** Enable Tajweed coloring (default: true) */
  tajweedEnabled?: boolean;
  /** Page background color */
  backgroundColor?: string;
  /** Verse number format (default: 'arabic') */
  verseNumberFormat?: VerseNumberFormat;
  /** Font scale factor (0.5 to 1.2, default: 0.75) */
  fontScale?: number;

  // Highlighting
  /** Verses to highlight (single color, uses highlightColor) */
  highlightedVerses?: Array<{ surah: number; ayah: number }>;
  /** Words to highlight (single color, uses highlightColor) */
  highlightedWords?: Array<{ line: number; word: number }>;
  /** Highlight background color (used for highlightedVerses and highlightedWords) */
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
  /** Called when rendering completes */
  onRenderComplete?: () => void;

  // Accessibility
  /** Enable hidden text for screen readers (default: true) */
  enableAccessibility?: boolean;
  /** Custom aria-label */
  ariaLabel?: string;

  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

// ============================================
// Component
// ============================================

export function QuranPage({
  pageNumber,
  layoutType,
  width = 400,
  scale = 1,
  tajweedEnabled = true,
  backgroundColor,
  verseNumberFormat = 'arabic',
  fontScale,
  highlightedVerses = [],
  highlightedWords = [],
  highlightColor = 'rgba(255, 255, 0, 0.3)',
  highlightGroups = [],
  onWordClick,
  onVerseClick,
  // onWordHover - TODO: implement hover support for SVG
  onRenderComplete,
  enableAccessibility = true,
  ariaLabel,
  className,
  style,
}: QuranPageProps) {
  // Container ref for DOM injection
  const containerRef = useRef<HTMLDivElement>(null);
  // Store word elements for highlighting
  const wordElementsRef = useRef<Map<string, SVGElement | HTMLElement> | null>(null);
  // Track if aya glyph SVG is mounted
  const [ayaGlyphMounted, setAyaGlyphMounted] = useState(false);

  const { status, isReady, getTextService, getVerseMapping, getSVGPageRenderer, getCSSPageRenderer, applyTajweed, engineType, fontScale: contextFontScale } = useDigitalKhatt();

  // Effect to detect when AyaGlyph is mounted
  // Reset to false first when layoutType changes, then set to true after DOM is ready
  useEffect(() => {
    setAyaGlyphMounted(false);
    // Small delay to ensure DOM is ready with new AyaGlyph
    const timer = setTimeout(() => {
      setAyaGlyphMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [layoutType]);

  // Convert layout type string to enum
  const mushafType: MushafLayoutType = LAYOUT_TYPE_MAP[layoutType];

  // Use prop fontScale if provided, otherwise use context
  const effectiveFontScale = fontScale ?? contextFontScale;

  // Calculate viewport dimensions
  const viewport: PageFormat = useMemo(() => {
    // Default page dimensions based on PAGE_WIDTH and aspect ratio
    const pageHeight = (width * 410) / 255; // Maintain aspect ratio
    const fontSize = (width / PAGE_WIDTH) * 1000; // Scale font size
    return {
      width: width * scale,
      height: pageHeight * scale,
      fontSize: fontSize * scale * effectiveFontScale,
    };
  }, [width, scale, effectiveFontScale]);

  // Get text service, verse mapping, and renderers
  const textService = useMemo(() => getTextService(mushafType), [getTextService, mushafType]);
  const verseMapping = useMemo(() => getVerseMapping(mushafType), [getVerseMapping, mushafType]);
  const svgRenderer = useMemo(() => getSVGPageRenderer(mushafType), [getSVGPageRenderer, mushafType]);
  const cssRenderer = useMemo(() => getCSSPageRenderer(mushafType), [getCSSPageRenderer, mushafType]);

  // Determine which renderer to use based on engine type
  const currentEngineType: RendererEngineType = engineType;
  const usesSVGEngine = currentEngineType === 'harfbuzz-svg';
  const useCSSEngine = currentEngineType === 'harfbuzz-css';

  // Convert highlightGroups and legacy props to SVG highlight format
  const svgHighlightGroups = useMemo((): SVGHighlightGroup[] => {
    const pageIndex = pageNumber - 1;
    const groups: SVGHighlightGroup[] = [];

    // Process highlightGroups prop
    for (const group of highlightGroups) {
      const words: Array<{ page: number; line: number; word: number }> = [];

      // Add words from verses
      if (group.verses && verseMapping) {
        for (const verse of group.verses) {
          const verseWords = getWordsForVerse(verseMapping, verse.surah, verse.ayah);
          for (const w of verseWords) {
            if (w.page === pageIndex) {
              words.push({ page: pageIndex, line: w.line, word: w.word });
            }
          }
        }
      }

      // Add direct word references
      if (group.words) {
        for (const w of group.words) {
          if (w.page === pageIndex) {
            words.push({ page: pageIndex, line: w.line, word: w.word });
          }
        }
      }

      if (words.length > 0) {
        groups.push({ words, color: group.color });
      }
    }

    // Process legacy highlightedVerses prop
    if (highlightedVerses.length > 0 && verseMapping) {
      const words: Array<{ page: number; line: number; word: number }> = [];
      for (const verse of highlightedVerses) {
        const verseWords = getWordsForVerse(verseMapping, verse.surah, verse.ayah);
        for (const w of verseWords) {
          if (w.page === pageIndex) {
            words.push({ page: pageIndex, line: w.line, word: w.word });
          }
        }
      }
      if (words.length > 0) {
        groups.push({ words, color: highlightColor });
      }
    }

    // Process legacy highlightedWords prop
    if (highlightedWords.length > 0) {
      const words = highlightedWords.map((w) => ({ page: pageIndex, line: w.line, word: w.word }));
      groups.push({ words, color: highlightColor });
    }

    return groups;
  }, [pageNumber, highlightGroups, highlightedVerses, highlightedWords, highlightColor, verseMapping]);

  // Handle word click from SVGPageRenderer
  const handleSVGWordClick = useCallback(
    (info: SVGWordClickInfo) => {
      // Get verse reference for this word from verse mapping
      let surah: number | undefined;
      let ayah: number | undefined;

      if (verseMapping) {
        const key = `${info.pageIndex}:${info.lineIndex}:${info.wordIndex}`;
        const verseRef = verseMapping.wordToVerse.get(key);
        if (verseRef) {
          surah = verseRef.surah;
          ayah = verseRef.ayah;
        }
      }

      // Create WordClickInfo
      const wordClickInfo: WordClickInfo = {
        pageNumber,
        lineIndex: info.lineIndex,
        wordIndex: info.wordIndex,
        text: info.text,
        surah,
        ayah,
      };

      // Fire word click
      onWordClick?.(wordClickInfo);

      // Fire verse click if word has verse info
      if (onVerseClick && surah !== undefined && ayah !== undefined) {
        onVerseClick({
          surah,
          ayah,
          pageNumber,
        });
      }
    },
    [pageNumber, verseMapping, onWordClick, onVerseClick]
  );

  // Handle word click from CSSPageRenderer
  const handleCSSWordClick = useCallback(
    (info: CSSWordClickInfo) => {
      // Get verse reference for this word from verse mapping
      let surah: number | undefined;
      let ayah: number | undefined;

      if (verseMapping) {
        const key = `${info.pageIndex}:${info.lineIndex}:${info.wordIndex}`;
        const verseRef = verseMapping.wordToVerse.get(key);
        if (verseRef) {
          surah = verseRef.surah;
          ayah = verseRef.ayah;
        }
      }

      // Create WordClickInfo
      const wordClickInfo: WordClickInfo = {
        pageNumber,
        lineIndex: info.lineIndex,
        wordIndex: info.wordIndex,
        text: info.text,
        surah,
        ayah,
      };

      // Fire word click
      onWordClick?.(wordClickInfo);

      // Fire verse click if word has verse info
      if (onVerseClick && surah !== undefined && ayah !== undefined) {
        onVerseClick({
          surah,
          ayah,
          pageNumber,
        });
      }
    },
    [pageNumber, verseMapping, onWordClick, onVerseClick]
  );

  // Render content into container (supports both SVG and CSS engines)
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !isReady || !textService) {
      return;
    }

    // Check if required renderer is available
    const renderer = usesSVGEngine ? svgRenderer : cssRenderer;
    if (!renderer) {
      return;
    }

    // For SVG engine, wait for AyaGlyph to be mounted
    if (usesSVGEngine && !ayaGlyphMounted) {
      return;
    }

    const pageIndex = pageNumber - 1;

    // Validate page index
    if (pageIndex < 0 || pageIndex >= textService.nbPages) {
      console.warn(`Invalid page number: ${pageNumber}`);
      return;
    }

    // Clear previous content
    while (container.firstChild) {
      container.removeChild(container.lastChild!);
    }
    wordElementsRef.current = null;

    if (usesSVGEngine && svgRenderer) {
      // SVG Engine rendering
      const ayaSvgGroup = getAyaSvgGroup();

      const result = svgRenderer.renderPage(pageIndex, viewport, {
        tajweedEnabled,
        verseNumberFormat,
        justStyle: JustStyleEnum.XScale,
        applyTajweed: (pi: number) => applyTajweed(mushafType, pi),
        enableWordClick: !!(onWordClick || onVerseClick),
        onWordClick: handleSVGWordClick,
        ayaSvgGroup,
      });

      // Append line elements to container
      for (const lineElement of result.lineElements) {
        container.appendChild(lineElement);
      }

      // Store word elements for highlighting
      wordElementsRef.current = result.wordElements || null;
    } else if (useCSSEngine && cssRenderer) {
      // CSS Engine rendering
      const result = cssRenderer.renderPage(pageIndex, viewport, {
        tajweedEnabled,
        enableWordClick: !!(onWordClick || onVerseClick),
        onWordClick: handleCSSWordClick,
        justStyle: JustStyleEnum.XScale,
        applyTajweed: (pi: number) => applyTajweed(mushafType, pi),
      });

      // Append line elements to container
      for (const lineElement of result.lineElements) {
        container.appendChild(lineElement);
      }

      // Apply width corrections after elements are rendered
      // Use requestAnimationFrame to ensure browser has completed layout
      requestAnimationFrame(() => {
        cssRenderer.applyWidthCorrections(result.lineElements, viewport, pageIndex);
      });

      // Store word elements for highlighting
      wordElementsRef.current = result.wordElements || null;
    }

    // Notify completion
    onRenderComplete?.();

    // Cleanup function
    return () => {
      while (container.firstChild) {
        container.removeChild(container.lastChild!);
      }
      wordElementsRef.current = null;
    };
  }, [
    isReady,
    svgRenderer,
    cssRenderer,
    usesSVGEngine,
    useCSSEngine,
    textService,
    pageNumber,
    viewport,
    tajweedEnabled,
    verseNumberFormat,
    mushafType,
    applyTajweed,
    onWordClick,
    onVerseClick,
    handleSVGWordClick,
    handleCSSWordClick,
    onRenderComplete,
    ayaGlyphMounted,
  ]);

  // Apply highlights when highlightGroups change
  useEffect(() => {
    if (!wordElementsRef.current) {
      return;
    }

    const pageIndex = pageNumber - 1;

    // Use appropriate renderer to apply highlights
    if (usesSVGEngine && svgRenderer) {
      svgRenderer.applyHighlights(wordElementsRef.current as Map<string, SVGElement>, svgHighlightGroups, pageIndex);
    } else if (useCSSEngine && cssRenderer) {
      // CSS renderer uses the same highlight format
      cssRenderer.applyHighlights(wordElementsRef.current as Map<string, HTMLElement>, svgHighlightGroups as CSSHighlightGroup[], pageIndex);
    }
  }, [svgHighlightGroups, svgRenderer, cssRenderer, usesSVGEngine, useCSSEngine, pageNumber]);

  // Loading state
  if (status === 'loading') {
    return (
      <div
        className={className}
        style={{
          width: viewport.width,
          height: viewport.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor || '#f5f5f5',
          ...style,
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div
        className={className}
        style={{
          width: viewport.width,
          height: viewport.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffeeee',
          color: '#cc0000',
          ...style,
        }}
      >
        <span>Error loading Quran engine</span>
      </div>
    );
  }

  // Not ready yet - check for appropriate renderer based on engine type
  const rendererReady = usesSVGEngine ? !!svgRenderer : useCSSEngine ? !!cssRenderer : false;
  if (!isReady || !rendererReady || !textService) {
    return (
      <div
        className={className}
        style={{
          width: viewport.width,
          height: viewport.height,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={`quran-page layout-${layoutType} engine-${currentEngineType} ${className || ''}`}
      style={{
        position: 'relative',
        width: viewport.width,
        height: viewport.height,
        backgroundColor,
        fontSize: viewport.fontSize,
        ...style,
      }}
      aria-label={ariaLabel || `Quran page ${pageNumber}`}
      role="img"
    >
      {/* Hidden SVG element for verse number frames (Madinah layouts) - only needed for SVG engine */}
      {usesSVGEngine && <AyaGlyph layoutType={layoutType} />}

      {/* Container for SVG line elements */}
      <div
        ref={containerRef}
        className="quran-page-content"
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Accessibility: Hidden text for screen readers */}
      {enableAccessibility && textService && (
        <div
          className="sr-only"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
          role="article"
          aria-label={`Quran page ${pageNumber} text content`}
        >
          {textService.quranText[pageNumber - 1]?.map((line, lineIndex) => (
            <p key={lineIndex}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuranPage;
