import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  QuranProvider,
  QuranViewer,
  useDigitalKhatt,
  getWordsForVerse,
  LAYOUT_TYPE_MAP,
  type MushafLayoutTypeString,
  type WordClickInfo,
  type VerseClickInfo,
} from '../../digitalkhatt-react/src/lib';
import { quranText as indoPakText } from '../../digitalkhatt-react/src/lib/data/quran_text_indopak_15';
import { quranText as newMadinahText } from '../../digitalkhatt-react/src/lib/data/quran_text_madina';
import { quranText as oldMadinahText } from '../../digitalkhatt-react/src/lib/data/quran_text_old_madinah';
import { useSettings } from '../contexts/SettingsContext';
import { useAudio } from '../hooks/useAudio';
import { useMobileNav } from '../contexts/MobileNavContext';
import { useMenu } from '../App';
import { AudioPlayer } from './AudioPlayer';
import { IntroPage } from './IntroPage';
import { TajweedGuide } from './TajweedGuide';
import { MUSHAF_PAGE_COUNTS } from '../config/constants';
import type { MushafScript } from '../config/types';

// ============================================
// Configuration
// ============================================

// Note: These are relative to the base path (/quran/) which Vite handles via import.meta.env.BASE_URL
const WASM_URL = import.meta.env.BASE_URL + 'wasm/hb.wasm';
const FONT_URLS = {
  newMadinah: import.meta.env.BASE_URL + 'fonts/newmadinah.otf',
  oldMadinah: import.meta.env.BASE_URL + 'fonts/oldmadinah.otf',
  indoPak15: import.meta.env.BASE_URL + 'fonts/indopak15.otf',
};

const QURAN_TEXT = {
  newMadinah: newMadinahText,
  oldMadinah: oldMadinahText,
  indoPak15: indoPakText,
};

// ============================================
// Hooks
// ============================================

// Hook to detect if we're on mobile (respects layoutMode setting)
// Uses zoom-compensated viewport width to prevent mode switching during browser zoom
function useIsMobile(layoutMode: 'auto' | 'desktop' | 'mobile' = 'auto') {
  // Capture the base devicePixelRatio on initial load (before any zoom changes)
  const baseDprRef = useRef<number | null>(null);

  const [isMobile, setIsMobile] = useState(() => {
    if (layoutMode === 'desktop') return false;
    if (layoutMode === 'mobile') return true;
    if (typeof window === 'undefined') return false;

    // Initialize baseDpr
    baseDprRef.current = window.devicePixelRatio;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    if (layoutMode === 'desktop') {
      setIsMobile(false);
      return;
    }
    if (layoutMode === 'mobile') {
      setIsMobile(true);
      return;
    }

    // Initialize baseDpr if not set
    if (baseDprRef.current === null) {
      baseDprRef.current = window.devicePixelRatio;
    }

    const checkMobile = () => {
      const baseDpr = baseDprRef.current ?? 1;
      const currentDpr = window.devicePixelRatio;

      // Calculate zoom factor relative to initial page load
      // If user zoomed in, currentDpr > baseDpr
      const zoomFactor = currentDpr / baseDpr;

      // Compensate for zoom: multiply innerWidth by zoom factor
      // to get the "original" width before zoom was applied
      const compensatedWidth = window.innerWidth * zoomFactor;

      setIsMobile(compensatedWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [layoutMode]);

  return isMobile;
}

// Hook to track window dimensions for responsive layout
// Uses a stable height reference to prevent layout shifts when mobile browser UI appears/disappears
function useWindowDimensions() {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') return { width: 0, height: 0, stableHeight: 0 };
    const currentHeight = window.visualViewport?.height ?? window.innerHeight;
    return {
      width: window.innerWidth,
      height: currentHeight,
      // stableHeight tracks the maximum height seen (the "large viewport" when URL bar is hidden)
      // This prevents layout shifts when browser chrome appears/disappears
      stableHeight: currentHeight,
    };
  });

  useEffect(() => {
    const updateDimensions = () => {
      const currentHeight = window.visualViewport?.height ?? window.innerHeight;
      setDimensions(prev => {
        const newWidth = window.innerWidth;
        // Only update stableHeight if width changed (true resize) or height increased
        // This captures the "large viewport" height and keeps it stable when URL bar appears
        const widthChanged = newWidth !== prev.width;
        const newStableHeight = widthChanged
          ? currentHeight
          : Math.max(prev.stableHeight, currentHeight);

        return {
          width: newWidth,
          height: currentHeight,
          stableHeight: newStableHeight,
        };
      });
    };

    // Listen to both window resize and visualViewport resize
    window.addEventListener('resize', updateDimensions);
    window.visualViewport?.addEventListener('resize', updateDimensions);

    // Initial update
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.visualViewport?.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return dimensions;
}

// ============================================
// Inner Component (uses context)
// ============================================

interface MushafContentProps {
  onOpenMenu?: () => void;
  audio: ReturnType<typeof useAudio>;
  isMobile: boolean;
  mushafScript: MushafScript;
}

function MushafContent({ onOpenMenu, audio, isMobile, mushafScript }: MushafContentProps) {
  const navigate = useNavigate();
  const { pageNumber: pageParam } = useParams();
  const { isMenuOpen } = useMenu();
  const { registerScrollContainer } = useMobileNav();
  const {
    theme,
    highlightedVerseKey,
    setHighlightedVerseKey,
    highlightedWordInfo,
    setHighlightedWordInfo,
    tajweedEnabled,
    mushafZoom,
    setMushafZoom,
    mushafFontScale,
    verseNumberFormat,
  } = useSettings();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isReady, getVerseMapping } = useDigitalKhatt();
  const windowDimensions = useWindowDimensions();
  const [tajweedGuideOpen, setTajweedGuideOpen] = useState(false);

  // Calculate responsive page dimensions for mobile single-page mode
  // The page should fit entirely on screen without showing other pages
  // Page aspect ratio: height/width = 410/255 ≈ 1.608
  // Border adds: 25px on each side (50 total width), 25px top/bottom border + 24px header + 32px footer (106 total height)
  const mobilePageDimensions = useMemo(() => {
    const BORDER_WIDTH = 50; // 25px each side
    const BORDER_HEIGHT = 106; // 25*2 (top/bottom) + 24 (header) + 32 (footer)
    const PAGE_ASPECT_RATIO = 410 / 255; // height / width ≈ 1.608

    // Calculate max page width based on available screen width
    const availableWidth = windowDimensions.width - 4;
    const maxPageWidth = availableWidth - BORDER_WIDTH;

    // Calculate ideal page width based on stable height (to fill vertical space)
    // Uses stableHeight to prevent layout shifts when mobile browser URL bar appears/disappears
    // Header ~56px, bottom nav area ~60px, some padding ~8px
    const availableHeight = windowDimensions.stableHeight - 56 - 60 - 8;
    const pageContentHeight = availableHeight - BORDER_HEIGHT;
    const idealPageWidthFromHeight = pageContentHeight / PAGE_ASPECT_RATIO;

    // Use height-based width but constrain to not exceed screen width
    const pageWidth = Math.max(200, Math.min(maxPageWidth, idealPageWidthFromHeight));

    return { pageWidth };
  }, [windowDimensions.width, windowDimensions.stableHeight]);

  // Page calculation
  const page = pageParam ? parseInt(pageParam) : 2;
  const totalPages = MUSHAF_PAGE_COUNTS[mushafScript];
  // Convert app page to quran page (app page 2 = quran page 1)
  const quranPage = Math.min(Math.max(page - 1, 1), totalPages);

  const isAudioActive = audio.isPlaying || audio.duration > 0;

  // Layout type for QuranViewer
  const layoutType: MushafLayoutTypeString = mushafScript;
  const layoutTypeNum = LAYOUT_TYPE_MAP[layoutType];

  // Get verse mapping for word position lookup
  const verseMapping = useMemo(
    () => getVerseMapping(layoutTypeNum),
    [getVerseMapping, layoutTypeNum]
  );

  // Use refs for audio methods to avoid recreating callbacks on audio state changes
  const audioRef = useRef(audio);
  audioRef.current = audio;

  // Register scroll container with mobile nav context
  useEffect(() => {
    registerScrollContainer(scrollContainerRef.current);
    return () => registerScrollContainer(null);
  }, [registerScrollContainer]);

  // Handle page navigation
  const handlePageChange = useCallback((newPage: number) => {
    console.log('handlePageChange called with:', newPage, 'totalPages:', totalPages);
    if (newPage >= 1 && newPage <= totalPages) {
      // Convert quran page to app page (add 1 for intro page offset)
      const targetUrl = `/mushaf/${newPage + 1}`;
      console.log('Navigating to:', targetUrl);
      navigate(targetUrl);
    } else {
      console.log('Page out of range, not navigating');
    }
  }, [navigate, totalPages]);

  // Handle word click - play word audio
  // Uses audioRef to avoid recreating callback on audio state changes
  const handleWordClick = useCallback((info: WordClickInfo) => {
    if (!info.surah || !info.ayah) return;

    const isIndoPak = mushafScript === 'indoPak15';

    // For Al-Fatiha (surah 1) word-by-word audio:
    // - IndoPak: Bismillah is unnumbered (ayah 0), text ayah 1 = audio verse 2 (needs +1)
    // - Madinah: Bismillah IS verse 1 with word audio, text ayah = audio ayah (no offset)
    const audioAyah = (info.surah === 1 && isIndoPak) ? info.ayah + 1 : info.ayah;

    const verseKey = `${info.surah}:${info.ayah}`;
    const audioVerseKey = `${info.surah}:${audioAyah}`;

    // Get verse mapping to find word position within verse
    if (verseMapping) {
      // Get all words in this verse (in order)
      const verseWords = getWordsForVerse(verseMapping, info.surah, info.ayah);

      // Find this word's position (1-indexed for audio URL)
      // Note: pageNumber is 1-indexed, mapping uses 0-indexed page
      const wordPosition = verseWords.findIndex(w =>
        w.page === info.pageNumber - 1 &&
        w.line === info.lineIndex &&
        w.word === info.wordIndex
      ) + 1;

      if (wordPosition > 0) {
        // Build word audio URL: wbw/{chapter}_{verse}_{position}.mp3
        const paddedChapter = String(info.surah).padStart(3, '0');
        const paddedVerse = String(audioAyah).padStart(3, '0');
        const paddedPosition = String(wordPosition).padStart(3, '0');
        const wordAudioUrl = `wbw/${paddedChapter}_${paddedVerse}_${paddedPosition}.mp3`;

        // Highlight the clicked word using shared state (verseKey + wordPosition + pageNumber)
        // pageNumber is stored as UI page (from URL) for consistent navigation when switching views
        setHighlightedWordInfo({ verseKey, wordPosition, pageNumber: page });
        setHighlightedVerseKey(null); // Clear verse highlight for word playback
        audioRef.current.playWord(wordAudioUrl);
        return;
      }
    }

    // Fallback: play verse audio if word mapping fails
    setHighlightedWordInfo(null); // Clear word highlight
    setHighlightedVerseKey(verseKey);
    audioRef.current.playVerse(audioVerseKey);
  }, [verseMapping, setHighlightedVerseKey, setHighlightedWordInfo, page, mushafScript]);

  // Use refs for values needed in async callbacks to avoid stale closures
  const verseMappingRef = useRef(verseMapping);
  verseMappingRef.current = verseMapping;
  const handlePageChangeRef = useRef(handlePageChange);
  handlePageChangeRef.current = handlePageChange;

  // Handle verse click (verse marker) - play full verse or surah
  // Uses audioRef to avoid recreating callback on audio state changes
  const handleVerseClick = useCallback((info: VerseClickInfo) => {
    setHighlightedWordInfo(null); // Clear word highlight

    // Check if this is IndoPak mushaf - only IndoPak needs audio offset for Al-Fatiha
    // In IndoPak: Bismillah is unnumbered (ayah 0), so text ayah 1 = audio verse 2
    // In Madinah: Bismillah IS verse 1, so text ayah = audio ayah (no offset needed)
    const isIndoPak = mushafScript === 'indoPak15';

    // Bismillah click (ayah === 0) OR Madinah Fatiha verse 1 - play entire surah
    // In Madinah script, Fatiha's bismillah IS verse 1 (not unnumbered like IndoPak)
    const isMadinahFatihaBismillah = !isIndoPak && info.surah === 1 && info.ayah === 1;
    if (info.ayah === 0 || isMadinahFatihaBismillah) {
      // Start surah playback with verse highlighting callback
      audioRef.current.playSurah(info.surah, (audioVerseKey: string) => {
        // For Al-Fatiha with IndoPak, audio verse numbers are offset by 1 from text verse numbers
        // Audio verse 1 = Bismillah = Text ayah 0
        // Audio verse 2 = Al-hamdu lillah = Text ayah 1, etc.
        // For Madinah, no offset needed as Bismillah is verse 1
        const [surah, audioAyah] = audioVerseKey.split(':').map(Number);
        const textAyah = (surah === 1 && isIndoPak) ? audioAyah - 1 : audioAyah;
        setHighlightedVerseKey(`${surah}:${textAyah}`);

        // Auto-navigate to the page containing this verse
        const mapping = verseMappingRef.current;
        if (mapping) {
          const words = getWordsForVerse(mapping, surah, textAyah);
          if (words.length > 0) {
            // words[0].page is 0-indexed, handlePageChange expects 1-indexed quran page
            const versePage = words[0].page + 1;
            handlePageChangeRef.current(versePage);
          }
        }
      });
      return;
    }

    // Regular verse click - play single verse
    // For Al-Fatiha (surah 1) with IndoPak, the audio files treat Bismillah as verse 1,
    // but IndoPak text has Bismillah unnumbered and starts numbering from "الحمد لله".
    // So we need to add 1 to the ayah number for audio playback in Al-Fatiha.
    // For Madinah mushafs, no offset needed as verse numbers match audio.
    const audioAyah = (info.surah === 1 && isIndoPak) ? info.ayah + 1 : info.ayah;
    const verseKey = `${info.surah}:${info.ayah}`;
    const audioVerseKey = `${info.surah}:${audioAyah}`;
    setHighlightedVerseKey(verseKey);
    audioRef.current.playVerse(audioVerseKey);
  }, [setHighlightedVerseKey, mushafScript]);

  // Build highlight groups for verse and word highlighting
  // quranPage is 1-indexed (1-610), pageIndex is 0-indexed for DigitalKhatt coordinates
  const pageIndex = quranPage - 1;

  const highlightGroups = useMemo(() => {
    const groups = [];
    const highlightColor = theme === 'dark' ? 'rgba(212, 168, 85, 0.3)' : 'rgba(201, 162, 39, 0.3)';

    // Add verse highlight if active
    if (highlightedVerseKey) {
      const [surah, ayah] = highlightedVerseKey.split(':').map(Number);
      groups.push({
        verses: [{ surah, ayah }],
        color: highlightColor,
      });
    }

    // Add word highlight if active - convert from verseKey+position to page/line/word coordinates
    if (highlightedWordInfo) {
      const [surah, ayah] = highlightedWordInfo.verseKey.split(':').map(Number);
      let wordHighlighted = false;

      // Try to find exact word coordinates in DigitalKhatt mapping
      if (verseMapping) {
        const verseWords = getWordsForVerse(verseMapping, surah, ayah);
        const wordCoords = verseWords[highlightedWordInfo.wordPosition - 1]; // wordPosition is 1-indexed
        // Only use word highlight if the word is on the current page
        // API word positions may not match DigitalKhatt's mapping, which could point to wrong page
        if (wordCoords && wordCoords.page === pageIndex) {
          groups.push({
            words: [wordCoords],
            color: highlightColor,
          });
          wordHighlighted = true;
        }
      }

      // Fall back to verse highlight if word not found or not on current page
      if (!wordHighlighted) {
        groups.push({
          verses: [{ surah, ayah }],
          color: highlightColor,
        });
      }
    }

    return groups;
  }, [highlightedVerseKey, highlightedWordInfo, verseMapping, theme, pageIndex]);

  if (!isReady) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--mushaf-bg)]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--mushaf-accent)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--mushaf-text-secondary)]">Loading Quran viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)] ${isMobile ? 'overflow-visible' : ''}`}>
      {/* Main Mushaf area with navigation arrows */}
      <div className={`flex-1 flex items-stretch relative min-h-0 ${isMobile ? 'overflow-visible' : 'overflow-hidden'}`}>
        {/* Left arrow - Previous page (desktop only) */}
        <button
          onClick={() => handlePageChange(quranPage - 1)}
          disabled={quranPage <= 1}
          className="hidden lg:flex items-center justify-center w-16 xl:w-20 bg-[var(--mushaf-arrow-bg)] hover:bg-[var(--mushaf-arrow-hover)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors group"
          aria-label="Previous page"
        >
          <span className="text-3xl xl:text-4xl text-[var(--mushaf-arrow-color)] group-hover:opacity-80 transition-colors">←</span>
        </button>

        {/* Mushaf content */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 min-h-0 min-w-0 ${isMobile ? 'flex justify-center items-start pt-1 overflow-visible' : 'h-full'} ${isAudioActive ? 'pb-20 lg:pb-24' : ''}`}
        >
          {isMobile ? (
            /* Mobile view - single page mode, page fits exactly on screen */
            <QuranViewer
              layoutType={layoutType}
              initialPage={quranPage}
              width="100%"
              height="100%"
              pageWidth={mobilePageDimensions.pageWidth}
              scale={mushafZoom}
              onScaleChange={setMushafZoom}
              fontScale={mushafFontScale}
              tajweedEnabled={tajweedEnabled}
              verseNumberFormat={verseNumberFormat}
              backgroundColor={theme === 'dark' ? '#1a1a1a' : '#f5f5f0'}
              showBorder={true}
              singlePageMode={true}
              highlightGroups={highlightGroups}
              onWordClick={handleWordClick}
              onVerseClick={handleVerseClick}
              onPageChange={handlePageChange}
            />
          ) : (
            <QuranViewer
              layoutType={layoutType}
              initialPage={quranPage}
              width="100%"
              height="100%"
              pageWidth={400}
              scale={mushafZoom}
              onScaleChange={setMushafZoom}
              fontScale={mushafFontScale}
              tajweedEnabled={tajweedEnabled}
              verseNumberFormat={verseNumberFormat}
              backgroundColor={theme === 'dark' ? '#1a1a1a' : '#f5f5f0'}
              pageGap={30}
              showBorder={true}
              highlightGroups={highlightGroups}
              onWordClick={handleWordClick}
              onVerseClick={handleVerseClick}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Right arrow - Next page (desktop only) */}
        <button
          onClick={() => handlePageChange(quranPage + 1)}
          disabled={quranPage >= totalPages}
          className="hidden lg:flex items-center justify-center w-16 xl:w-20 bg-[var(--mushaf-arrow-bg)] hover:bg-[var(--mushaf-arrow-hover)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors group"
          aria-label="Next page"
        >
          <span className="text-3xl xl:text-4xl text-[var(--mushaf-arrow-color)] group-hover:opacity-80 transition-colors">→</span>
        </button>
      </div>

      {/* Mobile navigation buttons - hidden when menu is open */}
      {!isMenuOpen && (
        <div
          className={`lg:hidden fixed left-0 right-0 z-[55] pointer-events-none transition-all duration-300 ${isAudioActive ? 'bottom-16' : 'bottom-2'}`}
        >
          {/* Center - Page info and menu button */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-auto">
            <button
              onClick={onOpenMenu}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--mushaf-page-bg)]/95 backdrop-blur-sm rounded-full border border-[var(--mushaf-border)] shadow-lg"
              aria-label="Open menu"
            >
              <span className="text-sm text-[var(--mushaf-text-primary)]">
                {quranPage} / {totalPages}
              </span>
              <svg className="w-4 h-4 text-[var(--mushaf-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Left side - Previous button + Tajweed info button (when enabled) */}
          <div className="absolute left-2 bottom-0 pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => handlePageChange(quranPage - 1)}
              disabled={quranPage <= 1}
              className="h-11 px-5 rounded-full bg-[var(--mushaf-page-bg)]/95 backdrop-blur-sm border border-[var(--mushaf-border)] shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
              aria-label={`Go to previous page ${quranPage - 1}`}
            >
              <span className="text-xl text-[var(--mushaf-arrow-color)]">←</span>
            </button>
            {/* Tajweed info button - only shown when tajweed is enabled */}
            {tajweedEnabled && (
              <button
                onClick={() => setTajweedGuideOpen(true)}
                className="h-11 w-11 rounded-full bg-[var(--mushaf-page-bg)]/95 backdrop-blur-sm border border-[var(--mushaf-border)] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Open Tajweed color guide"
              >
                <svg className="w-5 h-5 text-[var(--mushaf-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Right side - Next button (pill shape) */}
          <div className="absolute right-2 bottom-0 pointer-events-auto">
            <button
              onClick={() => handlePageChange(quranPage + 1)}
              disabled={quranPage >= totalPages}
              className="h-11 px-5 rounded-full bg-[var(--mushaf-page-bg)]/95 backdrop-blur-sm border border-[var(--mushaf-border)] shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
              aria-label={`Go to next page ${quranPage + 1}`}
            >
              <span className="text-xl text-[var(--mushaf-arrow-color)]">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Tajweed Color Guide - floating button hidden on mobile (rendered in nav above) */}
      <TajweedGuide
        isAudioActive={isAudioActive}
        hideFloatingButton={isMobile}
        isOpen={tajweedGuideOpen}
        onOpenChange={setTajweedGuideOpen}
      />

      {/* Audio Player */}
      <AudioPlayer
        isPlaying={audio.isPlaying}
        currentTime={audio.currentTime}
        duration={audio.duration}
        isLooping={audio.isLooping}
        onPause={audio.pause}
        onResume={audio.resume}
        onStop={audio.stop}
        onSeek={audio.seek}
        onToggleLoop={audio.toggleLoop}
        onDismiss={() => {
          setHighlightedWordInfo(null);
          setHighlightedVerseKey(null);
        }}
      />
    </div>
  );
}

// ============================================
// Main Component (wraps with QuranProvider)
// ============================================

interface DigitalKhattMushafViewProps {
  onOpenMenu?: () => void;
}

export function DigitalKhattMushafView({ onOpenMenu }: DigitalKhattMushafViewProps) {
  const { pageNumber: pageParam } = useParams();
  const navigate = useNavigate();
  const { layoutMode, mushafScript } = useSettings();
  const audio = useAudio();
  const isMobile = useIsMobile(layoutMode);

  const page = pageParam ? parseInt(pageParam) : 2;

  // Handle intro page (page 1)
  if (page === 1) {
    return (
      <IntroPage
        onStartReading={() => navigate('/mushaf/2')}
      />
    );
  }

  return (
    <QuranProvider
      wasmUrl={WASM_URL}
      fonts={FONT_URLS}
      quranText={QURAN_TEXT}
    >
      <MushafContent
        onOpenMenu={onOpenMenu}
        audio={audio}
        isMobile={isMobile}
        mushafScript={mushafScript}
      />
    </QuranProvider>
  );
}
