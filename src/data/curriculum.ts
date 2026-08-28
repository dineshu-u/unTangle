import { CreatureItem, WordKitePuzzle, ReadingStoryCard, FamilyVoiceNote } from '../types';

export const CREATURES_DATA: CreatureItem[] = [
  {
    id: 'c-ma',
    letterEn: 'M',
    letterTa: 'ம',
    letterSoundEn: 'M for Monkey',
    letterSoundTa: 'ம - குரங்கு',
    nameEn: 'Monkey',
    nameTa: 'குரங்கு',
    wordEn: 'Tree',
    wordTa: 'மரம்',
    meaningEn: 'M for Monkey who loves green trees',
    meaningTa: 'மரங்களில் தாவும் சுட்டி குரங்கு',
    emoji: '🐒',
    bgGradient: 'from-amber-100 to-orange-100 border-amber-300',
    unlocked: true,
  },
  {
    id: 'c-ka',
    letterEn: 'P',
    letterTa: 'க',
    letterSoundEn: 'P for Parrot',
    letterSoundTa: 'க - காகம் / கிளி',
    nameEn: 'Parrot',
    nameTa: 'கிளி',
    wordEn: 'Bird',
    wordTa: 'பறவை',
    meaningEn: 'P for cheerful green Parrot with sweet voice',
    meaningTa: 'கொய்யா பழம் உண்ணும் பச்சைக்கிளி',
    emoji: '🦜',
    bgGradient: 'from-emerald-100 to-teal-100 border-emerald-300',
    unlocked: true,
  },
  {
    id: 'c-a',
    letterEn: 'A',
    letterTa: 'அ',
    letterSoundEn: 'A for Ant',
    letterSoundTa: 'அ - எறும்பு',
    nameEn: 'Ant',
    nameTa: 'எறும்பு',
    wordEn: 'Home',
    wordTa: 'அகம்',
    meaningEn: 'A for tiny Ant carrying sweet sugar crystals',
    meaningTa: 'சர்க்கரை சுமக்கும் சுறுசுறுப்பான எறும்பு',
    emoji: '🐜',
    bgGradient: 'from-sky-100 to-indigo-100 border-sky-300',
    unlocked: true,
  },
  {
    id: 'c-pa',
    letterEn: 'B',
    letterTa: 'ப',
    letterSoundEn: 'B for Peacock',
    letterSoundTa: 'ப - படம் / மயில்',
    nameEn: 'Peacock',
    nameTa: 'மயில்',
    wordEn: 'Picture',
    wordTa: 'படம்',
    meaningEn: 'B for beautiful dancing Peacock',
    meaningTa: 'மழைக்காலத்தில் தோகை விரித்து ஆடும் மயில்',
    emoji: '🦚',
    bgGradient: 'from-blue-100 to-purple-100 border-blue-300',
    unlocked: true,
  },
  {
    id: 'c-va',
    letterEn: 'F',
    letterTa: 'வ',
    letterSoundEn: 'F for Butterfly',
    letterSoundTa: 'வ - வண்ணத்துப்பூச்சி',
    nameEn: 'Butterfly',
    nameTa: 'வண்ணத்துப்பூச்சி',
    wordEn: 'Sky',
    wordTa: 'வானம்',
    meaningEn: 'F for fluttering colorful Butterfly',
    meaningTa: 'பூக்களில் தேன் குடிக்கும் வண்ணத்துப்பூச்சி',
    emoji: '🦋',
    bgGradient: 'from-pink-100 to-rose-100 border-pink-300',
    unlocked: false,
  },
  {
    id: 'c-ani',
    letterEn: 'S',
    letterTa: 'அ',
    letterSoundEn: 'S for Squirrel',
    letterSoundTa: 'அ - அணில்',
    nameEn: 'Squirrel',
    nameTa: 'அணில்',
    wordEn: 'Garden',
    wordTa: 'தோட்டம்',
    meaningEn: 'S for playful village Squirrel',
    meaningTa: 'வாலை ஆட்டும் அழகிய அணில்',
    emoji: '🐿️',
    bgGradient: 'from-yellow-100 to-amber-100 border-amber-300',
    unlocked: false,
  }
];

export const WORD_KITE_PUZZLES: WordKitePuzzle[] = [
  {
    id: 'kite-1',
    targetWordEn: 'TREE',
    targetWordTa: 'மரம்',
    meaningEn: 'Tree that gives cool green shade',
    meaningTa: 'குளிர்ந்த நிழல் தரும் பசுமையான மரம்',
    syllablesTa: ['ம', 'ர', 'ம்'],
    syllablesEn: ['T', 'R', 'E', 'E'],
    distractorsTa: ['அ', 'க', 'கி', 'ல்', 'தெ', 'வ', 'தே', 'ப', 'த', 'ந'],
    distractorsEn: ['C', 'A', 'S', 'B', 'M', 'O', 'P', 'L'],
    emoji: '🌳'
  },
  {
    id: 'kite-2',
    targetWordEn: 'SUN',
    targetWordTa: 'படம்',
    meaningEn: 'Bright warm Sun in the morning sky',
    meaningTa: 'சுவரில் மாட்டிய அழகிய ஓவிய படம்',
    syllablesTa: ['ப', 'ட', 'ம்'],
    syllablesEn: ['S', 'U', 'N'],
    distractorsTa: ['ம', 'ர', 'க', 'ல்', 'அ', 'வ', 'ந', 'த'],
    distractorsEn: ['T', 'O', 'P', 'B', 'R', 'E', 'M', 'K'],
    emoji: '🖼️'
  },
  {
    id: 'kite-3',
    targetWordEn: 'CAT',
    targetWordTa: 'அகம்',
    meaningEn: 'Gentle playful cat that purrs softly',
    meaningTa: 'அன்பும் அமைதியும் நிறைந்த சொந்த இல்லம்',
    syllablesTa: ['அ', 'க', 'ம்'],
    syllablesEn: ['C', 'A', 'T'],
    distractorsTa: ['ம', 'ர', 'ப', 'ட', 'ல்', 'வ', 'ந'],
    distractorsEn: ['S', 'U', 'N', 'T', 'K', 'E', 'R'],
    emoji: '🏡'
  },
  {
    id: 'kite-4',
    targetWordEn: 'BIRD',
    targetWordTa: 'கண்',
    meaningEn: 'Singing bird with colorful wings',
    meaningTa: 'உலகை ரசிக்க உதவும் அழகிய விழி',
    syllablesTa: ['க', 'ண்'],
    syllablesEn: ['B', 'I', 'R', 'D'],
    distractorsTa: ['ம', 'ர', 'ப', 'ட', 'ல்', 'அ', 'வ'],
    distractorsEn: ['C', 'A', 'T', 'S', 'U', 'N', 'E'],
    emoji: '👁️'
  },
  {
    id: 'kite-5',
    targetWordEn: 'STAR',
    targetWordTa: 'கடல்',
    meaningEn: 'Sparkling star shining in the clear night sky',
    meaningTa: 'அலைகள் ஓயாத பரந்த நீலக் கடல்',
    syllablesTa: ['க', 'ட', 'ல்'],
    syllablesEn: ['S', 'T', 'A', 'R'],
    distractorsTa: ['ம', 'ர', 'ப', 'அ', 'வ', 'ந', 'க'],
    distractorsEn: ['B', 'I', 'R', 'D', 'C', 'A', 'T'],
    emoji: '🌊'
  }
];

export interface TeachMindyQuestion {
  id: string;
  wordTa: string;
  wordEn: string;
  sillyClaimTa: string;
  sillyClaimEn: string;
  promptTa: string;
  promptEn: string;
  options: {
    id: string;
    labelTa: string;
    labelEn: string;
    emoji: string;
    isCorrect: boolean;
  }[];
  meaningEn: string;
  meaningTa: string;
}

export const TEACH_MINDY_SCENARIOS: TeachMindyQuestion[] = [
  {
    id: 'tm-1',
    wordTa: 'மரம்',
    wordEn: 'TREE',
    sillyClaimTa: 'மிண்டி சொல்கிறது: மரம் என்றால்... ம்ம்ம்... பூனையா? 🐱',
    sillyClaimEn: 'Mindy says: TREE means a furry cat that purrs meow-meow? 🐱',
    promptTa: 'மரம் என்றால் என்னவென்று மிண்டிக்கு சொல்லிக் கொடுக்கலாமா?',
    promptEn: 'Can you teach Mindy what a tree really is?',
    options: [
      { id: 'opt-1', labelTa: 'நிழல் தரும் மரம்', labelEn: 'Shady green plant', emoji: '🌳', isCorrect: true },
      { id: 'opt-2', labelTa: 'மியாவ் பூனை', labelEn: 'Purring kitten', emoji: '🐱', isCorrect: false },
      { id: 'opt-3', labelTa: 'நீந்தும் மீன்', labelEn: 'Swimming fish', emoji: '🐟', isCorrect: false },
    ],
    meaningEn: 'Living plant with green leaves and sweet shade',
    meaningTa: 'பசுமையான இலைகளுடன் குளிர்ந்த நிழல் தரும் மரம்'
  },
  {
    id: 'tm-2',
    wordTa: 'கிளி',
    wordEn: 'PARROT',
    sillyClaimTa: 'மிண்டி சொல்கிறது: கிளி பழங்களை தின்னாமல் கற்களை தின்னுமா? 🪨',
    sillyClaimEn: 'Mindy says: PARROT eats heavy rocks and muddy pebbles? 🪨',
    promptTa: 'கிளி என்ன சாப்பிடும் என்று மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    promptEn: 'Can you teach Mindy what a parrot actually loves to eat?',
    options: [
      { id: 'opt-1', labelTa: 'பழங்கள் மற்றும் கொய்யா', labelEn: 'Guava and sweet fruits', emoji: '🍉', isCorrect: true },
      { id: 'opt-2', labelTa: 'கடினமான கற்கள்', labelEn: 'Hard garden rocks', emoji: '🪨', isCorrect: false },
      { id: 'opt-3', labelTa: 'காகித புத்தகங்கள்', labelEn: 'Paper storybooks', emoji: '📚', isCorrect: false },
    ],
    meaningEn: 'Green feathered bird that loves sweet fruits',
    meaningTa: 'சிவப்பு மூக்குடைய பழம் உண்ணும் பச்சைக்கிளி'
  },
  {
    id: 'tm-3',
    wordTa: 'மயில்',
    wordEn: 'PEACOCK',
    sillyClaimTa: 'மிண்டி சொல்கிறது: மயிலுக்கு தோகையே கிடையாது, அது வாத்து போல் கத்துமா? 🦆',
    sillyClaimEn: 'Mindy says: PEACOCK has no feathers and barks like a puppy? 🐶',
    promptTa: 'மயிலின் சிறப்பை மிண்டிக்கு கற்பிக்கலாமா?',
    promptEn: 'Can you teach Mindy what makes a peacock special?',
    options: [
      { id: 'opt-1', labelTa: 'தோகை விரித்து ஆடும்', labelEn: 'Spreads colorful feathers and dances', emoji: '🦚', isCorrect: true },
      { id: 'opt-2', labelTa: 'வாத்து போல் நீந்தும்', labelEn: 'Quacks underwater', emoji: '🦆', isCorrect: false },
      { id: 'opt-3', labelTa: 'நாய்க்குட்டி போல் குரைக்கும்', labelEn: 'Barks loud in the yard', emoji: '🐶', isCorrect: false },
    ],
    meaningEn: 'Majestic bird with colorful shimmering feathers',
    meaningTa: 'மழைக்காலத்தில் தோகை விரித்து ஆடும் அழகிய பறவை'
  }
];

export const READING_STORY_CARDS: ReadingStoryCard[] = [
  {
    id: 'story-ant',
    titleEn: "The Little Ant's Sweet Adventure",
    titleTa: "சின்ன எறும்பின் இனிப்பு பயணம்",
    illustration: "🐜🍃",
    contentEn: [
      "In the sunny village garden, a tiny little Ant found a sparkling white sugar cube.",
      "The cube was much bigger than the ant, but the ant was strong, cheerful, and patient.",
      "With steady steps across the green leaf, the ant carried the sugar to the banyan tree.",
      "Mindy the bird chirped happily: Little friends can do mighty wonders!"
    ],
    contentTa: [
      "சூரியன் பிரகாசிக்கும் கிராமத்து தோட்டத்தில், ஒரு குட்டி எறும்பு ஒரு வெள்ளையான சர்க்கரை கட்டியைக் கண்டது.",
      "அந்த சர்க்கரை கட்டி எறும்பை விட பெரிதாக இருந்தது, ஆனால் எறும்பு மிகுந்த தைரியத்துடன் இருந்தது.",
      "பசுமையான இலை மீது மெல்ல அடி எடுத்து வைத்து, எறும்பு ஆலமரத்தின் அடியில் தன் வீட்டிற்கு கொண்டு சென்றது.",
      "மிண்டி பறவை உற்சாகமாக பாடியது: சிறிய நண்பர்களும் பெரிய சாதனைகளை படைக்கலாம்!"
    ]
  },
  {
    id: 'story-kite',
    titleEn: "The Sky Dancer Kite",
    titleTa: "வானில் ஆடும் வண்ணக் காற்றாடி",
    illustration: "🪁✨",
    contentEn: [
      "The young explorer held the cotton string tight as the fresh breeze touched their smiling face.",
      "The diamond kite smiled, waving its colorful tail of red, yellow, and blue ribbons.",
      "Higher and higher it soared, dancing above the village tiled roofs and green trees.",
      "When we build real words with care, our thoughts fly high like the friendly kite!"
    ],
    contentTa: [
      "சிறு குழந்தை மென்மையான நூல் உருளையை கையில் பிடித்துக் கொண்டது; இனிய காற்று முகத்தில் வீசியது.",
      "அந்த வண்ணக் காற்றாடி புன்னகைத்து, சிவப்பு, மஞ்சள், நீல வாலாட்டிகளை காற்றில் அசைத்தது.",
      "கிராமத்து ஓட்டு வீடுகளுக்கும் தென்னை மரங்களுக்கும் மேலே அது உயர உயரப் பறந்தது.",
      "நாம் சரியான சொற்களை கவனமாக எழுதும்போது, நம் எண்ணங்களும் காற்றாடி போல் உயரே பறக்கும்!"
    ]
  }
];

export const PRE_RECORDED_VOICE_NOTES: FamilyVoiceNote[] = [
  {
    id: 'vn-amma',
    speakerEn: 'Amma (Mother)',
    speakerTa: 'அம்மா',
    titleEn: "Mother's Encouragement",
    titleTa: "அம்மாவின் அன்பு வாழ்த்து",
    messageEn: "Come on my little champion, you are doing wonderful! Let's explore together today!",
    messageTa: "வாடா கண்ணா! ரொம்ப அழகா படிக்கிறாய்! இன்று நாம் சேர்ந்து விளையாடலாம்!",
    dateRecorded: 'Today, 9:15 AM',
    isPreRecorded: true
  },
  {
    id: 'vn-appa',
    speakerEn: 'Appa (Father)',
    speakerTa: 'அப்பா',
    titleEn: "Father's Kite Cheer",
    titleTa: "அப்பாவின் காற்றாடி உற்சாகம்",
    messageEn: "Look at your kite flying so high in the sky! Proud of your effort, buddy!",
    messageTa: "உன் காற்றாடி வானத்தில் எவ்வளவு உயரமாக பறக்கிறது பார்! நீ ரொம்ப சமத்து!",
    dateRecorded: 'Yesterday, 6:30 PM',
    isPreRecorded: true
  },
  {
    id: 'vn-paati',
    speakerEn: 'Paati (Grandmother)',
    speakerTa: 'பாட்டி',
    titleEn: "Grandmother's Story Blessing",
    titleTa: "பாட்டியின் இனிய கதை ஆசி",
    messageEn: "Listen to the birds and trees in our village, sweet child. Every letter is a treasure!",
    messageTa: "கிராமத்து பறவைகளையும் மரங்களையும் பார் கண்ணா. ஒவ்வொரு எழுத்தும் ஒரு பொக்கிஷம்!",
    dateRecorded: '2 days ago',
    isPreRecorded: true
  }
];
