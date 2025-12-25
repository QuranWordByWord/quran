import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Chapter data with verse counts and starting page numbers (QPC Nastaleeq 15-line Mushaf - 610 pages)
export const chapters = [
  { id: 1, name: 'Al-Fathiha', verses: 7, page: 1 },
  { id: 2, name: 'Al-Baqara', verses: 286, page: 2 },
  { id: 3, name: "Al-i'Imran", verses: 200, page: 50 },
  { id: 4, name: 'An-Nisaa', verses: 176, page: 77 },
  { id: 5, name: 'Al-Maida', verses: 120, page: 106 },
  { id: 6, name: "Al-An'am", verses: 165, page: 128 },
  { id: 7, name: "Al-A'raf", verses: 206, page: 151 },
  { id: 8, name: 'Al-Anfal', verses: 75, page: 177 },
  { id: 9, name: 'At-Tauba', verses: 129, page: 187 },
  { id: 10, name: 'Yunus', verses: 109, page: 208 },
  { id: 11, name: 'Hud', verses: 123, page: 221 },
  { id: 12, name: 'Yusuf', verses: 111, page: 235 },
  { id: 13, name: "Ar-Ra'd", verses: 43, page: 249 },
  { id: 14, name: 'Ibrahim', verses: 52, page: 255 },
  { id: 15, name: 'Al-Hijr', verses: 99, page: 261 },
  { id: 16, name: 'An-Nahl', verses: 128, page: 267 },
  { id: 17, name: 'Al-Israa', verses: 111, page: 282 },
  { id: 18, name: 'Al-Kahf', verses: 110, page: 293 },
  { id: 19, name: 'Maryam', verses: 98, page: 305 },
  { id: 20, name: 'Ta-ha', verses: 135, page: 312 },
  { id: 21, name: 'Al-Anbiyaa', verses: 112, page: 322 },
  { id: 22, name: 'Al-Hajj', verses: 78, page: 331 },
  { id: 23, name: "Al-Mu'minun", verses: 118, page: 342 },
  { id: 24, name: 'An-Nur', verses: 64, page: 350 },
  { id: 25, name: 'Al-Furqan', verses: 77, page: 359 },
  { id: 26, name: "Ash-Shu'ara", verses: 227, page: 366 },
  { id: 27, name: 'An-Naml', verses: 93, page: 376 },
  { id: 28, name: 'Al-Qasas', verses: 88, page: 385 },
  { id: 29, name: 'Al-Ankabut', verses: 69, page: 396 },
  { id: 30, name: 'Ar-Rum', verses: 60, page: 404 },
  { id: 31, name: 'Luqman', verses: 34, page: 411 },
  { id: 32, name: 'As-Sajda', verses: 30, page: 415 },
  { id: 33, name: 'Al-Ahzab', verses: 73, page: 418 },
  { id: 34, name: 'Saba', verses: 54, page: 428 },
  { id: 35, name: 'Fatir', verses: 45, page: 434 },
  { id: 36, name: 'Ya-Sin', verses: 83, page: 440 },
  { id: 37, name: 'As-Saffat', verses: 182, page: 445 },
  { id: 38, name: 'Sad', verses: 88, page: 452 },
  { id: 39, name: 'Az-Zumar', verses: 75, page: 458 },
  { id: 40, name: 'Ghafir', verses: 85, page: 467 },
  { id: 41, name: 'Fussilat', verses: 54, page: 477 },
  { id: 42, name: 'Ash-Shura', verses: 53, page: 483 },
  { id: 43, name: 'Az-Zukhruf', verses: 89, page: 489 },
  { id: 44, name: 'Ad-Dukhan', verses: 59, page: 495 },
  { id: 45, name: 'Al-Jathiya', verses: 37, page: 498 },
  { id: 46, name: 'Al-Ahqaf', verses: 35, page: 502 },
  { id: 47, name: 'Muhammad', verses: 38, page: 506 },
  { id: 48, name: 'Al-Fath', verses: 29, page: 511 },
  { id: 49, name: 'Al-Hujurat', verses: 18, page: 515 },
  { id: 50, name: 'Qaf', verses: 45, page: 518 },
  { id: 51, name: 'Adh-Dhariyat', verses: 60, page: 520 },
  { id: 52, name: 'At-Tur', verses: 49, page: 523 },
  { id: 53, name: 'An-Najm', verses: 62, page: 526 },
  { id: 54, name: 'Al-Qamar', verses: 55, page: 528 },
  { id: 55, name: 'Ar-Rahman', verses: 78, page: 531 },
  { id: 56, name: "Al-Waqi'a", verses: 96, page: 534 },
  { id: 57, name: 'Al-Hadid', verses: 29, page: 537 },
  { id: 58, name: 'Al-Mujadila', verses: 22, page: 542 },
  { id: 59, name: 'Al-Hashr', verses: 24, page: 545 },
  { id: 60, name: 'Al-Mumtahana', verses: 13, page: 549 },
  { id: 61, name: 'As-Saff', verses: 14, page: 551 },
  { id: 62, name: "Al-Jumu'a", verses: 11, page: 553 },
  { id: 63, name: 'Al-Munafiqun', verses: 11, page: 554 },
  { id: 64, name: 'At-Taghabun', verses: 18, page: 556 },
  { id: 65, name: 'At-Talaq', verses: 12, page: 558 },
  { id: 66, name: 'At-Tahrim', verses: 12, page: 560 },
  { id: 67, name: 'Al-Mulk', verses: 30, page: 562 },
  { id: 68, name: 'Al-Qalam', verses: 52, page: 564 },
  { id: 69, name: 'Al-Haqqa', verses: 52, page: 567 },
  { id: 70, name: "Al-Ma'arij", verses: 44, page: 569 },
  { id: 71, name: 'Nuh', verses: 28, page: 571 },
  { id: 72, name: 'Al-Jinn', verses: 28, page: 573 },
  { id: 73, name: 'Al-Muzzammil', verses: 20, page: 576 },
  { id: 74, name: 'Al-Muddaththir', verses: 56, page: 578 },
  { id: 75, name: 'Al-Qiyama', verses: 40, page: 580 },
  { id: 76, name: 'Al-Insan', verses: 31, page: 582 },
  { id: 77, name: 'Al-Mursalat', verses: 50, page: 584 },
  { id: 78, name: "An-Naba'", verses: 40, page: 586 },
  { id: 79, name: "An-Nazi'at", verses: 46, page: 587 },
  { id: 80, name: 'Abasa', verses: 42, page: 589 },
  { id: 81, name: 'At-Takwir', verses: 29, page: 590 },
  { id: 82, name: 'Al-Infitar', verses: 19, page: 591 },
  { id: 83, name: 'Al-Mutaffifin', verses: 36, page: 592 },
  { id: 84, name: 'Al-Inshiqaq', verses: 25, page: 594 },
  { id: 85, name: 'Al-Buruj', verses: 22, page: 595 },
  { id: 86, name: 'At-Tariq', verses: 17, page: 596 },
  { id: 87, name: "Al-A'la", verses: 19, page: 597 },
  { id: 88, name: 'Al-Ghashiya', verses: 26, page: 597 },
  { id: 89, name: 'Al-Fajr', verses: 30, page: 598 },
  { id: 90, name: 'Al-Balad', verses: 20, page: 600 },
  { id: 91, name: 'Ash-Shams', verses: 15, page: 600 },
  { id: 92, name: 'Al-Lail', verses: 21, page: 601 },
  { id: 93, name: 'Ad-Duha', verses: 11, page: 602 },
  { id: 94, name: 'Ash-Sharh', verses: 8, page: 602 },
  { id: 95, name: 'At-Tin', verses: 8, page: 603 },
  { id: 96, name: "Al-'Alaq", verses: 19, page: 603 },
  { id: 97, name: 'Al-Qadr', verses: 5, page: 604 },
  { id: 98, name: 'Al-Bayyina', verses: 8, page: 604 },
  { id: 99, name: 'Az-Zalzala', verses: 8, page: 605 },
  { id: 100, name: "Al-'Adiyat", verses: 11, page: 605 },
  { id: 101, name: "Al-Qari'a", verses: 11, page: 606 },
  { id: 102, name: 'At-Takathur', verses: 8, page: 606 },
  { id: 103, name: "Al-'Asr", verses: 3, page: 607 },
  { id: 104, name: 'Al-Humaza', verses: 9, page: 607 },
  { id: 105, name: 'Al-Fil', verses: 5, page: 607 },
  { id: 106, name: 'Quraish', verses: 4, page: 608 },
  { id: 107, name: "Al-Ma'un", verses: 7, page: 608 },
  { id: 108, name: 'Al-Kauthar', verses: 3, page: 608 },
  { id: 109, name: 'Al-Kafirun', verses: 6, page: 608 },
  { id: 110, name: 'An-Nasr', verses: 3, page: 609 },
  { id: 111, name: 'Al-Masad', verses: 5, page: 609 },
  { id: 112, name: 'Al-Ikhlas', verses: 4, page: 609 },
  { id: 113, name: 'Al-Falaq', verses: 5, page: 610 },
  { id: 114, name: 'An-Nas', verses: 6, page: 610 },
];

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
    <div className="hidden lg:block w-44 xl:w-48 bg-white border-x border-gray-200 h-[calc(100vh-64px)] overflow-y-auto text-sm shrink-0">
      <div className="sticky top-0 bg-gray-100 px-2 py-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700 text-center text-xs xl:text-sm">Chapter (Verses)</h3>
      </div>
      <div className="py-1">
        {displayChapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => handleChapterClick(chapter.page)}
            className="w-full text-left px-2 py-1 hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors border-b border-gray-100 text-xs xl:text-sm"
          >
            {chapter.id}. {chapter.name} ({chapter.verses})
          </button>
        ))}
      </div>
    </div>
  );
}

// Mobile chapter selector - dropdown/modal style
export function MobileChapterSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleChapterClick = (pageNumber: number) => {
    navigate(`/page/${pageNumber}`);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-[var(--color-primary)] text-white p-4 rounded-full shadow-lg hover:bg-[var(--color-primary-light)] transition-colors"
        aria-label="Select Chapter"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white w-full sm:w-[90%] sm:max-w-lg max-h-[80vh] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-primary)] text-white px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select Chapter</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chapter list */}
            <div className="overflow-y-auto max-h-[calc(80vh-56px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.page)}
                    className="text-left p-2 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg transition-colors border border-gray-100"
                  >
                    <span className="font-medium">{chapter.id}.</span>{' '}
                    <span className="text-sm">{chapter.name}</span>
                    <span className="text-xs text-gray-400 block">({chapter.verses} verses)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
