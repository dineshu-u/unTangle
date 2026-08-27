import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { TopStatusBar } from './components/TopStatusBar';
import { ChildBottomNav } from './components/ChildBottomNav';
import { ParentGateModal } from './components/ParentGateModal';

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
  } = useApp();

  const [isParentGateOpen, setIsParentGateOpen] = useState(false);

  // Pure font isolation: Tamil uses Noto Sans Tamil; English uses OpenDyslexic / Lexend
  const activeFontClass =
    language === 'ta'
      ? 'font-tamil'
      : useDyslexicFont
      ? 'font-dyslexic'
      : 'font-child';

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
      className={`min-h-screen w-full bg-stone-100 flex flex-col items-center justify-start text-slate-800 ${activeFontClass}`}
    >
      {/* Responsive Web Container with @media queries for Mobile and Tablets */}
      <div className="app-container w-full min-h-screen bg-amber-50/50 flex flex-col border-amber-200/60 relative mx-auto overflow-x-hidden">
        {/* Mobile Sticky Top Status Bar */}
        <TopStatusBar onOpenParentGate={() => setIsParentGateOpen(true)} />

        {/* Main Content Body */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {renderActiveScreen()}
        </main>

        {/* Mobile Sticky Bottom Navigation (in child mode) */}
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
