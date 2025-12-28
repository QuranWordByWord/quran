import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Bookmark } from '../config/types';
import { loadBookmarks, saveBookmarks } from '../utils/bookmarkStorage';
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
  // Track if we're currently updating to prevent storage event loops
  const isUpdatingRef = useRef(false);

  // Persist bookmarks to localStorage whenever they change
  useEffect(() => {
    isUpdatingRef.current = true;
    saveBookmarks(bookmarks);
    // Reset flag after a small delay to allow storage event to fire
    const timeout = setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
    return () => clearTimeout(timeout);
  }, [bookmarks]);

  // Sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Ignore if we triggered this change
      if (isUpdatingRef.current) return;
      if (e.key === 'quran-app-bookmarks') {
        setBookmarks(loadBookmarks());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addBookmark = useCallback((pageNumber: number, viewMode: 'mushaf' | 'wordforword'): Bookmark => {
    const surahInfo = getSurahForPage(pageNumber, viewMode);

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pageNumber,
      viewMode,
      surahId: surahInfo.id,
      surahName: surahInfo.name,
      createdAt: Date.now(),
    };

    // Update state directly - localStorage sync happens via useEffect
    setBookmarks(prev => {
      const updated = [newBookmark, ...prev];
      return updated.sort((a, b) => b.createdAt - a.createdAt);
    });

    return newBookmark;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    // Update state directly - localStorage sync happens via useEffect
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const toggleBookmark = useCallback((pageNumber: number, viewMode: 'mushaf' | 'wordforword'): { added: boolean; bookmark?: Bookmark } => {
    // Use functional update to ensure we have latest state
    let result: { added: boolean; bookmark?: Bookmark } = { added: false };

    setBookmarks(prev => {
      const existing = prev.find(
        b => b.pageNumber === pageNumber && b.viewMode === viewMode
      );

      if (existing) {
        result = { added: false };
        return prev.filter(b => b.id !== existing.id);
      } else {
        const surahInfo = getSurahForPage(pageNumber, viewMode);
        const newBookmark: Bookmark = {
          id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pageNumber,
          viewMode,
          surahId: surahInfo.id,
          surahName: surahInfo.name,
          createdAt: Date.now(),
        };
        result = { added: true, bookmark: newBookmark };
        const updated = [newBookmark, ...prev];
        return updated.sort((a, b) => b.createdAt - a.createdAt);
      }
    });

    return result;
  }, []);

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
