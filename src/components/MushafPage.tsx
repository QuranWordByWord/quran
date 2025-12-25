import { useState, useRef, useMemo, useEffect } from 'react';
import type { Verse, Word } from '../types/quran';
import { useFontClass, useVerseNumberFormat } from '../App';
import { useMobileNav } from '../contexts/MobileNavContext';


// Calculate proportional width weight based on word character count
function getWordWeight(word: Word): number {
  if (word.char_type_name === 'end') return 10; // Verse markers need more space to avoid overlap
  const text = word.text || word.text_uthmani || '';
  // Give extra weight to longer words so they have more space
  const len = text.length;
  if (len > 8) return len * 1.3; // Long words get 30% more space
  if (len > 5) return len * 1.15; // Medium words get 15% more space
  return Math.max(len, 2); // Minimum weight of 2
}

interface MushafPageProps {
  verses: Verse[];
  loading: boolean;
  error: Error | null;
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPlayWord?: (audioUrl: string | null) => void;
  onPlayVerse?: (verseKey: string) => void;
  isAudioActive?: boolean;
  onOpenMenu?: () => void;
}

// Line content type - can be words, surah header, or bismillah
interface LineContent {
  type: 'words' | 'surah-header' | 'bismillah';
  lineNumber: number;
  words?: { word: Word; verseNumber: number; surahNumber: number }[];
  surahNumber?: number;
}

// Get Juz name in Arabic
function getJuzName(juzNumber: number): string {
  const juzNames: Record<number, string> = {
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
  return juzNames[juzNumber] || `الجزء ${juzNumber}`;
}

export function MushafPage({
  verses,
  loading,
  error,
  pageNumber,
  totalPages,
  onPageChange,
  onPlayWord,
  onPlayVerse,
  isAudioActive = false,
  onOpenMenu,
}: MushafPageProps) {
  const fontClass = useFontClass();
  const { registerScrollContainer } = useMobileNav();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Register scroll container with mobile nav context
  useEffect(() => {
    registerScrollContainer(scrollContainerRef.current);
    return () => registerScrollContainer(null);
  }, [registerScrollContainer]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f0e6]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading page {pageNumber}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f0e6]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Error Loading Page
          </h2>
          <p className="text-[var(--color-text-secondary)]">{error.message}</p>
        </div>
      </div>
    );
  }

  // Get page info
  const juzNumber = verses.length > 0 ? verses[0].juz_number : 1;
  const lastChapter = verses.length > 0 ? parseInt(verses[verses.length - 1].verse_key.split(':')[0]) : 1;

  // Group words by their actual line numbers from the API
  const lineMap = new Map<number, { word: Word; verseNumber: number; surahNumber: number }[]>();

  verses.forEach(verse => {
    const surahNum = parseInt(verse.verse_key.split(':')[0]);

    verse.words.forEach(word => {
      const lineNum = word.line_number || 1;

      if (!lineMap.has(lineNum)) {
        lineMap.set(lineNum, []);
      }

      lineMap.get(lineNum)!.push({
        word,
        verseNumber: verse.verse_number,
        surahNumber: surahNum,
      });
    });
  });

  // Convert to sorted array of lines (1-15)
  const lines: LineContent[] = [];

  // Get all line numbers and sort them
  const lineNumbers = Array.from(lineMap.keys()).sort((a, b) => a - b);

  lineNumbers.forEach(lineNum => {
    const words = lineMap.get(lineNum)!;

    // Check if this line starts a new surah (first word is verse 1)
    const firstWord = words[0];
    if (firstWord && firstWord.verseNumber === 1 && firstWord.word.position === 1) {
      // Check if this surah needs a header (not continuing from previous page)
      const surahNum = firstWord.surahNumber;

      // Add surah header
      lines.push({
        type: 'surah-header',
        lineNumber: lineNum,
        surahNumber: surahNum,
      });

      // Add bismillah for all surahs except At-Tawbah (9)
      if (surahNum !== 9 && surahNum !== 1) {
        lines.push({
          type: 'bismillah',
          lineNumber: lineNum,
        });
      }
    }

    lines.push({
      type: 'words',
      lineNumber: lineNum,
      words,
    });
  });

  return (
    <div className="flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)]">
      {/* Mushaf Page Container with side navigation */}
      <div className="flex-1 flex items-stretch relative min-h-0 overflow-hidden">
        {/* Left arrow - Previous page (desktop only) */}
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="hidden lg:flex items-center justify-center w-16 xl:w-20 bg-[var(--mushaf-arrow-bg)] hover:bg-[var(--mushaf-arrow-hover)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors group"
          aria-label="Previous page"
        >
          <span className="text-3xl xl:text-4xl text-[var(--mushaf-arrow-color)] group-hover:opacity-80 transition-colors">←</span>
        </button>

        {/* Scrollable content area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto scrollbar-none lg:scrollbar-auto"
        >
          <div className={`max-w-4xl mx-auto px-1 py-1 sm:p-4 md:p-6 lg:pb-6 ${isAudioActive ? 'pb-20' : 'pb-4'}`}>
          {/* Outer decorative frame */}
          <div className="relative bg-[var(--mushaf-frame-bg)] p-1 sm:p-1.5 rounded-sm shadow-xl">
            {/* Olive/Green ornate border - outer */}
            <div className="relative border-[3px] sm:border-4 border-[var(--mushaf-border)] rounded-sm">
              {/* Corner ornaments - outer */}
              <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-t-[3px] border-l-[3px] sm:border-t-4 sm:border-l-4 border-[var(--mushaf-border)] rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-t-[3px] border-r-[3px] sm:border-t-4 sm:border-r-4 border-[var(--mushaf-border)] rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-b-[3px] border-l-[3px] sm:border-b-4 sm:border-l-4 border-[var(--mushaf-border)] rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-b-[3px] border-r-[3px] sm:border-b-4 sm:border-r-4 border-[var(--mushaf-border)] rounded-br-sm" />

              {/* Inner gold/yellow accent border */}
              <div className="border-2 border-[var(--mushaf-accent)] m-0.5">
                {/* Innermost content border */}
                <div className="border border-[var(--mushaf-border)] bg-[var(--mushaf-page-bg)]">

                  {/* Page Header - Compact */}
                  <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 border-b-2 border-[var(--mushaf-border)] bg-[var(--mushaf-header-bg)]">
                    {/* Juz Info - Left side of page */}
                    <div className="text-left flex-1">
                      <span className="arabic-text text-xs sm:text-sm font-bold text-[var(--mushaf-text-header)]">
                        {getJuzName(juzNumber)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[var(--mushaf-text-secondary)] block">
                        Juz {juzNumber}
                      </span>
                    </div>

                    {/* Page Number - Center */}
                    <div className="text-center px-3">
                      <span className="text-base sm:text-lg font-bold text-[var(--mushaf-text-header)]">
                        {pageNumber}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[var(--mushaf-text-secondary)]">
                        {' '}/ {totalPages}
                      </span>
                    </div>

                    {/* Surah Name - Right side of page */}
                    <div className="text-right flex-1">
                      <span className="arabic-text text-xs sm:text-sm font-bold text-[var(--mushaf-text-header)]">
                        سورة {getSurahNameArabic(lastChapter)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[var(--mushaf-text-secondary)] block">
                        {getSurahNameEnglish(lastChapter)}
                      </span>
                    </div>
                  </div>

                  {/* Page Content - 15 Lines */}
                  <div className="p-2 sm:p-4 md:p-5 min-h-[60vh] bg-[var(--mushaf-page-bg)]">
                    {lines.map((line, index) => {
                      if (line.type === 'surah-header') {
                        return (
                          <SurahHeader
                            key={`surah-header-${line.surahNumber}-${index}`}
                            surahNumber={line.surahNumber!}
                            fontClass={fontClass}
                          />
                        );
                      }

                      if (line.type === 'bismillah') {
                        return (
                          <div key={`bismillah-${index}`} className="text-center py-2 sm:py-3">
                            <span className={`arabic-text ${fontClass} text-lg sm:text-xl md:text-2xl text-[var(--mushaf-text-header)]`}>
                              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </span>
                          </div>
                        );
                      }

                      if (line.type === 'words' && line.words) {
                        return (
                          <MushafLine
                            key={`line-${line.lineNumber}-${index}`}
                            words={line.words}
                            lineNumber={line.lineNumber}
                            onPlayWord={onPlayWord}
                            onPlayVerse={onPlayVerse}
                            fontClass={fontClass}
                            justified={pageNumber <= 3}
                          />
                        );
                      }

                      return null;
                    })}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Right arrow - Next page (desktop only) */}
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="hidden lg:flex items-center justify-center w-16 xl:w-20 bg-[var(--mushaf-arrow-bg)] hover:bg-[var(--mushaf-arrow-hover)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors group"
          aria-label="Next page"
        >
          <span className="text-3xl xl:text-4xl text-[var(--mushaf-arrow-color)] group-hover:opacity-80 transition-colors">→</span>
        </button>
      </div>

      {/* Mobile navigation buttons - always visible */}
      <div
        className={`lg:hidden fixed left-0 right-0 flex justify-between items-center px-2 z-[55] pointer-events-none transition-all duration-300 ${isAudioActive ? 'bottom-16' : 'bottom-2'}`}
      >
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--mushaf-page-bg)]/90 border border-[var(--mushaf-border)] shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
          aria-label="Previous page"
        >
          <span className="text-xl text-[var(--mushaf-arrow-color)]">←</span>
        </button>
        <button
          onClick={onOpenMenu}
          className="pointer-events-auto text-xs text-[var(--mushaf-text-secondary)] bg-[var(--mushaf-page-bg)]/90 px-3 py-1.5 rounded-full border border-[var(--mushaf-border)] shadow-md active:scale-95 transition-transform"
          aria-label="Open menu"
        >
          {pageNumber} / {totalPages}
        </button>
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--mushaf-page-bg)]/90 border border-[var(--mushaf-border)] shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
          aria-label="Next page"
        >
          <span className="text-xl text-[var(--mushaf-arrow-color)]">→</span>
        </button>
      </div>
    </div>
  );
}

// Surah Header Component
function SurahHeader({ surahNumber, fontClass }: { surahNumber: number; fontClass: string }) {
  const arabicName = getSurahNameArabic(surahNumber);
  const englishName = getSurahNameEnglish(surahNumber);
  const versesCount = getSurahVersesCount(surahNumber);

  return (
    <div className="my-3 sm:my-4">
      {/* Decorative border matching the green theme */}
      <div className="relative border-2 border-[var(--mushaf-border)] rounded bg-[var(--mushaf-header-bg)] py-3 sm:py-4 px-4">
        {/* Inner gold accent */}
        <div className="absolute inset-0.5 border border-[var(--mushaf-accent)] rounded pointer-events-none" />

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--mushaf-border)] rounded-tl -translate-x-0.5 -translate-y-0.5" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--mushaf-border)] rounded-tr translate-x-0.5 -translate-y-0.5" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--mushaf-border)] rounded-bl -translate-x-0.5 translate-y-0.5" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--mushaf-border)] rounded-br translate-x-0.5 translate-y-0.5" />

        <div className="text-center relative">
          <h2 className={`arabic-text ${fontClass} text-xl sm:text-2xl md:text-3xl text-[var(--mushaf-text-header)] mb-0.5`}>
            سورة {arabicName}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--mushaf-text-secondary)]">
            {surahNumber}. {englishName} • {versesCount} Verses
          </p>
        </div>
      </div>
    </div>
  );
}

// Mushaf Line Component - displays one line of text with expand/collapse
function MushafLine({
  words,
  onPlayWord,
  onPlayVerse,
  fontClass,
  justified = false,
}: {
  words: { word: Word; verseNumber: number; surahNumber: number }[];
  lineNumber: number;
  onPlayWord?: (audioUrl: string | null) => void;
  onPlayVerse?: (verseKey: string) => void;
  fontClass: string;
  justified?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate weights once for proportional sizing
  const wordWeights = useMemo(() =>
    words.map(item => getWordWeight(item.word)),
    [words]
  );

  const handleClick = () => {
    // Use timeout to distinguish single click from double click
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      return; // This was a double click, ignore the single click
    }

    clickTimeoutRef.current = setTimeout(() => {
      // Single click toggles translation for entire line
      setIsExpanded(prev => !prev);
      clickTimeoutRef.current = null;
    }, 200);
  };

  const handleWordDoubleClick = (audioUrl: string | null) => {
    // Cancel any pending single click
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Double click: show translations if hidden, then play audio
    setIsExpanded(true);
    if (audioUrl) {
      onPlayWord?.(audioUrl);
    }
  };

  // Calculate total weight for percentage-based widths
  const totalWeight = useMemo(() =>
    wordWeights.reduce((sum, w) => sum + w, 0),
    [wordWeights]
  );

  return (
    <div
      className={`border-b border-[var(--mushaf-border)]/20 last:border-b-0 cursor-pointer select-none transition-colors duration-200 ${
        isExpanded ? 'bg-[var(--mushaf-header-bg)]' : 'hover:bg-[var(--mushaf-header-bg)]/50'
      }`}
      onClick={handleClick}
    >
      {/* Line of Arabic words and translations */}
      <div
        className={`flex items-baseline py-1.5 sm:py-2 ${justified ? 'justify-center gap-x-1 sm:gap-x-2 px-1' : 'px-1'}`}
        style={{ direction: 'rtl' }}
      >
        {words.map((item, idx) => {
          const widthPercent = (wordWeights[idx] / totalWeight) * 100;
          return (
            <div
              key={`${item.word.id}-${idx}`}
              className="flex flex-col items-center shrink min-w-0"
              style={justified ? undefined : { width: `${widthPercent}%` }}
            >
              {/* Arabic word */}
              <WordCell
                word={item.word}
                verseNumber={item.verseNumber}
                surahNumber={item.surahNumber}
                onWordDoubleClick={handleWordDoubleClick}
                onPlayVerse={onPlayVerse}
                fontClass={fontClass}
              />

              {/* Translation directly below */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out text-center px-0.5 ${
                  isExpanded ? 'opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                }`}
                style={{ maxWidth: justified ? '80px' : undefined }}
              >
                <span
                  className={`text-[8px] sm:text-[9px] md:text-[10px] leading-tight block ${
                    item.word.char_type_name === 'end'
                      ? 'text-[var(--mushaf-accent)] font-medium'
                      : 'text-[var(--mushaf-text-secondary)]'
                  }`}
                >
                  {item.word.char_type_name === 'end'
                    ? item.verseNumber
                    : (item.word.translation?.text || '')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Word Cell Component
function WordCell({
  word,
  verseNumber,
  surahNumber,
  onWordDoubleClick,
  onPlayVerse,
  fontClass,
}: {
  word: Word;
  verseNumber: number;
  surahNumber: number;
  onWordDoubleClick?: (audioUrl: string | null) => void;
  onPlayVerse?: (verseKey: string) => void;
  fontClass: string;
}) {
  const isEndMarker = word.char_type_name === 'end';
  const { format: verseNumberFormat } = useVerseNumberFormat();

  // Calculate scale class for very long words on mobile
  const text = word.text || word.text_uthmani || '';
  const textLength = text.length;
  // Only scale down words longer than 10 characters on small screens
  const scaleClass = textLength > 12 ? 'word-scale-75' : textLength > 10 ? 'word-scale-85' : '';

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Stop propagation so line click handler doesn't fire
    e.stopPropagation();
    // Double click: show translations and play audio
    onWordDoubleClick?.(word.audio_url || null);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Single click on end marker plays the whole verse
    if (isEndMarker) {
      e.stopPropagation();
      const verseKey = `${surahNumber}:${verseNumber}`;
      onPlayVerse?.(verseKey);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`group flex flex-col items-center min-w-0 rounded transition-colors ${
        word.audio_url || isEndMarker
          ? "hover:bg-[var(--mushaf-header-bg)] active:bg-[var(--mushaf-arrow-hover)]"
          : ""
      } ${isEndMarker ? "cursor-pointer" : ""}`}
    >
      {/* Arabic Word - using selected font style */}
      {isEndMarker ? (
        // Verse marker - with optional English number overlay
        <span className="relative inline-flex items-center justify-center">
          <span
            className={`arabic-text ${fontClass} leading-relaxed px-0.5 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[var(--mushaf-accent)]`}
          >
            {word.text || word.text_uthmani}
          </span>
          {verseNumberFormat === "english" && (
            <span
              className={`absolute font-bold flex items-center justify-center transition-colors group-hover:bg-[var(--mushaf-header-bg)] bg-[var(--mushaf-page-bg)] text-[var(--mushaf-accent)] ${
                verseNumber < 10
                  ? "text-[6px] sm:text-[8px] md:text-[10px] lg:text-[12px]"
                  : verseNumber < 100
                  ? "text-[5px] sm:text-[7px] md:text-[9px] lg:text-[11px]"
                  : "text-[4px] sm:text-[6px] md:text-[8px] lg:text-[10px]"
              }`}
              style={{
                fontVariantNumeric: "tabular-nums",
                width: "73%",
                height: "23%",
                top: "58%",
                left: "50%",
                transform: "translate(-52%, -50%)",
                borderRadius: "36%",
              }}
            >
              {verseNumber}
            </span>
          )}
        </span>
      ) : (
        <span
          className={`arabic-text ${fontClass} leading-relaxed px-0.5 text-lg sm:text-xl md:text-2xl lg:text-3xl text-[var(--mushaf-text)] ${scaleClass}`}
        >
          {word.text || word.text_uthmani}
        </span>
      )}
    </div>
  );
}

// Helper functions
function getSurahNameArabic(surahNumber: number): string {
  const names: Record<number, string> = {
    1: 'الفاتحة',
    2: 'البقرة',
    3: 'آل عمران',
    4: 'النساء',
    5: 'المائدة',
    6: 'الأنعام',
    7: 'الأعراف',
    8: 'الأنفال',
    9: 'التوبة',
    10: 'يونس',
    11: 'هود',
    12: 'يوسف',
    13: 'الرعد',
    14: 'إبراهيم',
    15: 'الحجر',
    16: 'النحل',
    17: 'الإسراء',
    18: 'الكهف',
    19: 'مريم',
    20: 'طه',
    21: 'الأنبياء',
    22: 'الحج',
    23: 'المؤمنون',
    24: 'النور',
    25: 'الفرقان',
    26: 'الشعراء',
    27: 'النمل',
    28: 'القصص',
    29: 'العنكبوت',
    30: 'الروم',
    31: 'لقمان',
    32: 'السجدة',
    33: 'الأحزاب',
    34: 'سبأ',
    35: 'فاطر',
    36: 'يس',
    37: 'الصافات',
    38: 'ص',
    39: 'الزمر',
    40: 'غافر',
    41: 'فصلت',
    42: 'الشورى',
    43: 'الزخرف',
    44: 'الدخان',
    45: 'الجاثية',
    46: 'الأحقاف',
    47: 'محمد',
    48: 'الفتح',
    49: 'الحجرات',
    50: 'ق',
    51: 'الذاريات',
    52: 'الطور',
    53: 'النجم',
    54: 'القمر',
    55: 'الرحمن',
    56: 'الواقعة',
    57: 'الحديد',
    58: 'المجادلة',
    59: 'الحشر',
    60: 'الممتحنة',
    61: 'الصف',
    62: 'الجمعة',
    63: 'المنافقون',
    64: 'التغابن',
    65: 'الطلاق',
    66: 'التحريم',
    67: 'الملك',
    68: 'القلم',
    69: 'الحاقة',
    70: 'المعارج',
    71: 'نوح',
    72: 'الجن',
    73: 'المزمل',
    74: 'المدثر',
    75: 'القيامة',
    76: 'الإنسان',
    77: 'المرسلات',
    78: 'النبأ',
    79: 'النازعات',
    80: 'عبس',
    81: 'التكوير',
    82: 'الانفطار',
    83: 'المطففين',
    84: 'الانشقاق',
    85: 'البروج',
    86: 'الطارق',
    87: 'الأعلى',
    88: 'الغاشية',
    89: 'الفجر',
    90: 'البلد',
    91: 'الشمس',
    92: 'الليل',
    93: 'الضحى',
    94: 'الشرح',
    95: 'التين',
    96: 'العلق',
    97: 'القدر',
    98: 'البينة',
    99: 'الزلزلة',
    100: 'العاديات',
    101: 'القارعة',
    102: 'التكاثر',
    103: 'العصر',
    104: 'الهمزة',
    105: 'الفيل',
    106: 'قريش',
    107: 'الماعون',
    108: 'الكوثر',
    109: 'الكافرون',
    110: 'النصر',
    111: 'المسد',
    112: 'الإخلاص',
    113: 'الفلق',
    114: 'الناس',
  };
  return names[surahNumber] || `${surahNumber}`;
}

function getSurahNameEnglish(surahNumber: number): string {
  const names: Record<number, string> = {
    1: 'Al-Fatiha',
    2: 'Al-Baqara',
    3: "Al-i'Imran",
    4: 'An-Nisa',
    5: 'Al-Maida',
    6: "Al-An'am",
    7: "Al-A'raf",
    8: 'Al-Anfal',
    9: 'At-Tauba',
    10: 'Yunus',
    11: 'Hud',
    12: 'Yusuf',
    13: "Ar-Ra'd",
    14: 'Ibrahim',
    15: 'Al-Hijr',
    16: 'An-Nahl',
    17: 'Al-Isra',
    18: 'Al-Kahf',
    19: 'Maryam',
    20: 'Ta-ha',
    21: 'Al-Anbiya',
    22: 'Al-Hajj',
    23: "Al-Mu'minun",
    24: 'An-Nur',
    25: 'Al-Furqan',
    26: "Ash-Shu'ara",
    27: 'An-Naml',
    28: 'Al-Qasas',
    29: 'Al-Ankabut',
    30: 'Ar-Rum',
    31: 'Luqman',
    32: 'As-Sajda',
    33: 'Al-Ahzab',
    34: 'Saba',
    35: 'Fatir',
    36: 'Ya-Sin',
    37: 'As-Saffat',
    38: 'Sad',
    39: 'Az-Zumar',
    40: 'Ghafir',
    41: 'Fussilat',
    42: 'Ash-Shura',
    43: 'Az-Zukhruf',
    44: 'Ad-Dukhan',
    45: 'Al-Jathiya',
    46: 'Al-Ahqaf',
    47: 'Muhammad',
    48: 'Al-Fath',
    49: 'Al-Hujurat',
    50: 'Qaf',
    51: 'Adh-Dhariyat',
    52: 'At-Tur',
    53: 'An-Najm',
    54: 'Al-Qamar',
    55: 'Ar-Rahman',
    56: "Al-Waqi'a",
    57: 'Al-Hadid',
    58: 'Al-Mujadila',
    59: 'Al-Hashr',
    60: 'Al-Mumtahina',
    61: 'As-Saff',
    62: "Al-Jumu'a",
    63: 'Al-Munafiqun',
    64: 'At-Taghabun',
    65: 'At-Talaq',
    66: 'At-Tahrim',
    67: 'Al-Mulk',
    68: 'Al-Qalam',
    69: 'Al-Haqqa',
    70: "Al-Ma'arij",
    71: 'Nuh',
    72: 'Al-Jinn',
    73: 'Al-Muzzammil',
    74: 'Al-Muddaththir',
    75: 'Al-Qiyama',
    76: 'Al-Insan',
    77: 'Al-Mursalat',
    78: 'An-Naba',
    79: "An-Nazi'at",
    80: 'Abasa',
    81: 'At-Takwir',
    82: 'Al-Infitar',
    83: 'Al-Mutaffifin',
    84: 'Al-Inshiqaq',
    85: 'Al-Buruj',
    86: 'At-Tariq',
    87: "Al-A'la",
    88: 'Al-Ghashiya',
    89: 'Al-Fajr',
    90: 'Al-Balad',
    91: 'Ash-Shams',
    92: 'Al-Lail',
    93: 'Ad-Duha',
    94: 'Ash-Sharh',
    95: 'At-Tin',
    96: 'Al-Alaq',
    97: 'Al-Qadr',
    98: 'Al-Bayyina',
    99: 'Az-Zalzala',
    100: 'Al-Adiyat',
    101: "Al-Qari'a",
    102: 'At-Takathur',
    103: 'Al-Asr',
    104: 'Al-Humaza',
    105: 'Al-Fil',
    106: 'Quraish',
    107: "Al-Ma'un",
    108: 'Al-Kauthar',
    109: 'Al-Kafirun',
    110: 'An-Nasr',
    111: 'Al-Masad',
    112: 'Al-Ikhlas',
    113: 'Al-Falaq',
    114: 'An-Nas',
  };
  return names[surahNumber] || `Surah ${surahNumber}`;
}

function getSurahVersesCount(surahNumber: number): number {
  const counts: Record<number, number> = {
    1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
    11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
    21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
    31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
    41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
    51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
    61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
    71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
    81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
    91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
    101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
    111: 5, 112: 4, 113: 5, 114: 6,
  };
  return counts[surahNumber] || 0;
}
