import { PlayerLearningProfile } from '../../domain/models/playerProfile';

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
    if (typeof window === 'undefined' || !window.localStorage) return 'player-aarav';
    try {
      const saved = localStorage.getItem(ACTIVE_PLAYER_KEY);
      return saved || 'player-aarav';
    } catch {
      return 'player-aarav';
    }
  }

  public static setActivePlayerId(playerId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(ACTIVE_PLAYER_KEY, playerId);
    } catch {
      // ignore
    }
  }

  public static loadProfile(playerId: string): PlayerLearningProfile {
    if (typeof window === 'undefined' || !window.localStorage) {
      const match = PRESET_PLAYERS.find(p => p.playerId === playerId);
      return match || DEFAULT_PLAYER_AARAV;
    }

    try {
      const raw = localStorage.getItem(`${PROFILE_KEY_PREFIX}${playerId}`);
      if (raw) {
        return JSON.parse(raw) as PlayerLearningProfile;
      }
    } catch {
      // ignore
    }

    // Fall back to preset
    const preset = PRESET_PLAYERS.find(p => p.playerId === playerId) || DEFAULT_PLAYER_AARAV;
    this.saveProfile(preset);
    return preset;
  }

  public static saveProfile(profile: PlayerLearningProfile): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(`${PROFILE_KEY_PREFIX}${profile.playerId}`, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  public static listAvailablePlayers(): PlayerLearningProfile[] {
    return PRESET_PLAYERS.map(p => this.loadProfile(p.playerId));
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
