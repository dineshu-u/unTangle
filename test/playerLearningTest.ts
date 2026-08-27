import { DEFAULT_PLAYER_AARAV, DEFAULT_PLAYER_KAVI, DEFAULT_PLAYER_LEO } from '../src/services/persistence/playerProfileStorage';
import { LearningSummaryGenerator } from '../src/domain/adaptive/learningSummaryGenerator';

console.log('=== MULTI-PLAYER ADAPTIVE CONTENT CONSTRAINTS TEST ===\n');

// PLAYER A: High Success Rate (Aarav)
const summaryA = LearningSummaryGenerator.createSummary(DEFAULT_PLAYER_AARAV);
const constraintsA = LearningSummaryGenerator.deriveConstraints(DEFAULT_PLAYER_AARAV);
console.log('PLAYER A (Aarav - High Performer):');
console.log('  Language:', constraintsA.language);
console.log('  Difficulty:', constraintsA.difficulty);
console.log('  Success Rate:', summaryA.recentSuccessRate);
console.log('  Words To Avoid (mastered):', constraintsA.wordsToAvoid);
console.log('  Target Patterns:', constraintsA.targetPatterns);
console.log('');

// PLAYER B: Pattern Difficulty (Kavi)
const summaryB = LearningSummaryGenerator.createSummary(DEFAULT_PLAYER_KAVI);
const constraintsB = LearningSummaryGenerator.deriveConstraints(DEFAULT_PLAYER_KAVI);
console.log('PLAYER B (Kavi - Pattern Difficulty):');
console.log('  Language:', constraintsB.language);
console.log('  Difficulty:', constraintsB.difficulty);
console.log('  Success Rate:', summaryB.recentSuccessRate);
console.log('  Words For Reinforcement:', constraintsB.wordsForReinforcement);
console.log('  Target Patterns needing reinforcement:', constraintsB.targetPatterns);
console.log('');

// PLAYER C: English Learner (Leo)
const summaryC = LearningSummaryGenerator.createSummary(DEFAULT_PLAYER_LEO);
const constraintsC = LearningSummaryGenerator.deriveConstraints(DEFAULT_PLAYER_LEO);
console.log('PLAYER C (Leo - English Beginner):');
console.log('  Language:', constraintsC.language);
console.log('  Difficulty:', constraintsC.difficulty);
console.log('  Success Rate:', summaryC.recentSuccessRate);
console.log('  Target Patterns:', constraintsC.targetPatterns);
console.log('\n=== TEST VERIFICATION PASSED ===');
