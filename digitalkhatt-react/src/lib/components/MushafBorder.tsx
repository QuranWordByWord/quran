/**
 * MushafBorder - Decorative border component for Quran pages
 *
 * Uses the same border design as misraj-mushaf-renderer library
 * with SVG border-image for authentic Quran page styling.
 */

import React from 'react';
import type { MushafLayoutTypeString } from '@digitalkhatt/quran-engine';

// Arabic surah names
const SURAH_NAMES_ARABIC: Record<number, string> = {
  1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
  6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
  11: 'هود', 12: 'يوسف', 13: 'الرعد', 14: 'إبراهيم', 15: 'الحجر',
  16: 'النحل', 17: 'الإسراء', 18: 'الكهف', 19: 'مريم', 20: 'طه',
  21: 'الأنبياء', 22: 'الحج', 23: 'المؤمنون', 24: 'النور', 25: 'الفرقان',
  26: 'الشعراء', 27: 'النمل', 28: 'القصص', 29: 'العنكبوت', 30: 'الروم',
  31: 'لقمان', 32: 'السجدة', 33: 'الأحزاب', 34: 'سبأ', 35: 'فاطر',
  36: 'يس', 37: 'الصافات', 38: 'ص', 39: 'الزمر', 40: 'غافر',
  41: 'فصلت', 42: 'الشورى', 43: 'الزخرف', 44: 'الدخان', 45: 'الجاثية',
  46: 'الأحقاف', 47: 'محمد', 48: 'الفتح', 49: 'الحجرات', 50: 'ق',
  51: 'الذاريات', 52: 'الطور', 53: 'النجم', 54: 'القمر', 55: 'الرحمن',
  56: 'الواقعة', 57: 'الحديد', 58: 'المجادلة', 59: 'الحشر', 60: 'الممتحنة',
  61: 'الصف', 62: 'الجمعة', 63: 'المنافقون', 64: 'التغابن', 65: 'الطلاق',
  66: 'التحريم', 67: 'الملك', 68: 'القلم', 69: 'الحاقة', 70: 'المعارج',
  71: 'نوح', 72: 'الجن', 73: 'المزمل', 74: 'المدثر', 75: 'القيامة',
  76: 'الإنسان', 77: 'المرسلات', 78: 'النبأ', 79: 'النازعات', 80: 'عبس',
  81: 'التكوير', 82: 'الانفطار', 83: 'المطففين', 84: 'الانشقاق', 85: 'البروج',
  86: 'الطارق', 87: 'الأعلى', 88: 'الغاشية', 89: 'الفجر', 90: 'البلد',
  91: 'الشمس', 92: 'الليل', 93: 'الضحى', 94: 'الشرح', 95: 'التين',
  96: 'العلق', 97: 'القدر', 98: 'البينة', 99: 'الزلزلة', 100: 'العاديات',
  101: 'القارعة', 102: 'التكاثر', 103: 'العصر', 104: 'الهمزة', 105: 'الفيل',
  106: 'قريش', 107: 'الماعون', 108: 'الكوثر', 109: 'الكافرون', 110: 'النصر',
  111: 'المسد', 112: 'الإخلاص', 113: 'الفلق', 114: 'الناس',
};

// Juz names in Arabic
const JUZ_NAMES_ARABIC: Record<number, string> = {
  1: 'الجزء الأول', 2: 'الجزء الثاني', 3: 'الجزء الثالث', 4: 'الجزء الرابع',
  5: 'الجزء الخامس', 6: 'الجزء السادس', 7: 'الجزء السابع', 8: 'الجزء الثامن',
  9: 'الجزء التاسع', 10: 'الجزء العاشر', 11: 'الجزء الحادي عشر', 12: 'الجزء الثاني عشر',
  13: 'الجزء الثالث عشر', 14: 'الجزء الرابع عشر', 15: 'الجزء الخامس عشر', 16: 'الجزء السادس عشر',
  17: 'الجزء السابع عشر', 18: 'الجزء الثامن عشر', 19: 'الجزء التاسع عشر', 20: 'الجزء العشرون',
  21: 'الجزء الحادي والعشرون', 22: 'الجزء الثاني والعشرون', 23: 'الجزء الثالث والعشرون',
  24: 'الجزء الرابع والعشرون', 25: 'الجزء الخامس والعشرون', 26: 'الجزء السادس والعشرون',
  27: 'الجزء السابع والعشرون', 28: 'الجزء الثامن والعشرون', 29: 'الجزء التاسع والعشرون',
  30: 'الجزء الثلاثون',
};

// English surah names (transliterated)
const SURAH_NAMES_ENGLISH: Record<number, string> = {
  1: 'Al-Fatiha', 2: 'Al-Baqara', 3: "Al-i'Imran", 4: 'An-Nisaa', 5: 'Al-Maida',
  6: "Al-An'am", 7: "Al-A'raf", 8: 'Al-Anfal', 9: 'At-Tauba', 10: 'Yunus',
  11: 'Hud', 12: 'Yusuf', 13: "Ar-Ra'd", 14: 'Ibrahim', 15: 'Al-Hijr',
  16: 'An-Nahl', 17: 'Al-Israa', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-ha',
  21: 'Al-Anbiyaa', 22: 'Al-Hajj', 23: "Al-Mu'minun", 24: 'An-Nur', 25: 'Al-Furqan',
  26: "Ash-Shu'ara", 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
  31: 'Luqman', 32: 'As-Sajda', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir',
  36: 'Ya-Sin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
  41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiya',
  46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
  51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
  56: "Al-Waqi'a", 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahana',
  61: 'As-Saff', 62: "Al-Jumu'a", 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
  66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqa', 70: "Al-Ma'arij",
  71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyama',
  76: 'Al-Insan', 77: 'Al-Mursalat', 78: "An-Naba'", 79: "An-Nazi'at", 80: 'Abasa',
  81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Buruj',
  86: 'At-Tariq', 87: "Al-A'la", 88: 'Al-Ghashiya', 89: 'Al-Fajr', 90: 'Al-Balad',
  91: 'Ash-Shams', 92: 'Al-Lail', 93: 'Ad-Duha', 94: 'Ash-Sharh', 95: 'At-Tin',
  96: "Al-'Alaq", 97: 'Al-Qadr', 98: 'Al-Bayyina', 99: 'Az-Zalzala', 100: "Al-'Adiyat",
  101: "Al-Qari'a", 102: 'At-Takathur', 103: "Al-'Asr", 104: 'Al-Humaza', 105: 'Al-Fil',
  106: 'Quraish', 107: "Al-Ma'un", 108: 'Al-Kauthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
  111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
};

// Page to Juz mapping - Madani mushaf (604 pages)
const JUZ_START_PAGES_MADANI = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
  201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

// Page to Juz mapping - IndoPak 15-line mushaf (610 pages)
// Calculated based on JUZ_POSITIONS verse data mapped to IndoPak page numbers
// Juz 29 starts at Surah 67 (page 562), Juz 30 starts at Surah 78 (page 586)
const JUZ_START_PAGES_INDOPAK = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
  201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 586
];

// Page to Surah mapping - Madani mushaf (604 pages)
const SURAH_START_PAGES_MADANI = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208,
  221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404,
  411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518,
  520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568,
  570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594,
  595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603,
  603, 604, 604, 604
];

// Page to Surah mapping - IndoPak 15-line mushaf (610 pages)
// Based on apiPage values from pageToSurah.ts
const SURAH_START_PAGES_INDOPAK = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208,
  221, 235, 249, 255, 261, 267, 282, 293, 305, 312,
  322, 331, 342, 350, 359, 366, 376, 385, 396, 404,
  411, 415, 418, 428, 434, 440, 445, 452, 458, 467,
  477, 483, 489, 495, 498, 502, 506, 511, 515, 518,
  520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 567, 569,
  571, 573, 576, 578, 580, 582, 584, 586, 587, 589,
  590, 591, 592, 594, 595, 596, 597, 597, 598, 600,
  600, 601, 602, 602, 603, 603, 604, 604, 605, 605,
  606, 606, 607, 607, 607, 608, 608, 608, 608, 609,
  609, 609, 610, 610
];

function getJuzForPage(pageNumber: number, layoutType: MushafLayoutTypeString): number {
  const juzStartPages = layoutType === 'indoPak15' ? JUZ_START_PAGES_INDOPAK : JUZ_START_PAGES_MADANI;
  for (let i = juzStartPages.length - 1; i >= 0; i--) {
    if (pageNumber >= juzStartPages[i]) {
      return i + 1;
    }
  }
  return 1;
}

function getSurahForPage(pageNumber: number, layoutType: MushafLayoutTypeString): number {
  const surahStartPages = layoutType === 'indoPak15' ? SURAH_START_PAGES_INDOPAK : SURAH_START_PAGES_MADANI;
  for (let i = surahStartPages.length - 1; i >= 0; i--) {
    if (pageNumber >= surahStartPages[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Convert number to Arabic numerals
function toArabicNumerals(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

export interface MushafBorderProps {
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Content width in pixels */
  contentWidth: number;
  /** Content height in pixels */
  contentHeight: number;
  /** Scale factor */
  scale: number;
  /** Border color */
  borderColor?: string;
  /** Verse number format - when 'english', shows English names in brackets */
  verseNumberFormat?: 'arabic' | 'english';
  /** Mushaf layout type - determines page mappings */
  layoutType?: MushafLayoutTypeString;
  /** Children (page content) */
  children: React.ReactNode;
}

export function MushafBorder({
  pageNumber,
  contentWidth,
  contentHeight,
  scale,
  verseNumberFormat = 'arabic',
  layoutType = 'indoPak15',
  children,
}: MushafBorderProps) {
  const surahNumber = getSurahForPage(pageNumber, layoutType);
  const juzNumber = getJuzForPage(pageNumber, layoutType);
  const surahName = SURAH_NAMES_ARABIC[surahNumber] || '';
  const juzName = JUZ_NAMES_ARABIC[juzNumber] || '';
  const surahNameEnglish = SURAH_NAMES_ENGLISH[surahNumber] || '';
  const pageNumberArabic = toArabicNumerals(pageNumber);

  // SVG dimensions - the border SVG has a fixed aspect ratio that must be preserved
  const SVG_WIDTH = 437;
  const SVG_HEIGHT = 740;
  const SVG_BORDER = 25; // Border size in the original SVG
  const SVG_ASPECT_RATIO = SVG_WIDTH / SVG_HEIGHT; // ~0.59

  // Inner area of SVG (where content goes)
  const SVG_INNER_WIDTH = SVG_WIDTH - SVG_BORDER * 2; // 387
  const SVG_INNER_HEIGHT = SVG_HEIGHT - SVG_BORDER * 2; // 690

  // Header/footer heights
  const headerHeight = Math.round(24 * scale);
  const footerHeight = Math.round(32 * scale);

  // Calculate frame dimensions that:
  // 1. Maintain SVG's exact aspect ratio (437:740)
  // 2. Have inner area large enough for content

  // Option A: Size based on content width
  const frameFromWidth = contentWidth * (SVG_WIDTH / SVG_INNER_WIDTH);
  const heightFromWidth = frameFromWidth / SVG_ASPECT_RATIO;
  const innerHeightFromWidth = heightFromWidth * (SVG_INNER_HEIGHT / SVG_HEIGHT);

  // Option B: Size based on content height
  const frameFromHeight = contentHeight * (SVG_HEIGHT / SVG_INNER_HEIGHT);
  const widthFromHeight = frameFromHeight * SVG_ASPECT_RATIO;

  // Choose sizing that ensures content fits
  let frameWidth: number;
  let frameHeight: number;

  if (innerHeightFromWidth >= contentHeight) {
    // Width-based sizing works - inner height is enough for content
    frameWidth = Math.round(frameFromWidth);
    frameHeight = Math.round(heightFromWidth);
  } else {
    // Need height-based sizing - content is taller than width-based inner area
    frameWidth = Math.round(widthFromHeight);
    frameHeight = Math.round(frameFromHeight);
  }

  // Border sizes in the correctly-proportioned frame (same ratio as SVG)
  const borderX = Math.round(frameWidth * (SVG_BORDER / SVG_WIDTH));
  const borderY = Math.round(frameHeight * (SVG_BORDER / SVG_HEIGHT));

  // Inner area for content
  const innerWidth = frameWidth - borderX * 2;
  const innerHeight = frameHeight - borderY * 2;

  // Center content within inner area
  const contentPosX = borderX + Math.round((innerWidth - contentWidth) / 2);
  const contentPosY = borderY + Math.round((innerHeight - contentHeight) / 2);

  // Total dimensions including header/footer
  const totalWidth = frameWidth;
  const totalHeight = frameHeight + headerHeight + footerHeight;

  return (
    <div
      className="mushaf-border-container"
      style={{
        position: 'relative',
        width: totalWidth,
        height: totalHeight,
        backgroundColor: 'var(--mushaf-frame-bg, #e8e4d0)',
        overflow: 'visible',
      }}
    >
      {/* Header with surah name and juz - outside border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        direction: 'rtl',
        fontFamily: 'var(--font-arabic, "Amiri", "Traditional Arabic", serif)',
        fontSize: 12 * scale,
        color: 'var(--mushaf-metadata-text, #3E9257)',
        padding: `0 ${borderX}px`,
      }}>
        <span>{juzName}{verseNumberFormat === 'arabic' && <span style={{ fontSize: '1.2em' }}> {toArabicNumerals(juzNumber)}</span>}{verseNumberFormat === 'english' && <span style={{ fontSize: '0.8em' }}> [Juz <span style={{ fontSize: '1.1em' }}>{juzNumber}</span>]</span>}</span>
        <span>سورة {surahName}{verseNumberFormat === 'english' && <span style={{ fontSize: '0.8em' }}> [{surahNameEnglish}]</span>}</span>
      </div>

      {/* Main border frame - using SVG as background image */}
      <div style={{
        position: 'absolute',
        top: headerHeight,
        left: 0,
        width: frameWidth,
        height: frameHeight,
        backgroundImage: `url('/quran/assets/borders/green/full-border.svg')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}>
        {/* Page content - positioned inside the border */}
        <div style={{
          position: 'absolute',
          top: contentPosY,
          left: contentPosX,
          width: contentWidth,
          height: contentHeight,
          backgroundColor: 'var(--mushaf-page-bg, #fffef5)',
          overflow: 'hidden',
        }}>
          {children}
        </div>
      </div>

      {/* Footer with page number - outside border */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: footerHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'var(--font-arabic, "Amiri", "Traditional Arabic", serif)',
        fontSize: 16 * scale,
        color: 'var(--mushaf-metadata-text, #3E9257)',
      }}>
        <span>{pageNumberArabic}</span>
      </div>
    </div>
  );
}

export default MushafBorder;
