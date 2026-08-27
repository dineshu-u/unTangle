import { ChildProgressState } from '../models/progress';
import { ActivityType } from '../models/learningEvent';
import { AppLanguage } from '../models/content';

export interface AdaptiveRecommendation {
  recommendedActivity: ActivityType;
  targetDomain: 'letter' | 'sound' | 'word' | 'rhythm' | 'festival';
  reasonEn: string;
  reasonTa: string;
  suggestedPromptEn: string;
  suggestedPromptTa: string;
}

export interface ParentObservationSummary {
  id: string;
  timestamp: string;
  domain: 'letter' | 'sound' | 'word' | 'rhythm';
  activity: string;
  noteEn: string;
  noteTa: string;
  type: 'strength' | 'observation' | 'recommendation';
}

export class AdaptiveEngine {
  /**
   * Deterministic adaptive activity recommendation based on recent interaction events.
   * Framework-independent (no React or UI dependencies).
   */
  public static recommendNextActivity(
    progress: ChildProgressState,
    _language: AppLanguage
  ): AdaptiveRecommendation {
    const recentEvents = progress.learningEvents.slice(0, 5);
    const retryCount = recentEvents.filter(e => e.outcome === 'retry').length;

    // Condition 1: Check if Mela festival should be visited (e.g. every 5 activities)
    if (progress.completedActivities > 0 && progress.completedActivities % 5 === 0) {
      return {
        recommendedActivity: 'village_mela',
        targetDomain: 'festival',
        reasonEn: 'Celebrating your 5-activity learning milestone under the sacred banyan tree!',
        reasonTa: 'ஆலமரத்தடியில் உங்கள் 5-செயல்பாட்டு கற்றல் சாதனையை கொண்டாடுவோம்!',
        suggestedPromptEn: 'The Village Mela is glowing with lights! Shall we visit the festival?',
        suggestedPromptTa: 'கிராமத்து மேளா விளக்குகளுடன் ஒளிர்கிறது! திருவிழாவுக்கு செல்லலாமா?',
      };
    }

    // Condition 2: If recent retries in Word Kite, adapt modality to rhythm breakdown (Pulse Path) or Teach Mindy
    if (retryCount >= 2) {
      return {
        recommendedActivity: 'pulse_path',
        targetDomain: 'rhythm',
        reasonEn: 'Switching modality to village drum rhythm to build syllable breakdown confidence.',
        reasonTa: 'அசை ஒலிகளை மெல்ல உணர்ந்து தாளத்தோடு பழக மத்தள பாதைக்கு செல்லலாம்.',
        suggestedPromptEn: 'Let us tap the village drum together to feel the word rhythms!',
        suggestedPromptTa: 'சொற்களின் தாளத்தை உணர கிராமத்து மத்தளத்தை சேர்ந்து தட்டுவோமா!',
      };
    }

    // Condition 3: If sound patterns score is lower than letter recognition score
    if (progress.domainScores.soundPatterns < progress.domainScores.letterRecognition - 15) {
      return {
        recommendedActivity: 'letter_garden',
        targetDomain: 'sound',
        reasonEn: 'Reinforcing letter-sound relationships through playful creature interactions.',
        reasonTa: 'விலங்கு உருவங்கள் வழியே எழுத்து ஒலிகளை மீண்டும் மகிழ்வோடு நினைவுகூருதல்.',
        suggestedPromptEn: "The friendly creatures in Letter Garden are eager to play!",
        suggestedPromptTa: 'எழுத்துத் தோட்டத்து நண்பர்கள் உங்களுடன் விளையாட காத்திருக்கிறார்கள்!',
      };
    }

    // Condition 4: High letter score -> practice word building (Word Kite)
    if (progress.domainScores.letterRecognition >= 70 && progress.domainScores.wordRecognition < 85) {
      return {
        recommendedActivity: 'word_kite',
        targetDomain: 'word',
        reasonEn: 'Solid letter recognition established; applying skills to word formation.',
        reasonTa: 'எழுத்து அறிவு சிறந்துள்ளது; புதிய சொற்களை அமைத்து பட்டம் பறக்க விடலாம்.',
        suggestedPromptEn: 'A gentle breeze is blowing! Shall we fly a word kite in the sky?',
        suggestedPromptTa: 'இனிய காற்று வீசுகிறது! புதிய சொற்களை சேர்த்து பட்டம் பறக்க விடுவோமா?',
      };
    }

    // Default: Role reversal in Teach Mindy
    return {
      recommendedActivity: 'teach_mindy',
      targetDomain: 'word',
      reasonEn: 'Strengthening comprehension through low-pressure role-reversal teaching.',
      reasonTa: 'மிண்டிக்கு சொல்லிக் கொடுக்கும் எளிய விளையாட்டு மூலம் தன்னம்பிக்கையை வளர்த்தல்.',
      suggestedPromptEn: 'Mindy made another silly mix-up! Can you help Mindy learn?',
      suggestedPromptTa: 'மிண்டி மீண்டும் வேடிக்கையான தவறு செய்துவிட்டது! நீங்கள் சொல்லிக் கொடுப்பீர்களா?',
    };
  }

  /**
   * Derives calm, non-alarming, structured parent observations from learning patterns.
   */
  public static deriveParentObservations(
    progress: ChildProgressState
  ): ParentObservationSummary[] {
    const list: ParentObservationSummary[] = [];

    if (progress.domainScores.wordRecognition >= 75) {
      list.push({
        id: 'p-obs-word',
        timestamp: 'Recent Sessions',
        domain: 'word',
        activity: 'Word Kite & Teach Mindy',
        noteEn: 'Demonstrates confident visual word identification when supported by creature cues.',
        noteTa: 'உருவப் படங்களுடன் இணைக்கும்போது சொற்களை மிக விரைவாக அடையாளம் காண்கிறார்.',
        type: 'strength',
      });
    }

    if (progress.domainScores.soundPatterns <= 60) {
      list.push({
        id: 'p-obs-sound',
        timestamp: 'Recent Sessions',
        domain: 'sound',
        activity: 'Pulse Path Village Drum',
        noteEn: 'Shows good rhythm engagement; benefits from breaking multi-syllable sounds into parts.',
        noteTa: 'தாள மத்தளத்தில் நல்ல ஆர்வம்; பல அசை சொற்களை மெல்ல பிரித்து ஒலிப்பது பயன் தருகிறது.',
        type: 'observation',
      });
    }

    list.push({
      id: 'p-obs-home',
      timestamp: 'Ongoing Practice',
      domain: 'letter',
      activity: 'Letter Garden',
      noteEn: 'Gentle tracing of curved letters in sand or textured surfaces supports tactile orientation.',
      noteTa: 'வளைவு அமைப்புகள் கொண்ட எழுத்துக்களுக்கு மென்மையான கூடுதல் தொடு-பயிற்சி பயன் தரும்.',
      type: 'recommendation',
    });

    return list;
  }
}
