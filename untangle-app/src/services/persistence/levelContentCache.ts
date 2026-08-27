import { ContentItem, AppLanguage } from '../../domain/models/content';

const LEVEL_CACHE_PREFIX = 'untangle_level_cache_';

export class LevelContentCache {
  private static makeKey(playerId: string, levelId: number, language: AppLanguage): string {
    return `${LEVEL_CACHE_PREFIX}${playerId}_lvl${levelId}_${language}`;
  }

  public static getCachedLevelContent(
    playerId: string,
    levelId: number,
    language: AppLanguage
  ): ContentItem[] | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const raw = localStorage.getItem(this.makeKey(playerId, levelId, language));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ContentItem[];
      }
    } catch {
      // ignore
    }
    return null;
  }

  public static saveLevelContent(
    playerId: string,
    levelId: number,
    language: AppLanguage,
    words: ContentItem[]
  ): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(this.makeKey(playerId, levelId, language), JSON.stringify(words));
    } catch {
      // storage quota or disabled
    }
  }

  public static hasCachedContent(
    playerId: string,
    levelId: number,
    language: AppLanguage
  ): boolean {
    return this.getCachedLevelContent(playerId, levelId, language) !== null;
  }

  public static clearPlayerCache(playerId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${LEVEL_CACHE_PREFIX}${playerId}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
}
