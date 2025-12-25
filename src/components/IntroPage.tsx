import { useFontClass } from '../App';

interface IntroPageProps {
  onStartReading: () => void;
}

export function IntroPage({ onStartReading }: IntroPageProps) {
  const fontClass = useFontClass();

  return (
    <div className="flex-1 flex flex-col bg-[var(--mushaf-bg)] h-screen lg:h-[calc(100vh-64px)]">
      <div className="flex-1 flex items-center justify-center p-4">
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
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className={`arabic-text ${fontClass} text-3xl sm:text-4xl md:text-5xl text-[var(--mushaf-text-header)] mb-4`}>
                      القرآن الكريم
                    </h1>
                    <p className="text-lg sm:text-xl text-[var(--mushaf-text-secondary)]">
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
                  <div className="text-center space-y-4 mb-8">
                    <p className="text-[var(--mushaf-text)] leading-relaxed">
                      Word-by-word Quran with translations and audio recitation.
                      Click on any line to reveal word meanings. <br/>
                      Double-click words to hear pronunciation, or click on the verse number to hear the verse. 
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--mushaf-text-secondary)]">
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--mushaf-accent)]">610</span>
                        <span>Pages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--mushaf-accent)]">114</span>
                        <span>Surahs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--mushaf-accent)]">30</span>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
