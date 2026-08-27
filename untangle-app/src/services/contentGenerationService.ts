import { ContentItem } from '../domain/models/content';
import { LearningSummary, ContentGenerationConstraints } from '../domain/models/playerProfile';
import { GroqService, RawGroqBatchResponse, RawGroqWordItem } from './groqService';
import { LevelContentCache } from './persistence/levelContentCache';
import { ApiKeyService } from './apiKeyService';

export interface LevelBatchResult {
  words: ContentItem[];
  source: 'diagnostic_baseline' | 'groq_ai' | 'cache' | 'fallback';
  requiresApiKey?: boolean;
}

export class ContentGenerationService {
  // Baseline diagnostic words for Level 1 & Level 2 (Diagnostic Phase)
  private static DIAGNOSTIC_LEVELS_TA: Record<number, ContentItem[]> = {
    1: [
      {
        id: 'diag_ta_1_maram',
        language: 'ta',
        script: 'tamil',
        letter: 'ம',
        word: 'மரம்',
        meaning: 'குளிர்ந்த நிழல் தரும் பசுமையான மரம்',
        emoji: '🌳',
        difficulty: 1,
        isRealWord: true,
        syllables: ['ம', 'ர', 'ம்'],
        distractors: ['அ', 'க', 'கி', 'ல்', 'தெ', 'ப', 'த'],
        tags: ['diagnostic', 'baseline_lvl1'],
      },
      {
        id: 'diag_ta_1_padam',
        language: 'ta',
        script: 'tamil',
        letter: 'ப',
        word: 'படம்',
        meaning: 'சுவரில் மாட்டிய அழகிய ஓவிய படம்',
        emoji: '🖼️',
        difficulty: 1,
        isRealWord: true,
        syllables: ['ப', 'ட', 'ம்'],
        distractors: ['ம', 'ர', 'க', 'ல்', 'அ', 'வ', 'ந'],
        tags: ['diagnostic', 'baseline_lvl1'],
      },
      {
        id: 'diag_ta_1_kann',
        language: 'ta',
        script: 'tamil',
        letter: 'க',
        word: 'கண்',
        meaning: 'உலகை ரசிக்க உதவும் அழகிய விழி',
        emoji: '👁️',
        difficulty: 1,
        isRealWord: true,
        syllables: ['க', 'ண்'],
        distractors: ['ம', 'ர', 'ப', 'ட', 'ல்', 'அ', 'வ'],
        tags: ['diagnostic', 'baseline_lvl1'],
      },
    ],
    2: [
      {
        id: 'diag_ta_2_agam',
        language: 'ta',
        script: 'tamil',
        letter: 'அ',
        word: 'அகம்',
        meaning: 'அன்பும் அமைதியும் நிறைந்த சொந்த இல்லம்',
        emoji: '🏡',
        difficulty: 2,
        isRealWord: true,
        syllables: ['அ', 'க', 'ம்'],
        distractors: ['ம', 'ர', 'ப', 'ட', 'ல்', 'வ', 'ந'],
        tags: ['diagnostic', 'baseline_lvl2'],
      },
      {
        id: 'diag_ta_2_kadal',
        language: 'ta',
        script: 'tamil',
        letter: 'க',
        word: 'கடல்',
        meaning: 'அலைகள் ஓயாத பரந்த நீலக் கடல்',
        emoji: '🌊',
        difficulty: 2,
        isRealWord: true,
        syllables: ['க', 'ட', 'ல்'],
        distractors: ['ம', 'ர', 'ப', 'அ', 'வ', 'ந', 'க'],
        tags: ['diagnostic', 'baseline_lvl2'],
      },
      {
        id: 'diag_ta_2_kaadu',
        language: 'ta',
        script: 'tamil',
        letter: 'க',
        word: 'காடு',
        meaning: 'மரங்களும் விலங்குகளும் வாழும் பசுங்காடு',
        emoji: '🌲',
        difficulty: 2,
        isRealWord: true,
        syllables: ['கா', 'டு'],
        distractors: ['ம', 'ர', 'ம்', 'ப', 'ட', 'ல்', 'அ'],
        tags: ['diagnostic', 'baseline_lvl2'],
      },
    ],
  };

  private static DIAGNOSTIC_LEVELS_EN: Record<number, ContentItem[]> = {
    1: [
      {
        id: 'diag_en_1_cat',
        language: 'en',
        script: 'latin',
        letter: 'C',
        word: 'CAT',
        meaning: 'Friendly pet that purrs softly',
        emoji: '🐱',
        difficulty: 1,
        isRealWord: true,
        syllables: ['C', 'A', 'T'],
        distractors: ['S', 'U', 'N', 'T', 'K', 'E', 'R'],
        tags: ['diagnostic', 'baseline_lvl1'],
      },
      {
        id: 'diag_en_1_sun',
        language: 'en',
        script: 'latin',
        letter: 'S',
        word: 'SUN',
        meaning: 'Bright morning star that warms the earth',
        emoji: '☀️',
        difficulty: 1,
        isRealWord: true,
        syllables: ['S', 'U', 'N'],
        distractors: ['T', 'O', 'P', 'B', 'R', 'E', 'M'],
        tags: ['diagnostic', 'baseline_lvl1'],
      },
      {
        id: 'diag_en_1_tree',
        language: 'en',
        script: 'latin',
        letter: 'T',
        word: 'TREE',
        meaning: 'Green plant with cool shade',
        emoji: '🌳',
        difficulty: 1,
        isRealWord: true,
        syllables: ['T', 'R', 'E', 'E'],
        distractors: ['C', 'A', 'S', 'B', 'M', 'O', 'P'],
        tags: ['diagnostic', 'baseline_lvl1'],
      },
    ],
    2: [
      {
        id: 'diag_en_2_bird',
        language: 'en',
        script: 'latin',
        letter: 'B',
        word: 'BIRD',
        meaning: 'Singing animal that flies high on wings',
        emoji: '🐦',
        difficulty: 2,
        isRealWord: true,
        syllables: ['B', 'I', 'R', 'D'],
        distractors: ['C', 'A', 'T', 'S', 'U', 'N', 'E'],
        tags: ['diagnostic', 'baseline_lvl2'],
      },
      {
        id: 'diag_en_2_star',
        language: 'en',
        script: 'latin',
        letter: 'S',
        word: 'STAR',
        meaning: 'Twinkling jewel shining in the night sky',
        emoji: '⭐',
        difficulty: 2,
        isRealWord: true,
        syllables: ['S', 'T', 'A', 'R'],
        distractors: ['B', 'I', 'R', 'D', 'C', 'A', 'T'],
        tags: ['diagnostic', 'baseline_lvl2'],
      },
      {
        id: 'diag_en_2_fish',
        language: 'en',
        script: 'latin',
        letter: 'F',
        word: 'FISH',
        meaning: 'Glimmering swimmer in the fresh river',
        emoji: '🐟',
        difficulty: 2,
        isRealWord: true,
        syllables: ['F', 'I', 'S', 'H'],
        distractors: ['B', 'O', 'A', 'T', 'C', 'A', 'T'],
        tags: ['diagnostic', 'baseline_lvl2'],
      },
    ],
  };

  // Multi-level progressive fallback banks (5 distinct words per level, 0 repetition)
  private static PROGRESSIVE_BANK_TA: Record<number, ContentItem[]> = {
    3: [
      { id: 'fb_ta_3_1', language: 'ta', script: 'tamil', letter: 'ம', word: 'மலர்', meaning: 'நறுமணம் வீசும் பூ மலர்', emoji: '🌸', difficulty: 2, isRealWord: true, syllables: ['ம', 'ல', 'ர்'], distractors: ['க', 'ப', 'த', 'ந'] },
      { id: 'fb_ta_3_2', language: 'ta', script: 'tamil', letter: 'ப', word: 'பந்து', meaning: 'விளையாடும் வண்ணப் பந்து', emoji: '⚽', difficulty: 2, isRealWord: true, syllables: ['ப', 'ந்', 'து'], distractors: ['ம', 'க', 'ல்', 'அ'] },
      { id: 'fb_ta_3_3', language: 'ta', script: 'tamil', letter: 'க', word: 'கப்பல்', meaning: 'கடலில் மிதக்கும் பெரிய கப்பல்', emoji: '🚢', difficulty: 2, isRealWord: true, syllables: ['க', 'ப்', 'ப', 'ல்'], distractors: ['ம', 'ர', 'த', 'வ'] },
      { id: 'fb_ta_3_4', language: 'ta', script: 'tamil', letter: 'த', word: 'தாமரை', meaning: 'குளத்தில் மலரும் தாமரை', emoji: '🪷', difficulty: 3, isRealWord: true, syllables: ['தா', 'ம', 'ரை'], distractors: ['ப', 'க', 'ல்', 'ர'] },
      { id: 'fb_ta_3_5', language: 'ta', script: 'tamil', letter: 'அ', word: 'அணில்', meaning: 'வாலை ஆட்டும் அழகிய அணில்', emoji: '🐿️', difficulty: 2, isRealWord: true, syllables: ['அ', 'ணி', 'ல்'], distractors: ['ம', 'க', 'ப', 'ர'] },
    ],
    4: [
      { id: 'fb_ta_4_1', language: 'ta', script: 'tamil', letter: 'ம', word: 'மாம்பழம்', meaning: 'இனிப்பு நிறைந்த மாம்பழம்', emoji: '🥭', difficulty: 3, isRealWord: true, syllables: ['மா', 'ம்', 'ப', 'ழ', 'ம்'], distractors: ['க', 'ல', 'த', 'வ'] },
      { id: 'fb_ta_4_2', language: 'ta', script: 'tamil', letter: 'கு', word: 'குதிரை', meaning: 'வேகமாக ஓடும் குதிரை', emoji: '🐴', difficulty: 2, isRealWord: true, syllables: ['கு', 'தி', 'ரை'], distractors: ['ம', 'ப', 'ல்', 'ந'] },
      { id: 'fb_ta_4_3', language: 'ta', script: 'tamil', letter: 'ஆ', word: 'ஆப்பிள்', meaning: 'சுவையான சிகப்பு ஆப்பிள்', emoji: '🍎', difficulty: 3, isRealWord: true, syllables: ['ஆ', 'ப்', 'பி', 'ள்'], distractors: ['ம', 'க', 'த', 'ர'] },
      { id: 'fb_ta_4_4', language: 'ta', script: 'tamil', letter: 'நி', word: 'நிலா', meaning: 'இரவில் ஒளிரும் வெண்ணிலா', emoji: '🌙', difficulty: 2, isRealWord: true, syllables: ['நி', 'லா'], distractors: ['ப', 'ம', 'க', 'வ'] },
      { id: 'fb_ta_4_5', language: 'ta', script: 'tamil', letter: 'வ', word: 'வண்டு', meaning: 'பூக்களில் ரீங்காரமிடும் வண்டு', emoji: '🐞', difficulty: 2, isRealWord: true, syllables: ['வ', 'ண்', 'டு'], distractors: ['த', 'க', 'ல்', 'ப'] },
    ],
    5: [
      { id: 'fb_ta_5_1', language: 'ta', script: 'tamil', letter: 'கி', word: 'கிளி', meaning: 'கொய்யா பழம் உண்ணும் பச்சைக்கிளி', emoji: '🦜', difficulty: 2, isRealWord: true, syllables: ['கி', 'ளி'], distractors: ['ம', 'ப', 'த', 'க'] },
      { id: 'fb_ta_5_2', language: 'ta', script: 'tamil', letter: 'ம', word: 'மயில்', meaning: 'தோகை விரித்தாடும் மயில்', emoji: '🦚', difficulty: 2, isRealWord: true, syllables: ['ம', 'யி', 'ல்'], distractors: ['க', 'ப', 'ர', 'வ'] },
      { id: 'fb_ta_5_3', language: 'ta', script: 'tamil', letter: 'மு', word: 'முயல்', meaning: 'துள்ளி ஓடும் வெள்ளை முயல்', emoji: '🐇', difficulty: 2, isRealWord: true, syllables: ['மு', 'ய', 'ல்'], distractors: ['த', 'ந', 'க', 'ப'] },
      { id: 'fb_ta_5_4', language: 'ta', script: 'tamil', letter: 'சி', word: 'சிங்கம்', meaning: 'காட்டின் அரசன் கம்பீர சிங்கம்', emoji: '🦁', difficulty: 3, isRealWord: true, syllables: ['சி', 'ங்', 'க', 'ம்'], distractors: ['ம', 'ப', 'ர', 'ல'] },
      { id: 'fb_ta_5_5', language: 'ta', script: 'tamil', letter: 'யா', word: 'யானை', meaning: 'துதிக்கை உடைய பெரிய யானை', emoji: '🐘', difficulty: 2, isRealWord: true, syllables: ['யா', 'னை'], distractors: ['க', 'த', 'ப', 'வ'] },
    ],
  };

  private static PROGRESSIVE_BANK_EN: Record<number, ContentItem[]> = {
    3: [
      { id: 'fb_en_3_1', language: 'en', script: 'latin', letter: 'B', word: 'BOAT', meaning: 'Small ship sailing on water', emoji: '⛵', difficulty: 2, isRealWord: true, syllables: ['B', 'O', 'A', 'T'], distractors: ['S', 'U', 'N', 'C'] },
      { id: 'fb_en_3_2', language: 'en', script: 'latin', letter: 'D', word: 'DUCK', meaning: 'Water bird with flat bill', emoji: '🦆', difficulty: 2, isRealWord: true, syllables: ['D', 'U', 'C', 'K'], distractors: ['F', 'I', 'S', 'H'] },
      { id: 'fb_en_3_3', language: 'en', script: 'latin', letter: 'F', word: 'FROG', meaning: 'Jumping green pond animal', emoji: '🐸', difficulty: 2, isRealWord: true, syllables: ['F', 'R', 'O', 'G'], distractors: ['C', 'A', 'T', 'B'] },
      { id: 'fb_en_3_4', language: 'en', script: 'latin', letter: 'M', word: 'MOON', meaning: 'Glowing light in night sky', emoji: '🌙', difficulty: 2, isRealWord: true, syllables: ['M', 'O', 'O', 'N'], distractors: ['S', 'T', 'A', 'R'] },
      { id: 'fb_en_3_5', language: 'en', script: 'latin', letter: 'R', word: 'RAIN', meaning: 'Water drops falling from clouds', emoji: '🌧️', difficulty: 2, isRealWord: true, syllables: ['R', 'A', 'I', 'N'], distractors: ['T', 'R', 'E', 'E'] },
    ],
    4: [
      { id: 'fb_en_4_1', language: 'en', script: 'latin', letter: 'B', word: 'BALL', meaning: 'Round toy that bounces high', emoji: '⚽', difficulty: 2, isRealWord: true, syllables: ['B', 'A', 'L', 'L'], distractors: ['C', 'A', 'T', 'P'] },
      { id: 'fb_en_4_2', language: 'en', script: 'latin', letter: 'L', word: 'LION', meaning: 'Brave king of the jungle', emoji: '🦁', difficulty: 2, isRealWord: true, syllables: ['L', 'I', 'O', 'N'], distractors: ['B', 'E', 'A', 'R'] },
      { id: 'fb_en_4_3', language: 'en', script: 'latin', letter: 'D', word: 'DEER', meaning: 'Gentle swift forest animal', emoji: '🦌', difficulty: 2, isRealWord: true, syllables: ['D', 'E', 'E', 'R'], distractors: ['F', 'R', 'O', 'G'] },
      { id: 'fb_en_4_4', language: 'en', script: 'latin', letter: 'R', word: 'RING', meaning: 'Shiny gold circle for finger', emoji: '💍', difficulty: 2, isRealWord: true, syllables: ['R', 'I', 'N', 'G'], distractors: ['S', 'U', 'N', 'K'] },
      { id: 'fb_en_4_5', language: 'en', script: 'latin', letter: 'R', word: 'ROSE', meaning: 'Fragrant pink garden flower', emoji: '🌹', difficulty: 2, isRealWord: true, syllables: ['R', 'O', 'S', 'E'], distractors: ['B', 'I', 'R', 'D'] },
    ],
    5: [
      { id: 'fb_en_5_1', language: 'en', script: 'latin', letter: 'A', word: 'APPLE', meaning: 'Sweet red crunchy fruit', emoji: '🍎', difficulty: 3, isRealWord: true, syllables: ['A', 'P', 'P', 'L', 'E'], distractors: ['B', 'A', 'L', 'L'] },
      { id: 'fb_en_5_2', language: 'en', script: 'latin', letter: 'H', word: 'HORSE', meaning: 'Fast runner with mane and hooves', emoji: '🐴', difficulty: 3, isRealWord: true, syllables: ['H', 'O', 'R', 'S', 'E'], distractors: ['L', 'I', 'O', 'N'] },
      { id: 'fb_en_5_3', language: 'en', script: 'latin', letter: 'C', word: 'CLOUD', meaning: 'Fluffy white shape in the sky', emoji: '☁️', difficulty: 3, isRealWord: true, syllables: ['C', 'L', 'O', 'U', 'D'], distractors: ['R', 'A', 'I', 'N'] },
      { id: 'fb_en_5_4', language: 'en', script: 'latin', letter: 'T', word: 'TRAIN', meaning: 'Long locomotive riding on rails', emoji: '🚂', difficulty: 3, isRealWord: true, syllables: ['T', 'R', 'A', 'I', 'N'], distractors: ['B', 'O', 'A', 'T'] },
      { id: 'fb_en_5_5', language: 'en', script: 'latin', letter: 'H', word: 'HOUSE', meaning: 'Warm home with roof and door', emoji: '🏡', difficulty: 3, isRealWord: true, syllables: ['H', 'O', 'U', 'S', 'E'], distractors: ['M', 'O', 'O', 'N'] },
    ],
  };

  /**
   * Main level content generation:
   * - Level 1 & 2: Diagnostic Baseline Phase.
   * - Level 3+: 100% Dynamic Groq AI Generated Words based on student profile.
   */
  public async getLevelContent(
    playerId: string,
    levelId: number,
    summary: LearningSummary,
    constraints: ContentGenerationConstraints
  ): Promise<LevelBatchResult> {
    const isTamil = constraints.language === 'ta';

    // 1. Diagnostic Baseline Phase (Level 1 & Level 2)
    if (levelId === 1 || levelId === 2) {
      const baselineMap = isTamil
        ? ContentGenerationService.DIAGNOSTIC_LEVELS_TA
        : ContentGenerationService.DIAGNOSTIC_LEVELS_EN;
      const baseline = baselineMap[levelId];
      if (baseline && baseline.length > 0) {
        return {
          words: baseline,
          source: 'diagnostic_baseline',
        };
      }
    }

    // 2. Check local level cache for this player, level, and language
    const cached = LevelContentCache.getCachedLevelContent(playerId, levelId, constraints.language);
    if (cached && cached.length > 0) {
      return {
        words: cached,
        source: 'cache',
      };
    }

    // 3. Level 3+: Call Groq API for Dynamic Content Generation
    const hasKey = ApiKeyService.hasApiKey();

    if (hasKey) {
      try {
        const rawBatch = await GroqService.generateWordBatch(summary, constraints);
        if (rawBatch) {
          const validatedWords = this.validateAndTransform(rawBatch, constraints);
          if (validatedWords && validatedWords.length >= 3) {
            LevelContentCache.saveLevelContent(playerId, levelId, constraints.language, validatedWords);
            return {
              words: validatedWords,
              source: 'groq_ai',
            };
          }
        }
      } catch {
        // Groq network or parsing failure -> proceed to progressive non-repeating fallback
      }
    }

    // 4. Progressive Non-Repeating Fallback Bank (Distinct words for each level!)
    const fallback = this.getDynamicProgressiveBatch(levelId, constraints);
    LevelContentCache.saveLevelContent(playerId, levelId, constraints.language, fallback);
    return {
      words: fallback,
      source: 'fallback',
      requiresApiKey: !hasKey,
    };
  }

  /**
   * Validates and cleans raw AI-generated content from Groq, enforcing Emojis and Script rules.
   */
  private validateAndTransform(
    batch: RawGroqBatchResponse,
    constraints: ContentGenerationConstraints
  ): ContentItem[] | null {
    if (!batch || !Array.isArray(batch.words)) return null;
    if (batch.language !== constraints.language) return null;

    const validated: ContentItem[] = [];
    const seenWords = new Set<string>();
    const isTamil = constraints.language === 'ta';
    const tamilRegex = /[\u0B80-\u0BFF]/;
    const englishRegex = /[a-zA-Z]/;

    for (let i = 0; i < batch.words.length; i++) {
      const w = batch.words[i] as RawGroqWordItem & { emoji?: string };
      if (!w || !w.word || typeof w.word !== 'string') continue;
      const cleanWord = w.word.trim();
      if (cleanWord.length === 0) continue;

      // Script check: NO language leakage
      if (isTamil) {
        if (!tamilRegex.test(cleanWord) || englishRegex.test(cleanWord)) continue;
      } else {
        if (!englishRegex.test(cleanWord) || tamilRegex.test(cleanWord)) continue;
      }

      // Avoid duplicates
      const lower = cleanWord.toLowerCase();
      if (seenWords.has(lower)) continue;
      seenWords.add(lower);

      const letters = Array.isArray(w.letters) && w.letters.length > 0
        ? w.letters
        : cleanWord.split('');

      const distractors = Array.isArray(w.distractors) && w.distractors.length >= 3
        ? w.distractors
        : isTamil
        ? ['அ', 'க', 'ம', 'ல்', 'ப', 'த', 'வ', 'ந', 'ர']
        : ['A', 'E', 'S', 'T', 'B', 'P', 'R', 'D', 'O'];

      // Assign emoji from Groq response or smart contextual default
      const emoji = typeof w.emoji === 'string' && w.emoji.trim()
        ? w.emoji.trim()
        : this.getSmartDefaultEmoji(cleanWord, isTamil);

      validated.push({
        id: `ai_${constraints.language}_lvl${constraints.difficulty}_${Date.now()}_${i}`,
        language: constraints.language,
        script: isTamil ? 'tamil' : 'latin',
        letter: letters[0] || (isTamil ? 'ம' : 'T'),
        word: cleanWord,
        meaning: typeof w.meaning === 'string' && w.meaning.trim() ? w.meaning.trim() : cleanWord,
        emoji,
        difficulty: constraints.difficulty,
        isRealWord: true,
        syllables: letters,
        distractors,
        tags: ['groq_ai_generated', `level_${constraints.difficulty}`],
      });
    }

    return validated.length >= 3 ? validated : null;
  }

  private getSmartDefaultEmoji(word: string, isTamil: boolean): string {
    const w = word.toLowerCase();
    if (isTamil) {
      if (w.includes('மலர்') || w.includes('பூ')) return '🌸';
      if (w.includes('பந்து')) return '⚽';
      if (w.includes('கப்பல்')) return '🚢';
      if (w.includes('தாமரை')) return '🪷';
      if (w.includes('அணில்')) return '🐿️';
      if (w.includes('மரம்')) return '🌳';
      if (w.includes('படம்')) return '🖼️';
      if (w.includes('கண்')) return '👁️';
      if (w.includes('கடல்')) return '🌊';
      if (w.includes('காடு')) return '🌲';
      if (w.includes('கிளி')) return '🦜';
      if (w.includes('மயில்')) return '🦚';
      if (w.includes('நிலா')) return '🌙';
      if (w.includes('மாம்பழம்')) return '🥭';
      if (w.includes('ஆப்பிள்')) return '🍎';
      return '✨';
    } else {
      if (w.includes('rain')) return '🌧️';
      if (w.includes('boat')) return '⛵';
      if (w.includes('duck')) return '🦆';
      if (w.includes('frog')) return '🐸';
      if (w.includes('moon')) return '🌙';
      if (w.includes('ball')) return '⚽';
      if (w.includes('lion')) return '🦁';
      if (w.includes('deer')) return '🦌';
      if (w.includes('rose')) return '🌹';
      if (w.includes('apple')) return '🍎';
      if (w.includes('horse')) return '🐴';
      if (w.includes('cloud')) return '☁️';
      if (w.includes('train')) return '🚂';
      if (w.includes('house')) return '🏡';
      return '✨';
    }
  }

  /**
   * Retrieves a non-repeating progressive batch for Level 3, 4, 5, etc.
   */
  private getDynamicProgressiveBatch(
    levelId: number,
    constraints: ContentGenerationConstraints
  ): ContentItem[] {
    const isTamil = constraints.language === 'ta';
    const bankMap = isTamil
      ? ContentGenerationService.PROGRESSIVE_BANK_TA
      : ContentGenerationService.PROGRESSIVE_BANK_EN;

    // Direct level match
    if (bankMap[levelId]) {
      return bankMap[levelId];
    }

    // Wrap around gracefully with distinct IDs
    const availableKeys = Object.keys(bankMap).map(Number);
    const key = availableKeys[(levelId - 3) % availableKeys.length] || 3;
    const baseWords = bankMap[key] || [];

    return baseWords.map((w, idx) => ({
      ...w,
      id: `${w.id}_lvl${levelId}_${idx}`,
      difficulty: constraints.difficulty,
    }));
  }
}

export const contentGenerationService = new ContentGenerationService();
