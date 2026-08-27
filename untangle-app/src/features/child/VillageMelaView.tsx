import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';
import { getMelaFestival } from '../../data/festivalCalendar';

export const VillageMelaView: React.FC = () => {
  const { language, t, setCurrentScreen, recordLearningEvent, contentRepo, currentLevelWords } = useApp();
  const festival = React.useMemo(() => getMelaFestival(), []);
  const [litDiyasCount, setLitDiyasCount] = useState(2);
  const [sugarcaneBrokenCount, setSugarcaneBrokenCount] = useState(0);
  const [sugarcaneFeedback, setSugarcaneFeedback] = useState<'idle' | 'correct' | 'tryAgain'>('idle');
  const [pongalOverflow, setPongalOverflow] = useState(0);
  const [activeTab, setActiveTab] = useState<'diyas' | 'pongal' | 'kolam'>('diyas');

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

  const matchLetters = React.useMemo(() => {
    const unlockedLetters = contentRepo.getLetters(language).filter(letter => letter.unlocked);
    return unlockedLetters.length > 0 ? unlockedLetters : contentRepo.getLetters(language);
  }, [contentRepo, language]);
  const [matchRound, setMatchRound] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [matchFeedback, setMatchFeedback] = useState<'idle' | 'correct' | 'tryAgain'>('idle');
  const matchTarget = matchLetters[matchRound % matchLetters.length];
  const matchChoices = React.useMemo(() => {
    if (!matchTarget) return [];
    const distractors = matchLetters
      .filter(letter => letter.letter !== matchTarget.letter)
      .slice(0, 2);
    return [matchTarget, ...distractors].sort((left, right) => left.letter.localeCompare(right.letter));
  }, [matchLetters, matchTarget]);

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

  const handleBreakSugarcane = (letter: string, index: number) => {
    const targetLetter = melaLetters[sugarcaneBrokenCount];
    if (!targetLetter || index !== sugarcaneBrokenCount || sugarcaneFeedback === 'correct') return;
    if (letter === targetLetter) {
      sounds.playChime();
      sounds.triggerHaptic(45);
      setSugarcaneFeedback('correct');
      setSugarcaneBrokenCount(prev => Math.min(melaLetters.length, prev + 1));
      recordLearningEvent({
        activityType: 'village_mela',
        contentId: `mela_pongal_sugarcane_${targetLetter}`,
        eventType: 'activity_completed',
        outcome: 'success',
        metadata: { letter: targetLetter, game: 'sugarcane_breaking' },
      });
      window.setTimeout(() => setSugarcaneFeedback('idle'), 500);
    } else {
      sounds.playTap();
      sounds.triggerHaptic(15);
      setSugarcaneFeedback('tryAgain');
    }
  };

  const handlePongalOverflow = () => {
    const nextLevel = pongalOverflow + 1;
    sounds.playChime();
    sounds.triggerHaptic(35);
    setPongalOverflow(nextLevel >= 4 ? 0 : nextLevel);
    if (nextLevel >= 4) {
      sounds.playCelebration();
      confetti({ particleCount: 55, spread: 60, origin: { y: 0.6 } });
      recordLearningEvent({
        activityType: 'village_mela',
        contentId: currentHarvestWord?.id || 'pongal_overflow',
        eventType: 'activity_completed',
        outcome: 'success',
        metadata: { word: currentHarvestWord?.word, game: 'pongal_overflow' },
      });
      setPongalWordIdx(prev => (prev + 1) % wordsPool.length);
    }
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

  const handleMatchLetter = (letter: string) => {
    if (!matchTarget || matchFeedback === 'correct') return;
    if (letter === matchTarget.letter) {
      sounds.playChime();
      sounds.triggerHaptic(45);
      setMatchFeedback('correct');
      setMatchScore(prev => prev + 1);
      recordLearningEvent({
        activityType: 'village_mela',
        contentId: `mela_kolam_${matchTarget.id}`,
        eventType: 'activity_completed',
        outcome: 'success',
        metadata: { letter: matchTarget.letter, sound: matchTarget.sound },
      });
      window.setTimeout(() => {
        setMatchRound(prev => prev + 1);
        setMatchFeedback('idle');
      }, 700);
    } else {
      sounds.playTap();
      sounds.triggerHaptic(15);
      setMatchFeedback('tryAgain');
    }
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
            <span>{festival.icon} {language === 'ta' ? festival.titleTa : festival.titleEn}</span>
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
            <span className="text-xl">{festival.icon}</span>
            <h2 className="text-base sm:text-lg font-black text-amber-300 drop-shadow-md">
              {language === 'ta' ? festival.titleTa : festival.titleEn}
            </h2>
            <span className="text-xl">{festival.icon}</span>
          </div>
          <p className="text-[11px] text-amber-200 font-medium max-w-xs mx-auto mt-0.5">
            {language === 'ta' ? festival.subtitleTa : festival.subtitleEn}
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
            {language === 'ta' ? festival.firstStallTa : festival.firstStallEn}
          </button>
          <button
            onClick={() => setActiveTab('pongal')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'pongal'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {language === 'ta' ? festival.secondStallTa : festival.secondStallEn}
          </button>
          <button
            onClick={() => setActiveTab('kolam')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'kolam'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {language === 'ta' ? festival.thirdStallTa : festival.thirdStallEn}
          </button>
        </div>

        {/* TAB 1: DIYA PHONICS LIGHT (Revisiting letters from history) */}
        {activeTab === 'diyas' && festival.id === 'pongal' && (
          <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl p-3.5 border border-lime-300/50 text-center flex-1 flex flex-col justify-around">
            <div>
              <span className="text-3xl block mb-1">🎋💥</span>
              <h3 className="text-sm font-bold text-lime-200">{t.pongalSugarcaneTitle}</h3>
              <p className="text-xs text-lime-100 mt-0.5">{t.pongalSugarcaneDesc}</p>
              <p className="text-[11px] text-lime-100/80 mt-1">{t.pongalSugarcaneCount} {sugarcaneBrokenCount} / {melaLetters.length}</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 my-2.5 max-w-xs mx-auto w-full">
              {melaLetters.map((letter, index) => (
                <button
                  key={letter + index}
                  onClick={() => handleBreakSugarcane(letter, index)}
                  className={`min-h-20 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 transition-transform active:scale-90 ${
                    index < sugarcaneBrokenCount
                      ? 'bg-lime-400/35 border-lime-200 opacity-75'
                      : index === sugarcaneBrokenCount
                        ? 'bg-amber-300/25 border-amber-200 shadow-[0_0_14px_rgba(253,224,71,0.55)] scale-105'
                        : 'bg-emerald-950/70 border-lime-300/60 hover:bg-lime-400/20'
                  }`}
                >
                  <span className="text-2xl">{index < sugarcaneBrokenCount ? '💥' : '🎋'}</span>
                  <span className="text-lg font-black text-lime-100">{letter}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-lime-100 font-bold min-h-4">
              {sugarcaneFeedback === 'tryAgain' ? t.pongalSugarcaneTryAgain : sugarcaneFeedback === 'correct' ? t.pongalSugarcaneCorrect : t.pongalSugarcaneHint}
            </p>
          </div>
        )}

        {activeTab === 'diyas' && festival.id !== 'pongal' && (
          <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl p-3.5 border border-amber-400/40 text-center flex-1 flex flex-col justify-around">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-200">
                {language === 'ta' ? festival.firstGameDescriptionTa : festival.firstGameDescriptionEn}
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
                      {festival.id === 'pongal' ? '🎋' : festival.id === 'holi' ? '🎨' : '🪔'}
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
        {activeTab === 'pongal' && festival.id === 'pongal' && (
          <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl p-3.5 border border-orange-300/60 text-center flex-1 flex flex-col justify-around">
            <div>
              <span className="text-3xl block mb-1">🥛🍯</span>
              <h3 className="text-sm font-bold text-orange-200">{t.pongalOverflowTitle}</h3>
              <p className="text-xs text-orange-100 mt-0.5">{t.pongalOverflowDesc}</p>
            </div>
            <div className="relative mx-auto w-32 h-32 bg-orange-950/70 rounded-b-[3rem] border-4 border-orange-300/60 overflow-hidden flex items-end justify-center">
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-amber-500 to-yellow-200 transition-all duration-300" style={{ height: `${25 + pongalOverflow * 20}%` }} />
              <span className="relative z-10 text-4xl pb-3">{pongalOverflow >= 3 ? '🌊' : '🍚'}</span>
            </div>
            <p className="text-xs text-orange-100 font-bold">{t.pongalOverflowLevel}: {pongalOverflow} / 3</p>
            <button
              onClick={handlePongalOverflow}
              className="bg-orange-300 hover:bg-orange-200 text-orange-950 font-black py-2 px-4 rounded-full text-xs shadow-md transition-transform active:scale-95 mx-auto"
            >
              🥄 {t.pongalOverflowBtn}
            </button>
          </div>
        )}

        {activeTab === 'pongal' && festival.id !== 'pongal' && (
          <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl p-3.5 border border-amber-400/40 text-center flex-1 flex flex-col justify-around">
            <div>
              <span className="text-3xl block mb-1">{festival.id === 'holi' ? '🎨🫙' : '🍬🪔'}</span>
              <h3 className="text-sm font-bold text-amber-300">
                {language === 'ta' ? festival.wordGameTitleTa : festival.wordGameTitleEn}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {language === 'ta' ? festival.wordGameDescriptionTa : festival.wordGameDescriptionEn}
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

        {activeTab === 'kolam' && (
          <div className="relative z-10 bg-black/45 backdrop-blur-md rounded-2xl p-3.5 border border-amber-400/40 text-center flex-1 flex flex-col justify-around">
            <div>
              <span className="text-3xl block mb-1">🌸✨</span>
              <h3 className="text-sm font-bold text-amber-300">{language === 'ta' ? festival.gameTitleTa : festival.gameTitleEn}</h3>
              <p className="text-xs text-amber-100 mt-0.5">{language === 'ta' ? festival.gameDescriptionTa : festival.gameDescriptionEn}</p>
            </div>

            <div className="bg-amber-950/70 rounded-2xl p-3 border border-amber-400/30 my-2">
              <div className="text-4xl mb-1" aria-label={matchTarget?.associatedWord}>
                {matchTarget?.emoji}
              </div>
              <p className="text-sm font-black text-amber-300">{matchTarget?.sound}</p>
              <p className="text-[10px] text-amber-200 mt-1">{t.melaKolamScore}: {matchScore}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full">
              {matchChoices.map(letter => (
                <button
                  key={letter.id}
                  onClick={() => handleMatchLetter(letter.letter)}
                  aria-label={`${t.melaChooseLetter} ${letter.letter}`}
                  className={`min-h-16 rounded-2xl border-2 text-2xl font-black transition-transform active:scale-90 ${
                    matchFeedback === 'correct' && letter.letter === matchTarget?.letter
                      ? 'bg-emerald-400 border-emerald-200 text-emerald-950'
                      : 'bg-white/15 border-amber-300/70 text-amber-100 hover:bg-amber-400/25'
                  }`}
                >
                  {letter.letter}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-100 font-bold mt-2 min-h-4">
              {matchFeedback === 'correct' ? t.melaKolamCorrect : matchFeedback === 'tryAgain' ? t.melaKolamTryAgain : t.melaChooseLetter}
            </p>
          </div>
        )}

        {/* Bottom Kolam Ribbon */}
        <div className="relative z-10 mt-2 bg-amber-950/80 rounded-xl p-1 text-center border border-amber-400/30">
          <span className="text-[11px] font-bold text-amber-300">
            {festival.icon} {language === 'ta' ? festival.thirdStallTa : festival.thirdStallEn} {festival.icon}
          </span>
        </div>
      </div>
    </div>
  );
};
