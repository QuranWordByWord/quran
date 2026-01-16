import { useState } from 'react';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useToast } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';

interface BookmarkButtonProps {
  pageNumber: number;
  viewMode: 'mushaf' | 'wordforword';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function BookmarkButton({
  pageNumber,
  viewMode,
  size = 'md',
  className = '',
  showLabel = false,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, getBookmark } = useBookmarks();
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const bookmarked = isBookmarked(pageNumber, viewMode);
  const bookmark = getBookmark(pageNumber, viewMode);

  const handleClick = () => {
    if (bookmarked) {
      setShowConfirm(true);
    } else {
      const result = toggleBookmark(pageNumber, viewMode);
      if (result.added) {
        showToast('Bookmark added', 'success');
      }
    }
  };

  const handleConfirmDelete = () => {
    toggleBookmark(pageNumber, viewMode);
    showToast('Bookmark removed', 'info');
    setShowConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
  <>
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses}
        flex items-center justify-center gap-1.5
        rounded-full transition-all duration-200
        ${bookmarked
          ? 'bg-[var(--color-primary)] text-white shadow-md'
          : 'bg-[var(--mushaf-page-bg)]/90 text-[var(--color-text-secondary)] hover:bg-[var(--mushaf-page-bg)] hover:text-[var(--color-primary)]'
        }
        border border-[var(--color-border)]
        active:scale-95
        ${className}
      `}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={bookmarked}
    >
      {bookmarked ? (
        <svg
          className={iconSizeClasses}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg
          className={iconSizeClasses}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
    <ConfirmDialog
      isOpen={showConfirm}
      title="Delete Bookmark"
      message="Are you sure you want to delete this bookmark?"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
      bookmarkDetails={bookmark ? {
        surahName: bookmark.surahName,
        pageNumber: bookmark.pageNumber,
        viewMode: bookmark.viewMode,
        createdAt: bookmark.createdAt,
      } : undefined}
    />
  </>
  );
}

// Inline bookmark button for mobile navigation bar - shows date only when bookmarked
interface InlineBookmarkButtonProps {
  pageNumber: number;
  viewMode: 'mushaf' | 'wordforword';
  variant?: 'default' | 'header';
}

export function InlineBookmarkButton({
  pageNumber,
  viewMode,
  variant = 'default',
}: InlineBookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, getBookmark } = useBookmarks();
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const bookmarked = isBookmarked(pageNumber, viewMode);
  const bookmark = getBookmark(pageNumber, viewMode);

  const handleClick = () => {
    if (bookmarked) {
      setShowConfirm(true);
    } else {
      const result = toggleBookmark(pageNumber, viewMode);
      if (result.added) {
        showToast('Bookmark added', 'success');
      }
    }
  };

  const handleConfirmDelete = () => {
    toggleBookmark(pageNumber, viewMode);
    showToast('Bookmark removed', 'info');
    setShowConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  // Get current date formatted as day and short month
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.toLocaleString('en-US', { month: 'short' });

  // Header variant - white outline icon for header bar with date when bookmarked
  // No confirmation dialog - deletes immediately for quick mobile interaction
  if (variant === 'header') {
    const handleHeaderClick = () => {
      const result = toggleBookmark(pageNumber, viewMode);
      if (result.added) {
        showToast('Bookmark added', 'success');
      } else {
        showToast('Bookmark removed', 'info');
      }
    };

    return (
      <button
        onClick={handleHeaderClick}
        className="relative p-1.5 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        aria-pressed={bookmarked}
      >
        <svg
          className="w-5 h-6"
          viewBox="0 0 24 30"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            d="M4 4a2 2 0 012-2h12a2 2 0 012 2v24l-8-4-8 4V4z"
            fill={bookmarked ? 'currentColor' : 'none'}
          />
        </svg>
        {/* Date inside bookmark - only shown when bookmarked */}
        {bookmarked && (
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-2 text-[var(--color-primary)]">
            <span className="text-[5.5px] font-medium uppercase leading-none">{currentMonth}</span>
            <span className="text-[8px] font-bold leading-none">{currentDay}</span>
          </div>
        )}
      </button>
    );
  }

  // Default variant - larger with date display
  return (
  <>
    <button
      onClick={handleClick}
      className={`
        relative w-10 h-12 flex flex-col items-center justify-start
        transition-all duration-200
        ${bookmarked
          ? 'text-[var(--color-primary)]'
          : 'text-[var(--color-text-secondary)]'
        }
        active:scale-95
      `}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={bookmarked}
    >
      {/* Bookmark icon as background */}
      <svg
        className="w-10 h-12 absolute inset-0"
        viewBox="0 0 24 30"
        aria-hidden="true"
      >
        {bookmarked ? (
          <path
            d="M4 4a2 2 0 012-2h12a2 2 0 012 2v24l-8-4-8 4V4z"
            fill="currentColor"
          />
        ) : (
          <path
            d="M4 4a2 2 0 012-2h12a2 2 0 012 2v24l-8-4-8 4V4z"
            fill="var(--mushaf-page-bg)"
            stroke="currentColor"
            strokeWidth={1}
          />
        )}
      </svg>
      {/* Date inside bookmark - only shown when bookmarked */}
      {bookmarked && (
        <div className="relative z-10 flex flex-col items-center leading-none mt-1 text-white">
          <span className="text-[9px] font-medium uppercase">{currentMonth}</span>
          <span className="text-xs font-bold">{currentDay}</span>
        </div>
      )}
    </button>
    <ConfirmDialog
      isOpen={showConfirm}
      title="Delete Bookmark"
      message="Are you sure you want to delete this bookmark?"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
      bookmarkDetails={bookmark ? {
        surahName: bookmark.surahName,
        pageNumber: bookmark.pageNumber,
        viewMode: bookmark.viewMode,
        createdAt: bookmark.createdAt,
      } : undefined}
    />
  </>
  );
}
