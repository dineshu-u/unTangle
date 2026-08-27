import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trash2, Rocket, CheckCircle, Sparkles, Key, Gift, Star } from 'lucide-react';
import { GroqApiKeyModal } from '../../components/GroqApiKeyModal';

const LEVEL_GIFTS: Record<number, { nameEn: string; nameTa: string; emoji: string }> = {
  1: { nameEn: 'Golden Kite Ribbon', nameTa: 'தங்கக் காற்றாடி நாடா', emoji: '🪁' },
  2: { nameEn: 'Rhythm Village Drum', nameTa: 'தாள மத்தள மணி', emoji: '🪘' },
  3: { nameEn: 'Sacred Diya of Wisdom', nameTa: 'ஞான அகல் விளக்கு', emoji: '🪔' },
  4: { nameEn: 'Sweet Pongal Harvest Pot', nameTa: 'இனிய பொங்கல் பானை', emoji: '🍯' },
  5: { nameEn: 'Dancing Peacock Trophy', nameTa: 'மயில் தோகை விருது', emoji: '🦚' },
  6: { nameEn: 'Banyan Tree Seedling', nameTa: 'ஆலமர நாற்று', emoji: '🌳' },
  7: { nameEn: 'Village Scholar Crown', nameTa: 'கிராமத்து அறிஞர் கிரீடம்', emoji: '👑' },
};

export const WordKiteView: React.FC = () => {
  const {
    language,
    t,
    setCurrentScreen,
    contentRepo,
    currentLevelWords,
    currentLevelNumber,
    isGeneratingNextLevel,
    hasGroqKey,
    refreshLevelContent,
    completeLevelAndGenerateNext,
    recordWordKiteAttempt,
    requestMindySpeech,
  } = useApp();

  const wordsInLevel = currentLevelWords.length > 0
    ? currentLevelWords
    : contentRepo.getRealWords(language);

  const [wordIndexInLevel, setWordIndexInLevel] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [levelRetries, setLevelRetries] = useState(0);

  // Safe Index within current level batch
  const safeIndex = wordIndexInLevel < wordsInLevel.length ? wordIndexInLevel : 0;
  const currentTargetItem = wordsInLevel[safeIndex];
  const targetWord = currentTargetItem ? currentTargetItem.word : '';
  const wordEmoji = currentTargetItem?.emoji || '✨';
  const maxSlots = currentTargetItem ? currentTargetItem.syllables.length : 3;

  const [slottedLetters, setSlottedLetters] = useState<string[]>([]);
  const [kiteState, setKiteState] = useState<'idle' | 'flying' | 'wobbling'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Truly Jumbled Keypad Tiles (Fix for "words are not jumbled" bug)
  const currentKeypad = useMemo(() => {
    if (!currentTargetItem) return [];
    const syllables = currentTargetItem.syllables;
    const distractors = currentTargetItem.distractors || [];
    const combined = Array.from(new Set([...syllables, ...distractors]));

    // Thorough Fisher-Yates scramble using word seed
    const shuffled = [...combined];
    const seed = currentTargetItem.word;
    for (let i = shuffled.length - 1; i > 0; i--) {
      const code = (seed.charCodeAt(i % seed.length) * 37 + i * 23 + 7) % (i + 1);
      const temp = shuffled[i];
      shuffled[i] = shuffled[code];
      shuffled[code] = temp;
    }

    // Guarantee that syllables are NOT in exact starting order
    if (syllables.length > 1 && shuffled.slice(0, syllables.length).join('') === syllables.join('')) {
      shuffled.reverse();
    }

    const rows: string[][] = [];
    for (let i = 0; i < shuffled.length && rows.length < 5; i += 4) {
      rows.push(shuffled.slice(i, i + 4));
    }
    return rows;
  }, [currentTargetItem]);

  // Reset state when changing word
  useEffect(() => {
    setSlottedLetters([]);
    setKiteState('idle');
    setFeedbackMsg(null);
  }, [safeIndex, currentLevelNumber, language]);

  const handleTapKey = (letter: string) => {
    if (slottedLetters.length >= maxSlots) {
      sounds.playTap();
      return;
    }
    sounds.playTap();
    sounds.triggerHaptic(25);
    setSlottedLetters((prev) => [...prev, letter]);
    setKiteState('idle');
    setFeedbackMsg(null);
  };

  const handleClear = () => {
    sounds.playTap();
    setSlottedLetters([]);
    setKiteState('idle');
    setFeedbackMsg(null);
  };

  const handleFlyKite = async () => {
    const formed = slottedLetters.join('');
    if (!formed) {
      sounds.playTap();
      return;
    }

    const validation = contentRepo.validateWord(formed, language);
    const isTargetMatch = formed === targetWord;
    const isReal = validation.isReal || isTargetMatch;

    if (isReal) {
      setKiteState('flying');
      sounds.playKiteWhoosh();
      sounds.playCelebration();
      sounds.triggerHaptic([50, 100, 150]);

      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.5 },
      });

      // Update student's learning profile & learning event
      await recordWordKiteAttempt(formed, true, currentTargetItem?.letter);
      sounds.speak(formed, language, { emotion: 'excited' });

      const isLastWord = safeIndex + 1 >= wordsInLevel.length;

      const mindyReply = await requestMindySpeech({
        activityType: 'word_kite',
        contentId: currentTargetItem?.id || formed,
        outcome: 'success',
        context: { word: formed },
      });

      setFeedbackMsg(mindyReply.message || t.kiteSoaring);

      if (isLastWord) {
        setLevelCompleted(true);
        sounds.playCelebration();
        // Background AI generation of next level's word batch
        await completeLevelAndGenerateNext();
      } else {
        setTimeout(() => {
          setWordIndexInLevel(prev => prev + 1);
          setSlottedLetters([]);
          setKiteState('idle');
          setFeedbackMsg(null);
        }, 1300);
      }
    } else {
      setKiteState('wobbling');
      sounds.playWobble();
      sounds.triggerHaptic(60);
      setLevelRetries(prev => prev + 1);

      await recordWordKiteAttempt(formed, false, currentTargetItem?.letter);

      const mindyReply = await requestMindySpeech({
        activityType: 'word_kite',
        contentId: currentTargetItem?.id || formed,
        outcome: 'retry',
        context: { word: formed },
      });

      setFeedbackMsg(mindyReply.message || t.kiteWobble);
    }
  };

  const handleStartNextLevel = () => {
    sounds.playTap();
    setLevelCompleted(false);
    setLevelRetries(0);
    setWordIndexInLevel(0);
    setSlottedLetters([]);
    setKiteState('idle');
    setFeedbackMsg(null);
  };

  const isDiagnosticPhase = currentLevelNumber <= 2;
  const earnedGift = LEVEL_GIFTS[currentLevelNumber] || LEVEL_GIFTS[7];
  const starCount = levelRetries === 0 ? 3 : levelRetries <= 2 ? 2 : 1;

  return (
    <div className="w-full flex-1 flex flex-col p-3 max-w-md mx-auto overflow-y-auto">
      {/* Top Bar with Back Button */}
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

        <div className="flex items-center gap-1.5">
          {/* Level Pill */}
          <span className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-2xs ${
            isDiagnosticPhase
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-emerald-100 text-emerald-950 border-emerald-300'
          }`}>
            {language === 'ta' ? `நிலை ${currentLevelNumber}` : `Level ${currentLevelNumber}`}
            {!isDiagnosticPhase && <Sparkles className="w-3 h-3 inline ml-1 text-emerald-600 animate-spin" />}
          </span>

          {/* Word Progress in Level */}
          <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200">
            {safeIndex + 1} / {wordsInLevel.length}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-b from-sky-300 via-sky-200 to-amber-50 rounded-3xl border-2 border-sky-300 shadow-md overflow-hidden flex-1 flex flex-col justify-between p-3 relative">
        {/* Title Bar with Word Emoji Image Ball */}
        <div className="text-center bg-white/95 rounded-2xl py-1.5 px-3 shadow-xs border border-sky-200 mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500">
            {isDiagnosticPhase
              ? (language === 'ta' ? 'அடிப்படை மதிப்பீடு' : 'Baseline Diagnostic')
              : (language === 'ta' ? 'தனிப்பயன் AI நிலை' : 'AI Personalized Level')}
          </span>

          {/* Target Word & Emoji Ball */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl animate-pulse">{wordEmoji}</span>
            <h2 className="text-sm font-black tracking-wider text-sky-950">
              {targetWord}
            </h2>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-0.5"
            title="Groq AI Key Settings"
          >
            <Key className="w-2.5 h-2.5" />
            <span>{hasGroqKey ? 'AI Active' : 'AI Key'}</span>
          </button>
        </div>

        {/* Sky with Flying Kite & Floating Emoji Image Ball */}
        <div className="relative h-44 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-sky-400 to-sky-200 border border-white/60 shadow-inner">
          <div className="absolute top-2 left-4 text-3xl opacity-75 animate-pulse">☁️</div>
          <div className="absolute top-6 right-6 text-2xl opacity-80">☁️</div>

          {/* Floating Emoji Image Ball near the kite */}
          <div className="absolute top-2 right-14 w-11 h-11 rounded-full bg-white/90 shadow-md border-2 border-white flex items-center justify-center text-2xl animate-bounce" style={{ animationDuration: '3s' }}>
            {wordEmoji}
          </div>

          {/* Animated Diamond Kite */}
          <div
            className={`relative transition-all duration-700 flex flex-col items-center ${
              kiteState === 'flying'
                ? '-translate-y-8 scale-110 rotate-3'
                : kiteState === 'wobbling'
                ? 'translate-y-3 rotate-12 animate-pulse'
                : 'hover:scale-105'
            }`}
          >
            <div className="relative w-28 h-28 drop-shadow-xl">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,5 95,50 50,50" fill="#f59e0b" />
                <polygon points="50,5 5,50 50,50" fill="#ef4444" />
                <polygon points="5,50 50,95 50,50" fill="#10b981" />
                <polygon points="95,50 50,95 50,50" fill="#3b82f6" />

                <line x1="50" y1="5" x2="50" y2="95" stroke="#ffffff" strokeWidth="2" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="#ffffff" strokeWidth="2" />

                <circle cx="42" cy="42" r="3.5" fill="#1e293b" />
                <circle cx="58" cy="42" r="3.5" fill="#1e293b" />
                <path d="M44 54 Q50 62 56 54" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="36" cy="46" r="3" fill="#f43f5e" opacity="0.6" />
                <circle cx="64" cy="46" r="3" fill="#f43f5e" opacity="0.6" />
              </svg>

              {/* Word written on the Kite */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
                  {slottedLetters.length > 0 ? slottedLetters.join('') : targetWord}
                </span>
              </div>
            </div>

            {/* Ribbon Tails */}
            <div className="flex gap-1 -mt-1 pointer-events-none">
              <span className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1.5 h-8 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-7 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>

          {/* Smiling Boy Holding String */}
          <div className="absolute bottom-1 right-2 flex flex-col items-center">
            <span className="text-3xl drop-shadow-md">👦🏽</span>
            <span className="text-[9px] font-bold text-sky-950 bg-white/85 px-1.5 rounded-full">Aarav</span>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="50%"
              y1="60%"
              x2="88%"
              y2="88%"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.75"
            />
          </svg>
        </div>

        {/* Level Completed Celebration Modal with Star Rating & Unlockable Gift */}
        {levelCompleted ? (
          <div className="my-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 p-3.5 rounded-2xl text-center shadow-lg border-2 border-white animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-1 text-white font-black text-sm drop-shadow-sm">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>
                {language === 'ta'
                  ? `நிலை ${currentLevelNumber} முடிந்தது!`
                  : `Level ${currentLevelNumber} Completed!`}
              </span>
            </div>

            {/* Star Rating Display */}
            <div className="flex justify-center gap-1 my-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < starCount
                      ? 'text-yellow-200 fill-yellow-300 drop-shadow-xs'
                      : 'text-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Unlockable Village Gift Box */}
            <div className="bg-white/95 rounded-xl p-2.5 my-1.5 text-center shadow-xs border border-amber-200">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-950">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>{language === 'ta' ? 'புதிய கிராமத்துப் பரிசு!' : 'New Village Gift Unlocked!'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-2xl animate-bounce">{earnedGift.emoji}</span>
                <span className="text-xs font-bold text-slate-800">
                  {language === 'ta' ? earnedGift.nameTa : earnedGift.nameEn}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-amber-950 font-bold mt-1">
              {currentLevelNumber === 2
                ? (language === 'ta'
                    ? 'அடிப்படை மதிப்பீடு முடிந்தது! நிலை 3 முதல் உங்கள் கற்றல் வரலாற்றுக்கேற்ப AI புதிய சொற்களை உருவாக்கும்!'
                    : 'Diagnostic baseline mapped! Level 3+ unlocks AI-personalized vocabulary tailored to your mistakes!')
                : isGeneratingNextLevel
                ? (language === 'ta' ? 'அடுத்த நிலைக்கு புதிய சொற்கள் தயாராகின்றன...' : 'Personalizing next level with AI...')
                : (language === 'ta' ? 'அடுத்த நிலை தயாராகிவிட்டது!' : 'Next level is ready!')}
            </p>

            <div className="flex items-center justify-center gap-2 mt-2">
              {!hasGroqKey && currentLevelNumber >= 2 && (
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="bg-amber-100 text-amber-950 font-bold text-xs px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1 hover:bg-amber-200"
                >
                  <Key className="w-3 h-3" />
                  <span>Connect Groq Key</span>
                </button>
              )}
              <button
                onClick={handleStartNextLevel}
                className="bg-white text-emerald-800 font-black text-xs px-4 py-1.5 rounded-full shadow-md hover:bg-emerald-50 transition-transform active:scale-95 inline-flex items-center gap-1"
              >
                <span>🚀</span>
                <span>
                  {language === 'ta'
                    ? `நிலை ${currentLevelNumber + 1}-க்கு செல்க!`
                    : `Start Level ${currentLevelNumber + 1}!`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          feedbackMsg && (
            <div
              className={`mt-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-center border animate-in zoom-in-95 ${
                kiteState === 'flying'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                  : 'bg-amber-100 text-amber-900 border-amber-400'
              }`}
            >
              {feedbackMsg}
            </div>
          )
        )}

        {/* Word Construction Slots */}
        <div className="bg-white/95 rounded-2xl p-2 my-1.5 shadow-2xs border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 mr-2">{t.wordLabel}</span>

          <div className="flex gap-1.5 flex-1 justify-center">
            {Array.from({ length: maxSlots }).map((_, idx) => {
              const char = slottedLetters[idx];
              const colors = ['bg-sky-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-2xs border transition-all ${
                    char
                      ? `${colors[idx % colors.length]} text-white border-white scale-105`
                      : 'bg-amber-100/60 border-dashed border-amber-300 text-transparent'
                  }`}
                >
                  {char || '_'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Jumbled Keypad & Actions Grid */}
        <div className="flex gap-2">
          {/* Keypad Grid (JUMBLED Tiles) */}
          <div className="flex-1 bg-white/95 p-1.5 rounded-2xl shadow-2xs border border-slate-200 flex flex-col gap-1">
            {currentKeypad.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-between gap-1">
                {row.map((tile, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => handleTapKey(tile)}
                    className="flex-1 h-8 sm:h-9 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-sm sm:text-base flex items-center justify-center shadow-2xs transition-transform active:scale-90"
                  >
                    {tile}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Action Buttons: Clear & Fly Kite */}
          <div className="w-22 flex flex-col gap-1.5 justify-between">
            <button
              onClick={handleClear}
              className="h-14 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex flex-col items-center justify-center shadow-xs transition-transform active:scale-95 border border-sky-600"
            >
              <Trash2 className="w-3.5 h-3.5 mb-0.5" />
              <span>{t.clearBtn}</span>
            </button>

            <button
              onClick={handleFlyKite}
              className="flex-1 rounded-2xl bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-md transition-transform active:scale-95 border border-emerald-600 min-h-[75px]"
            >
              <Rocket className="w-5 h-5 mb-0.5 animate-pulse" />
              <span className="text-center leading-tight">{t.flyKiteBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Groq API Key Modal */}
      <GroqApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onKeySaved={refreshLevelContent}
      />
    </div>
  );
};
