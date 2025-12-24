import { useState, useCallback, useRef, useEffect } from 'react';
import type { SearchResult } from '../types/quran';
import { searchQuran } from '../api/quran';

interface UseSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  search: (query: string) => void;
  loadMore: () => void;
  clearResults: () => void;
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchQuran(query, page);
      const { search } = response;

      if (page === 1) {
        setResults(search.results);
      } else {
        setResults((prev) => [...prev, ...search.results]);
      }

      setTotalResults(search.total_results);
      setCurrentPage(search.current_page);
      setTotalPages(search.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback((query: string) => {
    setCurrentQuery(query);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query, 1);
    }, 300);
  }, [performSearch]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !loading) {
      performSearch(currentQuery, currentPage + 1);
    }
  }, [currentPage, totalPages, loading, currentQuery, performSearch]);

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setTotalPages(0);
    setCurrentQuery('');
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    totalResults,
    currentPage,
    totalPages,
    search,
    loadMore,
    clearResults,
  };
}
