/**
 * @digitalkhatt/quran-engine - Mushaf Presets
 *
 * Default configurations for common mushaf styles
 */

import type { MushafConfig, MushafConfigOverrides } from './mushaf-config';

// ============================================
// Default Values
// ============================================

const DEFAULT_LAYOUT = {
  linesPerPage: 15,
  pageWidth: 17000,
  pageHeight: 27000,
  margins: { top: 200, bottom: 200, left: 400, right: 400 },
  interlineSpacing: 1800,
  fontSize: 1000,
  justificationStyle: 'xscale' as const,
};

const DEFAULT_TAJWEED_COLORS = {
  tafkim: '#006694',
  lkalkala: '#00ADEF',
  lgray: '#B4B4B4',
  green: '#00A650',
  red1: '#C38A08',
  red2: '#F47216',
  red3: '#EC008C',
  red4: '#8C0000',
};

const DEFAULT_TAJWEED_RULES = {
  tafkhim: true,
  qalqalah: true,
  ghunnah: true,
  idgham: true,
  ikhfa: true,
  iqlab: true,
  madd: true,
};

// ============================================
// Mushaf Presets
// ============================================

export const MUSHAF_PRESETS: Record<string, MushafConfig> = {
  /**
   * Standard Madinah Mushaf (King Fahd Complex)
   */
  'madinah-standard': {
    id: 'madinah-standard',
    name: 'Madinah Mushaf (Standard)',
    layout: {
      ...DEFAULT_LAYOUT,
    },
    border: {
      enabled: true,
      cssStyles: {
        borderColor: '#8B4513',
        borderWidth: '2px',
        borderStyle: 'solid',
      },
    },
    verseMarker: {
      style: 'ornate-frame',
      numberFormat: 'arabic-indic',
      size: { width: 800, height: 800 },
      colors: {
        frame: '#DAA520',
        background: '#FFFFFF',
        number: '#000000',
      },
    },
    surahHeader: {
      display: {
        surahName: true,
        surahNumber: false,
        revelationType: false,
        verseCount: false,
        bismillah: 'separate-line',
      },
      height: 1800,
      background: {
        color: '#F5F5DC',
      },
    },
    tajweed: {
      enabled: false,
      colors: DEFAULT_TAJWEED_COLORS,
      rules: DEFAULT_TAJWEED_RULES,
    },
    margins: {
      enabled: false,
    },
    spread: {
      defaultMode: 'auto',
      autoBreakpoint: 800,
      spread: {
        gutterWidth: 40,
        sharedHeader: false,
        sharedFooter: true,
        rightPageParity: 'even',
        pageGap: 10,
      },
    },
    typography: {
      primaryFont: {
        family: 'digitalkhatt',
        size: 1000,
      },
      textColor: '#000000',
      backgroundColor: '#FFFEF0',
      direction: 'rtl',
      lineHeightMultiplier: 1.8,
    },
  },

  /**
   * IndoPak 15-line Mushaf
   */
  'indopak-15': {
    id: 'indopak-15',
    name: 'IndoPak 15-Line',
    layout: {
      ...DEFAULT_LAYOUT,
    },
    border: {
      enabled: true,
      cssStyles: {
        borderColor: '#228B22',
        borderWidth: '3px',
        borderStyle: 'double',
      },
    },
    verseMarker: {
      style: 'simple-circle',
      numberFormat: 'arabic-indic',
      size: { width: 600, height: 600 },
      colors: {
        frame: '#228B22',
        background: '#FFFFFF',
        number: '#228B22',
      },
    },
    surahHeader: {
      display: {
        surahName: true,
        surahNumber: true,
        revelationType: true,
        verseCount: true,
        bismillah: 'separate-line',
      },
      height: 2000,
      background: {
        color: '#E8F5E9',
      },
    },
    tajweed: {
      enabled: false,
      colors: DEFAULT_TAJWEED_COLORS,
      rules: DEFAULT_TAJWEED_RULES,
    },
    margins: {
      enabled: true,
      ruku: {
        enabled: true,
        position: 'left',
      },
      manzil: {
        enabled: true,
        position: 'right',
      },
      juz: {
        enabled: true,
        position: 'header',
        displayFormat: 'both',
      },
      sajdah: {
        enabled: true,
        style: 'both',
        color: '#FF0000',
      },
    },
    spread: {
      defaultMode: 'auto',
      autoBreakpoint: 800,
      spread: {
        gutterWidth: 40,
        sharedHeader: false,
        sharedFooter: true,
        rightPageParity: 'even',
        pageGap: 10,
      },
    },
    typography: {
      primaryFont: {
        family: 'indopak',
        size: 1000,
      },
      textColor: '#000000',
      backgroundColor: '#FFFEF0',
      direction: 'rtl',
      lineHeightMultiplier: 1.8,
    },
  },

  /**
   * Color-coded Tajweed Mushaf
   */
  'tajweed-colored': {
    id: 'tajweed-colored',
    name: 'Tajweed (Color-Coded)',
    layout: {
      ...DEFAULT_LAYOUT,
    },
    border: {
      enabled: true,
      cssStyles: {
        borderColor: '#4169E1',
        borderWidth: '2px',
        borderStyle: 'solid',
      },
    },
    verseMarker: {
      style: 'colored-circle',
      numberFormat: 'arabic-indic',
      size: { width: 700, height: 700 },
      colors: {
        frame: '#4169E1',
        background: '#E6F2FF',
        number: '#4169E1',
      },
    },
    surahHeader: {
      display: {
        surahName: true,
        surahNumber: false,
        revelationType: false,
        verseCount: false,
        bismillah: 'separate-line',
      },
      height: 1800,
      background: {
        color: '#E6F2FF',
      },
    },
    tajweed: {
      enabled: true,
      colors: {
        ...DEFAULT_TAJWEED_COLORS,
        // Enhanced colors for tajweed mushaf
        ghunnah: '#9932CC',
        ikhfa: '#00CED1',
        iqlab: '#FF69B4',
      },
      rules: DEFAULT_TAJWEED_RULES,
      qiraat: 'hafs',
    },
    margins: {
      enabled: false,
    },
    spread: {
      defaultMode: 'single',
    },
    typography: {
      primaryFont: {
        family: 'digitalkhatt',
        size: 1000,
      },
      textColor: '#000000',
      backgroundColor: '#FFFFFF',
      direction: 'rtl',
      lineHeightMultiplier: 1.8,
    },
  },

  /**
   * Word-by-Word Layout (English)
   */
  'word-by-word-en': {
    id: 'word-by-word-en',
    name: 'Word-by-Word (English)',
    layout: {
      linesPerPage: 8,
      pageWidth: 17000,
      pageHeight: 27000,
      margins: { top: 300, bottom: 300, left: 300, right: 300 },
      interlineSpacing: 3000,
      fontSize: 800,
      justificationStyle: 'stretch',
    },
    border: {
      enabled: true,
      cssStyles: {
        borderColor: '#8B4513',
        borderWidth: '1px',
        borderStyle: 'solid',
      },
    },
    verseMarker: {
      style: 'simple-circle',
      numberFormat: 'western',
      size: { width: 500, height: 500 },
      colors: {
        frame: '#8B4513',
        background: '#FFFFFF',
        number: '#8B4513',
      },
    },
    surahHeader: {
      display: {
        surahName: true,
        surahNumber: true,
        revelationType: false,
        verseCount: false,
        bismillah: 'inline',
      },
      height: 1500,
    },
    tajweed: {
      enabled: false,
      colors: DEFAULT_TAJWEED_COLORS,
      rules: DEFAULT_TAJWEED_RULES,
    },
    margins: {
      enabled: false,
    },
    wordByWord: {
      enabled: true,
      translations: [],
      layout: {
        arrangement: 'vertical',
        wordSpacing: 200,
        componentSpacing: 100,
        wordsPerRow: 4,
        rowColoring: {
          enabled: true,
          colors: ['#FFF5E6', '#E6F3FF', '#F0FFF0', '#FFF0F5'],
          groupBy: 'verse',
        },
      },
      arabic: {
        fontSize: 800,
        fontFamily: 'digitalkhatt',
        color: '#000000',
        fontWeight: 'bold',
      },
      transliteration: {
        enabled: true,
        fontSize: 400,
        fontFamily: 'Arial',
        color: '#666666',
      },
    },
    spread: {
      defaultMode: 'single',
    },
    typography: {
      primaryFont: {
        family: 'digitalkhatt',
        size: 800,
      },
      translationFont: {
        family: 'Arial',
        size: 350,
        color: '#333333',
      },
      textColor: '#000000',
      backgroundColor: '#FFFFFF',
      direction: 'rtl',
      lineHeightMultiplier: 3.0,
    },
  },
};

// ============================================
// Preset Helper Functions
// ============================================

/**
 * Get a mushaf preset by ID
 */
export function getMushafPreset(id: string): MushafConfig | undefined {
  return MUSHAF_PRESETS[id];
}

/**
 * Get all available preset IDs
 */
export function getAvailablePresets(): string[] {
  return Object.keys(MUSHAF_PRESETS);
}

/**
 * Deep merge two objects
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          target[key] as object,
          source[key] as object
        );
      } else {
        (result as Record<string, unknown>)[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Extend a preset with custom overrides
 */
export function extendPreset(
  basePresetId: string,
  overrides: MushafConfigOverrides
): MushafConfig {
  const base = getMushafPreset(basePresetId);
  if (!base) {
    throw new Error(`Unknown preset: ${basePresetId}`);
  }
  return deepMerge(base, overrides as Partial<MushafConfig>);
}

/**
 * Create a custom mushaf config with defaults
 */
export function createMushafConfig(
  config: Partial<MushafConfig> & { id: string; name: string }
): MushafConfig {
  const base = MUSHAF_PRESETS['madinah-standard'];
  return deepMerge(base, config as Partial<MushafConfig>);
}
