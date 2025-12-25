import { useState, useRef, useEffect } from 'react';
import type { FontStyle, FontOption } from '../hooks/useFont';

interface FontSelectorProps {
  currentFont: FontOption;
  fontOptions: FontOption[];
  onFontChange: (fontId: FontStyle) => void;
}

export function FontSelector({ currentFont, fontOptions, onFontChange }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        title="Change font style"
      >
        <span className="text-base">ع</span>
        <span className="hidden sm:inline text-gray-600">{currentFont.name}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Font Style</p>
          </div>
          {fontOptions.map((font) => (
            <button
              key={font.id}
              onClick={() => {
                onFontChange(font.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                currentFont.id === font.id ? 'bg-[var(--mushaf-header-bg)]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${currentFont.id === font.id ? 'text-[var(--mushaf-text-header)]' : 'text-gray-900'}`}>
                    {font.name}
                  </p>
                  <p className="text-xs text-gray-500">{font.description}</p>
                </div>
                {currentFont.id === font.id && (
                  <svg className="w-5 h-5 text-[var(--mushaf-text-header)]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {/* Font preview */}
              <p className={`arabic-text ${font.className} text-lg mt-1 text-gray-700`} style={{ direction: 'rtl' }}>
                بِسْمِ اللَّهِ
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
