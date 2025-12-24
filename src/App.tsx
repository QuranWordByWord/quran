import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { ChapterList } from './components/ChapterList';
import { ChapterView } from './components/ChapterView';
import { SearchResults } from './components/SearchResults';
import { AudioPlayer } from './components/AudioPlayer';
import { useChapters } from './hooks/useChapters';
import { useChapter } from './hooks/useChapter';
import { useSearch } from './hooks/useSearch';
import { useAudio } from './hooks/useAudio';

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

function AppContent() {
  const { chapters, loading: chaptersLoading } = useChapters();
  const search = useSearch();

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Header onSearch={search.search} />

      <div className="flex">
        <ChapterList chapters={chapters} loading={chaptersLoading} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/chapter/1" replace />} />
            <Route path="/chapter/:chapterId" element={<ChapterPage />} />
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
      </div>
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
