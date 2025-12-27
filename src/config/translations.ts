import type { TranslationConfig } from './types';

export const TRANSLATIONS: TranslationConfig[] = [
  // English translations
  {
    id: 131,
    name: 'Sahih International',
    language: 'English',
    languageCode: 'en',
    authorName: 'Sahih International',
  },
  {
    id: 20,
    name: 'Pickthall',
    language: 'English',
    languageCode: 'en',
    authorName: 'Mohammed Marmaduke Pickthall',
  },
  {
    id: 22,
    name: 'Yusuf Ali',
    language: 'English',
    languageCode: 'en',
    authorName: 'Abdullah Yusuf Ali',
  },
  {
    id: 85,
    name: 'Muhsin Khan',
    language: 'English',
    languageCode: 'en',
    authorName: 'Muhammad Muhsin Khan',
  },
  {
    id: 203,
    name: 'The Clear Quran',
    language: 'English',
    languageCode: 'en',
    authorName: 'Dr. Mustafa Khattab',
  },
  {
    id: 84,
    name: 'Mufti Taqi Usmani',
    language: 'English',
    languageCode: 'en',
    authorName: 'Mufti Taqi Usmani',
  },
  // Urdu translations
  {
    id: 97,
    name: 'Fateh Muhammad Jalandhari',
    language: 'Urdu',
    languageCode: 'ur',
    authorName: 'Fateh Muhammad Jalandhari',
  },
  {
    id: 158,
    name: 'Abul Ala Maududi',
    language: 'Urdu',
    languageCode: 'ur',
    authorName: 'Abul Ala Maududi',
  },
];

export const DEFAULT_TRANSLATION_ID = 131; // Sahih International

export function getTranslationById(id: number): TranslationConfig | undefined {
  return TRANSLATIONS.find((t) => t.id === id);
}
