import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  User,
  Phone,
  Calendar,
  Sparkles,
  Check,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { UserAccount, AgeGroup, AGE_GROUP_CONFIG } from '../domain/models/userAccount';
import { UserAccountService, PRESET_ACCOUNTS } from '../services/persistence/userAccountService';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['👦🏽', '👧🏽', '🧒🏼', '🦁', '🦋', '🦜', '🌟', '🌱'];

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, currentUser, signInUser, switchUserByMobile } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [signInMobile, setSignInMobile] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);

  // Register Form State
  const [childName, setChildName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('5-8');
  const [parentMobile, setParentMobile] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👦🏽');
  const [regLanguage, setRegLanguage] = useState<'en' | 'ta'>(language);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isTa = language === 'ta';

  // Handle Quick Demo Account Selection
  const handleSelectPreset = (preset: UserAccount) => {
    sounds.playTap();
    switchUserByMobile(preset.parentMobile);
    sounds.playCelebration();
    confetti({ particleCount: 50, spread: 60 });
    onClose();
  };

  // Handle Sign In with Existing Mobile Number (Primary Key)
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    const clean = UserAccountService.cleanMobile(signInMobile);

    if (clean.length < 10) {
      setSignInError(
        isTa
          ? 'தயவுசெய்து சரியான 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      sounds.playWobble();
      return;
    }

    const existing = UserAccountService.getAccount(clean);
    if (!existing) {
      setSignInError(
        isTa
          ? 'இந்த எண்ணில் கணக்கு இல்லை. தயவுசெய்து பதிவு செய்யவும்.'
          : 'No account found with this number. Please register as a new learner!'
      );
      sounds.playWobble();
      return;
    }

    setSignInError(null);
    switchUserByMobile(clean);
    sounds.playCelebration();
    confetti({ particleCount: 60, spread: 70 });
    onClose();
  };

  // Handle New Learner Registration (Mapped by Parent Mobile as Primary Key)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();

    if (!childName.trim()) {
      setRegError(isTa ? 'குழந்தையின் பெயரை உள்ளிடவும்.' : "Please enter the child's name.");
      sounds.playWobble();
      return;
    }

    const cleanMobile = UserAccountService.cleanMobile(parentMobile);
    if (cleanMobile.length < 10) {
      setRegError(
        isTa
          ? 'சரியான 10 இலக்க பெற்றோரின் அலைபேசி எண்ணை உள்ளிடவும்.'
          : "Please enter a valid 10-digit parent's mobile number."
      );
      sounds.playWobble();
      return;
    }

    setRegError(null);

    const newAccount: UserAccount = {
      parentMobile: cleanMobile,
      childName: childName.trim(),
      ageGroup,
      avatar: selectedAvatar,
      language: regLanguage,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    signInUser(newAccount);
    setLanguage(regLanguage);

    sounds.playCelebration();
    confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50 rounded-3xl p-4 sm:p-5 max-w-md w-full shadow-2xl border-4 border-amber-300 text-left relative max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Close Button */}
        {currentUser && (
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-amber-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div>
          {/* Header Badge */}
          <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2 mb-3">
            <span className="text-2xl">🏡🐦</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-amber-950">
                {isTa ? 'கற்பவர் சுயவிவரம் & உள்நுழைவு' : 'Learner Sign-In & Profile'}
              </h2>
              <p className="text-[10px] text-amber-800 font-medium">
                {isTa
                  ? 'பெற்றோர் அலைபேசி எண் மூலம் தனித்தனி கற்றல் தரவு'
                  : "Parent's mobile number acts as primary key for separate data"}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-amber-100/80 rounded-2xl p-1 mb-3 border border-amber-200">
            <button
              onClick={() => {
                sounds.playTap();
                setMode('signin');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isTa ? 'உள்நுழைக' : 'Sign In'}</span>
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setMode('register');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isTa ? '+ புதிய கற்பவர் பதிவு' : '+ New Learner'}</span>
            </button>
          </div>

          {/* TAB 1: SIGN IN WITH EXISTING MOBILE NUMBER */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isTa ? 'பெற்றோரின் அலைபேசி எண் (Primary Key):' : "Parent's Mobile Number (Primary Key):"}</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={signInMobile}
                  onChange={(e) => setSignInMobile(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono bg-white shadow-inner"
                  autoFocus
                />
                {signInError && (
                  <p className="text-[10px] font-bold text-rose-600 mt-1">
                    ⚠️ {signInError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>{isTa ? 'கணக்கிற்குள் நுழைக' : 'Sign In to Account'}</span>
              </button>

              {/* Quick Switch Preset Demo Accounts */}
              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-[10px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isTa ? 'சோதனை செய்ய மாதிரி கணக்குகள் (Demo):' : 'Instant Demo Accounts (Click to Test):'}</span>
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_ACCOUNTS.map((preset) => (
                    <button
                      key={preset.parentMobile}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-100/60 text-left shadow-2xs transition-transform active:scale-95"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{preset.avatar}</span>
                        <div className="truncate">
                          <span className="text-[10px] font-black text-slate-800 block truncate">
                            {preset.childName}
                          </span>
                          <span className="text-[8px] font-bold text-amber-800 block">
                            {preset.ageGroup} yrs
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER NEW LEARNER (NAME, AGE GROUP, PARENT MOBILE) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              {/* Child's Name & Avatar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isTa ? 'குழந்தையின் பெயர்:' : "Child's Name:"}</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="e.g. Aarav, Kavi, Priya"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white shadow-inner font-bold"
                  />
                  <div className="flex gap-1 overflow-x-auto p-1 bg-amber-100/60 rounded-xl border border-amber-200">
                    {AVATAR_OPTIONS.slice(0, 4).map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`text-lg p-0.5 rounded-lg transition-transform ${
                          selectedAvatar === av ? 'scale-120 bg-amber-300 ring-2 ring-amber-400' : 'opacity-70'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age Group Selection: 5-8, 9-12, 13-15, 16-18 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isTa ? 'வயது பிரிவு (Age Group):' : 'Age Group (Personalized Levels):'}</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['5-8', '9-12', '13-15', '16-18'] as AgeGroup[]).map((group) => {
                    const cfg = AGE_GROUP_CONFIG[group];
                    const isSelected = ageGroup === group;
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => {
                          sounds.playTap();
                          setAgeGroup(group);
                        }}
                        className={`p-1.5 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 shadow-xs scale-101 ring-2 ring-amber-300'
                            : 'bg-white border-slate-200 hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                            <span>{cfg.badgeEmoji}</span>
                            <span>{isTa ? cfg.labelTa : cfg.labelEn}</span>
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-amber-700 stroke-[3]" />}
                        </div>
                        <span className="text-[8px] text-slate-500 leading-tight block mt-0.5">
                          {isTa ? cfg.descTa : cfg.descEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Parent Mobile Number (PRIMARY KEY) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isTa ? 'பெற்றோரின் அலைபேசி எண் (முதன்மை சாவி / Primary Key):' : "Parent's Mobile Number (Primary Key):"}</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210 (10 digits)"
                  value={parentMobile}
                  onChange={(e) => setParentMobile(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono bg-white shadow-inner"
                />
              </div>

              {/* Learning Language Choice */}
              <div className="flex items-center justify-between bg-amber-100/60 p-2 rounded-xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isTa ? 'கற்றல் மொழி:' : 'Primary Learning Language:'}</span>
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setRegLanguage('ta')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      regLanguage === 'ta' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    தமிழ்
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegLanguage('en')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      regLanguage === 'en' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {regError && (
                <p className="text-[10px] font-bold text-rose-600">
                  ⚠️ {regError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isTa ? 'பதிவு செய்து விளையாடத் தொடங்க' : 'Register & Start Journey'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Security & Privacy Notice */}
        <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-[9px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {isTa
              ? 'அனைத்து தரவுகளும் உங்கள் அலைபேசி எண் கீழ் இந்தச் சாதனத்தில் பாதுகாப்பாக தனிமைப்படுத்தப்படும்.'
              : "All learning data is strictly isolated on-device mapped to the parent's mobile number."}
          </span>
        </div>
      </div>
    </div>
  );
};
