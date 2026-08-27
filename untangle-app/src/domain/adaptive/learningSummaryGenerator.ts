import { PlayerLearningProfile, LearningSummary, ContentGenerationConstraints } from '../models/playerProfile';

export class LearningSummaryGenerator {
  public static createSummary(profile: PlayerLearningProfile): LearningSummary {
    return {
      playerId: profile.playerId,
      language: profile.language,
      currentLevel: profile.currentLevel,
      difficulty: profile.difficulty,
      wordsPracticedCount: profile.wordsPracticed.length,
      wordsMasteredCount: profile.wordsMastered.length,
      wordsNeedingPractice: [...profile.wordsNeedingPractice],
      recentSuccessRate: profile.recentSuccessRate,
      recentMistakes: profile.recentErrors.slice(-5).map(e => ({ word: e.word, pattern: e.pattern })),
      recentContentIds: profile.generatedContentIds.slice(-10),
    };
  }

  public static deriveConstraints(profile: PlayerLearningProfile): ContentGenerationConstraints {
    // 1. Determine Difficulty Level deterministically
    let targetDifficulty = profile.difficulty;
    if (profile.recentSuccessRate >= 0.85 && profile.wordsMastered.length >= 3) {
      targetDifficulty = Math.min(3, profile.difficulty + 1);
    } else if (profile.recentSuccessRate < 0.60 && profile.difficulty > 1) {
      targetDifficulty = Math.max(1, profile.difficulty - 1);
    }

    // 2. Determine Word Lengths based on target difficulty
    let minLen = 3;
    let maxLen = 3;
    if (targetDifficulty === 2) {
      minLen = 3;
      maxLen = 4;
    } else if (targetDifficulty === 3) {
      minLen = 4;
      maxLen = 5;
    }

    // 3. Target Patterns needing reinforcement
    const weakPatterns: string[] = [];
    Object.entries(profile.learningPatterns).forEach(([pattern, acc]) => {
      if (acc < 0.65) {
        weakPatterns.push(pattern);
      }
    });

    profile.recentErrors.forEach(err => {
      if (err.pattern && !weakPatterns.includes(err.pattern)) {
        weakPatterns.push(err.pattern);
      }
    });

    // 4. Words for Reinforcement vs Words to Avoid
    const wordsForReinforcement = profile.wordsNeedingPractice.slice(0, 2);
    // Avoid words that have already been mastered recently
    const wordsToAvoid = profile.wordsMastered.slice(-6);

    return {
      language: profile.language,
      difficulty: targetDifficulty,
      minWordLength: minLen,
      maxWordLength: maxLen,
      targetPatterns: weakPatterns.slice(0, 3),
      wordsToAvoid,
      wordsForReinforcement,
      numberOfWords: 5,
    };
  }
}
