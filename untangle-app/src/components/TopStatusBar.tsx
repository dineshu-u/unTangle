import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, Shield, Globe, Users, Check, X, Key, UserCheck } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GroqApiKeyModal } from './GroqApiKeyModal';

interface TopStatusBarProps {
  onOpenParentGate: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({ onOpenParentGate }) => {
  const {
    language,
    setLanguage,
    t,
    childProgress,
    activePlayer,
    currentUser,
    registeredAccounts,
    switchUserByMobile,
    signOutUser,
    currentLevelNumber,
    hasGroqKey,
    refreshLevelContent,
    isQuietMode,
    setIsQuietMode,
    appMode,
    setAppMode,
  } = useApp();

  const [showPlayerModal, setShowPlayerModal] = useState(false);
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
  const activeMobile = currentUser?.parentMobile;

  return (
    <>
      <header className="shrink-0 w-full bg-white/95 backdrop-blur-md border-b border-amber-200/80 px-2 sm:px-3 py-1.5 sm:py-2 select-none z-30 shadow-xs">
        <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
          {/* Left: Active Learner Profile & Age Group (Tapping opens Account Switcher) */}
          <button
            onClick={() => {
              sounds.playTap();
              setShowPlayerModal(true);
            }}
            className="flex items-center bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-full px-2 sm:px-2.5 py-1 shadow-2xs transition-colors shrink-0 max-w-[155px] sm:max-w-[210px] cursor-pointer"
            title={activeMobile ? `Explorer: ${activeName} (Click to Switch Account)` : 'Switch Learner Profile'}
          >
            <span className="text-sm sm:text-base mr-1">{activeAvatar}</span>
            <div className="flex flex-col text-left truncate">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-amber-950 leading-none truncate">
                  {activeName}
                </span>
                {activeAge && (
                  <span className="text-[8px] font-bold text-amber-900 bg-amber-200/70 px-1 py-0.2 rounded-full shrink-0">
                    {activeAge} • Lvl {currentLevelNumber}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-amber-800 leading-tight hidden sm:block truncate">
                {activeMobile ? `📱 ${activeMobile}` : (language === 'ta' ? childProgress.levelTitleTa : childProgress.levelTitleEn)}
              </span>
            </div>
          </button>

          {/* Center: Sound Storm Weather Pill */}
          <div className="flex items-center bg-sky-50 border border-sky-200 rounded-full px-2 py-1 shadow-2xs shrink-0">
            <span className="text-xs sm:text-sm mr-1 animate-pulse">
              {childProgress.stormProgress < 40 ? '⛈️' : childProgress.stormProgress < 80 ? '🌤️' : '☀️'}
            </span>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-sky-900 leading-none">
              <span className="hidden sm:inline">{t.soundStorm}</span>
              <span>{childProgress.stormProgress}%</span>
            </div>
          </div>

          {/* Right: Controls + PROMINENT PARENT BUTTON (Always visible on mobile!) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-bold transition-transform active:scale-95 shadow-2xs shrink-0"
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
              className={`p-1 sm:p-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0 ${
                hasGroqKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 animate-pulse'
              }`}
              title={hasGroqKey ? 'Groq AI Connected' : 'Connect Groq AI Key'}
            >
              <Key className="w-3 h-3" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1 sm:p-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0 ${
                isQuietMode ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}
              title={isQuietMode ? 'Sound Muted' : 'Sound Enabled'}
            >
              {isQuietMode ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            {/* PROMINENT PARENT BUTTON: Guaranteed visible on all smartphone screens! */}
            {appMode === 'child' ? (
              <button
                onClick={onOpenParentGate}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-2 sm:px-2.5 py-1 text-[11px] font-black shadow-xs transition-transform active:scale-95 shrink-0 ring-2 ring-emerald-300"
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
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full px-2 sm:px-2.5 py-1 text-[11px] font-black shadow-xs transition-transform active:scale-95 shrink-0"
                title={t.childMode}
              >
                <span>🏡</span>
                <span className="leading-none whitespace-nowrap">{t.childMode}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Multi-Account Switcher Modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border-2 border-amber-200 text-left relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  {language === 'ta' ? 'கற்பவர் சுயவிவரங்கள்' : 'Registered Learners'}
                </h3>
              </div>
              <button
                onClick={() => setShowPlayerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              {language === 'ta'
                ? 'பெற்றோரின் அலைபேசி எண் மூலம் தனிமைப்படுத்தப்பட்ட கணக்குகள்:'
                : "Accounts mapped by parent's mobile number (Primary Key):"}
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {registeredAccounts.map((acc) => {
                const isSelected = currentUser?.parentMobile === acc.parentMobile;
                return (
                  <button
                    key={acc.parentMobile}
                    onClick={() => {
                      sounds.playTap();
                      switchUserByMobile(acc.parentMobile);
                      setShowPlayerModal(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                        : 'border-slate-200 hover:bg-amber-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-2xl">{acc.avatar}</span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {acc.childName} ({acc.ageGroup} yrs)
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          📱 {acc.parentMobile} • {acc.language === 'ta' ? 'தமிழ்' : 'English'}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                setShowPlayerModal(false);
                signOutUser();
              }}
              className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '🔄 வேறு கணக்கு / வெளியேறு' : '🔄 Switch Explorer / Sign Out'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Groq Key Modal */}
      <GroqApiKeyModal
        isOpen={showGroqKeyModal}
        onClose={() => setShowGroqKeyModal(false)}
        onKeySaved={refreshLevelContent}
      />
    </>
  );
};
