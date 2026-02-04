import { useState, useEffect, useRef } from 'react';
import type { Verse } from '../types/quran';
import { getVersesByPage, TOTAL_UI_PAGES, TOTAL_MUSHAF_PAGES, uiPageToApiPage } from '../api/quran';

interface UsePageResult {
  verses: Verse[];
  loading: boolean;
  error: Error | null;
  pageNumber: number;
  totalPages: number;
  isIntroPage: boolean;
  // Adjacent page data for swipe previews (from cache)
  prevPageVerses: Verse[] | null;
  nextPageVerses: Verse[] | null;
}

// Simple cache for preloaded pages
const pageCache = new Map<number, Verse[]>();

// Preload a page into cache
async function preloadPage(apiPage: number): Promise<void> {
  if (apiPage < 1 || apiPage > TOTAL_MUSHAF_PAGES) return;
  if (pageCache.has(apiPage)) return;

  try {
    const response = await getVersesByPage(apiPage);
    pageCache.set(apiPage, response.verses);
  } catch {
    // Silently fail preload - it's just an optimization
  }
}

export function usePage(pageNumber: number): UsePageResult {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const preloadedRef = useRef<Set<number>>(new Set());

  // Page 1 is the intro page, pages 2+ are Quran pages
  const isIntroPage = pageNumber === 1;
  const apiPage = uiPageToApiPage(pageNumber);

  useEffect(() => {
    let cancelled = false;

    async function fetchPageData() {
      // Check cache first
      const cached = pageCache.get(apiPage);
      if (cached) {
        setVerses(cached);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getVersesByPage(apiPage);

        if (!cancelled) {
          setVerses(response.verses);
          pageCache.set(apiPage, response.verses);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch page'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Only fetch if it's a valid Quran page (not intro page)
    if (!isIntroPage && apiPage >= 1 && apiPage <= TOTAL_MUSHAF_PAGES) {
      fetchPageData();
    } else if (isIntroPage) {
      // Intro page doesn't need API data
      setLoading(false);
      setVerses([]);
    }

    return () => {
      cancelled = true;
    };
  }, [pageNumber, apiPage, isIntroPage]);

  // Preload adjacent pages after current page loads
  useEffect(() => {
    if (loading || isIntroPage) return;

    const nextApiPage = apiPage + 1;
    const prevApiPage = apiPage - 1;

    // Preload next page (most likely to be visited)
    if (nextApiPage <= TOTAL_MUSHAF_PAGES && !preloadedRef.current.has(nextApiPage)) {
      preloadedRef.current.add(nextApiPage);
      preloadPage(nextApiPage);
    }

    // Preload previous page
    if (prevApiPage >= 1 && !preloadedRef.current.has(prevApiPage)) {
      preloadedRef.current.add(prevApiPage);
      preloadPage(prevApiPage);
    }
  }, [loading, apiPage, isIntroPage]);

  // Get adjacent pages from cache (for swipe preview)
  const prevApiPage = apiPage - 1;
  const nextApiPage = apiPage + 1;
  const prevPageVerses = prevApiPage >= 1 ? pageCache.get(prevApiPage) ?? null : null;
  const nextPageVerses = nextApiPage <= TOTAL_MUSHAF_PAGES ? pageCache.get(nextApiPage) ?? null : null;

  return {
    verses,
    loading,
    error,
    pageNumber,
    totalPages: TOTAL_UI_PAGES,
    isIntroPage,
    prevPageVerses,
    nextPageVerses,
  };
}
