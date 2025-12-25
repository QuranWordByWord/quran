import { useState } from 'react';
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
  const [showTranslation, setShowTranslation] = useState(false);

  // Skip end markers and pause marks for display
  if (word.char_type_name === 'end') {
    return (
      <div className="flex flex-col items-center justify-start px-1 sm:px-2">
        <span className="arabic-text text-lg sm:text-2xl text-[var(--color-accent)]">
          {word.text_uthmani || word.text}
        </span>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    // Single click toggles translation display
    if (e.detail === 1) {
      setShowTranslation(!showTranslation);
    }
  };

  const handleDoubleClick = () => {
    // Double click plays audio
    if (onPlayAudio && word.audio_url) {
      onPlayAudio(word.audio_url);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`flex flex-col items-center justify-start p-1 sm:p-2 rounded-lg transition-all shrink-0 ${
        word.audio_url
          ? 'cursor-pointer hover:bg-[var(--color-primary)]/5 active:bg-[var(--color-primary)]/10'
          : ''
      }`}
    >
      {/* Arabic Word */}
      <span className="arabic-text text-lg sm:text-2xl md:text-3xl text-[var(--color-text-primary)] leading-relaxed whitespace-nowrap">
        {word.text_uthmani || word.text}
      </span>

      {/* Transliteration (optional) */}
      {showTransliteration && word.transliteration?.text && (
        <span className="text-[10px] sm:text-xs text-[var(--color-primary)] mt-0.5 sm:mt-1 italic">
          {word.transliteration.text}
        </span>
      )}

      {/* Translation - shown on single click */}
      {showTranslation && (
        <span className="text-[9px] sm:text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5 sm:mt-1 text-center leading-tight max-w-[60px] sm:max-w-[90px] break-words">
          {word.translation?.text || ''}
        </span>
      )}
    </div>
  );
}
