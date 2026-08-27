import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { ArrowLeft, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';

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
      "Aarav held the cotton string tight as the fresh monsoon breeze touched his smiling face.",
      "The diamond kite smiled back, waving its colorful ribbons of red, gold, and sapphire blue.",
      "Higher and higher it danced above the tiled village roofs and green coconut trees.",
      "When we spell real words with care, our thoughts take flight as high as the friendly kite!"
    ],
    sentencesTa: [
      "ஆரவ் மென்மையான நூல் உருளையை கையில் பிடித்துக் கொண்டான்; இனிய காற்று அவன் முகத்தில் வீசியது.",
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
  const { language, t, setCurrentScreen, voiceNotes, addVoiceNote, deleteVoiceNote } = useApp();
  
  const [activeTab, setActiveTab] = useState<'listen' | 'record'>('listen');
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);
  const [selectedSpeaker, setSelectedSpeaker] = useState<'amma' | 'appa' | 'paati'>('amma');
  
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const currentStory = FAMILY_STORIES[selectedStoryIdx];
  const storySentences = language === 'ta' ? currentStory.sentencesTa : currentStory.sentencesEn;
  const storyTitle = language === 'ta' ? currentStory.titleTa : currentStory.titleEn;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePlayStory = () => {
    sounds.playTap();
    if (isPlayingStory) {
      setIsPlayingStory(false);
      setCurrentSentenceIdx(null);
      return;
    }

    setIsPlayingStory(true);
    let idx = 0;
    setCurrentSentenceIdx(0);

    const playNext = () => {
      if (idx >= storySentences.length) {
        setIsPlayingStory(false);
        setCurrentSentenceIdx(null);
        sounds.playCelebration();
        return;
      }

      setCurrentSentenceIdx(idx);
      const sentence = storySentences[idx];

      // Format speaker intro
      const speakerPrefix = selectedSpeaker === 'amma'
        ? (language === 'ta' ? 'அம்மா படிக்கிறார்: ' : 'Amma reads: ')
        : selectedSpeaker === 'appa'
        ? (language === 'ta' ? 'அப்பா படிக்கிறார்: ' : 'Appa reads: ')
        : (language === 'ta' ? 'பாட்டி படிக்கிறார்: ' : 'Grandma reads: ');

      // Speak with warm, gentle family pacing
      sounds.speak(idx === 0 ? `${speakerPrefix}${sentence}` : sentence, language);

      const delay = Math.max(3500, sentence.length * 90);
      timerRef.current = window.setTimeout(() => {
        idx++;
        playNext();
      }, delay);
    };

    playNext();
  };

  const handleStartRealRecording = async () => {
    sounds.playTap();
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          sounds.playChime();

          const speakerLabelEn = selectedSpeaker === 'amma' ? 'Amma (Mother)' : selectedSpeaker === 'appa' ? 'Appa (Father)' : 'Paati (Grandmother)';
          const speakerLabelTa = selectedSpeaker === 'amma' ? 'அம்மா' : selectedSpeaker === 'appa' ? 'அப்பா' : 'பாட்டி';

          addVoiceNote({
            id: 'vn_story_' + Date.now(),
            speakerEn: speakerLabelEn,
            speakerTa: speakerLabelTa,
            titleEn: `${speakerLabelEn}'s Story Reading: ${currentStory.titleEn}`,
            titleTa: `${speakerLabelTa} வாசித்த கதை: ${currentStory.titleTa}`,
            messageEn: currentStory.sentencesEn[0],
            messageTa: currentStory.sentencesTa[0],
            dateRecorded: 'Just now',
            audioBlobUrl: audioUrl,
            isPreRecorded: false,
          });

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);

        timerRef.current = window.setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        simulateFallbackRecord();
      }
    } catch {
      simulateFallbackRecord();
    }
  };

  const simulateFallbackRecord = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = window.setInterval(() => setRecordingSeconds(p => p + 1), 1000);

    setTimeout(() => {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      sounds.playChime();

      const speakerLabelEn = selectedSpeaker === 'amma' ? 'Amma (Mother)' : selectedSpeaker === 'appa' ? 'Appa (Father)' : 'Paati (Grandmother)';
      const speakerLabelTa = selectedSpeaker === 'amma' ? 'அம்மா' : selectedSpeaker === 'appa' ? 'அப்பா' : 'பாட்டி';

      addVoiceNote({
        id: 'vn_story_' + Date.now(),
        speakerEn: speakerLabelEn,
        speakerTa: speakerLabelTa,
        titleEn: `${speakerLabelEn}'s Story: ${currentStory.titleEn}`,
        titleTa: `${speakerLabelTa} வாசித்த கதை: ${currentStory.titleTa}`,
        messageEn: currentStory.sentencesEn[0],
        messageTa: currentStory.sentencesTa[0],
        dateRecorded: 'Just now',
        isPreRecorded: false,
      });
    }, 4000);
  };

  return (
    <div className="w-full flex-1 flex flex-col p-3 max-w-md mx-auto overflow-y-auto">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            sounds.playTap();
            setCurrentScreen('village');
          }}
          className="flex items-center gap-1 bg-white/90 text-slate-700 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToVillage}</span>
        </button>

        {/* Tab switch between Listen to Stories & Record Studio */}
        <div className="flex bg-white rounded-full p-0.5 border border-teal-300 shadow-2xs">
          <button
            onClick={() => {
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
              sounds.playTap();
              setActiveTab('record');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              activeTab === 'record' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            {language === 'ta' ? '🎙️ குரல் பதிவு' : '🎙️ Record'}
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
                ? 'குடும்ப உறுப்பினர்களின் சொந்த குரலில் கதைகளை கேட்டு மகிழுங்கள்!'
                : "Listen to bedtime and village stories in your family's own voice!"}
            </p>
          </div>

          {/* Story Selector Pills */}
          <div className="flex gap-1.5 justify-center mb-2.5">
            {FAMILY_STORIES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedStoryIdx(idx);
                  setIsPlayingStory(false);
                  setCurrentSentenceIdx(null);
                }}
                className={`py-1 px-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedStoryIdx === idx
                    ? 'bg-teal-600 text-white shadow-xs scale-105'
                    : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                <span>{s.illustration}</span>
                <span className="text-[10px] truncate max-w-[80px]">
                  {language === 'ta' ? s.titleTa : s.titleEn}
                </span>
              </button>
            ))}
          </div>

          {/* Voice Speaker Selector: Amma / Appa / Paati */}
          <div className="bg-white/95 rounded-2xl p-2.5 mb-2.5 shadow-2xs border border-teal-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">
              {language === 'ta' ? 'கதை சொல்பவர்:' : 'Storyteller:'}
            </span>
            <div className="flex gap-1">
              {[
                { id: 'amma', nameEn: 'Amma', nameTa: 'அம்மா', emoji: '👩🏽' },
                { id: 'appa', nameEn: 'Appa', nameTa: 'அப்பா', emoji: '👨🏽' },
                { id: 'paati', nameEn: 'Paati', nameTa: 'பாட்டி', emoji: '👵🏽' },
              ].map((spk) => (
                <button
                  key={spk.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedSpeaker(spk.id as any);
                  }}
                  className={`py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                    selectedSpeaker === spk.id
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{spk.emoji}</span>
                  <span>{language === 'ta' ? spk.nameTa : spk.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: LISTEN TO STORY IN FAMILY VOICE */}
          {activeTab === 'listen' && (
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-teal-100 mb-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentStory.illustration}</span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    {storyTitle}
                  </h3>
                </div>
                <button
                  onClick={handlePlayStory}
                  className={`py-1 px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
                    isPlayingStory
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isPlayingStory ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingStory ? (language === 'ta' ? 'நிறுத்து' : 'Pause') : (language === 'ta' ? 'கதை கேட்க' : 'Play Story')}</span>
                </button>
              </div>

              {/* Story Sentences with Line-by-Line Active Highlighting */}
              <div className="space-y-2">
                {storySentences.map((sentence, idx) => {
                  const isCurrent = currentSentenceIdx === idx;
                  return (
                    <p
                      key={idx}
                      onClick={() => {
                        sounds.playTap();
                        setCurrentSentenceIdx(idx);
                        sounds.speak(sentence, language);
                      }}
                      className={`text-xs sm:text-sm leading-relaxed p-2 rounded-xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-100 border-l-4 border-amber-500 font-bold text-amber-950 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sentence}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PARENT RECORDING STUDIO (Record full story for child) */}
          {activeTab === 'record' && (
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-teal-100 mb-2 text-center">
              <span className="text-xs font-bold text-teal-900 block mb-1">
                {language === 'ta' ? 'உங்கள் சொந்த குரலில் கதையை வாசித்து பதிவு செய்க' : 'Read and record this story for your child:'}
              </span>
              <p className="text-[11px] text-slate-600 mb-3 bg-amber-50 p-2 rounded-xl border border-amber-200 text-left">
                📖 <strong>{storyTitle}:</strong> &quot;{storySentences[0]}&quot;
              </p>

              <button
                onClick={handleStartRealRecording}
                className={`py-2 px-5 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>
                  {isRecording
                    ? (language === 'ta' ? `பதிவாகிறது (${recordingSeconds}s)...` : `Recording (${recordingSeconds}s)...`)
                    : (language === 'ta' ? 'கதையை வாசித்து பதிவு செய்க' : 'Record Full Story')}
                </span>
              </button>

              <p className="text-[10px] text-slate-400 mt-2">
                {t.recordingOnDeviceNote}
              </p>
            </div>
          )}

          {/* List of Saved Family Voice Recordings */}
          {voiceNotes.length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block mb-1.5">
                ❤️ {language === 'ta' ? 'சேமிக்கப்பட்ட குடும்பக் கதைகள்' : 'Family Voice Recordings'} ({voiceNotes.length})
              </span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {voiceNotes.map((note) => {
                  const speaker = language === 'ta' ? note.speakerTa : note.speakerEn;
                  const title = language === 'ta' ? note.titleTa : note.titleEn;

                  return (
                    <div
                      key={note.id}
                      className="bg-white rounded-xl p-2 border border-slate-200 flex items-center justify-between text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">❤️</span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block truncate max-w-[190px]">
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
                              sounds.speak(language === 'ta' ? note.messageTa : note.messageEn, language);
                            }
                          }}
                          className="p-1.5 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-full"
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
            </div>
          )}
        </div>

        {/* Screening Note */}
        <div className="mt-2 bg-teal-100/60 rounded-xl p-1.5 text-center text-[9px] text-teal-900">
          🌱 {t.familyVoiceScreeningNote}
        </div>
      </div>
    </div>
  );
};
