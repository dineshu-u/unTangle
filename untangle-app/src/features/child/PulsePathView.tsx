import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Music, Sparkles } from 'lucide-react';

export const PulsePathView: React.FC = () => {
  const { language, t, setCurrentScreen, recordLearningEvent, currentLevelWords, contentRepo } = useApp();
  const [activeBeat, setActiveBeat] = useState<'bass' | 'slap' | 'rim' | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Dyslexia-friendly Tempo Mode: Calm (🐢) vs Brisk (🐇)
  const [tempoMode, setTempoMode] = useState<'calm' | 'brisk'>('calm');

  // Dynamic words from active level batch or repository
  const words = currentLevelWords.length > 0
    ? currentLevelWords
    : contentRepo.getRealWords(language);

  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const currentWordItem = words[currentWordIdx % words.length];

  // Syllables array for active word chunking
  const syllables = currentWordItem ? currentWordItem.syllables : ['ம', 'ர', 'ம்'];
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(0);
  const [isWordBlended, setIsWordBlended] = useState(false);

  const wordEmoji = currentWordItem?.emoji || '🪘';

  // Reset syllable cursor on word change
  useEffect(() => {
    setActiveSyllableIndex(0);
    setIsWordBlended(false);
  }, [currentWordIdx, language]);

  const handleDrumHit = (type: 'bass' | 'slap' | 'rim', e?: React.MouseEvent) => {
    sounds.playDrumBeat(type);
    sounds.triggerHaptic(type === 'bass' ? 60 : 35);
    setActiveBeat(type);

    const newRipple = {
      id: Date.now(),
      x: e ? e.nativeEvent.offsetX : 80,
      y: e ? e.nativeEvent.offsetY : 80,
    };
    setRipples((prev) => [...prev.slice(-4), newRipple]);

    // Current syllable being drummed
    const currentSyllable = syllables[activeSyllableIndex];
    if (currentSyllable) {
      sounds.speak(currentSyllable, language);
    }

    const nextSyllableIdx = activeSyllableIndex + 1;

    if (nextSyllableIdx >= syllables.length) {
      // Word completely assembled through rhythm!
      setIsWordBlended(true);
      sounds.playCelebration();
      sounds.triggerHaptic([60, 100, 140]);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Speak the whole blended word with high-energy celebration emotion
      setTimeout(() => {
        if (currentWordItem) {
          sounds.speak(currentWordItem.word, language, { emotion: 'excited' });
        }
      }, 400);

      // Record dyslexia phonemic assembly learning event
      recordLearningEvent({
        activityType: 'pulse_path',
        contentId: currentWordItem?.id || 'rhythm_chunking',
        eventType: 'rhythm_beat',
        outcome: 'success',
        metadata: {
          word: currentWordItem?.word,
          syllablesCount: syllables.length,
          tempo: tempoMode,
        },
      });

      setStreakCount((prev) => prev + 1);

      // Advance to next word after celebration
      setTimeout(() => {
        setCurrentWordIdx((prev) => (prev + 1) % words.length);
      }, 1600);
    } else {
      setActiveSyllableIndex(nextSyllableIdx);
    }

    setTimeout(() => setActiveBeat(null), 150);
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

        <div className="flex items-center gap-1.5">
          {/* Dyslexia Pacing Tempo Switcher */}
          <div className="flex bg-purple-100 rounded-full p-0.5 border border-purple-200 shadow-2xs">
            <button
              onClick={() => {
                sounds.playTap();
                setTempoMode('calm');
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                tempoMode === 'calm' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-900'
              }`}
              title="Calm Rhythm Pacing (Recommended for Dyslexia)"
            >
              🐢 {language === 'ta' ? 'அமைதி' : 'Calm'}
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setTempoMode('brisk');
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                tempoMode === 'brisk' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-900'
              }`}
              title="Brisk Drum Rhythm"
            >
              🐇 {language === 'ta' ? 'வேகம்' : 'Brisk'}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full border border-purple-200 text-xs font-bold shadow-2xs">
            <Music className="w-3 h-3 text-purple-600" />
            <span>{streakCount}</span>
          </div>
        </div>
      </div>

      {/* Main Drum Screen */}
      <div className="bg-gradient-to-b from-purple-100 via-indigo-50 to-amber-50 border-2 border-purple-200 rounded-3xl p-3.5 shadow-md flex-1 flex flex-col justify-between text-center relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-black text-purple-950 flex items-center gap-1">
              <span>🥁</span>
              <span>{t.pulseTitle}</span>
            </h2>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
              {currentWordIdx + 1}/{words.length}
            </span>
          </div>

          <p className="text-[10px] text-purple-800 font-semibold mb-2">
            {language === 'ta'
              ? 'ஒவ்வொரு அசைக்கும் மத்தளத்தை தட்டி ஒலிகளை இணைக்கவும்!'
              : 'Tap the drum on each syllable to link rhythm and sounds!'}
          </p>

          {/* Dyslexia Syllable Chunking Board */}
          <div className="bg-white/95 rounded-2xl p-3 shadow-xs border-2 border-purple-200 w-full flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl animate-bounce">{wordEmoji}</span>
              <span className="text-xs font-bold text-slate-500">
                {currentWordItem?.meaning}
              </span>
            </div>

            {/* Syllable Chunk Cards */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {syllables.map((syl, sIdx) => {
                const isCurrent = activeSyllableIndex === sIdx && !isWordBlended;
                const isCompleted = sIdx < activeSyllableIndex || isWordBlended;

                return (
                  <div
                    key={sIdx}
                    className={`min-w-[50px] sm:min-w-[60px] py-2 px-3 rounded-2xl border-3 text-center transition-all duration-300 font-black text-xl sm:text-2xl ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-100 text-amber-950 scale-110 shadow-md ring-4 ring-amber-300 animate-pulse'
                        : isCompleted
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>{syl}</span>
                    <span className="block text-[9px] font-bold mt-0.5 opacity-70">
                      Beat {sIdx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pointer / Prompt Indicator */}
            <div className="mt-2 text-xs font-black text-purple-900">
              {isWordBlended ? (
                <span className="text-emerald-700 font-black text-sm flex items-center gap-1 animate-bounce">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{currentWordItem?.word} — {language === 'ta' ? 'அருமையான தாள இணைப்பு!' : 'Great rhythm blending!'}</span>
                </span>
              ) : (
                <span className="text-amber-800">
                  👉 {language === 'ta' ? `தட்டுக: "${syllables[activeSyllableIndex]}"` : `Tap Beat for "${syllables[activeSyllableIndex]}"`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Village Drum Head */}
        <div className="my-2 flex flex-col items-center justify-center">
          <div
            className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-6 border-amber-900 bg-gradient-to-br from-amber-100 via-stone-200 to-amber-200 shadow-xl flex items-center justify-center cursor-pointer select-none transition-transform duration-100 active:scale-98 ${
              activeBeat ? 'ring-6 ring-purple-300 scale-102' : ''
            }`}
          >
            <div className="absolute inset-2 rounded-full border-4 border-dashed border-amber-800/50 pointer-events-none" />

            {/* Inner Black Spot (Syahi) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleDrumHit('bass', e);
              }}
              className={`w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-radial from-stone-800 via-stone-900 to-black shadow-inner flex items-center justify-center transition-transform active:scale-95 ${
                activeBeat === 'bass' ? 'scale-90 ring-4 ring-amber-400' : ''
              }`}
            >
              <div className="text-center text-white pointer-events-none">
                <span className="text-[10px] font-black block tracking-wider">
                  {language === 'ta' ? 'அடி' : 'BASS'}
                </span>
                <span className="text-xs font-bold opacity-80">
                  {language === 'ta' ? 'த' : 'Tha'}
                </span>
              </div>
            </div>

            {/* Slap & Rim Zones */}
            <button
              onClick={(e) => handleDrumHit('slap', e)}
              className="absolute top-2.5 font-black text-xs text-amber-950/80 hover:text-amber-950"
            >
              {language === 'ta' ? 'திமி' : 'Dhin'}
            </button>
            <button
              onClick={(e) => handleDrumHit('rim', e)}
              className="absolute bottom-2.5 font-black text-xs text-amber-950/80 hover:text-amber-950"
            >
              {language === 'ta' ? 'தோம்' : 'Thom'}
            </button>

            {/* Ripples */}
            {ripples.map((rip) => (
              <span
                key={rip.id}
                className="absolute w-20 h-20 rounded-full border-2 border-purple-500 animate-ping pointer-events-none opacity-60"
              />
            ))}
          </div>

          <p className="text-[9px] font-bold text-slate-500 mt-1">
            {t.drumHint}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleDrumHit('bass')}
            className="py-2 px-1 rounded-xl bg-amber-800 text-white font-black text-xs shadow-xs active:scale-95 transition-transform"
          >
            {t.drumBassLabel}
          </button>
          <button
            onClick={() => handleDrumHit('slap')}
            className="py-2 px-1 rounded-xl bg-amber-600 text-white font-black text-xs shadow-xs active:scale-95 transition-transform"
          >
            {t.drumSlapLabel}
          </button>
          <button
            onClick={() => handleDrumHit('rim')}
            className="py-2 px-1 rounded-xl bg-purple-700 text-white font-black text-xs shadow-xs active:scale-95 transition-transform"
          >
            {t.drumRimLabel}
          </button>
        </div>

        {/* Dyslexia Phonological Awareness Note */}
        <div className="mt-2 bg-purple-50/90 rounded-xl p-1.5 border border-purple-200 text-[9px] text-purple-900 leading-tight text-center">
          💡 {language === 'ta'
            ? 'தாளத்துடன் அசை பிரித்தல் டிஸ்லெக்ஸியா கற்றலில் ஒலிகளை பிரித்து அறிய பெரிதும் உதவுகிறது.'
            : 'Rhythm and syllable chunking directly strengthen phonological awareness and auditory temporal processing in dyslexia.'}
        </div>
      </div>
    </div>
  );
};
