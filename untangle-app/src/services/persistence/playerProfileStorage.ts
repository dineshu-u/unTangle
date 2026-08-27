import { PlayerLearningProfile } from '../../domain/models/playerProfile';
import { UserAccount, AGE_GROUP_CONFIG } from '../../domain/models/userAccount';
import { UserAccountService } from './userAccountService';

const PROFILE_KEY_PREFIX = 'untangle_player_profile_';
const ACTIVE_PLAYER_KEY = 'untangle_active_player_id';

// Default starter profile for Aarav (High performer)
export const DEFAULT_PLAYER_AARAV: PlayerLearningProfile = {
  playerId: 'player-aarav',
  playerName: 'Aarav',
  avatar: '👦🏽',
  language: 'ta',
  currentLevel: 1,
  difficulty: 1,
  wordsSeen: ['மரம்'],
  wordsMastered: ['மரம்'],
  wordsPracticed: ['மரம்'],
  wordsNeedingPractice: [],
  recentSuccessRate: 0.9,
  recentErrors: [],
  recentSuccesses: [{ word: 'மரம்', timestamp: new Date().toISOString() }],
  learningPatterns: { 'ம': 0.95, 'ர': 0.9, 'ம்': 0.95 },
  generatedContentIds: [],
  lastUpdated: new Date().toISOString(),
};

// Preset Player B: Kavi (Struggling with a pattern, needs reinforcement on 'ம')
export const DEFAULT_PLAYER_KAVI: PlayerLearningProfile = {
  playerId: 'player-kavi',
  playerName: 'Kavi',
  avatar: '👧🏽',
  language: 'ta',
  currentLevel: 2,
  difficulty: 1,
  wordsSeen: ['மரம்', 'படம்'],
  wordsMastered: ['படம்'],
  wordsPracticed: ['மரம்', 'படம்'],
  wordsNeedingPractice: ['மரம்', 'மணி'],
  recentSuccessRate: 0.55,
  recentErrors: [
    { word: 'மரம்', pattern: 'ம', timestamp: new Date().toISOString() },
    { word: 'மணி', pattern: 'ம', timestamp: new Date().toISOString() },
  ],
  recentSuccesses: [{ word: 'படம்', timestamp: new Date().toISOString() }],
  learningPatterns: { 'ம': 0.4, 'ப': 0.85, 'ட': 0.9 },
  generatedContentIds: [],
  lastUpdated: new Date().toISOString(),
};

// Preset Player C: Leo (English beginner)
export const DEFAULT_PLAYER_LEO: PlayerLearningProfile = {
  playerId: 'player-leo',
  playerName: 'Leo',
  avatar: '🧒🏼',
  language: 'en',
  currentLevel: 1,
  difficulty: 1,
  wordsSeen: ['CAT'],
  wordsMastered: ['CAT'],
  wordsPracticed: ['CAT'],
  wordsNeedingPractice: [],
  recentSuccessRate: 0.85,
  recentErrors: [],
  recentSuccesses: [{ word: 'CAT', timestamp: new Date().toISOString() }],
  learningPatterns: { 'C': 0.9, 'A': 0.9, 'T': 0.95 },
  generatedContentIds: [],
  lastUpdated: new Date().toISOString(),
};

export const PRESET_PLAYERS = [DEFAULT_PLAYER_AARAV, DEFAULT_PLAYER_KAVI, DEFAULT_PLAYER_LEO];

export class PlayerProfileStorage {
  public static getActivePlayerId(): string {
    const activeMobile = UserAccountService.getActiveMobile();
    if (activeMobile) {
      return `player_${activeMobile}`;
    }
    if (typeof window === 'undefined' || !window.localStorage) return 'player-aarav';
    try {
      const saved = window.localStorage.getItem(ACTIVE_PLAYER_KEY);
      return saved || 'player-aarav';
    } catch {
      return 'player-aarav';
    }
  }

  public static setActivePlayerId(playerIdOrMobile: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(ACTIVE_PLAYER_KEY, playerIdOrMobile);
      const cleanMobile = UserAccountService.cleanMobile(playerIdOrMobile);
      if (cleanMobile.length >= 10) {
        UserAccountService.setActiveMobile(cleanMobile);
      }
    } catch {
      // ignore
    }
  }

  public static loadProfile(playerIdOrMobile: string): PlayerLearningProfile {
    const cleanMobile = UserAccountService.cleanMobile(playerIdOrMobile);

    // 1. Mobile-based primary key lookup
    if (cleanMobile.length >= 10) {
      const mobileKey = UserAccountService.getProfileKey(cleanMobile);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem(mobileKey);
          if (raw) {
            return JSON.parse(raw) as PlayerLearningProfile;
          }
        } catch {
          // ignore
        }
      }

      // Check if user account exists
      const account = UserAccountService.getAccount(cleanMobile);
      if (account) {
        const created = this.createProfileForAccount(account);
        this.saveProfile(created, cleanMobile);
        return created;
      }
    }

    // 2. Legacy / test lookup by playerId string (e.g. 'player-aarav')
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(`${PROFILE_KEY_PREFIX}${playerIdOrMobile}`);
        if (raw) {
          return JSON.parse(raw) as PlayerLearningProfile;
        }
      } catch {
        // ignore
      }
    }

    // 3. Fall back to preset player
    const preset = PRESET_PLAYERS.find(p => p.playerId === playerIdOrMobile) || DEFAULT_PLAYER_AARAV;
    return preset;
  }

  public static saveProfile(profile: PlayerLearningProfile, mobile?: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const targetMobile = mobile || UserAccountService.cleanMobile(profile.playerId) || UserAccountService.getActiveMobile();
      if (targetMobile && targetMobile.length >= 10) {
        const mobileKey = UserAccountService.getProfileKey(targetMobile);
        window.localStorage.setItem(mobileKey, JSON.stringify(profile));
      }
      // Also save by playerId for legacy compatibility
      window.localStorage.setItem(`${PROFILE_KEY_PREFIX}${profile.playerId}`, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  public static createProfileForAccount(account: UserAccount): PlayerLearningProfile {
    const isTa = account.language === 'ta';
    const config = AGE_GROUP_CONFIG[account.ageGroup] || AGE_GROUP_CONFIG['5-8'];
    const initialLevel = config.initialLevel;
    const initialDifficulty = config.initialDifficulty;
    const initialWord = isTa ? 'மரம்' : 'CAT';

    return {
      playerId: `player_${account.parentMobile}`,
      playerName: account.childName,
      avatar: account.avatar || '👦🏽',
      language: account.language,
      currentLevel: initialLevel,
      difficulty: initialDifficulty,
      wordsSeen: [initialWord],
      wordsMastered: [initialWord],
      wordsPracticed: [initialWord],
      wordsNeedingPractice: [],
      recentSuccessRate: 0.85,
      recentErrors: [],
      recentSuccesses: [{ word: initialWord, timestamp: new Date().toISOString() }],
      learningPatterns: isTa ? { 'ம': 0.9, 'ர': 0.9, 'ம்': 0.9 } : { 'C': 0.9, 'A': 0.9, 'T': 0.9 },
      generatedContentIds: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  public static listAvailablePlayers(): PlayerLearningProfile[] {
    const accounts = UserAccountService.listAccounts();
    return accounts.map(a => this.loadProfile(a.parentMobile));
  }

  public static updateProfileOnWordResult(
    profile: PlayerLearningProfile,
    word: string,
    isCorrect: boolean,
    pattern?: string
  ): PlayerLearningProfile {
    const wordsPracticed = Array.from(new Set([...profile.wordsPracticed, word]));
    const wordsSeen = Array.from(new Set([...profile.wordsSeen, word]));
    let wordsMastered = [...profile.wordsMastered];
    let wordsNeedingPractice = [...profile.wordsNeedingPractice];
    const recentErrors = [...profile.recentErrors];
    const recentSuccesses = [...profile.recentSuccesses];
    const learningPatterns = { ...profile.learningPatterns };

    if (isCorrect) {
      if (!wordsMastered.includes(word)) {
        wordsMastered.push(word);
      }
      wordsNeedingPractice = wordsNeedingPractice.filter(w => w !== word);
      recentSuccesses.push({ word, timestamp: new Date().toISOString() });

      if (pattern) {
        const cur = learningPatterns[pattern] ?? 0.7;
        learningPatterns[pattern] = Math.min(1.0, cur + 0.1);
      }
    } else {
      if (!wordsNeedingPractice.includes(word)) {
        wordsNeedingPractice.push(word);
      }
      recentErrors.push({ word, pattern, timestamp: new Date().toISOString() });

      if (pattern) {
        const cur = learningPatterns[pattern] ?? 0.7;
        learningPatterns[pattern] = Math.max(0.2, cur - 0.15);
      }
    }

    // Calculate rolling success rate
    const totalRecent = Math.min(10, recentSuccesses.length + recentErrors.length);
    const recentSuccessCount = Math.min(recentSuccesses.length, totalRecent);
    const recentSuccessRate = totalRecent > 0 ? recentSuccessCount / totalRecent : 0.8;

    const updated: PlayerLearningProfile = {
      ...profile,
      wordsSeen,
      wordsPracticed,
      wordsMastered,
      wordsNeedingPractice,
      recentSuccessRate,
      recentErrors: recentErrors.slice(-10),
      recentSuccesses: recentSuccesses.slice(-10),
      learningPatterns,
      lastUpdated: new Date().toISOString(),
    };

    this.saveProfile(updated);
    return updated;
  }
}
