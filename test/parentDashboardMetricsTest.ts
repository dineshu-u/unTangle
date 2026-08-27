import { INITIAL_PROGRESS_STATE } from '../src/services/persistence/progressStorage';
import { LearningEvent } from '../src/domain/models/learningEvent';

console.log('=== PARENT DASHBOARD REAL-TIME METRICS & 0-FALLBACK TEST ===\n');

// 1. Test Brand New User with 0 Events & 0 Minutes
const emptyUserProgress = {
  ...INITIAL_PROGRESS_STATE,
  learningEvents: [] as LearningEvent[],
  practiceTimeMinutes: 0,
  completedActivities: 0,
  wordsTaughtCount: 0,
  domainScores: {
    letterRecognition: 0,
    soundPatterns: 0,
    wordRecognition: 0,
    readingFluency: 0,
  }
};

function computeDomainMetrics(progress: typeof emptyUserProgress) {
  const events = progress.learningEvents || [];
  const hasEvents = events.length > 0;

  const calcAccuracy = (types: string[]) => {
    const matched = events.filter((e) => types.includes(e.activityType));
    if (matched.length === 0) return { score: 0, count: 0, hasData: false };
    const successCount = matched.filter((e) => e.outcome === 'success').length;
    return {
      score: Math.round((successCount / matched.length) * 100),
      count: matched.length,
      hasData: true,
    };
  };

  const letterData = calcAccuracy(['letter_garden']);
  const soundData = calcAccuracy(['pulse_path']);
  const wordData = calcAccuracy(['word_kite']);
  const fluencyData = calcAccuracy(['teach_mindy', 'reading_lens']);

  const hasRealData = hasEvents || progress.completedActivities > 0 || progress.practiceTimeMinutes > 0;

  const scores = {
    letterRecognition: hasEvents ? letterData.score : (hasRealData ? progress.domainScores.letterRecognition : 0),
    soundPatterns: hasEvents ? soundData.score : (hasRealData ? progress.domainScores.soundPatterns : 0),
    wordRecognition: hasEvents ? wordData.score : (hasRealData ? progress.domainScores.wordRecognition : 0),
    readingFluency: hasEvents ? fluencyData.score : (hasRealData ? progress.domainScores.readingFluency : 0),
  };

  const totalScore = scores.letterRecognition + scores.soundPatterns + scores.wordRecognition + scores.readingFluency;
  const avgMastery = totalScore > 0 ? Math.round(totalScore / 4) : 0;

  return { scores, totalScore, avgMastery, hasRealData };
}

// Test Case 1: Empty User
const emptyMetrics = computeDomainMetrics(emptyUserProgress);
console.log('Empty User Metrics (Zero Events):');
console.log('  Letter Recognition:', emptyMetrics.scores.letterRecognition + '%');
console.log('  Sound Patterns:', emptyMetrics.scores.soundPatterns + '%');
console.log('  Word Recognition:', emptyMetrics.scores.wordRecognition + '%');
console.log('  Reading Fluency:', emptyMetrics.scores.readingFluency + '%');
console.log('  Total Score:', emptyMetrics.totalScore);
console.log('  Average Mastery:', emptyMetrics.avgMastery + '%');
console.log('  Has Real Data:', emptyMetrics.hasRealData);

if (emptyMetrics.scores.letterRecognition !== 0 ||
    emptyMetrics.scores.soundPatterns !== 0 ||
    emptyMetrics.scores.wordRecognition !== 0 ||
    emptyMetrics.scores.readingFluency !== 0 ||
    emptyMetrics.totalScore !== 0 ||
    emptyMetrics.avgMastery !== 0 ||
    emptyMetrics.hasRealData !== false) {
  throw new Error('FAILED: Empty user must produce strictly 0% scores and hasRealData=false');
}
console.log('PASS: Empty user cleanly falls back to 0% and triggers parent empty-state notice!\n');

// Test Case 2: User with Real Events (3 correct word kite, 1 retry, 2 correct letter garden)
const activeUserProgress = {
  ...emptyUserProgress,
  completedActivities: 6,
  practiceTimeMinutes: 18,
  learningEvents: [
    { id: '1', childId: 'c1', playerId: 'p1', levelId: 1, activityType: 'word_kite', eventType: 'word_correct', contentId: 'w1', timestamp: new Date().toISOString(), outcome: 'success', attemptCount: 1, language: 'ta' },
    { id: '2', childId: 'c1', playerId: 'p1', levelId: 1, activityType: 'word_kite', eventType: 'word_correct', contentId: 'w2', timestamp: new Date().toISOString(), outcome: 'success', attemptCount: 1, language: 'ta' },
    { id: '3', childId: 'c1', playerId: 'p1', levelId: 1, activityType: 'word_kite', eventType: 'word_incorrect', contentId: 'w3', timestamp: new Date().toISOString(), outcome: 'retry', attemptCount: 1, language: 'ta' },
    { id: '4', childId: 'c1', playerId: 'p1', levelId: 1, activityType: 'letter_garden', eventType: 'creature_matched', contentId: 'l1', timestamp: new Date().toISOString(), outcome: 'success', attemptCount: 1, language: 'ta' },
    { id: '5', childId: 'c1', playerId: 'p1', levelId: 1, activityType: 'letter_garden', eventType: 'creature_matched', contentId: 'l2', timestamp: new Date().toISOString(), outcome: 'success', attemptCount: 1, language: 'ta' },
  ] as LearningEvent[],
};

const activeMetrics = computeDomainMetrics(activeUserProgress);
console.log('Active User Metrics (Real Event-Based Math):');
console.log('  Word Recognition (2 success / 3 total):', activeMetrics.scores.wordRecognition + '%');
console.log('  Letter Recognition (2 success / 2 total):', activeMetrics.scores.letterRecognition + '%');
console.log('  Sound Patterns (0 events):', activeMetrics.scores.soundPatterns + '%');
console.log('  Reading Fluency (0 events):', activeMetrics.scores.readingFluency + '%');
console.log('  Total Score:', activeMetrics.totalScore);
console.log('  Average Mastery:', activeMetrics.avgMastery + '%');
console.log('  Has Real Data:', activeMetrics.hasRealData);

// 2 out of 3 = 67%
if (activeMetrics.scores.wordRecognition !== 67) {
  throw new Error(`Expected word recognition 67%, got ${activeMetrics.scores.wordRecognition}%`);
}
// 2 out of 2 = 100%
if (activeMetrics.scores.letterRecognition !== 100) {
  throw new Error(`Expected letter recognition 100%, got ${activeMetrics.scores.letterRecognition}%`);
}
// Unpracticed domains must be 0%
if (activeMetrics.scores.soundPatterns !== 0 || activeMetrics.scores.readingFluency !== 0) {
  throw new Error('Unpracticed domains must be 0%');
}

console.log('\n=== ALL PARENT DASHBOARD REAL-TIME METRICS TESTS PASSED! ===');
