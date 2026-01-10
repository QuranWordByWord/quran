/**
 * QuranProvider - React Context Provider for DigitalKhatt Engine
 *
 * Handles initialization of HarfBuzz WASM, font loading, and Quran text services.
 * Provides SVG and CSS rendering support via @digitalkhatt/quran-engine.
 * Supports runtime switching between rendering engines.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { MushafLayoutType, LoadingStatus, TajweedColorConfig, RendererEngineType, MushafLayoutTypeString } from '../core/types';
import {
  loadHarfbuzz,
  loadAndCacheFont,
  harfbuzzFonts,
  HarfBuzzFont,
  SVGPageRenderer,
  CSSPageRenderer,
  QuranTextService,
  createQuranTextService,
  loadQuranTextService,
  buildVerseMapping,
  applyTajweedByPage,
  mergeTajweedColors,
  isEngineCompatibleWithLayout,
  getAvailableEnginesForLayout,
  ENGINE_DISPLAY_NAMES,
} from '@digitalkhatt/quran-engine';
import type { VerseWordMapping, TajweedClass } from '@digitalkhatt/quran-engine';

// ============================================
// Types
// ============================================

export interface QuranProviderConfig {
  /** URL to HarfBuzz WASM file */
  wasmUrl: string;
  /** Font URLs by mushaf type */
  fonts: {
    newMadinah?: string;
    oldMadinah?: string;
    indoPak15?: string;
  };
  /** Quran text data or URLs by mushaf type */
  quranText?: {
    newMadinah?: string[][] | string;
    oldMadinah?: string[][] | string;
    indoPak15?: string[][] | string;
  };
  /** Custom tajweed colors (partial override of defaults) */
  tajweedColors?: TajweedColorConfig;
}

export interface DigitalKhattContextValue {
  /** Current loading status */
  status: LoadingStatus;
  /** Error if loading failed */
  error: Error | null;
  /** Whether engine is ready to use */
  isReady: boolean;
  /** Get font for a mushaf layout type */
  getFont: (layoutType: MushafLayoutType) => HarfBuzzFont | null;
  /** Get text service for a mushaf layout type */
  getTextService: (layoutType: MushafLayoutType) => QuranTextService | null;
  /** Get verse mapping for a mushaf layout type */
  getVerseMapping: (layoutType: MushafLayoutType) => VerseWordMapping | null;
  /** Get SVG page renderer for a mushaf layout type */
  getSVGPageRenderer: (layoutType: MushafLayoutType) => SVGPageRenderer | null;
  /** Get CSS page renderer for a mushaf layout type */
  getCSSPageRenderer: (layoutType: MushafLayoutType) => CSSPageRenderer | null;
  /** Apply tajweed coloring for a page, returns array of Maps (one per line) */
  applyTajweed: (layoutType: MushafLayoutType, pageIndex: number) => Array<Map<number, string>>;
  /** Available layout types */
  availableLayouts: MushafLayoutType[];
  /** Current tajweed colors (merged with defaults) */
  tajweedColors: Record<TajweedClass, string>;
  /** Update tajweed colors dynamically */
  setTajweedColors: (colors: TajweedColorConfig) => void;

  // Engine management
  /** Current rendering engine type */
  engineType: RendererEngineType;
  /** Set the rendering engine type */
  setEngineType: (type: RendererEngineType) => void;
  /** Get available engines for a layout type */
  getAvailableEngines: (layout: MushafLayoutTypeString) => RendererEngineType[];
  /** Check if an engine is compatible with a layout */
  isEngineAvailable: (engine: RendererEngineType, layout: MushafLayoutTypeString) => boolean;
  /** Engine display names for UI */
  engineDisplayNames: Record<RendererEngineType, string>;

  // Font scale management
  /** Current font scale (0.5 to 1.2, default 0.75) */
  fontScale: number;
  /** Set the font scale */
  setFontScale: (scale: number) => void;
}

// ============================================
// Context
// ============================================

const DigitalKhattContext = createContext<DigitalKhattContextValue | null>(null);

// ============================================
// Font name mapping
// ============================================

const FONT_NAMES: Record<MushafLayoutType, string> = {
  1: 'madina',      // NewMadinah
  2: 'oldmadina',   // OldMadinah
  3: 'indopak',     // IndoPak15Lines
};

// ============================================
// Provider Component
// ============================================

export interface QuranProviderProps extends QuranProviderConfig {
  children: React.ReactNode;
}

export function QuranProvider({ wasmUrl, fonts: fontUrls, quranText, tajweedColors: initialTajweedColors, children }: QuranProviderProps) {
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [loadedFonts, setLoadedFonts] = useState<Map<MushafLayoutType, HarfBuzzFont>>(new Map());
  const [textServices, setTextServices] = useState<Map<MushafLayoutType, QuranTextService>>(new Map());
  const [verseMappings, setVerseMappings] = useState<Map<MushafLayoutType, VerseWordMapping>>(new Map());
  const [svgRenderers, setSvgRenderers] = useState<Map<MushafLayoutType, SVGPageRenderer>>(new Map());
  const [cssRenderers, setCssRenderers] = useState<Map<MushafLayoutType, CSSPageRenderer>>(new Map());
  const [availableLayouts, setAvailableLayouts] = useState<MushafLayoutType[]>([]);
  const [customTajweedColors, setCustomTajweedColors] = useState<TajweedColorConfig>(initialTajweedColors || {});
  const [engineType, setEngineTypeState] = useState<RendererEngineType>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('digitalkhatt-engine');
      if (stored && (stored === 'harfbuzz-svg' || stored === 'harfbuzz-css' || stored === 'precomputed')) {
        return stored;
      }
    }
    return 'harfbuzz-svg';
  });

  // Persist engine type to localStorage
  const setEngineType = useCallback((type: RendererEngineType) => {
    setEngineTypeState(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem('digitalkhatt-engine', type);
    }
  }, []);

  // Font scale state (0.5 to 1.2, default 0.75)
  const [fontScale, setFontScaleState] = useState<number>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('digitalkhatt-fontScale');
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 1.2) {
          return parsed;
        }
      }
    }
    return 0.75;
  });

  // Persist font scale to localStorage
  const setFontScale = useCallback((scale: number) => {
    const clamped = Math.max(0.5, Math.min(1.2, scale));
    setFontScaleState(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem('digitalkhatt-fontScale', String(clamped));
    }
  }, []);

  // Merged tajweed colors
  const tajweedColors = useMemo(
    () => mergeTajweedColors(customTajweedColors),
    [customTajweedColors]
  );

  // Apply CSS variables for tajweed colors
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(tajweedColors).forEach(([key, value]) => {
      root.style.setProperty(`--tajweed-${key}`, value);
    });
  }, [tajweedColors]);

  // Update tajweed colors dynamically
  const setTajweedColors = useCallback((colors: TajweedColorConfig) => {
    setCustomTajweedColors(prev => ({ ...prev, ...colors }));
  }, []);

  // Initialize engine
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setStatus('loading');
      setError(null);

      try {
        // 1. Load HarfBuzz WASM
        await loadHarfbuzz(wasmUrl);

        if (cancelled) return;

        // 2. Load fonts
        const fontsMap = new Map<MushafLayoutType, HarfBuzzFont>();
        const loadedLayouts: MushafLayoutType[] = [];

        const fontEntries: Array<[MushafLayoutType, string]> = [];
        if (fontUrls.newMadinah) fontEntries.push([1, fontUrls.newMadinah]);
        if (fontUrls.oldMadinah) fontEntries.push([2, fontUrls.oldMadinah]);
        if (fontUrls.indoPak15) fontEntries.push([3, fontUrls.indoPak15]);

        await Promise.all(
          fontEntries.map(async ([layoutType, fontUrl]) => {
            const fontName = FONT_NAMES[layoutType];
            const font = await loadAndCacheFont(fontName, fontUrl);
            fontsMap.set(layoutType, font);
            loadedLayouts.push(layoutType);
          })
        );

        if (cancelled) return;

        setLoadedFonts(fontsMap);

        // 3. Load Quran text services
        const loadedTextServices = new Map<MushafLayoutType, QuranTextService>();

        if (quranText) {
          const textEntries: Array<[MushafLayoutType, string[][] | string]> = [];
          if (quranText.newMadinah) textEntries.push([1, quranText.newMadinah]);
          if (quranText.oldMadinah) textEntries.push([2, quranText.oldMadinah]);
          if (quranText.indoPak15) textEntries.push([3, quranText.indoPak15]);

          await Promise.all(
            textEntries.map(async ([layoutType, textData]) => {
              let service: QuranTextService;
              if (typeof textData === 'string') {
                // Load from URL
                service = await loadQuranTextService(textData, layoutType);
              } else {
                // Use provided data
                service = createQuranTextService(textData, layoutType);
              }
              loadedTextServices.set(layoutType, service);
            })
          );
        }

        if (cancelled) return;

        setTextServices(loadedTextServices);

        // 4. Build verse mappings for each text service
        const mappings = new Map<MushafLayoutType, VerseWordMapping>();
        for (const [layoutType, service] of loadedTextServices) {
          const mapping = buildVerseMapping(service);
          mappings.set(layoutType, mapping);
        }

        if (cancelled) return;

        setVerseMappings(mappings);

        // 5. Create SVG page renderers for each layout
        const svgRenderersMap = new Map<MushafLayoutType, SVGPageRenderer>();
        for (const [layoutType, font] of fontsMap) {
          const textService = loadedTextServices.get(layoutType);
          if (textService) {
            const renderer = new SVGPageRenderer({
              font,
              textService,
              mushafType: layoutType,
            });
            svgRenderersMap.set(layoutType, renderer);
          }
        }

        if (cancelled) return;

        setSvgRenderers(svgRenderersMap);

        // 6. Create CSS page renderers for each layout
        const cssRenderersMap = new Map<MushafLayoutType, CSSPageRenderer>();
        for (const [layoutType, font] of fontsMap) {
          const textService = loadedTextServices.get(layoutType);
          if (textService) {
            const renderer = new CSSPageRenderer({
              font,
              textService,
              mushafType: layoutType,
            });
            cssRenderersMap.set(layoutType, renderer);
          }
        }

        if (cancelled) return;

        setCssRenderers(cssRenderersMap);
        setAvailableLayouts(loadedLayouts);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [wasmUrl, fontUrls, quranText]);

  // Get font by layout type
  const getFont = useCallback(
    (layoutType: MushafLayoutType): HarfBuzzFont | null => {
      return loadedFonts.get(layoutType) || harfbuzzFonts.get(FONT_NAMES[layoutType]) || null;
    },
    [loadedFonts]
  );

  // Get text service by layout type
  const getTextService = useCallback(
    (layoutType: MushafLayoutType): QuranTextService | null => {
      return textServices.get(layoutType) || null;
    },
    [textServices]
  );

  // Get verse mapping by layout type
  const getVerseMapping = useCallback(
    (layoutType: MushafLayoutType): VerseWordMapping | null => {
      return verseMappings.get(layoutType) || null;
    },
    [verseMappings]
  );

  // Get SVG page renderer by layout type
  const getSVGPageRenderer = useCallback(
    (layoutType: MushafLayoutType): SVGPageRenderer | null => {
      return svgRenderers.get(layoutType) || null;
    },
    [svgRenderers]
  );

  // Get CSS page renderer by layout type
  const getCSSPageRenderer = useCallback(
    (layoutType: MushafLayoutType): CSSPageRenderer | null => {
      return cssRenderers.get(layoutType) || null;
    },
    [cssRenderers]
  );

  // Get available engines for a layout
  const getAvailableEngines = useCallback(
    (layout: MushafLayoutTypeString): RendererEngineType[] => {
      return getAvailableEnginesForLayout(layout);
    },
    []
  );

  // Check if an engine is available for a layout
  const isEngineAvailable = useCallback(
    (engine: RendererEngineType, layout: MushafLayoutTypeString): boolean => {
      return isEngineCompatibleWithLayout(engine, layout);
    },
    []
  );

  // Apply tajweed coloring for a page
  const applyTajweed = useCallback(
    (layoutType: MushafLayoutType, pageIndex: number): Array<Map<number, string>> => {
      const textService = textServices.get(layoutType);
      if (!textService) {
        return [];
      }
      return applyTajweedByPage(textService, pageIndex);
    },
    [textServices]
  );

  // Context value
  const contextValue = useMemo<DigitalKhattContextValue>(
    () => ({
      status,
      error,
      isReady: status === 'ready',
      getFont,
      getTextService,
      getVerseMapping,
      getSVGPageRenderer,
      getCSSPageRenderer,
      applyTajweed,
      availableLayouts,
      tajweedColors,
      setTajweedColors,
      // Engine management
      engineType,
      setEngineType,
      getAvailableEngines,
      isEngineAvailable,
      engineDisplayNames: ENGINE_DISPLAY_NAMES,
      // Font scale management
      fontScale,
      setFontScale,
    }),
    [status, error, getFont, getTextService, getVerseMapping, getSVGPageRenderer, getCSSPageRenderer, applyTajweed, availableLayouts, tajweedColors, setTajweedColors, engineType, getAvailableEngines, isEngineAvailable, fontScale, setFontScale]
  );

  return <DigitalKhattContext.Provider value={contextValue}>{children}</DigitalKhattContext.Provider>;
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access the DigitalKhatt context
 */
export function useDigitalKhatt(): DigitalKhattContextValue {
  const context = useContext(DigitalKhattContext);
  if (!context) {
    throw new Error('useDigitalKhatt must be used within a QuranProvider');
  }
  return context;
}

export { DigitalKhattContext };
