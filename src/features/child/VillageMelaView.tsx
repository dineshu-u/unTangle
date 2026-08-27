import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';

export const VillageMelaView: React.FC = () => {
  const { language, t, setCurrentScreen, recordLearningEvent, contentRepo, currentLevelWords } = useApp();
  const [litDiyasCount, setLitDiyasCount] = useState(2);
  const [activeTab, setActiveTab] = useState<'diyas' | 'pongal'>('diyas');

  // STEP 20: Revisit actual learning history
  const repoLetters = contentRepo.getLetters(language).map(l => l.letter);
  const melaLetters = React.useMemo(() => {
    const lettersPool = [...new Set([...repoLetters])];
    return lettersPool.slice(0, 6);
  }, [repoLetters]);

  // Revisit words child has actually practiced or mastered
  const wordsPool = React.useMemo(() => {
    const dynamicWords = currentLevelWords.length > 0 ? currentLevelWords : contentRepo.getRealWords(language);
    return dynamicWords;
  }, [currentLevelWords, contentRepo, language]);

  const [pongalWordIdx, setPongalWordIdx] = useState(0);
  const currentHarvestWord = wordsPool[pongalWordIdx % wordsPool.length];

  const handleLightDiya = () => {
    sounds.playChime();
    sounds.triggerHaptic(35);
    setLitDiyasCount((prev) => {
      const next = Math.min(melaLetters.length, prev + 1);
      if (next === melaLetters.length) {
        sounds.playCelebration();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Record Mela milestone event in learning history
        recordLearningEvent({
          activityType: 'village_mela',
          contentId: 'mela_diyas_completed',
          eventType: 'activity_completed',
          outcome: 'success',
          metadata: { lettersRevisited: melaLetters },
        });
      }
      return next;
    });
  };

  const handleStirPongal = () => {
    sounds.playCelebration();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    recordLearningEvent({
      activityType: 'village_mela',
      contentId: currentHarvestWord?.id || 'pongal_harvest',
      eventType: 'activity_completed',
      outcome: 'success',
      metadata: { word: currentHarvestWord?.word },
    });

    setPongalWordIdx(prev => (prev + 1) % wordsPool.length);
  };

  return (
    <div className="w-full flex-1 flex flex-col p-3 max-w-md mx-auto overflow-y-auto">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            sounds.playTap();
            setCurrentScreen('village');
          }}
          className="flex items-center gap-1 bg-white/90 text-slate-700 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToVillage}</span>
        </button>

        <div className="flex items-center gap-1 bg-amber-500/20 text-amber-900 border border-amber-400/50 px-2.5 py-1 rounded-full text-xs font-black">
          <span>✨ {language === 'ta' ? 'மேளா திருவிழா' : 'Festival Day'}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#451a03] border-2 border-amber-400 rounded-3xl p-3.5 shadow-xl text-white flex-1 flex flex-col justify-between relative overflow-hidden">
        {/* Storybook Mela Backdrop image with soft overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/assets/mela_storybook.png"
            alt="Village Mela Festival"
            className="w-full h-full object-cover object-center pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none" />
        </div>

        {/* Header content */}
        <div className="relative z-10 text-center mb-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl">🏮</span>
            <h2 className="text-base sm:text-lg font-black text-amber-300 drop-shadow-md">
              {t.melaTitle}
            </h2>
            <span className="text-xl">🪔</span>
          </div>
          <p className="text-[11px] text-amber-200 font-medium max-w-xs mx-auto mt-0.5">
            {t.melaSubtitle}
          </p>
        </div>

        {/* Festive Activity Tabs */}
        <div className="relative z-10 flex justify-center gap-1.5 mb-2.5">
          <button
            onClick={() => setActiveTab('diyas')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'diyas'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {t.melaDiyaStall}
          </button>
          <button
            onClick={() => setActiveTab('pongal')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'pongal'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {t.melaPongalStall}
          </button>
        </div>

        {/* TAB 1: DIYA PHONICS LIGHT (Revisiting letters from history) */}
        {activeTab === 'diyas' && (
          <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl p-3.5 border border-amber-400/40 text-center flex-1 flex flex-col justify-around">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-200">
                {t.melaDiyasInstruction}
              </h3>
              <p className="text-[11px] text-amber-100/80 mt-0.5">
                {t.melaLitLamps} {litDiyasCount} / {melaLetters.length}
              </p>
            </div>

            {/* Diyas Grid based on real content letters */}
            <div className="grid grid-cols-3 gap-2.5 my-2.5 max-w-xs mx-auto w-full">
              {melaLetters.map((letter, idx) => {
                const isLit = idx < litDiyasCount;
                return (
                  <button
                    key={idx}
                    onClick={handleLightDiya}
                    className={`h-18 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-transform duration-200 active:scale-90 ${
                      isLit
                        ? 'bg-amber-500/30 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'bg-stone-800/60 border-stone-600 opacity-60'
                    }`}
                  >
                    <span className={`text-xl ${isLit ? 'animate-bounce' : 'grayscale'}`}>
                      🪔
                    </span>
                    <span className="text-sm font-black text-amber-300 mt-0.5">
                      {letter}
                    </span>
                    <span className="text-[9px] text-amber-200">
                      {isLit ? t.melaLitBadge : t.melaTapToLight}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-amber-200/90 font-medium">
              💡 {t.melaTreeClearedNote}
            </p>
          </div>
        )}

        {/* TAB 2: PONGAL WORD HARVEST (Revisiting words from history) */}
        {activeTab === 'pongal' && (
          <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl p-3.5 border border-amber-400/40 text-center flex-1 flex flex-col justify-around">
            <div>
              <span className="text-3xl block mb-1">🍯🌾</span>
              <h3 className="text-sm font-bold text-amber-300">
                {t.melaPongalTitle}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {t.melaPongalDesc}
              </p>
            </div>

            <div className="bg-amber-950/70 rounded-2xl p-3 border border-amber-400/30 my-2">
              <span className="text-2xl font-black text-amber-300 block mb-0.5">
                {currentHarvestWord?.word}
              </span>
              <span className="text-xs text-amber-200">
                {currentHarvestWord?.meaning}
              </span>
            </div>

            <button
              onClick={handleStirPongal}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black py-2 px-4 rounded-full text-xs shadow-md transition-transform active:scale-95 mx-auto"
            >
              🎉 {t.celebrateHarvestBtn}
            </button>
          </div>
        )}

        {/* Bottom Kolam Ribbon */}
        <div className="relative z-10 mt-2 bg-amber-950/80 rounded-xl p-1 text-center border border-amber-400/30">
          <span className="text-[11px] font-bold text-amber-300">
            🌸 {t.melaKolam} 🌸
          </span>
        </div>
      </div>
    </div>
  );
};
