import { LocalContentRepository } from '../src/domain/repositories/ContentRepository';

const repo = new LocalContentRepository();

console.log('=== LETTER GARDEN INTEGRITY TEST ===\n');

// 1. English letters
const enLetters = repo.getLetters('en');
console.log('Testing English Letters (Count:', enLetters.length, '):');
for (const item of enLetters) {
  const firstLetter = item.creatureName.trim()[0].toUpperCase();
  const targetLetter = item.letter.trim().toUpperCase();
  const matches = firstLetter === targetLetter;
  console.log(`  [${targetLetter}] -> ${item.creatureName} ${item.emoji} (Match: ${matches ? 'PASS' : 'FAIL'})`);
  if (!matches) {
    throw new Error(`Mismatch detected in English letter: ${targetLetter} vs ${item.creatureName}`);
  }
}

// 2. Tamil letters
const taLetters = repo.getLetters('ta');
console.log('\nTesting Tamil Letters (Count:', taLetters.length, '):');
for (const item of taLetters) {
  console.log(`  [${item.letter}] -> ${item.creatureName} ${item.emoji} (${item.sound})`);
  if (!item.creatureName || !item.letter || !item.emoji) {
    throw new Error(`Empty field in Tamil letter: ${item.id}`);
  }
}

console.log('\n=== ALL LETTER INTEGRITY TESTS PASSED! ===');
