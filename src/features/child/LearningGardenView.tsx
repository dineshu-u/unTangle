import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';

export const LearningGardenView: React.FC = () => {
  const { language, t, setCurrentScreen, childProgress, activePlayer, currentLevelWords, contentRepo } = useApp();
  const [selectedFruit, setSelectedFruit] = useState<string | null>(null);

  // Dynamic Word Fruits: Derived from child's actual mastered words & lesson cards!
  const treeFruits = useMemo(() => {
    // Collect all words the child has actually mastered or taught
    const taughtWords = childProgress.lessonCards.map(c => c.word);
    const masteredWords = activePlayer.wordsMastered;
    const currentWords = currentLevelWords.map(w => w.word);
    const uniqueWordNames = Array.from(new Set([...taughtWords, ...masteredWords, ...currentWords]));

    // Predefined branch coordinates across the tree foliage
    const branchCoords = [
      { x: '28%', y: '35%' },
      { x: '68%', y: '30%' },
      { x: '45%', y: '45%' },
      { x: '35%', y: '55%' },
      { x: '62%', y: '52%' },
      { x: '50%', y: '25%' },
      { x: '22%', y: '48%' },
      { x: '75%', y: '45%' },
    ];

    const fruitEmojis = ['🥭', '🍎', '🍐', '🍊', '🍓', '🍇', '🍑', '🍒'];

    return uniqueWordNames.slice(0, 8).map((word, idx) => {
      const coord = branchCoords[idx % branchCoords.length];
      // Try to find matching ContentItem for emoji
      const match = contentRepo.validateWord(word, language);
      const emoji = match.item?.emoji || fruitEmojis[idx % fruitEmojis.length];

      return {
        id: `fruit_${idx}`,
        word,
        emoji,
        x: coord.x,
        y: coord.y,
      };
    });
  }, [childProgress.lessonCards, activePlayer.wordsMastered, currentLevelWords, contentRepo, language]);

  const handleTapFruit = (fruit: typeof treeFruits[0]) => {
    setSelectedFruit(fruit.word);
    sounds.playChime();
    sounds.triggerHaptic(30);

    if (language === 'ta') {
      sounds.speak(`${fruit.word} பழம் பழுத்து விட்டது!`, 'ta');
    } else {
      sounds.speak(`Sweet ripe ${fruit.word}!`, 'en');
    }

    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col p-3 max-w-md mx-auto overflow-y-auto">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between mb-2.5">
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

        <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
          🌱 {treeFruits.length} {t.fruitsBloomingBadge}
        </span>
      </div>

      {/* Main Learning Garden Container */}
      <div className="bg-gradient-to-b from-sky-100 via-emerald-100 to-amber-100 border-2 border-emerald-300 rounded-3xl p-3.5 shadow-md flex-1 flex flex-col justify-between relative overflow-hidden">
        {/* Title */}
        <div className="text-center bg-white/95 rounded-2xl py-1.5 px-3 shadow-xs border border-emerald-200 mb-2">
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center justify-center gap-1.5">
            <span>🌳</span>
            <span>{t.learningGardenTitle}</span>
          </h2>
          <p className="text-[11px] text-emerald-800 font-medium">
            {t.learningGardenNotice}
          </p>
        </div>

        {/* Living Word Tree with Dynamic Harvest Fruits */}
        <div className="relative flex-1 min-h-[300px] flex items-center justify-center">
          <svg viewBox="0 0 300 320" className="w-full h-full max-h-[340px] drop-shadow-md">
            {/* Trunk */}
            <path
              d="M130 320 C130 250, 110 200, 125 150 C135 110, 165 110, 175 150 C190 200, 170 250, 170 320 Z"
              fill="#78350f"
            />
            {/* Foliage */}
            <circle cx="150" cy="110" r="75" fill="#15803d" opacity="0.9" />
            <circle cx="105" cy="130" r="55" fill="#16a34a" opacity="0.95" />
            <circle cx="195" cy="130" r="55" fill="#16a34a" opacity="0.95" />
            <circle cx="150" cy="80" r="60" fill="#22c55e" />
          </svg>

          {/* Dynamic Fruits on Tree */}
          {treeFruits.map((fruit) => (
            <div
              key={fruit.id}
              style={{ top: fruit.y, left: fruit.x }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onClick={() => handleTapFruit(fruit)}
            >
              <div className="flex flex-col items-center transition-transform transform group-hover:scale-120 active:scale-95">
                <span className="text-3xl animate-bounce drop-shadow-md" style={{ animationDuration: '2.5s' }}>
                  {fruit.emoji}
                </span>
                <span className="bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-black text-slate-800 shadow-xs border border-amber-300 mt-0.5">
                  {fruit.word}
                </span>
              </div>
            </div>
          ))}

          {/* Grass & Sound Flowers at bottom */}
          <div className="absolute bottom-1 inset-x-0 flex justify-around pointer-events-none text-xl">
            <span>🌸</span>
            <span>🌼</span>
            <span>🌺</span>
            <span>🌻</span>
            <span>🌷</span>
          </div>
        </div>

        {/* Selected Fruit Announcement */}
        {selectedFruit && (
          <div className="bg-white/95 border border-emerald-400 rounded-2xl p-2 text-center shadow-xs animate-in zoom-in-95 mt-2">
            <span className="text-xs font-bold text-emerald-950">
              ✨ {selectedFruit} — {t.sweetWordFruit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
