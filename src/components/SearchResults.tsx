import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../types/quran';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
  totalResults: number;
  onLoadMore?: () => void;
  hasMore: boolean;
}

export function SearchResults({
  results,
  loading,
  error,
  totalResults,
  onLoadMore,
  hasMore,
}: SearchResultsProps) {
  const navigate = useNavigate();

  const handleResultClick = (verseKey: string) => {
    const [chapterId] = verseKey.split(':');
    navigate(`/chapter/${chapterId}#verse-${verseKey}`);
  };

  if (loading && results.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4">
                <div className="h-6 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Search Error
          </h2>
          <p className="text-[var(--color-text-secondary)]">{error.message}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            No Results Found
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Try searching with different keywords
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Search Results
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {results.map((result) => (
            <button
              key={result.verse_id}
              onClick={() => handleResultClick(result.verse_key)}
              className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium rounded">
                  {result.verse_key}
                </span>
              </div>

              {/* Arabic Text */}
              <p
                className="arabic-text text-xl text-[var(--color-text-primary)] mb-2 leading-relaxed"
                style={{ direction: 'rtl' }}
              >
                {result.text}
              </p>

              {/* Highlighted Translation */}
              {result.highlighted && (
                <p
                  className="text-[var(--color-text-secondary)] text-sm"
                  dangerouslySetInnerHTML={{ __html: result.highlighted }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
