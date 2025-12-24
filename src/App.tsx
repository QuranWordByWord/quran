import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Header } from './components/Header';
import { ChapterList, MobileChapterList } from './components/ChapterList';
import { ChapterView } from './components/ChapterView';
import { MushafPage } from './components/MushafPage';
import { SearchResults } from './components/SearchResults';
import { AudioPlayer } from './components/AudioPlayer';
import { ChapterQuickLinks, MobileChapterSelector } from './components/ChapterQuickLinks';
import { useChapters } from './hooks/useChapters';
import { useChapter } from './hooks/useChapter';
import { usePage } from './hooks/usePage';
import { useSearch } from './hooks/useSearch';
import { useAudio } from './hooks/useAudio';

type ViewMode = 'chapter' | 'mushaf';

function ChapterPage() {
  const { chapterId } = useParams();
  const id = chapterId ? parseInt(chapterId) : 1;
  const { chapter, verses, loading, error } = useChapter(id);
  const audio = useAudio();

  return (
    <>
      <ChapterView
        chapter={chapter}
        verses={verses}
        loading={loading}
        error={error}
        onPlayWord={audio.playWord}
        onPlayVerse={audio.playVerse}
      />
      <AudioPlayer
        isPlaying={audio.isPlaying}
        currentTime={audio.currentTime}
        duration={audio.duration}
        onPause={audio.pause}
        onStop={audio.stop}
        onSeek={audio.seek}
      />
    </>
  );
}

function MushafPageView() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = pageNumber ? parseInt(pageNumber) : 1;
  const { verses, loading, error, totalPages } = usePage(page);
  const audio = useAudio();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/page/${newPage}`);
    }
  };

  return (
    <>
      <MushafPage
        verses={verses}
        loading={loading}
        error={error}
        pageNumber={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPlayWord={audio.playWord}
        onPlayVerse={audio.playVerse}
      />
      <AudioPlayer
        isPlaying={audio.isPlaying}
        currentTime={audio.currentTime}
        duration={audio.duration}
        onPause={audio.pause}
        onStop={audio.stop}
        onSeek={audio.seek}
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

function ViewModeToggle({
  mode,
  onModeChange,
}: {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}) {
  const navigate = useNavigate();

  const handleChange = (newMode: ViewMode) => {
    onModeChange(newMode);
    if (newMode === 'chapter') {
      navigate('/chapter/1');
    } else {
      navigate('/page/1');
    }
  };

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => handleChange('chapter')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          mode === 'chapter'
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Chapter View
      </button>
      <button
        onClick={() => handleChange('mushaf')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          mode === 'mushaf'
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        15-Line Mushaf
      </button>
    </div>
  );
}

function AppContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('mushaf');
  const { chapters, loading: chaptersLoading } = useChapters();
  const search = useSearch();

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Header onSearch={search.search}>
        <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
      </Header>

      <div className="flex min-h-0">
        {viewMode === 'chapter' && (
          <ChapterList chapters={chapters} loading={chaptersLoading} />
        )}
        {viewMode === 'mushaf' && (
          <ChapterQuickLinks side="left" />
        )}

        <main className="flex-1 min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/page/1" replace />} />
            <Route path="/chapter/:chapterId" element={<ChapterPage />} />
            <Route path="/page/:pageNumber" element={<MushafPageView />} />
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

        {viewMode === 'mushaf' && (
          <ChapterQuickLinks side="right" />
        )}
      </div>

      {/* Mobile chapter selector - floating button */}
      {viewMode === 'mushaf' && <MobileChapterSelector />}
      {viewMode === 'chapter' && <MobileChapterList chapters={chapters} />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
