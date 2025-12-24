import type { Verse } from '../types/quran';
import { WordDisplay } from './WordDisplay';

interface VerseCardProps {
  verse: Verse;
  onPlayWord?: (audioUrl: string | null) => void;
  onPlayVerse?: (verseKey: string) => void;
  showTransliteration?: boolean;
}

export function VerseCard({
  verse,
  onPlayWord,
  onPlayVerse,
  showTransliteration = false,
}: VerseCardProps) {
  const translation = verse.translations?.[0]?.text || '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-medium">
            {verse.verse_number}
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {verse.verse_key}
          </span>
        </div>

        {/* Play Verse Button */}
        <button
          onClick={() => onPlayVerse?.(verse.verse_key)}
          className="p-2 rounded-full hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors"
          title="Play verse"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Words - RTL layout */}
      <div className="p-4">
        <div
          className="flex flex-wrap justify-center gap-2"
          style={{ direction: 'rtl' }}
        >
          {verse.words.map((word) => (
            <WordDisplay
              key={word.id}
              word={word}
              onPlayAudio={onPlayWord}
              showTransliteration={showTransliteration}
            />
          ))}
        </div>
      </div>

      {/* Translation */}
      {translation && (
        <div className="px-4 py-3 bg-gray-50 border-t border-[var(--color-border)]">
          <p
            className="text-[var(--color-text-secondary)] text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: translation }}
          />
        </div>
      )}
    </div>
  );
}
