import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery?: string;
  children?: ReactNode;
}

export function Header({ onSearch, searchQuery = '', children }: HeaderProps) {
  const [query, setQuery] = useState(searchQuery);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      navigate('/search');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <header className="bg-[var(--color-primary)] text-white shadow-lg sticky top-0 z-50">
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
          >
            <span className="text-lg sm:text-2xl">📖</span>
            <div>
              <h1 className="text-base sm:text-xl font-semibold tracking-wide">Quran</h1>
              <p className="text-[10px] sm:text-xs text-white/70 hidden sm:block">Word by Word</p>
            </div>
          </a>

          {/* Search */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-md min-w-0">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search the Quran..."
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 pl-8 sm:pl-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all text-sm sm:text-base"
              />
              <svg
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* View Mode Toggle & Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {children}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
