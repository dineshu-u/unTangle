import React, { useState } from 'react';
import { UserAccountService, PRESET_ACCOUNTS } from '../../services/persistence/userAccountService';
import { AgeGroup, AGE_GROUP_CONFIG, UserAccount } from '../../domain/models/userAccount';

export interface LoginViewProps {
  onLogin: (account: UserAccount) => void;
  onRegisterClick?: () => void;
  initialMode?: 'signin' | 'signup';
}

// ── Internal decorators ────────────────────────────────────────────────────

interface CloudProps {
  style: React.CSSProperties;
  blobL: { w: number; h: number; top: number; left: number };
  blobR: { w: number; h: number; top: number; left: number };
}

const Cloud: React.FC<CloudProps> = ({ style, blobL, blobR }) => (
  <div className="absolute pointer-events-none" style={style} aria-hidden="true">
    <div className="absolute inset-0 bg-white rounded-[100px] opacity-90" />
    <div
      className="absolute bg-white rounded-full"
      style={{ width: blobL.w, height: blobL.h, top: blobL.top, left: blobL.left }}
    />
    <div
      className="absolute bg-white rounded-full"
      style={{ width: blobR.w, height: blobR.h, top: blobR.top, left: blobR.left }}
    />
  </div>
);

const Bush: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div
    className="absolute bottom-[2%] w-[64px] h-[36px] pointer-events-none"
    style={{ [side]: '4%' }}
    aria-hidden="true"
  >
    <div
      className="absolute inset-0"
      style={{ background: '#4E9A4A', borderRadius: '50% 50% 40% 40%' }}
    />
    <div
      className="absolute bg-[#4E9A4A] rounded-full"
      style={{ width: 40, height: 40, top: -16, left: -6 }}
    />
    <div
      className="absolute bg-[#4E9A4A] rounded-full"
      style={{ width: 36, height: 36, top: -14, right: -4 }}
    />
  </div>
);

const AVATAR_OPTIONS = ['👦🏽', '👧🏽', '🧒🏼', '🦁', '🦋', '🦜', '🌟', '🌱'];

// ── Main component ─────────────────────────────────────────────────────────

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegisterClick, initialMode = 'signin' }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign-in state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign-up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpAgeGroup, setSignUpAgeGroup] = useState<AgeGroup>('5-8');
  const [signUpAvatar, setSignUpAvatar] = useState('👦🏽');
  const [signUpLanguage, setSignUpLanguage] = useState<'ta' | 'en'>('ta');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instant login with Old Credentials
  const handleQuickCredentialLogin = (preset: UserAccount) => {
    setUsername(preset.username || preset.childName.toLowerCase());
    setPassword(preset.password || 'village123');
    setError('');

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      UserAccountService.saveAccount(preset);
      UserAccountService.setActiveMobile(preset.parentMobile);
      try {
        localStorage.setItem('untangle_logged_in', 'true');
      } catch {
        // ignore
      }
      onLogin(preset);
    }, 250);
  };

  // Sign In Submit handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please enter your explorer name.');
      return;
    }
    if (!password) {
      setError('Please enter your secret word.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const authRes = UserAccountService.authenticateExplorer(trimmedUsername, password);
      if (authRes.success && authRes.account) {
        if (rememberMe) {
          try {
            localStorage.setItem('untangle_logged_in', 'true');
          } catch {
            // ignore
          }
        }
        onLogin(authRes.account);
      } else {
        setError(authRes.error || "That doesn't match — try Aarav, Kavi, Leo, or Mindy (secret word: village123)");
      }
    }, 300);
  };

  // Sign Up Submit handler
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = signUpName.trim();
    if (!cleanName) {
      setError('Please enter your child or explorer name.');
      return;
    }
    if (!signUpPassword) {
      setError('Please choose a secret word for your explorer.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const cleanUsername = cleanName.toLowerCase().replace(/\s+/g, '');
      const uniqueMobile = '987' + Math.floor(1000000 + Math.random() * 9000000);

      const newAccount: UserAccount = {
        parentMobile: uniqueMobile,
        childName: cleanName,
        username: cleanUsername,
        password: signUpPassword,
        ageGroup: signUpAgeGroup,
        avatar: signUpAvatar,
        language: signUpLanguage,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      UserAccountService.saveAccount(newAccount);
      UserAccountService.setActiveMobile(newAccount.parentMobile);

      try {
        localStorage.setItem('untangle_logged_in', 'true');
      } catch {
        // ignore
      }

      onLogin(newAccount);
    }, 350);
  };

  const handleForgotHint = () => {
    setError('Secret hint: Try one of our explorers below (e.g. Aarav, Kavi, Leo, Mindy) with secret word "village123"!');
  };

  return (
    <div
      className="relative w-full h-[100dvh] flex items-center justify-center overflow-y-auto overflow-x-hidden font-child select-none p-2 sm:p-4"
      style={{
        background:
          'linear-gradient(180deg,#5EC2E8 0%,#8FDCF2 45%,#CFF3F8 68%,#83C167 69%,#63A855 85%,#4C8F49 100%)',
      }}
    >
      {/* ── Clouds ── */}
      <Cloud
        style={{ top: '6%', left: '5%', width: 120, height: 40 }}
        blobL={{ w: 60, h: 60, top: -28, left: 14 }}
        blobR={{ w: 44, h: 44, top: -18, left: 66 }}
      />
      <Cloud
        style={{ top: '12%', right: '7%', width: 150, height: 46 }}
        blobL={{ w: 70, h: 70, top: -34, left: 18 }}
        blobR={{ w: 50, h: 50, top: -20, left: 88 }}
      />
      <Cloud
        style={{ top: '3%', left: '42%', width: 90, height: 32, opacity: 0.75 }}
        blobL={{ w: 44, h: 44, top: -20, left: 10 }}
        blobR={{ w: 34, h: 34, top: -14, left: 48 }}
      />

      {/* ── Kite (top-right, swaying animation) ── */}
      <div className="absolute top-[5%] right-[5%] w-[44px] h-[54px] sm:w-[50px] sm:h-[62px] login-kite pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 60 70" fill="none" className="w-full h-full">
          <path d="M30 2 L54 30 L30 58 L6 30 Z" fill="#F2789F" stroke="#3A2B18" strokeWidth="2.5" />
          <path d="M30 2 L30 58" stroke="#3A2B18" strokeWidth="2" />
          <path d="M6 30 L54 30" stroke="#3A2B18" strokeWidth="2" />
          <path d="M30 58 C 32 62, 28 64, 30 68" stroke="#3A2B18" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* ── Rolling hill silhouettes ── */}
      <div
        className="absolute left-[-20%] w-[140%] rounded-[50%] h-[220px] pointer-events-none"
        style={{ background: '#63A855', bottom: '-12%', opacity: 0.9 }}
        aria-hidden="true"
      />
      <div
        className="absolute left-[-20%] w-[140%] rounded-[50%] h-[170px] pointer-events-none"
        style={{ background: '#4C8F49', bottom: '-16%', opacity: 0.55 }}
        aria-hidden="true"
      />

      {/* ── Bushes ── */}
      <Bush side="left" />
      <Bush side="right" />

      {/* ── Scene: tree → ropes → card ── */}
      <main className="relative z-10 flex flex-col items-center max-w-full my-auto py-2">
        {/* Illustrated tree */}
        <div className="relative flex justify-center z-[3]" style={{ marginBottom: -16 }} aria-hidden="true">
          <svg viewBox="0 0 150 150" fill="none" className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px]">
            <ellipse cx="75" cy="128" rx="14" ry="10" fill="#5C3D24" />
            <rect x="66" y="70" width="18" height="55" rx="7" fill="#7A5335" />
            <path
              d="M66 100 C 40 100, 35 118, 45 128"
              stroke="#7A5335"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M84 100 C 110 100, 116 118, 106 128"
              stroke="#7A5335"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="75" cy="55" r="52" fill="#4E9A4A" />
            <circle cx="42" cy="70" r="30" fill="#4E9A4A" />
            <circle cx="108" cy="70" r="30" fill="#4E9A4A" />
            <circle cx="75" cy="90" r="28" fill="#579F52" />
            {/* friendly face */}
            <circle cx="60" cy="58" r="5" fill="#2E3B22" />
            <circle cx="90" cy="58" r="5" fill="#2E3B22" />
            <path d="M58 74 Q75 86 92 74" stroke="#2E3B22" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="46" cy="66" r="6" fill="#F2A6BE" opacity="0.7" />
            <circle cx="104" cy="66" r="6" fill="#F2A6BE" opacity="0.7" />
          </svg>
        </div>

        {/* Rope connectors from tree to card */}
        <div className="flex justify-between w-[140px] mx-auto z-[2]" aria-hidden="true">
          <span className="block w-[3.5px] h-[20px] rounded-sm" style={{ background: '#5C3D24' }} />
          <span className="block w-[3.5px] h-[20px] rounded-sm" style={{ background: '#5C3D24' }} />
        </div>

        {/* ── Hanging Storybook Login Card ── */}
        <div
          className="relative z-[4] w-[350px] max-w-[92vw] rounded-[24px] p-5 sm:p-6 border-4"
          style={{
            background: '#FFF7E3',
            borderColor: '#3A2B18',
            boxShadow: '0 10px 0 rgba(58,43,24,0.18), 0 18px 30px rgba(0,0,0,0.18)',
          }}
        >
          {/* Eyebrow Pill */}
          <span
            className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-[6px] text-white font-black text-[11px] tracking-[0.06em] uppercase px-3 py-[4px] rounded-full border-2 whitespace-nowrap shadow-xs"
            style={{ top: -14, background: '#F4A13C', borderColor: '#3A2B18' }}
          >
            🌿 unTangle Village
          </span>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-[#F5EACB] rounded-full p-1 border-2 border-[#3A2B18] mt-1 mb-3">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError('');
              }}
              className={`flex-1 py-1 rounded-full text-xs font-bold transition-all ${
                authMode === 'signin'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[#5C3D24] hover:text-black'
              }`}
            >
              🧭 Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError('');
              }}
              className={`flex-1 py-1 rounded-full text-xs font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[#5C3D24] hover:text-black'
              }`}
            >
              🌱 Plant Seed
            </button>
          </div>

          <h1
            className="text-[26px] sm:text-[28px] font-extrabold text-center mb-[2px] tracking-[0.01em]"
            style={{ color: '#2E3B22' }}
          >
            {authMode === 'signin' ? 'Welcome Back!' : 'New Explorer!'}
          </h1>
          <p className="text-center text-[12.5px] sm:text-[13px] font-semibold mb-4" style={{ color: '#5b6b4e' }}>
            {authMode === 'signin'
              ? 'Enter secret word to keep exploring'
              : 'Choose name & secret word to join'}
          </p>

          {error && (
            <p className="text-center text-red-700 text-[12px] font-bold mb-3 bg-red-50 rounded-xl px-3 py-2 border border-red-200 shadow-2xs">
              {error}
            </p>
          )}

          {/* ═════ TAB 1: SIGN IN (USERNAME + PASSWORD) ═════ */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} autoComplete="off" noValidate className="flex flex-col gap-3">
              {/* Explorer name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="login-username" className="font-bold text-[12px] ml-1" style={{ color: '#5C3D24' }}>
                  Explorer name
                </label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="e.g. Aarav, Kavi, Leo, Mindy"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input w-full text-[14px] font-bold px-3.5 py-2.5 rounded-full border-[2.5px] bg-white shadow-inner"
                  style={{ borderColor: '#3A2B18', color: '#2E3B22', fontFamily: 'inherit' }}
                />
              </div>

              {/* Secret word (Password) */}
              <div className="flex flex-col gap-1">
                <label htmlFor="login-password" className="font-bold text-[12px] ml-1" style={{ color: '#5C3D24' }}>
                  Secret word (Password)
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="•••••••• (e.g. village123)"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input w-full text-[14px] font-bold px-3.5 py-2.5 rounded-full border-[2.5px] bg-white shadow-inner"
                  style={{ borderColor: '#3A2B18', color: '#2E3B22', fontFamily: 'inherit' }}
                />
              </div>

              {/* Remember me + Forgot it? */}
              <div
                className="flex items-center justify-between text-[12px] font-bold"
                style={{ color: '#5C3D24' }}
              >
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#F4A13C] rounded-sm"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgotHint}
                  className="hover:underline underline-offset-2 cursor-pointer text-[11.5px]"
                  style={{ color: '#E27E1F' }}
                >
                  Forgot it?
                </button>
              </div>

              {/* Primary submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="login-btn mt-1 font-black text-[15.5px] text-white rounded-full px-4 py-3 border-[2.5px] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-[2px] hover:brightness-105 disabled:opacity-70 shadow-sm"
                style={{
                  background: 'linear-gradient(180deg,#F4A13C 0%,#E27E1F 100%)',
                  borderColor: '#3A2B18',
                  fontFamily: 'inherit',
                }}
              >
                {isSubmitting ? '⏳ Entering…' : '🧭 Enter the Village'}
              </button>

              {/* ── OLD LOGIN CREDENTIALS SECTION (Quick One-Click Test) ── */}
              <div className="mt-2 pt-2.5 border-t-2 border-[#E7D6BA]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wide" style={{ color: '#6E4E2E' }}>
                    ⚡ Old Login Credentials:
                  </span>
                  <span className="text-[9.5px] font-semibold text-[#8B6B4A]">
                    Key: <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[9px]">village123</code>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_ACCOUNTS.map((preset) => (
                    <button
                      key={preset.parentMobile}
                      type="button"
                      onClick={() => handleQuickCredentialLogin(preset)}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl border-2 bg-white hover:bg-amber-100/70 active:scale-95 transition-all text-left shadow-2xs cursor-pointer group"
                      style={{ borderColor: '#3A2B18' }}
                      title={`Sign in as ${preset.childName} (${preset.ageGroup} yrs)`}
                    >
                      <span className="text-base group-hover:scale-115 transition-transform">{preset.avatar}</span>
                      <div className="truncate">
                        <span className="text-[11px] font-black block truncate" style={{ color: '#2E3B22' }}>
                          {preset.childName}
                        </span>
                        <span className="text-[8.5px] font-bold text-[#8B6B4A] block truncate">
                          {preset.username} • {preset.language === 'ta' ? 'தமிழ்' : 'EN'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* ═════ TAB 2: SIGN UP / REGISTER NEW EXPLORER ═════ */
            <form onSubmit={handleSignUpSubmit} autoComplete="off" noValidate className="flex flex-col gap-2.5">
              {/* Explorer Name */}
              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-[11.5px] ml-1" style={{ color: '#5C3D24' }}>
                  Child / Explorer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya, Aarav, Sam"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="login-input w-full text-[13.5px] font-bold px-3 py-2 rounded-full border-[2.5px] bg-white shadow-inner"
                  style={{ borderColor: '#3A2B18', color: '#2E3B22', fontFamily: 'inherit' }}
                />
              </div>

              {/* Secret Word */}
              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-[11.5px] ml-1" style={{ color: '#5C3D24' }}>
                  Choose Secret Word (Password)
                </label>
                <input
                  type="password"
                  placeholder="e.g. village123"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="login-input w-full text-[13.5px] font-bold px-3 py-2 rounded-full border-[2.5px] bg-white shadow-inner"
                  style={{ borderColor: '#3A2B18', color: '#2E3B22', fontFamily: 'inherit' }}
                />
              </div>

              {/* Age Group Buttons */}
              <div className="flex flex-col gap-0.5">
                <label className="font-bold text-[11px] ml-1" style={{ color: '#5C3D24' }}>
                  Age Group (Personalized Content)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {(['5-8', '9-12', '13-15', '16-18'] as AgeGroup[]).map((group) => {
                    const cfg = AGE_GROUP_CONFIG[group];
                    const isSelected = signUpAgeGroup === group;
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSignUpAgeGroup(group)}
                        className={`p-1 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-300 border-[#3A2B18] shadow-xs'
                            : 'bg-white border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        <span className="text-[10px] font-black text-amber-950 block leading-tight">
                          {cfg.badgeEmoji} {cfg.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Picker & Language */}
              <div className="flex items-center justify-between gap-2 bg-[#F5EACB] p-1.5 rounded-xl border border-amber-300">
                <div className="flex gap-1 overflow-x-auto">
                  {AVATAR_OPTIONS.slice(0, 4).map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSignUpAvatar(av)}
                      className={`text-base p-0.5 rounded-lg transition-transform cursor-pointer ${
                        signUpAvatar === av ? 'scale-120 bg-amber-400' : 'opacity-70'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSignUpLanguage('ta')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      signUpLanguage === 'ta' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    தமிழ்
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpLanguage('en')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      signUpLanguage === 'en' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Primary submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="login-btn mt-1 font-black text-[15px] text-white rounded-full px-4 py-2.5 border-[2.5px] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-[2px] hover:brightness-105 disabled:opacity-70 shadow-sm"
                style={{
                  background: 'linear-gradient(180deg,#2EB872 0%,#1B8A4D 100%)',
                  borderColor: '#3A2B18',
                  fontFamily: 'inherit',
                }}
              >
                {isSubmitting ? '🌱 Planting Seed…' : '🌱 Plant Seed & Enter'}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-3 pt-2 text-center text-[12px] font-bold border-t border-[#E7D6BA]" style={{ color: '#5C3D24' }}>
            {authMode === 'signin' ? (
              <>
                New around here?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    if (onRegisterClick) onRegisterClick();
                  }}
                  className="hover:underline underline-offset-2 cursor-pointer font-black"
                  style={{ color: '#E27E1F' }}
                >
                  Plant your first seed →
                </button>
              </>
            ) : (
              <>
                Already an explorer?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="hover:underline underline-offset-2 cursor-pointer font-black"
                  style={{ color: '#E27E1F' }}
                >
                  Sign in here →
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
