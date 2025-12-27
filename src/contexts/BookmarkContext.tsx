import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Bookmark } from '../config/types';
import {
  loadBookmarks,
  addBookmark as addBookmarkToStorage,
  removeBookmark as removeBookmarkFromStorage,
  getBookmarkForPage,
} from '../utils/bookmarkStorage';
import { getSurahForPage } from '../utils/pageToSurah';

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (pageNumber: number, viewMode: 'mushaf' | 'wordforword') => Bookmark;
  removeBookmark: (id: string) => void;
  toggleBookmark: (pageNumber: number, viewMode: 'mushaf' | 'wordforword') => { added: boolean; bookmark?: Bookmark };
  isBookmarked: (pageNumber: number, viewMode: 'mushaf' | 'wordforword') => boolean;
  getBookmark: (pageNumber: number, viewMode: 'mushaf' | 'wordforword') => Bookmark | null;
}

const BookmarkContext = createContext<BookmarkContextType | null>(null);

interface BookmarkProviderProps {
  children: ReactNode;
}

export function BookmarkProvider({ children }: BookmarkProviderProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());

  // Sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quran-app-bookmarks') {
        setBookmarks(loadBookmarks());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addBookmark = useCallback((pageNumber: number, viewMode: 'mushaf' | 'wordforword'): Bookmark => {
    const surahInfo = getSurahForPage(pageNumber, viewMode);

    const newBookmark = addBookmarkToStorage({
      pageNumber,
      viewMode,
      surahId: surahInfo.id,
      surahName: surahInfo.name,
    });

    setBookmarks(loadBookmarks());
    return newBookmark;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    removeBookmarkFromStorage(id);
    setBookmarks(loadBookmarks());
  }, []);

  const toggleBookmark = useCallback((pageNumber: number, viewMode: 'mushaf' | 'wordforword'): { added: boolean; bookmark?: Bookmark } => {
    const existing = getBookmarkForPage(pageNumber, viewMode);

    if (existing) {
      removeBookmarkFromStorage(existing.id);
      setBookmarks(loadBookmarks());
      return { added: false };
    } else {
      const newBookmark = addBookmark(pageNumber, viewMode);
      return { added: true, bookmark: newBookmark };
    }
  }, [addBookmark]);

  const isBookmarked = useCallback((pageNumber: number, viewMode: 'mushaf' | 'wordforword'): boolean => {
    return bookmarks.some(
      b => b.pageNumber === pageNumber && b.viewMode === viewMode
    );
  }, [bookmarks]);

  const getBookmark = useCallback((pageNumber: number, viewMode: 'mushaf' | 'wordforword'): Bookmark | null => {
    return bookmarks.find(
      b => b.pageNumber === pageNumber && b.viewMode === viewMode
    ) || null;
  }, [bookmarks]);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        getBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
