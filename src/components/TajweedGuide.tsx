import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../contexts/SettingsContext';

// Tajweed color definitions with pronunciation guides
const TAJWEED_RULES = [
  {
    id: 'tafkheem',
    color: '#006694',
    name: 'Tafkheem',
    subtitle: 'Heavy letters',
    letters: 'خ ص ض غ ط ق ظ',
    guide: [
      'These letters are pronounced with a heavy, full sound',
      'Raise the back of your tongue towards the soft palate',
      'Create a deeper, more resonant sound from the throat',
      'The sound should feel thick and weighty',
    ],
  },
  {
    id: 'qalqalah',
    color: '#00ADEF',
    name: 'Qalqalah',
    subtitle: 'Echo sound',
    letters: 'ق ط ب ج د',
    guide: [
      'Produce a slight bouncing or echoing sound',
      'The letter vibrates briefly when stopping on it',
      'Stronger echo when at the end of a verse (Qalqalah Kubra)',
      'Lighter echo in the middle of words (Qalqalah Sughra)',
    ],
  },
  {
    id: 'silent',
    color: '#B4B4B4',
    name: 'Silent Letters',
    subtitle: 'Hamza Wasl / Silent letters',
    letters: 'ٱ (Alif Wasl)',
    guide: [
      'These letters are not pronounced',
      'Hamza Wasl (ٱ) is skipped when connecting words',
      'Only pronounced at the beginning of speech',
      'Flow smoothly to the next letter without stopping',
    ],
  },
  {
    id: 'ghunnah',
    color: '#00A650',
    name: 'Idgham / Ikhfa / Iqlab',
    subtitle: 'Nasal sounds & merging',
    letters: 'ن / م with nasal',
    guide: [
      'Idgham: Merge noon/tanween into the following letter',
      'Ikhfa: Hide the noon with a light nasal sound (ghunnah)',
      'Iqlab: Change noon to meem before ب',
      'Hold the nasal sound for approximately 2 counts',
    ],
  },
  {
    id: 'madd2',
    color: '#C38A08',
    name: 'Madd (2 counts)',
    subtitle: 'Natural elongation',
    letters: 'ا و ي (with harakah)',
    guide: [
      'Extend the vowel sound for 2 counts (harakat)',
      'This is the natural length (Madd Tabee\'i)',
      'Count "one-two" in your mind while holding',
      'Keep the sound steady without wavering',
    ],
  },
  {
    id: 'madd45jaiz',
    color: '#F47216',
    name: 'Madd (4-5 Jaiz)',
    subtitle: 'Permitted elongation',
    letters: 'Madd before hamza',
    guide: [
      'Extend for 4-5 counts (permissible variation)',
      'Occurs when madd letter is followed by hamza in next word',
      'Called Madd Jaiz Munfasil (separated permitted madd)',
      'You may choose 4 or 5 counts consistently',
    ],
  },
  {
    id: 'madd45wajib',
    color: '#EC008C',
    name: 'Madd (4-5 Wajib)',
    subtitle: 'Required elongation',
    letters: 'Madd + hamza (same word)',
    guide: [
      'Extend for 4-5 counts (obligatory)',
      'Occurs when madd letter is followed by hamza in same word',
      'Called Madd Wajib Muttasil (connected required madd)',
      'Must be elongated - cannot be shortened to 2 counts',
    ],
  },
  {
    id: 'madd6',
    color: '#8C0000',
    name: 'Madd (6 counts)',
    subtitle: 'Necessary elongation',
    letters: 'Madd + sukoon/shaddah',
    guide: [
      'Extend for exactly 6 counts',
      'Called Madd Lazim (necessary madd)',
      'Occurs when madd letter is followed by sukoon or shaddah',
      'The longest elongation - count carefully',
    ],
  },
];

interface TajweedGuideProps {
  isAudioActive?: boolean;
  /** When true, hide the floating button (for mobile where it's rendered elsewhere) */
  hideFloatingButton?: boolean;
  /** External control to open the modal */
  isOpen?: boolean;
  /** Callback when modal is closed externally */
  onOpenChange?: (open: boolean) => void;
}

export function TajweedGuide({
  isAudioActive = false,
  hideFloatingButton = false,
  isOpen: externalIsOpen,
  onOpenChange,
}: TajweedGuideProps) {
  const { tajweedEnabled, theme } = useSettings();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<typeof TAJWEED_RULES[0] | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );

  // Track desktop breakpoint for styling
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Use external control if provided, otherwise internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRule) {
          setSelectedRule(null);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedRule]);

  // Don't render if tajweed is disabled
  if (!tajweedEnabled) return null;

  const modal = isOpen && createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tajweed-guide-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (selectedRule) {
            setSelectedRule(null);
          } else {
            setIsOpen(false);
          }
        }}
        aria-hidden="true"
      />

      {/* Modal Content - Bottom sheet on mobile, centered on desktop */}
      <div className="relative z-[10000] bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-xl rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {selectedRule ? (
            <>
              <button
                onClick={() => setSelectedRule(null)}
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Back to list"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2
                id="tajweed-guide-title"
                className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-1 text-center"
              >
                {selectedRule.name}
              </h2>
              <button
                onClick={() => {
                  setSelectedRule(null);
                  setIsOpen(false);
                }}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <h2
                id="tajweed-guide-title"
                className="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tajweed Color Guide
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {selectedRule ? (
            // Detail View
            <div className="p-4 space-y-4">
              {/* Color indicator and subtitle */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg shadow-sm shrink-0"
                  style={{ backgroundColor: selectedRule.color }}
                />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedRule.subtitle}
                  </div>
                  <div className="text-lg font-arabic text-gray-900 dark:text-gray-100 mt-0.5" dir="rtl">
                    {selectedRule.letters}
                  </div>
                </div>
              </div>

              {/* Pronunciation Guide */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  How to Pronounce
                </h3>
                <ul className="space-y-2">
                  {selectedRule.guide.map((tip, index) => (
                    <li key={index} className="flex gap-3">
                      <span
                        className="w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: selectedRule.color + '20', color: selectedRule.color }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            // List View
            <div className="py-2">
              {TAJWEED_RULES.map((rule) => (
                <button
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div
                    className="w-6 h-6 rounded-md shrink-0 shadow-sm"
                    style={{ backgroundColor: rule.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {rule.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {rule.subtitle}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Mobile swipe hint */}
        <div className="sm:hidden px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto" />
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {/* Floating Info Button - hidden on mobile when hideFloatingButton is true */}
      {!hideFloatingButton && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed right-4 z-[56] w-10 h-10 rounded-full bg-[var(--mushaf-page-bg)]/95 backdrop-blur-sm border border-[var(--mushaf-border)] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform lg:border-2 ${
            isAudioActive ? 'bottom-[5.5rem] lg:bottom-4' : 'bottom-16 lg:bottom-4'
          }`}
          style={isDesktop && theme === 'dark' ? { borderColor: '#90c070' } : undefined}
          aria-label="Open Tajweed color guide"
          title="Tajweed Color Guide"
        >
          <svg
            className="w-5 h-5 text-[var(--mushaf-text-secondary)] lg:text-[var(--mushaf-border)]"
            style={isDesktop && theme === 'dark' ? { color: '#90c070' } : undefined}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {modal}
    </>
  );
}
