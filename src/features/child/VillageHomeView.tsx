import React, { useState } from 'react';
import { useApp, ScreenId } from '../../context/AppContext';
import { MindyAvatar } from '../../components/MindyAvatar';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Compass, LayoutGrid, MessageCircle } from 'lucide-react';
import { TalkingMindyCompanion } from '../../components/TalkingMindyCompanion';

export const VillageHomeView: React.FC = () => {
  const { language, t, setCurrentScreen, childProgress, claimDailyQuestReward, adaptiveRecommendation } = useApp();
  const [viewMode, setViewMode] = useState<'map' | 'hub'>('map');
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [claimedReward, setClaimedReward] = useState(false);
  const [showTalkingMindy, setShowTalkingMindy] = useState(false);

  const locations: {
    id: ScreenId;
    titleEn: string;
    titleTa: string;
    descEn: string;
    descTa: string;
    emoji: string;
    pos: { top: string; left: string };
    bgColor: string;
    badgeEn?: string;
    badgeTa?: string;
  }[] = [
    {
      id: 'mindy_house',
      titleEn: "Mindy's House",
      titleTa: 'மிண்டியின் வீடு',
      descEn: 'Chat & Teach Mindy new words!',
      descTa: 'மிண்டியுடன் பேசி புதிய சொற்கள் கற்பிக்கலாம்!',
      emoji: '🐦🏡',
      pos: { top: '38%', left: '16%' },
      bgColor: 'from-amber-400 to-orange-500',
      badgeEn: 'Teach!',
      badgeTa: 'கற்பி!',
    },
    {
      id: 'letter_garden',
      titleEn: 'Letter Garden',
      titleTa: 'எழுத்துத் தோட்டம்',
      descEn: 'Meet animal creatures & letters',
      descTa: 'விலங்குகள், பறவைகள் மற்றும் எழுத்துக்கள்',
      emoji: '🌺🦋',
      pos: { top: '22%', left: '42%' },
      bgColor: 'from-emerald-400 to-green-600',
      badgeEn: '4/30',
      badgeTa: '4/30',
    },
    {
      id: 'word_kite',
      titleEn: 'Word Kite Field',
      titleTa: 'காற்றாடி மைதானம்',
      descEn: 'Build words & let your kite soar!',
      descTa: 'சொற்கள் அமைத்து பட்டம் பறக்க விடுங்கள்!',
      emoji: '🪁✨',
      pos: { top: '56%', left: '76%' },
      bgColor: 'from-sky-400 to-blue-600',
      badgeEn: 'Fly!',
      badgeTa: 'பறக்க!',
    },
    {
      id: 'pulse_path',
      titleEn: 'Pulse Path',
      titleTa: 'தாள முழவு பாதை',
      descEn: 'Tap village stone drums with rhythm!',
      descTa: 'கிராமத்து மத்தளத்தை தாளத்தோடு தட்டுங்கள்!',
      emoji: '🥁🪘',
      pos: { top: '78%', left: '26%' },
      bgColor: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'reading_lens',
      titleEn: 'Book Corner & Lens',
      titleTa: 'புத்தகக் கூடம்',
      descEn: 'Reading Lens & calm story cards',
      descTa: 'வாசிப்பு லென்ஸ் மற்றும் வண்ண கதைகள்',
      emoji: '📖🔍',
      pos: { top: '74%', left: '80%' },
      bgColor: 'from-rose-400 to-pink-600',
    },
    {
      id: 'learning_garden',
      titleEn: 'My Learning Garden',
      titleTa: 'என் தோட்டம்',
      descEn: 'Harvest word fruits & sound flowers',
      descTa: 'சொல் பழங்கள் மற்றும் பூக்கள் அறுவடை',
      emoji: '🌱🍎',
      pos: { top: '44%', left: '88%' },
      bgColor: 'from-lime-500 to-emerald-600',
    },
    {
      id: 'village_mela',
      titleEn: 'Village Mela Festival',
      titleTa: 'கிராமத்து மேளா',
      descEn: 'Lanterns, kolam & grand celebrations!',
      descTa: 'வண்ண விளக்குகள் மற்றும் திருவிழா விளையாட்டுகள்!',
      emoji: '🎪🏮',
      pos: { top: '30%', left: '86%' },
      bgColor: 'from-amber-500 to-red-500',
      badgeEn: 'Mela!',
      badgeTa: 'மேளா!',
    },
    {
      id: 'family_voice',
      titleEn: 'Family Voice Cottage',
      titleTa: 'குடும்ப குரல் குடில்',
      descEn: 'Hear loving cheers from Amma & Appa',
      descTa: 'அம்மா, அப்பாவின் அன்பான குரல் ஆசி',
      emoji: '🎙️❤️',
      pos: { top: '56%', left: '12%' },
      bgColor: 'from-teal-400 to-cyan-600',
    },
  ];

  const handleNavigate = (screen: ScreenId) => {
    sounds.playTap();
    sounds.triggerHaptic(25);
    setCurrentScreen(screen);
  };

  const handleClaimDailyGift = () => {
    if (claimedReward) return;
    setClaimedReward(true);
    sounds.playCelebration();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
    claimDailyQuestReward();
  };

  return (
    <div className="w-full flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden">
      {/* Village View Switcher Header */}
      <div className="bg-amber-100/90 border-b border-amber-200 px-3 py-2 flex items-center justify-between z-20 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-amber-950 leading-tight">
              {t.villageTitle}
            </h2>
            <p className="text-[10px] text-amber-800 font-medium">
              {t.villageSubtitle}
            </p>
          </div>
        </div>

        {/* Toggle between Storybook Map & Chunky Card Hub */}
        <div className="flex items-center bg-white/90 rounded-full p-0.5 border border-amber-300 shadow-2xs">
          <button
            onClick={() => {
              setViewMode('map');
              sounds.playTap();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.mapViewBtn}</span>
          </button>
          <button
            onClick={() => {
              setViewMode('hub');
              sounds.playTap();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
              viewMode === 'hub'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t.cardHubBtn}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: LIVING STORYBOOK MAP */}
      {viewMode === 'map' && (
        <div className="relative w-full flex-1 min-h-0 h-full bg-[#97c75c] overflow-hidden select-none">
          {/* Storybook Village Art Backdrop */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/village_storybook.png"
              alt="Storybook Village"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            <div className="absolute inset-0 bg-radial from-amber-200/20 via-transparent to-black/15 pointer-events-none" />
          </div>

          {/* Drifting Clouds & Kite animations over the village */}
          <div className="absolute top-4 left-6 animate-pulse opacity-85 pointer-events-none">
            <span className="text-3xl drop-shadow-md">☁️</span>
          </div>
          <div className="absolute top-12 right-12 animate-bounce opacity-85 pointer-events-none" style={{ animationDuration: '4s' }}>
            <span className="text-2xl drop-shadow-md">🪁</span>
          </div>

          {/* Interactive Floating Hotspot Pins over Village Locations */}
          {locations.map((loc) => {
            const isHovered = hoveredLocation === loc.id;
            const title = language === 'ta' ? loc.titleTa : loc.titleEn;
            const desc = language === 'ta' ? loc.descTa : loc.descEn;
            const badge = language === 'ta' ? loc.badgeTa : loc.badgeEn;

            return (
              <div
                key={loc.id}
                style={{ top: loc.pos.top, left: loc.pos.left }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
                onMouseEnter={() => setHoveredLocation(loc.id)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Pulsating Map Pin Button */}
                <button
                  onClick={() => handleNavigate(loc.id)}
                  className="relative flex flex-col items-center justify-center transition-transform transform group-hover:scale-115 active:scale-95 cursor-pointer focus:outline-none"
                  title={title}
                >
                  <span className="absolute -inset-2 rounded-full bg-white/60 animate-ping opacity-60 pointer-events-none" />

                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr ${loc.bgColor} text-white shadow-xl border-2 border-white flex items-center justify-center text-xl sm:text-2xl transform transition-transform group-hover:rotate-6`}
                  >
                    <span>{loc.emoji.slice(0, 2)}</span>
                  </div>

                  {badge && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-xs animate-bounce">
                      {badge}
                    </span>
                  )}

                  <div className="mt-1 bg-white/95 backdrop-blur-xs border border-amber-300 rounded-full px-2 py-0.5 shadow-md flex items-center gap-1 transition-all group-hover:bg-amber-50 group-hover:scale-105">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
                      {title}
                    </span>
                  </div>
                </button>

                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border-2 border-amber-300 z-30 pointer-events-none animate-in fade-in zoom-in-90 duration-150 text-center">
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {title}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1 leading-normal">
                      {desc}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {t.tapToExplore}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Floating Mindy Companion Callout: Tapping opens Talking Mindy! */}
          <div
            onClick={() => setShowTalkingMindy(true)}
            className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border-2 border-sky-300 shadow-xl max-w-xs cursor-pointer hover:border-sky-400 transition-transform active:scale-98"
          >
            <MindyAvatar mood="happy" size="sm" onClick={() => setShowTalkingMindy(true)} />
            <div className="text-left pr-1">
              <p className="text-[11px] font-bold text-sky-950 leading-tight flex items-center gap-1">
                <span>{t.mindyWaiting}</span>
                <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 rounded-full">👆 Tap</span>
              </p>
              <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                {language === 'ta' ? adaptiveRecommendation.suggestedPromptTa : adaptiveRecommendation.suggestedPromptEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CHUNKY CARD HUB (Faithful to Home.png) */}
      {viewMode === 'hub' && (
        <div className="flex-1 p-3 sm:p-4 max-w-md mx-auto w-full flex flex-col gap-3.5">
          {/* Mindy Speech Bubble Greeting: Tapping opens Talking Mindy! */}
          <div
            onClick={() => setShowTalkingMindy(true)}
            className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-3xl p-3.5 shadow-md flex items-center gap-3 cursor-pointer hover:border-sky-300 transition-colors"
          >
            <MindyAvatar mood="speaking" size="md" onClick={() => setShowTalkingMindy(true)} />
            <div className="flex-1 text-left">
              <div className="bg-white rounded-2xl p-3 shadow-inner border border-sky-100 relative">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {language === 'ta' ? adaptiveRecommendation.suggestedPromptTa : adaptiveRecommendation.suggestedPromptEn}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 bg-sky-100/60 px-2 py-0.5 rounded-full">
                    <MessageCircle className="w-3 h-3" />
                    <span>{language === 'ta' ? 'மிண்டியுடன் பேச' : 'Talk with Mindy'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Chunky Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Mindy's House */}
            <button
              onClick={() => handleNavigate('mindy_house')}
              className="bg-gradient-to-b from-sky-100 to-sky-200/90 border-2 border-sky-300 rounded-3xl p-3.5 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex flex-col items-center justify-between min-h-[135px]"
            >
              <span className="text-xs sm:text-sm font-black text-sky-950">
                {t.mindyHouse}
              </span>
              <div className="my-1.5 text-3xl animate-pulse">🐦</div>
              <div className="bg-sky-600 text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {t.mindyHouseBtn}
              </div>
            </button>

            {/* Card 2: Letter Garden */}
            <button
              onClick={() => handleNavigate('letter_garden')}
              className="bg-gradient-to-b from-amber-100 to-amber-200/90 border-2 border-amber-300 rounded-3xl p-3.5 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex flex-col items-center justify-between min-h-[135px]"
            >
              <span className="text-xs sm:text-sm font-black text-amber-950">
                {t.letterGarden}
              </span>
              <div className="my-1.5 text-3xl">🌱</div>
              <div className="bg-amber-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                {t.letterGardenBtn}
              </div>
            </button>

            {/* Card 3: Word Kite Field */}
            <button
              onClick={() => handleNavigate('word_kite')}
              className="bg-gradient-to-b from-purple-100 to-purple-200/90 border-2 border-purple-300 rounded-3xl p-3.5 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex flex-col items-center justify-between min-h-[135px]"
            >
              <span className="text-xs sm:text-sm font-black text-purple-950">
                {t.wordKiteField}
              </span>
              <div className="my-1.5 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>
                🪁
              </div>
              <div className="bg-purple-600 text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {t.wordKiteBtn}
              </div>
            </button>

            {/* Card 4: Learning Garden */}
            <button
              onClick={() => handleNavigate('learning_garden')}
              className="bg-gradient-to-b from-emerald-100 to-emerald-200/90 border-2 border-emerald-300 rounded-3xl p-3.5 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex flex-col items-center justify-between min-h-[135px]"
            >
              <span className="text-xs sm:text-sm font-black text-emerald-950">
                {t.learningGarden}
              </span>
              <div className="my-1.5 text-3xl">🌳</div>
              <div className="bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {t.learningGardenBtn}
              </div>
            </button>
          </div>

          {/* Secondary Features Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleNavigate('pulse_path')}
              className="bg-indigo-50 border border-indigo-200 rounded-2xl p-2 text-center shadow-2xs hover:bg-indigo-100 transition-colors"
            >
              <span className="text-xl block mb-0.5">🥁</span>
              <span className="text-[10px] font-bold text-indigo-900 block truncate">{t.pulsePathBtn}</span>
            </button>
            <button
              onClick={() => handleNavigate('village_mela')}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-2 text-center shadow-2xs hover:bg-amber-100 transition-colors"
            >
              <span className="text-xl block mb-0.5">🎪</span>
              <span className="text-[10px] font-bold text-amber-900 block truncate">{t.villageMelaBtn}</span>
            </button>
            <button
              onClick={() => handleNavigate('reading_lens')}
              className="bg-rose-50 border border-rose-200 rounded-2xl p-2 text-center shadow-2xs hover:bg-rose-100 transition-colors"
            >
              <span className="text-xl block mb-0.5">📖</span>
              <span className="text-[10px] font-bold text-rose-900 block truncate">{t.bookCornerBtn}</span>
            </button>
          </div>

          {/* Daily Quest Card */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 border border-amber-500 rounded-3xl p-3.5 text-white shadow-md">
            <div className="flex items-center justify-between text-xs font-black tracking-wide uppercase mb-1">
              <span className="flex items-center gap-1">
                <span>⭐</span>
                <span>{t.dailyQuest}</span>
                <span>⭐</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold opacity-95 text-left">
              {t.dailyQuestDesc}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>{t.progressBar}: {childProgress.stormProgress}%</span>
                </div>
                <div className="w-full h-2 bg-amber-600/50 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500 shadow-inner"
                    style={{ width: `${childProgress.stormProgress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleClaimDailyGift}
                disabled={claimedReward}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 ${
                  claimedReward
                    ? 'bg-emerald-500 text-white cursor-default'
                    : 'bg-white text-amber-900 hover:bg-amber-50 animate-bounce'
                }`}
              >
                <span>🎁</span>
                <span>{claimedReward ? t.giftClaimed : t.giftReward}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Talking Mindy Companion Playground Modal */}
      <TalkingMindyCompanion
        isOpen={showTalkingMindy}
        onClose={() => setShowTalkingMindy(false)}
      />
    </div>
  );
};
