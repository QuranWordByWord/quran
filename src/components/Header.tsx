import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineBookmarkButton } from './BookmarkButton';
import { useSettings } from '../contexts/SettingsContext';

interface HeaderProps {
  children?: ReactNode;
  isVisible?: boolean;
  onOpenMenu?: () => void;
  pageNumber?: number;
  viewMode?: 'mushaf' | 'wordforword';
}

export function Header({ children, isVisible = true, onOpenMenu, pageNumber, viewMode }: HeaderProps) {
  const navigate = useNavigate();
  const { mushafFontScale, setMushafFontScale, setViewMode } = useSettings();

  const handleFontDecrease = () => {
    const newScale = Math.max(0.5, mushafFontScale - 0.05);
    setMushafFontScale(newScale);
  };

  const handleFontIncrease = () => {
    const newScale = Math.min(1.2, mushafFontScale + 0.05);
    setMushafFontScale(newScale);
  };

  return (
    <header
      className={`bg-[var(--color-primary)] text-white shadow-lg fixed top-0 left-0 right-0 z-50 transition-transform duration-300 lg:sticky ${isVisible ? 'translate-y-0' : '-translate-y-full lg:translate-y-0'
        }`}
      role="banner"
    >
      <div className="mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo - left side: toggles between Mushaf and Word-by-Word views */}
          <a
            href="/"
            className="flex items-center gap-1 sm:gap-2 hover:opacity-90 transition-opacity shrink-0"
            onClick={(e) => {
              e.preventDefault();
              // Always navigate to page 1, but toggle between views
              if (viewMode) {
                const newMode = viewMode === 'mushaf' ? 'wordforword' : 'mushaf';
                setViewMode(newMode);
                const targetPath = newMode === 'mushaf' ? '/mushaf/1' : '/page/1';
                navigate(targetPath);
              } else {
                navigate('/');
              }
            }}
            aria-label={viewMode ? `Switch to ${viewMode === 'mushaf' ? 'Word by Word' : 'Mushaf'} view` : 'Quran Word by Word - Go to home page'}
          >
            <div className="w-12 sm:w-14 lg:w-20 overflow-hidden" style={{ aspectRatio: '1.8' }}>
              <img src="/quran/quran-logo.png" alt="" className="w-full" />
            </div>
            <div>
              <span className="text-base sm:text-xl font-semibold tracking-wide block leading-tight">Quran</span>
              <span className="text-[10px] sm:text-xs text-white/70 -mt-1 sm:mt-0 block sm:inline">Word by Word</span>
            </div>
          </a>

          {/* Controls - centered */}
          <nav className="hidden md:flex items-center justify-center flex-1" aria-label="Main navigation">
            {children}
          </nav>

          {/* Mobile actions (font scale + bookmark + menu) */}
          <div className="md:hidden flex items-center gap-1">
            {/* Font scale controls - only show in mushaf view */}
            {viewMode === 'mushaf' && (
              <div className="flex items-center bg-white/10 rounded-lg px-1 h-8" title="Font size">
                <button
                  onClick={handleFontDecrease}
                  className="px-1.5 py-1 text-white/80 hover:text-white transition-colors text-sm font-medium"
                  aria-label="Decrease font size"
                >
                  A-
                </button>
                <span className="text-xs text-white min-w-[2.5rem] text-center font-medium">
                  {Math.round(mushafFontScale * 100)}%
                </span>
                <button
                  onClick={handleFontIncrease}
                  className="px-1.5 py-1 text-white/80 hover:text-white transition-colors text-sm font-medium"
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div>
            )}
            {pageNumber !== undefined && viewMode && (
              <InlineBookmarkButton pageNumber={pageNumber} viewMode={viewMode} variant="header" />
            )}
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-7 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 30">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 15h16M4 22h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
