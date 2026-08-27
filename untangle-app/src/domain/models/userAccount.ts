export type AgeGroup = '5-8' | '9-12' | '13-15' | '16-18';

export interface UserAccount {
  parentMobile: string; // Primary Key for storage isolation (e.g. '9876543210')
  childName: string;
  username?: string; // Explorer username (e.g. 'aarav', 'kavi', 'leo', 'mindy')
  password?: string; // Secret word / password (e.g. 'village123')
  ageGroup: AgeGroup;
  avatar: string;
  language: 'en' | 'ta';
  createdAt: string;
  lastActive: string;
}

export const AGE_GROUP_CONFIG: Record<AgeGroup, {
  labelEn: string;
  labelTa: string;
  descEn: string;
  descTa: string;
  initialLevel: number;
  initialDifficulty: number;
  badgeEmoji: string;
}> = {
  '5-8': {
    labelEn: '5 - 8 years',
    labelTa: '5 - 8 வயது',
    descEn: 'Early Discovery: Phonics, Letter Sounds & Syllables',
    descTa: 'ஆரம்பக் கல்வி: எழுத்து ஒலிகள் மற்றும் அசை பிரித்தல்',
    initialLevel: 1,
    initialDifficulty: 1,
    badgeEmoji: '🐣',
  },
  '9-12': {
    labelEn: '9 - 12 years',
    labelTa: '9 - 12 வயது',
    descEn: 'Junior Explorer: Word Construction & Reading Fluency',
    descTa: 'இளம்பருவக் கற்றல்: சொல் உருவாக்கம் & வாசிப்புத் திறன்',
    initialLevel: 2,
    initialDifficulty: 2,
    badgeEmoji: '🪁',
  },
  '13-15': {
    labelEn: '13 - 15 years',
    labelTa: '13 - 15 வயது',
    descEn: 'Senior Scholar: Vocabulary Mastery & Storytelling',
    descTa: 'மேம்பட்ட கற்றல்: சொல்லகராதி & கதை வாசிப்பு',
    initialLevel: 3,
    initialDifficulty: 3,
    badgeEmoji: '📖',
  },
  '16-18': {
    labelEn: '16 - 18 years',
    labelTa: '16 - 18 வயது',
    descEn: 'Advanced Reader: High-Focus Literacy & Screening',
    descTa: 'முதிர்ந்த வாசிப்பு: ஆழமான கவனம் மற்றும் மதிப்பீடு',
    initialLevel: 4,
    initialDifficulty: 3,
    badgeEmoji: '🎓',
  },
};
