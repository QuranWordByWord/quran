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
import { InlineBookmarkButton } from './BookmarkButton';
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
function useIsMobile(layoutMode: 'auto' | 'desktop' | 'mobile' = 'auto') {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (layoutMode === 'desktop') {
        setIsMobile(false);
      } else if (layoutMode === 'mobile') {
        setIsMobile(true);
      } else {
        // 'auto' - follow device width
        setIsMobile(window.innerWidth < 1024);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [layoutMode]);

  return isMobile;
}

// Hook to track window dimensions for responsive layout
// Uses visualViewport when available for accurate mobile measurements
function useWindowDimensions() {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.visualViewport?.height ?? window.innerHeight,
    };
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.visualViewport?.height ?? window.innerHeight,
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
    tajweedEnabled,
    mushafZoom,
    setMushafZoom,
    mushafFontScale,
    verseNumberFormat,
  } = useSettings();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isReady, getVerseMapping } = useDigitalKhatt();
  const windowDimensions = useWindowDimensions();

  // Calculate responsive page dimensions for mobile single-page mode
  // The page should fit entirely on screen without showing other pages
  // Page aspect ratio: height/width = 410/255 ≈ 1.608
  // Border adds: 25px on each side (50 total width), 25px top/bottom border + 24px header + 32px footer (106 total height)
  const mobilePageDimensions = useMemo(() => {
    const BORDER_WIDTH = 50; // 25px each side

    // Use maximum available width (edge to edge, minus tiny margin)
    const availableWidth = windowDimensions.width - 4;

    // Calculate page width to use full available width
    const pageWidth = Math.max(200, availableWidth - BORDER_WIDTH);

    return { pageWidth };
  }, [windowDimensions.width]);

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
  const handleWordClick = useCallback((info: WordClickInfo) => {
    if (!info.surah || !info.ayah) return;

    // For Al-Fatiha (surah 1), the audio files treat Bismillah as verse 1,
    // but the IndoPak mushaf text has Bismillah unnumbered and starts numbering from "الحمد لله".
    // So we need to add 1 to the ayah number for audio playback in Al-Fatiha.
    const audioAyah = info.surah === 1 ? info.ayah + 1 : info.ayah;
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

        setHighlightedVerseKey(null); // Clear verse highlight for word playback
        audio.playWord(wordAudioUrl);
        return;
      }
    }

    // Fallback: play verse audio if word mapping fails
    setHighlightedVerseKey(verseKey);
    audio.playVerse(audioVerseKey);
  }, [verseMapping, setHighlightedVerseKey, audio]);

  // Handle verse click (verse marker) - play full verse
  const handleVerseClick = useCallback((info: VerseClickInfo) => {
    // For Al-Fatiha (surah 1), the audio files treat Bismillah as verse 1,
    // but the IndoPak mushaf text has Bismillah unnumbered and starts numbering from "الحمد لله".
    // So we need to add 1 to the ayah number for audio playback in Al-Fatiha.
    const audioAyah = info.surah === 1 ? info.ayah + 1 : info.ayah;
    const verseKey = `${info.surah}:${info.ayah}`;
    const audioVerseKey = `${info.surah}:${audioAyah}`;
    setHighlightedVerseKey(verseKey);
    audio.playVerse(audioVerseKey);
  }, [setHighlightedVerseKey, audio]);

  // Build highlight groups for verse highlighting
  const highlightGroups = useMemo(() => {
    if (!highlightedVerseKey) return [];

    const [surah, ayah] = highlightedVerseKey.split(':').map(Number);
    return [{
      verses: [{ surah, ayah }],
      color: theme === 'dark' ? 'rgba(212, 168, 85, 0.3)' : 'rgba(201, 162, 39, 0.3)',
    }];
  }, [highlightedVerseKey, theme]);

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
          className={`flex-1 min-h-0 flex justify-center ${isMobile ? 'items-start pt-1 overflow-visible' : 'items-center overflow-hidden'} ${isAudioActive ? 'pb-20 lg:pb-24' : ''}`}
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

          {/* Right side - Bookmark button */}
          <div className="absolute right-2 bottom-0 pointer-events-auto">
            <InlineBookmarkButton pageNumber={quranPage} viewMode="mushaf" />
          </div>
        </div>
      )}

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
