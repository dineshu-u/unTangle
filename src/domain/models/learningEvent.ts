import { AppLanguage } from './content';

export type ActivityType = 
  | 'word_kite' 
  | 'letter_garden' 
  | 'teach_mindy' 
  | 'pulse_path' 
  | 'reading_lens' 
  | 'village_mela'
  | 'learning_garden';

export type LearningEventOutcome = 'success' | 'retry' | 'neutral';

export type LearningEventType =
  | 'word_correct'
  | 'word_incorrect'
  | 'letter_explored'
  | 'creature_matched'
  | 'mindy_taught'
  | 'rhythm_beat'
  | 'story_read'
  | 'activity_completed'
  | 'activity_retried'
  | 'level_completed'
  | 'level_retried';

export interface LearningEvent {
  id: string;
  childId: string;
  playerId?: string;
  levelId?: number;
  activityType: ActivityType;
  eventType: LearningEventType;
  contentId: string;
  timestamp: string;
  outcome: LearningEventOutcome;
  attemptCount: number;
  responseTimeMs?: number;
  language: AppLanguage;
  metadata?: Record<string, unknown>;
}
