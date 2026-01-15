import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  children?: ReactNode;
  isVisible?: boolean;
}

export function Header({ children, isVisible = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={`bg-[var(--color-primary)] text-white shadow-lg fixed top-0 left-0 right-0 z-50 transition-transform duration-300 lg:sticky ${
        isVisible ? 'translate-y-0' : '-translate-y-full lg:translate-y-0'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-1 sm:gap-2 hover:opacity-90 transition-opacity shrink-0"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            aria-label="Quran Word by Word - Go to home page"
          >
            <span className="text-lg sm:text-2xl" aria-hidden="true">📖</span>
            <div>
              <span className="text-base sm:text-xl font-semibold tracking-wide block">Quran</span>
              <span className="text-[10px] sm:text-xs text-white/70 hidden sm:block">Word by Word</span>
            </div>
          </a>

          {/* Controls & Navigation */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
            {children}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="text-white/80 hover:text-white transition-colors ml-2"
            >
              Home
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
