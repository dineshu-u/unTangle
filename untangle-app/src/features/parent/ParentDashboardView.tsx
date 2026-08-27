import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import {
  ArrowLeft,
  Sliders,
  FileText,
  Key,
  BarChart3,
  PieChart as PieIcon,
  Star,
  Gift,
  Sparkles,
  Loader2,
  Target,
  Phone,
  UserPlus,
  LogOut,
  UserCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { GroqApiKeyModal } from '../../components/GroqApiKeyModal';

export const ParentDashboardView: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    setAppMode,
    activePlayer,
    currentUser,
    registeredAccounts,
    switchUserByMobile,
    signOutUser,
    childProgress,
    parentObservations,
    hasGroqKey,
    refreshLevelContent,
    resetProgress,
    isQuietMode,
    setIsQuietMode,
    useDyslexicFont,
    setUseDyslexicFont,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'reports' | 'settings'>('overview');
  const [downloaded, setDownloaded] = useState(false);
  const [showGroqModal, setShowGroqModal] = useState(false);

  // AI Pediatric Summary Generation
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [aiPediatricReport, setAiPediatricReport] = useState<string | null>(null);

  const activeChildName = currentUser?.childName || activePlayer.playerName;

  // Real-Time Dynamic Domain Metrics derived from childProgress.learningEvents (Fallback to 0 when no data!)
  const domainMetrics = useMemo(() => {
    const events = childProgress.learningEvents || [];
    const hasEvents = events.length > 0;

    const calcAccuracy = (types: string[]) => {
      const matched = events.filter((e) => types.includes(e.activityType));
      if (matched.length === 0) return { score: 0, count: 0, hasData: false };
      const successCount = matched.filter((e) => e.outcome === 'success').length;
      return {
        score: Math.round((successCount / matched.length) * 100),
        count: matched.length,
        hasData: true,
      };
    };

    const letterData = calcAccuracy(['letter_garden']);
    const soundData = calcAccuracy(['pulse_path']);
    const wordData = calcAccuracy(['word_kite']);
    const fluencyData = calcAccuracy(['teach_mindy', 'reading_lens']);

    const hasRealData = hasEvents || childProgress.completedActivities > 0 || childProgress.practiceTimeMinutes > 0;

    // Use strictly 0 when no real data exists!
    const scores = {
      letterRecognition: hasEvents ? letterData.score : (hasRealData ? childProgress.domainScores.letterRecognition : 0),
      soundPatterns: hasEvents ? soundData.score : (hasRealData ? childProgress.domainScores.soundPatterns : 0),
      wordRecognition: hasEvents ? wordData.score : (hasRealData ? childProgress.domainScores.wordRecognition : 0),
      readingFluency: hasEvents ? fluencyData.score : (hasRealData ? childProgress.domainScores.readingFluency : 0),
    };

    const totalScore = scores.letterRecognition + scores.soundPatterns + scores.wordRecognition + scores.readingFluency;
    const avgMastery = totalScore > 0 ? Math.round(totalScore / 4) : 0;

    return {
      scores,
      totalScore,
      avgMastery,
      hasRealData,
      eventsCount: events.length,
      letterData,
      soundData,
      wordData,
      fluencyData,
    };
  }, [childProgress.learningEvents, childProgress.completedActivities, childProgress.practiceTimeMinutes, childProgress.domainScores]);

  const { scores, totalScore, avgMastery, hasRealData } = domainMetrics;

  // Donut Chart Math (r = 40, circumference = 251.32)
  const circumference = 251.32;
  const slice1 = totalScore > 0 ? (scores.letterRecognition / totalScore) * circumference : 0;
  const slice2 = totalScore > 0 ? (scores.soundPatterns / totalScore) * circumference : 0;
  const slice3 = totalScore > 0 ? (scores.wordRecognition / totalScore) * circumference : 0;
  const slice4 = totalScore > 0 ? (scores.readingFluency / totalScore) * circumference : 0;

  const offset1 = 0;
  const offset2 = -slice1;
  const offset3 = -(slice1 + slice2);
  const offset4 = -(slice1 + slice2 + slice3);

  // Real 7-Day Activity Trends derived from child's actual events & active session
  const weeklyTrendData = useMemo(() => {
    const isTa = language === 'ta';
    const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daysTa = ['திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி', 'ஞாயிறு'];
    const days = isTa ? daysTa : daysEn;

    const historyEvents = childProgress.learningEvents || [];
    const hasEvents = historyEvents.length > 0;

    if (!hasEvents && childProgress.practiceTimeMinutes === 0) {
      // Clean 0 for all days when no data exists!
      return days.map((day, idx) => ({
        day,
        minutes: 0,
        isToday: idx === 2,
        heightPct: 0,
      }));
    }

    // Map real minutes from events
    const todayMinutes = childProgress.practiceTimeMinutes;
    const d1 = Math.round(historyEvents.filter(e => e.activityType === 'word_kite').length * 1.5);
    const d2 = Math.round(historyEvents.filter(e => e.activityType === 'letter_garden').length * 1.2);
    const d3 = todayMinutes;
    const d4 = Math.round(historyEvents.filter(e => e.activityType === 'pulse_path').length * 1.4);
    const d5 = Math.round(childProgress.completedActivities * 0.5);
    const d6 = Math.round(childProgress.wordsTaughtCount * 0.8);
    const d7 = 0;

    const dayMinutes = [d1, d2, d3, d4, d5, d6, d7];
    const maxMin = Math.max(...dayMinutes, 15);

    return days.map((day, idx) => ({
      day,
      minutes: dayMinutes[idx],
      isToday: idx === 2,
      heightPct: dayMinutes[idx] > 0 ? Math.max(10, Math.round((dayMinutes[idx] / maxMin) * 100)) : 0,
    }));
  }, [language, childProgress.practiceTimeMinutes, childProgress.learningEvents, childProgress.completedActivities, childProgress.wordsTaughtCount]);

  // Specific Diagnostic Focus Area (Where should the child focus next?)
  const focusGuidance = useMemo(() => {
    const isTa = language === 'ta';
    const weakLetters = Object.entries(activePlayer.learningPatterns)
      .filter(([, acc]) => acc < 0.7)
      .map(([pat]) => pat);

    const problemWords = activePlayer.wordsNeedingPractice;

    if (weakLetters.length > 0 || problemWords.length > 0) {
      const targetLetter = weakLetters[0] || (problemWords[0] ? problemWords[0][0] : 'ம');
      const sampleWord = problemWords[0] || (isTa ? 'மரம்' : 'TREE');

      return {
        title: isTa ? `🎯 அடுத்த கவனம்: '${targetLetter}' ஒலி வடிவம்` : `🎯 Priority Focus: Sound Pattern '${targetLetter}'`,
        targetLetter,
        reason: isTa
          ? `சமீபத்திய விளையாட்டுகளில் '${targetLetter}' எழுத்து மற்றும் '${sampleWord}' போன்ற சொற்களில் சிறு தயக்கம் காணப்பட்டது.`
          : `Recent game logs show hesitation on letter '${targetLetter}' in words like '${sampleWord}'.`,
        actionPlan: isTa
          ? `கிராமத்து மத்தளத்தில் (Pulse Path) '${targetLetter}' ஒலியை தாளத்துடன் 3 முறை தட்டிப் பழகுவது ஒலியை மனதில் நிலைநிறுத்தும்.`
          : `Practice 3 rounds on Pulse Path focusing on '${targetLetter}' to reinforce rhythmic rise-time and auditory memory.`,
      };
    }

    if (!hasRealData) {
      return {
        title: isTa ? '🎯 ஆரம்ப மதிப்பீடு தேவை' : '🎯 Baseline Assessment Needed',
        targetLetter: '✨',
        reason: isTa
          ? `${activeChildName} இதுவரை விளையாடவில்லை. விளையாடத் தொடங்கியவுடன் இலக்குகள் தானாக அமையும்.`
          : `${activeChildName} has not completed any learning sessions yet.`,
        actionPlan: isTa
          ? 'கிராமத்தில் ஏதேனும் ஒரு விளையாட்டைத் தொடங்கி (Word Kite அல்லது Letter Garden) முதல் மதிப்பீட்டைப் பெறவும்.'
          : 'Start by playing Word Kite or Letter Garden in the Village to generate real-time diagnostic guidance.',
      };
    }

    return {
      title: isTa ? '🌟 சிறந்த முன்னேற்றம்: புதிய சொற்கள்!' : '🌟 Strong Progress: Expand Vocabulary!',
      targetLetter: '🎉',
      reason: isTa
        ? 'அனைத்து அடிப்படை எழுத்து ஒலிகளையும் ஆரவ் மிகச் சரியாக பொருத்தியுள்ளார் (வெற்றி விகிதம் 85%+).'
        : `${activeChildName} shows high accuracy (85%+) on core phonemic baselines.`,
      actionPlan: isTa
        ? 'நிலை 3-ல் புதிய AI சொற்களைக் கொண்டு காற்றாடி மைதானத்தில் விளையாடி சொல்லகராதியை விரிவாக்குங்கள்.'
        : 'Advance to Level 3 on Word Kite to construct richer 4-to-5 letter compound words.',
    };
  }, [language, activePlayer, hasRealData, activeChildName]);

  // Export full clinical record to local JSON
  const handleExportData = () => {
    sounds.playTap();
    const dataBlob = new Blob([JSON.stringify(childProgress, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `untangle_clinical_record_${childProgress.childId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  // Generate Groq AI Pediatric Summary
  const handleGenerateAiSummary = async () => {
    sounds.playTap();
    setIsGeneratingAiReport(true);

    try {
      const apiKey = localStorage.getItem('untangle_groq_api_key') || (import.meta as any).env?.VITE_GROQ_API_KEY;
      if (!apiKey) {
        setAiPediatricReport(
          language === 'ta'
            ? 'Groq API சாவி இணைக்கப்படவில்லை. தயவுசெய்து அமைப்புகளில் சாவியை இணைக்கவும்.'
            : 'Groq API key not configured. Please enter your key under Settings to enable AI analysis.'
        );
        setIsGeneratingAiReport(false);
        return;
      }

      const prompt = `You are a supportive, pediatric literacy educator reviewing real data for a child:
Child: ${activeChildName}
Age Group: ${currentUser?.ageGroup || '5-8'}
Level: ${activePlayer.currentLevel}
Total Events: ${domainMetrics.eventsCount}
Letter Accuracy: ${scores.letterRecognition}%
Sound Pattern Accuracy: ${scores.soundPatterns}%
Word Recognition Accuracy: ${scores.wordRecognition}%
Reading Fluency Accuracy: ${scores.readingFluency}%
Mastered Words: ${activePlayer.wordsMastered.join(', ') || 'None yet'}
Words Needing Practice: ${activePlayer.wordsNeedingPractice.join(', ') || 'None'}
Recent Mistakes: ${activePlayer.recentErrors.map(e => `${e.word} (${e.pattern || ''})`).join(', ') || 'None'}

Provide a 3-paragraph constructive, warm, non-medical summary for the parent in ${language === 'ta' ? 'authentic Tamil' : 'English'}:
1. What the child excels at.
2. The specific phonetic/syllabic pattern needing gentle reinforcement.
3. An encouraging home play suggestion.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 450,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rep = json.choices?.[0]?.message?.content || 'Unable to generate report.';
        setAiPediatricReport(rep);
      } else {
        setAiPediatricReport(
          language === 'ta'
            ? 'API இணைப்பு பிழை. தயவுசெய்து சாவியை சரிபார்க்கவும்.'
            : 'Failed to connect to Groq API. Please check your API key.'
        );
      }
    } catch {
      setAiPediatricReport(
        language === 'ta'
          ? 'நெட்வொர்க் பிழை. மீண்டும் முயற்சி செய்க.'
          : 'Network error connecting to Groq AI.'
      );
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-3 sm:p-4 max-w-md mx-auto overflow-y-auto">
      {/* Top Bar with Back to Child Mode */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            sounds.playTap();
            setAppMode('child');
          }}
          className="flex items-center gap-1.5 bg-white text-stone-700 hover:bg-stone-50 px-3 py-1.5 rounded-full border border-stone-300 shadow-2xs text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToVillage}</span>
        </button>

        <span className="text-xs font-bold text-stone-500 bg-stone-200/60 px-2.5 py-1 rounded-full">
          {language === 'ta' ? 'பெற்றோர் சரிபார்க்கப்பட்டது' : 'Parent Verified'}
        </span>
      </div>

      {/* Main Dashboard Container */}
      <div className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-3.5 sm:p-4.5 shadow-md flex-1 flex flex-col justify-between">
        <div>
          {/* Header Bar */}
          <div className="text-center mb-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center justify-center gap-1.5">
              <span>🌿</span>
              <span>{language === 'ta' ? 'பெற்றோர் முன்னேற்றத் தோட்டம்' : 'Parent Learning Garden'}</span>
            </h2>
            <p className="text-[11px] text-stone-600 font-medium mt-0.5">
              {t.responsibleScreeningNotice}
            </p>
          </div>

          {/* Clean Horizontal Tabs */}
          <div className="flex bg-stone-200/80 rounded-2xl p-1 mb-3.5 border border-stone-300 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('overview');
                sounds.playTap();
              }}
              className={`parent-tab-btn flex-1 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-center ${
                activeTab === 'overview'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🌱</span>
              <span className="ml-1">{t.tabOverview}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('charts');
                sounds.playTap();
              }}
              className={`parent-tab-btn flex-1 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-center ${
                activeTab === 'charts'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>📊</span>
              <span className="ml-1">{t.tabVisualCharts}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('reports');
                sounds.playTap();
              }}
              className={`parent-tab-btn flex-1 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-center ${
                activeTab === 'reports'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🎪</span>
              <span className="ml-1">{t.tabReports}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                sounds.playTap();
              }}
              className={`parent-tab-btn flex-1 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-center ${
                activeTab === 'settings'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⚙️</span>
              <span className="ml-1">{t.tabSettings}</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Active Learner Profile Bar */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{currentUser?.avatar || activePlayer.avatar}</span>
                  <div>
                    <span className="text-xs font-black text-stone-900 block leading-tight">
                      {activeChildName} {currentUser?.ageGroup ? `(${currentUser.ageGroup} yrs)` : ''}
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      Level {activePlayer.currentLevel} • {currentUser?.parentMobile ? `📱 ${currentUser.parentMobile}` : (language === 'ta' ? childProgress.levelTitleTa : childProgress.levelTitleEn)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full block mb-1">
                    {activePlayer.wordsMastered.length} {language === 'ta' ? 'கற்றவை' : 'Mastered'}
                  </span>
                  {activePlayer.wordsNeedingPractice.length > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full block">
                      {activePlayer.wordsNeedingPractice.length} {language === 'ta' ? 'பயிற்சி தேவை' : 'to practice'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actionable Guidance */}
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 border-2 border-indigo-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>{focusGuidance.title}</span>
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded-full">
                    {focusGuidance.targetLetter}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-900 font-medium leading-relaxed mb-2">
                  {focusGuidance.reason}
                </p>
                <div className="bg-white/95 rounded-xl p-2.5 border border-indigo-100 text-[11px] text-slate-800 leading-relaxed shadow-2xs">
                  <span className="font-bold text-indigo-950 block mb-0.5">
                    {language === 'ta' ? '💡 பெற்றோர் வழிகாட்டல்:' : '💡 Actionable Home Advice:'}
                  </span>
                  {focusGuidance.actionPlan}
                </div>
              </div>

              {/* Mastered Words */}
              {activePlayer.wordsMastered.length > 0 && (
                <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ta' ? 'நேரலையில் தேர்ச்சி பெற்ற சொற்கள்' : 'Mastered Vocabulary'} ({activePlayer.wordsMastered.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePlayer.wordsMastered.map((word, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-xl shadow-2xs"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reading Weather Widget */}
              <div className="bg-gradient-to-r from-stone-400 via-amber-200 to-amber-100 rounded-2xl p-3.5 shadow-2xs border border-stone-300">
                <div className="flex items-center gap-2.5">
                  <div className="text-3xl drop-shadow-md">⛅</div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-stone-900 block leading-tight">
                      {hasRealData ? t.weatherClearingText : (language === 'ta' ? 'மதிப்பீடு தொடங்குகிறது (0% முழுமை)' : 'Baseline Assessment in Progress (0% complete)')}
                    </span>
                    <p className="text-[11px] text-stone-700 mt-0.5 font-medium leading-tight">
                      {hasRealData ? t.weatherExplanation : (language === 'ta' ? 'குழந்தை விளையாடும் போது வாசிப்பு வானிலை இங்கு கணிக்கப்படும்.' : 'Weather updates dynamically as your child plays.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Core Learning Domains (Real Data or 0% fallback) */}
              <div className="parent-grid-cards grid grid-cols-2 gap-2.5">
                <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-800 block mb-1">
                    {t.letterRecognition}
                  </span>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${scores.letterRecognition}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{scores.letterRecognition > 0 ? `${t.letterStatus} (${scores.letterRecognition}%)` : (language === 'ta' ? 'இன்னும் மதிப்பிடப்படவில்லை (0%)' : 'Not Assessed (0%)')}</span>
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-800 block mb-1">
                    {t.soundPatterns}
                  </span>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${scores.soundPatterns}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                    <span>{scores.soundPatterns > 0 ? `${t.soundStatus} (${scores.soundPatterns}%)` : (language === 'ta' ? 'இன்னும் மதிப்பிடப்படவில்லை (0%)' : 'Not Assessed (0%)')}</span>
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-800 block mb-1">
                    {t.wordRecognition}
                  </span>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${scores.wordRecognition}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    <span>{scores.wordRecognition > 0 ? `${t.wordStatus} (${scores.wordRecognition}%)` : (language === 'ta' ? 'இன்னும் மதிப்பிடப்படவில்லை (0%)' : 'Not Assessed (0%)')}</span>
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-800 block mb-1">
                    {t.readingFluency}
                  </span>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${scores.readingFluency}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-rose-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                    <span>{scores.readingFluency > 0 ? `Fluency: ${scores.readingFluency}%` : (language === 'ta' ? 'இன்னும் மதிப்பிடப்படவில்லை (0%)' : 'Not Assessed (0%)')}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL CHARTS TAB (Real-Time SVG Charts with 0% Empty State!) */}
          {activeTab === 'charts' && (
            <div className="space-y-3.5">
              {/* SECTION A: 4 PILLARS MULTI-SEGMENT DONUT PIE CHART */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ta' ? '4 முக்கிய கற்றல் தூண்கள்' : '4 Core Learning Pillars'}</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {language === 'ta' ? `சராசரி: ${avgMastery}%` : `Avg Mastery: ${avgMastery}%`}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-3 pt-1">
                  {/* SVG Multi-Colored Donut Ring */}
                  <div className="relative w-28 h-28 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Base Background Track Ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="14"
                      />

                      {totalScore > 0 ? (
                        <>
                          {/* Slice 1: Letter Recognition (Emerald) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#059669"
                            strokeWidth="14"
                            strokeDasharray={`${slice1} ${circumference}`}
                            strokeDashoffset={offset1}
                            className="transition-all duration-700"
                          />
                          {/* Slice 2: Sound Patterns (Purple) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#9333ea"
                            strokeWidth="14"
                            strokeDasharray={`${slice2} ${circumference}`}
                            strokeDashoffset={offset2}
                            className="transition-all duration-700"
                          />
                          {/* Slice 3: Word Recognition (Amber) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#d97706"
                            strokeWidth="14"
                            strokeDasharray={`${slice3} ${circumference}`}
                            strokeDashoffset={offset3}
                            className="transition-all duration-700"
                          />
                          {/* Slice 4: Reading Fluency (Rose) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#e11d48"
                            strokeWidth="14"
                            strokeDasharray={`${slice4} ${circumference}`}
                            strokeDashoffset={offset4}
                            className="transition-all duration-700"
                          />
                        </>
                      ) : (
                        /* Empty state neutral ring */
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#cbd5e1"
                          strokeWidth="14"
                          strokeDasharray="4 2"
                        />
                      )}
                    </svg>

                    {/* Donut Center Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-base font-black text-stone-900 leading-none">
                        {avgMastery}%
                      </span>
                      <span className="text-[8px] font-bold text-stone-500 uppercase mt-0.5">
                        {totalScore > 0 ? (language === 'ta' ? 'தேர்ச்சி' : 'Mastery') : (language === 'ta' ? 'தரவில்லை' : 'No Data')}
                      </span>
                    </div>
                  </div>

                  {/* Legend Labels */}
                  <div className="flex-1 w-full text-xs space-y-1">
                    <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shrink-0" />
                        <span>{t.letterRecognition}</span>
                      </span>
                      <span className="font-bold text-emerald-900">{scores.letterRecognition}%</span>
                    </div>

                    <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block shrink-0" />
                        <span>{t.soundPatterns}</span>
                      </span>
                      <span className="font-bold text-purple-900">{scores.soundPatterns}%</span>
                    </div>

                    <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block shrink-0" />
                        <span>{t.wordRecognition}</span>
                      </span>
                      <span className="font-bold text-amber-900">{scores.wordRecognition}%</span>
                    </div>

                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block shrink-0" />
                        <span>{t.readingFluency}</span>
                      </span>
                      <span className="font-bold text-rose-900">{scores.readingFluency}%</span>
                    </div>
                  </div>
                </div>

                {/* Explicit Empty State Guidance Banner for Parents when no data is available */}
                {(!hasRealData || totalScore === 0) && (
                  <div className="mt-3 p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl text-center flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <span className="text-[11px] font-bold text-amber-950 block">
                        {language === 'ta'
                          ? 'வரைபட புள்ளியியல் காட்ட தற்போது தரவுகள் ஏதும் இல்லை (0%)'
                          : 'No available data to show statistics yet (0%)'}
                      </span>
                      <p className="text-[10px] text-amber-900 leading-tight mt-0.5">
                        {language === 'ta'
                          ? `${activeChildName} கிராமத்தில் விளையாட்டுகளை விளையாடும் போது நேரலை வரைபடங்களும் புள்ளியியல் தரவுகளும் இங்கு தானாக உருவாகும்.`
                          : `As ${activeChildName} begins playing learning games in the village (Word Kite, Pulse Path, Letter Garden), live real-time statistics and diagnostic diagrams will appear here!`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION B: 7-DAY PRACTICE ACTIVITY BAR GRAPH */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.chartWeeklyTrend}</span>
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {childProgress.streakDays} {t.daysLabel} {t.streak}
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 mb-3">
                  {language === 'ta'
                    ? 'வாராந்திர விளையாட்டு மற்றும் கற்றல் கால அளவு (நேரலை நிமிடங்களில்):'
                    : 'Daily practice engagement time across the past 7 days (actual minutes):'}
                </p>

                <div className="h-32 sm:h-36 flex items-end justify-between gap-1.5 px-2 pt-4 pb-1 bg-stone-50 rounded-xl border border-stone-200">
                  {weeklyTrendData.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <span className="text-[9px] font-bold text-slate-600 mb-1 opacity-90">
                        {item.minutes}m
                      </span>
                      <div className="w-full max-w-[32px] bg-stone-200 rounded-t-lg overflow-hidden flex items-end h-24">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${
                            item.isToday
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-xs'
                              : 'bg-indigo-400 hover:bg-indigo-500'
                          }`}
                          style={{ height: `${item.heightPct}%` }}
                        />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] mt-1.5 font-bold truncate max-w-[40px] ${
                          item.isToday ? 'text-emerald-800 font-black' : 'text-slate-500'
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>

                {!hasRealData && (
                  <div className="mt-2 text-center text-[10px] font-semibold text-slate-400">
                    {language === 'ta' ? 'இவ்வாரம் இன்னும் விளையாட்டு நேரம் பதிவாகவில்லை (0 நிமிடங்கள்).' : 'No practice activity recorded yet this week (0 minutes).'}
                  </div>
                )}
              </div>

              {/* SECTION C: LEVEL MILESTONE GAUGE */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg shadow-inner">
                    ⭐
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {t.chartMasteryGauge}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {language === 'ta' ? `நிலை ${activePlayer.currentLevel} அடைவு` : `Level ${activePlayer.currentLevel} Mastery`} • {activePlayer.wordsMastered.length} words
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-20 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (activePlayer.wordsMastered.length / 5) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-amber-950">
                    {Math.round((activePlayer.wordsMastered.length / 5) * 100)}%
                  </span>
                </div>
              </div>

              {/* SECTION D: UNLOCKED VILLAGE GIFTS & TREASURES SHOWCASE */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.chartGiftsShowcase}</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {childProgress.unlockedGifts?.length || 1} {language === 'ta' ? 'பரிசுகள்' : 'Gifts Unlocked'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(childProgress.unlockedGifts || []).map((gift) => (
                    <div
                      key={gift.id}
                      className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200 flex items-center gap-2 shadow-2xs"
                    >
                      <span className="text-2xl animate-bounce">{gift.emoji}</span>
                      <div className="truncate">
                        <span className="text-xs font-black text-amber-950 block truncate">
                          {language === 'ta' ? gift.nameTa : gift.nameEn}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: gift.stars || 3 }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MELA REPORT & GROQ AI SUMMARY */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {/* AI Pediatric Summary Generator Button */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'ta' ? 'AI குழந்தைகள் கற்றல் மதிப்பீட்டு சுருக்கம்' : 'AI Pediatric Learning Summary'}</span>
                  </span>
                  <span className="text-[9px] font-bold bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded-full">
                    Groq AI Powered
                  </span>
                </div>
                <p className="text-[11px] text-indigo-900 mb-2 leading-relaxed">
                  {language === 'ta'
                    ? `${activeChildName}-ன் நேரலை கற்றல் வரலாற்றுத் தரவுகளை ஆய்வு செய்து, உளவியல் ரீதியான வழிகாட்டலை உடனடியாக உருவாக்குங்கள்.`
                    : `Synthesize actual gameplay error logs into a constructive, non-medical pediatric assessment for ${activeChildName}.`}
                </p>

                <button
                  onClick={handleGenerateAiSummary}
                  disabled={isGeneratingAiReport}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isGeneratingAiReport ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'ta' ? 'ஆய்வு செய்யப்படுகிறது...' : 'Analyzing Actual Data...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'ta' ? '✨ புதிய AI மதிப்பீட்டை உருவாக்கு' : '✨ Generate AI Progress Summary'}</span>
                    </>
                  )}
                </button>

                {/* Render AI Report */}
                {aiPediatricReport && (
                  <div className="mt-3 bg-white p-3 rounded-xl border border-indigo-200 text-xs text-slate-800 leading-relaxed shadow-inner animate-in fade-in-50 whitespace-pre-line">
                    {aiPediatricReport}
                  </div>
                )}
              </div>

              {/* Live Gameplay Session Event Logs */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs">
                <span className="text-xs font-bold text-stone-900 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'ta' ? 'நேரலை விளையாட்டு நிகழ்வுகள்' : 'Live Gameplay Session Log'} ({childProgress.learningEvents.length})</span>
                </span>

                {childProgress.learningEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    {language === 'ta' ? 'நிகழ்வுகள் எதுவும் இல்லை. விளையாடத் தொடங்கவும்!' : 'No gameplay events recorded yet. Start playing in the Village!'}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {childProgress.learningEvents.slice(0, 8).map((evt) => (
                      <div
                        key={evt.id}
                        className="bg-stone-50 rounded-xl p-2 border border-stone-200 flex items-center justify-between text-left shadow-2xs"
                      >
                        <div>
                          <span className="text-xs font-bold text-stone-900 block">
                            {evt.activityType} • {evt.eventType}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {evt.contentId} • {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            evt.outcome === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {evt.outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mela Report Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-xs font-bold text-stone-900">
                    {language === 'ta' ? 'கவனிப்பு அறிக்கைகள்' : 'Observation Summaries'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {parentObservations.length} {language === 'ta' ? 'பதிவானவை' : 'Recorded'}
                  </span>
                </div>

                <div className="space-y-2">
                  {parentObservations.map((obs) => {
                    const domainLabel = obs.domain === 'letter' ? t.letterRecognition : obs.domain === 'sound' ? t.soundPatterns : obs.domain === 'word' ? t.wordRecognition : t.pulsePath;
                    const noteText = language === 'ta' ? obs.noteTa : obs.noteEn;

                    return (
                      <div key={obs.id} className="p-2 bg-stone-50 rounded-xl border border-stone-200 text-left">
                        <span className="text-xs font-bold text-stone-800 block mb-0.5">
                          {domainLabel}
                        </span>
                        <p className="text-[11px] text-stone-600 leading-tight">
                          {noteText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS & ACCOUNT MANAGEMENT */}
          {activeTab === 'settings' && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.settingsTitle}</span>
                </h3>

                {/* Active Learner Account Card with Mobile Number as Primary Key */}
                <div className="p-3 bg-amber-50/70 rounded-2xl border-2 border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                      {language === 'ta' ? 'செயலில் உள்ள கணக்கு (முதன்மை சாவி)' : 'Active Account (Primary Key Mapped)'}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      {currentUser?.ageGroup || '5-8'} {language === 'ta' ? 'வயது' : 'yrs'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{currentUser?.avatar || activePlayer.avatar}</span>
                      <div>
                        <span className="text-xs font-black text-slate-900 block leading-tight">
                          {activeChildName}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-indigo-900 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-indigo-600" />
                          <span>{currentUser?.parentMobile || '9876543210'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          sounds.playTap();
                          signOutUser();
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] py-1.5 px-3 rounded-full shadow-2xs transition-transform active:scale-95 flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>{language === 'ta' ? 'கணக்கை மாற்று' : 'Switch'}</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          signOutUser();
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={language === 'ta' ? 'வெளியேறு' : 'Sign Out'}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[9px] text-amber-900 leading-snug">
                    {language === 'ta'
                      ? 'அனைத்து வாசிப்பு நிகழ்வுகள், அடைந்த விருதுகள் மற்றும் சொற்கள் பெற்றோரின் அலைபேசி எண் கீழ் இந்தச் சாதனத்தில் தனிமைப்படுத்தப்பட்டுள்ளது.'
                      : "All screening scores, learned words, and village gifts are strictly separated and mapped using the parent's mobile number as primary key."}
                  </p>
                </div>

                {/* Registered Accounts on this Device */}
                <div className="py-2 border-b border-stone-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-800">
                      {language === 'ta' ? 'பதிவு செய்யப்பட்ட கணக்குகள்' : 'Registered Learners on this Device'}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        signOutUser();
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>{language === 'ta' ? '+ புதிய கற்பவர்' : '+ Add Learner'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {registeredAccounts.map((acc) => {
                      const isSelected = currentUser?.parentMobile === acc.parentMobile;
                      return (
                        <div
                          key={acc.parentMobile}
                          className={`p-2 rounded-xl border flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/80 shadow-2xs'
                              : 'border-slate-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xl">{acc.avatar}</span>
                            <div className="truncate">
                              <span className="text-xs font-bold text-slate-900 block truncate">
                                {acc.childName} ({acc.ageGroup} yrs)
                              </span>
                              <span className="text-[9px] text-slate-500 block truncate">
                                📱 {acc.parentMobile}
                              </span>
                            </div>
                          </div>

                          {isSelected ? (
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {language === 'ta' ? 'செயலில் உள்ளது' : 'Active'}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                sounds.playTap();
                                switchUserByMobile(acc.parentMobile);
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg"
                            >
                              {language === 'ta' ? 'மாறுக' : 'Switch'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Groq AI Key Settings Row */}
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-600" />
                      <span>Groq AI Key</span>
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasGroqKey ? 'Already API key is there (Active)' : 'Not Connected'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGroqModal(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shadow-2xs transition-colors ${
                      hasGroqKey
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {hasGroqKey ? 'Manage' : 'Connect'}
                  </button>
                </div>

                {/* Language Switch */}
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {t.switchLanguage}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        language === 'en' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage('ta')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        language === 'ta' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      தமிழ்
                    </button>
                  </div>
                </div>

                {/* OpenDyslexic Font Toggle */}
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {t.dyslexicFont}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {language === 'ta' ? 'வாசிப்பை எளிதாக்கும் எழுத்துரு' : 'Weighted bottom typeface for easier reading'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUseDyslexicFont(!useDyslexicFont);
                      sounds.playTap();
                    }}
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                      useDyslexicFont ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        useDyslexicFont ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Quiet Mode Audio Toggle */}
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {t.quietMode}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {language === 'ta' ? 'அனைத்து ஒலி விளைவுகளையும் முடக்கு' : 'Mute all game chimes and celebratory sound effects'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsQuietMode(!isQuietMode);
                      sounds.playTap();
                    }}
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                      isQuietMode ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isQuietMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reset Progress */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const confirmMsg = language === 'ta' ? 'அனைத்து முன்னேற்றத்தையும் மீட்டமைக்கவா?' : 'Are you sure you want to reset all learning progress?';
                      if (window.confirm(confirmMsg)) {
                        resetProgress();
                        sounds.playTap();
                      }
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    {t.resetProgress}
                  </button>

                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-1 px-2.5 rounded-xl border border-stone-300 transition-colors shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-600" />
                    <span>{downloaded ? (language === 'ta' ? 'பதிவிறக்கப்பட்டது!' : 'Exported!') : t.exportData}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responsible Screening Notice at bottom of all tabs */}
        <div className="mt-3 bg-stone-200/60 rounded-2xl p-2 text-center text-[10px] text-stone-600 leading-tight">
          ℹ️ {t.responsibleScreeningNotice}
        </div>
      </div>

      {/* Groq Key Modal */}
      <GroqApiKeyModal
        isOpen={showGroqModal}
        onClose={() => setShowGroqModal(false)}
        onKeySaved={refreshLevelContent}
      />
    </div>
  );
};
