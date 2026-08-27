import { LearningSummary, ContentGenerationConstraints } from '../domain/models/playerProfile';
import { LetterItem, TeachMindyItem } from '../domain/models/content';
import { ApiKeyService } from './apiKeyService';

export interface RawGroqWordItem {
  id: string;
  word: string;
  letters: string[];
  meaning: string;
  emoji: string;
  isRealWord: boolean;
  difficulty: number;
  learningTarget?: string;
  distractors?: string[];
}

export interface RawGroqBatchResponse {
  language: 'en' | 'ta';
  difficulty: number;
  words: RawGroqWordItem[];
}

export class GroqService {
  private static apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private static model = 'llama-3.1-8b-instant';
  private static timeoutMs = 8000;

  /**
   * Generates dynamic level word batches tailored to student diagnostic history.
   */
  public static async generateWordBatch(
    summary: LearningSummary,
    constraints: ContentGenerationConstraints
  ): Promise<RawGroqBatchResponse | null> {
    const apiKey = ApiKeyService.getApiKey();
    if (!apiKey || apiKey.trim() === '') {
      return null;
    }

    const isTa = constraints.language === 'ta';
    const langName = isTa ? 'Tamil' : 'English';
    
    const scriptRule = isTa
      ? 'EVERY word and letter MUST be in genuine Tamil script (தமிழ் எழுத்துக்கள்). Do NOT use any English letters or transliterations.'
      : 'EVERY word and letter MUST be in standard English uppercase alphabet (e.g. FROG, DUCK, BOAT). Do NOT use any non-English characters.';

    const mistakesContext = summary.recentMistakes.length > 0
      ? `The child struggled with these words/patterns during earlier levels: ${summary.recentMistakes.map(m => m.word + (m.pattern ? ` (pattern: ${m.pattern})` : '')).join(', ')}. Please tailor words to gently reinforce these sound patterns.`
      : 'The child performed well. Provide fresh, engaging vocabulary slightly more challenging than before.';

    const avoidList = constraints.wordsToAvoid.length > 0
      ? `DO NOT repeat any of these already mastered words: ${constraints.wordsToAvoid.join(', ')}.`
      : '';

    const systemPrompt = `You are an expert child literacy educator and AI content generator for "Untangle", an adaptive gamified learning app for children aged 5-7.
Goal: Generate a brand-new, unique batch of ${constraints.numberOfWords} vocabulary words for Level ${summary.currentLevel}.

STRICT LANGUAGE & SCRIPT:
- Language: ${langName}
- ${scriptRule}

LEARNING CONSTRAINTS:
- Level: ${summary.currentLevel}
- Target Difficulty: ${constraints.difficulty} (1 = short 2-3 letter words, 2 = 3-4 letter words, 3 = 4-5 letter words).
- ${mistakesContext}
- ${avoidList}
${constraints.targetPatterns.length > 0 ? `- Target patterns needing reinforcement: ${constraints.targetPatterns.join(', ')}` : ''}

OUTPUT REQUIREMENTS:
You must return ONLY a JSON object matching this exact schema:
{
  "language": "${constraints.language}",
  "difficulty": ${constraints.difficulty},
  "words": [
    {
      "id": "gen_${constraints.language}_${summary.currentLevel}_1",
      "word": "word string in ${langName}",
      "letters": ["array", "of", "letters/syllables"],
      "meaning": "simple child-friendly meaning in ${langName}",
      "emoji": "a child-friendly emoji representing this word, e.g. 🌧️, 🌳, ⛵, 🐸, 🐶, 🍎, ☀️",
      "isRealWord": true,
      "difficulty": ${constraints.difficulty},
      "learningTarget": "letter being practiced",
      "distractors": ["array", "of", "4", "to", "6", "plausible", "distractor", "letters"]
    }
  ]
}`;

    const userPrompt = `Generate ${constraints.numberOfWords} fresh, unique, age-appropriate ${langName} words with emojis tailored for Level ${summary.currentLevel} for player "${summary.playerId}". Current success rate is ${Math.round(summary.recentSuccessRate * 100)}%. Do not repeat old words.`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 850,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed: RawGroqBatchResponse = JSON.parse(content);
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Generates dynamic creature/object letter pairs for Letter Garden based on child discovery.
   * Can use animals OR familiar everyday nature, fruits, vehicles, toys, and objects.
   */
  public static async generateLetterCreatures(
    language: 'en' | 'ta',
    stageNumber: number,
    existingLetters: string[]
  ): Promise<LetterItem[] | null> {
    const apiKey = ApiKeyService.getApiKey();
    if (!apiKey || apiKey.trim() === '') return null;

    const isTa = language === 'ta';
    const langName = isTa ? 'Tamil' : 'English';
    const scriptRule = isTa
      ? 'All item names and words MUST be in genuine Tamil script. Match the first letter exactly.'
      : 'All item names and words MUST be in English. Match the first letter exactly.';

    const systemPrompt = `You are the item generator for "Untangle" Letter World.
Generate 4 unique letter-word pairs for Stage ${stageNumber} in ${langName}.
${scriptRule}
IMPORTANT RULE: You can use friendly animals OR any familiar everyday nature, fruits, toys, vehicles, celestial bodies, or objects (e.g. 🍎 Apple, 🚗 Car, 🎈 Balloon, 🚂 Train, 🌸 Flower, ☀️ Sun, 🪁 Kite, 📚 Book, 🍍 அன்னாசி, 🚢 கப்பல், 🌈 வானவில், ⚽ பந்து)! It does NOT need to be strictly an animal!
Do not use these already unlocked letters: ${existingLetters.join(', ')}.

Respond ONLY with this JSON schema:
{
  "letters": [
    {
      "id": "gen_let_${language}_1",
      "language": "${language}",
      "letter": "letter string",
      "sound": "letter pronunciation clue",
      "creatureName": "name of child-friendly item/creature/object",
      "associatedWord": "word matching this letter",
      "meaning": "simple 1-sentence child meaning",
      "emoji": "matching emoji icon",
      "unlocked": true,
      "difficulty": ${stageNumber}
    }
  ]
}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate 4 fresh letter-creature discovery pairs for Stage ${stageNumber}.` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 600,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      if (!res.ok) return null;

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.letters) && parsed.letters.length > 0) {
        return parsed.letters as LetterItem[];
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generates dynamic Teach Mindy humorous mix-up question tailored to a word the child just encountered.
   */
  public static async generateTeachMindyQuestion(
    language: 'en' | 'ta',
    word: string,
    meaning: string,
    emoji: string
  ): Promise<TeachMindyItem | null> {
    const apiKey = ApiKeyService.getApiKey();
    if (!apiKey || apiKey.trim() === '') return null;

    const isTa = language === 'ta';
    const langName = isTa ? 'Tamil' : 'English';

    const systemPrompt = `You are a humorous dialogue writer for Mindy the baby bird in the learning game "Teach Mindy".
Mindy makes a silly, cute mistake about the word "${word}" (meaning: "${meaning}", emoji: "${emoji}") in ${langName}.
The child must correct Mindy!

OUTPUT JSON SCHEMA:
{
  "id": "tm_ai_${Date.now()}",
  "language": "${language}",
  "targetWord": "${word}",
  "sillyClaim": "Mindy's silly wrong claim in ${langName}",
  "prompt": "Encouraging prompt asking child to teach Mindy in ${langName}",
  "options": [
    { "id": "opt_1", "label": "Correct meaning in ${langName}", "emoji": "${emoji}", "isCorrect": true },
    { "id": "opt_2", "label": "Funny wrong option in ${langName}", "emoji": "funny emoji", "isCorrect": false },
    { "id": "opt_3", "label": "Another wrong option in ${langName}", "emoji": "funny emoji", "isCorrect": false }
  ],
  "meaning": "${meaning}",
  "difficulty": 1
}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate a funny mix-up about the word ${word}.` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      if (!res.ok) return null;

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content) as TeachMindyItem;
      if (parsed && parsed.sillyClaim && Array.isArray(parsed.options) && parsed.options.length >= 3) {
        // Automatically scramble options so the correct answer is randomized (never always first!)
        const copy = [...parsed.options];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        parsed.options = copy;
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }
}
