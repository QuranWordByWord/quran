#!/usr/bin/env node

/**
 * Script to parse English translations and generate color-coded parts
 * that MATCH the Arabic word's type/color.
 *
 * CORE PRINCIPLE: Arabic rules come FIRST
 * - Look at what the Arabic word contains
 * - English coloring must match Arabic coloring
 * - Count of English prepositions should match count of Arabic preposition parts
 *
 * Rules:
 * 1. Parenthetical text () - ALWAYS grey (implied words not in Arabic)
 * 2. Simple Arabic word (no arabicParts) - ALL English words get the Arabic type
 * 3. Compound Arabic word (has arabicParts):
 *    - Count Arabic preposition parts
 *    - First N English prepositions get cyan (where N = Arabic preposition count)
 *    - Remaining English words get the Arabic content type
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common English prepositions/articles that might map to Arabic prepositions
const ENGLISH_PREPOSITIONS = new Set([
  'in', 'on', 'at', 'to', 'for', 'from', 'by', 'with', 'of', 'and', 'or',
  'the', 'a', 'an', 'not', 'no', 'nor'
]);

/**
 * Count Arabic preposition parts
 */
function countArabicPrepositions(arabicParts) {
  if (!arabicParts || arabicParts.length === 0) return 0;
  return arabicParts.filter(part => part.type === 'preposition').length;
}

/**
 * Get the main content type from Arabic parts (non-preposition type)
 */
function getArabicContentType(arabicParts) {
  if (!arabicParts || arabicParts.length === 0) return null;
  const contentPart = arabicParts.find(part => part.type !== 'preposition');
  return contentPart ? contentPart.type : arabicParts[0].type;
}

/**
 * Parse English translation with position-aware preposition matching
 */
function parseEnglishTranslation(english, arabicWordType, arabicParts) {
  if (!english || typeof english !== 'string') {
    return null;
  }

  // First pass: tokenize everything
  const tokens = [];
  const regex = /(\([^)]+\))|(\[[^\]]+\])|([a-zA-Z'-]+)|([^\s\w\(\)\[\]])/g;
  let match;

  while ((match = regex.exec(english)) !== null) {
    const token = match[0];

    if (token.startsWith('(') && token.endsWith(')')) {
      tokens.push({ text: token, isParen: true });
    } else if (token.startsWith('[') && token.endsWith(']')) {
      tokens.push({ text: token, isBracket: true });
    } else if (/^[a-zA-Z'-]+$/.test(token)) {
      tokens.push({ text: token, isWord: true });
    } else {
      tokens.push({ text: token, isPunctuation: true });
    }
  }

  // Calculate how many English prepositions to color as cyan
  const arabicPrepCount = countArabicPrepositions(arabicParts);
  const arabicContentType = getArabicContentType(arabicParts);
  const isSimpleArabic = !arabicParts || arabicParts.length === 0;

  // Second pass: assign types with preposition counting
  let prepCountUsed = 0;
  const parts = [];

  for (const token of tokens) {
    if (token.isParen) {
      // Parenthetical - always grey
      parts.push({ text: token.text, type: 'paren' });
    } else if (token.isBracket) {
      // Brackets
      const content = token.text.slice(1, -1);
      parts.push({ text: '[', type: 'bracket' });
      parts.push({ text: content, type: isSimpleArabic ? arabicWordType : (arabicContentType || arabicWordType) });
      parts.push({ text: ']', type: 'bracket' });
    } else if (token.isWord) {
      const lower = token.text.toLowerCase();
      const isEnglishPrep = ENGLISH_PREPOSITIONS.has(lower);

      if (isSimpleArabic) {
        // Simple Arabic word - all English words inherit Arabic type
        parts.push({ text: token.text, type: arabicWordType });
      } else if (isEnglishPrep && prepCountUsed < arabicPrepCount) {
        // This English preposition matches an Arabic preposition
        parts.push({ text: token.text, type: 'preposition' });
        prepCountUsed++;
      } else {
        // Content word - use Arabic content type
        parts.push({ text: token.text, type: arabicContentType || arabicWordType });
      }
    } else if (token.isPunctuation) {
      parts.push({ text: token.text, type: 'punctuation' });
    }
  }

  // Add spaces between parts
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    result.push(parts[i]);
    if (i < parts.length - 1) {
      const next = parts[i + 1];
      const curr = parts[i];
      if (next.text !== ']' && curr.text !== '[' &&
          !/^[.,;:!?]$/.test(next.text) &&
          !/^[.,;:!?]$/.test(curr.text)) {
        result.push({ text: ' ', type: 'space' });
      }
    }
  }

  return result.filter(p => p.text);
}

/**
 * Process a single surah JSON file
 */
function processSurah(surahPath) {
  const data = JSON.parse(fs.readFileSync(surahPath, 'utf8'));
  let modified = false;

  for (const verse of data.verses) {
    for (const word of verse.words) {
      const englishParts = parseEnglishTranslation(
        word.english,
        word.type,
        word.arabicParts
      );

      if (englishParts && englishParts.length > 0) {
        word.englishParts = englishParts;
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(surahPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated: ${path.basename(surahPath)}`);
  }

  return data;
}

/**
 * Main function
 */
function main() {
  const dataDir = path.join(__dirname, '../public/data/surah');

  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.json') && /^\d+\.json$/.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));

  console.log(`Found ${files.length} surah files to process...\n`);

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      processSurah(filePath);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log('\nDone!');
}

main();
