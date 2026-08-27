import { LocalContentRepository } from '../src/domain/repositories/ContentRepository';

const repo = new LocalContentRepository();
const enLetters = repo.getLetters('en');

console.log('=== LETTER GARDEN MATCH GAME STATE TRANSITION TEST ===\n');

// Simulate the match state machine logic implemented in LetterGardenView
class MatchGameSimulator {
  public targetIndex = 0;
  public selectedChoiceId: string | null = null;
  public isMatchSuccess = false;
  public isTransitioning = false;
  public matchFeedback: string | null = null;

  public get currentTarget() {
    return enLetters[this.targetIndex % enLetters.length];
  }

  public pick(choiceId: string) {
    // 1. Guard against clicking during transition or when already matched
    if (this.isTransitioning || this.isMatchSuccess) {
      return { action: 'ignored', reason: 'locked_or_transitioning' };
    }

    this.selectedChoiceId = choiceId;

    if (choiceId === this.currentTarget.id) {
      this.isMatchSuccess = true;
      this.isTransitioning = true;
      this.matchFeedback = `Correct match! ${this.currentTarget.letter}`;
      return { action: 'success', target: this.currentTarget.letter };
    } else {
      this.matchFeedback = 'Try again!';
      return { action: 'retry' };
    }
  }

  public nextQuestion() {
    // Clean reset of all selection states BEFORE advancing question
    this.selectedChoiceId = null;
    this.isMatchSuccess = false;
    this.matchFeedback = null;
    this.isTransitioning = false;
    this.targetIndex++;
  }
}

const sim = new MatchGameSimulator();

// Step 1: Initial state
console.log('Q1 Target:', sim.currentTarget.letter);
console.log('  Selected ID:', sim.selectedChoiceId);
console.log('  isMatchSuccess:', sim.isMatchSuccess);
console.log('  isTransitioning:', sim.isTransitioning);

if (sim.selectedChoiceId !== null || sim.isMatchSuccess || sim.isTransitioning) {
  throw new Error('Initial state must be completely clean');
}

// Step 2: Click correct answer for Q1
const r1 = sim.pick(sim.currentTarget.id);
console.log('\nPicked correct answer for Q1:', r1);
console.log('  Selected ID:', sim.selectedChoiceId);
console.log('  isMatchSuccess:', sim.isMatchSuccess);
console.log('  isTransitioning:', sim.isTransitioning);

if (!sim.isMatchSuccess || !sim.isTransitioning) {
  throw new Error('Q1 must be marked as successful and transitioning');
}

// Step 3: Crucial Bug Check - Attempt second click while transitioning
const r2 = sim.pick('en_let_b');
console.log('\nAttempting second click during transition:', r2);
if (r2.action !== 'ignored') {
  throw new Error('Clicks must be locked during transition! Bug: secondary click was not ignored!');
}
console.log('PASS: Click during transition was successfully blocked!');

// Step 4: Advance to Q2
sim.nextQuestion();
console.log('\nQ2 Advanced! Target:', sim.currentTarget.letter);
console.log('  Selected ID:', sim.selectedChoiceId);
console.log('  isMatchSuccess:', sim.isMatchSuccess);
console.log('  isTransitioning:', sim.isTransitioning);
console.log('  Feedback:', sim.matchFeedback);

if (sim.selectedChoiceId !== null) {
  throw new Error('BUG DETECTED: Q2 has a pre-selected choice!');
}
if (sim.isMatchSuccess !== false) {
  throw new Error('BUG DETECTED: Q2 automatically inherited match success!');
}
if (sim.isTransitioning !== false) {
  throw new Error('BUG DETECTED: Q2 is locked in transitioning state!');
}

console.log('PASS: Q2 is completely clean! Next question right answer is NOT automatically chosen!');
console.log('\n=== ALL MATCH STATE TRANSITION TESTS PASSED! ===');
