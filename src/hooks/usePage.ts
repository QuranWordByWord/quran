import { useState, useEffect } from 'react';
import type { Verse } from '../types/quran';
import { getVersesByPage, TOTAL_MUSHAF_PAGES } from '../api/quran';

interface UsePageResult {
  verses: Verse[];
  loading: boolean;
  error: Error | null;
  pageNumber: number;
  totalPages: number;
}

export function usePage(pageNumber: number): UsePageResult {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPageData() {
      try {
        setLoading(true);
        setError(null);

        const response = await getVersesByPage(pageNumber);

        if (!cancelled) {
          setVerses(response.verses);
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

    if (pageNumber >= 1 && pageNumber <= TOTAL_MUSHAF_PAGES) {
      fetchPageData();
    }

    return () => {
      cancelled = true;
    };
  }, [pageNumber]);

  return {
    verses,
    loading,
    error,
    pageNumber,
    totalPages: TOTAL_MUSHAF_PAGES,
  };
}
