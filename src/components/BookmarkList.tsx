import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Bookmark } from '../config/types';
import { useBookmarks } from '../contexts/BookmarkContext';
import { formatDateTime } from '../utils/bookmarkStorage';
import { ConfirmDialog } from './ConfirmDialog';

interface BookmarkListProps {
  compact?: boolean;
  maxItems?: number;
  onNavigate?: () => void;
}

export function BookmarkList({ compact = false, maxItems, onNavigate }: BookmarkListProps) {
  const { bookmarks, removeBookmark } = useBookmarks();
  const navigate = useNavigate();
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);

  const displayBookmarks = maxItems ? bookmarks.slice(0, maxItems) : bookmarks;

  const handleNavigate = (bookmark: Bookmark) => {
    // For mushaf, add 1 to convert quran page to app page (app page 2 = quran page 1)
    const path = bookmark.viewMode === 'mushaf'
      ? `/mushaf/${bookmark.pageNumber + 1}`
      : `/page/${bookmark.pageNumber}`;
    navigate(path);
    onNavigate?.();
  };

  const handleDeleteClick = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.stopPropagation();
    setBookmarkToDelete(bookmark);
  };

  const handleConfirmDelete = () => {
    if (bookmarkToDelete) {
      removeBookmark(bookmarkToDelete.id);
      setBookmarkToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setBookmarkToDelete(null);
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
      <>
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
                  Page {bookmark.pageNumber}{bookmark.juzNumber ? ` · Juz ${bookmark.juzNumber}` : ''} · {formatDateTime(bookmark.createdAt)}
                </p>
              </button>
              <button
                onClick={(e) => handleDeleteClick(e, bookmark)}
                className="ml-2 p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                aria-label={`Remove bookmark for ${bookmark.surahName}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <ConfirmDialog
          isOpen={bookmarkToDelete !== null}
          title="Delete Bookmark"
          message="Are you sure you want to delete this bookmark?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          bookmarkDetails={bookmarkToDelete ? {
            surahName: bookmarkToDelete.surahName,
            pageNumber: bookmarkToDelete.pageNumber,
            viewMode: bookmarkToDelete.viewMode,
            createdAt: bookmarkToDelete.createdAt,
          } : undefined}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 p-2">
        {displayBookmarks.map(bookmark => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onNavigate={() => handleNavigate(bookmark)}
            onDeleteClick={(e) => handleDeleteClick(e, bookmark)}
          />
        ))}
      </div>
      <ConfirmDialog
        isOpen={bookmarkToDelete !== null}
        title="Delete Bookmark"
        message="Are you sure you want to delete this bookmark?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        bookmarkDetails={bookmarkToDelete ? {
          surahName: bookmarkToDelete.surahName,
          pageNumber: bookmarkToDelete.pageNumber,
          viewMode: bookmarkToDelete.viewMode,
          createdAt: bookmarkToDelete.createdAt,
        } : undefined}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onNavigate: () => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

function BookmarkCard({ bookmark, onNavigate, onDeleteClick }: BookmarkCardProps) {
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
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Page {bookmark.pageNumber}{bookmark.juzNumber ? ` · Juz ${bookmark.juzNumber}` : ''} · {bookmark.viewMode === 'wordforword' ? 'Word by Word' : 'Mushaf'} · {formatDateTime(bookmark.createdAt)}
          </p>
        </button>
        <button
          onClick={onDeleteClick}
          className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors lg:opacity-0 lg:group-hover:opacity-100"
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
