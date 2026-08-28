import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Sparkles,
  Heart,
  Wand2,
  Volume2,
  VolumeX,
  CheckCircle,
  Key,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import { VoiceCloneService, ClonedVoiceData } from '../../services/voiceCloneService';

interface FamilyStory {
  id: string;
  titleEn: string;
  titleTa: string;
  illustration: string;
  sentencesEn: string[];
  sentencesTa: string[];
}

const FAMILY_STORIES: FamilyStory[] = [
  {
    id: 'story_ant',
    titleEn: "The Little Ant's Sweet Adventure",
    titleTa: "சின்ன எறும்பின் இனிப்பு பயணம்",
    illustration: "🐜🍃",
    sentencesEn: [
      "Once upon a time in our sunny village garden, a tiny little Ant found a sparkling white sugar cube.",
      "The sweet cube was much bigger than the ant, but the ant was cheerful, patient, and strong.",
      "Step by steady step across the soft green leaf, the ant carried the sugar home to the banyan tree.",
      "Mindy the bird chirped happily: When we work with love, little hands create mighty wonders!"
    ],
    sentencesTa: [
      "சூரியன் பிரகாசிக்கும் கிராமத்து தோட்டத்தில், ஒரு குட்டி எறும்பு ஒரு வெள்ளையான சர்க்கரை கட்டியைக் கண்டது.",
      "அந்த சர்க்கரை கட்டி எறும்பை விட பெரிதாக இருந்தது, ஆனால் எறும்பு மிகுந்த தைரியத்துடனும் புன்னகையுடனும் இருந்தது.",
      "பசுமையான இலை மீது மெல்ல அடி எடுத்து வைத்து, எறும்பு ஆலமரத்தின் அடியில் தன் வீட்டிற்கு கொண்டு சென்றது.",
      "மிண்டி பறவை உற்சாகமாக பாடியது: அன்போடு முயற்சி செய்தால் சிறிய கைகளும் பெரிய சாதனைகளை படைக்கும்!"
    ]
  },
  {
    id: 'story_kite',
    titleEn: "The Sky Dancer Kite",
    titleTa: "வானில் ஆடும் வண்ணக் காற்றாடி",
    illustration: "🪁✨",
    sentencesEn: [
      "{child} held the cotton string tight as the fresh monsoon breeze touched their smiling face.",
      "The diamond kite smiled back, waving its colorful ribbons of red, gold, and sapphire blue.",
      "Higher and higher it danced above the tiled village roofs and green coconut trees.",
      "When we spell real words with care, our thoughts take flight as high as the friendly kite!"
    ],
    sentencesTa: [
      "{child} மென்மையான நூல் உருளையை கையில் பிடித்துக் கொண்டது; இனிய காற்று முகத்தில் வீசியது.",
      "அந்த வண்ணக் காற்றாடி புன்னகைத்து, சிவப்பு, மஞ்சள், நீல வாலாட்டிகளை காற்றில் அசைத்தது.",
      "கிராமத்து ஓட்டு வீடுகளுக்கும் தென்னை மரங்களுக்கும் மேலே அது உயர உயரப் பறந்தது.",
      "நாம் சரியான சொற்களை கவனமாக எழுதும்போது, நம் எண்ணங்களும் காற்றாடி போல் உயரே பறக்கும்!"
    ]
  },
  {
    id: 'story_banyan',
    titleEn: "Mindy's Sacred Banyan Tree",
    titleTa: "மிண்டியின் ஆலமரம்",
    illustration: "🌳🐦",
    sentencesEn: [
      "In the center of the village stood the grand old banyan tree with deep roots and golden shade.",
      "Mindy the baby bird loved nesting high in its leafy branches, listening to the village songs.",
      "Every evening, children sat under the tree listening to stories told by their loving parents.",
      "Good words are like deep banyan roots—they keep our minds strong, happy, and wise."
    ],
    sentencesTa: [
      "கிராமத்தின் நடுவே ஆழமான விழுதுகளுடன் குளிர்ந்த நிழல் தரும் கம்பீரமான ஆலமரம் நின்றது.",
      "மிண்டி என்ற சிறிய பறவை அதன் பசுமையான கிளைகளில் கூடு கட்டி, கிராமத்து பாடல்களை கேட்டு மகிழ்ந்தது.",
      "ஒவ்வொரு மாலையும், குழந்தைகள் மரத்தடியில் அமர்ந்து பெற்றோரின் அன்பான கதைகளை கேட்டார்கள்.",
      "நல்ல சொற்கள் ஆலமரத்தின் விழுதுகள் போன்றவை—அவை நம் மனதை எப்போதும் வலிமையாகவும் அமைதியாகவும் வைக்கும்."
    ]
  }
];

export const FamilyVoiceView: React.FC = () => {
  const { language, t, setCurrentScreen, voiceNotes, deleteVoiceNote, activePlayer, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'listen' | 'clone' | 'record'>('listen');
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);
  const [selectedSpeaker, setSelectedSpeaker] = useState<'cloned' | 'amma' | 'appa' | 'paati'>('cloned');

  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number | null>(null);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  // Cloned Voice Profile State (Loaded from Persistent Base64 Storage)
  const [clonedProfile, setClonedProfile] = useState<ClonedVoiceData | null>(() => {
    return VoiceCloneService.getActiveProfile();
  });

  const [cloneSpeakerChoice, setCloneSpeakerChoice] = useState<'amma' | 'appa' | 'paati'>('amma');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSeconds, setCloneSeconds] = useState(0);
  const [cloneSuccessToast, setCloneSuccessToast] = useState(false);

  // Guided 40-Second Story Recital Teleprompter
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [teleprompterStep, setTeleprompterStep] = useState(0);
  const [isTeleprompterRecording, setIsTeleprompterRecording] = useState(false);
  const [teleprompterSeconds, setTeleprompterSeconds] = useState(0);

  // Neural Voice AI Key Modal
  const [showElevenLabsModal, setShowElevenLabsModal] = useState(false);
  const [elevenLabsKeyInput, setElevenLabsKeyInput] = useState(() => VoiceCloneService.getElevenLabsKey() || '');
  const [isSynthesizingNeural, setIsSynthesizingNeural] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const storyTimerRef = useRef<number | null>(null);
  const cloneTimerRef = useRef<number | null>(null);
  const teleprompterTimerRef = useRef<number | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const currentStory = FAMILY_STORIES[selectedStoryIdx];
  const activeChildName = currentUser?.childName || activePlayer.playerName || (language === 'ta' ? 'சிறு குழந்தை' : 'The explorer');
  const rawSentences = language === 'ta' ? currentStory.sentencesTa : currentStory.sentencesEn;
  const storySentences = useMemo(() => {
    return rawSentences.map((s) => s.replace(/\{child\}/g, activeChildName));
  }, [rawSentences, activeChildName]);
  const storyTitle = language === 'ta' ? currentStory.titleTa : currentStory.titleEn;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      if (cloneTimerRef.current) clearInterval(cloneTimerRef.current);
      if (teleprompterTimerRef.current) clearInterval(teleprompterTimerRef.current);
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
    };
  }, []);

  // Stop any active story or audio playback
  const stopAllAudio = useCallback(() => {
    if (storyTimerRef.current) {
      clearTimeout(storyTimerRef.current);
      storyTimerRef.current = null;
    }
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingStory(false);
    setIsPlayingSample(false);
    setCurrentSentenceIdx(null);
  }, []);

  // Test / Listen to the recorded cloned voice sample
  const handlePlayClonedSample = () => {
    if (!clonedProfile?.base64Audio) return;
    sounds.playTap();

    if (isPlayingSample) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    setIsPlayingSample(true);

    const audio = new Audio(clonedProfile.base64Audio);
    activeAudioElementRef.current = audio;

    audio.onended = () => {
      setIsPlayingSample(false);
      activeAudioElementRef.current = null;
    };

    audio.onerror = () => {
      setIsPlayingSample(false);
      activeAudioElementRef.current = null;
    };

    audio.play().catch(() => {
      setIsPlayingSample(false);
    });
  };

  // Play Story: RECITES THE STORY USING THE REAL RECORDED VOICE!
  const handlePlayStory = () => {
    sounds.playTap();

    if (isPlayingStory) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    setIsPlayingStory(true);
    startSentencesNarration(0);
  };

  // Recite story sentences with real audio and emotional prosody
  const startSentencesNarration = (startIdx: number) => {
    let idx = startIdx;

    const playNext = () => {
      if (idx >= storySentences.length) {
        setIsPlayingStory(false);
        setCurrentSentenceIdx(null);
        sounds.playCelebration();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        return;
      }

      setCurrentSentenceIdx(idx);
      const sentence = storySentences[idx];

      // 1. Check if parent has recorded this sentence in their actual voice!
      const dubbedAudio = VoiceCloneService.getSentenceAudio(currentStory.id, idx);
      if (dubbedAudio) {
        const sentenceAudio = new Audio(dubbedAudio);
        activeAudioElementRef.current = sentenceAudio;

        sentenceAudio.onended = () => {
          activeAudioElementRef.current = null;
          idx++;
          playNext();
        };

        sentenceAudio.onerror = () => {
          activeAudioElementRef.current = null;
          fallbackEmotionalSpeak(sentence, idx, playNext);
        };

        sentenceAudio.play().catch(() => {
          fallbackEmotionalSpeak(sentence, idx, playNext);
        });
        return;
      }

      // 2. Otherwise: Use the Emotion-Tuned Storytelling Engine!
      fallbackEmotionalSpeak(sentence, idx, playNext);
    };

    const fallbackEmotionalSpeak = (sentence: string, currentIdx: number, _onComplete: () => void) => {
      if (selectedSpeaker === 'cloned' && clonedProfile) {
        sounds.speak(sentence, language, {
          emotion: clonedProfile.speaker === 'appa' ? 'warm_father' : 'warm_mother',
          pitch: clonedProfile.pitch,
          rate: clonedProfile.rate,
          voiceGender: clonedProfile.speaker === 'appa' ? 'male' : 'female',
        });
      } else {
        // Amma, Appa, and Paati each speak with their unique acoustic texture and vocal timbre!
        sounds.speakFamilyVoice(
          selectedSpeaker === 'appa' ? 'appa' : selectedSpeaker === 'paati' ? 'paati' : 'amma',
          sentence,
          language
        );
      }

      const delay = Math.max(3800, sentence.length * 95);
      storyTimerRef.current = window.setTimeout(() => {
        startSentencesNarration(currentIdx + 1);
      }, delay);
    };

    playNext();
  };

  // 10-Second Quick Calibration
  const handleStartVoiceCloning = async () => {
    sounds.playTap();
    if (isCloning) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsCloning(false);
      if (cloneTimerRef.current) clearInterval(cloneTimerRef.current);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const base64Audio = await VoiceCloneService.blobToBase64(audioBlob);
          const { f0Hz, pitchMultiplier } = await VoiceCloneService.analyzePitch(audioBlob);

          const labelEn =
            cloneSpeakerChoice === 'appa'
              ? 'Appa (Father)'
              : cloneSpeakerChoice === 'paati'
              ? 'Paati (Grandmother)'
              : 'Amma (Mother)';
          const labelTa =
            cloneSpeakerChoice === 'appa'
              ? 'அப்பா'
              : cloneSpeakerChoice === 'paati'
              ? 'பாட்டி'
              : 'அம்மா';

          const newProfile: ClonedVoiceData = {
            id: 'clone_' + Date.now(),
            speaker: cloneSpeakerChoice,
            speakerLabelEn: labelEn,
            speakerLabelTa: labelTa,
            recordedDate: 'Calibrated Just Now',
            base64Audio,
            pitch: pitchMultiplier,
            rate: cloneSpeakerChoice === 'paati' ? 0.82 : 0.88,
            measuredF0Hz: f0Hz,
          };

          VoiceCloneService.saveProfile(newProfile);
          setClonedProfile(newProfile);
          setSelectedSpeaker('cloned');

          sounds.playCelebration();
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
          setCloneSuccessToast(true);
          setTimeout(() => setCloneSuccessToast(false), 5000);

          stream.getTracks().forEach((t) => t.stop());
        };

        mediaRecorder.start();
        setIsCloning(true);
        setCloneSeconds(0);

        cloneTimerRef.current = window.setInterval(() => {
          setCloneSeconds((prev) => {
            if (prev >= 9) {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
              setIsCloning(false);
              if (cloneTimerRef.current) clearInterval(cloneTimerRef.current);
              return 10;
            }
            return prev + 1;
          });
        }, 1000);
      }
    } catch {
      setIsCloning(false);
    }
  };

  // Guided Story Teleprompter: Step-by-Step Sentence Recording
  const handleOpenTeleprompter = () => {
    sounds.playTap();
    stopAllAudio();
    setTeleprompterStep(0);
    setIsTeleprompterRecording(false);
    setIsTeleprompterOpen(true);
  };

  const handleToggleTeleprompterRecord = async () => {
    sounds.playTap();

    if (isTeleprompterRecording) {
      // Stop recording this sentence
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsTeleprompterRecording(false);
      if (teleprompterTimerRef.current) clearInterval(teleprompterTimerRef.current);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        const base64 = await VoiceCloneService.blobToBase64(blob);

        // Save recorded sentence audio (guaranteed persistence!)
        VoiceCloneService.saveSentenceAudio(currentStory.id, teleprompterStep, base64);
        setClonedProfile(VoiceCloneService.getActiveProfile());
        setSelectedSpeaker('cloned');

        sounds.playChime();
        sounds.triggerHaptic(45);

        stream.getTracks().forEach((t) => t.stop());

        // Automatically advance to next sentence or complete!
        if (teleprompterStep + 1 < storySentences.length) {
          setTeleprompterStep((prev) => prev + 1);
        } else {
          // Completed all sentences!
          sounds.playCelebration();
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
          setIsTeleprompterOpen(false);
          // Automatically begin recital of their recorded voice story!
          setTimeout(() => {
            handlePlayStory();
          }, 600);
        }
      };

      mediaRecorder.start();
      setIsTeleprompterRecording(true);
      setTeleprompterSeconds(0);

      teleprompterTimerRef.current = window.setInterval(() => {
        setTeleprompterSeconds((p) => p + 1);
      }, 1000);
    } catch {
      setIsTeleprompterRecording(false);
    }
  };

  // Neural Synthesis via ElevenLabs
  const handleSaveElevenLabsKey = async () => {
    sounds.playTap();
    VoiceCloneService.setElevenLabsKey(elevenLabsKeyInput);

    if (!elevenLabsKeyInput.trim() || !clonedProfile?.base64Audio) {
      setShowElevenLabsModal(false);
      return;
    }

    setIsSynthesizingNeural(true);
    try {
      // Fetch audio blob from base64
      const res = await fetch(clonedProfile.base64Audio);
      const audioBlob = await res.blob();

      // Clone voice via ElevenLabs API
      const cloneResult = await VoiceCloneService.cloneVoiceWithElevenLabs(
        elevenLabsKeyInput.trim(),
        audioBlob,
        clonedProfile.speakerLabelEn
      );

      if (cloneResult.success && cloneResult.voiceId) {
        // Synthesize all sentences of current story in neural voice!
        for (let i = 0; i < storySentences.length; i++) {
          const synthAudio = await VoiceCloneService.synthesizeNeuralVoice(
            storySentences[i],
            elevenLabsKeyInput.trim(),
            cloneResult.voiceId
          );
          if (synthAudio) {
            VoiceCloneService.saveSentenceAudio(currentStory.id, i, synthAudio);
          }
        }

        const updated = VoiceCloneService.getActiveProfile();
        if (updated) {
          updated.elevenLabsVoiceId = cloneResult.voiceId;
          VoiceCloneService.saveProfile(updated);
          setClonedProfile(updated);
        }

        sounds.playCelebration();
        confetti({ particleCount: 80, spread: 70 });
      }
    } catch {
      // fallback
    } finally {
      setIsSynthesizingNeural(false);
      setShowElevenLabsModal(false);
    }
  };

  const dubbedCount = VoiceCloneService.getStoryDubCount(currentStory.id, storySentences.length);

  return (
    <div className="w-full flex-1 flex flex-col p-2.5 sm:p-3 max-w-md mx-auto overflow-y-auto">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            stopAllAudio();
            sounds.playTap();
            setCurrentScreen('village');
          }}
          className="flex items-center gap-1 bg-white/90 text-slate-700 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToVillage}</span>
        </button>

        {/* 3 Tabs */}
        <div className="flex bg-white rounded-full p-0.5 border border-teal-300 shadow-2xs">
          <button
            onClick={() => {
              stopAllAudio();
              sounds.playTap();
              setActiveTab('listen');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              activeTab === 'listen' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            {language === 'ta' ? '📖 கதை கேட்க' : '📖 Listen'}
          </button>
          <button
            onClick={() => {
              stopAllAudio();
              sounds.playTap();
              setActiveTab('clone');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
              activeTab === 'clone' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>{language === 'ta' ? '✨ குரல் அரங்கம்' : '✨ Voice Studio'}</span>
          </button>
          <button
            onClick={() => {
              stopAllAudio();
              sounds.playTap();
              setActiveTab('record');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              activeTab === 'record' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            {language === 'ta' ? '❤️ பதிவுகள்' : '❤️ Notes'}
          </button>
        </div>
      </div>

      {/* Main Cottage Container */}
      <div className="bg-teal-50/70 border-2 border-teal-200 rounded-3xl p-3.5 shadow-md flex-1 flex flex-col justify-between">
        <div>
          {/* Header Title */}
          <div className="text-center mb-2.5">
            <h2 className="text-base sm:text-lg font-black text-teal-950 flex items-center justify-center gap-1.5">
              <span>🏡🎙️</span>
              <span>{t.familyVoiceTitle}</span>
            </h2>
            <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
              {language === 'ta'
                ? 'பெற்றோரின் உண்மையான குரலில் கதைகளைக் கேட்டு மகிழுங்கள்!'
                : "Listen to village bedtime stories recited in your family's real voice!"}
            </p>
          </div>

          {/* TAB 1: LISTEN TO STORIES (RECITES IN FAMILY VOICE WITH EMOTION!) */}
          {activeTab === 'listen' && (
            <>
              {/* Slideable Story Selector Pills (Smooth horizontal swipe on mobile) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1 mb-2.5 w-full items-center justify-start sm:justify-center">
                {FAMILY_STORIES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      stopAllAudio();
                      sounds.playTap();
                      setSelectedStoryIdx(idx);
                    }}
                    className={`shrink-0 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      selectedStoryIdx === idx
                        ? 'bg-teal-600 text-white shadow-xs scale-105 ring-2 ring-teal-300'
                        : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <span className="text-sm">{s.illustration}</span>
                    <span className="text-[10px] sm:text-[11px] whitespace-nowrap">
                      {language === 'ta' ? s.titleTa : s.titleEn}
                    </span>
                  </button>
                ))}
              </div>

              {/* Storyteller Voice Selector */}
              <div className="bg-white/95 rounded-2xl p-2.5 mb-2.5 shadow-2xs border border-teal-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">
                  {language === 'ta' ? 'குரல் தேர்வு:' : 'Storyteller:'}
                </span>

                <div className="flex gap-1 flex-wrap justify-end">
                  {/* Cloned Voice Pill */}
                  {clonedProfile ? (
                    <button
                      onClick={() => {
                        sounds.playTap();
                        setSelectedSpeaker('cloned');
                      }}
                      className={`py-1 px-2.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 ${
                        selectedSpeaker === 'cloned'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs scale-105 ring-2 ring-purple-300'
                          : 'bg-purple-50 text-purple-900 border border-purple-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                      <span>
                        {language === 'ta'
                          ? `${clonedProfile.speakerLabelTa || 'உங்கள் குரல்'} (உங்கள் குரல்)`
                          : `${clonedProfile.speakerLabelEn || 'Your Voice'} (Your Voice)`}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playTap();
                        setActiveTab('clone');
                      }}
                      className="py-1 px-2.5 rounded-xl text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1"
                    >
                      <Wand2 className="w-3 h-3 text-amber-600" />
                      <span>{language === 'ta' ? '+ குரல் பதிவு' : '+ Clone Voice'}</span>
                    </button>
                  )}

                  {[
                    {
                      id: 'amma',
                      nameEn: "Amma's Voice",
                      nameTa: 'அம்மாவின் குரல்',
                      emoji: '👩🏽',
                      previewEn: 'Hello my sweet child, Amma is here to tell you a story.',
                      previewTa: 'என் செல்லக் கண்ணே, அம்மா உனக்கு ஒரு அழகான கதை சொல்கிறேன்.',
                    },
                    {
                      id: 'appa',
                      nameEn: "Appa's Voice",
                      nameTa: 'அப்பாவின் குரல்',
                      emoji: '👨🏽',
                      previewEn: 'Hey champion, Appa is so proud of you.',
                      previewTa: 'அப்பாவின் செல்லமே, நீ மிகச் சிறப்பாக படித்து வருகிறாய்.',
                    },
                    {
                      id: 'paati',
                      nameEn: "Paati's Voice",
                      nameTa: 'பாட்டியின் குரல்',
                      emoji: '👵🏽',
                      previewEn: 'Come sit close with Paati, my golden pearl.',
                      previewTa: 'வா என் தங்கமே, பாட்டி உனக்கு ஒரு இனிமையான கதை சொல்கிறேன்.',
                    },
                  ].map((spk) => (
                    <button
                      key={spk.id}
                      onClick={() => {
                        sounds.playTap();
                        setSelectedSpeaker(spk.id as any);
                        sounds.speakFamilyVoice(
                          spk.id as any,
                          language === 'ta' ? spk.previewTa : spk.previewEn,
                          language
                        );
                      }}
                      className={`py-1 px-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        selectedSpeaker === spk.id
                          ? 'bg-teal-600 text-white shadow-2xs ring-2 ring-teal-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{spk.emoji}</span>
                      <span>{language === 'ta' ? spk.nameTa : spk.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Player Box */}
              <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-teal-100 mb-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentStory.illustration}</span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">
                        {storyTitle}
                      </h3>
                      {dubbedCount > 0 ? (
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          <span>{dubbedCount}/{storySentences.length} {language === 'ta' ? 'வரிகள் உங்கள் குரலில்' : 'lines in your voice'}</span>
                        </span>
                      ) : (
                        <span className="text-[9px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded-full">
                          {language === 'ta' ? 'உணர்ச்சிகரமான கதை வடிவம்' : 'Emotion-tuned narration'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Play Story Button */}
                    <button
                      onClick={handlePlayStory}
                      className={`py-1.5 px-3.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                        isPlayingStory
                          ? 'bg-rose-500 text-white animate-pulse'
                          : selectedSpeaker === 'cloned'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isPlayingStory ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>
                        {isPlayingStory
                          ? (language === 'ta' ? 'நிறுத்து' : 'Pause')
                          : selectedSpeaker === 'cloned'
                          ? (language === 'ta' ? 'என் குரலில் கேட்க' : 'Play in Your Voice')
                          : (language === 'ta' ? 'கதை கேட்க' : 'Play Story')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Recite in My Voice Action Banner */}
                {dubbedCount < storySentences.length && (
                  <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-950 flex items-center gap-1">
                      <Mic className="w-3 h-3 text-purple-600 animate-pulse" />
                      <span>{language === 'ta' ? 'இந்த கதையை 40 வினாடிகளில் உங்கள் குரலில் வாசிக்கலாமா?' : 'Recite this entire story in your voice (Takes 40s)?'}</span>
                    </span>
                    <button
                      onClick={handleOpenTeleprompter}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs active:scale-95 flex items-center gap-0.5"
                    >
                      <span>{language === 'ta' ? 'வாசிக்க 🎙️' : 'Start Dub 🎙️'}</span>
                    </button>
                  </div>
                )}

                {/* Story Sentences with Line-by-Line Highlight */}
                <div className="space-y-2">
                  {storySentences.map((sentence: string, idx: number) => {
                    const isCurrent = currentSentenceIdx === idx;
                    const hasCustomDub = !!VoiceCloneService.getSentenceAudio(currentStory.id, idx);

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-amber-100 border-amber-400 font-bold text-amber-950 shadow-xs scale-101 ring-2 ring-amber-200'
                            : hasCustomDub
                            ? 'bg-purple-50/60 border-purple-200 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <p
                          onClick={() => {
                            stopAllAudio();
                            sounds.playTap();
                            setCurrentSentenceIdx(idx);
                            const dubbed = VoiceCloneService.getSentenceAudio(currentStory.id, idx);
                            if (dubbed) {
                              const a = new Audio(dubbed);
                              activeAudioElementRef.current = a;
                              a.play().catch(() => {});
                            } else {
                              sounds.speakFamilyVoice(
                                selectedSpeaker === 'appa' ? 'appa' : selectedSpeaker === 'paati' ? 'paati' : 'amma',
                                sentence,
                                language
                              );
                            }
                          }}
                          className="text-xs sm:text-sm leading-relaxed cursor-pointer"
                        >
                          {sentence}
                        </p>

                        {hasCustomDub && (
                          <div className="mt-1 flex items-center justify-between text-[9px] font-bold text-emerald-700">
                            <span className="flex items-center gap-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>{language === 'ta' ? 'உங்கள் குரலில் பதிவானது' : 'Recited in your real voice'}</span>
                            </span>
                            <button
                              onClick={() => {
                                const dubbed = VoiceCloneService.getSentenceAudio(currentStory.id, idx);
                                if (dubbed) {
                                  stopAllAudio();
                                  const a = new Audio(dubbed);
                                  activeAudioElementRef.current = a;
                                  a.play();
                                }
                              }}
                              className="text-purple-700 hover:underline flex items-center gap-0.5"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{language === 'ta' ? 'கேட்க' : 'Listen'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: VOICE STUDIO (CLONE CALIBRATION + NEURAL AI KEY) */}
          {activeTab === 'clone' && (
            <div className="bg-gradient-to-b from-purple-50 to-indigo-50/50 rounded-2xl p-3.5 shadow-sm border-2 border-purple-200 mb-2 text-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-purple-950">
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  <span>{language === 'ta' ? 'குடும்பக் குரல் அரங்கம்' : 'Family Voice Studio'}</span>
                </div>

                {/* Neural AI Key Link */}
                <button
                  onClick={() => setShowElevenLabsModal(true)}
                  className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>ElevenLabs AI</span>
                </button>
              </div>

              <p className="text-[11px] text-purple-800 font-medium mb-3">
                {language === 'ta'
                  ? 'கீழே உள்ள 10 வினாடி எளிய வரியை பேசி உங்கள் குரல் தொனியை அளவிடுங்கள்! அல்லது கதை பக்கத்தில் 40 வினாடிகளில் கதையை முழுமையாக வாசிக்கலாம்!'
                  : 'Calibrate your voice in 10 seconds below, or use the 40-second Story Teleprompter so your child hears you reciting every story line!'}
              </p>

              {/* Speaker Choice */}
              <div className="flex justify-center gap-1.5 mb-3">
                {[
                  { id: 'amma', labelEn: 'Amma (Mother)', labelTa: 'அம்மா', emoji: '👩🏽' },
                  { id: 'appa', labelEn: 'Appa (Father)', labelTa: 'அப்பா', emoji: '👨🏽' },
                  { id: 'paati', labelEn: 'Paati (Grandma)', labelTa: 'பாட்டி', emoji: '👵🏽' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCloneSpeakerChoice(s.id as any)}
                    className={`py-1 px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      cloneSpeakerChoice === s.id
                        ? 'bg-purple-600 text-white shadow-xs scale-105'
                        : 'bg-white text-purple-900 border border-purple-200'
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{language === 'ta' ? s.labelTa : s.labelEn}</span>
                  </button>
                ))}
              </div>

              {/* 10-Second Calibration Sentence Prompt */}
              <div className="bg-white p-3 rounded-2xl border border-purple-200 mb-3 text-left shadow-2xs">
                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                  🎙️ {language === 'ta' ? 'இந்த ஒரு வரியை வாசிக்கவும்:' : 'Read this calibration sentence aloud:'}
                </span>
                <p className="text-xs font-black text-slate-800 leading-snug">
                  {language === 'ta'
                    ? `&quot;அன்பு செல்லமே, ${activePlayer.playerName}, உன்னை எனக்கு மிகவும் பிடிக்கும்! நீ எப்போதும் தைரியமாகவும் புன்னகையுடனும் படிக்க வேண்டும்!&quot;`
                    : `"Hello my sweet ${activePlayer.playerName}, I love you so much! Always remember that you are smart, brave, and wonderful!"`}
                </p>
              </div>

              {/* Record / Calibrate Button */}
              <button
                onClick={handleStartVoiceCloning}
                className={`py-2.5 px-6 rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto ${
                  isCloning
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                }`}
              >
                {isCloning ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>
                  {isCloning
                    ? (language === 'ta' ? `குரல் பதிவாகிறது (${cloneSeconds}/10s)...` : `Recording Voice (${cloneSeconds}/10s)...`)
                    : (language === 'ta' ? '10 வினாடி குரல் பதிவு தொடங்க' : 'Start 10s Voice Calibration')}
                </span>
              </button>

              {/* Success Notification */}
              {cloneSuccessToast && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold animate-in zoom-in-95 flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'ta'
                      ? 'குரல் வெற்றிகரமாக பதிவானது! கீழே உள்ள பொத்தானைத் தட்டி உங்கள் குரலை கேட்கலாம்!'
                      : 'Voice Calibrated! You can now listen to your real recorded voice below!'}
                  </span>
                </div>
              )}

              {/* Active Cloned Profile Preview Card with REAL Audio Player! */}
              {clonedProfile && (
                <div className="mt-3 bg-white p-3 rounded-2xl border border-purple-200 shadow-2xs text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span className="text-xs font-black text-slate-900">
                        {language === 'ta'
                          ? clonedProfile.speakerLabelTa || 'உங்கள் குரல்'
                          : clonedProfile.speakerLabelEn || 'Your Voice'}
                      </span>
                    </div>

                    {clonedProfile.measuredF0Hz && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        Pitch: {clonedProfile.measuredF0Hz} Hz
                      </span>
                    )}
                  </div>

                  {/* Playback Test Button: Plays REAL Audio */}
                  {clonedProfile.base64Audio ? (
                    <button
                      onClick={handlePlayClonedSample}
                      className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isPlayingSample
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-900'
                      }`}
                    >
                      {isPlayingSample ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>
                        {isPlayingSample
                          ? (language === 'ta' ? 'ஒலிப்பதை நிறுத்து' : 'Stop Playing')
                          : (language === 'ta' ? '▶️ என் குரல் மாதிரியை கேட்க' : '▶️ Listen to My Real Recorded Voice')}
                      </span>
                    </button>
                  ) : null}
                </div>
              )}

              {/* Direct Story Dubbing Card */}
              <div className="mt-3 p-3 bg-white rounded-2xl border border-purple-200 text-left shadow-2xs">
                <span className="text-xs font-black text-purple-950 block mb-1">
                  🎙️ {language === 'ta' ? '40 வினாடி கதை வாசிப்பு வழிகாட்டி:' : '40-Second Story Teleprompter:'}
                </span>
                <p className="text-[10px] text-slate-600 leading-tight mb-2">
                  {language === 'ta'
                    ? 'உங்கள் குரலில் கதை முழுவதும் ஒலிக்க, 4 வரிகளை தட்டச்சு திரை போல் எளிதாக 40 வினாடிகளில் வாசிக்கலாம்!'
                    : 'To hear yourself reading the entire story line by line, tap below to read the 4 sentences in 40 seconds!'}
                </p>
                <button
                  onClick={handleOpenTeleprompter}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'கதையை வாசிக்க தொடங்க ➡️' : 'Start 40s Story Teleprompter ➡️'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED FAMILY VOICE RECORDINGS */}
          {activeTab === 'record' && (
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-teal-100 mb-2">
              <span className="text-xs font-bold text-teal-900 block mb-1.5 text-center">
                {language === 'ta' ? 'சேமிக்கப்பட்ட குடும்பப் பதிவுகள்' : 'Saved Family Voice Notes & Stories'}
              </span>

              {voiceNotes.length > 0 ? (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {voiceNotes.map((note) => {
                    const speaker = language === 'ta' ? note.speakerTa : note.speakerEn;
                    const title = language === 'ta' ? note.titleTa : note.titleEn;

                    return (
                      <div
                        key={note.id}
                        className="bg-teal-50/50 rounded-xl p-2 border border-teal-100 flex items-center justify-between text-left shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">❤️</span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-snug break-words">
                              {title || speaker}
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              {note.dateRecorded}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              sounds.playTap();
                              if (note.audioBlobUrl) {
                                const audio = new Audio(note.audioBlobUrl);
                                audio.play();
                              } else {
                                const spk = note.id.includes('appa') || note.speakerEn.toLowerCase().includes('father') ? 'appa' : 'amma';
                                sounds.speakFamilyVoice(
                                  spk,
                                  language === 'ta' ? note.messageTa : note.messageEn,
                                  language
                                );
                              }
                            }}
                            className="p-1.5 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-full cursor-pointer"
                            title="Listen"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>

                          {!note.isPreRecorded && (
                            <button
                              onClick={() => {
                                sounds.playTap();
                                deleteVoiceNote(note.id);
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-full"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  No recordings saved yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Screening & Emotional Security Note */}
        <div className="mt-2 bg-teal-100/60 rounded-xl p-1.5 text-center text-[9px] text-teal-900">
          🌱 {language === 'ta'
            ? 'அன்பான குடும்பக் குரலில் கதைகளைக் கேட்பது குழந்தைகளின் வாசிப்புப் பதற்றத்தைக் குறைத்து தன்னம்பிக்கையை வளர்க்கிறது.'
            : "Hearing stories in a loved one's real voice lowers reading anxiety, releases oxytocin, and grounds emotional safety during dyslexia remediation."}
        </div>
      </div>

      {/* GUIDED 40-SECOND STORY RECITAL TELEPROMPTER MODAL */}
      {isTeleprompterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-purple-300 text-center relative flex flex-col justify-between max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => {
                if (isTeleprompterRecording && mediaRecorderRef.current) {
                  mediaRecorderRef.current.stop();
                }
                setIsTeleprompterOpen(false);
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center justify-center gap-1 text-xs font-black text-purple-950 mb-1">
                <span>🎙️</span>
                <span>{language === 'ta' ? 'கதை வாசிப்பு வழிகாட்டி' : 'Story Teleprompter'}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 block mb-2">
                {currentStory.illustration} {storyTitle} • {language === 'ta' ? `வரி ${teleprompterStep + 1} / ${storySentences.length}` : `Sentence ${teleprompterStep + 1} of ${storySentences.length}`}
              </span>

              {/* Sentence Teleprompter Display */}
              <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 mb-3 text-left shadow-inner">
                <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                  {language === 'ta' ? `வரி #${teleprompterStep + 1}-ஐ வாசிக்கவும்:` : `Read line #${teleprompterStep + 1} aloud:`}
                </span>
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  &quot;{storySentences[teleprompterStep]}&quot;
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-center gap-1.5 mb-3">
                {storySentences.map((_: string, i: number) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === teleprompterStep
                        ? 'w-7 bg-purple-600 ring-2 ring-purple-300'
                        : i < teleprompterStep || VoiceCloneService.getSentenceAudio(currentStory.id, i)
                        ? 'w-5 bg-emerald-500'
                        : 'w-5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Record / Next Button */}
            <div className="space-y-2">
              <button
                onClick={handleToggleTeleprompterRecord}
                className={`w-full py-3 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isTeleprompterRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700'
                }`}
              >
                {isTeleprompterRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>
                  {isTeleprompterRecording
                    ? (language === 'ta' ? `பதிவாகிறது (${teleprompterSeconds}s) • முடித்தவுடன் தொடுங்கள்!` : `Recording (${teleprompterSeconds}s) • Tap when done!`)
                    : (language === 'ta' ? `வரி #${teleprompterStep + 1}-ஐ பதிவு செய்ய தொடங்கு` : `Record Line #${teleprompterStep + 1}`)}
                </span>
              </button>

              {teleprompterStep + 1 < storySentences.length ? (
                <button
                  onClick={() => setTeleprompterStep((p) => p + 1)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold inline-flex items-center gap-0.5"
                >
                  <span>{language === 'ta' ? 'அடுத்த வரிக்கு செல்' : 'Skip to next line'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ELEVENLABS NEURAL AI CLONING MODAL */}
      {showElevenLabsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-indigo-300 text-left relative">
            <button
              onClick={() => setShowElevenLabsModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                ElevenLabs Neural Voice Cloning
              </h3>
            </div>

            <p className="text-[11px] text-slate-600 mb-3">
              Connect your ElevenLabs API Key to generate photorealistic neural speech for all stories automatically from your 10-second voice sample:
            </p>

            <input
              type="password"
              placeholder="xi-api-key..."
              value={elevenLabsKeyInput}
              onChange={(e) => setElevenLabsKeyInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl mb-3 focus:outline-none focus:border-indigo-500 font-mono"
            />

            <button
              onClick={handleSaveElevenLabsKey}
              disabled={isSynthesizingNeural}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSynthesizingNeural ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Story Audio...</span>
                </>
              ) : (
                <span>Save & Generate Neural Voice</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
