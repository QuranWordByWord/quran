interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLooping?: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onToggleLoop?: () => void;
  onDismiss?: () => void;
}

export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  isLooping = false,
  onPause,
  onResume,
  onStop,
  onSeek,
  onToggleLoop,
  onDismiss,
}: AudioPlayerProps) {
  if (!isPlaying && duration === 0) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleDismiss = () => {
    onStop();
    onDismiss?.();
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] shadow-lg z-[60]"
      role="region"
      aria-label="Audio player"
      aria-live="polite"
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={isPlaying ? onPause : onResume}
            className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors shrink-0"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Loop/Repeat Button */}
          {onToggleLoop && (
            <button
              onClick={onToggleLoop}
              className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
                isLooping
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'hover:bg-gray-100 text-[var(--color-text-secondary)]'
              }`}
              aria-label={isLooping ? 'Disable repeat' : 'Enable repeat'}
              aria-pressed={isLooping}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Progress Bar */}
          <div className="flex-1 min-w-0">
            <div
              className="h-2 bg-gray-200 rounded-full cursor-pointer relative"
              role="slider"
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(currentTime)}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              tabIndex={0}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                onSeek(percentage * duration);
              }}
              onKeyDown={(e) => {
                const step = duration * 0.05; // 5% of duration
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  onSeek(Math.min(currentTime + step, duration));
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  onSeek(Math.max(currentTime - step, 0));
                } else if (e.key === 'Home') {
                  e.preventDefault();
                  onSeek(0);
                } else if (e.key === 'End') {
                  e.preventDefault();
                  onSeek(duration);
                }
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-[var(--color-primary)] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Time Display */}
          <div
            className="text-xs sm:text-sm text-[var(--color-text-secondary)] min-w-[60px] sm:min-w-[80px] text-right shrink-0"
            aria-live="off"
            aria-atomic="true"
          >
            <span className="sr-only">Current time: </span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-[var(--color-text-secondary)] transition-colors shrink-0"
            aria-label="Close audio player"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
