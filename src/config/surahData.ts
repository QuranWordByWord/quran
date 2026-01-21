/**
 * Surah (Chapter) verse counts
 * Index 0 = Surah 1 (Al-Fatiha), Index 113 = Surah 114 (An-Nas)
 */
export const SURAH_VERSE_COUNTS: readonly number[] = [
  7,    // 1 - Al-Fatiha
  286,  // 2 - Al-Baqara
  200,  // 3 - Al-i'Imran
  176,  // 4 - An-Nisaa
  120,  // 5 - Al-Maida
  165,  // 6 - Al-An'am
  206,  // 7 - Al-A'raf
  75,   // 8 - Al-Anfal
  129,  // 9 - At-Tauba
  109,  // 10 - Yunus
  123,  // 11 - Hud
  111,  // 12 - Yusuf
  43,   // 13 - Ar-Ra'd
  52,   // 14 - Ibrahim
  99,   // 15 - Al-Hijr
  128,  // 16 - An-Nahl
  111,  // 17 - Al-Israa
  110,  // 18 - Al-Kahf
  98,   // 19 - Maryam
  135,  // 20 - Ta-ha
  112,  // 21 - Al-Anbiyaa
  78,   // 22 - Al-Hajj
  118,  // 23 - Al-Mu'minun
  64,   // 24 - An-Nur
  77,   // 25 - Al-Furqan
  227,  // 26 - Ash-Shu'ara
  93,   // 27 - An-Naml
  88,   // 28 - Al-Qasas
  69,   // 29 - Al-Ankabut
  60,   // 30 - Ar-Rum
  34,   // 31 - Luqman
  30,   // 32 - As-Sajda
  73,   // 33 - Al-Ahzab
  54,   // 34 - Saba
  45,   // 35 - Fatir
  83,   // 36 - Ya-Sin
  182,  // 37 - As-Saffat
  88,   // 38 - Sad
  75,   // 39 - Az-Zumar
  85,   // 40 - Ghafir
  54,   // 41 - Fussilat
  53,   // 42 - Ash-Shura
  89,   // 43 - Az-Zukhruf
  59,   // 44 - Ad-Dukhan
  37,   // 45 - Al-Jathiya
  35,   // 46 - Al-Ahqaf
  38,   // 47 - Muhammad
  29,   // 48 - Al-Fath
  18,   // 49 - Al-Hujurat
  45,   // 50 - Qaf
  60,   // 51 - Adh-Dhariyat
  49,   // 52 - At-Tur
  62,   // 53 - An-Najm
  55,   // 54 - Al-Qamar
  78,   // 55 - Ar-Rahman
  96,   // 56 - Al-Waqi'a
  29,   // 57 - Al-Hadid
  22,   // 58 - Al-Mujadila
  24,   // 59 - Al-Hashr
  13,   // 60 - Al-Mumtahana
  14,   // 61 - As-Saff
  11,   // 62 - Al-Jumu'a
  11,   // 63 - Al-Munafiqun
  18,   // 64 - At-Taghabun
  12,   // 65 - At-Talaq
  12,   // 66 - At-Tahrim
  30,   // 67 - Al-Mulk
  52,   // 68 - Al-Qalam
  52,   // 69 - Al-Haqqa
  44,   // 70 - Al-Ma'arij
  28,   // 71 - Nuh
  28,   // 72 - Al-Jinn
  20,   // 73 - Al-Muzzammil
  56,   // 74 - Al-Muddaththir
  40,   // 75 - Al-Qiyama
  31,   // 76 - Al-Insan
  50,   // 77 - Al-Mursalat
  40,   // 78 - An-Naba'
  46,   // 79 - An-Nazi'at
  42,   // 80 - Abasa
  29,   // 81 - At-Takwir
  19,   // 82 - Al-Infitar
  36,   // 83 - Al-Mutaffifin
  25,   // 84 - Al-Inshiqaq
  22,   // 85 - Al-Buruj
  17,   // 86 - At-Tariq
  19,   // 87 - Al-A'la
  26,   // 88 - Al-Ghashiya
  30,   // 89 - Al-Fajr
  20,   // 90 - Al-Balad
  15,   // 91 - Ash-Shams
  21,   // 92 - Al-Lail
  11,   // 93 - Ad-Duha
  8,    // 94 - Ash-Sharh
  8,    // 95 - At-Tin
  19,   // 96 - Al-'Alaq
  5,    // 97 - Al-Qadr
  8,    // 98 - Al-Bayyina
  8,    // 99 - Az-Zalzala
  11,   // 100 - Al-'Adiyat
  11,   // 101 - Al-Qari'a
  8,    // 102 - At-Takathur
  3,    // 103 - Al-'Asr
  9,    // 104 - Al-Humaza
  5,    // 105 - Al-Fil
  4,    // 106 - Quraish
  7,    // 107 - Al-Ma'un
  3,    // 108 - Al-Kauthar
  6,    // 109 - Al-Kafirun
  3,    // 110 - An-Nasr
  5,    // 111 - Al-Masad
  4,    // 112 - Al-Ikhlas
  5,    // 113 - Al-Falaq
  6,    // 114 - An-Nas
] as const;

/**
 * Get the number of verses in a surah
 * @param surah - Surah number (1-114)
 * @returns Number of verses in the surah
 */
export function getVerseCount(surah: number): number {
  if (surah < 1 || surah > 114) {
    return 0;
  }
  return SURAH_VERSE_COUNTS[surah - 1];
}
