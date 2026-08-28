import { ChildProgressState } from '../../domain/models/progress';
import { UserAccountService } from './userAccountService';

export const INITIAL_PROGRESS_STATE: ChildProgressState = {
  childId: 'child-default-1',
  childName: 'Explorer',
  level: 2,
  levelTitleEn: 'Sprout',
  levelTitleTa: 'முளை',
  stormProgress: 60,
  weatherState: 'storm_clearing',
  wordsTaughtCount: 14,
  practiceTimeMinutes: 36,
  completedActivities: 12,
  streakDays: 3,
  domainScores: {
    letterRecognition: 78,
    soundPatterns: 52,
    wordRecognition: 84,
    readingFluency: 48,
  },
  unlockedLocations: ['mindy_house', 'letter_garden', 'word_kite', 'pulse_path', 'reading_lens', 'learning_garden', 'village_mela', 'family_voice'],
  practicedLetters: ['en_let_m', 'ta_let_ma', 'ta_let_ka', 'ta_let_a'],
  practicedWords: ['ta_w_maram', 'en_w_tree'],
  lessonCards: [
    {
      id: 'lc-1',
      word: 'மரம்',
      meaning: 'குளிர்ந்த நிழல் தரும் பசுமையான மரம்',
      dateEarned: 'Today',
      language: 'ta',
    },
    {
      id: 'lc-2',
      word: 'கிளி',
      meaning: 'கொய்யா பழம் உண்ணும் பச்சைக்கிளி',
      dateEarned: 'Yesterday',
      language: 'ta',
    },
    {
      id: 'lc-3',
      word: 'TREE',
      meaning: 'Living plant with green leaves and sweet shade',
      dateEarned: '2 days ago',
      language: 'en',
    }
  ],
  unlockedGifts: [
    {
      id: 'gift_lvl1',
      levelUnlocked: 1,
      nameEn: 'Golden Kite Ribbon',
      nameTa: 'தங்கக் காற்றாடி நாடா',
      emoji: '🪁',
      dateEarned: 'Level 1',
      stars: 3,
    }
  ],
  learningEvents: [],
};

export class ProgressStorageService {
  private static getKey(mobile?: string): string {
    const active = mobile || UserAccountService.getActiveMobile() || '9876543210';
    return UserAccountService.getProgressKey(active);
  }

  public static save(state: ChildProgressState, mobile?: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const key = this.getKey(mobile);
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage quota exceeded or disabled in privacy mode
    }
  }

  public static load(mobile?: string): ChildProgressState {
    if (typeof window === 'undefined' || !window.localStorage) {
      return JSON.parse(JSON.stringify(INITIAL_PROGRESS_STATE));
    }
    try {
      const key = this.getKey(mobile);
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as ChildProgressState;
        if (!parsed.unlockedGifts) {
          parsed.unlockedGifts = INITIAL_PROGRESS_STATE.unlockedGifts;
        }
        return parsed;
      }
    } catch {
      // JSON parse error
    }

    // Return a fresh deep clone so in-memory mutations never bleed across users!
    const freshClone = JSON.parse(JSON.stringify(INITIAL_PROGRESS_STATE)) as ChildProgressState;
    if (mobile) {
      const account = UserAccountService.getAccount(mobile);
      if (account) {
        freshClone.childId = `child_${account.parentMobile}`;
        freshClone.childName = account.childName;
      }
    }
    return freshClone;
  }

  public static reset(mobile?: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const key = this.getKey(mobile);
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
