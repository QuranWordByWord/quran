import { STORAGE_KEYS } from '../config/constants';
import type { Bookmark } from '../config/types';

/**
 * Load all bookmarks from localStorage
 */
export function loadBookmarks(): Bookmark[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.bookmarks);
    if (stored) {
      const bookmarks = JSON.parse(stored) as Bookmark[];
      // Sort by createdAt descending (newest first)
      return bookmarks.sort((a, b) => b.createdAt - a.createdAt);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save bookmarks to localStorage
 */
export function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    // Sort by createdAt descending before saving
    const sorted = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(sorted));
  } catch (error) {
    console.error('Failed to save bookmarks:', error);
  }
}

/**
 * Add a new bookmark
 */
export function addBookmark(
  bookmark: Omit<Bookmark, 'id' | 'createdAt'>
): Bookmark {
  const bookmarks = loadBookmarks();

  const newBookmark: Bookmark = {
    ...bookmark,
    id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };

  bookmarks.unshift(newBookmark);
  saveBookmarks(bookmarks);

  return newBookmark;
}

/**
 * Remove a bookmark by ID
 */
export function removeBookmark(id: string): void {
  const bookmarks = loadBookmarks();
  const filtered = bookmarks.filter(b => b.id !== id);
  saveBookmarks(filtered);
}

/**
 * Check if a page is bookmarked in a specific view mode
 */
export function isPageBookmarked(
  pageNumber: number,
  viewMode: 'mushaf' | 'wordforword'
): boolean {
  const bookmarks = loadBookmarks();
  return bookmarks.some(
    b => b.pageNumber === pageNumber && b.viewMode === viewMode
  );
}

/**
 * Get bookmark for a specific page and view mode
 */
export function getBookmarkForPage(
  pageNumber: number,
  viewMode: 'mushaf' | 'wordforword'
): Bookmark | null {
  const bookmarks = loadBookmarks();
  return bookmarks.find(
    b => b.pageNumber === pageNumber && b.viewMode === viewMode
  ) || null;
}

/**
 * Format relative time for display
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    // Format as date for older bookmarks
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Load sidebar expanded state
 */
export function loadSidebarExpanded(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.bookmarksSidebarExpanded);
    return stored === 'true';
  } catch {
    return false;
  }
}

/**
 * Save sidebar expanded state
 */
export function saveSidebarExpanded(expanded: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.bookmarksSidebarExpanded, String(expanded));
  } catch {
    // Ignore errors
  }
}
