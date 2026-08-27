import { TeachMindyService } from '../src/services/teachMindyService';

console.log('=== TEACH MINDY SEQUENTIAL PROGRESSION & 3-SECOND DELAY TEST ===\n');

// 1. Check all scenarios available
const initialScenarios = TeachMindyService.getInitialScenarios('en');
console.log(`Loaded initial English scenarios: ${initialScenarios.length}`);
if (initialScenarios.length < 20) {
  throw new Error(`Expected at least 20 initial scenarios, found ${initialScenarios.length}`);
}

// 2. Test sequential progression: Verify words advance beyond SUN and BOAT!
console.log('\nChecking first 10 sequential words in scenarios:');
const first10 = initialScenarios.slice(0, 10).map((s, idx) => `${idx + 1}. ${s.targetWord}`);
console.log(first10.join('\n'));

// Verify that words 3 through 10 exist and are distinct
const distinctWords = new Set(initialScenarios.slice(0, 10).map(s => s.targetWord));
if (distinctWords.size < 10) {
  throw new Error(`Duplicate words detected in first 10 scenarios!`);
}
console.log('\nPASS: All 10 consecutive scenarios have distinct words (no SUN & BOAT loop!)');

// 3. Test that options have NO pre-selection or pre-hinted checkmarks
console.log('\nVerifying clean unselected state for new questions:');
for (const scenario of initialScenarios.slice(0, 5)) {
  for (const opt of scenario.options) {
    if ((opt as any).isSelected) {
      throw new Error(`Option ${opt.id} in ${scenario.targetWord} has pre-existing isSelected!`);
    }
  }
}
console.log('PASS: All options are completely clean and unselected initially!');

// 4. Simulate the 3-second auto-advance state machine for both correct and wrong answers
class MindyScenarioPlayer {
  public scenarioIndex = 0;
  public selectedOptionId: string | null = null;
  public isSuccess = false;
  public isWrong = false;
  public isAnswerLocked = false;
  public autoAdvanceTimerFired = false;

  public get currentScenario() {
    return initialScenarios[this.scenarioIndex % initialScenarios.length];
  }

  public answer(optId: string) {
    if (this.isAnswerLocked) return;
    this.isAnswerLocked = true;
    this.selectedOptionId = optId;

    const opt = this.currentScenario.options.find(o => o.id === optId);
    if (opt?.isCorrect) {
      this.isSuccess = true;
      this.isWrong = false;
    } else {
      this.isSuccess = false;
      this.isWrong = true;
    }

    // Both correct and wrong answers trigger the 3-second auto-advance
    setTimeout(() => {
      this.autoAdvanceTimerFired = true;
      this.advance();
    }, 3000);
  }

  public advance() {
    this.selectedOptionId = null;
    this.isSuccess = false;
    this.isWrong = false;
    this.isAnswerLocked = false;
    this.autoAdvanceTimerFired = false;
    this.scenarioIndex++;
  }
}

const player = new MindyScenarioPlayer();
console.log(`\nRound 1: Target is ${player.currentScenario.targetWord}`);
const correctOpt = player.currentScenario.options.find(o => o.isCorrect)!;
player.answer(correctOpt.id);
console.log(`  Answered correctly: isSuccess=${player.isSuccess}, isAnswerLocked=${player.isAnswerLocked}`);
if (!player.isSuccess || !player.isAnswerLocked) throw new Error('Round 1 failed correct answer state');

// Advance to round 2
player.advance();
console.log(`\nRound 2: Target is ${player.currentScenario.targetWord}`);
if (player.currentScenario.targetWord === 'SUN') {
  throw new Error('BUG: Player looped back to SUN!');
}

// Answer round 2 with a WRONG option
const wrongOpt = player.currentScenario.options.find(o => !o.isCorrect)!;
player.answer(wrongOpt.id);
console.log(`  Answered wrongly: isWrong=${player.isWrong}, isAnswerLocked=${player.isAnswerLocked}`);
if (!player.isWrong || !player.isAnswerLocked) throw new Error('Round 2 failed wrong answer state');

// Advance to round 3
player.advance();
console.log(`\nRound 3: Target is ${player.currentScenario.targetWord}`);
if (player.currentScenario.targetWord === 'SUN' || player.currentScenario.targetWord === 'BOAT') {
  throw new Error(`BUG: Player looped back to ${player.currentScenario.targetWord}!`);
}

// Advance to round 4
player.advance();
console.log(`\nRound 4: Target is ${player.currentScenario.targetWord}`);
if (player.currentScenario.targetWord === 'SUN' || player.currentScenario.targetWord === 'BOAT') {
  throw new Error(`BUG: Player looped back to ${player.currentScenario.targetWord}!`);
}

console.log('\n=== ALL SEQUENTIAL PROGRESSION TESTS PASSED! ===');
