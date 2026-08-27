import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { TopStatusBar } from './components/TopStatusBar';
import { ChildBottomNav } from './components/ChildBottomNav';
import { ParentGateModal } from './components/ParentGateModal';
import { LoginView } from './features/parent/LoginView';

// Feature Views
import { VillageHomeView } from './features/child/VillageHomeView';
import { MindyHouseView } from './features/child/MindyHouseView';
import { LetterGardenView } from './features/child/LetterGardenView';
import { WordKiteView } from './features/child/WordKiteView';
import { PulsePathView } from './features/child/PulsePathView';
import { ReadingLensView } from './features/child/ReadingLensView';
import { LearningGardenView } from './features/child/LearningGardenView';
import { VillageMelaView } from './features/child/VillageMelaView';
import { FamilyVoiceView } from './features/child/FamilyVoiceView';
import { ParentDashboardView } from './features/parent/ParentDashboardView';

export const App: React.FC = () => {
  const {
    language,
    appMode,
    setAppMode,
    currentScreen,
    useDyslexicFont,
    isLoggedIn,
    signInUser,
  } = useApp();

  const [isParentGateOpen, setIsParentGateOpen] = useState(false);

  // App shows login page FIRST on initial launch
  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={(account) => {
          signInUser(account);
        }}
      />
    );
  }

  // Pure font isolation:
  // Default: useDyslexicFont is true
  //   - Tamil mode uses 'font-tamil-dyslexic' (UntangleTamil from assets, NO Noto Sans Tamil)
  //   - English mode uses 'font-dyslexic' (OpenDyslexic)
  // When explicitly turned off by parents in settings:
  //   - Tamil mode uses 'font-tamil-standard' (Noto Sans Tamil)
  //   - English mode uses 'font-child'
  const activeFontClass =
    language === 'ta'
      ? (useDyslexicFont ? 'font-tamil-dyslexic' : 'font-tamil-standard')
      : (useDyslexicFont ? 'font-dyslexic' : 'font-child');

  const renderActiveScreen = () => {
    if (appMode === 'parent') {
      return <ParentDashboardView />;
    }

    switch (currentScreen) {
      case 'village':
      case 'home_hub':
        return <VillageHomeView />;
      case 'mindy_house':
        return <MindyHouseView />;
      case 'letter_garden':
        return <LetterGardenView />;
      case 'word_kite':
        return <WordKiteView />;
      case 'pulse_path':
        return <PulsePathView />;
      case 'reading_lens':
        return <ReadingLensView />;
      case 'learning_garden':
        return <LearningGardenView />;
      case 'village_mela':
        return <VillageMelaView />;
      case 'family_voice':
        return <FamilyVoiceView />;
      default:
        return <VillageHomeView />;
    }
  };

  return (
    <div
      className={`h-screen h-[100dvh] w-full bg-stone-100 flex flex-col items-center justify-start text-slate-800 overflow-hidden select-none ${activeFontClass}`}
    >
      {/* Responsive Web Container with @media queries for Mobile and Tablets */}
      <div className="app-container w-full h-full h-[100dvh] max-h-[100dvh] bg-amber-50/50 flex flex-col border-amber-200/60 relative mx-auto overflow-hidden">
        {/* Mobile Fixed Top Status Bar */}
        <TopStatusBar onOpenParentGate={() => setIsParentGateOpen(true)} />

        {/* Main Content Body: Takes remaining viewport space, scrolls internally if needed */}
        <main className="flex-1 min-h-0 w-full flex flex-col overflow-y-auto overflow-x-hidden">
          {renderActiveScreen()}
        </main>

        {/* Mobile Fixed Bottom Navigation (in child mode): Pinned at bottom, always 100% visible! */}
        {appMode === 'child' && <ChildBottomNav />}
      </div>

      {/* Parent Verification Gate Modal */}
      <ParentGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSuccess={() => {
          setAppMode('parent');
        }}
      />
    </div>
  );
};
