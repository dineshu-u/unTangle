export type FestivalId = 'pongal' | 'holi' | 'diwali';

export interface FestivalTheme {
  id: FestivalId;
  icon: string;
  titleEn: string;
  titleTa: string;
  subtitleEn: string;
  subtitleTa: string;
  firstStallEn: string;
  firstStallTa: string;
  secondStallEn: string;
  secondStallTa: string;
  thirdStallEn: string;
  thirdStallTa: string;
  firstGameDescriptionEn: string;
  firstGameDescriptionTa: string;
  wordGameTitleEn: string;
  wordGameTitleTa: string;
  wordGameDescriptionEn: string;
  wordGameDescriptionTa: string;
  gameTitleEn: string;
  gameTitleTa: string;
  gameDescriptionEn: string;
  gameDescriptionTa: string;
}

const FESTIVAL_THEMES: Record<FestivalId, FestivalTheme> = {
  pongal: {
    id: 'pongal',
    icon: '🌾',
    titleEn: 'Pongal Harvest Mela',
    titleTa: 'பொங்கல் அறுவடை மேளா',
    subtitleEn: 'Celebrate the harvest by growing words, sounds, and bright kolams!',
    subtitleTa: 'சொற்கள், ஒலிகள் மற்றும் வண்ணக் கோலங்களுடன் அறுவடைத் திருவிழாவைக் கொண்டாடுவோம்!',
    firstStallEn: 'Sugarcane Sound',
    firstStallTa: 'கரும்பு ஒலி',
    secondStallEn: 'Pongal Word Harvest',
    secondStallTa: 'பொங்கல் சொல் அறுவடை',
    thirdStallEn: 'Harvest Kolam',
    thirdStallTa: 'அறுவடை கோலம்',
    firstGameDescriptionEn: 'Tap a sugarcane bundle and sound out each letter to fill the harvest basket!',
    firstGameDescriptionTa: 'கரும்புக் கட்டுகளைத் தட்டி ஒவ்வொரு எழுத்தின் ஒலியையும் சொல்லி அறுவடை கூடையை நிரப்பவும்!',
    wordGameTitleEn: 'Sweet Pongal Word Pot',
    wordGameTitleTa: 'இனிய பொங்கல் சொல் பானை',
    wordGameDescriptionEn: 'Stir the sweet pot to discover a real harvest word!',
    wordGameDescriptionTa: 'இனிய பானையைக் கிளறி உண்மையான அறுவடைச் சொல்லைக் கண்டுபிடிக்கவும்!',
    gameTitleEn: 'Harvest Sound Kolam',
    gameTitleTa: 'அறுவடை ஒலி கோலம்',
    gameDescriptionEn: 'Find the letter that begins the harvest picture and add a flower to your kolam!',
    gameDescriptionTa: 'அறுவடைப் படத்தின் முதல் ஒலிக்கான எழுத்தைத் தேர்ந்தெடுத்து கோலத்தில் மலர் சேர்க்கவும்!',
  },
  holi: {
    id: 'holi',
    icon: '🎨',
    titleEn: 'Holi Colours Mela',
    titleTa: 'ஹோலி வண்ண மேளா',
    subtitleEn: 'Splash into joyful sound and word games, one clear colour at a time!',
    subtitleTa: 'ஒவ்வொரு தெளிவான வண்ணத்துடனும் ஒலி மற்றும் சொல் விளையாட்டுகளில் மகிழ்வோம்!',
    firstStallEn: 'Colour Sounds',
    firstStallTa: 'வண்ண ஒலிகள்',
    secondStallEn: 'Holi Word Splash',
    secondStallTa: 'ஹோலி சொல் வண்ணம்',
    thirdStallEn: 'Rainbow Kolam',
    thirdStallTa: 'வானவில் கோலம்',
    firstGameDescriptionEn: 'Tap a colour pot and sound out each letter to fill the Holi palette!',
    firstGameDescriptionTa: 'வண்ணப் பானையைத் தட்டி ஒவ்வொரு எழுத்தின் ஒலியையும் சொல்லி ஹோலி வண்ணத் தட்டைப் நிரப்பவும்!',
    wordGameTitleEn: 'Holi Word Splash',
    wordGameTitleTa: 'ஹோலி சொல் வண்ணம்',
    wordGameDescriptionEn: 'Stir the colour pot to discover a joyful real word!',
    wordGameDescriptionTa: 'வண்ணப் பானையைக் கிளறி மகிழ்ச்சியான உண்மையான சொல்லைக் கண்டுபிடிக்கவும்!',
    gameTitleEn: 'Colour Sound Match',
    gameTitleTa: 'வண்ண ஒலி பொருத்தம்',
    gameDescriptionEn: 'Choose the letter that starts the bright Holi picture and splash a new colour!',
    gameDescriptionTa: 'வண்ணமயமான ஹோலி படத்தின் முதல் எழுத்தைத் தேர்ந்தெடுத்து புதிய வண்ணம் தெளிக்கவும்!',
  },
  diwali: {
    id: 'diwali',
    icon: '🪔',
    titleEn: 'Diwali Lights Mela',
    titleTa: 'தீபாவளி விளக்கு மேளா',
    subtitleEn: 'Light a path of sounds and words for the Festival of Lights!',
    subtitleTa: 'தீபத் திருநாளில் ஒலிகள் மற்றும் சொற்களின் பாதையை விளக்குகளால் ஒளிரச் செய்வோம்!',
    firstStallEn: 'Diya Sound Trail',
    firstStallTa: 'அகல் விளக்கு ஒலி பாதை',
    secondStallEn: 'Diwali Word Sweets',
    secondStallTa: 'தீபாவளி இனிய சொற்கள்',
    thirdStallEn: 'Rangoli Sound Match',
    thirdStallTa: 'ரங்கோலி ஒலி பொருத்தம்',
    firstGameDescriptionEn: 'Light each diya by sounding out its letter and brighten the Festival of Lights!',
    firstGameDescriptionTa: 'ஒவ்வொரு அகல் விளக்கின் எழுத்து ஒலியையும் சொல்லி தீபத் திருநாளை ஒளிரச் செய்யவும்!',
    wordGameTitleEn: 'Diwali Word Sweets',
    wordGameTitleTa: 'தீபாவளி இனிய சொற்கள்',
    wordGameDescriptionEn: 'Stir the sweet pot to discover a bright Diwali word!',
    wordGameDescriptionTa: 'இனிய பானையைக் கிளறி ஒளிரும் தீபாவளிச் சொல்லைக் கண்டுபிடிக்கவும்!',
    gameTitleEn: 'Rangoli Sound Match',
    gameTitleTa: 'ரங்கோலி ஒலி பொருத்தம்',
    gameDescriptionEn: 'Choose the letter that begins the Diwali picture and add a bright rangoli flower!',
    gameDescriptionTa: 'தீபாவளிப் படத்தின் முதல் ஒலிக்கான எழுத்தைத் தேர்ந்தெடுத்து ரங்கோலியில் மலர் சேர்க்கவும்!',
  },
};

const FESTIVAL_DATES: Record<FestivalId, { month: number; day: number }> = {
  pongal: { month: 1, day: 14 },
  holi: { month: 3, day: 4 },
  diwali: { month: 11, day: 8 },
};

const FESTIVAL_ORDER: FestivalId[] = ['pongal', 'holi', 'diwali'];

export const getUpcomingFestival = (today = new Date()): FestivalTheme => {
  const year = today.getFullYear();
  const candidates = FESTIVAL_ORDER.map(id => {
    const date = FESTIVAL_DATES[id];
    return { id, date: new Date(year, date.month - 1, date.day) };
  });

  const activeFestival = candidates.find(({ date }) => {
    const daysFromFestival = (today.getTime() - date.getTime()) / 86_400_000;
    return daysFromFestival >= -14 && daysFromFestival <= 21;
  });
  if (activeFestival) return FESTIVAL_THEMES[activeFestival.id];

  const nextFestival = candidates
    .map(candidate => ({
      ...candidate,
      date: candidate.date < today
        ? new Date(year + 1, candidate.date.getMonth(), candidate.date.getDate())
        : candidate.date,
    }))
    .sort((left, right) => left.date.getTime() - right.date.getTime())[0];

  return FESTIVAL_THEMES[nextFestival.id];
};

export const getMelaFestival = (today = new Date()): FestivalTheme => {
  if (typeof window !== 'undefined') {
    const requestedFestival = new URLSearchParams(window.location.search).get('festival');
    if (requestedFestival && requestedFestival in FESTIVAL_THEMES) {
      return FESTIVAL_THEMES[requestedFestival as FestivalId];
    }
  }

  return getUpcomingFestival(today);
};