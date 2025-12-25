import { useState, useEffect } from 'react';

export type FontStyle = 'nastaleeq' | 'madina' | 'old-madina' | 'indopak';

export interface FontOption {
  id: FontStyle;
  name: string;
  description: string;
  className: string;
}

export const fontOptions: FontOption[] = [
  {
    id: 'nastaleeq',
    name: 'KFGQPC Nastaleeq',
    description: 'Default - QPC Nastaleeq style',
    className: 'font-nastaleeq',
  },
  {
    id: 'madina',
    name: 'Madina Mushaf',
    description: 'Modern Saudi standard (1420H)',
    className: 'font-madina',
  },
  {
    id: 'old-madina',
    name: 'Old Madina',
    description: 'Classic traditional style',
    className: 'font-old-madina',
  },
  {
    id: 'indopak',
    name: 'IndoPak',
    description: 'South Asian Nastaliq style',
    className: 'font-indopak',
  },
];

const STORAGE_KEY = 'quran-font-preference';

export function useFont() {
  const [fontStyle, setFontStyle] = useState<FontStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && fontOptions.some(f => f.id === saved)) {
        return saved as FontStyle;
      }
    }
    return 'nastaleeq';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, fontStyle);
  }, [fontStyle]);

  const currentFont = fontOptions.find(f => f.id === fontStyle) || fontOptions[0];

  return {
    fontStyle,
    setFontStyle,
    currentFont,
    fontOptions,
    fontClassName: currentFont.className,
  };
}
