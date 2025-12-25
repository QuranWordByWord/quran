import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Chapter } from '../types/quran';

interface ChapterListProps {
  chapters: Chapter[];
  loading: boolean;
}

export function ChapterList({ chapters, loading }: ChapterListProps) {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const currentChapterId = chapterId ? parseInt(chapterId) : 1;

  if (loading) {
    return (
      <aside className="hidden md:block w-64 lg:w-72 bg-white border-r border-[var(--color-border)] h-[calc(100vh-64px)] overflow-y-auto shrink-0">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:block w-64 lg:w-72 bg-white border-r border-[var(--color-border)] h-[calc(100vh-64px)] overflow-y-auto shrink-0">
      <div className="p-2">
        <h2 className="px-3 py-2 text-xs lg:text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Chapters
        </h2>
        <nav className="space-y-1">
          {chapters.map((chapter) => {
            const isActive = chapter.id === currentChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => navigate(`/chapter/${chapter.id}`)}
                className={`w-full text-left px-2 lg:px-3 py-2 lg:py-3 rounded-lg transition-all flex items-center gap-2 lg:gap-3 ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'hover:bg-gray-50 text-[var(--color-text-primary)]'
                }`}
              >
                <span
                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  }`}
                >
                  {chapter.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium truncate text-sm lg:text-base">{chapter.name_simple}</span>
                    <span
                      className={`arabic-text text-base lg:text-lg shrink-0 ${
                        isActive ? 'text-white/90' : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {chapter.name_arabic}
                    </span>
                  </div>
                  <div
                    className={`text-[10px] lg:text-xs ${
                      isActive ? 'text-white/70' : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {chapter.verses_count} verses • {chapter.revelation_place}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// Mobile chapter selector for chapter view mode
export function MobileChapterList({ chapters }: { chapters: Chapter[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const currentChapterId = chapterId ? parseInt(chapterId) : 1;
  void chapters.find(c => c.id === currentChapterId); // Keep reference for future use

  const handleChapterClick = (id: number) => {
    navigate(`/chapter/${id}`);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
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
              <div className="p-2 space-y-1">
                {chapters.map((chapter) => {
                  const isActive = chapter.id === currentChapterId;
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => handleChapterClick(chapter.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                        isActive
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'hover:bg-gray-50 text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        }`}
                      >
                        {chapter.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{chapter.name_simple}</span>
                          <span
                            className={`arabic-text text-lg shrink-0 ${
                              isActive ? 'text-white/90' : 'text-[var(--color-text-secondary)]'
                            }`}
                          >
                            {chapter.name_arabic}
                          </span>
                        </div>
                        <div
                          className={`text-xs ${
                            isActive ? 'text-white/70' : 'text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {chapter.verses_count} verses • {chapter.revelation_place}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
