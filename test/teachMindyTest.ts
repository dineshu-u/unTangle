import { TeachMindyService, REALISTIC_TEACH_MINDY_EN, REALISTIC_TEACH_MINDY_TA } from '../src/services/teachMindyService';

console.log('=== TEACH MINDY REALISTIC AI & SHUFFLE TEST ===\n');

// 1. Check realistic bank sizes
console.log(`Realistic English Teach Mindy items: ${REALISTIC_TEACH_MINDY_EN.length}`);
console.log(`Realistic Tamil Teach Mindy items: ${REALISTIC_TEACH_MINDY_TA.length}`);

if (REALISTIC_TEACH_MINDY_EN.length < 20 || REALISTIC_TEACH_MINDY_TA.length < 20) {
  throw new Error('Realistic Teach Mindy library must have at least 20 items per language');
}

// 2. Verify NO repetitive demo strings (check that "funny quacking duck" / "குரங்கு போல் தாவும்" isn't repeated on everything)
let duckCountEn = 0;
for (const item of REALISTIC_TEACH_MINDY_EN) {
  if (item.sillyClaim.toLowerCase().includes('quacking duck') && item.targetWord !== 'DUCK') {
    duckCountEn++;
  }
}
console.log(`Non-duck words with "quacking duck" silly claim in English: ${duckCountEn} (must be 0)`);
if (duckCountEn > 0) {
  throw new Error('Repetitive demo duck string found in non-duck items!');
}

let monkeyCountTa = 0;
for (const item of REALISTIC_TEACH_MINDY_TA) {
  const monkeyOpts = item.options.filter(o => o.label.includes('குரங்கு போல் தாவும்'));
  if (monkeyOpts.length > 0) monkeyCountTa++;
}
console.log(`Items with demo "குரங்கு போல் தாவும்" option in Tamil: ${monkeyCountTa} (must be 0)`);
if (monkeyCountTa > 0) {
  throw new Error('Repetitive demo monkey option found in Tamil items!');
}

// 3. CRITICAL VERIFICATION: Are answers always the first option?
console.log('\nTesting Option Shuffling & Randomization across 100 question loads...');
const positionDistribution = [0, 0, 0];

for (let i = 0; i < 100; i++) {
  const scenarios = TeachMindyService.getInitialScenarios('en');
  const firstScenario = scenarios[0];
  const correctIndex = firstScenario.options.findIndex(o => o.isCorrect);
  if (correctIndex < 0) {
    throw new Error('No correct option found in scenario');
  }
  positionDistribution[correctIndex]++;
}

console.log(`Correct Answer Position Distribution (out of 100 rounds):`);
console.log(`  Position 0 (First option):  ${positionDistribution[0]}%`);
console.log(`  Position 1 (Middle option): ${positionDistribution[1]}%`);
console.log(`  Position 2 (Last option):   ${positionDistribution[2]}%`);

// If options were not shuffled, position 0 would be 100% and positions 1 & 2 would be 0%.
if (positionDistribution[0] === 100 || positionDistribution[1] === 0 || positionDistribution[2] === 0) {
  throw new Error('FAILURE: Options are not properly shuffled! Answers are still always the first option!');
}
console.log('PASS: Correct answers are well-distributed across positions 0, 1, and 2! Not always first option!');

// 4. Test Zero Word Repetition
console.log('\nTesting Word Non-Repetition across 10 rounds...');
const seenWords = new Set<string>();
const testScenarios = TeachMindyService.getInitialScenarios('en');
for (let i = 0; i < Math.min(10, testScenarios.length); i++) {
  const word = testScenarios[i].targetWord;
  if (seenWords.has(word)) {
    throw new Error(`Word repetition detected: ${word} was repeated!`);
  }
  seenWords.add(word);
}
console.log(`Seen 10 unique words: ${Array.from(seenWords).join(', ')}`);
console.log('PASS: Zero word repetition verified!');

console.log('\n=== ALL TEACH MINDY VERIFICATION TESTS PASSED! ===');
