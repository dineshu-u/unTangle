import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MindyAvatar } from '../../components/MindyAvatar';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Sparkles, Award, RefreshCw, Volume2, Wand2, XCircle } from 'lucide-react';
import { MindyMood } from '../../types';
import { TeachMindyItem } from '../../domain/models/content';
import { TeachMindyService } from '../../services/teachMindyService';
import { ApiKeyService } from '../../services/apiKeyService';

export const MindyHouseView: React.FC = () => {
  const {
    language,
    t,
    setCurrentScreen,
    childProgress,
    teachMindyWord,
    recordLearningEvent,
    requestMindySpeech,
    currentLevelWords,
  } = useApp();

  // Load realistic, diverse, non-repeating scenarios (21+ curated scenarios + dynamic AI)
  const [scenarios, setScenarios] = useState<TeachMindyItem[]>(() => {
    return TeachMindyService.getInitialScenarios(language);
  });

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [hasApiKey] = useState(() => ApiKeyService.hasApiKey());

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [mindyMood, setMindyMood] = useState<MindyMood>('confused');
  const [speechText, setSpeechText] = useState<string>('');

  // 3-second auto-advance timer reference
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  // ONLY reload scenarios when language changes (DO NOT depend on childProgress to prevent looping between SUN and BOAT!)
  useEffect(() => {
    clearAutoAdvanceTimer();
    const fresh = TeachMindyService.getInitialScenarios(language);
    setScenarios(fresh);
    setScenarioIndex(0);
    setSelectedOptionId(null);
    setIsSuccess(false);
    setIsWrong(false);
    setIsAnswerLocked(false);
    setSpeechText('');
  }, [language, clearAutoAdvanceTimer]);

  const currentScenario = scenarios[scenarioIndex % scenarios.length];

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
    };
  }, [clearAutoAdvanceTimer]);

  const handleNextScenario = useCallback(async () => {
    clearAutoAdvanceTimer();
    sounds.playTap();
    setSelectedOptionId(null);
    setIsSuccess(false);
    setIsWrong(false);
    setIsAnswerLocked(false);
    setMindyMood('confused');
    setSpeechText('');

    // If approaching the end of current list, proactively generate a fresh realistic scenario
    if (scenarioIndex + 2 >= scenarios.length) {
      try {
        const avoid = scenarios.map((s) => s.targetWord);
        const { scenario } = await TeachMindyService.generateNextScenario(language, undefined, avoid);
        setScenarios((prev) => [...prev, scenario]);
      } catch {
        // Safe fallback
      }
    }

    setScenarioIndex((prev) => prev + 1);
  }, [scenarioIndex, scenarios, language, clearAutoAdvanceTimer]);

  const handleSelectOption = async (optId: string, isCorrect: boolean) => {
    if (!currentScenario || isAnswerLocked) return;

    // Lock board so child cannot double-click while feedback is showing
    setIsAnswerLocked(true);
    setSelectedOptionId(optId);
    clearAutoAdvanceTimer();

    if (isCorrect) {
      // 1. Correct Guess
      setIsSuccess(true);
      setIsWrong(false);
      setMindyMood('celebrating');
      sounds.playCelebration();
      sounds.triggerHaptic([40, 60, 100]);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Award taught word through domain logic
      teachMindyWord(currentScenario.targetWord, currentScenario.meaning);
      TeachMindyService.markWordUsed(language, currentScenario.targetWord);

      // Contextual reaction via Mindy AI service
      const mindyReply = await requestMindySpeech({
        activityType: 'teach_mindy',
        contentId: currentScenario.id,
        outcome: 'success',
        context: { word: currentScenario.targetWord },
      });

      setSpeechText(mindyReply.message);

      if (language === 'ta') {
        sounds.speak(`நன்றி! ${currentScenario.targetWord} என்றால் என்னவென்று எனக்கு அருமையாக புரிந்தது!`, 'ta', { emotion: 'excited' });
      } else {
        sounds.speak(`Thank you! Now I know what ${currentScenario.targetWord} really means!`, 'en', { emotion: 'excited' });
      }

      // Automatically advance after 3 seconds
      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNextScenario();
      }, 3000);
    } else {
      // 2. Wrong Guess
      setIsSuccess(false);
      setIsWrong(true);
      setMindyMood('confused');
      sounds.playWobble();
      sounds.triggerHaptic(50);

      recordLearningEvent({
        activityType: 'teach_mindy',
        contentId: currentScenario.id,
        eventType: 'activity_retried',
        outcome: 'retry',
      });

      const wrongMsg = language === 'ta'
        ? 'மிண்டி: ம்ம்ம்... இது சரியான விடை இல்லை! 3 வினாடிகளில் அடுத்த புதிருக்கு செல்வோம்!'
        : "Mindy: Hmm... that's not quite right! Moving to next mystery in 3 seconds...";

      setSpeechText(wrongMsg);

      if (language === 'ta') {
        sounds.speak('ம்ம்ம்... இது சரியான விடை இல்லை!', 'ta', { emotion: 'curious' });
      } else {
        sounds.speak("Hmm... that's not quite right!", 'en', { emotion: 'curious' });
      }

      // Automatically advance after 3 seconds even on wrong guess
      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNextScenario();
      }, 3000);
    }
  };

  // Request on-demand AI-generated misconception from Mindy
  const handleGenerateAiMystery = async () => {
    clearAutoAdvanceTimer();
    sounds.playTap();
    setIsAiGenerating(true);
    setMindyMood('thinking');
    setSpeechText(
      language === 'ta'
        ? 'மிண்டி ஒரு புதிய வேடிக்கையான புதிரை யோசிக்கிறது... 💭'
        : 'Mindy is thinking of a funny new puzzle... 💭'
    );

    try {
      const avoid = scenarios.map((s) => s.targetWord);
      const nextWord = (currentLevelWords || []).find((w) => !avoid.includes(w.word));
      const preferred = nextWord
        ? { word: nextWord.word, meaning: nextWord.meaning, emoji: nextWord.emoji }
        : undefined;

      const { scenario } = await TeachMindyService.generateNextScenario(language, preferred, avoid);

      setScenarios((prev) => {
        const copy = [...prev];
        copy.splice(scenarioIndex + 1, 0, scenario);
        return copy;
      });

      setSelectedOptionId(null);
      setIsSuccess(false);
      setIsWrong(false);
      setIsAnswerLocked(false);
      setScenarioIndex((prev) => prev + 1);
      sounds.playChime();
    } catch {
      handleNextScenario();
    } finally {
      setIsAiGenerating(false);
      setMindyMood('confused');
    }
  };

  const speakPrompt = () => {
    sounds.playMindyChirp();
    if (!currentScenario) return;
    sounds.speak(`${currentScenario.sillyClaim} ${currentScenario.prompt}`, language, { emotion: 'happy' });
  };

  if (!currentScenario) return null;

  return (
    <div className="w-full flex-1 flex flex-col p-3 max-w-md mx-auto overflow-y-auto">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-2.5">
        <button
          onClick={() => {
            clearAutoAdvanceTimer();
            sounds.playTap();
            setCurrentScreen('village');
          }}
          className="flex items-center gap-1 bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToVillage}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {hasApiKey && (
            <div className="flex items-center gap-1 text-[10px] font-black text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200 shadow-2xs">
              <Sparkles className="w-3 h-3 text-purple-600 animate-pulse" />
              <span>AI</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{childProgress.wordsTaughtCount} {t.wordsTaughtCount}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-amber-50/90 border-2 border-amber-200 rounded-3xl p-4 shadow-md relative overflow-hidden flex-1 flex flex-col justify-between">
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black text-sky-900 flex items-center gap-1">
                <span>{t.mindyHouse}</span>
                <span>🏠</span>
              </h2>
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                #{scenarioIndex + 1}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Dynamic AI Mystery Button */}
              <button
                onClick={handleGenerateAiMystery}
                disabled={isAiGenerating || isAnswerLocked}
                className="flex items-center gap-1 text-xs font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-full border border-purple-300 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
                title={language === 'ta' ? 'புதிய AI புதிர்' : 'Ask Mindy for New AI Word'}
              >
                <Wand2 className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{language === 'ta' ? 'புதிய புதிர்' : 'New Mystery'}</span>
              </button>

              <button
                onClick={speakPrompt}
                className="flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-2.5 py-1 rounded-full border border-sky-300 shadow-2xs transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.readAloudBtn}</span>
              </button>
            </div>
          </div>

          {/* Mindy Avatar in Frame */}
          <div className="flex justify-center mb-1.5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-full bg-sky-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                <MindyAvatar mood={mindyMood} size="lg" onClick={speakPrompt} />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-xs">
                {language === 'ta' ? 'மிண்டி' : 'Mindy'}
              </span>
            </div>
          </div>

          {/* Dialogue Box */}
          <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3.5 shadow-xs border border-amber-100 mb-2.5 text-center">
            <p className="text-xs sm:text-base font-bold text-slate-800 leading-relaxed">
              {currentScenario.sillyClaim}
            </p>
            <p className="text-[11px] sm:text-sm font-medium text-slate-600 mt-1">
              {currentScenario.prompt}
            </p>
            {speechText && (
              <p className={`text-xs font-semibold rounded-xl p-2 mt-2 border animate-in fade-in-50 ${
                isSuccess
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : isWrong
                  ? 'text-rose-800 bg-rose-50 border-rose-200'
                  : 'text-sky-800 bg-sky-50 border-sky-200'
              }`}>
                💬 {speechText}
              </p>
            )}
          </div>

          {/* 3 Options Grid: completely neutral until clicked; locks on answer; no pre-checked markers */}
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            {currentScenario.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const showCorrect = isSuccess && opt.isCorrect;
              const showWrong = isWrong && isSelected && !opt.isCorrect;

              return (
                <button
                  key={`tm_q${scenarioIndex}_${opt.id}_${idx}`}
                  disabled={isAnswerLocked || isAiGenerating}
                  onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                  className={`relative p-2 sm:p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between transition-all duration-200 active:scale-95 shadow-xs min-h-[82px] sm:min-h-[96px] ${
                    showCorrect
                      ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-200 scale-102 shadow-md'
                      : showWrong
                      ? 'bg-rose-100 text-rose-800 border-rose-400 animate-pulse'
                      : isAnswerLocked
                      ? 'bg-white/80 opacity-70 border-slate-200'
                      : 'bg-white hover:bg-amber-50 text-slate-800 border-slate-200 cursor-pointer'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{opt.emoji}</span>
                  <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight mt-1 ${showCorrect ? 'text-white' : 'text-slate-800'}`}>
                    {opt.label}
                  </span>

                  {showCorrect && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-xs">
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

        {/* Feedback & 3-Second Countdown Banner */}
        <div>
          {isSuccess ? (
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white p-3 rounded-2xl shadow-md text-center border border-emerald-400 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>
                  {t.teachMindySuccessPrefix} {childProgress.wordsTaughtCount} {t.teachMindySuccessSuffix}
                </span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>

              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[11px] text-emerald-100 font-medium animate-pulse">
                  {language === 'ta' ? '3 வினாடிகளில் தானாக மாறும்...' : 'Advancing in 3s...'}
                </span>
                <button
                  onClick={handleNextScenario}
                  className="bg-amber-300 hover:bg-amber-200 text-amber-950 text-xs font-black px-3.5 py-1 rounded-full shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t.teachNextWord}</span>
                </button>
              </div>
            </div>
          ) : isWrong ? (
            <div className="bg-rose-100 border-2 border-rose-300 text-rose-900 p-2.5 rounded-2xl shadow-xs text-center animate-in zoom-in-95 duration-200">
              <span className="text-xs font-bold block">
                {language === 'ta'
                  ? 'தவறான விடை! 3 வினாடிகளில் அடுத்த புதிருக்கு செல்வோம்...'
                  : 'Not quite right! Moving to next mystery in 3 seconds...'}
              </span>
              <div className="mt-1.5 flex items-center justify-center">
                <button
                  onClick={handleNextScenario}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'ta' ? 'உடனே அடுத்தது ➡️' : 'Skip Next ➡️'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-200/60 border border-amber-300 rounded-2xl p-2 text-center text-[11px] font-bold text-amber-900 flex items-center justify-between">
              <span className="flex-1 text-center">{t.mindySillyIntro}</span>
              <button
                onClick={handleNextScenario}
                className="shrink-0 text-[10px] font-extrabold text-amber-800 hover:text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300"
              >
                {language === 'ta' ? 'அடுத்த சொல் ➡️' : 'Skip ➡️'}
              </button>
            </div>
          )}
        </div>

        {/* Lesson Cards Ribbon */}
        {childProgress.lessonCards.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-amber-200/80">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
              ⭐ {t.collectedCardsTitle} ({childProgress.lessonCards.length})
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {childProgress.lessonCards.slice(0, 6).map((card) => (
                <div
                  key={card.id}
                  className="shrink-0 bg-white border border-amber-300 rounded-xl p-2 shadow-2xs text-center w-26"
                >
                  <span className="text-xs font-black text-amber-950 block truncate">
                    {card.word}
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                    {card.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
