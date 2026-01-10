/**
 * DigitalKhatt React - Library Exports
 *
 * A React component library for rendering Quran text with proper
 * Arabic typography using the DigitalKhatt engine.
 * Now uses SVG rendering via @digitalkhatt/quran-engine.
 */

// Import CSS styles from quran-engine
import '@digitalkhatt/quran-engine/styles/quran-renderer.css';

// ============================================
// Core Types - Re-export from quran-engine
// ============================================
export type {
  MushafLayoutType,
  MushafLayoutTypeString,
  LineType,
  SpaceType,
  HBFeature,
  GlyphInformation,
  SubWordInfo,
  WordInfo,
  LineTextInfo,
  TextFontFeature,
  JustResultByLine,
  JustStyle,
  SajdaInfo,
  LineInfo,
  QuranOutlineItem,
  QuranTextData,
  VerseRef,
  WordRef,
  WordRect,
  LineRect,
  PageFormat,
  RenderResult,
  LoadingStatus,
  SVGPageRenderOptions,
  SVGWordClickInfo,
  SVGHighlightGroup,
  PageRenderResult,
  VerseNumberFormat,
  VerseWordMapping,
  WordPosition,
  GlyphBounds,
  GlyphPathWithBounds,
  TajweedClass,
  TajweedColorConfig,
  RendererEngineType,
  // Mushaf configuration types
  MushafConfig,
  MushafConfigOverrides,
  MushafLayoutConfig,
  MushafBorderConfig,
  VerseMarkerConfig,
  SurahHeaderConfig,
  TajweedConfig,
  MarginAnnotationConfig,
  WordByWordConfig,
  PageSpreadConfig,
  TypographyConfig,
  FontConfig,
} from '@digitalkhatt/quran-engine';

// Local types that extend quran-engine
export type {
  WordClickInfo,
  VerseClickInfo,
  HighlightStyle,
  HighlightGroup,
} from './core/types';

export {
  LAYOUT_TYPE_MAP,
  PAGE_WIDTH,
  INTERLINE,
  TOP,
  MARGIN,
  FONTSIZE,
} from './core/types';

// ============================================
// Core Services - Re-export from quran-engine
// ============================================
export {
  loadHarfbuzz,
  loadAndCacheFont,
  harfbuzzFonts,
  HarfBuzzExports,
  HarfBuzzBlob,
  HarfBuzzFace,
  HarfBuzzFont,
  HarfBuzzBuffer,
  shape,
  getWidth,
  QuranTextService,
  createQuranTextService,
  loadQuranTextService,
  applyTajweedByPage,
  DEFAULT_TAJWEED_COLORS,
  mergeTajweedColors,
  generateTajweedCSS,
  generateTajweedCSSVariables,
  generateTajweedCSSWithVariables,
  justifyLine,
  analyzeLineForJust,
  buildVerseMapping,
  getVerseForWord,
  getWordsForVerse,
  getWordsForVerses,
  isAyahMarker,
  SVGPageRenderer,
  SVGLineRenderer,
  CSSPageRenderer,
  JustStyleEnum,
  // Mushaf configuration utilities
  getMushafPreset,
  getAvailablePresets,
  extendPreset,
  createMushafConfig,
  legacyLayoutToConfig,
  // Engine utilities
  ENGINE_LAYOUT_COMPATIBILITY,
  ENGINE_DISPLAY_NAMES,
  isEngineCompatibleWithLayout,
  getAvailableEnginesForLayout,
} from '@digitalkhatt/quran-engine';

// ============================================
// React Components
// ============================================
export { QuranProvider } from './components/QuranProvider';
export type { QuranProviderConfig, QuranProviderProps, DigitalKhattContextValue } from './components/QuranProvider';

export { QuranPage } from './components/QuranPage';
export type { QuranPageProps } from './components/QuranPage';

export { QuranViewer } from './components/QuranViewer';
export type { QuranViewerProps, QuranViewerRef } from './components/QuranViewer';

export { QuranSpread } from './components/QuranSpread';
export type { QuranSpreadProps, QuranSpreadRef, SpreadMode, ReadingDirection } from './components/QuranSpread';

// ============================================
// React Hooks
// ============================================
export { useDigitalKhatt } from './components/QuranProvider';
export { useTajweedColors } from './hooks/useTajweedColors';
export type { TajweedColorInfo, UseTajweedColorsReturn } from './hooks/useTajweedColors';
export { useMushafConfig } from './hooks/useMushafConfig';
export type { UseMushafConfigOptions, UseMushafConfigReturn } from './hooks/useMushafConfig';
