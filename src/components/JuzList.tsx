import { useNavigate, useLocation } from 'react-router-dom';
import { useFavoriteJuz } from '../contexts/FavoriteJuzContext';
import { useSettings } from '../contexts/SettingsContext';
import { JUZ_DATA, getJuzStartPage } from '../config/juzData';

interface JuzListProps {
  compact?: boolean;
  onNavigate?: () => void;
}

export function JuzList({ compact = false, onNavigate }: JuzListProps) {
  const { favoriteJuz, toggleFavorite, isFavorited } = useFavoriteJuz();
  const { mushafScript } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const isMushafMode = location.pathname.startsWith('/mushaf');

  const handleJuzClick = (juzNumber: number) => {
    const targetPage = getJuzStartPage(juzNumber, isMushafMode ? 'mushaf' : 'wordforword', mushafScript);
    if (isMushafMode) {
      navigate(`/mushaf/${targetPage}`);
    } else {
      navigate(`/page/${targetPage}`);
    }
    onNavigate?.();
  };

  const handleToggleFavorite = (e: React.MouseEvent, juzNumber: number) => {
    e.stopPropagation();
    toggleFavorite(juzNumber);
  };

  // Split into favorites and non-favorites
  const favorites = JUZ_DATA.filter(juz => isFavorited(juz.id));
  const nonFavorites = JUZ_DATA.filter(juz => !isFavorited(juz.id));

  if (compact) {
    return (
      <div className="divide-y divide-[var(--color-border)]">
        {/* Favorites first */}
        {favorites.map(juz => (
          <JuzItemCompact
            key={juz.id}
            juz={juz}
            isFavorited={true}
            onToggleFavorite={handleToggleFavorite}
            onClick={() => handleJuzClick(juz.id)}
          />
        ))}
        {/* Then the rest */}
        {nonFavorites.map(juz => (
          <JuzItemCompact
            key={juz.id}
            juz={juz}
            isFavorited={false}
            onToggleFavorite={handleToggleFavorite}
            onClick={() => handleJuzClick(juz.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Favorites Section */}
      {favoriteJuz.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
            <StarFilledIcon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            Favorites ({favoriteJuz.length})
          </h3>
          <div className="space-y-1.5">
            {favorites.map(juz => (
              <JuzCard
                key={juz.id}
                juz={juz}
                isFavorited={true}
                onToggleFavorite={handleToggleFavorite}
                onClick={() => handleJuzClick(juz.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Juz Section */}
      <div>
        {favoriteJuz.length > 0 && (
          <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider px-2 py-1.5">
            All Juz
          </h3>
        )}
        <div className="space-y-1.5">
          {nonFavorites.map(juz => (
            <JuzCard
              key={juz.id}
              juz={juz}
              isFavorited={false}
              onToggleFavorite={handleToggleFavorite}
              onClick={() => handleJuzClick(juz.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact item for desktop sidebar
interface JuzItemProps {
  juz: typeof JUZ_DATA[number];
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, juzNumber: number) => void;
  onClick: () => void;
}

function JuzItemCompact({ juz, isFavorited, onToggleFavorite, onClick }: JuzItemProps) {
  return (
    <div className="w-full flex items-start justify-between px-2 py-1.5 hover:bg-[var(--mushaf-header-bg)] transition-colors text-left group">
      <button
        onClick={onClick}
        className="flex-1 min-w-0 text-left flex items-start gap-1.5"
      >
        <span className="text-xs font-medium text-[var(--color-text-secondary)] w-5 shrink-0 pt-0.5">
          {juz.id}
        </span>
        <div className="min-w-0">
          <span className="text-xs text-[var(--color-text-primary)] truncate block" dir="rtl">
            {juz.arabicName}
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] truncate block">
            {juz.englishName}
          </span>
        </div>
      </button>
      <button
        onClick={(e) => onToggleFavorite(e, juz.id)}
        className="p-1 rounded-full transition-colors hover:bg-[var(--color-primary)]/10 mt-0.5"
        aria-label={isFavorited ? `Remove Juz ${juz.id} from favorites` : `Add Juz ${juz.id} to favorites`}
        aria-pressed={isFavorited}
      >
        {isFavorited ? (
          <StarFilledIcon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
        ) : (
          <StarOutlineIcon className="w-3.5 h-3.5 text-[var(--color-text-secondary)] opacity-50 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
}

// Full card for mobile
function JuzCard({ juz, isFavorited, onToggleFavorite, onClick }: JuzItemProps) {
  return (
    <div
      className="w-full text-left p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--mushaf-header-bg)] hover:border-[var(--color-primary)]/30 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onClick}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--color-primary)] w-6 shrink-0">
              {juz.id}
            </span>
            <span className="font-semibold text-[var(--color-text-primary)] truncate" dir="rtl">
              {juz.arabicName}
            </span>
          </div>
          <div className="mt-0.5 ml-8 text-xs text-[var(--color-text-secondary)]">
            {juz.englishName}
          </div>
        </button>
        <button
          onClick={(e) => onToggleFavorite(e, juz.id)}
          className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-primary)]/10"
          aria-label={isFavorited ? `Remove Juz ${juz.id} from favorites` : `Add Juz ${juz.id} to favorites`}
          aria-pressed={isFavorited}
        >
          {isFavorited ? (
            <StarFilledIcon className="w-5 h-5 text-[var(--color-primary)]" />
          ) : (
            <StarOutlineIcon className="w-5 h-5 text-[var(--color-text-secondary)] opacity-50 group-hover:opacity-100" />
          )}
        </button>
      </div>
    </div>
  );
}

// Star icons
function StarFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function StarOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
