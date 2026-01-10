# Implementation Plan: Integrate @digitalkhatt/quran-engine into Mushaf View

## Overview
Replace `misraj-mushaf-renderer` with `@digitalkhatt/quran-engine` for the Mushaf view while preserving all existing functionality (audio, bookmarks, navigation, mobile responsiveness, view switching).

**Primary Layout:** IndoPak 15-line (848 pages)
**Supported Layouts:** IndoPak 15-line, Old Madinah (604 pages), New Madinah (604 pages)
**Audio Integration:** Use engine's verse mapping

---

## Phase 1: Asset Setup

### 1.1 Copy Assets from digitalkhatt-react to public folder
Create directories and copy:
```
public/
  fonts/
    indopak15.otf       <- from digitalkhatt-react/public/fonts/
    newmadinah.otf      <- from digitalkhatt-react/public/fonts/
    oldmadinah.otf      <- from digitalkhatt-react/public/fonts/
  wasm/
    hb.wasm             <- from digitalkhatt-react/public/wasm/
```

### 1.2 Copy Quran Text Data
Create `src/data/` directory and copy:
- `quran_text_indopak_15.ts` (848 pages)
- `quran_text_madina.ts` (604 pages)
- `quran_text_old_madinah.ts` (604 pages)

From: `digitalkhatt-react/src/lib/data/`

---

## Phase 2: Configuration Updates

### 2.1 Add types in `src/config/types.ts`
```typescript
export type MushafLayoutType = 'indoPak15' | 'newMadinah' | 'oldMadinah';

export interface MushafLayoutConfig {
  id: MushafLayoutType;
  name: string;
  totalPages: number;
  fontFile: string;
}
```

### 2.2 Add layout configs in `src/config/constants.ts`
```typescript
export const MUSHAF_LAYOUTS: Record<MushafLayoutType, MushafLayoutConfig> = {
  indoPak15: { id: 'indoPak15', name: 'IndoPak 15-Line', totalPages: 848, fontFile: '/fonts/indopak15.otf' },
  newMadinah: { id: 'newMadinah', name: 'Madinah (Modern)', totalPages: 604, fontFile: '/fonts/newmadinah.otf' },
  oldMadinah: { id: 'oldMadinah', name: 'Madinah (Classic)', totalPages: 604, fontFile: '/fonts/oldmadinah.otf' },
};
export const DEFAULT_MUSHAF_LAYOUT: MushafLayoutType = 'indoPak15';
```

---

## Phase 3: Create QuranEngine Provider

### 3.1 Create `src/contexts/QuranEngineContext.tsx`
- Wrap `QuranProvider` from `@digitalkhatt/quran-engine/react`
- Configure WASM URL: `/quran/wasm/hb.wasm` (includes base path)
- Configure font URLs for all three layouts
- Import and provide all three quran text datasets
- Export `useDigitalKhatt` hook for components

---

## Phase 4: Update Settings Context

### 4.1 Modify `src/contexts/SettingsContext.tsx`
Add to AppSettings interface:
- `mushafLayout: MushafLayoutType`

Add functions:
- `setMushafLayout(layout: MushafLayoutType)`
- `availableMushafLayouts` getter

Update localStorage persistence to include layout preference.

---

## Phase 5: Create New Mushaf Component

### 5.1 Create `src/components/QuranEngineMushafView.tsx`

**Preserves from existing RendererMushafView:**
- Desktop navigation arrows (left/right)
- Mobile navigation buttons (prev/next/page indicator)
- Mobile scaling (useMobileScale hook)
- Decorative border for mobile
- Loading states
- AudioPlayer integration
- Bookmark button integration
- Theme support (CSS variables)
- highlightedVerseKey from SettingsContext

**New implementation using quran-engine:**
- Use `QuranPage` component from engine
- Map `mushafLayout` setting to engine's `layoutType` prop
- Handle word clicks via `onWordClick`:
  - Get surah/ayah from `WordClickInfo`
  - Check if verse marker (Arabic numerals) → highlight + play verse
  - Otherwise → clear highlight + play word audio
- Convert `highlightedVerseKey` to `highlightedVerses` array format
- Handle page navigation with layout-specific total pages

**Audio URL mapping:**
```typescript
// Word audio: wbw/{chapter}_{verse}_{position}.mp3
// Use verseMapping to count word position within verse
const paddedChapter = String(surah).padStart(3, '0');
const paddedVerse = String(ayah).padStart(3, '0');
const paddedPosition = String(wordPosition).padStart(3, '0');
const audioUrl = `wbw/${paddedChapter}_${paddedVerse}_${paddedPosition}.mp3`;
```

---

## Phase 6: Update App.tsx

### 6.1 Add QuranEngineProvider wrapper
Wrap inside SettingsProvider/BookmarkProvider:
```tsx
<QuranEngineProvider>
  <ToastProvider>
    <AppContent />
  </ToastProvider>
</QuranEngineProvider>
```

### 6.2 Replace MushafPageView import
Change from `RendererMushafView` to `QuranEngineMushafView`

### 6.3 Import CSS styles
```typescript
import '@digitalkhatt/quran-engine/styles/quran-renderer.css';
```

---

## Phase 7: Add Layout Selector (Optional but recommended)

### 7.1 Create `src/components/MushafLayoutSelector.tsx`
- Toggle buttons for layout selection
- Uses `setMushafLayout` from settings context
- Add to Header or Settings menu

---

## Phase 8: Page Conversion Utilities

### 8.1 Update `src/utils/pageToSurah.ts`
Add function to convert page numbers between layouts when switching:
```typescript
function convertPageBetweenMushafLayouts(page, fromLayout, toLayout): number
```
Use proportional conversion or surah-based mapping.

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add QuranEngineProvider, replace MushafPageView, add CSS import |
| `src/contexts/SettingsContext.tsx` | Add mushafLayout state and setter |
| `src/config/constants.ts` | Add MUSHAF_LAYOUTS config |
| `src/components/RendererMushafView.tsx` | Keep as reference, create new component |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/QuranEngineContext.tsx` | Engine provider wrapper |
| `src/components/QuranEngineMushafView.tsx` | New mushaf view component |
| `src/components/MushafLayoutSelector.tsx` | Layout toggle UI |
| `src/data/quran_text_*.ts` | Quran text data (copied) |

---

## Verification Steps

1. **Build Check:** Run `npm run build` - no TypeScript errors
2. **Engine Load:** Verify WASM loads without errors in console
3. **Page Render:** All three layouts render correctly
4. **Word Audio:** Click word → correct audio URL plays
5. **Verse Audio:** Click verse marker → verse highlights + audio plays
6. **Navigation:** Page arrows work, respects layout's total pages
7. **Layout Switch:** Changing layout re-renders with new style
8. **View Switch:** Mushaf ↔ Word-by-word preserves context
9. **Mobile:** Proper scaling on mobile devices
10. **Theme:** Light/dark themes apply correctly
11. **Bookmarks:** Bookmark button functional

---

## Potential Issues & Solutions

1. **Bundle Size:** Text data files are large (~1MB each)
   - Solution: Could lazy-load text data via URL if needed

2. **Different Page Counts:** IndoPak (848) vs Madinah (604)
   - Solution: Proportional page conversion when switching layouts

3. **WASM Load Time:** First load may be slow
   - Solution: Show loading spinner, consider preloading

4. **Audio Word Position:** Engine gives line/word indices, need verse position
   - Solution: Use `verseMapping.wordToVerse` to find verse, count position within verse
