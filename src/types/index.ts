export type Language = 'en' | 'ta';

export type MindyMood = 
  | 'idle' 
  | 'happy' 
  | 'thinking' 
  | 'confused' 
  | 'surprised' 
  | 'speaking' 
  | 'celebrating' 
  | 'encouraging';

export type SoundStormWeather = 'monsoon_magic' | 'storm_clearing' | 'pongal_harvest' | 'diwali_lights';

export interface LessonCard {
  id: string;
  wordEn: string;
  wordTa: string;
  meaningEn: string;
  meaningTa: string;
  dateEarned: string;
}

export interface CreatureItem {
  id: string;
  letterEn: string;
  letterTa: string;
  letterSoundEn: string;
  letterSoundTa: string;
  nameEn: string;
  nameTa: string;
  wordEn: string;
  wordTa: string;
  meaningEn: string;
  meaningTa: string;
  emoji: string;
  bgGradient: string;
  unlocked: boolean;
}

export interface ScreeningObservation {
  id: string;
  timestamp: string;
  domain: 'letter' | 'sound' | 'word' | 'rhythm';
  activity: string;
  noteEn: string;
  noteTa: string;
  type: 'strength' | 'observation' | 'recommendation';
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  levelTitleEn: string;
  levelTitleTa: string;
  stormProgress: number; // 0 - 100%
  weatherState: SoundStormWeather;
  wordsTaughtToMindy: number;
  practiceTimeMinutes: number;
  completedActivities: number;
  streakDays: number;
  letterRecognitionScore: number;
  soundPatternsScore: number;
  wordRecognitionScore: number;
  readingFluencyScore: number;
  unlockedCreatures: string[];
  lessonCards: LessonCard[];
  observations: ScreeningObservation[];
}

export interface WordKitePuzzle {
  id: string;
  targetWordEn: string;
  targetWordTa: string;
  meaningEn: string;
  meaningTa: string;
  syllablesTa: string[];
  syllablesEn: string[];
  distractorsTa: string[];
  distractorsEn: string[];
  emoji: string;
}

export interface ReadingStoryCard {
  id: string;
  titleEn: string;
  titleTa: string;
  contentEn: string[];
  contentTa: string[];
  illustration: string;
}

export interface FamilyVoiceNote {
  id: string;
  speakerEn: string;
  speakerTa: string;
  titleEn: string;
  titleTa: string;
  messageEn: string;
  messageTa: string;
  dateRecorded: string;
  audioBlobUrl?: string;
  isPreRecorded?: boolean;
}
