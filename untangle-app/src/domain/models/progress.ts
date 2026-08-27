import { AppLanguage } from './content';
import { LearningEvent } from './learningEvent';

export type WeatherState = 'monsoon_magic' | 'storm_clearing' | 'pongal_harvest' | 'diwali_lights';

export interface LessonCardRecord {
  id: string;
  word: string;
  meaning: string;
  dateEarned: string;
  language: AppLanguage;
}

export interface VillageGift {
  id: string;
  levelUnlocked: number;
  nameEn: string;
  nameTa: string;
  emoji: string;
  dateEarned: string;
  stars: number;
}

export interface DomainScores {
  letterRecognition: number; // 0 - 100
  soundPatterns: number;     // 0 - 100
  wordRecognition: number;     // 0 - 100
  readingFluency: number;      // 0 - 100
}

export interface ChildProgressState {
  childId: string;
  childName: string;
  level: number;
  levelTitleEn: string;
  levelTitleTa: string;
  stormProgress: number; // 0 - 100%
  weatherState: WeatherState;
  wordsTaughtCount: number;
  practiceTimeMinutes: number;
  completedActivities: number;
  streakDays: number;
  domainScores: DomainScores;
  unlockedLocations: string[];
  practicedLetters: string[];
  practicedWords: string[];
  lessonCards: LessonCardRecord[];
  unlockedGifts: VillageGift[];
  learningEvents: LearningEvent[];
}
