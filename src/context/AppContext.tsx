import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppLanguage, ContentItem } from '../domain/models/content';
import { ChildProgressState, LessonCardRecord } from '../domain/models/progress';
import { LearningEvent, ActivityType, LearningEventOutcome } from '../domain/models/learningEvent';
import { MindyResponse, MindyEmotion } from '../domain/models/mindy';
import { PlayerLearningProfile } from '../domain/models/playerProfile';
import { contentRepository, IContentRepository } from '../domain/repositories/ContentRepository';
import { ProgressionService } from '../domain/progression/progressionService';
import { AdaptiveEngine, AdaptiveRecommendation, ParentObservationSummary } from '../domain/adaptive/adaptiveEngine';
import { ProgressStorageService, INITIAL_PROGRESS_STATE } from '../services/persistence/progressStorage';
import { PlayerProfileStorage, PRESET_PLAYERS } from '../services/persistence/playerProfileStorage';
import { LearningSummaryGenerator } from '../domain/adaptive/learningSummaryGenerator';
import { contentGenerationService } from '../services/contentGenerationService';
import { ApiKeyService } from '../services/apiKeyService';
import { mindyService } from '../services/mindy/mindyService';
import { PRE_RECORDED_VOICE_NOTES } from '../content/voiceNotes';
import { FamilyVoiceNote } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sounds } from '../utils/audio';

export type ScreenId = 
  | 'village' 
  | 'home_hub' 
  | 'mindy_house' 
  | 'letter_garden' 
  | 'word_kite' 
  | 'pulse_path' 
  | 'reading_lens' 
  | 'learning_garden' 
  | 'village_mela' 
  | 'family_voice';

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: typeof TRANSLATIONS['en'];
  appMode: 'child' | 'parent';
  setAppMode: (mode: 'child' | 'parent') => void;
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  
  // Data-Driven Content Repository
  contentRepo: IContentRepository;
  
  // Player Learning Profile
  activePlayer: PlayerLearningProfile;
  availablePlayers: PlayerLearningProfile[];
  switchPlayer: (playerId: string) => void;
  
  // Dynamic Level Content & AI
  currentLevelWords: ContentItem[];
  currentLevelNumber: number;
  isGeneratingNextLevel: boolean;
  hasGroqKey: boolean;
  refreshLevelContent: () => Promise<void>;
  completeLevelAndGenerateNext: () => Promise<void>;
  recordWordKiteAttempt: (word: string, isReal: boolean, pattern?: string) => Promise<void>;

  // Progress & State
  childProgress: ChildProgressState;
  recordLearningEvent: (eventData: {
    activityType: ActivityType;
    contentId: string;
    eventType: LearningEvent['eventType'];
    outcome: LearningEventOutcome;
    attemptCount?: number;
    responseTimeMs?: number;
    metadata?: Record<string, unknown>;
  }) => void;
  
  teachMindyWord: (word: string, meaning: string) => void;
  claimDailyQuestReward: () => void;
  
  // Mindy AI Companion Service
  requestMindySpeech: (params: {
    activityType: ActivityType;
    contentId: string;
    outcome: LearningEventOutcome;
    context?: {
      emotion?: MindyEmotion;
      childName?: string;
      word?: string;
      letter?: string;
    };
  }) => Promise<MindyResponse>;
  
  // Adaptive Learning Engine outputs
  adaptiveRecommendation: AdaptiveRecommendation;
  parentObservations: ParentObservationSummary[];
  
  // Family Voices
  voiceNotes: FamilyVoiceNote[];
  addVoiceNote: (note: FamilyVoiceNote) => void;
  deleteVoiceNote: (id: string) => void;
  
  // Accessibility & Preferences
  isQuietMode: boolean;
  setIsQuietMode: (quiet: boolean) => void;
  useDyslexicFont: boolean;
  setUseDyslexicFont: (use: boolean) => void;
  
  resetProgress: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePlayerId, setActivePlayerIdState] = useState<string>(() => {
    return PlayerProfileStorage.getActivePlayerId();
  });

  const [activePlayer, setActivePlayer] = useState<PlayerLearningProfile>(() => {
    return PlayerProfileStorage.loadProfile(activePlayerId);
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return activePlayer.language || 'ta';
  });

  const [appMode, setAppMode] = useState<'child' | 'parent'>('child');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('village');
  
  const [childProgress, setChildProgress] = useState<ChildProgressState>(() => {
    return ProgressStorageService.load();
  });

  const [currentLevelWords, setCurrentLevelWords] = useState<ContentItem[]>([]);
  const [isGeneratingNextLevel, setIsGeneratingNextLevel] = useState<boolean>(false);
  const [hasGroqKey, setHasGroqKey] = useState<boolean>(() => ApiKeyService.hasApiKey());

  const [voiceNotes, setVoiceNotes] = useState<FamilyVoiceNote[]>(() => {
    try {
      const saved = localStorage.getItem('untangle_voicenotes_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PRE_RECORDED_VOICE_NOTES;
  });

  const [isQuietMode, setIsQuietModeState] = useState<boolean>(false);
  const [useDyslexicFont, setUseDyslexicFont] = useState<boolean>(true);

  const setIsQuietMode = (quiet: boolean) => {
    setIsQuietModeState(quiet);
    sounds.setQuietMode(quiet);
  };

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
    setActivePlayer(prev => {
      const updated = { ...prev, language: newLang };
      PlayerProfileStorage.saveProfile(updated);
      return updated;
    });
  };

  const switchPlayer = (newPlayerId: string) => {
    PlayerProfileStorage.setActivePlayerId(newPlayerId);
    setActivePlayerIdState(newPlayerId);
    const profile = PlayerProfileStorage.loadProfile(newPlayerId);
    setActivePlayer(profile);
    setLanguageState(profile.language);
  };

  // Load level content dynamically for active player and level
  const loadLevelContent = useCallback(async (player: PlayerLearningProfile, lang: AppLanguage) => {
    setIsGeneratingNextLevel(true);
    setHasGroqKey(ApiKeyService.hasApiKey());

    try {
      const summary = LearningSummaryGenerator.createSummary(player);
      const constraints = LearningSummaryGenerator.deriveConstraints(player);
      constraints.language = lang;

      const result = await contentGenerationService.getLevelContent(
        player.playerId,
        player.currentLevel,
        summary,
        constraints
      );

      setCurrentLevelWords(result.words);
    } catch {
      const fallback = contentRepository.getRealWords(lang);
      setCurrentLevelWords(fallback);
    } finally {
      setIsGeneratingNextLevel(false);
    }
  }, []);

  useEffect(() => {
    loadLevelContent(activePlayer, language);
  }, [activePlayer.playerId, activePlayer.currentLevel, language, loadLevelContent]);

  useEffect(() => {
    ProgressStorageService.save(childProgress);
  }, [childProgress]);

  useEffect(() => {
    try {
      localStorage.setItem('untangle_voicenotes_v3', JSON.stringify(voiceNotes));
    } catch {
      // ignore
    }
  }, [voiceNotes]);

  const refreshLevelContent = async () => {
    setHasGroqKey(ApiKeyService.hasApiKey());
    await loadLevelContent(activePlayer, language);
  };

  const recordLearningEvent = (eventData: {
    activityType: ActivityType;
    contentId: string;
    eventType: LearningEvent['eventType'];
    outcome: LearningEventOutcome;
    attemptCount?: number;
    responseTimeMs?: number;
    metadata?: Record<string, unknown>;
  }) => {
    const newEvent: LearningEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      childId: childProgress.childId,
      playerId: activePlayer.playerId,
      levelId: activePlayer.currentLevel,
      activityType: eventData.activityType,
      eventType: eventData.eventType,
      contentId: eventData.contentId,
      timestamp: new Date().toISOString(),
      outcome: eventData.outcome,
      attemptCount: eventData.attemptCount || 1,
      responseTimeMs: eventData.responseTimeMs,
      language,
      metadata: eventData.metadata,
    };

    setChildProgress(prev => ProgressionService.applyLearningEvent(prev, newEvent));
  };

  const recordWordKiteAttempt = async (word: string, isReal: boolean, pattern?: string) => {
    const updatedProfile = PlayerProfileStorage.updateProfileOnWordResult(
      activePlayer,
      word,
      isReal,
      pattern
    );
    setActivePlayer(updatedProfile);

    recordLearningEvent({
      activityType: 'word_kite',
      contentId: word,
      eventType: isReal ? 'word_correct' : 'word_incorrect',
      outcome: isReal ? 'success' : 'retry',
      metadata: { pattern },
    });
  };

  const completeLevelAndGenerateNext = async () => {
    const nextLevel = activePlayer.currentLevel + 1;
    const updatedProfile: PlayerLearningProfile = {
      ...activePlayer,
      currentLevel: nextLevel,
      lastUpdated: new Date().toISOString(),
    };

    PlayerProfileStorage.saveProfile(updatedProfile);
    setActivePlayer(updatedProfile);

    recordLearningEvent({
      activityType: 'word_kite',
      contentId: `level_${activePlayer.currentLevel}_completed`,
      eventType: 'level_completed',
      outcome: 'success',
      metadata: { completedLevel: activePlayer.currentLevel, nextLevel },
    });

    await loadLevelContent(updatedProfile, language);
  };

  const teachMindyWord = (word: string, meaning: string) => {
    const newCard: LessonCardRecord = {
      id: 'lc_' + Date.now(),
      word,
      meaning,
      dateEarned: language === 'ta' ? 'இன்று' : 'Today',
      language,
    };

    recordLearningEvent({
      activityType: 'teach_mindy',
      contentId: word,
      eventType: 'mindy_taught',
      outcome: 'success',
    });

    setChildProgress(prev => ({
      ...prev,
      wordsTaughtCount: prev.wordsTaughtCount + 1,
      lessonCards: [newCard, ...prev.lessonCards],
    }));
  };

  const claimDailyQuestReward = () => {
    setChildProgress(prev => ({
      ...prev,
      stormProgress: Math.min(100, prev.stormProgress + 15),
      streakDays: prev.streakDays + 1,
    }));
  };

  const requestMindySpeech = async (params: {
    activityType: ActivityType;
    contentId: string;
    outcome: LearningEventOutcome;
    context?: {
      emotion?: MindyEmotion;
      childName?: string;
      word?: string;
      letter?: string;
    };
  }): Promise<MindyResponse> => {
    return mindyService.getCompanionResponse({
      language,
      activityType: params.activityType,
      contentId: params.contentId,
      outcome: params.outcome,
      context: {
        childName: activePlayer.playerName,
        ...params.context,
      },
    });
  };

  const addVoiceNote = (note: FamilyVoiceNote) => {
    setVoiceNotes(prev => [note, ...prev]);
  };

  const deleteVoiceNote = (id: string) => {
    setVoiceNotes(prev => prev.filter(n => n.id !== id));
  };

  const resetProgress = () => {
    ProgressStorageService.reset();
    setChildProgress(INITIAL_PROGRESS_STATE);
  };

  const adaptiveRecommendation = AdaptiveEngine.recommendNextActivity(childProgress, language);
  const parentObservations = AdaptiveEngine.deriveParentObservations(childProgress);

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        appMode,
        setAppMode,
        currentScreen,
        setCurrentScreen,
        contentRepo: contentRepository,
        activePlayer,
        availablePlayers: PRESET_PLAYERS,
        switchPlayer,
        currentLevelWords,
        currentLevelNumber: activePlayer.currentLevel,
        isGeneratingNextLevel,
        hasGroqKey,
        refreshLevelContent,
        completeLevelAndGenerateNext,
        recordWordKiteAttempt,
        childProgress,
        recordLearningEvent,
        teachMindyWord,
        claimDailyQuestReward,
        requestMindySpeech,
        adaptiveRecommendation,
        parentObservations,
        voiceNotes,
        addVoiceNote,
        deleteVoiceNote,
        isQuietMode,
        setIsQuietMode,
        useDyslexicFont,
        setUseDyslexicFont,
        resetProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
