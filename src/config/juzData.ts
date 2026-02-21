import type { MushafScript } from './types';

/**
 * Juz (Part) data for the Quran
 * The Quran is divided into 30 Juz of roughly equal length
 */
export interface JuzData {
  id: number;          // Juz number (1-30)
  arabicName: string;  // Full Arabic name (e.g., "الجزء الأول")
  englishName: string; // Common English name (usually from first word)
  surahStart: number;  // Starting surah number
  ayahStart: number;   // Starting ayah number
  apiPage: number;     // QPC Nastaleeq page (1-610) - for word-by-word view
  mushafPage: number;  // Standard Madani page (1-604) - for mushaf view
}

/**
 * Complete Juz data with accurate page numbers for both page systems
 * apiPage: QPC Nastaleeq 15-line (610 pages)
 * mushafPage: Standard Madani Mushaf (604 pages)
 */
export const JUZ_DATA: readonly JuzData[] = [
  { id: 1, arabicName: 'الجزء الأول', englishName: 'Alif Laam Meem', surahStart: 1, ayahStart: 1, apiPage: 1, mushafPage: 1 },
  { id: 2, arabicName: 'الجزء الثاني', englishName: 'Sayaqool', surahStart: 2, ayahStart: 142, apiPage: 22, mushafPage: 22 },
  { id: 3, arabicName: 'الجزء الثالث', englishName: 'Tilkal Rusul', surahStart: 2, ayahStart: 253, apiPage: 42, mushafPage: 42 },
  { id: 4, arabicName: 'الجزء الرابع', englishName: 'Lan Tanaloo', surahStart: 3, ayahStart: 93, apiPage: 62, mushafPage: 62 },
  { id: 5, arabicName: 'الجزء الخامس', englishName: 'Wal Mohsanat', surahStart: 4, ayahStart: 24, apiPage: 82, mushafPage: 82 },
  { id: 6, arabicName: 'الجزء السادس', englishName: 'La Yuhibbullah', surahStart: 4, ayahStart: 148, apiPage: 102, mushafPage: 102 },
  { id: 7, arabicName: 'الجزء السابع', englishName: 'Wa Iza Samiu', surahStart: 5, ayahStart: 83, apiPage: 122, mushafPage: 122 },
  { id: 8, arabicName: 'الجزء الثامن', englishName: 'Wa Lau Annana', surahStart: 6, ayahStart: 111, apiPage: 142, mushafPage: 142 },
  { id: 9, arabicName: 'الجزء التاسع', englishName: 'Qalal Malao', surahStart: 7, ayahStart: 88, apiPage: 162, mushafPage: 162 },
  { id: 10, arabicName: 'الجزء العاشر', englishName: 'Wa Alamu', surahStart: 8, ayahStart: 41, apiPage: 182, mushafPage: 182 },
  { id: 11, arabicName: 'الجزء الحادي عشر', englishName: 'Yatazeroon', surahStart: 9, ayahStart: 93, apiPage: 202, mushafPage: 202 },
  { id: 12, arabicName: 'الجزء الثاني عشر', englishName: 'Wa Mamin Daabbah', surahStart: 11, ayahStart: 6, apiPage: 222, mushafPage: 222 },
  { id: 13, arabicName: 'الجزء الثالث عشر', englishName: 'Wa Ma Ubarrio', surahStart: 12, ayahStart: 53, apiPage: 242, mushafPage: 242 },
  { id: 14, arabicName: 'الجزء الرابع عشر', englishName: 'Rubama', surahStart: 15, ayahStart: 1, apiPage: 262, mushafPage: 262 },
  { id: 15, arabicName: 'الجزء الخامس عشر', englishName: 'Subhanallazi', surahStart: 17, ayahStart: 1, apiPage: 282, mushafPage: 282 },
  { id: 16, arabicName: 'الجزء السادس عشر', englishName: 'Qal Alam', surahStart: 18, ayahStart: 75, apiPage: 302, mushafPage: 302 },
  { id: 17, arabicName: 'الجزء السابع عشر', englishName: 'Iqtaraba', surahStart: 21, ayahStart: 1, apiPage: 322, mushafPage: 322 },
  { id: 18, arabicName: 'الجزء الثامن عشر', englishName: 'Qad Aflaha', surahStart: 23, ayahStart: 1, apiPage: 342, mushafPage: 342 },
  { id: 19, arabicName: 'الجزء التاسع عشر', englishName: 'Wa Qalallazina', surahStart: 25, ayahStart: 21, apiPage: 362, mushafPage: 362 },
  { id: 20, arabicName: 'الجزء العشرون', englishName: 'Amman Khalaq', surahStart: 27, ayahStart: 56, apiPage: 382, mushafPage: 382 },
  { id: 21, arabicName: 'الجزء الحادي والعشرون', englishName: 'Utlu Ma Oohi', surahStart: 29, ayahStart: 46, apiPage: 402, mushafPage: 402 },
  { id: 22, arabicName: 'الجزء الثاني والعشرون', englishName: 'Wa Manyaqnut', surahStart: 33, ayahStart: 31, apiPage: 422, mushafPage: 422 },
  { id: 23, arabicName: 'الجزء الثالث والعشرون', englishName: 'Wa Mali', surahStart: 36, ayahStart: 28, apiPage: 442, mushafPage: 442 },
  { id: 24, arabicName: 'الجزء الرابع والعشرون', englishName: 'Faman Azlam', surahStart: 39, ayahStart: 32, apiPage: 462, mushafPage: 462 },
  { id: 25, arabicName: 'الجزء الخامس والعشرون', englishName: 'Elahe Yuruddo', surahStart: 41, ayahStart: 47, apiPage: 482, mushafPage: 482 },
  { id: 26, arabicName: 'الجزء السادس والعشرون', englishName: 'Ha Meem', surahStart: 46, ayahStart: 1, apiPage: 502, mushafPage: 502 },
  { id: 27, arabicName: 'الجزء السابع والعشرون', englishName: 'Qala Fama Khatbukum', surahStart: 51, ayahStart: 31, apiPage: 522, mushafPage: 522 },
  { id: 28, arabicName: 'الجزء الثامن والعشرون', englishName: 'Qad Sami Allah', surahStart: 58, ayahStart: 1, apiPage: 542, mushafPage: 542 },
  { id: 29, arabicName: 'الجزء التاسع والعشرون', englishName: 'Tabarakallazi', surahStart: 67, ayahStart: 1, apiPage: 562, mushafPage: 562 },
  { id: 30, arabicName: 'الجزء الثلاثون', englishName: 'Amma', surahStart: 78, ayahStart: 1, apiPage: 586, mushafPage: 582 },
] as const;

/**
 * Get Juz data by ID
 */
export function getJuzById(id: number): JuzData | undefined {
  return JUZ_DATA.find(j => j.id === id);
}

/**
 * Get the Arabic name for a Juz
 */
export function getJuzArabicName(juzNumber: number): string {
  const juz = getJuzById(juzNumber);
  return juz?.arabicName || `الجزء ${juzNumber}`;
}

/**
 * Get the Juz number (1-30) for a given page number
 * Iterates backwards through JUZ_DATA to find which Juz the page falls in
 */
export function getJuzForPage(
  pageNumber: number,
  viewMode: 'mushaf' | 'wordforword',
  mushafScript: MushafScript = 'indoPak15'
): number {
  const useApiPage = viewMode === 'wordforword' || mushafScript === 'indoPak15';
  for (let i = JUZ_DATA.length - 1; i >= 0; i--) {
    const startPage = useApiPage ? JUZ_DATA[i].apiPage : JUZ_DATA[i].mushafPage;
    if (pageNumber >= startPage) {
      return JUZ_DATA[i].id;
    }
  }
  return 1;
}

/**
 * Get the UI page number where a Juz starts
 * Handles both view modes and mushaf script differences
 *
 * @param juzId - Juz number (1-30)
 * @param viewMode - 'mushaf' or 'wordforword'
 * @param mushafScript - The mushaf script being used (for mushaf view)
 * @returns UI page number (includes +1 offset for intro page)
 */
export function getJuzStartPage(
  juzId: number,
  viewMode: 'mushaf' | 'wordforword',
  mushafScript: MushafScript = 'indoPak15'
): number {
  const juz = getJuzById(juzId);
  if (!juz) return 2; // Default to first Quran page

  // Word-by-word always uses apiPage (QPC Nastaleeq)
  if (viewMode === 'wordforword') {
    return juz.apiPage + 1; // +1 for intro page
  }

  // Mushaf view: IndoPak uses apiPage, Madani variants use mushafPage
  const quranPage = mushafScript === 'indoPak15' ? juz.apiPage : juz.mushafPage;
  return quranPage + 1; // +1 for intro page
}
