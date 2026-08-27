import { AppLanguage } from './content';
import { ActivityType, LearningEventOutcome } from './learningEvent';

export type MindyEmotion = 
  | 'happy' 
  | 'excited' 
  | 'confused' 
  | 'thinking' 
  | 'encouraging' 
  | 'celebrating' 
  | 'curious';

export type MindySuggestedAction = 
  | 'continue' 
  | 'retry' 
  | 'explore' 
  | 'practice' 
  | 'teach_mindy' 
  | 'word_kite' 
  | 'letter_garden' 
  | 'mela';

export interface MindyRequest {
  language: AppLanguage;
  activityType: ActivityType;
  contentId: string;
  outcome: LearningEventOutcome;
  context?: {
    emotion?: MindyEmotion;
    childName?: string;
    word?: string;
    letter?: string;
  };
}

export interface MindyResponse {
  message: string;
  emotion: MindyEmotion;
  suggestedAction: MindySuggestedAction;
}
