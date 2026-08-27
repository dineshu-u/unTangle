import { LetterGardenService, FALLBACK_DISCOVERY_EN, FALLBACK_DISCOVERY_TA } from '../src/services/letterGardenService';
import { LocalContentRepository } from '../src/domain/repositories/ContentRepository';

const repo = new LocalContentRepository();

console.log('=== UNLIMITED LETTER GARDEN DISCOVERY TEST ===\n');

// 1. Check fallback bank sizes
console.log(`Fallback Discovery EN count: ${FALLBACK_DISCOVERY_EN.length}`);
console.log(`Fallback Discovery TA count: ${FALLBACK_DISCOVERY_TA.length}`);

if (FALLBACK_DISCOVERY_EN.length < 20 || FALLBACK_DISCOVERY_TA.length < 20) {
  throw new Error('Fallback discovery bank should have at least 20 items per language');
}

// 2. Validate all fallback English items for phonetic consistency
for (const item of FALLBACK_DISCOVERY_EN) {
  const firstLetter = item.creatureName.trim()[0].toUpperCase();
  const targetLetter = item.letter.trim().toUpperCase();
  if (firstLetter !== targetLetter) {
    throw new Error(`English fallback item mismatch: ${targetLetter} vs ${item.creatureName}`);
  }
}
console.log('English fallback phonetics: ALL 100% MATCH!');

// 3. Test progressive discovery beyond 16
const baseEn = repo.getLetters('en');
console.log(`Base English items: ${baseEn.length}`);

// Mock localStorage in Node
const mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
  }
};

async function testDiscoveryProgression() {
  // Initial: 4 items
  let unlocked = LetterGardenService.getUnlockedCreatures('en', baseEn);
  console.log(`Stage 1 initial count: ${unlocked.length}`);
  if (unlocked.length !== 4) throw new Error('Stage 1 must have 4 items');

  // Discover to 8
  let res = await LetterGardenService.discoverMoreCreatures('en', baseEn);
  console.log(`Stage 2 count: ${res.allItems.length} (source: ${res.source})`);

  // Discover to 12
  res = await LetterGardenService.discoverMoreCreatures('en', baseEn);
  console.log(`Stage 3 count: ${res.allItems.length} (source: ${res.source})`);

  // Discover to 16
  res = await LetterGardenService.discoverMoreCreatures('en', baseEn);
  console.log(`Stage 4 count: ${res.allItems.length} (source: ${res.source})`);

  // CRUCIAL: Discover BEYOND 16 (Stage 5 -> 20 items!)
  res = await LetterGardenService.discoverMoreCreatures('en', baseEn);
  console.log(`Stage 5 count (BEYOND 16!): ${res.allItems.length} (source: ${res.source})`);
  if (res.allItems.length !== 20) {
    throw new Error(`Expected 20 items at Stage 5, got ${res.allItems.length}`);
  }

  // Discover to 24 (Stage 6)
  res = await LetterGardenService.discoverMoreCreatures('en', baseEn);
  console.log(`Stage 6 count: ${res.allItems.length} (source: ${res.source})`);
  if (res.allItems.length !== 24) {
    throw new Error(`Expected 24 items at Stage 6, got ${res.allItems.length}`);
  }

  // Discover to 28 (Stage 7)
  res = await LetterGardenService.discoverMoreCreatures('en', baseEn);
  console.log(`Stage 7 count: ${res.allItems.length} (source: ${res.source})`);
  if (res.allItems.length !== 28) {
    throw new Error(`Expected 28 items at Stage 7, got ${res.allItems.length}`);
  }

  console.log('\n=== UNLIMITED DISCOVERY TEST PASSED: 16 LIMIT SUCCESSFULLY REMOVED! ===');
}

testDiscoveryProgression();
