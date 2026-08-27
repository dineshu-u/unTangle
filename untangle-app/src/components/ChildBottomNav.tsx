import React from 'react';
import { useApp, ScreenId } from '../context/AppContext';
import { Home, Sparkles, BookOpen, Music } from 'lucide-react';
import { sounds } from '../utils/audio';

export const ChildBottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, language } = useApp();

  const navItems: { id: ScreenId; labelEn: string; labelTa: string; icon: React.ReactNode }[] = [
    {
      id: 'village',
      labelEn: 'Village',
      labelTa: 'கிராமம்',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'letter_garden',
      labelEn: 'Letters',
      labelTa: 'எழுத்துக்கள்',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'word_kite',
      labelEn: 'Kite',
      labelTa: 'காற்றாடி',
      icon: <span className="text-xl leading-none">🪁</span>,
    },
    {
      id: 'pulse_path',
      labelEn: 'Drums',
      labelTa: 'மத்தளம்',
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: 'reading_lens',
      labelEn: 'Stories',
      labelTa: 'கதைகள்',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  const handleNav = (id: ScreenId) => {
    sounds.playTap();
    sounds.triggerHaptic(20);
    setCurrentScreen(id);
  };

  return (
    <nav className="shrink-0 w-full bg-white/95 backdrop-blur-md border-t border-amber-200/80 px-2 pt-1 pb-[max(0.375rem,env(safe-area-inset-bottom))] z-30 shadow-lg select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const label = language === 'ta' ? item.labelTa : item.labelEn;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-amber-100/90 font-bold -translate-y-0.5 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'text-amber-950 font-black' : 'text-slate-600 font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
