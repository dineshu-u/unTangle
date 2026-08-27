import { TeachMindyItem, AppLanguage, ContentItem } from '../domain/models/content';
import { ChildProgressState } from '../domain/models/progress';
import { GroqService } from './groqService';
import { ApiKeyService } from './apiKeyService';

export interface TeachMindyOption {
  id: string;
  label: string;
  emoji: string;
  isCorrect: boolean;
}

/**
 * Shuffles option array using Fisher-Yates algorithm.
 * Guarantees that the correct answer is NOT always the first option (randomized across positions 0, 1, 2).
 */
export function shuffleTeachMindyOptions<T extends { id: string; isCorrect: boolean }>(options: T[]): T[] {
  const copy = [...options];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Curated realistic fallback library of humorous Teach Mindy misconceptions (English).
 * Replaces repetitive demo data with 25+ witty, context-specific scenarios.
 */
export const REALISTIC_TEACH_MINDY_EN: TeachMindyItem[] = [
  {
    id: 'tm_en_sun',
    language: 'en',
    targetWord: 'SUN',
    sillyClaim: 'Mindy says: The SUN is a giant golden mango hanging in the clouds that birds peck for breakfast! 🥭',
    prompt: 'Can you teach Mindy what the sun really is?',
    options: [
      { id: 'opt_sun_1', label: 'Bright star warming our earth', emoji: '☀️', isCorrect: true },
      { id: 'opt_sun_2', label: 'Ripe sweet mango fruit', emoji: '🥭', isCorrect: false },
      { id: 'opt_sun_3', label: 'Yellow basketball in the sky', emoji: '🏀', isCorrect: false },
    ],
    meaning: 'Bright star in the sky that warms the earth and gives daytime light',
    difficulty: 1,
  },
  {
    id: 'tm_en_boat',
    language: 'en',
    targetWord: 'BOAT',
    sillyClaim: 'Mindy says: A BOAT is a giant floating wooden shoe that river fishes wear to stay dry! 👞',
    prompt: 'Can you teach Mindy what a boat actually does?',
    options: [
      { id: 'opt_boat_1', label: 'Vessel sailing across water', emoji: '⛵', isCorrect: true },
      { id: 'opt_boat_2', label: 'Floating wooden shoe', emoji: '👞', isCorrect: false },
      { id: 'opt_boat_3', label: 'Waterproof umbrella for frogs', emoji: '🐸', isCorrect: false },
    ],
    meaning: 'Vessel that travels across water carrying passengers or goods',
    difficulty: 1,
  },
  {
    id: 'tm_en_kite',
    language: 'en',
    targetWord: 'KITE',
    sillyClaim: 'Mindy says: A KITE is a flying magic handkerchief that escaped on a piece of string! 🧣',
    prompt: 'Can you explain to Mindy how a kite flies?',
    options: [
      { id: 'opt_kite_1', label: 'Colorful toy soaring on wind', emoji: '🪁', isCorrect: true },
      { id: 'opt_kite_2', label: 'Flying silk handkerchief', emoji: '🧣', isCorrect: false },
      { id: 'opt_kite_3', label: 'Runaway baby cloud', emoji: '☁️', isCorrect: false },
    ],
    meaning: 'Light diamond-shaped frame covered in paper flown in the wind',
    difficulty: 1,
  },
  {
    id: 'tm_en_train',
    language: 'en',
    targetWord: 'TRAIN',
    sillyClaim: 'Mindy says: A TRAIN is a giant metal caterpillar that drinks hot tea and whistles click-clack! 🐛',
    prompt: 'Can you teach Mindy what a train really is?',
    options: [
      { id: 'opt_train_1', label: 'Locomotive rolling on tracks', emoji: '🚂', isCorrect: true },
      { id: 'opt_train_2', label: 'Giant iron caterpillar', emoji: '🐛', isCorrect: false },
      { id: 'opt_train_3', label: 'Whistling kettle on wheels', emoji: '🫖', isCorrect: false },
    ],
    meaning: 'Connected line of railway cars traveling along tracks',
    difficulty: 1,
  },
  {
    id: 'tm_en_rain',
    language: 'en',
    targetWord: 'RAIN',
    sillyClaim: 'Mindy says: RAIN is sweet strawberry syrup that sleepy sky clouds spill on our heads! 🍓',
    prompt: 'Can you teach Mindy where rain comes from?',
    options: [
      { id: 'opt_rain_1', label: 'Water drops falling from sky', emoji: '🌧️', isCorrect: true },
      { id: 'opt_rain_2', label: 'Spilled strawberry syrup', emoji: '🍓', isCorrect: false },
      { id: 'opt_rain_3', label: 'Melting cotton candy drops', emoji: '🍬', isCorrect: false },
    ],
    meaning: 'Moisture condensed from the atmosphere falling in drops',
    difficulty: 1,
  },
  {
    id: 'tm_en_cat',
    language: 'en',
    targetWord: 'CAT',
    sillyClaim: 'Mindy says: A CAT is a tiny tiger that sings meow lullabies to put mice to sleep! 🐯',
    prompt: 'Can you teach Mindy about friendly cats?',
    options: [
      { id: 'opt_cat_1', label: 'Furry pet that purrs softly', emoji: '🐱', isCorrect: true },
      { id: 'opt_cat_2', label: 'Tiny singing circus tiger', emoji: '🐯', isCorrect: false },
      { id: 'opt_cat_3', label: 'Fluffy rabbit with claws', emoji: '🐇', isCorrect: false },
    ],
    meaning: 'Small domesticated carnivorous mammal with soft fur',
    difficulty: 1,
  },
  {
    id: 'tm_en_bird',
    language: 'en',
    targetWord: 'BIRD',
    sillyClaim: 'Mindy says: A BIRD is an aeroplane with feathers that runs on sunflower seeds! ✈️',
    prompt: 'Can you teach Mindy what makes birds special?',
    options: [
      { id: 'opt_bird_1', label: 'Feathered friend that flies', emoji: '🐦', isCorrect: true },
      { id: 'opt_bird_2', label: 'Seed-powered aeroplane', emoji: '✈️', isCorrect: false },
      { id: 'opt_bird_3', label: 'Flying musical whistle', emoji: '🪈', isCorrect: false },
    ],
    meaning: 'Warm-blooded egg-laying vertebrate with feathers and wings',
    difficulty: 1,
  },
  {
    id: 'tm_en_tree',
    language: 'en',
    targetWord: 'TREE',
    sillyClaim: 'Mindy says: A TREE is a giant green umbrella planted upside down in the dirt! ☂️',
    prompt: 'Can you teach Mindy what a tree really is?',
    options: [
      { id: 'opt_tree_1', label: 'Living plant with wood and leaves', emoji: '🌳', isCorrect: true },
      { id: 'opt_tree_2', label: 'Upside down green umbrella', emoji: '☂️', isCorrect: false },
      { id: 'opt_tree_3', label: 'Giant garden broccoli', emoji: '🥦', isCorrect: false },
    ],
    meaning: 'Woody perennial plant with trunk and leaves giving cool shade',
    difficulty: 1,
  },
  {
    id: 'tm_en_moon',
    language: 'en',
    targetWord: 'MOON',
    sillyClaim: 'Mindy says: The MOON is a glowing slice of cheese that the night stars eat for dinner! 🧀',
    prompt: 'Can you teach Mindy what shines in the night sky?',
    options: [
      { id: 'opt_moon_1', label: 'Glowing natural satellite in sky', emoji: '🌙', isCorrect: true },
      { id: 'opt_moon_2', label: 'Floating wheel of yellow cheese', emoji: '🧀', isCorrect: false },
      { id: 'opt_moon_3', label: 'Giant round night flashlight', emoji: '🔦', isCorrect: false },
    ],
    meaning: 'Natural satellite of the earth visible at night by reflected sunlight',
    difficulty: 1,
  },
  {
    id: 'tm_en_frog',
    language: 'en',
    targetWord: 'FROG',
    sillyClaim: 'Mindy says: A FROG is a bouncy green tennis ball that learned how to croak ribbit! 🎾',
    prompt: 'Can you teach Mindy about pond frogs?',
    options: [
      { id: 'opt_frog_1', label: 'Jumping amphibian near ponds', emoji: '🐸', isCorrect: true },
      { id: 'opt_frog_2', label: 'Croaking green tennis ball', emoji: '🎾', isCorrect: false },
      { id: 'opt_frog_3', label: 'Wet garden salad leaf', emoji: '🥬', isCorrect: false },
    ],
    meaning: 'Tailless amphibian with long hind legs for leaping in water',
    difficulty: 1,
  },
  {
    id: 'tm_en_star',
    language: 'en',
    targetWord: 'STAR',
    sillyClaim: 'Mindy says: A STAR is a golden firefly that forgot how to fly back down to earth! 🪲',
    prompt: 'Can you teach Mindy about twinkling stars?',
    options: [
      { id: 'opt_star_1', label: 'Twinkling distant celestial body', emoji: '⭐', isCorrect: true },
      { id: 'opt_star_2', label: 'Lost golden firefly', emoji: '🪲', isCorrect: false },
      { id: 'opt_star_3', label: 'Spark from a sky bonfire', emoji: '🔥', isCorrect: false },
    ],
    meaning: 'Luminous point in the night sky that is a large incandescent body',
    difficulty: 1,
  },
  {
    id: 'tm_en_milk',
    language: 'en',
    targetWord: 'MILK',
    sillyClaim: 'Mindy says: MILK is squeezed directly from fluffy morning clouds into bottles! ☁️',
    prompt: 'Can you teach Mindy where milk comes from?',
    options: [
      { id: 'opt_milk_1', label: 'Healthy white dairy drink', emoji: '🥛', isCorrect: true },
      { id: 'opt_milk_2', label: 'Squeezed morning cloud juice', emoji: '☁️', isCorrect: false },
      { id: 'opt_milk_3', label: 'Melted white ice cube', emoji: '🧊', isCorrect: false },
    ],
    meaning: 'Opaque white fluid rich in fat and protein produced by female mammals',
    difficulty: 1,
  },
  {
    id: 'tm_en_book',
    language: 'en',
    targetWord: 'BOOK',
    sillyClaim: 'Mindy says: A BOOK is a paper house where tiny story fairies live and sleep! 🧝',
    prompt: 'Can you teach Mindy what books are used for?',
    options: [
      { id: 'opt_book_1', label: 'Pages with stories and words to read', emoji: '📚', isCorrect: true },
      { id: 'opt_book_2', label: 'Paper house for fairies', emoji: '🧝', isCorrect: false },
      { id: 'opt_book_3', label: 'Folded paper summer fan', emoji: '🪭', isCorrect: false },
    ],
    meaning: 'Written or printed work consisting of pages bound together',
    difficulty: 1,
  },
  {
    id: 'tm_en_house',
    language: 'en',
    targetWord: 'HOUSE',
    sillyClaim: 'Mindy says: A HOUSE is a giant brick hat that people wear on their heads when sleeping! 🎩',
    prompt: 'Can you teach Mindy what a house is?',
    options: [
      { id: 'opt_house_1', label: 'Building where families live safely', emoji: '🏡', isCorrect: true },
      { id: 'opt_house_2', label: 'Giant brick sleeping hat', emoji: '🎩', isCorrect: false },
      { id: 'opt_house_3', label: 'Big wooden toy box', emoji: '📦', isCorrect: false },
    ],
    meaning: 'Building for human habitation, especially one that is lived in by a family',
    difficulty: 1,
  },
  {
    id: 'tm_en_horse',
    language: 'en',
    targetWord: 'HORSE',
    sillyClaim: 'Mindy says: A HORSE is a tall forest deer that lost its antlers in the wind! 🦌',
    prompt: 'Can you teach Mindy about horses?',
    options: [
      { id: 'opt_horse_1', label: 'Fast four-legged riding animal', emoji: '🐴', isCorrect: true },
      { id: 'opt_horse_2', label: 'Forest deer without horns', emoji: '🦌', isCorrect: false },
      { id: 'opt_horse_3', label: 'Very large barking watchdog', emoji: '🐕', isCorrect: false },
    ],
    meaning: 'Solid-hoofed herbivorous quadruped domesticated since prehistoric times',
    difficulty: 1,
  },
  {
    id: 'tm_en_fish',
    language: 'en',
    targetWord: 'FISH',
    sillyClaim: 'Mindy says: A FISH is a mermaid shiny coin that swims through river water! 🪙',
    prompt: 'Can you teach Mindy about fish in the river?',
    options: [
      { id: 'opt_fish_1', label: 'Water animal with fins and gills', emoji: '🐟', isCorrect: true },
      { id: 'opt_fish_2', label: 'Swimming silver coin', emoji: '🪙', isCorrect: false },
      { id: 'opt_fish_3', label: 'Floating river leaf', emoji: '🍃', isCorrect: false },
    ],
    meaning: 'Limbless cold-blooded vertebrate animal with gills and fins living in water',
    difficulty: 1,
  },
  {
    id: 'tm_en_apple',
    language: 'en',
    targetWord: 'APPLE',
    sillyClaim: 'Mindy says: An APPLE is a red rubber ball filled with sweet fruit perfume! 🔴',
    prompt: 'Can you teach Mindy what an apple really is?',
    options: [
      { id: 'opt_apple_1', label: 'Crisp delicious red tree fruit', emoji: '🍎', isCorrect: true },
      { id: 'opt_apple_2', label: 'Red bouncing rubber ball', emoji: '🔴', isCorrect: false },
      { id: 'opt_apple_3', label: 'Round garden tomato', emoji: '🍅', isCorrect: false },
    ],
    meaning: 'Round fruit of a tree of the rose family, typically with thin red or green skin',
    difficulty: 1,
  },
  {
    id: 'tm_en_flower',
    language: 'en',
    targetWord: 'FLOWER',
    sillyClaim: 'Mindy says: A FLOWER is a colorful butterfly taking a long sweet afternoon nap! 🦋',
    prompt: 'Can you teach Mindy about blooming garden flowers?',
    options: [
      { id: 'opt_flower_1', label: 'Colorful blossom of a plant', emoji: '🌸', isCorrect: true },
      { id: 'opt_flower_2', label: 'Sleeping colorful butterfly', emoji: '🦋', isCorrect: false },
      { id: 'opt_flower_3', label: 'Cup of morning rainwater', emoji: '🍵', isCorrect: false },
    ],
    meaning: 'Seed-bearing part of a plant consisting of reproductive organs and petals',
    difficulty: 1,
  },
  {
    id: 'tm_en_deer',
    language: 'en',
    targetWord: 'DEER',
    sillyClaim: 'Mindy says: A DEER is a forest pony that grows wooden tree branches on its head! 🌲',
    prompt: 'Can you teach Mindy what a deer is?',
    options: [
      { id: 'opt_deer_1', label: 'Graceful forest animal with antlers', emoji: '🦌', isCorrect: true },
      { id: 'opt_deer_2', label: 'Pony with tree branches', emoji: '🌲', isCorrect: false },
      { id: 'opt_deer_3', label: 'Jumping kangaroo', emoji: '🦘', isCorrect: false },
    ],
    meaning: 'Hoofed grazing or browsing animal with branching bony antlers',
    difficulty: 1,
  },
  {
    id: 'tm_en_clock',
    language: 'en',
    targetWord: 'CLOCK',
    sillyClaim: 'Mindy says: A CLOCK is a little metal cricket that chirps tick-tock all afternoon! 🦗',
    prompt: 'Can you teach Mindy how a clock works?',
    options: [
      { id: 'opt_clock_1', label: 'Instrument measuring time and hours', emoji: '⏰', isCorrect: true },
      { id: 'opt_clock_2', label: 'Mechanical ticking cricket', emoji: '🦗', isCorrect: false },
      { id: 'opt_clock_3', label: 'Round mirror with spinning sticks', emoji: '🪞', isCorrect: false },
    ],
    meaning: 'Mechanical or electrical device for measuring and showing time',
    difficulty: 1,
  },
  {
    id: 'tm_en_ball',
    language: 'en',
    targetWord: 'BALL',
    sillyClaim: 'Mindy says: A BALL is a lazy planet that fell out of space to bounce on village grass! 🪐',
    prompt: 'Can you teach Mindy what we do with a ball?',
    options: [
      { id: 'opt_ball_1', label: 'Round toy for kicking and throwing', emoji: '⚽', isCorrect: true },
      { id: 'opt_ball_2', label: 'Fallen rolling planet', emoji: '🪐', isCorrect: false },
      { id: 'opt_ball_3', label: 'Smooth round garden stone', emoji: '🪨', isCorrect: false },
    ],
    meaning: 'Solid or hollow spherical body used in games',
    difficulty: 1,
  },
];

/**
 * Curated realistic fallback library of humorous Teach Mindy misconceptions (Tamil).
 * 100% genuine Tamil script, pedagogical humor, zero English transliteration.
 */
export const REALISTIC_TEACH_MINDY_TA: TeachMindyItem[] = [
  {
    id: 'tm_ta_maram',
    language: 'ta',
    targetWord: 'மரம்',
    sillyClaim: 'மிண்டி சொல்கிறது: மரம் என்பது மண்ணில் நடப்பட்ட ஒரு பெரிய பச்சை நிறக் குடையா? ☂️',
    prompt: 'மரம் என்றால் என்னவென்று மிண்டிக்கு சொல்லிக் கொடுக்கலாமா?',
    options: [
      { id: 'opt_ta_maram_1', label: 'குளிர்ந்த நிழல் தரும் பசுமை மரம்', emoji: '🌳', isCorrect: true },
      { id: 'opt_ta_maram_2', label: 'மண்ணில் நின்ற பச்சை நிறக் குடை', emoji: '☂️', isCorrect: false },
      { id: 'opt_ta_maram_3', label: 'மரத்தாலான மின்சார கம்பம்', emoji: '🪵', isCorrect: false },
    ],
    meaning: 'பசுமையான இலைகளுடன் குளிர்ந்த நிழல் தரும் மரம்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_pattam',
    language: 'ta',
    targetWord: 'பட்டம்',
    sillyClaim: 'மிண்டி சொல்கிறது: பட்டம் என்பது வானத்தில் தப்பித்து ஓடும் ஒரு மாய கைக்குட்டையா? 🧣',
    prompt: 'பட்டம் காற்றில் எப்படி பறக்கும் என்று மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_pattam_1', label: 'நூலில் கட்டி பறக்கும் வண்ணப் பட்டம்', emoji: '🪁', isCorrect: true },
      { id: 'opt_ta_pattam_2', label: 'பறக்கும் மாயாஜால கைக்குட்டை', emoji: '🧣', isCorrect: false },
      { id: 'opt_ta_pattam_3', label: 'கயிற்றில் உலரும் சட்டை', emoji: '👕', isCorrect: false },
    ],
    meaning: 'காற்றின் விசையால் வானில் பறக்கவிடப்படும் வண்ணக் காகிதப் பட்டம்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_kappal',
    language: 'ta',
    targetWord: 'கப்பல்',
    sillyClaim: 'மிண்டி சொல்கிறது: கப்பல் என்பது தண்ணீரில் மிதக்கும் பெரிய மர காலணியா? 👞',
    prompt: 'கப்பலின் உண்மையான பயனை மிண்டிக்கு கற்பிக்கலாமா?',
    options: [
      { id: 'opt_ta_kappal_1', label: 'ஆழ்கடலில் செல்லும் பெரிய கப்பல்', emoji: '🚢', isCorrect: true },
      { id: 'opt_ta_kappal_2', label: 'மிதக்கும் பெரிய மர காலணி', emoji: '👞', isCorrect: false },
      { id: 'opt_ta_kappal_3', label: 'மீன்கள் அமரும் மரப் பலகை', emoji: '🪵', isCorrect: false },
    ],
    meaning: 'கடல் வழியே மனிதர்களையும் பொருட்களையும் ஏற்றிச் செல்லும் பெரிய நீர்வழி ஊர்தி',
    difficulty: 1,
  },
  {
    id: 'tm_ta_suriyan',
    language: 'ta',
    targetWord: 'சூரியன்',
    sillyClaim: 'மிண்டி சொல்கிறது: சூரியன் என்பது வானத்தில் சுடப்பட்ட ஒரு பெரிய தங்க தோசையா? 🥞',
    prompt: 'சூரியனின் சிறப்பை மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_suriyan_1', label: 'ஒளியும் வெப்பமும் தரும் பகல் விண்மீன்', emoji: '☀️', isCorrect: true },
      { id: 'opt_ta_suriyan_2', label: 'வானில் மிதக்கும் தங்க தோசை', emoji: '🥞', isCorrect: false },
      { id: 'opt_ta_suriyan_3', label: 'மஞ்சள் நிற வட்டப் பந்து', emoji: '🟡', isCorrect: false },
    ],
    meaning: 'பூமிக்கு பகல் வெளிச்சத்தையும் வெப்பத்தையும் தரும் விண்மீன்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_mazhai',
    language: 'ta',
    targetWord: 'மழை',
    sillyClaim: 'மிண்டி சொல்கிறது: மழை என்பது வானத்து மேகங்கள் சிந்தும் இனிப்பான இளநீரா? 🥥',
    prompt: 'மழை எங்கிருந்து வருகிறது என்று மிண்டிக்கு சொல்லிக் கொடுக்கலாமா?',
    options: [
      { id: 'opt_ta_mazhai_1', label: 'மேகங்களிலிருந்து பொழியும் நீர்த்துளிகள்', emoji: '🌧️', isCorrect: true },
      { id: 'opt_ta_mazhai_2', label: 'வானத்திலிருந்து சிந்தும் இளநீர்', emoji: '🥥', isCorrect: false },
      { id: 'opt_ta_mazhai_3', label: 'மேகத்தின் இனிப்பு பனித்தூள்', emoji: '❄️', isCorrect: false },
    ],
    meaning: 'மேகங்கள் குளிர்ந்து நிலத்தில் பொழியும் நன்னீர்த் துளிகள்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_nila',
    language: 'ta',
    targetWord: 'நிலா',
    sillyClaim: 'மிண்டி சொல்கிறது: நிலா என்பது இரவு வானில் ஒளிரும் சுவையான வெண்ணெய் உருண்டையா? 🧈',
    prompt: 'நிலா பற்றி மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_nila_1', label: 'இரவில் பால் நிலவாக ஒளிரும் சந்திரன்', emoji: '🌙', isCorrect: true },
      { id: 'opt_ta_nila_2', label: 'வானில் மிதக்கும் வெண்ணெய் உருண்டை', emoji: '🧈', isCorrect: false },
      { id: 'opt_ta_nila_3', label: 'இரவு நேர பெரிய மின்விளக்கு', emoji: '💡', isCorrect: false },
    ],
    meaning: 'பூமியைச் சுற்றி வரும் இயற்கை துணைக்கோள்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_panthu',
    language: 'ta',
    targetWord: 'பந்து',
    sillyClaim: 'மிண்டி சொல்கிறது: பந்து என்பது நிலத்தில் உருளும் ஒரு சிறிய இனிப்பு தர்பூசணியா? 🍉',
    prompt: 'பந்து வைத்து நாம் என்ன செய்வோம் என்று மிண்டிக்கு சொல்லுங்கள்!',
    options: [
      { id: 'opt_ta_panthu_1', label: 'உதைத்து எறிந்து விளையாடும் பந்து', emoji: '⚽', isCorrect: true },
      { id: 'opt_ta_panthu_2', label: 'உருளும் இனிப்பு தர்பூசணி', emoji: '🍉', isCorrect: false },
      { id: 'opt_ta_panthu_3', label: 'வட்ட வடிவ கல்', emoji: '🪨', isCorrect: false },
    ],
    meaning: 'விளையாடுவதற்கு உதவும் உருண்டையான ரப்பர் அல்லது தோல் பொருள்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_kili',
    language: 'ta',
    targetWord: 'கிளி',
    sillyClaim: 'மிண்டி சொல்கிறது: கிளி என்பது மனிதர்களைப் போல பேசும் ஒரு பச்சை நிற விசிலா? 🪈',
    prompt: 'கிளி என்ன செய்யும் என்று மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_kili_1', label: 'பழம் உண்ணும் அழகிய பச்சைக்கிளி', emoji: '🦜', isCorrect: true },
      { id: 'opt_ta_kili_2', label: 'பேசும் பச்சை நிற விசில்', emoji: '🪈', isCorrect: false },
      { id: 'opt_ta_kili_3', label: 'பறக்கும் மாங்காய் பழம்', emoji: '🥭', isCorrect: false },
    ],
    meaning: 'சிவப்பு மூக்கும் பச்சை நிற இறக்கைகளும் கொண்ட கொய்யாப்பழம் விரும்பி உண்ணும் பறவை',
    difficulty: 1,
  },
  {
    id: 'tm_ta_mayil',
    language: 'ta',
    targetWord: 'மயில்',
    sillyClaim: 'மிண்டி சொல்கிறது: மயில் என்பது வானவில்லையே விசிறியாக மாற்றி ஆடும் பொம்மையா? 🪭',
    prompt: 'மயிலின் சிறப்பை மிண்டிக்கு கற்பிக்கலாமா?',
    options: [
      { id: 'opt_ta_mayil_1', label: 'தோகை விரித்து ஆடும் அழகிய மயில்', emoji: '🦚', isCorrect: true },
      { id: 'opt_ta_mayil_2', label: 'வானவில் விசிறியுடைய பொம்மை', emoji: '🪭', isCorrect: false },
      { id: 'opt_ta_mayil_3', label: 'நீல நிற காட்டு வாத்து', emoji: '🦆', isCorrect: false },
    ],
    meaning: 'மழைக்காலத்தில் தோகை விரித்து ஆடும் அழகிய தேசியப் பறவை',
    difficulty: 1,
  },
  {
    id: 'tm_ta_meen',
    language: 'ta',
    targetWord: 'மீன்',
    sillyClaim: 'மிண்டி சொல்கிறது: மீன் என்பது தண்ணீரிலேயே மூழ்கி நீந்தும் வெள்ளி நாணயமா? 🪙',
    prompt: 'மீன் பற்றி மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_meen_1', label: 'நீரில் செவுள்களால் சுவாசித்து நீந்தும் மீன்', emoji: '🐟', isCorrect: true },
      { id: 'opt_ta_meen_2', label: 'நீரில் மிதக்கும் வெள்ளி நாணயம்', emoji: '🪙', isCorrect: false },
      { id: 'opt_ta_meen_3', label: 'நீந்தும் கண்ணாடி இலை', emoji: '🍃', isCorrect: false },
    ],
    meaning: 'நீரில் வாழ்ந்து செவுள்களால் சுவாசிக்கும் துடுப்புடைய உயிரினம்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_singam',
    language: 'ta',
    targetWord: 'சிங்கம்',
    sillyClaim: 'மிண்டி சொல்கிறது: சிங்கம் என்பது காட்டில் கர்ஜிக்கும் ஒரு பெரிய தங்க பொம்மையா? 🧸',
    prompt: 'காட்டு ராஜாவான சிங்கம் பற்றி மிண்டிக்கு சொல்லுங்கள்!',
    options: [
      { id: 'opt_ta_singam_1', label: 'பிடரி மயிர் கொண்ட கம்பீர காட்டு ராஜா', emoji: '🦁', isCorrect: true },
      { id: 'opt_ta_singam_2', label: 'கர்ஜிக்கும் தங்க பொம்மை', emoji: '🧸', isCorrect: false },
      { id: 'opt_ta_singam_3', label: 'அடர்ந்த காட்டின் பெரிய நாய்', emoji: '🐕', isCorrect: false },
    ],
    meaning: 'காட்டின் அரசனாக போற்றப்படும் வலிமைமிக்க விலங்கு',
    difficulty: 1,
  },
  {
    id: 'tm_ta_yaanai',
    language: 'ta',
    targetWord: 'யானை',
    sillyClaim: 'மிண்டி சொல்கிறது: யானை என்பது நீண்ட குழாய் மூக்குடன் நடக்கும் பெரிய மலைக்குன்றா? 🏔️',
    prompt: 'யானை பற்றி மிண்டிக்கு சொல்லிக் கொடுக்கலாமா?',
    options: [
      { id: 'opt_ta_yaanai_1', label: 'துதிக்கையும் தந்தமும் கொண்ட பெரிய விலங்கு', emoji: '🐘', isCorrect: true },
      { id: 'opt_ta_yaanai_2', label: 'நடக்கும் சாம்பல் நிற மலைக்குன்று', emoji: '🏔️', isCorrect: false },
      { id: 'opt_ta_yaanai_3', label: 'நீண்ட குழாய் கொண்ட உழவு வண்டி', emoji: '🚜', isCorrect: false },
    ],
    meaning: 'நீண்ட துதிக்கையும் பெரிய காதுகளும் கொண்ட நில வாழ் பேருயிரினம்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_kuthirai',
    language: 'ta',
    targetWord: 'குதிரை',
    sillyClaim: 'மிண்டி சொல்கிறது: குதிரை என்பது காற்றை விட வேகமாக சுற்றும் மரக் குதிரையா? 🎠',
    prompt: 'குதிரை பற்றி மிண்டிக்கு விளக்குங்கள்!',
    options: [
      { id: 'opt_ta_kuthirai_1', label: 'வேகமாக ஓடும் பிடரி மயிர் கொண்ட விலங்கு', emoji: '🐴', isCorrect: true },
      { id: 'opt_ta_kuthirai_2', label: 'சுற்றும் மரக் குதிரை பொம்மை', emoji: '🎠', isCorrect: false },
      { id: 'opt_ta_kuthirai_3', label: 'கொம்பில்லாத பெரிய மான்', emoji: '🦌', isCorrect: false },
    ],
    meaning: 'மனிதர்களின் பயணத்திற்கும் விரைவு ஓட்டத்திற்கும் பயன்படும் விலங்கு',
    difficulty: 1,
  },
  {
    id: 'tm_ta_muyal',
    language: 'ta',
    targetWord: 'முயல்',
    sillyClaim: 'மிண்டி சொல்கிறது: முயல் என்பது புல்வெளியில் துள்ளி ஓடும் பஞ்சுப் பொதியா? ☁️',
    prompt: 'முயல் பற்றி மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_muyal_1', label: 'நீண்ட காதுகளுடன் துள்ளும் வெள்ளை முயல்', emoji: '🐇', isCorrect: true },
      { id: 'opt_ta_muyal_2', label: 'துள்ளி குதிக்கும் பஞ்சுப் பொதி', emoji: '☁️', isCorrect: false },
      { id: 'opt_ta_muyal_3', label: 'வெள்ளை நிற சுண்டெலி', emoji: '🐁', isCorrect: false },
    ],
    meaning: 'நீண்ட காதுகளும் மென்மையான உரோமமும் கொண்டு கேரட் உண்ணும் விலங்கு',
    difficulty: 1,
  },
  {
    id: 'tm_ta_thamarai',
    language: 'ta',
    targetWord: 'தாமரை',
    sillyClaim: 'மிண்டி சொல்கிறது: தாமரை என்பது குளத்து நீரில் மிதக்கும் இளஞ்சிவப்பு படகா? ⛵',
    prompt: 'தாமரை மலர் பற்றி மிண்டிக்கு கற்பிக்கலாமா?',
    options: [
      { id: 'opt_ta_thamarai_1', label: 'சேற்று நீரில் அழகாக மலரும் தேசிய மலர்', emoji: '🪷', isCorrect: true },
      { id: 'opt_ta_thamarai_2', label: 'நீரில் மிதக்கும் இளஞ்சிவப்பு படகு', emoji: '⛵', isCorrect: false },
      { id: 'opt_ta_thamarai_3', label: 'குளத்து நீரில் மிதக்கும் ரோஜா', emoji: '🌹', isCorrect: false },
    ],
    meaning: 'குளத்து நீரில் விரிந்து மலரும் புனிதமான தேசிய மலர்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_aappil',
    language: 'ta',
    targetWord: 'ஆப்பிள்',
    sillyClaim: 'மிண்டி சொல்கிறது: ஆப்பிள் என்பது மரத்தில் பழுத்த சிகப்பு நிற கிரிக்கெட் பந்தா? 🏏',
    prompt: 'ஆப்பிள் பற்றி மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_aappil_1', label: 'இனிப்பும் சுவையும் நிறைந்த சிகப்பு பழம்', emoji: '🍎', isCorrect: true },
      { id: 'opt_ta_aappil_2', label: 'சிகப்பு நிற கிரிக்கெட் பந்து', emoji: '🏏', isCorrect: false },
      { id: 'opt_ta_aappil_3', label: 'சுவையான சிகப்பு தக்காளி', emoji: '🍅', isCorrect: false },
    ],
    meaning: 'உடலுக்கு நலம் சேர்க்கும் சத்துக்கள் நிறைந்த இனிய சிகப்பு பழம்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_mampazham',
    language: 'ta',
    targetWord: 'மாம்பழம்',
    sillyClaim: 'மிண்டி சொல்கிறது: மாம்பழம் என்பது மரக் கிளையில் தொங்கும் தங்க விளக்கா? 🪔',
    prompt: 'மாம்பழம் பற்றி மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_mampazham_1', label: 'இனிப்பு நிறைந்த முக்கனிகளில் ஒன்றான பழம்', emoji: '🥭', isCorrect: true },
      { id: 'opt_ta_mampazham_2', label: 'கிளையில் தொங்கும் தங்க விளக்கு', emoji: '🪔', isCorrect: false },
      { id: 'opt_ta_mampazham_3', label: 'மஞ்சள் நிற வர்ண பலூன்', emoji: '🎈', isCorrect: false },
    ],
    meaning: 'மா, பலா, வாழை ஆகிய முக்கனிகளில் முதன்மையான சுவையான பழம்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_vandu',
    language: 'ta',
    targetWord: 'வண்டு',
    sillyClaim: 'மிண்டி சொல்கிறது: வண்டு என்பது பூக்களுக்குள் ரகசியம் பேசும் ஒரு சிறிய வானூர்தியா? 🚁',
    prompt: 'வண்டு என்ன செய்கிறது என்று மிண்டிக்கு சொல்லுங்கள்!',
    options: [
      { id: 'opt_ta_vandu_1', label: 'தேனைப் பருகும் ரீங்கார வண்டு', emoji: '🐞', isCorrect: true },
      { id: 'opt_ta_vandu_2', label: 'பறக்கும் பொம்மை வானூர்தி', emoji: '🚁', isCorrect: false },
      { id: 'opt_ta_vandu_3', label: 'சுழலும் கருப்பு பட்டாணி', emoji: '🫛', isCorrect: false },
    ],
    meaning: 'மலர்களில் உள்ள தேனைப் பருகி ரீங்காரமிடும் சிறு பூச்சி',
    difficulty: 1,
  },
  {
    id: 'tm_ta_veedu',
    language: 'ta',
    targetWord: 'வீடு',
    sillyClaim: 'மிண்டி சொல்கிறது: வீடு என்பது மக்கள் அனைவரும் தலையில் சுமக்கும் பெரிய செங்கல் தொப்பியா? 🎩',
    prompt: 'வீடு என்றால் என்னவென்று மிண்டிக்கு சொல்லிக் கொடுக்கலாமா?',
    options: [
      { id: 'opt_ta_veedu_1', label: 'குடும்பத்தினர் அன்புடன் வாழும் வசிப்பிடம்', emoji: '🏡', isCorrect: true },
      { id: 'opt_ta_veedu_2', label: 'பெரிய செங்கல் தொப்பி', emoji: '🎩', isCorrect: false },
      { id: 'opt_ta_veedu_3', label: 'பெரிய மரப் பெட்டி', emoji: '📦', isCorrect: false },
    ],
    meaning: 'மழை, வெயிலில் இருந்து பாதுகாப்பு தந்து குடும்பத்தோடு வாழும் இல்லம்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_paal',
    language: 'ta',
    targetWord: 'பால்',
    sillyClaim: 'மிண்டி சொல்கிறது: பால் என்பது வெள்ளையான காலை மேகத்திலிருந்து பிழியப்பட்டதா? ☁️',
    prompt: 'பால் பற்றி மிண்டிக்கு சொல்லிக் கொடுங்கள்!',
    options: [
      { id: 'opt_ta_paal_1', label: 'வலிமை தரும் சத்தான வெண்மை நிற பானம்', emoji: '🥛', isCorrect: true },
      { id: 'opt_ta_paal_2', label: 'வெள்ளை மேகத்திலிருந்து பிழிந்த சாறு', emoji: '☁️', isCorrect: false },
      { id: 'opt_ta_paal_3', label: 'திரவ சுண்ணாம்புக் கரைசல்', emoji: '⚪', isCorrect: false },
    ],
    meaning: 'உடலுக்கு கால்சியம் மற்றும் ஊட்டச்சத்து தரும் வெண்மை நிறப் பால்',
    difficulty: 1,
  },
  {
    id: 'tm_ta_deepam',
    language: 'ta',
    targetWord: 'தீபம்',
    sillyClaim: 'மிண்டி சொல்கிறது: தீபம் என்பது இருளை விரட்டும் ஒரு சிறிய தங்க நட்சத்திரமா? ⭐',
    prompt: 'தீபத்தின் ஒளியைப் பற்றி மிண்டிக்கு விளக்குங்கள்!',
    options: [
      { id: 'opt_ta_deepam_1', label: 'இருள் நீக்கி ஒளி தரும் மங்கல விளக்கு', emoji: '🪔', isCorrect: true },
      { id: 'opt_ta_deepam_2', label: 'மண்ணில் இறங்கிய சிறிய தங்க விண்மீன்', emoji: '⭐', isCorrect: false },
      { id: 'opt_ta_deepam_3', label: 'கண்ணாடி மின்மினிப் பூச்சி', emoji: '🪲', isCorrect: false },
    ],
    meaning: 'எண்ணெய் ஊற்றி திரியிட்டு ஏற்றப்படும் மங்கல அகல் விளக்கு',
    difficulty: 1,
  },
];

export class TeachMindyService {
  private static usedWordsByLanguage: Record<AppLanguage, Set<string>> = {
    en: new Set<string>(),
    ta: new Set<string>(),
  };

  /**
   * Retrieves a diverse, initial set of realistic Teach Mindy questions with guaranteed shuffled options.
   * Eliminates the repetitive demo duck data and avoids repeating words.
   */
  public static getInitialScenarios(
    language: AppLanguage,
    progress?: ChildProgressState,
    levelWords?: ContentItem[]
  ): TeachMindyItem[] {
    const isTa = language === 'ta';
    const fallbackList = isTa ? REALISTIC_TEACH_MINDY_TA : REALISTIC_TEACH_MINDY_EN;
    const taughtWordsSet = new Set<string>(
      (progress?.lessonCards || []).map((c) => c.word.toLowerCase())
    );

    const pool = [...fallbackList].filter(
      (item) => !taughtWordsSet.has(item.targetWord.toLowerCase())
    );

    // If all words were already taught, fall back to full pool
    const activePool = pool.length >= 3 ? pool : fallbackList;

    // Dynamically incorporate current level words with realistic tailored distractors
    const dynamicLevelScenarios = (levelWords || [])
      .filter((w) => w.isRealWord && !taughtWordsSet.has(w.word.toLowerCase()))
      .slice(0, 3)
      .map((w) => this.synthesizeWordScenario(language, w.word, w.meaning, w.emoji || '✨'));

    const combined = [...dynamicLevelScenarios, ...activePool];

    // Guarantee options are shuffled on every scenario!
    return combined.map((scenario) => ({
      ...scenario,
      options: shuffleTeachMindyOptions(scenario.options),
    }));
  }

  /**
   * Generates a single, realistic Teach Mindy misconception using Groq AI.
   * If Groq API key is present, calls llama-3.1-8b-instant with context-specific instructions.
   * If Groq is unavailable, pulls a fresh, unrepeated scenario from the realistic library.
   * In ALL cases, options are randomized so option 0 is NOT always the correct answer!
   */
  public static async generateNextScenario(
    language: AppLanguage,
    preferredWord?: { word: string; meaning: string; emoji?: string },
    avoidWords: string[] = []
  ): Promise<{ scenario: TeachMindyItem; source: 'groq_ai' | 'fallback' }> {
    const isTa = language === 'ta';
    const usedSet = this.usedWordsByLanguage[language];
    const avoidSet = new Set([...avoidWords, ...Array.from(usedSet)].map((w) => w.toLowerCase()));

    // 1. Try Groq AI Generation if API key is active
    if (ApiKeyService.hasApiKey()) {
      try {
        const targetWord = preferredWord?.word || (isTa ? 'வானவில்' : 'RAINBOW');
        const targetMeaning = preferredWord?.meaning || (isTa ? 'மழையின் பின் தோன்றும் ஏழு வண்ண வானவில்' : 'Seven arching colors in the clearing sky');
        const targetEmoji = preferredWord?.emoji || '🌈';

        const aiScenario = await GroqService.generateTeachMindyQuestion(
          language,
          targetWord,
          targetMeaning,
          targetEmoji
        );

        if (aiScenario && aiScenario.options && aiScenario.options.length >= 3) {
          // Guarantee options are shuffled!
          const prepared: TeachMindyItem = {
            ...aiScenario,
            options: shuffleTeachMindyOptions(aiScenario.options),
          };

          usedSet.add(prepared.targetWord.toLowerCase());
          return { scenario: prepared, source: 'groq_ai' };
        }
      } catch {
        // Fall back gracefully
      }
    }

    // 2. Select from curated realistic fallback bank without word repetition
    const bank = isTa ? REALISTIC_TEACH_MINDY_TA : REALISTIC_TEACH_MINDY_EN;
    const unrepeated = bank.filter((item) => !avoidSet.has(item.targetWord.toLowerCase()));

    const candidate = unrepeated.length > 0
      ? unrepeated[Math.floor(Math.random() * unrepeated.length)]
      : bank[Math.floor(Math.random() * bank.length)];

    const scenario: TeachMindyItem = {
      ...candidate,
      id: `tm_cur_${language}_${Date.now()}`,
      options: shuffleTeachMindyOptions(candidate.options),
    };

    usedSet.add(scenario.targetWord.toLowerCase());
    return { scenario, source: 'fallback' };
  }

  /**
   * Synthesizes a realistic, contextual misconception and distractors for ANY vocabulary word.
   * Avoids repetitive "duck" demo strings by using tailored semantic patterns.
   */
  public static synthesizeWordScenario(
    language: AppLanguage,
    word: string,
    meaning: string,
    emoji: string
  ): TeachMindyItem {
    const isTa = language === 'ta';
    const id = `tm_syn_${language}_${word}_${Date.now()}`;

    if (isTa) {
      return {
        id,
        language: 'ta',
        targetWord: word,
        sillyClaim: `மிண்டி சொல்கிறது: ${word} என்பது வானத்தில் பறக்கும் இனிப்புப் பலகாரமா? 🥮`,
        prompt: `${word} என்றால் என்னவென்று மிண்டிக்கு சொல்லிக் கொடுக்கலாமா?`,
        options: shuffleTeachMindyOptions([
          { id: `opt_${id}_1`, label: meaning, emoji, isCorrect: true },
          { id: `opt_${id}_2`, label: 'வானில் பறக்கும் இனிப்புப் பலகாரம்', emoji: '🥮', isCorrect: false },
          { id: `opt_${id}_3`, label: 'தோட்டத்தில் ஓடும் அணில் குட்டி', emoji: '🐿️', isCorrect: false },
        ]),
        meaning,
        difficulty: 1,
      };
    } else {
      return {
        id,
        language: 'en',
        targetWord: word,
        sillyClaim: `Mindy says: ${word} means a floating sweet pancake that fell from the sky? 🥞`,
        prompt: `Can you teach Mindy what ${word} really means?`,
        options: shuffleTeachMindyOptions([
          { id: `opt_${id}_1`, label: meaning, emoji, isCorrect: true },
          { id: `opt_${id}_2`, label: 'Floating sweet sky pancake', emoji: '🥞', isCorrect: false },
          { id: `opt_${id}_3`, label: 'Running fluffy squirrel', emoji: '🐿️', isCorrect: false },
        ]),
        meaning,
        difficulty: 1,
      };
    }
  }

  public static markWordUsed(language: AppLanguage, word: string) {
    this.usedWordsByLanguage[language].add(word.toLowerCase());
  }

  public static resetUsedWords(language: AppLanguage) {
    this.usedWordsByLanguage[language].clear();
  }
}
