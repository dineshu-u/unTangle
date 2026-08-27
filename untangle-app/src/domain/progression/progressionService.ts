import { ChildProgressState, WeatherState } from '../models/progress';
import { LearningEvent } from '../models/learningEvent';

export class ProgressionService {
  /**
   * Pure function: calculates next progress state from an incoming learning event.
   * Framework-independent (no React dependencies).
   */
  public static applyLearningEvent(
    prev: ChildProgressState,
    event: LearningEvent
  ): ChildProgressState {
    const isSuccess = event.outcome === 'success';

    // 1. Calculate Storm Progress & Weather Metaphor
    const stormDelta = isSuccess ? 6 : 2;
    const newStormProgress = Math.min(100, prev.stormProgress + stormDelta);

    let newWeather: WeatherState = prev.weatherState;
    if (newStormProgress >= 85) {
      newWeather = 'pongal_harvest';
    } else if (newStormProgress >= 50) {
      newWeather = 'storm_clearing';
    } else {
      newWeather = 'monsoon_magic';
    }

    // 2. Calculate Domain Scores
    const updatedScores = { ...prev.domainScores };
    if (event.activityType === 'letter_garden') {
      updatedScores.letterRecognition = Math.min(99, updatedScores.letterRecognition + (isSuccess ? 3 : 1));
    } else if (event.activityType === 'word_kite') {
      updatedScores.wordRecognition = Math.min(99, updatedScores.wordRecognition + (isSuccess ? 3 : 1));
      if (isSuccess) {
        updatedScores.readingFluency = Math.min(98, updatedScores.readingFluency + 2);
      }
    } else if (event.activityType === 'pulse_path') {
      updatedScores.soundPatterns = Math.min(99, updatedScores.soundPatterns + 3);
    } else if (event.activityType === 'reading_lens') {
      updatedScores.readingFluency = Math.min(98, updatedScores.readingFluency + 3);
      updatedScores.wordRecognition = Math.min(99, updatedScores.wordRecognition + 1);
    } else if (event.activityType === 'teach_mindy') {
      updatedScores.wordRecognition = Math.min(99, updatedScores.wordRecognition + (isSuccess ? 2 : 1));
    }

    // 3. Level & Milestone Progression
    const newActivities = prev.completedActivities + 1;
    let newLevel = prev.level;
    let levelTitleEn = prev.levelTitleEn;
    let levelTitleTa = prev.levelTitleTa;

    if (newActivities >= 25 && prev.level < 3) {
      newLevel = 3;
      levelTitleEn = 'Village Explorer';
      levelTitleTa = 'கிராமத்து வழிகாட்டி';
    } else if (newActivities >= 10 && prev.level < 2) {
      newLevel = 2;
      levelTitleEn = 'Sprout';
      levelTitleTa = 'முளை';
    }

    // 4. Track Practiced Content
    const practicedLetters = new Set(prev.practicedLetters);
    const practicedWords = new Set(prev.practicedWords);

    if (event.activityType === 'letter_garden' && event.contentId) {
      practicedLetters.add(event.contentId);
    }
    if (event.activityType === 'word_kite' && event.contentId) {
      practicedWords.add(event.contentId);
    }

    // 5. Append Learning Event to history (capped at last 100 for memory performance)
    const recentEvents = [event, ...prev.learningEvents].slice(0, 100);

    return {
      ...prev,
      level: newLevel,
      levelTitleEn,
      levelTitleTa,
      stormProgress: newStormProgress,
      weatherState: newWeather,
      completedActivities: newActivities,
      practiceTimeMinutes: prev.practiceTimeMinutes + (isSuccess ? 2 : 1),
      domainScores: updatedScores,
      practicedLetters: Array.from(practicedLetters),
      practicedWords: Array.from(practicedWords),
      learningEvents: recentEvents,
    };
  }
}
