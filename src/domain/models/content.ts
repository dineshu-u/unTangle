export type AppLanguage = 'en' | 'ta';

export interface ContentItem {
  id: string;
  language: AppLanguage;
  script: 'latin' | 'tamil';
  letter: string;
  word: string;
  meaning: string;
  emoji?: string;
  pronunciation?: string;
  audio?: string;
  illustration?: string;
  creatureName?: string;
  difficulty: number;
  category?: 'animal' | 'nature' | 'home' | 'general';
  isRealWord: boolean;
  syllables: string[];
  distractors?: string[];
  tags?: string[];
}

export interface LetterItem {
  id: string;
  language: AppLanguage;
  letter: string;
  sound: string;
  creatureName: string;
  associatedWord: string;
  meaning: string;
  emoji: string;
  unlocked: boolean;
  difficulty: number;
}

export interface TeachMindyItem {
  id: string;
  language: AppLanguage;
  targetWord: string;
  sillyClaim: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    emoji: string;
    isCorrect: boolean;
  }[];
  meaning: string;
  difficulty: number;
}

export interface StoryCardItem {
  id: string;
  language: AppLanguage;
  title: string;
  illustration: string;
  sentences: string[];
  difficulty: number;
}
