import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MindyAvatar, ExtendedMindyMood } from './MindyAvatar';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Mic, Square, Sparkles, X, Utensils, AlertCircle } from 'lucide-react';

interface TalkingMindyCompanionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TalkingMindyCompanion: React.FC<TalkingMindyCompanionProps> = ({ isOpen, onClose }) => {
  const { language, activePlayer, setCurrentScreen } = useApp();

  const [mood, setMood] = useState<ExtendedMindyMood>('happy');
  const [speechBubble, setSpeechBubble] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTickled, setIsTickled] = useState(false);

  const recognitionRef = useRef<any>(null);
  const idleIntervalRef = useRef<number | null>(null);

  const isTa = language === 'ta';

  // Pattern detection: Check if child has repeated mistakes on a letter
  const detectedWeakPattern = React.useMemo(() => {
    if (activePlayer.recentErrors.length > 0) {
      const lastError = activePlayer.recentErrors[activePlayer.recentErrors.length - 1];
      return lastError.pattern || lastError.word;
    }
    return null;
  }, [activePlayer.recentErrors]);

  const idleTimerRef = useRef(0);

  // Initial greeting when opening Mindy companion
  useEffect(() => {
    if (isOpen) {
      idleTimerRef.current = 0;
      if (detectedWeakPattern) {
        setMood('thinking');
        const patternMsg = isTa
          ? `ம்ம்ம்... நமக்கு '${detectedWeakPattern}' எழுத்தில் கொஞ்சம் தடுமாற்றம் வருகிறது. வாருங்கள், சேர்ந்து சரிசெய்வோம்!`
          : `Hmm... we're getting stuck on '${detectedWeakPattern}' again. Let's fix it together!`;
        setSpeechBubble(patternMsg);
        sounds.speak(patternMsg, language);
      } else {
        setMood('happy');
        const greet = isTa
          ? `வணக்கம் ${activePlayer.playerName}! என்னோடு பேசலாமா அல்லது விளையாடலாமா?`
          : `Hi ${activePlayer.playerName}! Tap me, talk to me, or teach me new words!`;
        setSpeechBubble(greet);
        sounds.speak(greet, language);
      }

      // Idle sleep counter
      idleIntervalRef.current = window.setInterval(() => {
        idleTimerRef.current += 1;
        if (idleTimerRef.current >= 20) {
          setMood('sleeping');
          setSpeechBubble(isTa ? 'தூக்கம் வருகிறது... z-z-Z 💤' : 'Feeling sleepy... z-z-Z 💤');
        }
      }, 1000);
    }

    return () => {
      if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
    };
  }, [isOpen, language, activePlayer, detectedWeakPattern, isTa]);

  if (!isOpen) return null;

  const resetIdle = () => {
    idleTimerRef.current = 0;
    if (mood === 'sleeping') {
      setMood('surprised');
      sounds.playMindyChirp();
      const wakeMsg = isTa ? 'விழித்துக் கொண்டேன்! விளையாடலாம்!' : 'I am awake! Let us play!';
      setSpeechBubble(wakeMsg);
      sounds.speak(wakeMsg, language);
    }
  };

  // 👆 1. Tap & Tickle Mindy
  const handleTickleMindy = () => {
    resetIdle();
    sounds.playMindyChirp();
    sounds.triggerHaptic(40);
    setIsTickled(true);
    setMood('giggling');

    const giggleText = isTa ? 'ஹி... ஹி... கூச்சமாய் இருக்கிறது! 😄' : 'Hehe! That tickles my feathers! 😄';
    setSpeechBubble(giggleText);
    sounds.speak(giggleText, language);

    setTimeout(() => {
      setIsTickled(false);
      setMood('happy');
    }, 1500);
  };

  // 🍓 2. Feed Mindy a village fruit
  const handleFeedMindy = (fruitEmoji: string, fruitNameEn: string, fruitNameTa: string) => {
    resetIdle();
    sounds.playCelebration();
    sounds.triggerHaptic([30, 60, 90]);
    setMood('celebrating');

    confetti({ particleCount: 45, spread: 50 });

    const feedText = isTa
      ? `யாம்... யாம்! சுவையான ${fruitNameTa} ${fruitEmoji}! நன்றி ${activePlayer.playerName}!`
      : `Yum yum! Sweet delicious ${fruitNameEn} ${fruitEmoji}! Thank you ${activePlayer.playerName}!`;
    
    setSpeechBubble(feedText);
    sounds.speak(feedText, language);

    setTimeout(() => setMood('happy'), 2000);
  };

  // 🎤 3. Voice Interaction: Talking Mindy repeats/mimics the child
  const handleStartVoiceMimic = () => {
    resetIdle();
    sounds.playTap();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser fallback simulation
      setMood('surprised');
      const fallbackText = isTa
        ? 'நீங்கள் பேசியது எனக்குக் கேட்டது! நீங்கள் ரொம்ப சமத்து!'
        : 'I heard you chirp! You speak so clearly!';
      setSpeechBubble(fallbackText);
      sounds.speak(fallbackText, language);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = isTa ? 'ta-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMood('thinking');
        setSpeechBubble(isTa ? 'கேட்கிறேன்... பேசுங்கள்! 🎤' : 'Listening... speak to me! 🎤');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setIsListening(false);
        setIsSpeaking(true);
        setMood('happy');

        // Mindy repeats back with cheerful companion voice
        const mimicMessage = isTa
          ? `நீங்கள் சொன்னீர்கள்: "${spoken}"! எவ்வளவு அழகாக சொன்னீர்கள்!`
          : `You said: "${spoken}"! That sounded wonderful!`;

        setSpeechBubble(mimicMessage);
        sounds.playMindyChirp();
        sounds.speak(spoken, language);

        setTimeout(() => setIsSpeaking(false), 2500);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setMood('confused');
        setSpeechBubble(isTa ? 'சரியாக கேட்கவில்லை, மீண்டும் பேசுங்கள்!' : 'I did not quite catch that, try again!');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // 🚀 Jump to targeted practice activity when pattern is detected
  const handleJumpToPractice = () => {
    sounds.playTap();
    onClose();
    if (detectedWeakPattern) {
      setCurrentScreen('pulse_path');
    } else {
      setCurrentScreen('word_kite');
    }
  };

  // 🏆 Launch Reverse-Teaching Mode
  const handleLaunchReverseTeaching = () => {
    sounds.playTap();
    onClose();
    setCurrentScreen('mindy_house');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 rounded-3xl p-4 max-w-sm w-full shadow-2xl border-4 border-sky-300 text-center relative flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-white/80"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1 bg-white/90 border border-sky-200 rounded-full px-3 py-1 text-xs font-black text-sky-950 shadow-2xs mb-2">
            <span>🐦</span>
            <span>{isTa ? 'மிண்டி — உங்கள் கற்றல் நண்பன்' : 'Mindy — Your Talking Companion'}</span>
          </div>

          {/* Speech Bubble */}
          <div className="bg-white/95 rounded-2xl p-3 shadow-md border-2 border-sky-200 mb-3 text-center relative min-h-[58px] flex items-center justify-center">
            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
              {speechBubble}
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r-2 border-b-2 border-sky-200" />
          </div>

          {/* Interactive Mindy Avatar */}
          <div className="my-2 flex flex-col items-center justify-center">
            <div
              onClick={handleTickleMindy}
              className={`relative cursor-pointer transition-transform duration-200 active:scale-95 ${
                isTickled ? 'animate-wiggle' : ''
              }`}
              title="Tap to tickle Mindy!"
            >
              <MindyAvatar mood={mood} size="xl" speaking={isSpeaking} />
              
              {/* Tap to tickle floating badge */}
              <span className="absolute -bottom-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border-2 border-white shadow-xs animate-bounce">
                👆 {isTa ? 'தொட்டு சிரிக்க வைக்கவும்!' : 'Tap to tickle!'}
              </span>
            </div>
          </div>

          {/* 🧠 Adaptive Pattern Notice ("Let's Fix It Together!") */}
          {detectedWeakPattern && (
            <div className="mt-3 bg-amber-100/90 border border-amber-300 rounded-2xl p-2.5 text-left flex items-start gap-2 shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[11px] font-black text-amber-950 block">
                  {isTa ? `கற்றல் உதவி: '${detectedWeakPattern}'` : `Learning Support: '${detectedWeakPattern}'`}
                </span>
                <p className="text-[10px] text-amber-900 leading-tight mt-0.5">
                  {isTa
                    ? `நமக்கு '${detectedWeakPattern}' எழுத்தில் சிறு தடுமாற்றம் உள்ளது. மத்தள தாளத்தில் பயிற்சி செய்வோமா?`
                    : `We are practicing '${detectedWeakPattern}'. Shall we drum out the rhythm together?`}
                </p>
                <button
                  onClick={handleJumpToPractice}
                  className="mt-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black py-1 px-3 rounded-full shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isTa ? 'பயிற்சிக்கு செல்க! 🚀' : "Let's fix it together! 🚀"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 🍓 Feed Mindy Snacks Bar */}
          <div className="mt-3 bg-white/95 rounded-2xl p-2 border border-sky-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block mb-1.5 flex items-center justify-center gap-1">
              <Utensils className="w-3 h-3 text-amber-600" />
              <span>{isTa ? 'மிண்டிக்கு பழம் கொடுங்கள்:' : 'Feed Mindy a treat:'}</span>
            </span>
            <div className="flex justify-around gap-1">
              {[
                { emoji: '🥭', nameEn: 'Sweet Mango', nameTa: 'மாம்பழம்' },
                { emoji: '🍓', nameEn: 'Red Berry', nameTa: 'ஸ்ட்ராபெர்ரி' },
                { emoji: '🍇', nameEn: 'Juicy Grapes', nameTa: 'திராட்சை' },
                { emoji: '🍎', nameEn: 'Crunchy Apple', nameTa: 'ஆப்பிள்' },
              ].map((fruit, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFeedMindy(fruit.emoji, fruit.nameEn, fruit.nameTa)}
                  className="text-2xl p-1.5 rounded-xl hover:bg-amber-100 transition-transform active:scale-90"
                  title={fruit.nameEn}
                >
                  {fruit.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls: Voice Mimic + Reverse-Teaching Mode */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-sky-200">
          {/* 🎤 Voice Mimic Repeater */}
          <button
            onClick={handleStartVoiceMimic}
            disabled={isListening}
            className={`py-2 px-3 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            {isListening ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? (isTa ? 'கேட்கிறேன்...' : 'Listening...') : (isTa ? 'மிண்டியிடம் பேசு' : 'Talk & Repeat')}</span>
          </button>

          {/* 🏆 Reverse-Teaching Mode (Teach Mindy) */}
          <button
            onClick={handleLaunchReverseTeaching}
            className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTa ? 'மிண்டிக்கு கற்பி' : 'Teach Mindy!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
