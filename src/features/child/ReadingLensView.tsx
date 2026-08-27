import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { OcrService } from '../../services/ocrService';
import {
  ArrowLeft,
  Volume2,
  Camera,
  Eye,
  Palette,
  Upload,
  Sparkles,
  Loader2,
  FileText,
  X,
} from 'lucide-react';

export const ReadingLensView: React.FC = () => {
  const { language, t, setCurrentScreen, contentRepo, recordLearningEvent, currentLevelWords } = useApp();
  const baseStories = contentRepo.getStories(language);

  // Dynamic Story featuring active level words
  const dynamicStory = useMemo(() => {
    const isTa = language === 'ta';
    const words = currentLevelWords.length > 0
      ? currentLevelWords.map(w => w.word)
      : (isTa ? ['மரம்', 'பந்து', 'கப்பல்'] : ['TREE', 'BALL', 'BOAT']);
    const w1 = words[0] || (isTa ? 'மரம்' : 'TREE');
    const w2 = words[1] || (isTa ? 'பந்து' : 'BALL');
    const w3 = words[2] || (isTa ? 'கப்பல்' : 'BOAT');

    if (isTa) {
      return {
        id: 'story_dyn_ta',
        language: 'ta' as const,
        title: 'ஆரவ்வின் புதிய கிராமத்து கதை',
        illustration: '🌟📖',
        difficulty: 2,
        sentences: [
          `கிராமத்து தோட்டத்தில் அழகான ${w1} பசுமையாக குளிர்ந்த நிழல் தந்தது.`,
          `அங்கு நண்பர்கள் வண்ண ${w2} வைத்து உற்சாகமாக விளையாடினார்கள்.`,
          `நீல ஆற்றில் ஒரு சிறிய ${w3} மெல்ல மிதந்து சென்றது.`,
          `மிண்டி பறவை பாடியது: புதிய சொற்களை கற்கும்போது உலகம் மிகவும் அழகாகிறது!`
        ]
      };
    } else {
      return {
        id: 'story_dyn_en',
        language: 'en' as const,
        title: "Aarav's Dynamic Adventure",
        illustration: '🌟📖',
        difficulty: 2,
        sentences: [
          `In the warm village garden, the green ${w1} gave cool and welcoming shade.`,
          `The children bounced their bright ${w2} across the soft meadow grass.`,
          `By the sparkling stream, a cheerful ${w3} drifted on the gentle current.`,
          `Mindy chirped: Reading new words opens magical doors to wonderful stories!`
        ]
      };
    }
  }, [currentLevelWords, language]);

  // OCR Extracted Custom Story Card State
  const [ocrStory, setOcrStory] = useState<{
    id: string;
    title: string;
    illustration: string;
    sentences: string[];
    source: string;
  } | null>(null);

  const allStories = useMemo(() => {
    const list: Array<{ id: string; title: string; illustration: string; sentences: string[]; source?: string }> = [
      ...baseStories.map(s => ({ ...s, sentences: s.sentences })),
      dynamicStory,
    ];
    if (ocrStory) {
      list.unshift(ocrStory);
    }
    return list;
  }, [baseStories, dynamicStory, ocrStory]);

  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);
  const [rulerColor, setRulerColor] = useState<'yellow' | 'cyan' | 'mint' | 'none'>('yellow');
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(0);
  const [isBionic, setIsBionic] = useState(true);

  // Real Camera Scanner State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const story = allStories[selectedStoryIdx % allStories.length];
  const sentences = story ? story.sentences : [];
  const storyTitle = story ? story.title : '';

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Camera access not supported on this browser.');
      }
    } catch {
      setCameraError('Camera permission denied or camera unavailable. You can still upload a picture or test sample cards!');
    }
  }, []);

  // Start live camera stream when modal opens
  useEffect(() => {
    if (isCameraModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraModalOpen, startCamera, stopCamera]);

  // Capture photo from live video feed and run OCR
  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    sounds.playTap();
    setIsScanning(true);
    setScanStatus('Capturing book page...');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    await processOcrImage(dataUrl);
  };

  // Handle uploaded file from gallery/disk
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playTap();
    setIsScanning(true);
    setScanStatus('Reading image file...');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await processOcrImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Process OCR on image data URL
  const processOcrImage = async (dataUrl: string) => {
    try {
      const result = await OcrService.extractTextFromImage(dataUrl, language, (status) => {
        setScanStatus(status);
      });

      sounds.playCelebration();

      // Create new extracted story card
      const newCard = {
        id: `ocr_extracted_${Date.now()}`,
        title: language === 'ta' ? '📸 ஸ்கேன் செய்த புத்தகப் பக்கம்' : '📸 Scanned Book Page',
        illustration: '📖🔍',
        sentences: result.sentences,
        source: result.source === 'groq_vision' ? 'AI Vision' : 'OCR Engine',
      };

      setOcrStory(newCard);
      setSelectedStoryIdx(0);
      setActiveLineIdx(0);
      setIsCameraModalOpen(false);
      setIsScanning(false);

      recordLearningEvent({
        activityType: 'reading_lens',
        contentId: newCard.id,
        eventType: 'story_read',
        outcome: 'success',
        metadata: { wordCount: result.text.split(' ').length, source: result.source },
      });
    } catch {
      setIsScanning(false);
      setScanStatus('Could not read text. Please try again with good lighting.');
    }
  };

  // Load sample book card for immediate testing
  const handleLoadSampleCard = async (sampleType: 'sample_story' | 'classroom_card') => {
    sounds.playTap();
    setIsScanning(true);
    setScanStatus('Extracting sample card...');

    setTimeout(() => {
      const isTa = language === 'ta';
      const sampleSentences = sampleType === 'sample_story'
        ? (isTa
            ? [
                'ஆலமரத்தின் அடியில் அமர்ந்து அணில் பழங்களை ருசித்து உண்டது.',
                'வானில் வண்ணக் காற்றாடி மேகங்களுக்கு மேலே அழகாக பறந்தது.',
                'குழந்தைகள் கைகளை தட்டி தாளத்தோடு புதிய சொற்களை படித்தார்கள்.',
                'அன்பும் முயற்சியும் இருந்தால் நாம் படிக்கும் ஒவ்வொரு பாடமும் எளிதாகும்.'
              ]
            : [
                'The little squirrel sat under the banyan tree enjoying sweet acorns.',
                'High above the village houses, a bright yellow kite danced in the clouds.',
                'Children clapped rhythmically to blend the letters into cheerful words.',
                'With patience and courage, every story becomes a wonderful journey.'
              ])
        : (isTa
            ? [
                'வகுப்பறை அட்டை எண் 4: எழுத்துக்கள் மற்றும் சொற்கள்.',
                'மரம் நிழல் தரும், கப்பல் கடலில் செல்லும், பந்து துள்ளி விளையாடும்.',
                'சரியான எழுத்துக்களை இணைத்து வாசிப்பு சரளத்தை வளர்ப்போம்.'
              ]
            : [
                'Classroom Reading Card 4: Sight Words and Blends.',
                'Trees give sweet shade, boats glide on water, and balls bounce high.',
                'Linking sounds to letters helps our eyes read smoothly and confidently.'
              ]);

      const newCard = {
        id: `sample_card_${Date.now()}`,
        title: sampleType === 'sample_story'
          ? (isTa ? '📄 வகுப்பறை கதை அட்டை (OCR)' : '📄 Classroom Story Card (OCR)')
          : (isTa ? '📄 பயிற்சி அட்டை (OCR)' : '📄 Phonics Reader Card (OCR)'),
        illustration: '📄✨',
        sentences: sampleSentences,
        source: 'Classroom Card Sample',
      };

      setOcrStory(newCard);
      setSelectedStoryIdx(0);
      setActiveLineIdx(0);
      setIsCameraModalOpen(false);
      setIsScanning(false);
      sounds.playCelebration();
    }, 600);
  };

  const handleSpeakSentence = (text: string, idx: number) => {
    sounds.playTap();
    sounds.speak(text, language);

    if (story) {
      recordLearningEvent({
        activityType: 'reading_lens',
        contentId: story.id,
        eventType: 'story_read',
        outcome: 'success',
        metadata: { lineIndex: idx },
      });
    }
  };

  // Bionic Reading formatter: Bolds first half of every word for rapid eye fixation
  const renderBionicText = (text: string) => {
    if (!isBionic) return text;
    const words = text.split(' ');
    return words.map((w, idx) => {
      if (w.length <= 1) {
        return <span key={idx} className="inline-block mr-1 font-black">{w}</span>;
      }
      const splitAt = Math.ceil(w.length / 2);
      const boldPart = w.slice(0, splitAt);
      const restPart = w.slice(splitAt);
      return (
        <span key={idx} className="inline-block mr-1">
          <span className="font-black text-slate-950">{boldPart}</span>
          <span>{restPart}</span>
        </span>
      );
    });
  };

  if (!story) return null;

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

        {/* Real Camera & OCR Scanner Trigger Button */}
        <button
          onClick={() => {
            sounds.playTap();
            setIsCameraModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xs transition-transform active:scale-95 animate-pulse"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'புத்தகம் ஸ்கேன்' : 'Scan Book (OCR)'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-3.5 shadow-md flex-1 flex flex-col justify-between">
        {/* Title Bar */}
        <div>
          <div className="flex items-center justify-between border-b border-rose-200/80 pb-2 mb-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-rose-950 flex items-center gap-1.5">
                <span>📖</span>
                <span>{t.bookCorner}</span>
              </h2>
              <p className="text-[10px] font-bold text-rose-800">
                {t.readingLensDesc}
              </p>
            </div>

            {/* Story Number Selector (with 📸 icon for OCR scanned card) */}
            <div className="flex gap-1">
              {allStories.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedStoryIdx(idx);
                    setActiveLineIdx(0);
                  }}
                  className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    selectedStoryIdx === idx
                      ? 'bg-rose-600 text-white shadow-xs scale-105'
                      : 'bg-white text-rose-800 hover:bg-rose-100'
                  }`}
                  title={s.title}
                >
                  {s.id.startsWith('ocr') ? '📸' : s.id.startsWith('story_dyn') ? '✨' : idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Assistance Controls (Ruler color & Bionic bold) */}
          <div className="bg-white/95 rounded-2xl p-2 mb-2.5 shadow-2xs border border-rose-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                <span>{t.rulerTintLabel}</span>
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setRulerColor('yellow')}
                  className={`w-5 h-5 rounded-full bg-amber-300 border-2 transition-all ${
                    rulerColor === 'yellow' ? 'border-amber-600 ring-2 ring-amber-200' : 'border-transparent'
                  }`}
                  title={t.rulerColorYellow}
                />
                <button
                  onClick={() => setRulerColor('cyan')}
                  className={`w-5 h-5 rounded-full bg-cyan-200 border-2 transition-all ${
                    rulerColor === 'cyan' ? 'border-cyan-600 ring-2 ring-cyan-200' : 'border-transparent'
                  }`}
                  title={t.rulerColorCyan}
                />
                <button
                  onClick={() => setRulerColor('mint')}
                  className={`w-5 h-5 rounded-full bg-emerald-200 border-2 transition-all ${
                    rulerColor === 'mint' ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-transparent'
                  }`}
                  title={t.rulerColorMint}
                />
                <button
                  onClick={() => setRulerColor('none')}
                  className={`w-5 h-5 rounded-full bg-slate-100 border text-[9px] font-bold text-slate-500 flex items-center justify-center ${
                    rulerColor === 'none' ? 'border-slate-600' : 'border-slate-300'
                  }`}
                  title={t.rulerColorNone}
                >
                  Ø
                </button>
              </div>
            </div>

            {/* Bionic Reading Toggle */}
            <button
              onClick={() => setIsBionic(!isBionic)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                isBionic ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{t.bionicReading} {isBionic ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Story Card Content Area with Ruler Tint & Bionic Reading */}
          <div
            className={`rounded-2xl p-3.5 shadow-xs border transition-colors ${
              rulerColor === 'yellow'
                ? 'bg-amber-50/95 border-amber-200'
                : rulerColor === 'cyan'
                ? 'bg-cyan-50/90 border-cyan-200'
                : rulerColor === 'mint'
                ? 'bg-emerald-50/90 border-emerald-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5 border-b border-black/10 pb-1.5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {storyTitle}
                </h3>
                {story.id.startsWith('ocr') && (
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    ✨ OCR Extracted • Bionic Lens Applied
                  </span>
                )}
              </div>
              <span className="text-2xl">{story.illustration}</span>
            </div>

            <div className="space-y-2">
              {sentences.map((line, idx) => {
                const isFocused = activeLineIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveLineIdx(idx)}
                    className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-start justify-between gap-2 ${
                      isFocused
                        ? 'bg-white shadow-xs border-2 border-rose-400 ring-2 ring-rose-200 scale-101'
                        : 'opacity-75 hover:opacity-100 hover:bg-white/60'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-900 font-medium flex-1">
                      {renderBionicText(line)}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeakSentence(line, idx);
                      }}
                      className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full transition-transform active:scale-90 shrink-0"
                      title={t.speakSentence}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Screening / Reading Guidance */}
        <div className="mt-2 text-center text-[10px] text-rose-900 bg-rose-100/60 p-1.5 rounded-xl border border-rose-200">
          💡 {language === 'ta'
            ? 'பயோனிக் வாசிப்பு தொடக்க எழுத்துக்களை தடிமனாக்கி கண் கவனத்தை விரைவுபடுத்த உதவுகிறது.'
            : 'Bionic fixation bolds word onsets to guide rapid reading flow without visual crowding.'}
        </div>
      </div>

      {/* REAL CAMERA SCANNING & OCR UPLOAD MODAL */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-rose-400 text-left relative flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">
                  {language === 'ta' ? 'புத்தகப் பக்க ஸ்கேனர் (OCR)' : 'Book Page Scanner (OCR)'}
                </h3>
              </div>
              <button
                onClick={() => setIsCameraModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 mb-2">
              {language === 'ta'
                ? 'உங்கள் புத்தகப் பக்கத்தை கேமராவில் படமெடுக்கவும் அல்லது பதிவேற்றவும். OCR மூலம் சொற்களைப் பிரித்து பயோனிக் வாசிப்பாக மாற்றுவோம்!'
                : 'Point camera at your book or upload a photo. OCR accurately extracts words for instant Bionic Reading!'}
            </p>

            {/* Live Camera Viewfinder or Upload Area */}
            <div className="relative h-48 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-rose-400">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Target Alignment Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

              {/* Scanning Laser Line (when OCR running) */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse top-1/2 -translate-y-1/2 pointer-events-none" />
              )}

              {/* Scanning status overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-3 text-center">
                  <Loader2 className="w-6 h-6 text-rose-400 animate-spin mb-1" />
                  <span className="text-xs font-bold text-rose-200">{scanStatus}</span>
                  <span className="text-[10px] text-slate-300 mt-1">Applying Bionic Reading...</span>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 text-white p-3 flex flex-col items-center justify-center text-center">
                  <p className="text-[11px] text-rose-300 font-semibold mb-2">{cameraError}</p>
                  <span className="text-[10px] text-slate-400">Use the Upload or Sample Card buttons below!</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Snap Photo / Upload / Sample Card */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={handleCapturePhoto}
                disabled={isScanning}
                className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'படம் எடுக்க' : 'Snap Photo'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 border border-slate-300"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>{language === 'ta' ? 'படம் பதிவேற்ற' : 'Upload Image'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Quick Test Sample Cards (Instant Verification) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                {language === 'ta' ? 'அல்லது மாதிரி அட்டையை சோதிக்க:' : 'Or test prepared classroom card:'}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleLoadSampleCard('sample_story')}
                  disabled={isScanning}
                  className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <FileText className="w-3 h-3 text-amber-600" />
                  <span>{language === 'ta' ? 'வகுப்பறை கதை' : 'Story Card'}</span>
                </button>
                <button
                  onClick={() => handleLoadSampleCard('classroom_card')}
                  disabled={isScanning}
                  className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{language === 'ta' ? 'எழுத்து அட்டை' : 'Phonics Card'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
