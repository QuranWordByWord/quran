import { useState, useEffect } from 'react';
import type { Chapter } from '../types/quran';
import { getChapters } from '../api/quran';

interface UseChaptersResult {
  chapters: Chapter[];
  loading: boolean;
  error: Error | null;
}

export function useChapters(): UseChaptersResult {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChapters() {
      try {
        setLoading(true);
        setError(null);
        const data = await getChapters();
        if (!cancelled) {
          setChapters(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch chapters'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchChapters();

    return () => {
      cancelled = true;
    };
  }, []);

  return { chapters, loading, error };
}
