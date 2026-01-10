/**
 * @digitalkhatt/quran-engine - Margin Annotation Data
 *
 * Static data for Quran divisions: Juz, Hizb, Manzil, Ruku, and Sajdah positions
 */

// ============================================
// Type Definitions
// ============================================

export interface JuzPosition {
  /** Juz number (1-30) */
  juz: number;
  /** Starting surah number */
  surah: number;
  /** Starting ayah number */
  ayah: number;
  /** Page number in standard Madinah mushaf */
  page: number;
}

export interface HizbPosition {
  /** Hizb number (1-60) */
  hizb: number;
  /** Quarter within hizb (0 = start, 1 = 1/4, 2 = 1/2, 3 = 3/4) */
  quarter: number;
  /** Surah number */
  surah: number;
  /** Ayah number */
  ayah: number;
  /** Page number */
  page: number;
}

export interface ManzilPosition {
  /** Manzil number (1-7) */
  manzil: number;
  /** Starting surah number */
  surah: number;
  /** Starting ayah number */
  ayah: number;
  /** Page number */
  page: number;
}

export interface RukuPosition {
  /** Ruku number within the surah */
  ruku: number;
  /** Global ruku number (1-556) */
  globalRuku: number;
  /** Surah number */
  surah: number;
  /** Starting ayah number */
  ayah: number;
  /** Page number */
  page: number;
  /** Line number on the page (1-indexed) */
  line: number;
}

export interface SajdahPosition {
  /** Surah number */
  surah: number;
  /** Ayah number */
  ayah: number;
  /** Page number */
  page: number;
  /** Line number on the page (1-indexed) */
  line: number;
  /** Type of sajdah */
  type: 'wajib' | 'mustahabb';
}

// ============================================
// Juz Positions (30 parts)
// ============================================

export const JUZ_POSITIONS: JuzPosition[] = [
  { juz: 1, surah: 1, ayah: 1, page: 1 },
  { juz: 2, surah: 2, ayah: 142, page: 22 },
  { juz: 3, surah: 2, ayah: 253, page: 42 },
  { juz: 4, surah: 3, ayah: 93, page: 62 },
  { juz: 5, surah: 4, ayah: 24, page: 82 },
  { juz: 6, surah: 4, ayah: 148, page: 102 },
  { juz: 7, surah: 5, ayah: 82, page: 121 },
  { juz: 8, surah: 6, ayah: 111, page: 142 },
  { juz: 9, surah: 7, ayah: 88, page: 162 },
  { juz: 10, surah: 8, ayah: 41, page: 182 },
  { juz: 11, surah: 9, ayah: 93, page: 201 },
  { juz: 12, surah: 11, ayah: 6, page: 222 },
  { juz: 13, surah: 12, ayah: 53, page: 242 },
  { juz: 14, surah: 15, ayah: 1, page: 262 },
  { juz: 15, surah: 17, ayah: 1, page: 282 },
  { juz: 16, surah: 18, ayah: 75, page: 302 },
  { juz: 17, surah: 21, ayah: 1, page: 322 },
  { juz: 18, surah: 23, ayah: 1, page: 342 },
  { juz: 19, surah: 25, ayah: 21, page: 362 },
  { juz: 20, surah: 27, ayah: 56, page: 382 },
  { juz: 21, surah: 29, ayah: 46, page: 402 },
  { juz: 22, surah: 33, ayah: 31, page: 422 },
  { juz: 23, surah: 36, ayah: 28, page: 442 },
  { juz: 24, surah: 39, ayah: 32, page: 462 },
  { juz: 25, surah: 41, ayah: 47, page: 482 },
  { juz: 26, surah: 46, ayah: 1, page: 502 },
  { juz: 27, surah: 51, ayah: 31, page: 522 },
  { juz: 28, surah: 58, ayah: 1, page: 542 },
  { juz: 29, surah: 67, ayah: 1, page: 562 },
  { juz: 30, surah: 78, ayah: 1, page: 582 },
];

// ============================================
// Juz Names (Arabic)
// ============================================

export const JUZ_NAMES: Record<number, string> = {
  1: 'الجزء الأول',
  2: 'الجزء الثاني',
  3: 'الجزء الثالث',
  4: 'الجزء الرابع',
  5: 'الجزء الخامس',
  6: 'الجزء السادس',
  7: 'الجزء السابع',
  8: 'الجزء الثامن',
  9: 'الجزء التاسع',
  10: 'الجزء العاشر',
  11: 'الجزء الحادي عشر',
  12: 'الجزء الثاني عشر',
  13: 'الجزء الثالث عشر',
  14: 'الجزء الرابع عشر',
  15: 'الجزء الخامس عشر',
  16: 'الجزء السادس عشر',
  17: 'الجزء السابع عشر',
  18: 'الجزء الثامن عشر',
  19: 'الجزء التاسع عشر',
  20: 'الجزء العشرون',
  21: 'الجزء الحادي والعشرون',
  22: 'الجزء الثاني والعشرون',
  23: 'الجزء الثالث والعشرون',
  24: 'الجزء الرابع والعشرون',
  25: 'الجزء الخامس والعشرون',
  26: 'الجزء السادس والعشرون',
  27: 'الجزء السابع والعشرون',
  28: 'الجزء الثامن والعشرون',
  29: 'الجزء التاسع والعشرون',
  30: 'الجزء الثلاثون',
};

// ============================================
// Manzil Positions (7 parts for weekly reading)
// ============================================

export const MANZIL_POSITIONS: ManzilPosition[] = [
  { manzil: 1, surah: 1, ayah: 1, page: 1 }, // Al-Fatiha to An-Nisa
  { manzil: 2, surah: 5, ayah: 1, page: 106 }, // Al-Ma'idah to At-Tawbah
  { manzil: 3, surah: 10, ayah: 1, page: 208 }, // Yunus to An-Nahl
  { manzil: 4, surah: 17, ayah: 1, page: 282 }, // Al-Isra to Al-Furqan
  { manzil: 5, surah: 26, ayah: 1, page: 367 }, // Ash-Shu'ara to Ya-Sin
  { manzil: 6, surah: 37, ayah: 1, page: 446 }, // As-Saffat to Al-Hujurat
  { manzil: 7, surah: 50, ayah: 1, page: 518 }, // Qaf to An-Nas
];

// ============================================
// Sajdah Positions (14 prostration verses)
// ============================================

export const SAJDAH_POSITIONS: SajdahPosition[] = [
  { surah: 7, ayah: 206, page: 176, line: 15, type: 'wajib' },
  { surah: 13, ayah: 15, page: 252, line: 4, type: 'mustahabb' },
  { surah: 16, ayah: 50, page: 272, line: 3, type: 'mustahabb' },
  { surah: 17, ayah: 109, page: 293, line: 10, type: 'mustahabb' },
  { surah: 19, ayah: 58, page: 309, line: 9, type: 'mustahabb' },
  { surah: 22, ayah: 18, page: 334, line: 6, type: 'mustahabb' },
  { surah: 22, ayah: 77, page: 341, line: 9, type: 'mustahabb' },
  { surah: 25, ayah: 60, page: 365, line: 5, type: 'mustahabb' },
  { surah: 27, ayah: 26, page: 379, line: 1, type: 'mustahabb' },
  { surah: 32, ayah: 15, page: 416, line: 4, type: 'wajib' },
  { surah: 38, ayah: 24, page: 454, line: 8, type: 'mustahabb' },
  { surah: 41, ayah: 38, page: 480, line: 9, type: 'wajib' },
  { surah: 53, ayah: 62, page: 528, line: 8, type: 'wajib' },
  { surah: 84, ayah: 21, page: 589, line: 6, type: 'mustahabb' },
  { surah: 96, ayah: 19, page: 597, line: 8, type: 'mustahabb' },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get annotations that start on a specific page
 */
export function getPageAnnotations(pageNumber: number): {
  juz: JuzPosition | undefined;
  manzil: ManzilPosition | undefined;
  sajdah: SajdahPosition[];
} {
  return {
    juz: JUZ_POSITIONS.find((j) => j.page === pageNumber),
    manzil: MANZIL_POSITIONS.find((m) => m.page === pageNumber),
    sajdah: SAJDAH_POSITIONS.filter((s) => s.page === pageNumber),
  };
}

/**
 * Get the current juz for a given page
 */
export function getJuzForPage(pageNumber: number): number {
  for (let i = JUZ_POSITIONS.length - 1; i >= 0; i--) {
    if (JUZ_POSITIONS[i].page <= pageNumber) {
      return JUZ_POSITIONS[i].juz;
    }
  }
  return 1;
}

/**
 * Get the current manzil for a given page
 */
export function getManzilForPage(pageNumber: number): number {
  for (let i = MANZIL_POSITIONS.length - 1; i >= 0; i--) {
    if (MANZIL_POSITIONS[i].page <= pageNumber) {
      return MANZIL_POSITIONS[i].manzil;
    }
  }
  return 1;
}

/**
 * Get juz name in Arabic
 */
export function getJuzName(juzNumber: number): string {
  return JUZ_NAMES[juzNumber] || `الجزء ${juzNumber}`;
}

/**
 * Convert number to Arabic-Indic numerals
 */
export function toArabicIndic(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((digit) => arabicNumerals[parseInt(digit, 10)])
    .join('');
}

/**
 * Check if a page has any sajdah verses
 */
export function hasSajdahOnPage(pageNumber: number): boolean {
  return SAJDAH_POSITIONS.some((s) => s.page === pageNumber);
}

/**
 * Get all sajdah positions on a page
 */
export function getSajdahOnPage(pageNumber: number): SajdahPosition[] {
  return SAJDAH_POSITIONS.filter((s) => s.page === pageNumber);
}

/**
 * Check if a specific verse is a sajdah verse
 */
export function isSajdahVerse(surah: number, ayah: number): SajdahPosition | undefined {
  return SAJDAH_POSITIONS.find((s) => s.surah === surah && s.ayah === ayah);
}
