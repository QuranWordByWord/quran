import { useFontClass } from '../App';

interface IntroPageProps {
  onStartReading: () => void;
  variant?: 'wordforword' | 'mushaf';
}

export function IntroPage({ onStartReading, variant = 'wordforword' }: IntroPageProps) {
  const fontClass = useFontClass();

  // Mushaf variant content (slightly reduced spacing to fit without scroll, 610 pages)
  const mushafContent = (
    <>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-32 sm:w-40 mx-auto overflow-hidden" style={{ aspectRatio: '1.8' }}>
          <img
            src="/quran/quran-logo.png"
            alt="Quran"
            className="w-full"
          />
        </div>
        <p className="text-lg text-[var(--mushaf-text-secondary)] mt-2 font-sans">
          The Noble Quran
        </p>
      </div>

      {/* Bismillah */}
      <div className="text-center my-6 py-3 border-y border-[var(--mushaf-border)]/30">
        <span className={`arabic-text ${fontClass} text-xl sm:text-2xl text-[var(--mushaf-text-header)]`}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>
        <p className="text-sm text-[var(--mushaf-text-secondary)] mt-2">
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>
      </div>

      {/* Description */}
      <div className="text-center space-y-3 mb-6">
        <div className="space-y-1.5 text-xs sm:text-sm text-[var(--mushaf-text-secondary)]">
          <p>Word-by-word Quran with translations and audio recitation.</p>
          <p>
            <span className="text-[var(--mushaf-border)] font-medium">Tajweed Rules</span> — Colour-coded pronunciation guide
          </p>
          <p>
            <span className="text-[var(--mushaf-border)] font-medium">Multiple Scripts</span> — IndoPak or Madinah Mushaf styles
          </p>
          <p>
            <span className="text-[var(--mushaf-border)] font-medium">Bookmarks</span> — Save your place and continue reading
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--mushaf-text-secondary)] pt-2">
          <div className="flex items-center gap-1">
            <span className="text-[var(--mushaf-accent)] font-medium">610</span>
            <span>Pages</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[var(--mushaf-accent)] font-medium">114</span>
            <span>Surahs</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[var(--mushaf-accent)] font-medium">30</span>
            <span>Juz</span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={onStartReading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--mushaf-border)] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <span>Start Reading</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-3 border-t border-[var(--mushaf-border)]/30">
        <p className="text-xs text-[var(--mushaf-text-secondary)]">
          15-Line Mushaf Layout
        </p>
      </div>
    </>
  );

  // Word-for-word variant content (original spacing)
  const wordForWordContent = (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-40 sm:w-48 md:w-56 mx-auto overflow-hidden" style={{ aspectRatio: '1.8' }}>
          <img
            src="/quran/quran-logo.png"
            alt="Quran"
            className="w-full"
          />
        </div>
        <p className="text-lg sm:text-xl text-[var(--mushaf-text-secondary)] mt-3 font-sans">
          The Noble Quran
        </p>
      </div>

      {/* Bismillah */}
      <div className="text-center my-8 py-4 border-y border-[var(--mushaf-border)]/30">
        <span className={`arabic-text ${fontClass} text-xl sm:text-2xl md:text-3xl text-[var(--mushaf-text-header)]`}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>
        <p className="text-sm text-[var(--mushaf-text-secondary)] mt-2">
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>
      </div>

      {/* Description */}
      <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="space-y-2 text-xs sm:text-sm text-[var(--mushaf-text-secondary)]">
          <p>
            Word-by-word Quran with translations and audio recitation.
            Click on any line to reveal word meanings.
          </p>
          <p>
            <span className="text-[var(--mushaf-border)] font-medium">Bookmarks</span> — Save your place and continue where you left off
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--mushaf-text-secondary)] pt-2">
          <div className="flex items-center gap-1">
            <span className="text-[var(--mushaf-accent)] font-medium">611</span>
            <span>Pages</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[var(--mushaf-accent)] font-medium">114</span>
            <span>Surahs</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[var(--mushaf-accent)] font-medium">30</span>
            <span>Juz</span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={onStartReading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--mushaf-border)] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <span>Start Reading</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pt-4 border-t border-[var(--mushaf-border)]/30">
        <p className="text-xs text-[var(--mushaf-text-secondary)]">
          15-Line Mushaf Layout
        </p>
      </div>
    </>
  );

  // Mushaf variant uses the SVG border as a background with fixed aspect ratio
  if (variant === 'mushaf') {
    // The SVG border has a fixed aspect ratio of 437:740
    const SVG_ASPECT_RATIO = 437 / 740;

    return (
      <div className="flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)] overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-min">
          <div
            className="relative bg-[var(--mushaf-frame-bg)]"
            style={{
              width: 'min(95vw, 480px)',
              aspectRatio: SVG_ASPECT_RATIO,
              backgroundImage: `url('/quran/assets/borders/green/full-border.svg')`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Content positioned inside the border area (roughly 6% inset from edges) */}
            <div
              className="absolute bg-[var(--mushaf-page-bg)] overflow-y-auto"
              style={{
                top: '3.5%',
                left: '6%',
                right: '6%',
                bottom: '3.5%',
                padding: 'clamp(8px, 2.5vw, 28px)',
              }}
            >
              {mushafContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Word-for-word variant uses CSS border
  return (
    <div className="flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex-1 flex items-center justify-center p-4 min-h-min">
        <div className="max-w-2xl mx-auto">
          {/* Outer decorative frame */}
          <div className="relative bg-[var(--mushaf-frame-bg)] p-1 sm:p-1.5 rounded-sm shadow-xl">
            {/* Olive/Green ornate border - outer */}
            <div className="relative border-[3px] sm:border-4 border-[var(--mushaf-border)] rounded-sm">
              {/* Corner ornaments - outer */}
              <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-t-[3px] border-l-[3px] sm:border-t-4 sm:border-l-4 border-[var(--mushaf-border)] rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-t-[3px] border-r-[3px] sm:border-t-4 sm:border-r-4 border-[var(--mushaf-border)] rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-b-[3px] border-l-[3px] sm:border-b-4 sm:border-l-4 border-[var(--mushaf-border)] rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-b-[3px] border-r-[3px] sm:border-b-4 sm:border-r-4 border-[var(--mushaf-border)] rounded-br-sm" />

              {/* Inner gold/yellow accent border */}
              <div className="border-2 border-[var(--mushaf-accent)] m-0.5">
                {/* Innermost content border */}
                <div className="border border-[var(--mushaf-border)] bg-[var(--mushaf-page-bg)] p-6 sm:p-8 md:p-12">
                  {wordForWordContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
