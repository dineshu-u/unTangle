import { LetterItem, AppLanguage } from '../domain/models/content';
import { GroqService } from './groqService';

/**
 * Curated fallback discovery library for Letter Garden beyond the initial 16 letters.
 * Covers remaining letters of the alphabet and rich familiar objects (animals, nature, fruits, toys, vehicles).
 * All items strictly follow language isolation and child-friendly phonetics.
 */
export const FALLBACK_DISCOVERY_EN: LetterItem[] = [
  // Stage 5 (Items 17-20)
  {
    id: 'fb_en_let_icecream',
    language: 'en',
    letter: 'I',
    sound: 'I for Ice cream',
    creatureName: 'Ice cream',
    associatedWord: 'Ice cream',
    meaning: 'Sweet cold ice cream cone on a sunny afternoon',
    emoji: '🍦',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_en_let_jellyfish',
    language: 'en',
    letter: 'J',
    sound: 'J for Jellyfish',
    creatureName: 'Jellyfish',
    associatedWord: 'Jellyfish',
    meaning: 'Translucent jellyfish gliding gracefully in the sea',
    emoji: '🪼',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_en_let_nest',
    language: 'en',
    letter: 'N',
    sound: 'N for Nest',
    creatureName: 'Nest',
    associatedWord: 'Nest',
    meaning: 'Cozy twig nest cradling little speckled eggs',
    emoji: '🪺',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_en_let_owl',
    language: 'en',
    letter: 'O',
    sound: 'O for Owl',
    creatureName: 'Owl',
    associatedWord: 'Owl',
    meaning: 'Wise night owl hooting softly from the tall oak',
    emoji: '🦉',
    unlocked: true,
    difficulty: 3,
  },

  // Stage 6 (Items 21-24)
  {
    id: 'fb_en_let_queen',
    language: 'en',
    letter: 'Q',
    sound: 'Q for Queen',
    creatureName: 'Queen',
    associatedWord: 'Queen',
    meaning: 'Kind village queen wearing a sparkling golden crown',
    emoji: '👑',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_en_let_violin',
    language: 'en',
    letter: 'V',
    sound: 'V for Violin',
    creatureName: 'Violin',
    associatedWord: 'Violin',
    meaning: 'Wooden violin playing sweet soothing village tunes',
    emoji: '🎻',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_en_let_watermelon',
    language: 'en',
    letter: 'W',
    sound: 'W for Watermelon',
    creatureName: 'Watermelon',
    associatedWord: 'Watermelon',
    meaning: 'Juicy green watermelon with sweet crisp red slices',
    emoji: '🍉',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_en_let_xylophone',
    language: 'en',
    letter: 'X',
    sound: 'X for Xylophone',
    creatureName: 'Xylophone',
    associatedWord: 'Xylophone',
    meaning: 'Rainbow xylophone chiming bright musical notes',
    emoji: '🎹',
    unlocked: true,
    difficulty: 3,
  },

  // Stage 7 (Items 25-28)
  {
    id: 'fb_en_let_yoyo',
    language: 'en',
    letter: 'Y',
    sound: 'Y for Yo-yo',
    creatureName: 'Yo-yo',
    associatedWord: 'Yo-yo',
    meaning: 'Spinning yo-yo bouncing cheerfully up and down',
    emoji: '🪀',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_en_let_zebra',
    language: 'en',
    letter: 'Z',
    sound: 'Z for Zebra',
    creatureName: 'Zebra',
    associatedWord: 'Zebra',
    meaning: 'Black and white striped zebra galloping across fields',
    emoji: '🦓',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_en_let_bear',
    language: 'en',
    letter: 'B',
    sound: 'B for Bear',
    creatureName: 'Bear',
    associatedWord: 'Bear',
    meaning: 'Furry brown bear searching for sweet wild honeycomb',
    emoji: '🐻',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_en_let_clock',
    language: 'en',
    letter: 'C',
    sound: 'C for Clock',
    creatureName: 'Clock',
    associatedWord: 'Clock',
    meaning: 'Friendly clock ticking the hours for morning stories',
    emoji: '⏰',
    unlocked: true,
    difficulty: 4,
  },

  // Stage 8 (Items 29-32)
  {
    id: 'fb_en_let_drum',
    language: 'en',
    letter: 'D',
    sound: 'D for Drum',
    creatureName: 'Drum',
    associatedWord: 'Drum',
    meaning: 'Village drum giving an energetic thump-thump rhythm',
    emoji: '🥁',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_en_let_fish',
    language: 'en',
    letter: 'F',
    sound: 'F for Fish',
    creatureName: 'Fish',
    associatedWord: 'Fish',
    meaning: 'Gleaming silver fish swimming merrily in clear water',
    emoji: '🐟',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_en_let_grapes',
    language: 'en',
    letter: 'G',
    sound: 'G for Grapes',
    creatureName: 'Grapes',
    associatedWord: 'Grapes',
    meaning: 'Sweet purple grapes clustered on green garden vines',
    emoji: '🍇',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_en_let_hat',
    language: 'en',
    letter: 'H',
    sound: 'H for Hat',
    creatureName: 'Hat',
    associatedWord: 'Hat',
    meaning: 'Brimmed sun hat protecting smiles on warm sunny days',
    emoji: '👒',
    unlocked: true,
    difficulty: 4,
  },

  // Stage 9 (Items 33-36)
  {
    id: 'fb_en_let_leaf',
    language: 'en',
    letter: 'L',
    sound: 'L for Leaf',
    creatureName: 'Leaf',
    associatedWord: 'Leaf',
    meaning: 'Fresh green leaf swaying softly in the gentle wind',
    emoji: '🍃',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_en_let_monkey',
    language: 'en',
    letter: 'M',
    sound: 'M for Monkey',
    creatureName: 'Monkey',
    associatedWord: 'Monkey',
    meaning: 'Playful monkey swinging through the leafy jungle trees',
    emoji: '🐒',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_en_let_penguin',
    language: 'en',
    letter: 'P',
    sound: 'P for Penguin',
    creatureName: 'Penguin',
    associatedWord: 'Penguin',
    meaning: 'Waddling black-and-white penguin sliding on cold ice',
    emoji: '🐧',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_en_let_star',
    language: 'en',
    letter: 'S',
    sound: 'S for Star',
    creatureName: 'Star',
    associatedWord: 'Star',
    meaning: 'Twinkling golden star sparkling in the velvet night sky',
    emoji: '⭐',
    unlocked: true,
    difficulty: 5,
  },

  // Stage 10 (Items 37-40)
  {
    id: 'fb_en_let_turtle',
    language: 'en',
    letter: 'T',
    sound: 'T for Turtle',
    creatureName: 'Turtle',
    associatedWord: 'Turtle',
    meaning: 'Patient green turtle paddling safely with a shell',
    emoji: '🐢',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_en_let_aeroplane',
    language: 'en',
    letter: 'A',
    sound: 'A for Aeroplane',
    creatureName: 'Aeroplane',
    associatedWord: 'Aeroplane',
    meaning: 'Silver aeroplane soaring high above fluffy white clouds',
    emoji: '✈️',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_en_let_book',
    language: 'en',
    letter: 'B',
    sound: 'B for Book',
    creatureName: 'Book',
    associatedWord: 'Book',
    meaning: 'Enchanting storybook packed with magical adventures',
    emoji: '📚',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_en_let_whale',
    language: 'en',
    letter: 'W',
    sound: 'W for Whale',
    creatureName: 'Whale',
    associatedWord: 'Whale',
    meaning: 'Gigantic blue whale creating joyful ocean waterspouts',
    emoji: '🐋',
    unlocked: true,
    difficulty: 5,
  },
];

export const FALLBACK_DISCOVERY_TA: LetterItem[] = [
  // Stage 5 (Items 17-20)
  {
    id: 'fb_ta_let_eetti',
    language: 'ta',
    letter: 'ஈ',
    sound: 'ஈ - ஈட்டி',
    creatureName: 'ஈட்டி',
    associatedWord: 'ஈட்டி',
    meaning: 'பழங்கால வீரர்கள் ஏந்தும் கூரிய எஃகு ஈட்டி',
    emoji: '🗡️',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_ta_let_oonjal',
    language: 'ta',
    letter: 'ஊ',
    sound: 'ஊ - ஊஞ்சல்',
    creatureName: 'ஊஞ்சல்',
    associatedWord: 'ஊஞ்சல்',
    meaning: 'மரக்கிளையில் மகிழ்ச்சியாக ஆடும் வண்ண ஊஞ்சல்',
    emoji: '🪅',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_ta_let_ainthu',
    language: 'ta',
    letter: 'ஐ',
    sound: 'ஐ - ஐந்து',
    creatureName: 'ஐந்து',
    associatedWord: 'ஐந்து',
    meaning: 'நம் கையில் இருக்கும் ஐந்து அன்பு விரல்கள்',
    emoji: '🖐️',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_ta_let_oudhatham',
    language: 'ta',
    letter: 'ஔ',
    sound: 'ஔ - ஔடதம்',
    creatureName: 'ஔடதம்',
    associatedWord: 'ஔடதம்',
    meaning: 'உடல்நலம் காக்கும் இயற்கை மூலிகை மருந்து ஔடதம்',
    emoji: '💊',
    unlocked: true,
    difficulty: 3,
  },

  // Stage 6 (Items 21-24)
  {
    id: 'fb_ta_let_singam',
    language: 'ta',
    letter: 'சி',
    sound: 'சி - சிங்கம்',
    creatureName: 'சிங்கம்',
    associatedWord: 'சிங்கம்',
    meaning: 'காட்டின் கம்பீரமான அரசன் தங்க நிற சிங்கம்',
    emoji: '🦁',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_ta_let_nari',
    language: 'ta',
    letter: 'ந',
    sound: 'ந - நரி',
    creatureName: 'நரி',
    associatedWord: 'நரி',
    meaning: 'காட்டில் புத்திசாலித்தனமாக வாழும் தந்திர நரி',
    emoji: '🦊',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_ta_let_laddu',
    language: 'ta',
    letter: 'ல',
    sound: 'ல - லட்டு',
    creatureName: 'லட்டு',
    associatedWord: 'லட்டு',
    meaning: 'பண்டிகையில் உண்ணும் இனிப்பான நெய் லட்டு',
    emoji: '🟡',
    unlocked: true,
    difficulty: 3,
  },
  {
    id: 'fb_ta_let_mampazham',
    language: 'ta',
    letter: 'மா',
    sound: 'மா - மாம்பழம்',
    creatureName: 'மாம்பழம்',
    associatedWord: 'மாம்பழம்',
    meaning: 'சுவை மிகுந்த முக்கனிகளில் ஒன்றான மாம்பழம்',
    emoji: '🥭',
    unlocked: true,
    difficulty: 3,
  },

  // Stage 7 (Items 25-28)
  {
    id: 'fb_ta_let_meen',
    language: 'ta',
    letter: 'மீ',
    sound: 'மீ - மீன்',
    creatureName: 'மீன்',
    associatedWord: 'மீன்',
    meaning: 'தெளிந்த ஆற்று நீரில் துள்ளி நீந்தும் வண்ண மீன்',
    emoji: '🐟',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_ta_let_muyal',
    language: 'ta',
    letter: 'மு',
    sound: 'மு - முயல்',
    creatureName: 'முயல்',
    associatedWord: 'முயல்',
    meaning: 'பச்சை புல்வெளியில் துள்ளி குதிக்கும் வெள்ளை முயல்',
    emoji: '🐇',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_ta_let_poonai',
    language: 'ta',
    letter: 'பூ',
    sound: 'பூ - பூனை',
    creatureName: 'பூனை',
    associatedWord: 'பூனை',
    meaning: 'வீட்டில் மியாவ் என பாடும் செல்லப் பூனை',
    emoji: '🐱',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_ta_let_kuthirai',
    language: 'ta',
    letter: 'கு',
    sound: 'கு - குதிரை',
    creatureName: 'குதிரை',
    associatedWord: 'குதிரை',
    meaning: 'காற்றைப் போல வேகமாக ஓடும் கம்பீர குதிரை',
    emoji: '🐴',
    unlocked: true,
    difficulty: 4,
  },

  // Stage 8 (Items 29-32)
  {
    id: 'fb_ta_let_vinmeen',
    language: 'ta',
    letter: 'வி',
    sound: 'வி - விண்மீன்',
    creatureName: 'விண்மீன்',
    associatedWord: 'விண்மீன்',
    meaning: 'இரவு வானில் மினுமினுக்கும் வெள்ளி விண்மீன்',
    emoji: '⭐',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_ta_let_aanthai',
    language: 'ta',
    letter: 'ஆ',
    sound: 'ஆ - ஆந்தை',
    creatureName: 'ஆந்தை',
    associatedWord: 'ஆந்தை',
    meaning: 'இரவில் விழித்திருந்து வேட்டையாடும் இரவு ஆந்தை',
    emoji: '🦉',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_ta_let_kaagam',
    language: 'ta',
    letter: 'கா',
    sound: 'கா - காகம்',
    creatureName: 'கா',
    associatedWord: 'காகம்',
    meaning: 'காலை நேரத்தில் விருந்தினர் வரவை கூவும் காகம்',
    emoji: '🐦',
    unlocked: true,
    difficulty: 4,
  },
  {
    id: 'fb_ta_let_deepam',
    language: 'ta',
    letter: 'தீ',
    sound: 'தீ - தீபம்',
    creatureName: 'தீபம்',
    associatedWord: 'தீபம்',
    meaning: 'மங்கலமான ஒளி வீசும் அழகிய அகல் விளக்கு',
    emoji: '🪔',
    unlocked: true,
    difficulty: 4,
  },

  // Stage 9 (Items 33-36)
  {
    id: 'fb_ta_let_pura',
    language: 'ta',
    letter: 'பு',
    sound: 'பு - புறா',
    creatureName: 'புறா',
    associatedWord: 'புறா',
    meaning: 'அமைதியை உணர்த்தும் சாந்தமான வெள்ளை புறா',
    emoji: '🕊️',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_ta_let_vaathu',
    language: 'ta',
    letter: 'வா',
    sound: 'வா - வாத்து',
    creatureName: 'வாத்து',
    associatedWord: 'வாத்து',
    meaning: 'தாமரைக் குளத்தில் மகிழ்ந்து நீந்தும் வண்ண வாத்து',
    emoji: '🦆',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_ta_let_vandu',
    language: 'ta',
    letter: 'வ',
    sound: 'வ - வண்டு',
    creatureName: 'வண்டு',
    associatedWord: 'வண்டு',
    meaning: 'மலரின் தேனைப் பருகும் ரீங்கார வண்டு',
    emoji: '🐞',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_ta_let_paappa',
    language: 'ta',
    letter: 'பா',
    sound: 'பா - பாப்பா',
    creatureName: 'பாப்பா',
    associatedWord: 'பாப்பா',
    meaning: 'மழலை குரலில் பேசி மகிழும் பாசமிகு பாப்பா',
    emoji: '👶',
    unlocked: true,
    difficulty: 5,
  },

  // Stage 10 (Items 37-40)
  {
    id: 'fb_ta_let_nel',
    language: 'ta',
    letter: 'நெ',
    sound: 'நெ - நெல்',
    creatureName: 'நெல்',
    associatedWord: 'நெல்',
    meaning: 'உழவர்கள் அறுவடை செய்யும் பொன்னிற நெற்கதிர்',
    emoji: '🌾',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_ta_let_vandi',
    language: 'ta',
    letter: 'வ',
    sound: 'வ - வண்டி',
    creatureName: 'வண்டி',
    associatedWord: 'வண்டி',
    meaning: 'வயல்வெளியில் பயிர்களை சுமந்து செல்லும் மாட்டு வண்டி',
    emoji: '🚜',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_ta_let_pazham',
    language: 'ta',
    letter: 'ப',
    sound: 'ப - வாழைப்பழம்',
    creatureName: 'வாழைப்பழம்',
    associatedWord: 'வாழைப்பழம்',
    meaning: 'ஊட்டச்சத்து நிறைந்த இனிப்பான மஞ்சள் வாழைப்பழம்',
    emoji: '🍌',
    unlocked: true,
    difficulty: 5,
  },
  {
    id: 'fb_ta_let_theeni',
    language: 'ta',
    letter: 'தே',
    sound: 'தே - தேனீ',
    creatureName: 'தேனீ',
    associatedWord: 'தேனீ',
    meaning: 'பூந்தோட்டத்தில் சுறுசுறுப்பாக தேன் சேர்க்கும் தேனீ',
    emoji: '🐝',
    unlocked: true,
    difficulty: 5,
  },
];

export class LetterGardenService {
  private static STORAGE_PREFIX = 'untangle_unlocked_letter_creatures_';

  /**
   * Retrieves all currently unlocked letter creatures for the language.
   * Starts with 4 baseline items (Stage 1), and can expand infinitely!
   */
  public static getUnlockedCreatures(
    language: AppLanguage,
    baseCreatures: LetterItem[]
  ): LetterItem[] {
    const saved = this.loadSavedCreatures(language);
    if (saved && saved.length >= 4) {
      return saved;
    }

    // Default baseline: First 4 creatures of Stage 1
    const initial = baseCreatures.slice(0, 4);
    this.saveCreatures(language, initial);
    return initial;
  }

  /**
   * Unlocks the next batch of 4 letter creatures WITHOUT ANY LIMIT.
   * 1. If base pool still has unrevealed items (up to 16), reveals the next 4.
   * 2. If beyond 16, calls Groq AI to dynamically generate 4 unique letter-word pairs (animals, objects, fruits, toys, nature).
   * 3. If Groq is offline or no key is present, pulls from the extensive fallback discovery bank!
   * 4. If fallback bank is exhausted (e.g. 40+ items), algorithmically synthesizes fresh items so discovery NEVER stops!
   */
  public static async discoverMoreCreatures(
    language: AppLanguage,
    baseCreatures: LetterItem[]
  ): Promise<{ newItems: LetterItem[]; allItems: LetterItem[]; source: 'groq' | 'base' | 'fallback' }> {
    const currentUnlocked = this.getUnlockedCreatures(language, baseCreatures);
    const currentCount = currentUnlocked.length;
    const isTa = language === 'ta';

    // Scenario A: Still within the baseline 16 items
    if (currentCount < baseCreatures.length) {
      const nextBatch = baseCreatures.slice(currentCount, currentCount + 4);
      const combined = [...currentUnlocked, ...nextBatch];
      this.saveCreatures(language, combined);
      return { newItems: nextBatch, allItems: combined, source: 'base' };
    }

    // Scenario B: Beyond the baseline 16 items -> DYNAMIC DISCOVERY WITHOUT LIMIT!
    const existingLetters = currentUnlocked.map((c) => c.letter);
    const nextStage = Math.floor(currentCount / 4) + 1;

    // 1. Try Groq AI Generation if API key is present
    try {
      const aiItems = await GroqService.generateLetterCreatures(language, nextStage, existingLetters);
      if (aiItems && Array.isArray(aiItems) && aiItems.length > 0) {
        const validated = aiItems.slice(0, 4).map((item, idx) => ({
          ...item,
          id: `ai_let_${language}_stg${nextStage}_${Date.now()}_${idx}`,
          language,
          unlocked: true,
          difficulty: nextStage,
          emoji: item.emoji || '✨',
        }));

        const combined = [...currentUnlocked, ...validated];
        this.saveCreatures(language, combined);
        return { newItems: validated, allItems: combined, source: 'groq' };
      }
    } catch {
      // Groq failed or offline -> fall back safely
    }

    // 2. Curated progressive fallback bank
    const fallbackPool = isTa ? FALLBACK_DISCOVERY_TA : FALLBACK_DISCOVERY_EN;
    const unlockedIds = new Set(currentUnlocked.map((c) => c.id));
    const unpickedFromFallback = fallbackPool.filter((c) => !unlockedIds.has(c.id));

    if (unpickedFromFallback.length > 0) {
      const nextBatch = unpickedFromFallback.slice(0, 4);
      const combined = [...currentUnlocked, ...nextBatch];
      this.saveCreatures(language, combined);
      return { newItems: nextBatch, allItems: combined, source: 'fallback' };
    }

    // 3. Algorithmic unlimited generator if user unlocks past 40 items!
    const synthesized: LetterItem[] = [];
    const openAlphabet = isTa
      ? ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'க', 'கி', 'கு', 'ச', 'த', 'ப', 'ம', 'வ']
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    for (let i = 0; i < 4; i++) {
      const letIndex = (currentCount + i) % openAlphabet.length;
      const letter = openAlphabet[letIndex];
      const id = `dyn_let_${language}_${currentCount + i}_${Date.now()}`;

      if (isTa) {
        synthesized.push({
          id,
          language: 'ta',
          letter,
          sound: `${letter} - ஒலி`,
          creatureName: `நண்பர் ${letter}`,
          associatedWord: `சொல் ${letter}`,
          meaning: `எழுத்து ${letter} தொடங்கும் ஒரு இனிய தமிழ் சொல்`,
          emoji: '🌟',
          unlocked: true,
          difficulty: nextStage,
        });
      } else {
        synthesized.push({
          id,
          language: 'en',
          letter,
          sound: `${letter} for Wonder`,
          creatureName: `Friend ${letter}`,
          associatedWord: `Wonder ${letter}`,
          meaning: `A joyful learning discovery beginning with ${letter}`,
          emoji: '🌟',
          unlocked: true,
          difficulty: nextStage,
        });
      }
    }

    const combined = [...currentUnlocked, ...synthesized];
    this.saveCreatures(language, combined);
    return { newItems: synthesized, allItems: combined, source: 'fallback' };
  }

  /**
   * Clears saved dynamic creatures and resets back to initial 4.
   */
  public static resetCreatures(language: AppLanguage, baseCreatures: LetterItem[]): LetterItem[] {
    const initial = baseCreatures.slice(0, 4);
    this.saveCreatures(language, initial);
    return initial;
  }

  private static loadSavedCreatures(language: AppLanguage): LetterItem[] | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const key = this.STORAGE_PREFIX + language;
      const saved = window.localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as LetterItem[];
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private static saveCreatures(language: AppLanguage, items: LetterItem[]): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const key = this.STORAGE_PREFIX + language;
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
}
