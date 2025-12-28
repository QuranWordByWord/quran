import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { apiPageToUiPage, TOTAL_UI_PAGES } from '../api/quran';
import { useBookmarks } from '../contexts/BookmarkContext';
import { BookmarkList } from './BookmarkList';
import { loadSidebarExpanded, saveSidebarExpanded } from '../utils/bookmarkStorage';
import { convertPageBetweenViews } from '../utils/pageToSurah';

// Chapter data with verse counts and starting page numbers
// apiPage: QPC Nastaleeq 15-line Mushaf (610 pages) - used for word-by-word view
// mushafPage: Standard Madani Mushaf (604 pages) - used for mushaf renderer view
const chapterData = [
  { id: 1, name: 'Al-Fathiha', verses: 7, apiPage: 1, mushafPage: 1 },
  { id: 2, name: 'Al-Baqara', verses: 286, apiPage: 2, mushafPage: 2 },
  { id: 3, name: "Al-i'Imran", verses: 200, apiPage: 50, mushafPage: 50 },
  { id: 4, name: 'An-Nisaa', verses: 176, apiPage: 77, mushafPage: 77 },
  { id: 5, name: 'Al-Maida', verses: 120, apiPage: 106, mushafPage: 106 },
  { id: 6, name: "Al-An'am", verses: 165, apiPage: 128, mushafPage: 128 },
  { id: 7, name: "Al-A'raf", verses: 206, apiPage: 151, mushafPage: 151 },
  { id: 8, name: 'Al-Anfal', verses: 75, apiPage: 177, mushafPage: 177 },
  { id: 9, name: 'At-Tauba', verses: 129, apiPage: 187, mushafPage: 187 },
  { id: 10, name: 'Yunus', verses: 109, apiPage: 208, mushafPage: 208 },
  { id: 11, name: 'Hud', verses: 123, apiPage: 221, mushafPage: 221 },
  { id: 12, name: 'Yusuf', verses: 111, apiPage: 235, mushafPage: 235 },
  { id: 13, name: "Ar-Ra'd", verses: 43, apiPage: 249, mushafPage: 249 },
  { id: 14, name: 'Ibrahim', verses: 52, apiPage: 255, mushafPage: 255 },
  { id: 15, name: 'Al-Hijr', verses: 99, apiPage: 261, mushafPage: 262 },
  { id: 16, name: 'An-Nahl', verses: 128, apiPage: 267, mushafPage: 267 },
  { id: 17, name: 'Al-Israa', verses: 111, apiPage: 282, mushafPage: 282 },
  { id: 18, name: 'Al-Kahf', verses: 110, apiPage: 293, mushafPage: 293 },
  { id: 19, name: 'Maryam', verses: 98, apiPage: 305, mushafPage: 305 },
  { id: 20, name: 'Ta-ha', verses: 135, apiPage: 312, mushafPage: 312 },
  { id: 21, name: 'Al-Anbiyaa', verses: 112, apiPage: 322, mushafPage: 322 },
  { id: 22, name: 'Al-Hajj', verses: 78, apiPage: 331, mushafPage: 332 },
  { id: 23, name: "Al-Mu'minun", verses: 118, apiPage: 342, mushafPage: 342 },
  { id: 24, name: 'An-Nur', verses: 64, apiPage: 350, mushafPage: 350 },
  { id: 25, name: 'Al-Furqan', verses: 77, apiPage: 359, mushafPage: 359 },
  { id: 26, name: "Ash-Shu'ara", verses: 227, apiPage: 366, mushafPage: 367 },
  { id: 27, name: 'An-Naml', verses: 93, apiPage: 376, mushafPage: 377 },
  { id: 28, name: 'Al-Qasas', verses: 88, apiPage: 385, mushafPage: 385 },
  { id: 29, name: 'Al-Ankabut', verses: 69, apiPage: 396, mushafPage: 396 },
  { id: 30, name: 'Ar-Rum', verses: 60, apiPage: 404, mushafPage: 404 },
  { id: 31, name: 'Luqman', verses: 34, apiPage: 411, mushafPage: 411 },
  { id: 32, name: 'As-Sajda', verses: 30, apiPage: 415, mushafPage: 415 },
  { id: 33, name: 'Al-Ahzab', verses: 73, apiPage: 418, mushafPage: 418 },
  { id: 34, name: 'Saba', verses: 54, apiPage: 428, mushafPage: 428 },
  { id: 35, name: 'Fatir', verses: 45, apiPage: 434, mushafPage: 434 },
  { id: 36, name: 'Ya-Sin', verses: 83, apiPage: 440, mushafPage: 440 },
  { id: 37, name: 'As-Saffat', verses: 182, apiPage: 445, mushafPage: 446 },
  { id: 38, name: 'Sad', verses: 88, apiPage: 452, mushafPage: 453 },
  { id: 39, name: 'Az-Zumar', verses: 75, apiPage: 458, mushafPage: 458 },
  { id: 40, name: 'Ghafir', verses: 85, apiPage: 467, mushafPage: 467 },
  { id: 41, name: 'Fussilat', verses: 54, apiPage: 477, mushafPage: 477 },
  { id: 42, name: 'Ash-Shura', verses: 53, apiPage: 483, mushafPage: 483 },
  { id: 43, name: 'Az-Zukhruf', verses: 89, apiPage: 489, mushafPage: 489 },
  { id: 44, name: 'Ad-Dukhan', verses: 59, apiPage: 495, mushafPage: 496 },
  { id: 45, name: 'Al-Jathiya', verses: 37, apiPage: 498, mushafPage: 499 },
  { id: 46, name: 'Al-Ahqaf', verses: 35, apiPage: 502, mushafPage: 502 },
  { id: 47, name: 'Muhammad', verses: 38, apiPage: 506, mushafPage: 507 },
  { id: 48, name: 'Al-Fath', verses: 29, apiPage: 511, mushafPage: 511 },
  { id: 49, name: 'Al-Hujurat', verses: 18, apiPage: 515, mushafPage: 515 },
  { id: 50, name: 'Qaf', verses: 45, apiPage: 518, mushafPage: 518 },
  { id: 51, name: 'Adh-Dhariyat', verses: 60, apiPage: 520, mushafPage: 520 },
  { id: 52, name: 'At-Tur', verses: 49, apiPage: 523, mushafPage: 523 },
  { id: 53, name: 'An-Najm', verses: 62, apiPage: 526, mushafPage: 526 },
  { id: 54, name: 'Al-Qamar', verses: 55, apiPage: 528, mushafPage: 528 },
  { id: 55, name: 'Ar-Rahman', verses: 78, apiPage: 531, mushafPage: 531 },
  { id: 56, name: "Al-Waqi'a", verses: 96, apiPage: 534, mushafPage: 534 },
  { id: 57, name: 'Al-Hadid', verses: 29, apiPage: 537, mushafPage: 537 },
  { id: 58, name: 'Al-Mujadila', verses: 22, apiPage: 542, mushafPage: 542 },
  { id: 59, name: 'Al-Hashr', verses: 24, apiPage: 545, mushafPage: 545 },
  { id: 60, name: 'Al-Mumtahana', verses: 13, apiPage: 549, mushafPage: 549 },
  { id: 61, name: 'As-Saff', verses: 14, apiPage: 551, mushafPage: 551 },
  { id: 62, name: "Al-Jumu'a", verses: 11, apiPage: 553, mushafPage: 553 },
  { id: 63, name: 'Al-Munafiqun', verses: 11, apiPage: 554, mushafPage: 554 },
  { id: 64, name: 'At-Taghabun', verses: 18, apiPage: 556, mushafPage: 556 },
  { id: 65, name: 'At-Talaq', verses: 12, apiPage: 558, mushafPage: 558 },
  { id: 66, name: 'At-Tahrim', verses: 12, apiPage: 560, mushafPage: 560 },
  { id: 67, name: 'Al-Mulk', verses: 30, apiPage: 562, mushafPage: 562 },
  { id: 68, name: 'Al-Qalam', verses: 52, apiPage: 564, mushafPage: 564 },
  { id: 69, name: 'Al-Haqqa', verses: 52, apiPage: 567, mushafPage: 566 },
  { id: 70, name: "Al-Ma'arij", verses: 44, apiPage: 569, mushafPage: 568 },
  { id: 71, name: 'Nuh', verses: 28, apiPage: 571, mushafPage: 570 },
  { id: 72, name: 'Al-Jinn', verses: 28, apiPage: 573, mushafPage: 572 },
  { id: 73, name: 'Al-Muzzammil', verses: 20, apiPage: 576, mushafPage: 574 },
  { id: 74, name: 'Al-Muddaththir', verses: 56, apiPage: 578, mushafPage: 575 },
  { id: 75, name: 'Al-Qiyama', verses: 40, apiPage: 580, mushafPage: 577 },
  { id: 76, name: 'Al-Insan', verses: 31, apiPage: 582, mushafPage: 578 },
  { id: 77, name: 'Al-Mursalat', verses: 50, apiPage: 584, mushafPage: 580 },
  { id: 78, name: "An-Naba'", verses: 40, apiPage: 586, mushafPage: 582 },
  { id: 79, name: "An-Nazi'at", verses: 46, apiPage: 587, mushafPage: 583 },
  { id: 80, name: 'Abasa', verses: 42, apiPage: 589, mushafPage: 585 },
  { id: 81, name: 'At-Takwir', verses: 29, apiPage: 590, mushafPage: 586 },
  { id: 82, name: 'Al-Infitar', verses: 19, apiPage: 591, mushafPage: 587 },
  { id: 83, name: 'Al-Mutaffifin', verses: 36, apiPage: 592, mushafPage: 587 },
  { id: 84, name: 'Al-Inshiqaq', verses: 25, apiPage: 594, mushafPage: 589 },
  { id: 85, name: 'Al-Buruj', verses: 22, apiPage: 595, mushafPage: 590 },
  { id: 86, name: 'At-Tariq', verses: 17, apiPage: 596, mushafPage: 591 },
  { id: 87, name: "Al-A'la", verses: 19, apiPage: 597, mushafPage: 591 },
  { id: 88, name: 'Al-Ghashiya', verses: 26, apiPage: 597, mushafPage: 592 },
  { id: 89, name: 'Al-Fajr', verses: 30, apiPage: 598, mushafPage: 593 },
  { id: 90, name: 'Al-Balad', verses: 20, apiPage: 600, mushafPage: 594 },
  { id: 91, name: 'Ash-Shams', verses: 15, apiPage: 600, mushafPage: 595 },
  { id: 92, name: 'Al-Lail', verses: 21, apiPage: 601, mushafPage: 595 },
  { id: 93, name: 'Ad-Duha', verses: 11, apiPage: 602, mushafPage: 596 },
  { id: 94, name: 'Ash-Sharh', verses: 8, apiPage: 602, mushafPage: 596 },
  { id: 95, name: 'At-Tin', verses: 8, apiPage: 603, mushafPage: 597 },
  { id: 96, name: "Al-'Alaq", verses: 19, apiPage: 603, mushafPage: 597 },
  { id: 97, name: 'Al-Qadr', verses: 5, apiPage: 604, mushafPage: 598 },
  { id: 98, name: 'Al-Bayyina', verses: 8, apiPage: 604, mushafPage: 598 },
  { id: 99, name: 'Az-Zalzala', verses: 8, apiPage: 605, mushafPage: 599 },
  { id: 100, name: "Al-'Adiyat", verses: 11, apiPage: 605, mushafPage: 599 },
  { id: 101, name: "Al-Qari'a", verses: 11, apiPage: 606, mushafPage: 600 },
  { id: 102, name: 'At-Takathur', verses: 8, apiPage: 606, mushafPage: 600 },
  { id: 103, name: "Al-'Asr", verses: 3, apiPage: 607, mushafPage: 601 },
  { id: 104, name: 'Al-Humaza', verses: 9, apiPage: 607, mushafPage: 601 },
  { id: 105, name: 'Al-Fil', verses: 5, apiPage: 607, mushafPage: 601 },
  { id: 106, name: 'Quraish', verses: 4, apiPage: 608, mushafPage: 602 },
  { id: 107, name: "Al-Ma'un", verses: 7, apiPage: 608, mushafPage: 602 },
  { id: 108, name: 'Al-Kauthar', verses: 3, apiPage: 608, mushafPage: 602 },
  { id: 109, name: 'Al-Kafirun', verses: 6, apiPage: 608, mushafPage: 603 },
  { id: 110, name: 'An-Nasr', verses: 3, apiPage: 609, mushafPage: 603 },
  { id: 111, name: 'Al-Masad', verses: 5, apiPage: 609, mushafPage: 603 },
  { id: 112, name: 'Al-Ikhlas', verses: 4, apiPage: 609, mushafPage: 604 },
  { id: 113, name: 'Al-Falaq', verses: 5, apiPage: 610, mushafPage: 604 },
  { id: 114, name: 'An-Nas', verses: 6, apiPage: 610, mushafPage: 604 },
];

// Export chapters with UI page numbers for external use (word-by-word view uses apiPage)
export const chapters = chapterData.map(ch => ({
  ...ch,
  page: apiPageToUiPage(ch.apiPage), // Convert to UI page number for word-by-word
  mushafUiPage: ch.mushafPage + 1, // Convert to UI page number for mushaf view (add 1 for intro page)
}));

interface ChapterQuickLinksProps {
  side: 'left' | 'right';
}

// Desktop sidebar component - hidden on mobile
export function ChapterQuickLinks({ side }: ChapterQuickLinksProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookmarks } = useBookmarks();
  const [isBookmarksExpanded, setIsBookmarksExpanded] = useState(() => loadSidebarExpanded());

  // Persist sidebar expanded state
  useEffect(() => {
    saveSidebarExpanded(isBookmarksExpanded);
  }, [isBookmarksExpanded]);

  // Determine if we're in mushaf mode based on current route
  const isMushafMode = location.pathname.startsWith('/mushaf');

  // Split chapters: 1-57 on left, 58-114 on right
  const displayChapters = side === 'left'
    ? chapters.slice(0, 57)
    : chapters.slice(57);

  const handleChapterClick = (chapter: typeof chapters[0]) => {
    // Navigate to the same mode the user is currently in
    // Use mushafUiPage for mushaf view (604-page mushaf) and page for word-by-word (610-page mushaf)
    if (isMushafMode) {
      navigate(`/mushaf/${chapter.mushafUiPage}`);
    } else {
      navigate(`/page/${chapter.page}`);
    }
  };

  return (
    <nav
      className="hidden lg:block w-44 xl:w-48 bg-[var(--color-bg-card)] border-x border-[var(--color-border)] h-[calc(100vh-64px)] overflow-y-auto text-sm shrink-0"
      aria-label={`Chapters ${side === 'left' ? '1 to 57' : '58 to 114'}`}
      role="navigation"
    >
      {/* Bookmarks section - only show on left sidebar */}
      {side === 'left' && bookmarks.length > 0 && (
        <div className="border-b border-[var(--color-border)]">
          <button
            onClick={() => setIsBookmarksExpanded(!isBookmarksExpanded)}
            className="w-full flex items-center justify-between px-2 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-colors"
            aria-expanded={isBookmarksExpanded}
          >
            <span className="flex items-center gap-1.5 font-semibold text-[var(--color-primary)] text-xs xl:text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Bookmarks ({bookmarks.length})
            </span>
            <svg
              className={`w-4 h-4 text-[var(--color-primary)] transition-transform ${isBookmarksExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isBookmarksExpanded && (
            <div className="max-h-48 overflow-y-auto">
              <BookmarkList compact onNavigate={() => {}} />
            </div>
          )}
        </div>
      )}

      <div className="sticky top-0 bg-[var(--mushaf-header-bg)] px-2 py-2 border-b border-[var(--color-border)]">
        <h2 className="font-semibold text-[var(--color-text-primary)] text-center text-xs xl:text-sm" id={`chapter-heading-${side}`}>
          Chapter (Verses)
        </h2>
      </div>
      <ul className="py-1" role="list" aria-labelledby={`chapter-heading-${side}`}>
        {displayChapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              onClick={() => handleChapterClick(chapter)}
              className="w-full text-left px-2 py-1 hover:bg-[var(--mushaf-header-bg)] hover:text-[var(--mushaf-text-header)] text-[var(--color-text-secondary)] transition-colors border-b border-[var(--color-border)] text-xs xl:text-sm"
              aria-label={`Chapter ${chapter.id}: ${chapter.name}, ${chapter.verses} verses`}
            >
              {chapter.id}. {chapter.name} ({chapter.verses})
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Mobile chapter selector - dropdown/modal style
type MenuTab = 'chapters' | 'bookmarks' | 'settings';
type VerseNumberFormat = 'arabic' | 'english';

// Settings tab component with theme toggle
function SettingsTab({
  verseNumberFormat,
  onVerseNumberFormatChange,
  onClose,
}: {
  verseNumberFormat?: VerseNumberFormat;
  onVerseNumberFormatChange?: (format: VerseNumberFormat) => void;
  onClose?: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { viewMode, setViewMode, layoutMode, setLayoutMode } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current page number and view mode from URL
  const getCurrentPageAndMode = (): { page: number; currentMode: 'mushaf' | 'wordforword' } => {
    const mushafMatch = location.pathname.match(/^\/mushaf\/(\d+)/);
    const pageMatch = location.pathname.match(/^\/page\/(\d+)/);
    if (mushafMatch) return { page: parseInt(mushafMatch[1]), currentMode: 'mushaf' };
    if (pageMatch) return { page: parseInt(pageMatch[1]), currentMode: 'wordforword' };
    return { page: 2, currentMode: viewMode }; // Default to first Quran page
  };

  const handleViewModeChange = (mode: 'mushaf' | 'wordforword') => {
    setViewMode(mode);
    const { page: currentPage, currentMode } = getCurrentPageAndMode();
    // Convert page number between the two different page numbering systems
    const targetPage = convertPageBetweenViews(currentPage, currentMode, mode);
    if (mode === 'mushaf') {
      navigate(`/mushaf/${targetPage}`);
    } else {
      navigate(`/page/${targetPage}`);
    }
    onClose?.();
  };

  return (
    <div className="p-4 space-y-4" role="group" aria-label="Settings">
      {/* View mode toggle */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">View Mode</legend>
        <div className="flex bg-gray-100 rounded-lg p-1" role="radiogroup" aria-label="View mode selection">
          <button
            onClick={() => handleViewModeChange('mushaf')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
              viewMode === 'mushaf'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            role="radio"
            aria-checked={viewMode === 'mushaf'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Mushaf
          </button>
          <button
            onClick={() => handleViewModeChange('wordforword')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
              viewMode === 'wordforword'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            role="radio"
            aria-checked={viewMode === 'wordforword'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Word by Word
          </button>
        </div>
      </fieldset>

      {/* Theme toggle */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">Theme</legend>
        <div className="flex bg-gray-100 rounded-lg p-1" role="radiogroup" aria-label="Theme selection">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${
              theme === 'light'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            role="radio"
            aria-checked={theme === 'light'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
            role="radio"
            aria-checked={theme === 'dark'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Dark
          </button>
        </div>
      </fieldset>

      {/* Verse number format */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">Verse Numbers</legend>
        <div className="flex bg-gray-100 rounded-lg p-1" role="radiogroup" aria-label="Verse number format">
          <button
            onClick={() => onVerseNumberFormatChange?.('arabic')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              verseNumberFormat === 'arabic'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            role="radio"
            aria-checked={verseNumberFormat === 'arabic'}
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
            role="radio"
            aria-checked={verseNumberFormat === 'english'}
          >
            English (123)
          </button>
        </div>
      </fieldset>

      {/* Layout mode */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">Layout</legend>
        <div className="flex bg-gray-100 rounded-lg p-1" role="radiogroup" aria-label="Layout mode">
          <button
            onClick={() => setLayoutMode('auto')}
            className={`flex-1 px-2 py-2 text-sm rounded-md transition-colors ${
              layoutMode === 'auto'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            role="radio"
            aria-checked={layoutMode === 'auto'}
          >
            Auto
          </button>
          <button
            onClick={() => setLayoutMode('desktop')}
            className={`flex-1 px-2 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-1 ${
              layoutMode === 'desktop'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            role="radio"
            aria-checked={layoutMode === 'desktop'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Desktop
          </button>
          <button
            onClick={() => setLayoutMode('mobile')}
            className={`flex-1 px-2 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-1 ${
              layoutMode === 'mobile'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            role="radio"
            aria-checked={layoutMode === 'mobile'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mobile
          </button>
        </div>
      </fieldset>

      {/* App info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-center">
          <span className="text-2xl" aria-hidden="true">📖</span>
          <p className="font-semibold text-gray-800 mt-1">Quran Word by Word</p>
          <p className="text-xs text-gray-500 mt-1">15-Line Mushaf</p>
        </div>
      </div>
    </div>
  );
}

// Bookmarks tab button with count badge
function BookmarksTabButton({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  const { bookmarks } = useBookmarks();
  const count = bookmarks.length;

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
        isActive ? 'bg-white/20' : 'hover:bg-white/10'
      }`}
      role="tab"
      aria-selected={isActive}
      aria-controls="bookmarks-panel"
      id="bookmarks-tab"
    >
      Bookmarks
      {count > 0 && (
        <span className="min-w-5 h-5 px-1 bg-white text-[var(--color-primary)] text-xs rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </button>
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
  pageNumber: _pageNumber,
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
  const location = useLocation();

  // Determine if we're in mushaf mode based on current route
  const isMushafMode = location.pathname.startsWith('/mushaf');

  // Get current page from URL and convert to display page
  const getCurrentDisplayPage = (): number => {
    const mushafMatch = location.pathname.match(/^\/mushaf\/(\d+)/);
    const pageMatch = location.pathname.match(/^\/page\/(\d+)/);
    if (mushafMatch) {
      // Mushaf: app page is in URL, convert to renderer page (subtract 1 for intro offset)
      const appPage = parseInt(mushafMatch[1]);
      return Math.max(1, appPage - 1);
    }
    if (pageMatch) {
      return parseInt(pageMatch[1]);
    }
    return 1;
  };

  const currentDisplayPage = getCurrentDisplayPage();

  const handleChapterClick = (chapter: typeof chapters[0]) => {
    // Navigate to the same mode the user is currently in
    // Use mushafUiPage for mushaf view (604-page mushaf) and page for word-by-word (610-page mushaf)
    if (isMushafMode) {
      navigate(`/mushaf/${chapter.mushafUiPage}`);
    } else {
      navigate(`/page/${chapter.page}`);
    }
    setIsOpen(false);
  };

  // Total pages differs between mushaf view (604 pages) and word-by-word view (610 pages)
  // For mushaf, users see pages 1-604 (renderer pages), but URLs use 2-605 (app pages with intro offset)
  const MUSHAF_RENDERER_TOTAL_PAGES = 604;
  const effectiveTotalPages = isMushafMode ? MUSHAF_RENDERER_TOTAL_PAGES : totalPages;

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (page >= 1 && page <= effectiveTotalPages) {
      // Navigate to the same mode the user is currently in
      if (isMushafMode) {
        // User enters renderer page (1-604), but URL needs app page (2-605)
        // Add 1 to convert renderer page to app page (intro page offset)
        navigate(`/mushaf/${page + 1}`);
      } else {
        navigate(`/page/${page}`);
      }
      setGoToPage('');
      setIsOpen(false);
    }
  };

  return (
    <div className="lg:hidden">
      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal content */}
          <div className="relative bg-white w-full max-h-[85vh] rounded-t-2xl overflow-hidden shadow-xl">
            {/* Header with tabs */}
            <div className="sticky top-0 bg-[var(--color-primary)] text-white">
              <div className="px-4 py-3 flex items-center justify-between">
                <h2 id="mobile-menu-title" className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Tabs */}
              <div className="flex border-t border-white/20" role="tablist" aria-label="Menu sections">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'chapters' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'chapters'}
                  aria-controls="chapters-panel"
                  id="chapters-tab"
                >
                  Chapters
                </button>
                <BookmarksTabButton
                  isActive={activeTab === 'bookmarks'}
                  onClick={() => setActiveTab('bookmarks')}
                />
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'settings'}
                  aria-controls="settings-panel"
                  id="settings-tab"
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Content - account for header tabs (~100px) and potential audio player (~80px) */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] pb-4">
              {activeTab === 'chapters' && (
                <div
                  id="chapters-panel"
                  role="tabpanel"
                  aria-labelledby="chapters-tab"
                >
                  {/* Go to page */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <label htmlFor="go-to-page" className="text-sm text-gray-600">Go to page:</label>
                      <input
                        id="go-to-page"
                        type="number"
                        min={1}
                        max={effectiveTotalPages}
                        value={goToPage}
                        onChange={(e) => setGoToPage(e.target.value)}
                        placeholder={`1-${effectiveTotalPages}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
                        aria-describedby="current-page-info"
                      />
                      <button
                        onClick={handleGoToPage}
                        className="px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-light)]"
                      >
                        Go
                      </button>
                      <span id="current-page-info" className="text-xs text-gray-400 ml-auto">
                        Current: {currentDisplayPage}
                      </span>
                    </div>
                  </div>
                  {/* Chapter list */}
                  <ul className="grid grid-cols-2 gap-1 p-2" role="list" aria-label="All chapters">
                    {chapters.map((chapter) => (
                      <li key={chapter.id}>
                        <button
                          onClick={() => handleChapterClick(chapter)}
                          className="w-full text-left p-2 hover:bg-[var(--mushaf-header-bg)] hover:text-[var(--mushaf-text-header)] text-gray-700 rounded-lg transition-colors border border-gray-100"
                          aria-label={`Chapter ${chapter.id}: ${chapter.name}, ${chapter.verses} verses`}
                        >
                          <span className="font-medium">{chapter.id}.</span>{' '}
                          <span className="text-sm">{chapter.name}</span>
                          <span className="text-xs text-gray-400 block">({chapter.verses} verses)</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div
                  id="bookmarks-panel"
                  role="tabpanel"
                  aria-labelledby="bookmarks-tab"
                >
                  <BookmarkList onNavigate={() => setIsOpen(false)} />
                </div>
              )}

              {activeTab === 'settings' && (
                <div
                  id="settings-panel"
                  role="tabpanel"
                  aria-labelledby="settings-tab"
                >
                  <SettingsTab
                    verseNumberFormat={verseNumberFormat}
                    onVerseNumberFormatChange={onVerseNumberFormatChange}
                    onClose={() => setIsOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
