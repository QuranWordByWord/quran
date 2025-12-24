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
      <aside className="w-72 bg-white border-r border-[var(--color-border)] h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-white border-r border-[var(--color-border)] h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-2">
        <h2 className="px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Chapters
        </h2>
        <nav className="space-y-1">
          {chapters.map((chapter) => {
            const isActive = chapter.id === currentChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => navigate(`/chapter/${chapter.id}`)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'hover:bg-gray-50 text-[var(--color-text-primary)]'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  }`}
                >
                  {chapter.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{chapter.name_simple}</span>
                    <span
                      className={`arabic-text text-lg ${
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
        </nav>
      </div>
    </aside>
  );
}
