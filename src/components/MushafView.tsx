import type { Chapter, Verse } from '../types/quran';
import { VerseCard } from './VerseCard';

interface MushafViewProps {
  chapter: Chapter | null;
  verses: Verse[];
  loading: boolean;
  error: Error | null;
  onPlayWord?: (audioUrl: string | null) => void;
  onPlayVerse?: (verseKey: string) => void;
}

export function MushafView({
  chapter,
  verses,
  loading,
  error,
  onPlayWord,
  onPlayVerse,
}: MushafViewProps) {
  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-2" />
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
          </div>
          {/* Verse Skeletons */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-4" />
                <div className="flex flex-wrap gap-4 justify-center">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex flex-col items-center gap-2">
                      <div className="h-10 w-20 bg-gray-200 rounded" />
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Error Loading Chapter
          </h2>
          <p className="text-[var(--color-text-secondary)]">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Select a Chapter
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Choose a surah from the sidebar to start reading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-2 py-3 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto w-full">
        {/* Chapter Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 bg-[var(--color-primary)] text-white py-4 sm:py-6 rounded-lg sm:rounded-xl -mx-2 sm:mx-0">
          <h1 className="arabic-text text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
            {chapter.name_arabic}
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
            {chapter.name_simple}
          </h2>
          <p className="text-white/80 mt-1 text-xs sm:text-sm">
            {chapter.translated_name.name} • {chapter.verses_count} verses •{' '}
            {chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
          </p>
        </div>

        {/* Bismillah (if not Al-Fatiha or At-Tawbah) */}
        {chapter.bismillah_pre && (
          <div className="text-center mb-4 sm:mb-6 md:mb-8 py-3 sm:py-4 bg-gray-50 rounded-lg -mx-2 sm:mx-0">
            <span className="arabic-text text-xl sm:text-2xl md:text-3xl text-[var(--color-primary)]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
          </div>
        )}

        {/* Verses */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 pb-20 md:pb-4">
          {verses.map((verse) => (
            <VerseCard
              key={verse.id}
              verse={verse}
              onPlayWord={onPlayWord}
              onPlayVerse={onPlayVerse}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
