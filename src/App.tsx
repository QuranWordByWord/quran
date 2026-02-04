import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, createContext, useContext, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { WordForWordView } from './components/WordForWordView';
import { DigitalKhattMushafView } from './components/DigitalKhattMushafView';
import { IntroPage } from './components/IntroPage';
import { SearchResults } from './components/SearchResults';
import { AudioPlayer } from './components/AudioPlayer';
import { ChapterQuickLinks, MobileChapterSelector } from './components/ChapterQuickLinks';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BookmarkDropdown } from './components/BookmarkDropdown';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePage } from './hooks/usePage';
import { useSearch } from './hooks/useSearch';
import { useAudio } from './hooks/useAudio';
import { useIsMobile } from './hooks/useIsMobile';
import { MobileNavProvider, useMobileNav } from './contexts/MobileNavContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { FavoriteJuzProvider } from './contexts/FavoriteJuzContext';
import { ToastProvider } from './components/Toast';
import { convertPageBetweenViews, getSurahStartPage, convertPageBetweenMushafScripts } from './utils/pageToSurah';
import { MUSHAF_SCRIPTS } from './config/constants';
import type { MushafScript } from './config/types';

// Export hooks that wrap useSettings for backward compatibility
export const useFontClass = () => useSettings().fontClassName;

export const useVerseNumberFormat = () => {
  const { verseNumberFormat, setVerseNumberFormat } = useSettings();
  return { format: verseNumberFormat, setFormat: setVerseNumberFormat };
};

export const useViewMode = () => {
  const { viewMode, setViewMode } = useSettings();
  return { viewMode, setViewMode };
};

export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useSettings();
  return { theme, toggleTheme, setTheme };
};

// Menu context to allow opening the mobile menu from MushafPage
const MenuContext = createContext<{
  openMenu: () => void;
  isMenuOpen: boolean;
}>({
  openMenu: () => {},
  isMenuOpen: false,
});
export const useMenu = () => useContext(MenuContext);

// Type aliases for backward compatibility
type VerseNumberFormat = 'arabic' | 'english';
type ViewMode = 'mushaf' | 'wordforword';


function MushafPageView() {
  const { openMenu } = useMenu();
  return <DigitalKhattMushafView onOpenMenu={openMenu} />;
}

function WordForWordPageView() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = pageNumber ? parseInt(pageNumber) : 1;
  const { verses, loading, error, totalPages, isIntroPage, prevPageVerses, nextPageVerses } = usePage(page);
  const audio = useAudio();
  const { openMenu } = useMenu();
  // Use shared highlight state from context so it persists when switching views
  const { highlightedVerseKey, setHighlightedVerseKey, highlightedWordInfo, setHighlightedWordInfo } = useSettings();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/page/${newPage}`);
    }
  };

  const handleStartReading = () => {
    navigate('/page/2'); // Go to first Quran page (Al-Fatiha)
  };

  // Note: We no longer clear verse/word highlights when audio stops
  // The highlights should persist when switching views

  const isAudioActive = audio.isPlaying || audio.duration > 0;

  // Handle full surah playback with verse highlighting and page navigation
  const handlePlaySurah = (surah: number) => {
    audio.playSurah(surah, (verseKey: string) => {
      setHighlightedVerseKey(verseKey);
      setHighlightedWordInfo(null);

      // Navigate to page containing verse if not on current page
      const currentVerseMatch = verses.find(v => v.verse_key === verseKey);
      if (!currentVerseMatch) {
        const surahStartPage = getSurahStartPage(surah, 'wordforword');
        handlePageChange(surahStartPage);
      }
    });
  };

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
        onPlaySurah={handlePlaySurah}
        isAudioActive={isAudioActive}
        onOpenMenu={openMenu}
        highlightedVerseKey={highlightedVerseKey}
        onHighlightVerse={setHighlightedVerseKey}
        highlightedWordInfo={highlightedWordInfo}
        onHighlightWord={setHighlightedWordInfo}
        prevPageVerses={prevPageVerses}
        nextPageVerses={nextPageVerses}
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
        onDismiss={() => {
          setHighlightedWordInfo(null);
          setHighlightedVerseKey(null);
        }}
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
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 h-8 items-center" role="radiogroup" aria-label="Verse number format">
      <button
        onClick={() => onFormatChange('arabic')}
        className={`px-2.5 h-7 text-xs font-medium rounded-md transition-colors ${
          format === 'arabic'
            ? 'bg-white dark:bg-gray-600 text-[var(--color-header-toggle)] shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
        role="radio"
        aria-checked={format === 'arabic'}
        aria-label="Arabic numerals"
      >
        ١٢٣
      </button>
      <button
        onClick={() => onFormatChange('english')}
        className={`px-2.5 h-7 text-xs font-medium rounded-md transition-colors ${
          format === 'english'
            ? 'bg-white dark:bg-gray-600 text-[var(--color-header-toggle)] shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
        role="radio"
        aria-checked={format === 'english'}
        aria-label="English numerals"
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
  const { mushafScript } = useSettings();

  // Extract current page number and view mode from URL
  const getCurrentPageAndMode = (): { page: number; currentMode: ViewMode } => {
    const mushafMatch = location.pathname.match(/^\/mushaf\/(\d+)/);
    const pageMatch = location.pathname.match(/^\/page\/(\d+)/);
    if (mushafMatch) return { page: parseInt(mushafMatch[1]), currentMode: 'mushaf' };
    if (pageMatch) return { page: parseInt(pageMatch[1]), currentMode: 'wordforword' };
    return { page: 2, currentMode: mode }; // Default to first Quran page
  };

  const handleChange = (newMode: ViewMode) => {
    // If already in the requested mode, do nothing (don't navigate/jump)
    if (newMode === mode) {
      return;
    }

    onModeChange(newMode);

    // Always use current page from URL for navigation
    // This ensures the user stays on the equivalent page when switching views
    // (Highlight info is only used for displaying highlights, not for navigation)
    const { page: currentPage, currentMode } = getCurrentPageAndMode();
    const targetPage = convertPageBetweenViews(currentPage, currentMode, newMode, mushafScript);

    if (newMode === 'mushaf') {
      navigate(`/mushaf/${targetPage}`);
    } else {
      navigate(`/page/${targetPage}`);
    }
  };

  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 h-8 items-center" role="radiogroup" aria-label="View mode">
      <button
        onClick={() => handleChange('mushaf')}
        className={`px-3 h-7 text-xs font-medium rounded-md transition-colors ${
          mode === 'mushaf'
            ? 'bg-white dark:bg-gray-600 text-[var(--color-header-toggle)] shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
        role="radio"
        aria-checked={mode === 'mushaf'}
      >
        Mushaf View
      </button>
      <button
        onClick={() => handleChange('wordforword')}
        className={`px-3 h-7 text-xs font-medium rounded-md transition-colors ${
          mode === 'wordforword'
            ? 'bg-white dark:bg-gray-600 text-[var(--color-header-toggle)] shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
        role="radio"
        aria-checked={mode === 'wordforword'}
      >
        Word By Word
      </button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

// Mushaf-specific controls for header
function ScriptSelector({
  script,
  onScriptChange,
}: {
  script: MushafScript;
  onScriptChange: (script: MushafScript) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentScript = MUSHAF_SCRIPTS.find(s => s.id === script) || MUSHAF_SCRIPTS[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 h-8 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-gray-700 dark:text-gray-200">{currentScript.name}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-3 py-1.5 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Mushaf Script</p>
          </div>
          {MUSHAF_SCRIPTS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onScriptChange(s.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                script === s.id ? 'bg-gray-100' : ''
              }`}
              role="option"
              aria-selected={script === s.id}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${script === s.id ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-500">{s.pages} pages</p>
                </div>
                {script === s.id && (
                  <svg className="w-4 h-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TajweedToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-lg transition-colors ${
        enabled
          ? 'bg-white dark:bg-gray-600 text-[var(--color-header-toggle)] shadow-sm'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      aria-pressed={enabled}
      title={enabled ? 'Disable tajweed colors' : 'Enable tajweed colors'}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
      <span>Tajweed</span>
    </button>
  );
}

function ZoomControls({
  zoom,
  onZoomChange,
}: {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) {
  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom / 1.15);
    onZoomChange(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom * 1.15);
    onZoomChange(newZoom);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-1.5 h-8" title="Page zoom">
      <button
        onClick={handleZoomOut}
        className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <span className="text-xs text-gray-700 dark:text-gray-200 min-w-[2.5rem] text-center font-medium">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={handleZoomIn}
        className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
        </svg>
      </button>
    </div>
  );
}

function FontScaleControls({
  fontScale,
  onFontScaleChange,
}: {
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
}) {
  const handleDecrease = () => {
    const newScale = Math.max(0.5, fontScale - 0.05);
    onFontScaleChange(newScale);
  };

  const handleIncrease = () => {
    const newScale = Math.min(1.2, fontScale + 0.05);
    onFontScaleChange(newScale);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-1.5 h-8" title="Font size">
      <button
        onClick={handleDecrease}
        className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Decrease font size"
        aria-label="Decrease font size"
      >
        {/* Small A icon for decrease */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <text x="4" y="18" fontSize="14" fontWeight="bold" fontFamily="Arial">A</text>
          <path d="M18 14H22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
        </svg>
      </button>
      <span className="text-xs text-gray-700 dark:text-gray-200 min-w-[2.5rem] text-center font-medium">
        {Math.round(fontScale * 100)}%
      </span>
      <button
        onClick={handleIncrease}
        className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Increase font size"
        aria-label="Increase font size"
      >
        {/* Large A icon for increase */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <text x="2" y="19" fontSize="18" fontWeight="bold" fontFamily="Arial">A</text>
          <path d="M17 10V14M15 12H19" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
        </svg>
      </button>
    </div>
  );
}

function AppContentInner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const search = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isNavVisible: _isNavVisible } = useMobileNav();
  const {
    viewMode, setViewMode,
    verseNumberFormat, setVerseNumberFormat,
    mushafScript, setMushafScript,
    tajweedEnabled, setTajweedEnabled,
    mushafZoom, setMushafZoom,
    mushafFontScale, setMushafFontScale,
    layoutMode
  } = useSettings();

  // Use zoom-compensated mobile detection for sidebar visibility
  // This ensures sidebars don't flicker during zoom changes
  const isMobile = useIsMobile(layoutMode);

  const openMenu = () => setIsMenuOpen(true);

  // Sync viewMode with URL on initial load and navigation
  // This ensures direct URL access (e.g., pasting /mushaf/123) shows correct header controls
  useEffect(() => {
    const isMushafRoute = location.pathname.startsWith('/mushaf/');
    const isWordForWordRoute = location.pathname.startsWith('/page/');

    if (isMushafRoute && viewMode !== 'mushaf') {
      setViewMode('mushaf');
    } else if (isWordForWordRoute && viewMode !== 'wordforword') {
      setViewMode('wordforword');
    }
  }, [location.pathname, viewMode, setViewMode]);

  // Extract current page info from URL for mobile header bookmark
  const getCurrentPageInfo = (): { page: number; mode: 'mushaf' | 'wordforword' } | null => {
    const mushafMatch = location.pathname.match(/^\/mushaf\/(\d+)/);
    const pageMatch = location.pathname.match(/^\/page\/(\d+)/);
    if (mushafMatch) {
      // Convert app page to quran page (app page 2 = quran page 1)
      const appPage = parseInt(mushafMatch[1]);
      return { page: Math.max(appPage - 1, 1), mode: 'mushaf' };
    }
    if (pageMatch) return { page: parseInt(pageMatch[1]), mode: 'wordforword' };
    return null;
  };
  const pageInfo = getCurrentPageInfo();

  // Handle mushaf script change with page conversion
  const handleMushafScriptChange = (newScript: MushafScript) => {
    const mushafMatch = location.pathname.match(/^\/mushaf\/(\d+)/);
    if (mushafMatch) {
      const currentPage = parseInt(mushafMatch[1]);
      // Convert page from current script to new script
      const targetPage = convertPageBetweenMushafScripts(currentPage, mushafScript, newScript);
      setMushafScript(newScript);
      navigate(`/mushaf/${targetPage}`);
    } else {
      // Not in mushaf view, just update the setting
      setMushafScript(newScript);
    }
  };

  return (
    <MenuContext.Provider value={{ openMenu, isMenuOpen }}>
      <div className="min-h-screen lg:h-screen lg:flex lg:flex-col lg:overflow-hidden bg-[var(--color-bg-light)]">
        {/* Skip to main content link - WCAG AAA requirement */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Header - always visible on mobile for both views */}
        <Header
          isVisible={true}
          onOpenMenu={openMenu}
          pageNumber={pageInfo?.page}
          viewMode={pageInfo?.mode}
        >
            <div className="flex items-center gap-2" role="group" aria-label="Display settings">
              <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
              {viewMode === 'mushaf' && (
                <>
                  <ScriptSelector script={mushafScript} onScriptChange={handleMushafScriptChange} />
                  <TajweedToggle enabled={tajweedEnabled} onToggle={setTajweedEnabled} />
                  <ZoomControls zoom={mushafZoom} onZoomChange={setMushafZoom} />
                  <FontScaleControls fontScale={mushafFontScale} onFontScaleChange={setMushafFontScale} />
                </>
              )}
              <VerseNumberToggle format={verseNumberFormat} onFormatChange={setVerseNumberFormat} />
              <BookmarkDropdown />
              <ThemeToggle />
            </div>
          </Header>

        <div className="flex min-h-0 lg:flex-1 lg:overflow-hidden">
          <ChapterQuickLinks side="left" isMobile={isMobile} />

          <main id="main-content" className="flex-1 min-w-0 overflow-hidden" role="main" aria-label="Quran content">
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

          <ChapterQuickLinks side="right" isMobile={isMobile} />
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
  );
}

// Handle SPA redirect from 404.html for GitHub Pages
function SpaRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('spa-redirect');
    if (redirectPath) {
      sessionStorage.removeItem('spa-redirect');
      // Remove the /quran base path since BrowserRouter already uses it as basename
      const pathWithoutBase = redirectPath.replace(/^\/quran/, '') || '/';
      navigate(pathWithoutBase, { replace: true });
    }
  }, [navigate]);

  return null;
}

function AppContent() {
  return (
    <MobileNavProvider hideDelay={3000} scrollThreshold={30}>
      <SpaRedirectHandler />
      <AppContentInner />
    </MobileNavProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/quran">
        <SettingsProvider>
          <BookmarkProvider>
            <FavoriteJuzProvider>
              <ToastProvider>
                <OfflineIndicator />
                <AppContent />
              </ToastProvider>
            </FavoriteJuzProvider>
          </BookmarkProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
