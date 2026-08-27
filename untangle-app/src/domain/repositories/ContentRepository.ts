import { AppLanguage, ContentItem, LetterItem, TeachMindyItem, StoryCardItem } from '../models/content';

import enLetters from '../../content/en/letters.json';
import enWords from '../../content/en/words.json';
import enTeachMindy from '../../content/en/teachMindy.json';
import enStories from '../../content/en/stories.json';

import taLetters from '../../content/ta/letters.json';
import taWords from '../../content/ta/words.json';
import taTeachMindy from '../../content/ta/teachMindy.json';
import taStories from '../../content/ta/stories.json';

export interface IContentRepository {
  getLetters(language: AppLanguage): LetterItem[];
  getLetterById(id: string, language: AppLanguage): LetterItem | undefined;
  getWords(language: AppLanguage): ContentItem[];
  getContentById(id: string, language: AppLanguage): ContentItem | undefined;
  getWordsForLetter(letter: string, language: AppLanguage): ContentItem[];
  getRealWords(language: AppLanguage): ContentItem[];
  getNonWords(language: AppLanguage): ContentItem[];
  getCreatureForLetter(letter: string, language: AppLanguage): LetterItem | undefined;
  getTeachMindyQuestions(language: AppLanguage): TeachMindyItem[];
  getStories(language: AppLanguage): StoryCardItem[];
  validateWord(word: string, language: AppLanguage): { isReal: boolean; item?: ContentItem };
}

export class LocalContentRepository implements IContentRepository {
  private letters: Record<AppLanguage, LetterItem[]>;
  private words: Record<AppLanguage, ContentItem[]>;
  private teachMindy: Record<AppLanguage, TeachMindyItem[]>;
  private stories: Record<AppLanguage, StoryCardItem[]>;

  constructor() {
    this.letters = {
      en: enLetters as LetterItem[],
      ta: taLetters as LetterItem[],
    };
    this.words = {
      en: enWords as ContentItem[],
      ta: taWords as ContentItem[],
    };
    this.teachMindy = {
      en: enTeachMindy as TeachMindyItem[],
      ta: taTeachMindy as TeachMindyItem[],
    };
    this.stories = {
      en: enStories as StoryCardItem[],
      ta: taStories as StoryCardItem[],
    };

    this.validateIntegrity();
  }

  private validateIntegrity() {
    // Basic verification against duplicate IDs or missing fields
    const languages: AppLanguage[] = ['en', 'ta'];
    for (const lang of languages) {
      const wordIds = new Set<string>();
      for (const w of this.words[lang]) {
        if (wordIds.has(w.id)) {
          console.warn(`[ContentRepository] Duplicate word ID detected: ${w.id} (${lang})`);
        }
        wordIds.add(w.id);
      }
    }
  }

  getLetters(language: AppLanguage): LetterItem[] {
    return this.letters[language] || [];
  }

  getLetterById(id: string, language: AppLanguage): LetterItem | undefined {
    return this.getLetters(language).find(l => l.id === id);
  }

  getWords(language: AppLanguage): ContentItem[] {
    return this.words[language] || [];
  }

  getContentById(id: string, language: AppLanguage): ContentItem | undefined {
    return this.getWords(language).find(w => w.id === id);
  }

  getWordsForLetter(letter: string, language: AppLanguage): ContentItem[] {
    return this.getWords(language).filter(w => w.letter.toLowerCase() === letter.toLowerCase());
  }

  getRealWords(language: AppLanguage): ContentItem[] {
    return this.getWords(language).filter(w => w.isRealWord);
  }

  getNonWords(language: AppLanguage): ContentItem[] {
    return this.getWords(language).filter(w => !w.isRealWord);
  }

  getCreatureForLetter(letter: string, language: AppLanguage): LetterItem | undefined {
    return this.getLetters(language).find(l => l.letter.toLowerCase() === letter.toLowerCase());
  }

  getTeachMindyQuestions(language: AppLanguage): TeachMindyItem[] {
    return this.teachMindy[language] || [];
  }

  getStories(language: AppLanguage): StoryCardItem[] {
    return this.stories[language] || [];
  }

  validateWord(word: string, language: AppLanguage): { isReal: boolean; item?: ContentItem } {
    const cleanWord = word.trim();
    const found = this.getWords(language).find(
      w => w.word.toLowerCase() === cleanWord.toLowerCase()
    );
    if (found && found.isRealWord) {
      return { isReal: true, item: found };
    }
    return { isReal: false };
  }
}

export const contentRepository = new LocalContentRepository();
