import { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MushafReaderProvider, Mushaf, useMushafContext } from 'misraj-mushaf-renderer';
import 'misraj-mushaf-renderer/dist/styles';
import { useTheme } from '../contexts/ThemeContext';
import { useAudio } from '../hooks/useAudio';
import { useMobileNav } from '../contexts/MobileNavContext';
import { AudioPlayer } from './AudioPlayer';
import { IntroPage } from './IntroPage';

// Hook to detect if we're on mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Total pages in the 15-line Hafs Mushaf
const TOTAL_PAGES = 604;

interface RendererMushafViewProps {
  onOpenMenu?: () => void;
}

// Inner component that uses the mushaf context
function MushafContent({
  onOpenMenu,
  audio,
}: {
  onOpenMenu?: () => void;
  audio: ReturnType<typeof useAudio>;
}) {
  const navigate = useNavigate();
  const { pageNumber, setSelectedVerse } = useMushafContext();
  const { registerScrollContainer } = useMobileNav();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Register scroll container with mobile nav context
  useEffect(() => {
    registerScrollContainer(scrollContainerRef.current);
    return () => registerScrollContainer(null);
  }, [registerScrollContainer]);

  // Clear verse highlight when audio stops playing
  useEffect(() => {
    if (!audio.isPlaying && audio.duration === 0) {
      setSelectedVerse(null);
    }
  }, [audio.isPlaying, audio.duration, setSelectedVerse]);

  // Handle word click for audio playback
  const handleWordClick = (word: unknown) => {
    const wordData = word as {
      verse_key?: string;
      position?: number;
      char_type_name?: string;
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

    // End markers (verse numbers) play the full verse and highlight it
    if (wordData?.char_type_name === 'end' && wordData?.verse_key) {
      // Highlight the verse if verse data is available
      if (wordData.verse) {
        setSelectedVerse(wordData.verse as Parameters<typeof setSelectedVerse>[0]);
      }
      audio.playVerse(wordData.verse_key);
      return;
    }

    // For regular words, clear verse highlight and play word audio
    setSelectedVerse(null);

    if (wordData?.verse_key && wordData?.position) {
      const [chapter, verse] = wordData.verse_key.split(':');
      const paddedChapter = chapter.padStart(3, '0');
      const paddedVerse = verse.padStart(3, '0');
      const paddedPosition = String(wordData.position).padStart(3, '0');
      // Word audio URL format: wbw/{chapter}_{verse}_{position}.mp3
      const wordAudioUrl = `wbw/${paddedChapter}_${paddedVerse}_${paddedPosition}.mp3`;
      audio.playWord(wordAudioUrl);
    } else if (wordData?.verse_key) {
      // Fallback: play the verse if we can't construct word audio
      audio.playVerse(wordData.verse_key);
    }
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= TOTAL_PAGES) {
      // Convert renderer page to app page (add 1 for intro page offset)
      navigate(`/mushaf/${newPage + 1}`);
    }
  };

  const isAudioActive = audio.isPlaying || audio.duration > 0;

  return (
    <div className="flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)]">
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

        {/* Scrollable Mushaf content */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 min-h-0 overflow-auto scrollbar-none lg:scrollbar-auto flex justify-center items-start mobile-mushaf ${isAudioActive ? 'pb-20 lg:pb-24' : ''}`}
        >
          <div className="lg:py-4">
            <Mushaf
              onWordClick={handleWordClick}
            />
          </div>
        </div>

        {/* Scale Mushaf to fill screen width on mobile */}
        <style>{`
          @media (max-width: 1023px) {
            .mobile-mushaf {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              width: 100vw;
              overflow-x: hidden;
            }
            .mobile-mushaf > div {
              transform-origin: top center;
              transform: scale(1.35);
            }
          }
        `}</style>

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

      {/* Mobile navigation buttons - always visible */}
      <div
        className={`lg:hidden fixed left-0 right-0 flex justify-between items-center px-2 z-[55] pointer-events-none transition-all duration-300 ${isAudioActive ? 'bottom-16' : 'bottom-2'}`}
      >
        <button
          onClick={() => handlePageChange(pageNumber - 1)}
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
          {pageNumber} / {TOTAL_PAGES}
        </button>
        <button
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber >= TOTAL_PAGES}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--mushaf-page-bg)]/90 border border-[var(--mushaf-border)] shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
          aria-label="Next page"
        >
          <span className="text-xl text-[var(--mushaf-arrow-color)]">→</span>
        </button>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        isPlaying={audio.isPlaying}
        currentTime={audio.currentTime}
        duration={audio.duration}
        onPause={audio.pause}
        onResume={audio.resume}
        onStop={audio.stop}
        onSeek={audio.seek}
      />
    </div>
  );
}

export function RendererMushafView({ onOpenMenu }: RendererMushafViewProps) {
  const { pageNumber: pageParam } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const audio = useAudio();
  const isMobile = useIsMobile();

  const page = pageParam ? parseInt(pageParam) : 1;

  // Handle intro page (page 1)
  if (page === 1) {
    return (
      <IntroPage
        onStartReading={() => navigate('/mushaf/2')}
      />
    );
  }

  // Convert app page to renderer page (app page 2 = renderer page 1)
  const rendererPage = page - 1;

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

  return (
    <MushafReaderProvider
      dataId="quran-hafs"
      pageNumber={rendererPage}
      initialFontScale={ 3}
      hasBorder={!isMobile}
      initialIsTwoPagesView={false}
      themeProps={themeProps}
      styleOverride={styleOverride}
    >
      <MushafContent onOpenMenu={onOpenMenu} audio={audio} />
    </MushafReaderProvider>
  );
}
