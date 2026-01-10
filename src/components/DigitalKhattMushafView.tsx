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
import { MushafToolbar } from './MushafToolbar';
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
    setTajweedEnabled,
    mushafZoom,
    setMushafZoom,
    mushafFontScale,
    setMushafFontScale,
    setMushafScript,
    verseNumberFormat,
  } = useSettings();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isReady, getVerseMapping } = useDigitalKhatt();

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
    if (newPage >= 1 && newPage <= totalPages) {
      // Convert quran page to app page (add 1 for intro page offset)
      navigate(`/mushaf/${newPage + 1}`);
    }
  }, [navigate, totalPages]);

  // Handle word click - play word audio
  const handleWordClick = useCallback((info: WordClickInfo) => {
    if (!info.surah || !info.ayah) return;

    const verseKey = `${info.surah}:${info.ayah}`;

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
        const paddedVerse = String(info.ayah).padStart(3, '0');
        const paddedPosition = String(wordPosition).padStart(3, '0');
        const wordAudioUrl = `wbw/${paddedChapter}_${paddedVerse}_${paddedPosition}.mp3`;

        setHighlightedVerseKey(null); // Clear verse highlight for word playback
        audio.playWord(wordAudioUrl);
        return;
      }
    }

    // Fallback: play verse audio if word mapping fails
    setHighlightedVerseKey(verseKey);
    audio.playVerse(verseKey);
  }, [verseMapping, setHighlightedVerseKey, audio]);

  // Handle verse click (verse marker) - play full verse
  const handleVerseClick = useCallback((info: VerseClickInfo) => {
    const verseKey = `${info.surah}:${info.ayah}`;
    setHighlightedVerseKey(verseKey);
    audio.playVerse(verseKey);
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

  // Handle script change - navigate to equivalent page
  const handleScriptChange = useCallback((newScript: MushafScript) => {
    setMushafScript(newScript);
    // Note: Page mapping will be handled automatically since we're using the same page number
    // The content will shift to the equivalent content in the new script
  }, [setMushafScript]);

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
    <div className="flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)]">
      {/* Main Mushaf area with navigation arrows */}
      <div className="flex-1 flex items-stretch relative min-h-0 overflow-hidden">
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
          className={`flex-1 min-h-0 overflow-hidden flex justify-center items-center ${isAudioActive ? 'pb-20 lg:pb-24' : ''}`}
        >
          {isMobile ? (
            /* Custom decorative border for mobile */
            <div className="relative bg-[var(--mushaf-frame-bg)] p-1 rounded-sm shadow-xl mx-1 my-2">
              {/* Olive/Green ornate border - outer */}
              <div className="relative border-[3px] border-[var(--mushaf-border)] rounded-sm">
                {/* Corner ornaments - outer */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-[3px] border-l-[3px] border-[var(--mushaf-border)] rounded-tl-sm" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-[3px] border-r-[3px] border-[var(--mushaf-border)] rounded-tr-sm" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-[3px] border-l-[3px] border-[var(--mushaf-border)] rounded-bl-sm" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-[3px] border-r-[3px] border-[var(--mushaf-border)] rounded-br-sm" />

                {/* Inner gold/yellow accent border */}
                <div className="border-2 border-[var(--mushaf-accent)] m-0.5">
                  {/* Innermost content border */}
                  <div className="border border-[var(--mushaf-border)] bg-[var(--mushaf-page-bg)]">
                    <QuranViewer
                      layoutType={layoutType}
                      initialPage={quranPage}
                      width={window.innerWidth - 32}
                      height={window.innerHeight - 200}
                      pageWidth={Math.min(350, window.innerWidth - 50)}
                      scale={mushafZoom}
                      onScaleChange={setMushafZoom}
                      fontScale={mushafFontScale}
                      tajweedEnabled={tajweedEnabled}
                      verseNumberFormat={verseNumberFormat}
                      backgroundColor="transparent"
                      pageGap={0}
                      highlightGroups={highlightGroups}
                      onWordClick={handleWordClick}
                      onVerseClick={handleVerseClick}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </div>
            </div>
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

      {/* Floating toolbar - desktop (bottom center) */}
      <div className="hidden lg:block fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <MushafToolbar
          mushafScript={mushafScript}
          onScriptChange={handleScriptChange}
          tajweedEnabled={tajweedEnabled}
          onTajweedChange={setTajweedEnabled}
          zoom={mushafZoom}
          onZoomChange={setMushafZoom}
          fontScale={mushafFontScale}
          onFontScaleChange={setMushafFontScale}
          currentPage={quranPage}
          totalPages={totalPages}
          onOpenMenu={onOpenMenu}
        />
      </div>

      {/* Mobile navigation buttons - hidden when menu is open */}
      {!isMenuOpen && (
        <div
          className={`lg:hidden fixed left-0 right-0 z-[55] pointer-events-none transition-all duration-300 ${isAudioActive ? 'bottom-16' : 'bottom-2'}`}
        >
          {/* Center - Toolbar */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-auto">
            <MushafToolbar
              mushafScript={mushafScript}
              onScriptChange={handleScriptChange}
              tajweedEnabled={tajweedEnabled}
              onTajweedChange={setTajweedEnabled}
              zoom={mushafZoom}
              onZoomChange={setMushafZoom}
              fontScale={mushafFontScale}
              onFontScaleChange={setMushafFontScale}
              currentPage={quranPage}
              totalPages={totalPages}
              onOpenMenu={onOpenMenu}
            />
          </div>

          {/* Left side - Previous button */}
          <div className="absolute left-2 bottom-0">
            <button
              onClick={() => handlePageChange(quranPage - 1)}
              disabled={quranPage <= 1}
              className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--mushaf-page-bg)]/90 border border-[var(--mushaf-border)] shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
              aria-label="Previous page"
            >
              <span className="text-xl text-[var(--mushaf-arrow-color)]">←</span>
            </button>
          </div>

          {/* Right side - Bookmark and Next button */}
          <div className="absolute right-2 bottom-0 flex items-center gap-2">
            {/* Bookmark button */}
            <div className="pointer-events-auto">
              <InlineBookmarkButton pageNumber={page} viewMode="mushaf" />
            </div>
            {/* Next button */}
            <button
              onClick={() => handlePageChange(quranPage + 1)}
              disabled={quranPage >= totalPages}
              className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--mushaf-page-bg)]/90 border border-[var(--mushaf-border)] shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
              aria-label="Next page"
            >
              <span className="text-xl text-[var(--mushaf-arrow-color)]">→</span>
            </button>
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
