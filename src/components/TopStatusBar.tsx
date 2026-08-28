import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, Shield, Globe, Key } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GroqApiKeyModal } from './GroqApiKeyModal';

interface TopStatusBarProps {
  onOpenParentGate: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = () => {
  const {
    language,
    setLanguage,
    t,
    childProgress,
    activePlayer,
    currentUser,
    currentLevelNumber,
    hasGroqKey,
    refreshLevelContent,
    isQuietMode,
    setIsQuietMode,
    appMode,
    setAppMode,
  } = useApp();

  const [showGroqKeyModal, setShowGroqKeyModal] = useState(false);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
    sounds.playTap();
  };

  const toggleSound = () => {
    setIsQuietMode(!isQuietMode);
    sounds.playTap();
  };

  const activeName = currentUser?.childName || activePlayer.playerName;
  const activeAvatar = currentUser?.avatar || activePlayer.avatar;
  const activeAge = currentUser?.ageGroup ? `${currentUser.ageGroup}` : null;

  return (
    <>
      <header className="shrink-0 w-full bg-white/95 backdrop-blur-md border-b border-amber-200/80 px-2 sm:px-3 py-1.5 sm:py-2 select-none z-30 shadow-xs">
        <div className="flex items-center justify-between gap-1 sm:gap-2 w-full min-w-0">
          {/* Left: Active Learner Profile & Age Group (Child-friendly display pill, no ellipsis) */}
          <div
            className="flex items-center bg-amber-50 border border-amber-200 rounded-full px-2 py-1 shadow-2xs shrink min-w-0 select-none"
          >
            <span className="text-sm sm:text-base mr-1 shrink-0">{activeAvatar}</span>
            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[10.5px] font-black text-amber-950 leading-none whitespace-nowrap">
                  {activeName}
                </span>
                {activeAge && (
                  <span className="text-[8px] font-bold text-amber-900 bg-amber-200/70 px-1 py-0.2 rounded-full shrink-0 hidden xs:inline-block">
                    {activeAge} • L{currentLevelNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Sound Storm Weather Pill (Compact on mobile) */}
          <div className="hidden xs:flex items-center bg-sky-50 border border-sky-200 rounded-full px-2 py-1 shadow-2xs shrink-0">
            <span className="text-xs sm:text-sm mr-1">
              {childProgress.stormProgress < 40 ? '⛈️' : childProgress.stormProgress < 80 ? '🌤️' : '☀️'}
            </span>
            <div className="flex items-center gap-0.5 text-[9.5px] sm:text-[10px] font-black text-sky-900 leading-none">
              <span className="hidden sm:inline">{t.soundStorm}</span>
              <span>{childProgress.stormProgress}%</span>
            </div>
          </div>

          {/* Right: Controls + PROMINENT PARENT BUTTON (Always 100% visible on mobile!) */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-bold transition-transform active:scale-95 shadow-2xs shrink-0 cursor-pointer"
              title={language === 'en' ? 'Switch to Tamil' : 'ஆங்கிலத்திற்கு மாற்றுக'}
            >
              <Globe className="w-3 h-3 text-blue-600" />
              <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
            </button>

            {/* Groq Key Settings Button */}
            <button
              onClick={() => {
                sounds.playTap();
                setShowGroqKeyModal(true);
              }}
              className={`p-1 sm:p-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer ${
                hasGroqKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
              title={hasGroqKey ? 'Groq AI Connected' : 'Connect Groq AI Key'}
            >
              <Key className="w-3 h-3" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1 sm:p-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer ${
                isQuietMode ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}
              title={isQuietMode ? 'Sound Muted' : 'Sound Enabled'}
            >
              {isQuietMode ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            {/* PROMINENT PARENT BUTTON: Directly opens Parent Dashboard with 1-Tap! */}
            {appMode === 'child' ? (
              <button
                onClick={() => {
                  sounds.playTap();
                  setAppMode('parent');
                }}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-2.5 py-1 text-[11px] font-black shadow-xs transition-transform active:scale-95 shrink-0 ring-2 ring-emerald-300 cursor-pointer z-20"
                title={t.parentMode}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="leading-none whitespace-nowrap">{t.parentMode}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAppMode('child');
                  sounds.playTap();
                }}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full px-2.5 py-1 text-[11px] font-black shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer z-20"
                title={t.childMode}
              >
                <span>🏡</span>
                <span className="leading-none whitespace-nowrap">{t.childMode}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Groq Key Modal */}
      <GroqApiKeyModal
        isOpen={showGroqKeyModal}
        onClose={() => setShowGroqKeyModal(false)}
        onKeySaved={refreshLevelContent}
      />
    </>
  );
};
