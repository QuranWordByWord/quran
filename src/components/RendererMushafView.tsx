import { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MushafReaderProvider, Mushaf, useMushafContext } from 'misraj-mushaf-renderer';
import 'misraj-mushaf-renderer/dist/styles';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAudio } from '../hooks/useAudio';
import { useMobileNav } from '../contexts/MobileNavContext';
import { useMenu } from '../App';
import { AudioPlayer } from './AudioPlayer';
import { IntroPage } from './IntroPage';
import { RENDERER_MUSHAF } from '../config/constants';
import { preloadPages } from '../utils/apiCache';
import { InlineBookmarkButton } from './BookmarkButton';

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

// Hook to calculate responsive font scale based on screen width
function useResponsiveFontScale() {
  const [fontScale, setFontScale] = useState(3);

  useEffect(() => {
    const calculateFontScale = () => {
      const width = window.innerWidth;
      // Scale font based on available width
      // Smaller screens need smaller font to prevent overlap
      if (width < 1024) {
        // Mobile - handled separately with CSS transform
        setFontScale(2.5);
      } else if (width < 1200) {
        // Small desktop/tablet
        setFontScale(2.2);
      } else if (width < 1400) {
        // Medium desktop
        setFontScale(2.5);
      } else if (width < 1600) {
        // Large desktop
        setFontScale(2.8);
      } else {
        // Extra large screens
        setFontScale(3);
      }
    };

    calculateFontScale();
    window.addEventListener('resize', calculateFontScale);
    return () => window.removeEventListener('resize', calculateFontScale);
  }, []);

  return fontScale;
}

// Hook to calculate optimal scale for mobile to fill available space
function useMobileScale(isAudioActive: boolean) {
  const [scale, setScale] = useState(1.35);

  useEffect(() => {
    const calculateScale = () => {
      if (window.innerWidth >= 1024) return; // Desktop, no scaling needed

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Account for navigation buttons at bottom (approx 60px) and audio player if active (64px)
      const bottomPadding = isAudioActive ? 124 : 60;
      const availableHeight = viewportHeight - bottomPadding;

      // The mushaf page has an aspect ratio of approximately 0.7 (width/height)
      // Base mushaf dimensions from the renderer (approximate)
      const baseMushafWidth = 280;
      const baseMushafHeight = 400;

      // Calculate scale needed to fit width (with some padding)
      const widthScale = (viewportWidth - 16) / baseMushafWidth;

      // Calculate scale needed to fit height
      const heightScale = availableHeight / baseMushafHeight;

      // Use the smaller scale to ensure it fits both dimensions
      const optimalScale = Math.min(widthScale, heightScale);

      // Clamp scale to reasonable bounds
      setScale(Math.max(1.0, Math.min(optimalScale, 2.0)));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isAudioActive]);

  return scale;
}

// Total pages in the standard Hafs Mushaf (misraj-mushaf-renderer uses this)
// Note: This is different from the QPC Nastaleeq 15-line mushaf which has 610 pages
const TOTAL_PAGES = RENDERER_MUSHAF.totalPages;

interface RendererMushafViewProps {
  onOpenMenu?: () => void;
}

// Inner component that uses the mushaf context
function MushafContent({
  onOpenMenu,
  audio,
  isMobile,
}: {
  onOpenMenu?: () => void;
  audio: ReturnType<typeof useAudio>;
  isMobile: boolean;
}) {
  const navigate = useNavigate();
  const { pageNumber, ayat, error } = useMushafContext();
  const { registerScrollContainer } = useMobileNav();
  const { isMenuOpen } = useMenu();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Use shared highlight state from context so it persists when switching views
  const { highlightedVerseKey, setHighlightedVerseKey } = useSettings();

  // Loading state - ayat is null while data is being fetched
  const isLoading = ayat === null && error === null;
  const isAudioActive = audio.isPlaying || audio.duration > 0;

  // Preload adjacent pages when current page data is loaded
  useEffect(() => {
    if (!isLoading && ayat) {
      preloadPages(pageNumber);
    }
  }, [isLoading, ayat, pageNumber]);

  // Calculate optimal scale for mobile
  const mobileScale = useMobileScale(isAudioActive);

  // Register scroll container with mobile nav context
  useEffect(() => {
    registerScrollContainer(scrollContainerRef.current);
    return () => registerScrollContainer(null);
  }, [registerScrollContainer]);

  // Apply CSS-based highlighting for the selected verse
  // This workaround uses data-word-location attribute which contains verse_key:position
  // The highlight persists even when audio stops so it remains visible when switching views
  // Also depends on `ayat` so it re-applies when page content loads (e.g., when switching views)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Remove previous highlights
    container.querySelectorAll('.custom-verse-highlight').forEach(el => {
      el.classList.remove('custom-verse-highlight');
    });

    // Show highlight if there's a highlighted verse (persists after audio stops)
    if (highlightedVerseKey) {
      // data-word-location format is "verse_key:position" e.g., "99:5:1"
      container.querySelectorAll(`[data-word-location^="${highlightedVerseKey}:"]`).forEach(el => {
        el.classList.add('custom-verse-highlight');
      });
    }
  }, [highlightedVerseKey, ayat]);

  // Handle word click for audio playback
  const handleWordClick = (word: unknown) => {
    // Debug: log the raw word data to understand its structure
    console.log('Word clicked:', JSON.stringify(word, null, 2));

    const wordData = word as {
      verse_key?: string;
      position?: number;
      char_type_name?: string;
      location?: string; // Alternative format: "chapter:verse:position"
      verse?: {
        number: number;
        text: string;
        surah: { number: number; name: string };
        numberInSurah: number;
        juz: number;
        manzil: number;
        page: number;
        ruku: number;
        hizbQuarter: number;
        sajda: boolean;
        words: unknown[];
      };
    };

    // Try to get verse_key from multiple possible sources
    let verseKey = wordData?.verse_key;

    // If verse_key is not available, try to construct it from location or verse data
    if (!verseKey && wordData?.location) {
      // location format is "chapter:verse:position"
      const parts = wordData.location.split(':');
      if (parts.length >= 2) {
        verseKey = `${parts[0]}:${parts[1]}`;
      }
    }

    if (!verseKey && wordData?.verse) {
      // Construct from verse data
      verseKey = `${wordData.verse.surah.number}:${wordData.verse.numberInSurah}`;
    }

    // End markers (verse numbers) play the full verse and highlight it
    if (wordData?.char_type_name === 'end' && verseKey) {
      // Use our own highlighting with the full verse key (e.g., "99:5")
      // instead of library's setSelectedVerse which only compares numberInSurah
      setHighlightedVerseKey(verseKey);
      audio.playVerse(verseKey);
      return;
    }

    // For regular words, clear verse highlight and play word audio
    setHighlightedVerseKey(null);

    if (verseKey && wordData?.position) {
      const [chapter, verse] = verseKey.split(':');
      const paddedChapter = chapter.padStart(3, '0');
      const paddedVerse = verse.padStart(3, '0');
      const paddedPosition = String(wordData.position).padStart(3, '0');
      // Word audio URL format: wbw/{chapter}_{verse}_{position}.mp3
      const wordAudioUrl = `wbw/${paddedChapter}_${paddedVerse}_${paddedPosition}.mp3`;
      audio.playWord(wordAudioUrl);
    } else if (verseKey) {
      // Fallback: play the verse if we can't construct word audio
      audio.playVerse(verseKey);
    }
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= TOTAL_PAGES) {
      // Convert renderer page to app page (add 1 for intro page offset)
      navigate(`/mushaf/${newPage + 1}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)]">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--mushaf-bg)]/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--mushaf-accent)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--mushaf-text-secondary)]">Loading page {pageNumber}...</p>
          </div>
        </div>
      )}

      {/* Main Mushaf area with navigation arrows */}
      <div className="flex-1 flex items-stretch relative min-h-0 overflow-hidden">
        {/* Left arrow - Previous page (desktop only) */}
        <button
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="hidden lg:flex items-center justify-center w-16 xl:w-20 bg-[var(--mushaf-arrow-bg)] hover:bg-[var(--mushaf-arrow-hover)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors group"
          aria-label="Previous page"
        >
          <span className="text-3xl xl:text-4xl text-[var(--mushaf-arrow-color)] group-hover:opacity-80 transition-colors">←</span>
        </button>

        {/* Mushaf content - centered and scaled to fit on mobile */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 min-h-0 overflow-hidden lg:overflow-auto scrollbar-none lg:scrollbar-auto flex justify-center items-center lg:items-start mobile-mushaf ${isAudioActive ? 'pb-20 lg:pb-24' : ''}`}
        >
          <div className="lg:py-4">
            {isMobile ? (
              /* Custom decorative border for mobile - matches WordForWordView */
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
                      <Mushaf onWordClick={handleWordClick} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Mushaf onWordClick={handleWordClick} />
            )}
          </div>
        </div>

        {/* Scale Mushaf to fill available space on mobile */}
        {isMobile && (
          <style>{`
            .mobile-mushaf {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100vw;
              height: 100%;
              overflow: hidden;
            }
            .mobile-mushaf > div {
              transform-origin: center center;
              transform: scale(${mobileScale});
            }
          `}</style>
        )}

        {/* Hide mushaf renderer's page number when audio player is active to prevent z-index conflicts */}
        {isAudioActive && (
          <style>{`
            /* Target the mushaf renderer's page number container and number */
            .Page-pageNumberContainer,
            .Page-pageNumber,
            [class*="pageNumberContainer"],
            [class*="pageNumber"]:not(input):not(button) {
              display: none !important;
            }
          `}</style>
        )}

        {/* Right arrow - Next page (desktop only) */}
        <button
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber >= TOTAL_PAGES}
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
        {/* Center - Page number button (absolutely centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <button
            onClick={onOpenMenu}
            className="pointer-events-auto text-xs text-[var(--mushaf-text-secondary)] bg-[var(--mushaf-page-bg)]/90 px-3 py-1.5 rounded-full border border-[var(--mushaf-border)] shadow-md active:scale-95 transition-transform"
            aria-label="Open menu"
          >
            {pageNumber} / {TOTAL_PAGES}
          </button>
        </div>

        {/* Left side - Previous button */}
        <div className="absolute left-2 bottom-0">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
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
            <InlineBookmarkButton pageNumber={pageNumber + 1} viewMode="mushaf" />
          </div>
          {/* Next button */}
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= TOTAL_PAGES}
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

export function RendererMushafView({ onOpenMenu }: RendererMushafViewProps) {
  const { pageNumber: pageParam } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { layoutMode } = useSettings();
  const audio = useAudio();
  const isMobile = useIsMobile(layoutMode);
  const fontScale = useResponsiveFontScale();

  const page = pageParam ? parseInt(pageParam) : 1;

  // Convert app page to renderer page (app page 2 = renderer page 1)
  // Also clamp to valid range since QPC Nastaleeq mushaf has 610 pages but
  // misraj-mushaf-renderer only supports 604 pages (standard Hafs mushaf)
  const rendererPage = Math.min(Math.max(page - 1, 1), TOTAL_PAGES);

  // Build theme props from current theme
  // borderColor must be 'blue' | 'green' | 'sepia'
  const themeProps = useMemo(() => ({
    borderColor: 'green' as const,
    wordHighlightColor: theme === 'dark' ? '#d4a855' : '#c9a227',
    chapterHeaderFontSize: '1.5rem',
    primaryFontColor: theme === 'dark' ? '#e0d6c8' : '#2c1810',
  }), [theme]);

  // Style override to make Mushaf fill width on mobile
  const styleOverride = useMemo(() => (isMobile ? {
    ReadingViewContainer: {
      width: '100vw',
      maxWidth: '100vw',
    },
    PageContainer: {
      width: '100%',
      maxWidth: '100%',
    },
  } : undefined) as unknown as Record<string, React.CSSProperties> | undefined, [isMobile]);

  // Handle intro page (page 1)
  if (page === 1) {
    return (
      <IntroPage
        onStartReading={() => navigate('/mushaf/2')}
      />
    );
  }

  return (
    <MushafReaderProvider
      dataId="quran-hafs"
      pageNumber={rendererPage}
      initialFontScale={fontScale}
      hasBorder={!isMobile}
      initialIsTwoPagesView={false}
      themeProps={themeProps}
      styleOverride={styleOverride}
    >
      <MushafContent onOpenMenu={onOpenMenu} audio={audio} isMobile={isMobile} />
    </MushafReaderProvider>
  );
}
