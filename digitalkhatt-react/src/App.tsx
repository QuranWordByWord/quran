/**
 * DigitalKhatt React - Main Quran Viewer App
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  QuranProvider,
  QuranViewer,
  QuranSpread,
  useDigitalKhatt,
  isAyahMarker,
  getWordsForVerse,
  LAYOUT_TYPE_MAP,
  type MushafLayoutTypeString,
  type VerseNumberFormat,
  type WordClickInfo,
  type RendererEngineType,
} from './lib';
import { Toolbar, type ZoomMode } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { AboutDialog } from './components/AboutDialog';
import { useLocalStorage, STORAGE_KEYS } from './hooks/useLocalStorage';
import { quranText as indoPakText } from './lib/data/quran_text_indopak_15';
import { quranText as newMadinahText } from './lib/data/quran_text_madina';
import { quranText as oldMadinahText } from './lib/data/quran_text_old_madinah';
import './App.css';

// ============================================
// Configuration
// ============================================

const WASM_URL = '/wasm/hb.wasm';
const FONT_URLS = {
  newMadinah: '/fonts/newmadinah.otf',
  oldMadinah: '/fonts/oldmadinah.otf',
  indoPak15: '/fonts/indopak15.otf',
};

const QURAN_TEXT = {
  newMadinah: newMadinahText,
  oldMadinah: oldMadinahText,
  indoPak15: indoPakText,
};

// Get default zoom based on device type
function getDefaultZoom(): ZoomMode {
  // Check for touch device or narrow viewport
  if (typeof window !== 'undefined') {
    const isMobile = window.matchMedia('(hover: none)').matches || window.innerWidth < 768;
    return isMobile ? 'page-width' : 'page-fit';
  }
  return 'page-fit';
}

// ============================================
// Main Viewer Component
// ============================================

function QuranViewerApp() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Persisted state
  const [layoutType, setLayoutType] = useLocalStorage<MushafLayoutTypeString>(
    STORAGE_KEYS.layout,
    'oldMadinah'
  );
  const [lastPage, setLastPage] = useLocalStorage<number>(STORAGE_KEYS.lastPage, 1);
  const [zoom, setZoom] = useLocalStorage<ZoomMode>(STORAGE_KEYS.zoom, getDefaultZoom());
  const [tajweedEnabled, setTajweedEnabled] = useLocalStorage<boolean>(
    STORAGE_KEYS.tajweed,
    true
  );
  const [verseNumberFormat, setVerseNumberFormat] = useLocalStorage<VerseNumberFormat>(
    STORAGE_KEYS.verseFormat,
    'arabic'
  );
  const [spreadViewEnabled, setSpreadViewEnabled] = useLocalStorage<boolean>(
    STORAGE_KEYS.spreadView,
    false
  );

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(lastPage);
  const [selectedVerse, setSelectedVerse] = useState<{ surah: number; ayah: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordClickInfo | null>(null);

  // Container size for zoom calculations
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Context for verse mapping and engine
  const { getVerseMapping, getTextService, isReady, engineType, setEngineType, getAvailableEngines, isEngineAvailable } = useDigitalKhatt();
  const mushafType = LAYOUT_TYPE_MAP[layoutType];
  const verseMapping = useMemo(() => getVerseMapping(mushafType), [getVerseMapping, mushafType]);

  // Get available engines for current layout
  const availableEngines = useMemo(() => {
    const layoutStr = layoutType as MushafLayoutTypeString;
    return getAvailableEngines(layoutStr);
  }, [layoutType, getAvailableEngines]);

  // Get total pages from text service
  const textService = useMemo(
    () => getTextService(mushafType),
    [getTextService, mushafType]
  );
  const totalPages = textService?.nbPages ?? 604;

  // Track container size for zoom calculations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    // Use ResizeObserver to detect container size changes (e.g., sidebar toggle)
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate scale based on zoom mode
  // When zoom is a mode (not a number), calculate the actual scale from container dimensions
  const pageWidthBase = 400; // Base page width
  const pageHeightBase = (pageWidthBase * 410) / 255; // Aspect ratio

  let rawScale: number;
  if (typeof zoom === 'number') {
    // Direct numeric zoom
    rawScale = zoom;
  } else {
    // Mode-based zoom - calculate from container size
    const width = containerSize.width > 0 ? containerSize.width : 800;
    const height = containerSize.height > 0 ? containerSize.height : 600;

    switch (zoom) {
      case 'page-fit': {
        const scaleW = (width - 40) / pageWidthBase;
        const scaleH = (height - 40) / pageHeightBase;
        rawScale = Math.min(scaleW, scaleH);
        break;
      }
      case 'page-width':
        rawScale = (width - 40) / pageWidthBase;
        break;
      case 'page-height':
        rawScale = (height - 40) / pageHeightBase;
        break;
      default:
        rawScale = 1;
    }
  }

  const computedScale = Math.max(0.25, Math.min(4, rawScale));

  // Handlers
  const handlePageChange = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(totalPages, page));
      setCurrentPage(validPage);
      setLastPage(validPage);
    },
    [totalPages, setLastPage]
  );

  const handleLayoutChange = useCallback(
    (newLayout: MushafLayoutTypeString) => {
      setLayoutType(newLayout);
      // Reset to page 1 when changing layout
      setCurrentPage(1);
      setLastPage(1);
      setSelectedVerse(null);
      setSelectedWord(null);
      // Check if current engine is compatible with new layout, if not switch to default
      if (!isEngineAvailable(engineType, newLayout)) {
        setEngineType('harfbuzz-svg');
      }
    },
    [setLayoutType, setLastPage, engineType, isEngineAvailable, setEngineType]
  );

  const handleEngineChange = useCallback(
    (newEngine: RendererEngineType) => {
      // Only change if engine is available for current layout
      if (isEngineAvailable(newEngine, layoutType)) {
        setEngineType(newEngine);
      }
    },
    [layoutType, isEngineAvailable, setEngineType]
  );

  const handleZoomChange = useCallback(
    (newZoom: ZoomMode) => {
      setZoom(newZoom);
    },
    [setZoom]
  );

  const handleWordClick = useCallback(
    (info: WordClickInfo) => {
      // Check if clicked word is an ayah marker
      if (isAyahMarker(info.text)) {
        if (info.surah !== undefined && info.ayah !== undefined) {
          setSelectedVerse({ surah: info.surah, ayah: info.ayah });
          setSelectedWord(null);
        }
      } else {
        setSelectedWord(info);
        setSelectedVerse(null);
      }
    },
    []
  );

  const handleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom shortcuts - use computedScale as base for consistent behavior
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(Math.min(4, computedScale * 1.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom(Math.max(0.25, computedScale / 1.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoom('page-fit');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [computedScale, setZoom]);

  // Calculate highlighted words
  const highlightedWords = useMemo(() => {
    if (selectedVerse && verseMapping) {
      const verseWords = getWordsForVerse(
        verseMapping,
        selectedVerse.surah,
        selectedVerse.ayah
      );
      return verseWords.map((w) => ({
        page: w.page + 1,
        line: w.line,
        word: w.word,
      }));
    } else if (selectedWord) {
      return [
        {
          page: selectedWord.pageNumber,
          line: selectedWord.lineIndex,
          word: selectedWord.wordIndex,
        },
      ];
    }
    return [];
  }, [selectedWord, selectedVerse, verseMapping]);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-600">Loading Quran viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Toolbar */}
      <Toolbar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        layoutType={layoutType}
        onLayoutChange={handleLayoutChange}
        tajweedEnabled={tajweedEnabled}
        onTajweedChange={setTajweedEnabled}
        verseNumberFormat={verseNumberFormat}
        onVerseFormatChange={setVerseNumberFormat}
        zoom={zoom}
        computedScale={computedScale}
        onZoomChange={handleZoomChange}
        spreadViewEnabled={spreadViewEnabled}
        onSpreadViewChange={setSpreadViewEnabled}
        engineType={engineType}
        onEngineChange={handleEngineChange}
        availableEngines={availableEngines}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onFullScreen={handleFullScreen}
        onAboutClick={() => setAboutOpen(true)}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          layoutType={layoutType}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {/* Viewer */}
        <div ref={containerRef} className="flex-1 overflow-hidden">
          {spreadViewEnabled ? (
            <QuranSpread
              pageNumber={currentPage}
              totalPages={totalPages}
              layoutType={layoutType}
              mode="auto"
              autoBreakpoint={900}
              pageGap={20}
              width="100%"
              height="100%"
              pageWidth={400 * computedScale}
              tajweedEnabled={tajweedEnabled}
              verseNumberFormat={verseNumberFormat}
              backgroundColor="#ffffff"
              highlightedWords={highlightedWords}
              highlightColor="rgba(255, 200, 0, 0.4)"
              onPageChange={(lowerPage) => handlePageChange(lowerPage)}
              onWordClick={handleWordClick}
            />
          ) : (
            <QuranViewer
              layoutType={layoutType}
              initialPage={currentPage}
              width="100%"
              height="100%"
              pageWidth={400}
              scale={computedScale}
              tajweedEnabled={tajweedEnabled}
              verseNumberFormat={verseNumberFormat}
              backgroundColor="#ffffff"
              pageGap={30}
              highlightedWords={highlightedWords}
              highlightColor="rgba(255, 200, 0, 0.4)"
              onPageChange={handlePageChange}
              onWordClick={handleWordClick}
              overscanPages={2}
            />
          )}
        </div>
      </div>

      {/* About Dialog */}
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}

// ============================================
// App with Provider
// ============================================

function App() {
  return (
    <QuranProvider wasmUrl={WASM_URL} fonts={FONT_URLS} quranText={QURAN_TEXT}>
      <QuranViewerApp />
    </QuranProvider>
  );
}

export default App;
