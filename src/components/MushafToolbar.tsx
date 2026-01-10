import { useState, useRef, useEffect } from 'react';
import type { MushafScript } from '../config/types';
import { MUSHAF_SCRIPTS } from '../config/constants';

interface MushafToolbarProps {
  // Script selection
  mushafScript: MushafScript;
  onScriptChange: (script: MushafScript) => void;
  // Tajweed toggle
  tajweedEnabled: boolean;
  onTajweedChange: (enabled: boolean) => void;
  // Zoom controls
  zoom: number;
  onZoomChange: (zoom: number) => void;
  // Page info
  currentPage: number;
  totalPages: number;
  onOpenMenu?: () => void;
}

export function MushafToolbar({
  mushafScript,
  onScriptChange,
  tajweedEnabled,
  onTajweedChange,
  zoom,
  onZoomChange,
  currentPage,
  totalPages,
  onOpenMenu,
}: MushafToolbarProps) {
  const [isScriptMenuOpen, setIsScriptMenuOpen] = useState(false);
  const scriptMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scriptMenuRef.current && !scriptMenuRef.current.contains(event.target as Node)) {
        setIsScriptMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentScriptInfo = MUSHAF_SCRIPTS.find(s => s.id === mushafScript) || MUSHAF_SCRIPTS[0];

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom * 1.15);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom / 1.15);
    onZoomChange(newZoom);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-[var(--mushaf-page-bg)]/95 backdrop-blur-sm rounded-full border border-[var(--mushaf-border)] shadow-lg">
      {/* Script selector */}
      <div className="relative" ref={scriptMenuRef}>
        <button
          onClick={() => setIsScriptMenuOpen(!isScriptMenuOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-[var(--mushaf-text-primary)] hover:bg-[var(--mushaf-arrow-hover)] rounded-md transition-colors"
          title="Change mushaf script"
        >
          <span className="hidden sm:inline">{currentScriptInfo.name}</span>
          <span className="sm:hidden">Script</span>
          <svg
            className={`w-3 h-3 text-[var(--mushaf-text-secondary)] transition-transform ${isScriptMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isScriptMenuOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-[var(--mushaf-page-bg)] rounded-lg shadow-lg border border-[var(--mushaf-border)] py-1 z-50">
            <div className="px-3 py-1.5 border-b border-[var(--mushaf-border)]">
              <p className="text-xs font-medium text-[var(--mushaf-text-secondary)] uppercase">Mushaf Script</p>
            </div>
            {MUSHAF_SCRIPTS.map((script) => (
              <button
                key={script.id}
                onClick={() => {
                  onScriptChange(script.id);
                  setIsScriptMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-[var(--mushaf-arrow-hover)] transition-colors ${
                  mushafScript === script.id ? 'bg-[var(--mushaf-header-bg)]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${mushafScript === script.id ? 'text-[var(--mushaf-text-header)]' : 'text-[var(--mushaf-text-primary)]'}`}>
                      {script.name}
                    </p>
                    <p className="text-xs text-[var(--mushaf-text-secondary)]">{script.pages} pages</p>
                  </div>
                  {mushafScript === script.id && (
                    <svg className="w-4 h-4 text-[var(--mushaf-text-header)]" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--mushaf-border)]" />

      {/* Tajweed toggle */}
      <button
        onClick={() => onTajweedChange(!tajweedEnabled)}
        className={`flex items-center gap-1 px-2 py-1 text-xs sm:text-sm rounded-md transition-colors ${
          tajweedEnabled
            ? 'bg-[var(--mushaf-accent)]/20 text-[var(--mushaf-accent)]'
            : 'text-[var(--mushaf-text-secondary)] hover:bg-[var(--mushaf-arrow-hover)]'
        }`}
        title={tajweedEnabled ? 'Disable tajweed colors' : 'Enable tajweed colors'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="hidden sm:inline">Tajweed</span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--mushaf-border)]" />

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleZoomOut}
          className="p-1 text-[var(--mushaf-text-secondary)] hover:bg-[var(--mushaf-arrow-hover)] rounded transition-colors"
          title="Zoom out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <span className="text-xs text-[var(--mushaf-text-secondary)] w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1 text-[var(--mushaf-text-secondary)] hover:bg-[var(--mushaf-arrow-hover)] rounded transition-colors"
          title="Zoom in"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
      </div>

      {/* Divider - mobile only shows page info */}
      <div className="w-px h-5 bg-[var(--mushaf-border)] sm:hidden" />

      {/* Page info button (mobile) */}
      <button
        onClick={onOpenMenu}
        className="sm:hidden px-2 py-1 text-xs text-[var(--mushaf-text-secondary)] hover:bg-[var(--mushaf-arrow-hover)] rounded transition-colors"
      >
        {currentPage} / {totalPages}
      </button>
    </div>
  );
}
