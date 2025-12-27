import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useToast } from './Toast';

export function BookmarkDropdown() {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { showToast } = useToast();
  const location = useLocation();

  // Extract current page and view mode from URL
  const getPageInfo = (): { pageNumber: number; viewMode: 'mushaf' | 'wordforword' } => {
    const mushafMatch = location.pathname.match(/^\/mushaf\/(\d+)/);
    const pageMatch = location.pathname.match(/^\/page\/(\d+)/);
    if (mushafMatch) return { pageNumber: parseInt(mushafMatch[1]), viewMode: 'mushaf' };
    if (pageMatch) return { pageNumber: parseInt(pageMatch[1]), viewMode: 'wordforword' };
    return { pageNumber: 1, viewMode: 'mushaf' };
  };

  const { pageNumber, viewMode } = getPageInfo();

  const bookmarked = isBookmarked(pageNumber, viewMode);

  // Keyboard shortcut (Ctrl/Cmd + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        handleToggleBookmark();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, viewMode]);

  const handleToggleBookmark = () => {
    const result = toggleBookmark(pageNumber, viewMode);
    if (result.added) {
      showToast('Bookmark added', 'success');
    } else {
      showToast('Bookmark removed', 'info');
    }
  };

  // Get current date formatted as day and short month
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.toLocaleString('en-US', { month: 'short' });

  return (
    <button
      onClick={handleToggleBookmark}
      className={`
        relative rounded-lg transition-all duration-200 flex items-center justify-center p-2
        ${bookmarked
          ? 'bg-white shadow-md'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
        }
      `}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={bookmarked}
      title={`${bookmarked ? 'Remove' : 'Add'} bookmark (Ctrl+D)`}
    >
      {bookmarked ? (
        <div className="relative w-5 h-6 flex flex-col items-center justify-start">
          {/* White filled bookmark with green border */}
          <svg
            className="w-5 h-6 absolute inset-0 text-[var(--color-primary)]"
            viewBox="0 0 24 30"
            aria-hidden="true"
          >
            <path
              d="M4 4a2 2 0 012-2h12a2 2 0 012 2v24l-8-4-8 4V4z"
              fill="white"
              stroke="currentColor"
              strokeWidth={2}
            />
          </svg>
          {/* Date inside bookmark */}
          <div className="relative z-10 flex flex-col items-center leading-none mt-1 text-[var(--color-primary)]">
            <span className="text-[5px] font-semibold uppercase">{currentMonth}</span>
            <span className="text-[8px] font-bold">{currentDay}</span>
          </div>
        </div>
      ) : (
        <div className="relative w-5 h-6 flex flex-col items-center justify-start">
          <svg
            className="w-5 h-6 absolute inset-0"
            viewBox="0 0 24 30"
            aria-hidden="true"
          >
            <path
              d="M4 4a2 2 0 012-2h12a2 2 0 012 2v24l-8-4-8 4V4z"
              fill="none"
              stroke="white"
              strokeWidth={2}
            />
          </svg>
        </div>
      )}
    </button>
  );
}
