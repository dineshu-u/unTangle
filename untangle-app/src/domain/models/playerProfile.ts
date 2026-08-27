import { AppLanguage } from './content';

export interface RecentMistake {
  word: string;
  pattern?: string;
  timestamp: string;
}

export interface RecentSuccess {
  word: string;
  timestamp: string;
}

export interface PlayerLearningProfile {
  playerId: string;
  playerName: string;
  avatar: string;
  language: AppLanguage;
  currentLevel: number;
  difficulty: number; // 1 = Easy (short 2-3 letter words), 2 = Medium (3-4 letter words), 3 = Advanced
  wordsSeen: string[];
  wordsMastered: string[];
  wordsPracticed: string[];
  wordsNeedingPractice: string[];
  recentSuccessRate: number; // 0.0 to 1.0
  recentErrors: RecentMistake[];
  recentSuccesses: RecentSuccess[];
  learningPatterns: Record<string, number>; // e.g. { "ம": 0.4, "T": 0.95 } (accuracy by phoneme/letter)
  generatedContentIds: string[];
  lastUpdated: string;
}

export interface LearningSummary {
  playerId: string;
  language: AppLanguage;
  currentLevel: number;
  difficulty: number;
  wordsPracticedCount: number;
  wordsMasteredCount: number;
  wordsNeedingPractice: string[];
  recentSuccessRate: number;
  recentMistakes: { word: string; pattern?: string }[];
  recentContentIds: string[];
}

export interface ContentGenerationConstraints {
  language: AppLanguage;
  difficulty: number;
  minWordLength: number;
  maxWordLength: number;
  targetPatterns: string[];
  wordsToAvoid: string[];
  wordsForReinforcement: string[];
  numberOfWords: number;
}
