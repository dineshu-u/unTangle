import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MindyAvatar } from '../../components/MindyAvatar';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, PlusCircle, Sparkles, Check, ArrowRight, XCircle } from 'lucide-react';
import { LetterItem } from '../../domain/models/content';
import { LetterGardenService } from '../../services/letterGardenService';

export const LetterGardenView: React.FC = () => {
  const { language, t, setCurrentScreen, contentRepo, recordLearningEvent } = useApp();
  const [activeCreatureId, setActiveCreatureId] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'cards' | 'match'>('cards');
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Baseline curated creatures from repository
  const repoCreatures = contentRepo.getLetters(language);

  // Dynamically unlocked creatures without ANY upper limit (Stage 1 = 4, Stage 2 = 8, ..., Stage 5 = 20, Stage 6 = 24, etc.)
  const [unlockedCreatures, setUnlockedCreatures] = useState<LetterItem[]>(() => {
    return LetterGardenService.getUnlockedCreatures(language, repoCreatures);
  });

  // Match Game State: 3-second wait on correct or wrong guess, then auto-advances
  const [matchTargetIndex, setMatchTargetIndex] = useState(0);
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isMatchSuccess, setIsMatchSuccess] = useState(false);
  const [isMatchWrong, setIsMatchWrong] = useState(false);

  // Auto-advance timer ref
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearAdvanceTimer();
    };
  }, [clearAdvanceTimer]);

  // Keep synced with language changes & reset match state
  useEffect(() => {
    clearAdvanceTimer();
    const updated = LetterGardenService.getUnlockedCreatures(language, repoCreatures);
    setUnlockedCreatures(updated);
    setMatchTargetIndex(0);
    setMatchFeedback(null);
    setSelectedChoiceId(null);
    setIsMatchSuccess(false);
    setIsMatchWrong(false);
  }, [language, repoCreatures, clearAdvanceTimer]);

  const visibleCreatures = unlockedCreatures;
  const currentStage = Math.ceil(visibleCreatures.length / 4);

  const currentTarget = visibleCreatures[matchTargetIndex % visibleCreatures.length];

  // Guaranteed inclusion of currentTarget among 4 randomized choices
  const matchChoices = useMemo(() => {
    if (!currentTarget || visibleCreatures.length === 0) return [];

    // 1. Other creatures as distractors
    const otherCreatures = visibleCreatures.filter((c) => c.id !== currentTarget.id);

    // 2. Scramble distractors
    const shuffledDistractors = [...otherCreatures].sort((a, b) => {
      return (a.letter.charCodeAt(0) * 17) % 5 - (b.letter.charCodeAt(0) * 17) % 5;
    });

    // 3. Take 3 distractors
    const pickedDistractors = shuffledDistractors.slice(0, 3);

    // 4. Combine target creature with distractors (total up to 4 choices)
    const combined = [currentTarget, ...pickedDistractors];

    // 5. Scramble the choices so the target is at a varying position (not always first)
    const targetCode = currentTarget.letter.charCodeAt(0);
    const rotation = targetCode % combined.length;
    const finalChoices = [...combined.slice(rotation), ...combined.slice(0, rotation)];

    return finalChoices;
  }, [currentTarget, visibleCreatures]);

  const handleTeachMe = (creature: LetterItem) => {
    setActiveCreatureId(creature.id);
    sounds.playChime();
    sounds.triggerHaptic(40);

    sounds.speak(
      `${creature.letter} ... ${creature.creatureName} ... ${creature.meaning}`,
      language,
      { emotion: 'happy' }
    );

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
    });

    recordLearningEvent({
      activityType: 'letter_garden',
      contentId: creature.id,
      eventType: 'letter_explored',
      outcome: 'success',
      metadata: { letter: creature.letter, creature: creature.creatureName },
    });
  };

  // Next question handler: resets state cleanly and moves to next target
  const handleNextTarget = useCallback(() => {
    clearAdvanceTimer();
    setSelectedChoiceId(null);
    setIsMatchSuccess(false);
    setIsMatchWrong(false);
    setMatchFeedback(null);
    setMatchTargetIndex((prev) => (prev + 1) % visibleCreatures.length);
    sounds.playTap();
  }, [clearAdvanceTimer, visibleCreatures.length]);

  const handleCreatureMatchPick = (creature: LetterItem) => {
    // Only process click if not already completed / locked
    if (!currentTarget || isMatchSuccess || isMatchWrong) return;

    setSelectedChoiceId(creature.id);
    clearAdvanceTimer();

    if (creature.id === currentTarget.id) {
      // Correct Guess: celebrate and wait 3 seconds before auto-advancing
      setIsMatchSuccess(true);
      setIsMatchWrong(false);
      sounds.playCelebration();
      sounds.triggerHaptic([40, 60, 100]);

      setMatchFeedback(
        language === 'ta'
          ? `சரியான பொருத்தம்! ${creature.letter} - ${creature.creatureName} 🎉`
          : `Correct match! ${creature.letter} - ${creature.creatureName} 🎉`
      );

      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
      });

      recordLearningEvent({
        activityType: 'letter_garden',
        contentId: creature.id,
        eventType: 'creature_matched',
        outcome: 'success',
        metadata: { letter: creature.letter, creature: creature.creatureName },
      });

      // Wait 3 seconds, then automatically advance to the next question
      advanceTimerRef.current = setTimeout(() => {
        handleNextTarget();
      }, 3000);
    } else {
      // Wrong Guess: show feedback and wait 3 seconds before auto-advancing
      setIsMatchSuccess(false);
      setIsMatchWrong(true);
      sounds.playWobble();
      sounds.triggerHaptic(50);

      setMatchFeedback(
        language === 'ta'
          ? `தவறான விடை! இது ${creature.creatureName}. 3 வினாடிகளில் அடுத்த கேள்வி வரும்...`
          : `Not quite! That was ${creature.creatureName}. Moving to next question in 3s...`
      );

      // Wait 3 seconds, then automatically advance to the next question
      advanceTimerRef.current = setTimeout(() => {
        handleNextTarget();
      }, 3000);
    }
  };

  const speakMatchTarget = () => {
    sounds.playMindyChirp();
    if (!currentTarget) return;
    if (language === 'ta') {
      sounds.speak(`எந்த படம் '${currentTarget.letter}' எழுத்தில் தொடங்கும்?`, 'ta', { emotion: 'curious' });
    } else {
      sounds.speak(`Which item starts with letter '${currentTarget.letter}'?`, 'en', { emotion: 'curious' });
    }
  };

  // Discover and unlock next stage of creatures (UNLIMITED: 16 -> 20 -> 24 -> 28 -> ...)
  const handleDiscoverNewCreatures = async () => {
    sounds.playTap();
    setIsDiscovering(true);

    try {
      const result = await LetterGardenService.discoverMoreCreatures(language, repoCreatures);
      setUnlockedCreatures(result.allItems);

      sounds.playCelebration();
      sounds.triggerHaptic([50, 80, 120]);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.55 },
      });
    } catch {
      sounds.playTap();
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-3 max-w-md mx-auto overflow-y-auto">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            clearAdvanceTimer();
            sounds.playTap();
            setCurrentScreen('village');
          }}
          className="flex items-center gap-1 bg-white/90 text-slate-700 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToVillage}</span>
        </button>

        {/* Tab switch between Creature Cards and Matching Game */}
        <div className="flex bg-white rounded-full p-0.5 border border-emerald-300 shadow-2xs">
          <button
            onClick={() => {
              clearAdvanceTimer();
              setGameMode('cards');
              sounds.playTap();
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              gameMode === 'cards'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ta' ? 'அட்டைகள்' : 'Cards'}
          </button>
          <button
            onClick={() => {
              clearAdvanceTimer();
              setGameMode('match');
              setSelectedChoiceId(null);
              setIsMatchSuccess(false);
              setIsMatchWrong(false);
              setMatchFeedback(null);
              sounds.playTap();
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              gameMode === 'match'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ta' ? 'பொருத்துக' : 'Match Game'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-3.5 shadow-md flex-1 flex flex-col justify-between">
        {/* Mindy Speech Bubble */}
        <div className="flex items-start gap-2.5 bg-white/95 rounded-2xl p-3 shadow-xs border border-emerald-100 mb-2.5">
          <MindyAvatar mood="happy" size="sm" onClick={() => sounds.playMindyChirp()} />
          <div className="flex-1 text-left">
            <span className="text-xs font-bold text-emerald-800 block">
              {language === 'ta' ? 'மிண்டி: வணக்கம் நண்பரே! 😊' : 'Mindy: Hello Friend! 😊'}
            </span>
            <p className="text-xs text-slate-700 leading-tight mt-0.5">
              {gameMode === 'cards'
                ? (language === 'ta'
                    ? 'எழுத்துத் தோட்டத்திற்கு நல்வரவு! புதிய விலங்குகளையும் பொருட்களையும் அறிவோம்!'
                    : "Welcome to Letter Garden! Discover friendly animals, fruits, and everyday items!")
                : (language === 'ta'
                    ? 'ஒலியை கேட்டு சரியான படத்தை தொட்டுப் பொருத்துங்கள்!'
                    : 'Listen to the sound and tap the matching item!')}
            </p>
          </div>
        </div>

        {/* MODE 1: DYNAMIC CREATURE CARDS */}
        {gameMode === 'cards' && (
          <>
            <div className="text-center mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-emerald-950 text-left">
                  {t.varnamalaTitle}
                </h2>
                <p className="text-[10px] font-bold text-emerald-800 text-left">
                  {language === 'ta'
                    ? `நிலை ${currentStage} • ${visibleCreatures.length} பொருட்கள் கண்டறியப்பட்டது`
                    : `Stage ${currentStage} • ${visibleCreatures.length} Items Discovered`}
                </p>
              </div>

              {/* Dynamic Discovery Button: UNLIMITED! NEVER LIMITED TO 16! */}
              <button
                onClick={handleDiscoverNewCreatures}
                disabled={isDiscovering}
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-full shadow-xs transition-transform active:scale-95 disabled:opacity-50"
              >
                {isDiscovering ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ta' ? 'தேடுகிறது...' : 'Discovering...'}</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? '+ புதிய நண்பர்கள்' : '+ Unlock More'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Creature Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-2.5 max-h-[380px] overflow-y-auto pr-1">
              {visibleCreatures.map((item, idx) => {
                const isActive = activeCreatureId === item.id;
                const isDynamic = idx >= 16;

                return (
                  <div
                    key={`card_${item.id}_${idx}`}
                    className={`relative bg-white rounded-2xl p-3 border-2 shadow-xs flex flex-col items-center justify-between transition-all duration-200 ${
                      isActive
                        ? 'border-emerald-500 ring-2 ring-emerald-200 -translate-y-0.5'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {item.letter}
                    </div>

                    <div className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5 ${
                      isDynamic
                        ? 'bg-purple-600 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}>
                      <span>{isDynamic ? '✨' : '🎉'}</span>
                      <span>{isDynamic ? (language === 'ta' ? 'புதியது' : 'AI New') : t.friendTag}</span>
                    </div>

                    <div className="my-2 flex flex-col items-center justify-center">
                      <div
                        className={`text-4xl transition-transform cursor-pointer select-none ${
                          isActive ? 'scale-115 animate-bounce' : 'hover:scale-105'
                        }`}
                        onClick={() => handleTeachMe(item)}
                      >
                        {item.emoji}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTeachMe(item)}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[10px] py-1 px-2 rounded-xl shadow-xs flex items-center justify-center gap-1 transition-transform active:scale-95 mb-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{t.teachMeBtn}</span>
                    </button>

                    <div className="text-center">
                      <span className="text-xs font-black text-slate-800 block leading-tight">
                        {item.creatureName}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 block">
                        {item.associatedWord}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* MODE 2: INTERACTIVE CREATURE MATCH GAME */}
        {gameMode === 'match' && currentTarget && (
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="text-center bg-white/95 rounded-2xl p-3 shadow-xs border border-emerald-200 mb-2">
              <span className="text-xs font-bold text-emerald-900 block mb-1">
                {t.creatureMatchTitle}
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-2xl border-2 border-blue-200 shadow-inner">
                  {currentTarget.letter}
                </span>
                <button
                  onClick={speakMatchTarget}
                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full transition-transform active:scale-95"
                  title="Listen to prompt"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {t.creatureMatchPrompt}
              </p>
            </div>

            {/* Feedback Banner with 3s notice & skip button */}
            {matchFeedback && (
              <div className={`mb-2 py-2 px-3 rounded-2xl text-xs font-bold text-center border animate-in zoom-in-95 flex items-center justify-between ${
                isMatchSuccess
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-600 shadow-md'
                  : 'bg-rose-100 text-rose-950 border-rose-300 shadow-xs'
              }`}>
                <span className="flex-1 text-center">{matchFeedback}</span>
                <button
                  onClick={handleNextTarget}
                  className="ml-2 shrink-0 bg-white/90 hover:bg-white text-slate-900 text-[11px] font-black px-3 py-1 rounded-full shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                >
                  <span>{language === 'ta' ? 'அடுத்தது' : 'Skip Next'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 4 Interactive Choice Buttons with question-scoped keys */}
            <div className="grid grid-cols-2 gap-2.5 my-auto">
              {matchChoices.map((item, idx) => {
                const isSelected = selectedChoiceId === item.id;
                const isTarget = item.id === currentTarget.id;
                const showCorrect = isMatchSuccess && isTarget;
                const showWrong = isMatchWrong && isSelected && !isTarget;
                const isLocked = isMatchSuccess || isMatchWrong;

                return (
                  <button
                    key={`match_q${matchTargetIndex}_${item.id}_${idx}`}
                    disabled={isLocked}
                    onClick={() => handleCreatureMatchPick(item)}
                    className={`relative rounded-2xl p-3 border-2 shadow-xs flex flex-col items-center justify-center transition-all duration-200 min-h-[92px] ${
                      showCorrect
                        ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-200 scale-102 shadow-md'
                        : showWrong
                        ? 'bg-rose-100 text-rose-800 border-rose-400 animate-pulse'
                        : isLocked
                        ? 'bg-white/80 opacity-70 border-slate-200'
                        : 'bg-white hover:bg-emerald-50 active:bg-emerald-100 text-slate-800 border-slate-200 hover:border-emerald-400 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <span className="text-4xl mb-1">{item.emoji}</span>
                    <span className={`text-xs font-bold ${showCorrect ? 'text-white' : 'text-slate-800'}`}>
                      {item.creatureName}
                    </span>

                    {showCorrect && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {showWrong && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-xs">
                        <XCircle className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Progress Bar: Dynamic without fixed 16 limit! */}
        <div className="bg-white/95 rounded-2xl p-2 border border-emerald-200 shadow-2xs mt-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-emerald-950 mb-1">
            <span>
              {language === 'ta'
                ? `தோட்ட நண்பர்கள்: ${visibleCreatures.length} கண்டறியப்பட்டது`
                : `Garden Discoveries: ${visibleCreatures.length} Unlocked`}
            </span>
            <span className="text-emerald-700 font-extrabold">
              {language === 'ta' ? `நிலை ${currentStage}` : `Stage ${currentStage}`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(15, ((visibleCreatures.length % 4 === 0 ? 4 : visibleCreatures.length % 4) / 4) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
