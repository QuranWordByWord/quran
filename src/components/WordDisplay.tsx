import type { Word } from '../types/quran';

interface WordDisplayProps {
  word: Word;
  onPlayAudio?: (audioUrl: string | null) => void;
  showTransliteration?: boolean;
}

export function WordDisplay({
  word,
  onPlayAudio,
  showTransliteration = false,
}: WordDisplayProps) {
  // Skip end markers and pause marks for display
  if (word.char_type_name === 'end') {
    return (
      <div className="flex flex-col items-center justify-start px-2">
        <span className="arabic-text text-2xl text-[var(--color-accent)]">
          {word.text_uthmani || word.text}
        </span>
      </div>
    );
  }

  const handleClick = () => {
    if (onPlayAudio && word.audio_url) {
      onPlayAudio(word.audio_url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center justify-start p-2 rounded-lg transition-all ${
        word.audio_url
          ? 'cursor-pointer hover:bg-[var(--color-primary)]/5 active:bg-[var(--color-primary)]/10'
          : ''
      }`}
    >
      {/* Arabic Word */}
      <span className="arabic-text text-3xl text-[var(--color-text-primary)] leading-relaxed">
        {word.text_uthmani || word.text}
      </span>

      {/* Transliteration (optional) */}
      {showTransliteration && word.transliteration?.text && (
        <span className="text-xs text-[var(--color-primary)] mt-1 italic">
          {word.transliteration.text}
        </span>
      )}

      {/* Translation */}
      <span className="text-sm text-[var(--color-text-secondary)] mt-1 text-center max-w-[100px]">
        {word.translation?.text || ''}
      </span>
    </div>
  );
}
