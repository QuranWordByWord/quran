/**
 * MushafBorderOrnate - Ornate decorative border for Quran pages 1-2
 *
 * Uses Misraj-style ornate design with header frame, side ornaments,
 * and decorative elements for the first two pages (Al-Fatiha and start of Al-Baqarah).
 */

import React from 'react';

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

// Page to Juz mapping (first page of each juz in Madani mushaf)
const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
  201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

// Page to Surah mapping (first page of each surah in Madani mushaf)
const SURAH_START_PAGES = [
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

function getJuzForPage(pageNumber: number): number {
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (pageNumber >= JUZ_START_PAGES[i]) {
      return i + 1;
    }
  }
  return 1;
}

function getSurahForPage(pageNumber: number): number {
  for (let i = SURAH_START_PAGES.length - 1; i >= 0; i--) {
    if (pageNumber >= SURAH_START_PAGES[i]) {
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

export interface MushafBorderOrnateProps {
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
  /** Children (page content) */
  children: React.ReactNode;
}

export function MushafBorderOrnate({
  pageNumber,
  contentWidth,
  contentHeight,
  scale,
  children,
}: MushafBorderOrnateProps) {
  const surahNumber = getSurahForPage(pageNumber);
  const juzNumber = getJuzForPage(pageNumber);
  const surahName = SURAH_NAMES_ARABIC[surahNumber] || '';
  const juzName = JUZ_NAMES_ARABIC[juzNumber] || '';
  const pageNumberArabic = toArabicNumerals(pageNumber);

  // Ornate border dimensions - larger than standard border
  const outerBorderSize = 20 * scale;
  const headerHeight = 60 * scale;
  const footerHeight = 40 * scale;
  const sideOrnamentWidth = 25 * scale;
  const innerPadding = 8 * scale;

  // Total dimensions including ornate frame
  const totalWidth = contentWidth + (outerBorderSize + sideOrnamentWidth + innerPadding) * 2;
  const totalHeight = contentHeight + headerHeight + footerHeight + outerBorderSize * 2;

  // Asset URLs
  const baseUrl = '/quran/assets/borders/green';
  const headerFrameUrl = `${baseUrl}/header-frame.svg`;
  const ornamentLeftUrl = `${baseUrl}/ornament-left.svg`;
  const ornamentRightUrl = `${baseUrl}/ornament-right.svg`;

  return (
    <div
      className="mushaf-border-ornate-container"
      style={{
        position: 'relative',
        width: totalWidth,
        height: totalHeight,
        backgroundColor: 'var(--mushaf-frame-bg, #e8e4d0)',
      }}
    >
      {/* Outer zigzag/scalloped border frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `${outerBorderSize}px solid var(--mushaf-border, #3E9257)`,
          background: `
            linear-gradient(135deg, var(--mushaf-border, #3E9257) 25%, transparent 25%) -${outerBorderSize/2}px 0,
            linear-gradient(225deg, var(--mushaf-border, #3E9257) 25%, transparent 25%) -${outerBorderSize/2}px 0,
            linear-gradient(315deg, var(--mushaf-border, #3E9257) 25%, transparent 25%),
            linear-gradient(45deg, var(--mushaf-border, #3E9257) 25%, transparent 25%)
          `,
          backgroundSize: `${outerBorderSize}px ${outerBorderSize}px`,
          backgroundPosition: `0 0, ${outerBorderSize/2}px 0, ${outerBorderSize/2}px -${outerBorderSize/2}px, 0px ${outerBorderSize/2}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Header with ornate frame containing surah name and juz */}
      <div
        style={{
          position: 'absolute',
          top: outerBorderSize,
          left: outerBorderSize,
          right: outerBorderSize,
          height: headerHeight,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Header frame SVG background */}
        <img
          src={headerFrameUrl}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        {/* Surah name overlay - positioned in center of header frame */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '60%',
            direction: 'rtl',
            fontFamily: 'var(--font-arabic, "Amiri", "Traditional Arabic", serif)',
            fontSize: 14 * scale,
            color: 'var(--mushaf-border, #3E9257)',
          }}
        >
          <span>{juzName}</span>
          <span>سورة {surahName}</span>
        </div>
      </div>

      {/* Main content area with inner decorations */}
      <div
        style={{
          position: 'absolute',
          top: outerBorderSize + headerHeight,
          left: outerBorderSize,
          right: outerBorderSize,
          bottom: outerBorderSize + footerHeight,
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {/* Left ornament */}
        <div
          style={{
            width: sideOrnamentWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={ornamentLeftUrl}
            alt=""
            style={{
              height: '50%',
              maxHeight: 200 * scale,
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Inner content with gold accent border */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: innerPadding,
          }}
        >
          {/* Gold accent inner border */}
          <div
            style={{
              flex: 1,
              border: `3px solid var(--mushaf-accent, #c9a227)`,
              backgroundColor: 'var(--mushaf-page-bg, #fffef5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Green inner border */}
            <div
              style={{
                width: contentWidth,
                height: contentHeight,
                border: `2px solid var(--mushaf-border, #3E9257)`,
                overflow: 'hidden',
              }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Right ornament */}
        <div
          style={{
            width: sideOrnamentWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={ornamentRightUrl}
            alt=""
            style={{
              height: '50%',
              maxHeight: 200 * scale,
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      {/* Footer with page number */}
      <div
        style={{
          position: 'absolute',
          bottom: outerBorderSize,
          left: outerBorderSize,
          right: outerBorderSize,
          height: footerHeight,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'var(--font-arabic, "Amiri", "Traditional Arabic", serif)',
          fontSize: 18 * scale,
          color: 'var(--mushaf-border, #3E9257)',
        }}
      >
        <span>{pageNumberArabic}</span>
      </div>
    </div>
  );
}

export default MushafBorderOrnate;
