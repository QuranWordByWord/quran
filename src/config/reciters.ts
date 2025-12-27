import type { ReciterConfig } from './types';
import { API_CONFIG } from './constants';

// Popular reciters with audio URL patterns
export const RECITERS: ReciterConfig[] = [
  {
    id: 7,
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    style: null,
    reciterPath: 'Alafasy',
  },
  {
    id: 1,
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
    reciterPath: 'AbdulBaset/AbdulSamad/Murattal',
  },
  {
    id: 2,
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Mujawwad',
    reciterPath: 'AbdulBaset/AbdulSamad/Mujawwad',
  },
  {
    id: 3,
    name: 'Abdur-Rahman as-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: null,
    reciterPath: 'Sudais',
  },
  {
    id: 4,
    name: 'Abu Bakr al-Shatri',
    arabicName: 'أبو بكر الشاطري',
    style: null,
    reciterPath: 'Shatri',
  },
  {
    id: 5,
    name: 'Hani ar-Rifai',
    arabicName: 'هاني الرفاعي',
    style: null,
    reciterPath: 'Rifai',
  },
  {
    id: 6,
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    style: null,
    reciterPath: 'Husary',
  },
  {
    id: 8,
    name: 'Sa`ud ash-Shuraym',
    arabicName: 'سعود الشريم',
    style: null,
    reciterPath: 'Shuraym',
  },
];

export const DEFAULT_RECITER_ID = 7; // Mishary Alafasy

export function getReciterById(id: number): ReciterConfig | undefined {
  return RECITERS.find((r) => r.id === id);
}

export function getReciterAudioUrl(reciter: ReciterConfig, verseKey: string): string {
  const [chapter, verse] = verseKey.split(':');
  const paddedChapter = chapter.padStart(3, '0');
  const paddedVerse = verse.padStart(3, '0');
  return `${API_CONFIG.verseAudioBaseUrl}/${reciter.reciterPath}/mp3/${paddedChapter}${paddedVerse}.mp3`;
}
