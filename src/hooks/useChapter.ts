import { useState, useEffect } from 'react';
import type { Chapter, Verse } from '../types/quran';
import { getChapter, getAllVerses } from '../api/quran';

interface UseChapterResult {
  chapter: Chapter | null;
  verses: Verse[];
  loading: boolean;
  error: Error | null;
}

export function useChapter(chapterId: number): UseChapterResult {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChapterData() {
      try {
        setLoading(true);
        setError(null);

        const [chapterInfo, versesData] = await Promise.all([
          getChapter(chapterId),
          getAllVerses(chapterId),
        ]);

        if (!cancelled) {
          setChapter(chapterInfo);
          setVerses(versesData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch chapter'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (chapterId >= 1 && chapterId <= 114) {
      fetchChapterData();
    }

    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  return { chapter, verses, loading, error };
}
