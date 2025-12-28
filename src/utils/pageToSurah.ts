/**
 * Chapter data with page mappings
 * apiPage: QPC Nastaleeq 15-line Mushaf (610 pages) - used for word-by-word view
 * mushafPage: Standard Madani Mushaf (604 pages) - used for mushaf renderer view
 */
const chapterData = [
  { id: 1, name: 'Al-Fathiha', apiPage: 1, mushafPage: 1 },
  { id: 2, name: 'Al-Baqara', apiPage: 2, mushafPage: 2 },
  { id: 3, name: "Al-i'Imran", apiPage: 50, mushafPage: 50 },
  { id: 4, name: 'An-Nisaa', apiPage: 77, mushafPage: 77 },
  { id: 5, name: 'Al-Maida', apiPage: 106, mushafPage: 106 },
  { id: 6, name: "Al-An'am", apiPage: 128, mushafPage: 128 },
  { id: 7, name: "Al-A'raf", apiPage: 151, mushafPage: 151 },
  { id: 8, name: 'Al-Anfal', apiPage: 177, mushafPage: 177 },
  { id: 9, name: 'At-Tauba', apiPage: 187, mushafPage: 187 },
  { id: 10, name: 'Yunus', apiPage: 208, mushafPage: 208 },
  { id: 11, name: 'Hud', apiPage: 221, mushafPage: 221 },
  { id: 12, name: 'Yusuf', apiPage: 235, mushafPage: 235 },
  { id: 13, name: "Ar-Ra'd", apiPage: 249, mushafPage: 249 },
  { id: 14, name: 'Ibrahim', apiPage: 255, mushafPage: 255 },
  { id: 15, name: 'Al-Hijr', apiPage: 261, mushafPage: 262 },
  { id: 16, name: 'An-Nahl', apiPage: 267, mushafPage: 267 },
  { id: 17, name: 'Al-Israa', apiPage: 282, mushafPage: 282 },
  { id: 18, name: 'Al-Kahf', apiPage: 293, mushafPage: 293 },
  { id: 19, name: 'Maryam', apiPage: 305, mushafPage: 305 },
  { id: 20, name: 'Ta-ha', apiPage: 312, mushafPage: 312 },
  { id: 21, name: 'Al-Anbiyaa', apiPage: 322, mushafPage: 322 },
  { id: 22, name: 'Al-Hajj', apiPage: 331, mushafPage: 332 },
  { id: 23, name: "Al-Mu'minun", apiPage: 342, mushafPage: 342 },
  { id: 24, name: 'An-Nur', apiPage: 350, mushafPage: 350 },
  { id: 25, name: 'Al-Furqan', apiPage: 359, mushafPage: 359 },
  { id: 26, name: "Ash-Shu'ara", apiPage: 366, mushafPage: 367 },
  { id: 27, name: 'An-Naml', apiPage: 376, mushafPage: 377 },
  { id: 28, name: 'Al-Qasas', apiPage: 385, mushafPage: 385 },
  { id: 29, name: 'Al-Ankabut', apiPage: 396, mushafPage: 396 },
  { id: 30, name: 'Ar-Rum', apiPage: 404, mushafPage: 404 },
  { id: 31, name: 'Luqman', apiPage: 411, mushafPage: 411 },
  { id: 32, name: 'As-Sajda', apiPage: 415, mushafPage: 415 },
  { id: 33, name: 'Al-Ahzab', apiPage: 418, mushafPage: 418 },
  { id: 34, name: 'Saba', apiPage: 428, mushafPage: 428 },
  { id: 35, name: 'Fatir', apiPage: 434, mushafPage: 434 },
  { id: 36, name: 'Ya-Sin', apiPage: 440, mushafPage: 440 },
  { id: 37, name: 'As-Saffat', apiPage: 445, mushafPage: 446 },
  { id: 38, name: 'Sad', apiPage: 452, mushafPage: 453 },
  { id: 39, name: 'Az-Zumar', apiPage: 458, mushafPage: 458 },
  { id: 40, name: 'Ghafir', apiPage: 467, mushafPage: 467 },
  { id: 41, name: 'Fussilat', apiPage: 477, mushafPage: 477 },
  { id: 42, name: 'Ash-Shura', apiPage: 483, mushafPage: 483 },
  { id: 43, name: 'Az-Zukhruf', apiPage: 489, mushafPage: 489 },
  { id: 44, name: 'Ad-Dukhan', apiPage: 495, mushafPage: 496 },
  { id: 45, name: 'Al-Jathiya', apiPage: 498, mushafPage: 499 },
  { id: 46, name: 'Al-Ahqaf', apiPage: 502, mushafPage: 502 },
  { id: 47, name: 'Muhammad', apiPage: 506, mushafPage: 507 },
  { id: 48, name: 'Al-Fath', apiPage: 511, mushafPage: 511 },
  { id: 49, name: 'Al-Hujurat', apiPage: 515, mushafPage: 515 },
  { id: 50, name: 'Qaf', apiPage: 518, mushafPage: 518 },
  { id: 51, name: 'Adh-Dhariyat', apiPage: 520, mushafPage: 520 },
  { id: 52, name: 'At-Tur', apiPage: 523, mushafPage: 523 },
  { id: 53, name: 'An-Najm', apiPage: 526, mushafPage: 526 },
  { id: 54, name: 'Al-Qamar', apiPage: 528, mushafPage: 528 },
  { id: 55, name: 'Ar-Rahman', apiPage: 531, mushafPage: 531 },
  { id: 56, name: "Al-Waqi'a", apiPage: 534, mushafPage: 534 },
  { id: 57, name: 'Al-Hadid', apiPage: 537, mushafPage: 537 },
  { id: 58, name: 'Al-Mujadila', apiPage: 542, mushafPage: 542 },
  { id: 59, name: 'Al-Hashr', apiPage: 545, mushafPage: 545 },
  { id: 60, name: 'Al-Mumtahana', apiPage: 549, mushafPage: 549 },
  { id: 61, name: 'As-Saff', apiPage: 551, mushafPage: 551 },
  { id: 62, name: "Al-Jumu'a", apiPage: 553, mushafPage: 553 },
  { id: 63, name: 'Al-Munafiqun', apiPage: 554, mushafPage: 554 },
  { id: 64, name: 'At-Taghabun', apiPage: 556, mushafPage: 556 },
  { id: 65, name: 'At-Talaq', apiPage: 558, mushafPage: 558 },
  { id: 66, name: 'At-Tahrim', apiPage: 560, mushafPage: 560 },
  { id: 67, name: 'Al-Mulk', apiPage: 562, mushafPage: 562 },
  { id: 68, name: 'Al-Qalam', apiPage: 564, mushafPage: 564 },
  { id: 69, name: 'Al-Haqqa', apiPage: 567, mushafPage: 566 },
  { id: 70, name: "Al-Ma'arij", apiPage: 569, mushafPage: 568 },
  { id: 71, name: 'Nuh', apiPage: 571, mushafPage: 570 },
  { id: 72, name: 'Al-Jinn', apiPage: 573, mushafPage: 572 },
  { id: 73, name: 'Al-Muzzammil', apiPage: 576, mushafPage: 574 },
  { id: 74, name: 'Al-Muddaththir', apiPage: 578, mushafPage: 575 },
  { id: 75, name: 'Al-Qiyama', apiPage: 580, mushafPage: 577 },
  { id: 76, name: 'Al-Insan', apiPage: 582, mushafPage: 578 },
  { id: 77, name: 'Al-Mursalat', apiPage: 584, mushafPage: 580 },
  { id: 78, name: "An-Naba'", apiPage: 586, mushafPage: 582 },
  { id: 79, name: "An-Nazi'at", apiPage: 587, mushafPage: 583 },
  { id: 80, name: 'Abasa', apiPage: 589, mushafPage: 585 },
  { id: 81, name: 'At-Takwir', apiPage: 590, mushafPage: 586 },
  { id: 82, name: 'Al-Infitar', apiPage: 591, mushafPage: 587 },
  { id: 83, name: 'Al-Mutaffifin', apiPage: 592, mushafPage: 587 },
  { id: 84, name: 'Al-Inshiqaq', apiPage: 594, mushafPage: 589 },
  { id: 85, name: 'Al-Buruj', apiPage: 595, mushafPage: 590 },
  { id: 86, name: 'At-Tariq', apiPage: 596, mushafPage: 591 },
  { id: 87, name: "Al-A'la", apiPage: 597, mushafPage: 591 },
  { id: 88, name: 'Al-Ghashiya', apiPage: 597, mushafPage: 592 },
  { id: 89, name: 'Al-Fajr', apiPage: 598, mushafPage: 593 },
  { id: 90, name: 'Al-Balad', apiPage: 600, mushafPage: 594 },
  { id: 91, name: 'Ash-Shams', apiPage: 600, mushafPage: 595 },
  { id: 92, name: 'Al-Lail', apiPage: 601, mushafPage: 595 },
  { id: 93, name: 'Ad-Duha', apiPage: 602, mushafPage: 596 },
  { id: 94, name: 'Ash-Sharh', apiPage: 602, mushafPage: 596 },
  { id: 95, name: 'At-Tin', apiPage: 603, mushafPage: 597 },
  { id: 96, name: "Al-'Alaq", apiPage: 603, mushafPage: 597 },
  { id: 97, name: 'Al-Qadr', apiPage: 604, mushafPage: 598 },
  { id: 98, name: 'Al-Bayyina', apiPage: 604, mushafPage: 598 },
  { id: 99, name: 'Az-Zalzala', apiPage: 605, mushafPage: 599 },
  { id: 100, name: "Al-'Adiyat", apiPage: 605, mushafPage: 599 },
  { id: 101, name: "Al-Qari'a", apiPage: 606, mushafPage: 600 },
  { id: 102, name: 'At-Takathur', apiPage: 606, mushafPage: 600 },
  { id: 103, name: "Al-'Asr", apiPage: 607, mushafPage: 601 },
  { id: 104, name: 'Al-Humaza', apiPage: 607, mushafPage: 601 },
  { id: 105, name: 'Al-Fil', apiPage: 607, mushafPage: 601 },
  { id: 106, name: 'Quraish', apiPage: 608, mushafPage: 602 },
  { id: 107, name: "Al-Ma'un", apiPage: 608, mushafPage: 602 },
  { id: 108, name: 'Al-Kauthar', apiPage: 608, mushafPage: 602 },
  { id: 109, name: 'Al-Kafirun', apiPage: 608, mushafPage: 603 },
  { id: 110, name: 'An-Nasr', apiPage: 609, mushafPage: 603 },
  { id: 111, name: 'Al-Masad', apiPage: 609, mushafPage: 603 },
  { id: 112, name: 'Al-Ikhlas', apiPage: 609, mushafPage: 604 },
  { id: 113, name: 'Al-Falaq', apiPage: 610, mushafPage: 604 },
  { id: 114, name: 'An-Nas', apiPage: 610, mushafPage: 604 },
];

interface SurahInfo {
  id: number;
  name: string;
}

/**
 * Get the surah (chapter) for a given UI page number
 * UI pages include an intro page (page 1), so actual Quran content starts at page 2
 *
 * @param uiPageNumber - The UI page number (1-indexed, where 1 is intro page)
 * @param viewMode - 'mushaf' uses standard Hafs (604 pages), 'wordforword' uses QPC Nastaleeq (610 pages)
 */
export function getSurahForPage(
  uiPageNumber: number,
  viewMode: 'mushaf' | 'wordforword'
): SurahInfo {
  // Handle intro page
  if (uiPageNumber === 1) {
    return { id: 0, name: 'Introduction' };
  }

  // Convert UI page to actual Quran page (subtract 1 for intro page)
  const quranPage = uiPageNumber - 1;

  // Get the appropriate page field based on view mode
  const pageField = viewMode === 'mushaf' ? 'mushafPage' : 'apiPage';

  // Find the surah that contains this page
  // We iterate backwards through chapters to find the last chapter
  // whose starting page is <= the current page
  for (let i = chapterData.length - 1; i >= 0; i--) {
    if (chapterData[i][pageField] <= quranPage) {
      return {
        id: chapterData[i].id,
        name: chapterData[i].name,
      };
    }
  }

  // Default to Al-Fatiha if nothing found (shouldn't happen)
  return { id: 1, name: 'Al-Fathiha' };
}

/**
 * Get all chapter data (useful for exports)
 */
export function getAllChapters() {
  return chapterData.map(ch => ({
    id: ch.id,
    name: ch.name,
  }));
}

/**
 * Convert a UI page number from one view mode to another
 * This uses the surah starting pages to approximate the equivalent page
 *
 * @param uiPageNumber - The UI page number (1-indexed, where 1 is intro page)
 * @param fromMode - The source view mode
 * @param toMode - The target view mode
 * @returns The equivalent UI page number in the target view mode
 */
export function convertPageBetweenViews(
  uiPageNumber: number,
  fromMode: 'mushaf' | 'wordforword',
  toMode: 'mushaf' | 'wordforword'
): number {
  // If same mode, return as is
  if (fromMode === toMode) {
    return uiPageNumber;
  }

  // Handle intro page
  if (uiPageNumber === 1) {
    return 1;
  }

  // Convert UI page to Quran page (subtract 1 for intro page)
  const quranPage = uiPageNumber - 1;

  // Get the appropriate page fields based on view modes
  const fromField = fromMode === 'mushaf' ? 'mushafPage' : 'apiPage';
  const toField = toMode === 'mushaf' ? 'mushafPage' : 'apiPage';

  // Find the surah that contains this page in the source view
  let surahIndex = 0;
  for (let i = chapterData.length - 1; i >= 0; i--) {
    if (chapterData[i][fromField] <= quranPage) {
      surahIndex = i;
      break;
    }
  }

  // Calculate the offset within the surah
  const surahStartInSource = chapterData[surahIndex][fromField];
  const pageOffsetInSurah = quranPage - surahStartInSource;

  // Get the equivalent page in the target view
  const surahStartInTarget = chapterData[surahIndex][toField];
  const targetQuranPage = surahStartInTarget + pageOffsetInSurah;

  // Convert back to UI page (add 1 for intro page)
  return targetQuranPage + 1;
}

/**
 * Get the UI page number for a surah in a specific view mode
 *
 * @param surahId - The surah ID (1-114)
 * @param viewMode - The view mode
 * @returns The UI page number where the surah starts
 */
export function getSurahStartPage(
  surahId: number,
  viewMode: 'mushaf' | 'wordforword'
): number {
  const surah = chapterData.find(ch => ch.id === surahId);
  if (!surah) {
    return 2; // Default to first Quran page
  }

  const pageField = viewMode === 'mushaf' ? 'mushafPage' : 'apiPage';
  // Convert to UI page (add 1 for intro page)
  return surah[pageField] + 1;
}
