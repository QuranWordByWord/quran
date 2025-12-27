import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { Header } from './components/Header';
import { WordForWordView } from './components/WordForWordView';
import { RendererMushafView } from './components/RendererMushafView';
import { IntroPage } from './components/IntroPage';
import { SearchResults } from './components/SearchResults';
import { AudioPlayer } from './components/AudioPlayer';
import { ChapterQuickLinks, MobileChapterSelector } from './components/ChapterQuickLinks';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePage } from './hooks/usePage';
import { useSearch } from './hooks/useSearch';
import { useAudio } from './hooks/useAudio';
import { useFont } from './hooks/useFont';
import { MobileNavProvider, useMobileNav } from './contexts/MobileNavContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Font context to share font class across components
const FontContext = createContext<string>('font-nastaleeq');
export const useFontClass = () => useContext(FontContext);

// Menu context to allow opening the mobile menu from MushafPage
const MenuContext = createContext<{
  openMenu: () => void;
  isMenuOpen: boolean;
}>({
  openMenu: () => {},
  isMenuOpen: false,
});
export const useMenu = () => useContext(MenuContext);

// Verse number format context (arabic or english numerals)
type VerseNumberFormat = 'arabic' | 'english';
const VerseNumberContext = createContext<{
  format: VerseNumberFormat;
  setFormat: (format: VerseNumberFormat) => void;
}>({
  format: 'arabic',
  setFormat: () => {},
});
export const useVerseNumberFormat = () => useContext(VerseNumberContext);

// View mode context to allow switching views from anywhere
type ViewMode = 'mushaf' | 'wordforword';
const ViewModeContext = createContext<{
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}>({
  viewMode: 'wordforword',
  setViewMode: () => {},
});
export const useViewMode = () => useContext(ViewModeContext);


function MushafPageView() {
  const { openMenu } = useMenu();
  return <RendererMushafView onOpenMenu={openMenu} />;
}

function WordForWordPageView() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = pageNumber ? parseInt(pageNumber) : 1;
  const { verses, loading, error, totalPages, isIntroPage } = usePage(page);
  const audio = useAudio();
  const { openMenu } = useMenu();
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  const [highlightedWordId, setHighlightedWordId] = useState<number | null>(null);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/page/${newPage}`);
    }
  };

  const handleStartReading = () => {
    navigate('/page/2'); // Go to first Quran page (Al-Fatiha)
  };

  // Clear highlights when audio stops
  const audioStopped = !audio.isPlaying && audio.duration === 0;
  if (audioStopped && (highlightedVerseKey !== null || highlightedWordId !== null)) {
    setHighlightedVerseKey(null);
    setHighlightedWordId(null);
  }

  const isAudioActive = audio.isPlaying || audio.duration > 0;

  // Show intro page for page 1
  if (isIntroPage) {
    return <IntroPage onStartReading={handleStartReading} />;
  }

  return (
    <>
      <WordForWordView
        verses={verses}
        loading={loading}
        error={error}
        pageNumber={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPlayWord={audio.playWord}
        onPlayVerse={audio.playVerse}
        isAudioActive={isAudioActive}
        onOpenMenu={openMenu}
        highlightedVerseKey={highlightedVerseKey}
        onHighlightVerse={setHighlightedVerseKey}
        highlightedWordId={highlightedWordId}
        onHighlightWord={setHighlightedWordId}
      />
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
    </>
  );
}

function SearchPage({
  results,
  loading,
  error,
  totalResults,
  currentPage,
  totalPages,
  loadMore,
}: {
  results: ReturnType<typeof useSearch>['results'];
  loading: boolean;
  error: Error | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  loadMore: () => void;
}) {
  return (
    <SearchResults
      results={results}
      loading={loading}
      error={error}
      totalResults={totalResults}
      onLoadMore={loadMore}
      hasMore={currentPage < totalPages}
    />
  );
}

function VerseNumberToggle({
  format,
  onFormatChange,
}: {
  format: VerseNumberFormat;
  onFormatChange: (format: VerseNumberFormat) => void;
}) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onFormatChange('arabic')}
        className={`px-2 py-1 text-sm rounded-md transition-colors ${
          format === 'arabic'
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
        title="Arabic numerals"
      >
        ١٢٣
      </button>
      <button
        onClick={() => onFormatChange('english')}
        className={`px-2 py-1 text-sm rounded-md transition-colors ${
          format === 'english'
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
        title="English numerals"
      >
        123
      </button>
    </div>
  );
}

function ViewModeToggle({
  mode,
  onModeChange,
}: {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current page number from URL
  const getCurrentPage = (): number => {
    const mushafMatch = location.pathname.match(/^\/mushaf\/(\d+)/);
    const pageMatch = location.pathname.match(/^\/page\/(\d+)/);
    if (mushafMatch) return parseInt(mushafMatch[1]);
    if (pageMatch) return parseInt(pageMatch[1]);
    return 2; // Default to first Quran page
  };

  const handleChange = (newMode: ViewMode) => {
    onModeChange(newMode);
    const currentPage = getCurrentPage();
    if (newMode === 'mushaf') {
      navigate(`/mushaf/${currentPage}`);
    } else {
      navigate(`/page/${currentPage}`);
    }
  };

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => handleChange('mushaf')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          mode === 'mushaf'
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Mushaf View
      </button>
      <button
        onClick={() => handleChange('wordforword')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          mode === 'wordforword'
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Word By Word
      </button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

function AppContentInner() {
  const [viewMode, setViewMode] = useState<ViewMode>('wordforword');
  const [verseNumberFormat, setVerseNumberFormat] = useState<VerseNumberFormat>(() => {
    const saved = localStorage.getItem('verseNumberFormat');
    return (saved === 'arabic' || saved === 'english') ? saved : 'arabic';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const search = useSearch();
  const font = useFont();
  const { isNavVisible } = useMobileNav();

  // Persist verse number format to localStorage
  useEffect(() => {
    localStorage.setItem('verseNumberFormat', verseNumberFormat);
  }, [verseNumberFormat]);

  const openMenu = () => setIsMenuOpen(true);

  return (
    <FontContext.Provider value={font.fontClassName}>
    <VerseNumberContext.Provider value={{ format: verseNumberFormat, setFormat: setVerseNumberFormat }}>
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
    <MenuContext.Provider value={{ openMenu, isMenuOpen }}>
    <div className="min-h-screen lg:h-screen lg:flex lg:flex-col lg:overflow-hidden bg-[var(--color-bg-light)]">
      {/* Header - hidden on mobile for word-for-word view */}
      <div className={viewMode === 'wordforword' ? 'hidden lg:block' : ''}>
        <Header onSearch={search.search} isVisible={isNavVisible}>
          <div className="flex items-center gap-2">
            <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
            <VerseNumberToggle format={verseNumberFormat} onFormatChange={setVerseNumberFormat} />
            <ThemeToggle />
          </div>
        </Header>
      </div>

      <div className="flex min-h-0 lg:flex-1 lg:overflow-hidden">
        <ChapterQuickLinks side="left" />

        <main className="flex-1 min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/page/1" replace />} />
            <Route path="/mushaf/:pageNumber" element={<MushafPageView />} />
            <Route path="/chapter/:chapterId" element={<Navigate to="/mushaf/2" replace />} />
            <Route path="/page/:pageNumber" element={<WordForWordPageView />} />
            <Route
              path="/search"
              element={
                <SearchPage
                  results={search.results}
                  loading={search.loading}
                  error={search.error}
                  totalResults={search.totalResults}
                  currentPage={search.currentPage}
                  totalPages={search.totalPages}
                  loadMore={search.loadMore}
                />
              }
            />
          </Routes>
        </main>

        <ChapterQuickLinks side="right" />
      </div>

      {/* Mobile chapter selector menu - used for both views */}
      <MobileChapterSelector
        verseNumberFormat={verseNumberFormat}
        onVerseNumberFormatChange={setVerseNumberFormat}
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      />
    </div>
    </MenuContext.Provider>
    </ViewModeContext.Provider>
    </VerseNumberContext.Provider>
    </FontContext.Provider>
  );
}

function AppContent() {
  return (
    <MobileNavProvider hideDelay={3000} scrollThreshold={30}>
      <AppContentInner />
    </MobileNavProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <OfflineIndicator />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
