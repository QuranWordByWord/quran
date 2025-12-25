import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { apiPageToUiPage, TOTAL_UI_PAGES } from '../api/quran';

// Chapter data with verse counts and starting page numbers (API pages from QPC Nastaleeq 15-line Mushaf)
// Note: These are API page numbers. Use apiPageToUiPage() to convert to UI page numbers.
const chapterApiPages = [
  { id: 1, name: 'Al-Fathiha', verses: 7, apiPage: 1 },
  { id: 2, name: 'Al-Baqara', verses: 286, apiPage: 2 },
  { id: 3, name: "Al-i'Imran", verses: 200, apiPage: 50 },
  { id: 4, name: 'An-Nisaa', verses: 176, apiPage: 77 },
  { id: 5, name: 'Al-Maida', verses: 120, apiPage: 106 },
  { id: 6, name: "Al-An'am", verses: 165, apiPage: 128 },
  { id: 7, name: "Al-A'raf", verses: 206, apiPage: 151 },
  { id: 8, name: 'Al-Anfal', verses: 75, apiPage: 177 },
  { id: 9, name: 'At-Tauba', verses: 129, apiPage: 187 },
  { id: 10, name: 'Yunus', verses: 109, apiPage: 208 },
  { id: 11, name: 'Hud', verses: 123, apiPage: 221 },
  { id: 12, name: 'Yusuf', verses: 111, apiPage: 235 },
  { id: 13, name: "Ar-Ra'd", verses: 43, apiPage: 249 },
  { id: 14, name: 'Ibrahim', verses: 52, apiPage: 255 },
  { id: 15, name: 'Al-Hijr', verses: 99, apiPage: 261 },
  { id: 16, name: 'An-Nahl', verses: 128, apiPage: 267 },
  { id: 17, name: 'Al-Israa', verses: 111, apiPage: 282 },
  { id: 18, name: 'Al-Kahf', verses: 110, apiPage: 293 },
  { id: 19, name: 'Maryam', verses: 98, apiPage: 305 },
  { id: 20, name: 'Ta-ha', verses: 135, apiPage: 312 },
  { id: 21, name: 'Al-Anbiyaa', verses: 112, apiPage: 322 },
  { id: 22, name: 'Al-Hajj', verses: 78, apiPage: 331 },
  { id: 23, name: "Al-Mu'minun", verses: 118, apiPage: 342 },
  { id: 24, name: 'An-Nur', verses: 64, apiPage: 350 },
  { id: 25, name: 'Al-Furqan', verses: 77, apiPage: 359 },
  { id: 26, name: "Ash-Shu'ara", verses: 227, apiPage: 366 },
  { id: 27, name: 'An-Naml', verses: 93, apiPage: 376 },
  { id: 28, name: 'Al-Qasas', verses: 88, apiPage: 385 },
  { id: 29, name: 'Al-Ankabut', verses: 69, apiPage: 396 },
  { id: 30, name: 'Ar-Rum', verses: 60, apiPage: 404 },
  { id: 31, name: 'Luqman', verses: 34, apiPage: 411 },
  { id: 32, name: 'As-Sajda', verses: 30, apiPage: 415 },
  { id: 33, name: 'Al-Ahzab', verses: 73, apiPage: 418 },
  { id: 34, name: 'Saba', verses: 54, apiPage: 428 },
  { id: 35, name: 'Fatir', verses: 45, apiPage: 434 },
  { id: 36, name: 'Ya-Sin', verses: 83, apiPage: 440 },
  { id: 37, name: 'As-Saffat', verses: 182, apiPage: 445 },
  { id: 38, name: 'Sad', verses: 88, apiPage: 452 },
  { id: 39, name: 'Az-Zumar', verses: 75, apiPage: 458 },
  { id: 40, name: 'Ghafir', verses: 85, apiPage: 467 },
  { id: 41, name: 'Fussilat', verses: 54, apiPage: 477 },
  { id: 42, name: 'Ash-Shura', verses: 53, apiPage: 483 },
  { id: 43, name: 'Az-Zukhruf', verses: 89, apiPage: 489 },
  { id: 44, name: 'Ad-Dukhan', verses: 59, apiPage: 495 },
  { id: 45, name: 'Al-Jathiya', verses: 37, apiPage: 498 },
  { id: 46, name: 'Al-Ahqaf', verses: 35, apiPage: 502 },
  { id: 47, name: 'Muhammad', verses: 38, apiPage: 506 },
  { id: 48, name: 'Al-Fath', verses: 29, apiPage: 511 },
  { id: 49, name: 'Al-Hujurat', verses: 18, apiPage: 515 },
  { id: 50, name: 'Qaf', verses: 45, apiPage: 518 },
  { id: 51, name: 'Adh-Dhariyat', verses: 60, apiPage: 520 },
  { id: 52, name: 'At-Tur', verses: 49, apiPage: 523 },
  { id: 53, name: 'An-Najm', verses: 62, apiPage: 526 },
  { id: 54, name: 'Al-Qamar', verses: 55, apiPage: 528 },
  { id: 55, name: 'Ar-Rahman', verses: 78, apiPage: 531 },
  { id: 56, name: "Al-Waqi'a", verses: 96, apiPage: 534 },
  { id: 57, name: 'Al-Hadid', verses: 29, apiPage: 537 },
  { id: 58, name: 'Al-Mujadila', verses: 22, apiPage: 542 },
  { id: 59, name: 'Al-Hashr', verses: 24, apiPage: 545 },
  { id: 60, name: 'Al-Mumtahana', verses: 13, apiPage: 549 },
  { id: 61, name: 'As-Saff', verses: 14, apiPage: 551 },
  { id: 62, name: "Al-Jumu'a", verses: 11, apiPage: 553 },
  { id: 63, name: 'Al-Munafiqun', verses: 11, apiPage: 554 },
  { id: 64, name: 'At-Taghabun', verses: 18, apiPage: 556 },
  { id: 65, name: 'At-Talaq', verses: 12, apiPage: 558 },
  { id: 66, name: 'At-Tahrim', verses: 12, apiPage: 560 },
  { id: 67, name: 'Al-Mulk', verses: 30, apiPage: 562 },
  { id: 68, name: 'Al-Qalam', verses: 52, apiPage: 564 },
  { id: 69, name: 'Al-Haqqa', verses: 52, apiPage: 567 },
  { id: 70, name: "Al-Ma'arij", verses: 44, apiPage: 569 },
  { id: 71, name: 'Nuh', verses: 28, apiPage: 571 },
  { id: 72, name: 'Al-Jinn', verses: 28, apiPage: 573 },
  { id: 73, name: 'Al-Muzzammil', verses: 20, apiPage: 576 },
  { id: 74, name: 'Al-Muddaththir', verses: 56, apiPage: 578 },
  { id: 75, name: 'Al-Qiyama', verses: 40, apiPage: 580 },
  { id: 76, name: 'Al-Insan', verses: 31, apiPage: 582 },
  { id: 77, name: 'Al-Mursalat', verses: 50, apiPage: 584 },
  { id: 78, name: "An-Naba'", verses: 40, apiPage: 586 },
  { id: 79, name: "An-Nazi'at", verses: 46, apiPage: 587 },
  { id: 80, name: 'Abasa', verses: 42, apiPage: 589 },
  { id: 81, name: 'At-Takwir', verses: 29, apiPage: 590 },
  { id: 82, name: 'Al-Infitar', verses: 19, apiPage: 591 },
  { id: 83, name: 'Al-Mutaffifin', verses: 36, apiPage: 592 },
  { id: 84, name: 'Al-Inshiqaq', verses: 25, apiPage: 594 },
  { id: 85, name: 'Al-Buruj', verses: 22, apiPage: 595 },
  { id: 86, name: 'At-Tariq', verses: 17, apiPage: 596 },
  { id: 87, name: "Al-A'la", verses: 19, apiPage: 597 },
  { id: 88, name: 'Al-Ghashiya', verses: 26, apiPage: 597 },
  { id: 89, name: 'Al-Fajr', verses: 30, apiPage: 598 },
  { id: 90, name: 'Al-Balad', verses: 20, apiPage: 600 },
  { id: 91, name: 'Ash-Shams', verses: 15, apiPage: 600 },
  { id: 92, name: 'Al-Lail', verses: 21, apiPage: 601 },
  { id: 93, name: 'Ad-Duha', verses: 11, apiPage: 602 },
  { id: 94, name: 'Ash-Sharh', verses: 8, apiPage: 602 },
  { id: 95, name: 'At-Tin', verses: 8, apiPage: 603 },
  { id: 96, name: "Al-'Alaq", verses: 19, apiPage: 603 },
  { id: 97, name: 'Al-Qadr', verses: 5, apiPage: 604 },
  { id: 98, name: 'Al-Bayyina', verses: 8, apiPage: 604 },
  { id: 99, name: 'Az-Zalzala', verses: 8, apiPage: 605 },
  { id: 100, name: "Al-'Adiyat", verses: 11, apiPage: 605 },
  { id: 101, name: "Al-Qari'a", verses: 11, apiPage: 606 },
  { id: 102, name: 'At-Takathur', verses: 8, apiPage: 606 },
  { id: 103, name: "Al-'Asr", verses: 3, apiPage: 607 },
  { id: 104, name: 'Al-Humaza', verses: 9, apiPage: 607 },
  { id: 105, name: 'Al-Fil', verses: 5, apiPage: 607 },
  { id: 106, name: 'Quraish', verses: 4, apiPage: 608 },
  { id: 107, name: "Al-Ma'un", verses: 7, apiPage: 608 },
  { id: 108, name: 'Al-Kauthar', verses: 3, apiPage: 608 },
  { id: 109, name: 'Al-Kafirun', verses: 6, apiPage: 608 },
  { id: 110, name: 'An-Nasr', verses: 3, apiPage: 609 },
  { id: 111, name: 'Al-Masad', verses: 5, apiPage: 609 },
  { id: 112, name: 'Al-Ikhlas', verses: 4, apiPage: 609 },
  { id: 113, name: 'Al-Falaq', verses: 5, apiPage: 610 },
  { id: 114, name: 'An-Nas', verses: 6, apiPage: 610 },
];

// Export chapters with UI page numbers for external use
export const chapters = chapterApiPages.map(ch => ({
  ...ch,
  page: apiPageToUiPage(ch.apiPage), // Convert to UI page number
}));

interface ChapterQuickLinksProps {
  side: 'left' | 'right';
}

// Desktop sidebar component - hidden on mobile
export function ChapterQuickLinks({ side }: ChapterQuickLinksProps) {
  const navigate = useNavigate();

  // Split chapters: 1-57 on left, 58-114 on right
  const displayChapters = side === 'left'
    ? chapters.slice(0, 57)
    : chapters.slice(57);

  const handleChapterClick = (pageNumber: number) => {
    navigate(`/page/${pageNumber}`);
  };

  return (
    <div className="hidden lg:block w-44 xl:w-48 bg-[var(--color-bg-card)] border-x border-[var(--color-border)] h-[calc(100vh-64px)] overflow-y-auto text-sm shrink-0">
      <div className="sticky top-0 bg-[var(--mushaf-header-bg)] px-2 py-2 border-b border-[var(--color-border)]">
        <h3 className="font-semibold text-[var(--color-text-primary)] text-center text-xs xl:text-sm">Chapter (Verses)</h3>
      </div>
      <div className="py-1">
        {displayChapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => handleChapterClick(chapter.page)}
            className="w-full text-left px-2 py-1 hover:bg-[var(--mushaf-header-bg)] hover:text-[var(--mushaf-text-header)] text-[var(--color-text-secondary)] transition-colors border-b border-[var(--color-border)] text-xs xl:text-sm"
          >
            {chapter.id}. {chapter.name} ({chapter.verses})
          </button>
        ))}
      </div>
    </div>
  );
}

// Mobile chapter selector - dropdown/modal style
type MenuTab = 'chapters' | 'settings';
type VerseNumberFormat = 'arabic' | 'english';

// Settings tab component with theme toggle
function SettingsTab({
  verseNumberFormat,
  onVerseNumberFormatChange,
}: {
  verseNumberFormat?: VerseNumberFormat;
  onVerseNumberFormatChange?: (format: VerseNumberFormat) => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 space-y-4">
      {/* Theme toggle */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Theme</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
              theme === 'light'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Dark
          </button>
        </div>
      </div>

      {/* Verse number format */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Verse Numbers</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onVerseNumberFormatChange?.('arabic')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              verseNumberFormat === 'arabic'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Arabic (١٢٣)
          </button>
          <button
            onClick={() => onVerseNumberFormatChange?.('english')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              verseNumberFormat === 'english'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            English (123)
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-center">
          <span className="text-2xl">📖</span>
          <h3 className="font-semibold text-gray-800 mt-1">Quran Word by Word</h3>
          <p className="text-xs text-gray-500 mt-1">15-Line Mushaf</p>
        </div>
      </div>
    </div>
  );
}

interface MobileChapterSelectorProps {
  pageNumber?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  verseNumberFormat?: VerseNumberFormat;
  onVerseNumberFormatChange?: (format: VerseNumberFormat) => void;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

export function MobileChapterSelector({
  pageNumber = 1,
  totalPages = TOTAL_UI_PAGES,
  onPageChange: _onPageChange,
  verseNumberFormat = 'arabic',
  onVerseNumberFormatChange,
  isMenuOpen,
  onMenuOpenChange,
}: MobileChapterSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = isMenuOpen !== undefined ? isMenuOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onMenuOpenChange) {
      onMenuOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };
  const [activeTab, setActiveTab] = useState<MenuTab>('chapters');
  const [goToPage, setGoToPage] = useState('');
  const navigate = useNavigate();

  const handleChapterClick = (page: number) => {
    navigate(`/page/${page}`);
    setIsOpen(false);
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (page >= 1 && page <= totalPages) {
      navigate(`/page/${page}`);
      setGoToPage('');
      setIsOpen(false);
    }
  };

  return (
    <div className="lg:hidden">
      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white w-full max-h-[85vh] rounded-t-2xl overflow-hidden shadow-xl">
            {/* Header with tabs */}
            <div className="sticky top-0 bg-[var(--color-primary)] text-white">
              <div className="px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Tabs */}
              <div className="flex border-t border-white/20">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'chapters' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Chapters
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-100px)]">
              {activeTab === 'chapters' && (
                <>
                  {/* Go to page */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Go to page:</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={goToPage}
                        onChange={(e) => setGoToPage(e.target.value)}
                        placeholder={`1-${totalPages}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
                      />
                      <button
                        onClick={handleGoToPage}
                        className="px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-light)]"
                      >
                        Go
                      </button>
                      <span className="text-xs text-gray-400 ml-auto">
                        Current: {pageNumber}
                      </span>
                    </div>
                  </div>
                  {/* Chapter list */}
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => handleChapterClick(chapter.page)}
                        className="text-left p-2 hover:bg-[var(--mushaf-header-bg)] hover:text-[var(--mushaf-text-header)] text-gray-700 rounded-lg transition-colors border border-gray-100"
                      >
                        <span className="font-medium">{chapter.id}.</span>{' '}
                        <span className="text-sm">{chapter.name}</span>
                        <span className="text-xs text-gray-400 block">({chapter.verses} verses)</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  verseNumberFormat={verseNumberFormat}
                  onVerseNumberFormatChange={onVerseNumberFormatChange}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
