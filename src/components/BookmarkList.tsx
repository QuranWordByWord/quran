import { useNavigate } from 'react-router-dom';
import type { Bookmark } from '../config/types';
import { useBookmarks } from '../contexts/BookmarkContext';
import { formatDateTime } from '../utils/bookmarkStorage';

interface BookmarkListProps {
  compact?: boolean;
  maxItems?: number;
  onNavigate?: () => void;
}

export function BookmarkList({ compact = false, maxItems, onNavigate }: BookmarkListProps) {
  const { bookmarks, removeBookmark } = useBookmarks();
  const navigate = useNavigate();

  const displayBookmarks = maxItems ? bookmarks.slice(0, maxItems) : bookmarks;

  const handleNavigate = (bookmark: Bookmark) => {
    const path = bookmark.viewMode === 'mushaf'
      ? `/mushaf/${bookmark.pageNumber}`
      : `/page/${bookmark.pageNumber}`;
    navigate(path);
    onNavigate?.();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeBookmark(id);
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <svg
          className="w-12 h-12 text-[var(--color-text-secondary)] opacity-50 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-[var(--color-text-secondary)] text-sm">
          No bookmarks yet
        </p>
        <p className="text-[var(--color-text-secondary)] text-xs mt-1 opacity-75">
          Tap the bookmark icon while reading to save your place
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="divide-y divide-[var(--color-border)]">
        {displayBookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--mushaf-header-bg)] transition-colors text-left"
          >
            <button
              onClick={() => handleNavigate(bookmark)}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {bookmark.surahName}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Page {bookmark.pageNumber} · {formatDateTime(bookmark.createdAt)}
              </p>
            </button>
            <button
              onClick={(e) => handleDelete(e, bookmark.id)}
              className="ml-2 p-1 text-[var(--color-text-secondary)] hover:text-red-500 rounded transition-colors"
              aria-label={`Remove bookmark for ${bookmark.surahName}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 p-2">
      {displayBookmarks.map(bookmark => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onNavigate={() => handleNavigate(bookmark)}
          onDelete={() => removeBookmark(bookmark.id)}
        />
      ))}
    </div>
  );
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onNavigate: () => void;
  onDelete: () => void;
}

function BookmarkCard({ bookmark, onNavigate, onDelete }: BookmarkCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className="w-full text-left p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--mushaf-header-bg)] hover:border-[var(--color-primary)]/30 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onNavigate}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--color-primary)] shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="font-semibold text-[var(--color-text-primary)] truncate">
              {bookmark.surahName}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
            <span>Page {bookmark.pageNumber}</span>
            <span>·</span>
            <span className="capitalize">{bookmark.viewMode === 'wordforword' ? 'Word by Word' : 'Mushaf'}</span>
            <span>·</span>
            <span>{formatDateTime(bookmark.createdAt)}</span>
          </div>
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          aria-label={`Remove bookmark for ${bookmark.surahName}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
