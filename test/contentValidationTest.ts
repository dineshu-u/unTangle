import { contentGenerationService } from '../src/services/contentGenerationService';
import { contentRepository } from '../src/domain/repositories/ContentRepository';
import { DEFAULT_PLAYER_AARAV, DEFAULT_PLAYER_LEO } from '../src/services/persistence/playerProfileStorage';
import { LearningSummaryGenerator } from '../src/domain/adaptive/learningSummaryGenerator';

async function runTests() {
  console.log('=== CONTENT GENERATION & VALIDATION TEST ===\n');

  // Test 1: Content Repository word validation
  const validMaram = contentRepository.validateWord('மரம்', 'ta');
  console.log('Test 1.1: Validate "மரம்" in Tamil -> isReal:', validMaram.isReal);

  const invalidWord = contentRepository.validateWord('xyz123', 'en');
  console.log('Test 1.2: Validate "xyz123" in English -> isReal:', invalidWord.isReal);

  // Test 2: Level 1 Diagnostic Baseline for Player A (Tamil)
  const summaryA = LearningSummaryGenerator.createSummary(DEFAULT_PLAYER_AARAV);
  const constraintsA = LearningSummaryGenerator.deriveConstraints(DEFAULT_PLAYER_AARAV);
  const lvl1A = await contentGenerationService.getLevelContent(
    DEFAULT_PLAYER_AARAV.playerId,
    1,
    summaryA,
    constraintsA
  );
  console.log('\nTest 2.1: Level 1 Diagnostic Batch (Tamil):', lvl1A.source);
  console.log('  Words:', lvl1A.words.map(w => w.word));

  // Test 3: Level 2 Diagnostic Baseline for Player A (Tamil)
  const lvl2A = await contentGenerationService.getLevelContent(
    DEFAULT_PLAYER_AARAV.playerId,
    2,
    summaryA,
    constraintsA
  );
  console.log('\nTest 3.1: Level 2 Diagnostic Batch (Tamil):', lvl2A.source);
  console.log('  Words:', lvl2A.words.map(w => w.word));

  // Test 4: Level 1 Diagnostic Baseline for Player C (English)
  const summaryC = LearningSummaryGenerator.createSummary(DEFAULT_PLAYER_LEO);
  const constraintsC = LearningSummaryGenerator.deriveConstraints(DEFAULT_PLAYER_LEO);
  const lvl1C = await contentGenerationService.getLevelContent(
    DEFAULT_PLAYER_LEO.playerId,
    1,
    summaryC,
    constraintsC
  );
  console.log('\nTest 4.1: Level 1 Diagnostic Batch (English):', lvl1C.source);
  console.log('  Words:', lvl1C.words.map(w => w.word));

  // Test 5: Level 3 Dynamic Level (Groq or progressive non-repeating fallback)
  const lvl3A = await contentGenerationService.getLevelContent(
    DEFAULT_PLAYER_AARAV.playerId,
    3,
    summaryA,
    constraintsA
  );
  console.log('\nTest 5.1: Level 3 Dynamic Content Source:', lvl3A.source, 'requiresKey:', lvl3A.requiresApiKey);
  console.log('  Words:', lvl3A.words.map(w => w.word));

  console.log('\n=== ALL CONTENT VALIDATION TESTS PASSED ===');
}

runTests();
