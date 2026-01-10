/**
 * @digitalkhatt/quran-engine - Mushaf Configuration Types
 *
 * Complete configuration system for customizing mushaf appearance
 */

// ============================================
// Main Configuration Interface
// ============================================

/**
 * Complete mushaf configuration for replicating any Quran style
 */
export interface MushafConfig {
  /** Unique identifier for this mushaf style */
  id: string;

  /** Human-readable name */
  name: string;

  /** Layout geometry configuration */
  layout: MushafLayoutConfig;

  /** Border and frame configuration */
  border: MushafBorderConfig;

  /** Verse marker configuration */
  verseMarker: VerseMarkerConfig;

  /** Surah header configuration */
  surahHeader: SurahHeaderConfig;

  /** Tajweed color configuration */
  tajweed: TajweedConfig;

  /** Margin annotations configuration */
  margins: MarginAnnotationConfig;

  /** Word-by-word mode configuration (optional) */
  wordByWord?: WordByWordConfig;

  /** Page spread configuration */
  spread: PageSpreadConfig;

  /** Typography configuration */
  typography: TypographyConfig;
}

// ============================================
// Layout Configuration
// ============================================

export interface MushafLayoutConfig {
  /** Lines per page (most mushafs use 15, but some use 12, 13, or 18) */
  linesPerPage: number;

  /** Page dimensions in internal units */
  pageWidth: number;
  pageHeight: number;

  /** Margins in internal units */
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    /** Inner margin for book binding (gutter) */
    gutter?: number;
  };

  /** Line spacing in internal units */
  interlineSpacing: number;

  /** Default font size in internal units */
  fontSize: number;

  /** Justification style */
  justificationStyle: 'stretch' | 'xscale' | 'kashida' | 'mixed';
}

// ============================================
// Border Configuration
// ============================================

export interface MushafBorderConfig {
  /** Enable border rendering */
  enabled: boolean;

  /** SVG template for the border frame */
  template?: SVGBorderTemplate;

  /** Different borders for odd/even pages (for book spreads) */
  oddPageTemplate?: SVGBorderTemplate;
  evenPageTemplate?: SVGBorderTemplate;

  /** Inner frame around text content area */
  innerFrame?: SVGFrameConfig;

  /** Corner decorations */
  corners?: CornerDecorationConfig;

  /** CSS fallback styles if no SVG template */
  cssStyles?: BorderCSSStyles;
}

export interface SVGBorderTemplate {
  /** SVG content as string or URL to fetch */
  svg: string | URL;

  /** Named slots within the SVG where content can be inserted */
  slots: {
    /** Header slot for surah name, juz info, etc. */
    header?: SlotDefinition;
    /** Footer slot for page number, etc. */
    footer?: SlotDefinition;
    /** Left margin slot for annotations */
    leftMargin?: SlotDefinition;
    /** Right margin slot for annotations */
    rightMargin?: SlotDefinition;
    /** Main content area - REQUIRED */
    content: SlotDefinition;
  };

  /** ViewBox dimensions */
  viewBox: { width: number; height: number };
}

export interface SlotDefinition {
  /** CSS selector or element ID to find the slot */
  selector: string;
  /** Expected content type */
  type: 'text' | 'svg' | 'html';
  /** Default styles for slot content */
  styles?: Record<string, string>;
}

export interface SVGFrameConfig {
  /** SVG path for inner frame */
  path?: string;
  /** Stroke color */
  strokeColor?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Fill color */
  fillColor?: string;
}

export interface CornerDecorationConfig {
  topLeft?: string | URL;
  topRight?: string | URL;
  bottomLeft?: string | URL;
  bottomRight?: string | URL;
  /** Size of corner decorations */
  size?: { width: number; height: number };
}

export interface BorderCSSStyles {
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  boxShadow?: string;
}

// ============================================
// Verse Marker Configuration
// ============================================

export interface VerseMarkerConfig {
  /** Style of verse marker */
  style: 'ornate-frame' | 'simple-circle' | 'colored-circle' | 'inline-number' | 'custom';

  /** SVG template for custom verse marker */
  customSvg?: string | URL;

  /** Number format */
  numberFormat: 'arabic-indic' | 'western' | 'both';

  /** Font for verse numbers */
  font?: {
    family: string;
    size: number;
    weight?: string;
    color?: string;
  };

  /** Positioning within the marker */
  numberPosition?: {
    x: number;
    y: number;
    anchor: 'middle' | 'start' | 'end';
  };

  /** Size of the marker in internal units */
  size: { width: number; height: number };

  /** Colors */
  colors?: {
    frame?: string;
    background?: string;
    number?: string;
  };
}

// ============================================
// Surah Header Configuration
// ============================================

export interface SurahHeaderConfig {
  /** SVG template for surah header decoration */
  template?: string | URL;

  /** Display options */
  display: {
    surahName: boolean;
    surahNumber: boolean;
    revelationType: boolean;
    verseCount: boolean;
    bismillah: 'inline' | 'separate-line' | 'hidden';
  };

  /** Font configuration */
  font?: {
    family: string;
    size: number;
    color?: string;
  };

  /** Height in internal units */
  height: number;

  /** Background style */
  background?: {
    color?: string;
    image?: string | URL;
    repeat?: 'no-repeat' | 'repeat-x';
  };
}

// ============================================
// Tajweed Configuration
// ============================================

export interface TajweedConfig {
  /** Enable tajweed coloring */
  enabled: boolean;

  /** Color palette */
  colors: TajweedColorPalette;

  /** Individual rule toggles */
  rules: TajweedRuleToggles;

  /** School of recitation (affects which rules apply) */
  qiraat?: 'hafs' | 'warsh' | 'qalun' | string;
}

export interface TajweedColorPalette {
  tafkim: string;
  lkalkala: string;
  lgray: string;
  green: string;
  red1: string;
  red2: string;
  red3: string;
  red4: string;
  // Extended colors
  ghunnah?: string;
  idghamBighunnah?: string;
  idghamBillaghunnah?: string;
  ikhfa?: string;
  iqlab?: string;
  madd2?: string;
  madd4?: string;
  madd6?: string;
}

export interface TajweedRuleToggles {
  tafkhim: boolean;
  qalqalah: boolean;
  ghunnah: boolean;
  idgham: boolean;
  ikhfa: boolean;
  iqlab: boolean;
  madd: boolean;
}

// ============================================
// Margin Annotation Configuration
// ============================================

export interface MarginAnnotationConfig {
  /** Enable margin annotations */
  enabled: boolean;

  /** Juz (part) markers */
  juz?: JuzMarkerConfig;

  /** Hizb (60 divisions) markers */
  hizb?: HizbMarkerConfig;

  /** Ruku/Rakaat markers (IndoPak style) */
  ruku?: RukuMarkerConfig;

  /** Manzil (7 divisions) markers */
  manzil?: ManzilMarkerConfig;

  /** Sajdah (prostration) markers */
  sajdah?: SajdahMarkerConfig;
}

export interface JuzMarkerConfig {
  enabled: boolean;
  position: 'left' | 'right' | 'header';
  svg?: string | URL;
  font?: FontConfig;
  displayFormat: 'number' | 'name' | 'both';
}

export interface HizbMarkerConfig {
  enabled: boolean;
  position: 'left' | 'right' | 'header';
  svg?: string | URL;
  showQuarters: boolean;
}

export interface RukuMarkerConfig {
  enabled: boolean;
  position: 'left' | 'right';
  svg?: string | URL;
  font?: FontConfig;
}

export interface ManzilMarkerConfig {
  enabled: boolean;
  position: 'left' | 'right' | 'header';
  svg?: string | URL;
}

export interface SajdahMarkerConfig {
  enabled: boolean;
  style: 'underline' | 'symbol' | 'both';
  svg?: string | URL;
  color?: string;
}

// ============================================
// Word-by-Word Configuration
// ============================================

export interface WordByWordConfig {
  /** Enable word-by-word mode */
  enabled: boolean;

  /** Translation languages to display */
  translations: WordTranslationConfig[];

  /** Layout options */
  layout: WordByWordLayoutConfig;

  /** Arabic text styling */
  arabic: WordTextStyle;

  /** Transliteration styling */
  transliteration?: TransliterationConfig;
}

export interface WordTranslationConfig {
  /** Language code (e.g., 'en', 'ur', 'id') */
  language: string;
  /** Display name */
  displayName?: string;
  /** Translation data source (URL or inline) */
  data: WordTranslationData | string;
  /** Display styling */
  style: WordTextStyle;
}

export interface WordTranslationData {
  /** Map from "surah:ayah:wordIndex" to translation text */
  translations: Record<string, string>;
  /** Optional transliterations */
  transliterations?: Record<string, string>;
}

export interface WordByWordLayoutConfig {
  /** How to arrange word components */
  arrangement: 'vertical' | 'horizontal';
  /** Spacing between word stacks */
  wordSpacing: number;
  /** Spacing between components (Arabic, transliteration, translation) */
  componentSpacing: number;
  /** Words per row */
  wordsPerRow?: number;
  /** Row-based coloring for visual grouping */
  rowColoring?: RowColoringConfig;
}

export interface RowColoringConfig {
  enabled: boolean;
  colors: string[];
  groupBy: 'verse' | 'phrase' | 'word-count';
  wordsPerGroup?: number;
}

export interface WordTextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: string;
}

export interface TransliterationConfig {
  enabled: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
}

// ============================================
// Page Spread Configuration
// ============================================

export interface PageSpreadConfig {
  /** Default view mode */
  defaultMode: 'single' | 'double' | 'auto';

  /** Auto mode breakpoint (switch to single below this width) */
  autoBreakpoint?: number;

  /** Double page (spread) settings */
  spread?: SpreadSettings;
}

export interface SpreadSettings {
  /** Gutter width between pages */
  gutterWidth: number;
  /** Shared header/footer across spread */
  sharedHeader: boolean;
  sharedFooter: boolean;
  /** Which page is on the right (for RTL books, odd pages are usually on left) */
  rightPageParity: 'odd' | 'even';
  /** Gap between pages in spread view */
  pageGap: number;
}

// ============================================
// Typography Configuration
// ============================================

export interface TypographyConfig {
  /** Primary font for Quran text */
  primaryFont: FontConfig;

  /** Secondary font for headers, numbers */
  secondaryFont?: FontConfig;

  /** Translation font */
  translationFont?: FontConfig;

  /** Default text color */
  textColor: string;

  /** Background color */
  backgroundColor: string;

  /** Text direction */
  direction: 'rtl' | 'ltr';

  /** Line height multiplier */
  lineHeightMultiplier: number;
}

export interface FontConfig {
  family: string;
  size: number;
  weight?: string | number;
  style?: 'normal' | 'italic';
  color?: string;
}

// ============================================
// Utility Types
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type MushafConfigOverrides = DeepPartial<MushafConfig>;
