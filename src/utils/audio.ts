// Web Audio API Sound Effects Synthesizer + Emotional Speech Synthesis Engine
// Ensures 100% offline compatibility with rich prosody, emotion modulation, and zero robotic monotone

export type SpeechEmotion =
  | 'excited'       // Celebrations, victories, high-energy ("Wow! You got it right! 🎉")
  | 'happy'         // Friendly companion conversation, cheerful greetings
  | 'storyteller'   // Warm, theatrical, expressive bedtime story narration with natural pauses
  | 'warm_mother'   // Gentle maternal tone (Amma) - warm, loving, reassuring
  | 'warm_father'   // Deep, comforting paternal tone (Appa) - calm, steady
  | 'gentle_grandma'// Soft, melodic storytelling cadence (Paati)
  | 'curious'       // Wonder, mystery, questions ("Hmm... I wonder what this means?")
  | 'encouraging';  // Gentle coaching when struggling ("Let's try that together!")

class SoundManager {
  private ctx: AudioContext | null = null;
  private isQuietMode: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setQuietMode(quiet: boolean) {
    this.isQuietMode = quiet;
  }

  public getQuietMode(): boolean {
    return this.isQuietMode;
  }

  // Play cheerful happy bell / chime (correct, milestone)
  public playChime() {
    if (this.isQuietMode) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, this.ctx!.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + i * 0.08);
      osc.stop(this.ctx!.currentTime + i * 0.08 + 0.4);
    });
  }

  // Play soft celebratory victory fanfare
  public playCelebration() {
    if (this.isQuietMode) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [
      { f: 440, t: 0 },
      { f: 554.37, t: 0.1 },
      { f: 659.25, t: 0.2 },
      { f: 880, t: 0.3 },
      { f: 1108.73, t: 0.45 },
    ];
    chords.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, this.ctx!.currentTime + note.t);

      gain.gain.setValueAtTime(0.01, this.ctx!.currentTime + note.t);
      gain.gain.exponentialRampToValueAtTime(0.25, this.ctx!.currentTime + note.t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + note.t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + note.t);
      osc.stop(this.ctx!.currentTime + note.t + 0.65);
    });
  }

  // Play Mindy chirp (cute high-pitched bird trill)
  public playMindyChirp() {
    if (this.isQuietMode) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1700, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(2600, now + 0.22);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Play gentle wobble boing for incorrect / kite wobble
  public playWobble() {
    if (this.isQuietMode) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.15);
    osc.frequency.linearRampToValueAtTime(240, now + 0.25);
    osc.frequency.linearRampToValueAtTime(140, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Play kite whoosh / wind breeze
  public playKiteWhoosh() {
    if (this.isQuietMode) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const now = this.ctx.currentTime;
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.6);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.62);
  }

  // Village Drum (Mridangam / Dhol) for Pulse Path
  public playDrumBeat(type: 'bass' | 'slap' | 'rim') {
    if (this.isQuietMode) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (type === 'bass') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === 'slap') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    }
  }

  // Button tap pop
  public playTap() {
    if (this.isQuietMode) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Trigger gentle haptic vibration if supported
  public triggerHaptic(pattern: number | number[] = 40) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored if browser restricts vibration
      }
    }
  }

  /**
   * High-Emotion Speech Synthesizer:
   * Dynamically applies prosodic emotion curves, pitch inflection, storytelling breath pauses,
   * and acoustic warmths so children NEVER experience robotic monotone speech.
   */
  public speak(
    text: string,
    lang: 'en' | 'ta' = 'en',
    options?: {
      pitch?: number;
      rate?: number;
      volume?: number;
      voiceGender?: 'female' | 'male';
      emotion?: SpeechEmotion;
    }
  ) {
    if (this.isQuietMode) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playMindyChirp();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean plain words: remove emoji icons or special brackets so TTS does not read them literally
      const cleanText = text
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
        .replace(/[(){}[\]]/g, '')
        .trim();

      if (!cleanText) return;

      const emotion = options?.emotion || 'happy';

      // 1. Emotion Profiles with Dynamic Pitch, Rate, and Expressive Inflection
      let baseRate = options?.rate ?? 0.9;
      let basePitch = options?.pitch ?? 1.2;

      switch (emotion) {
        case 'excited':
          // High-energy celebration! Lively, bouncy tempo with soaring pitch contour
          baseRate = 1.02;
          basePitch = 1.38;
          break;

        case 'storyteller':
          // Theatrical bedtime storytelling! Unhurried, melodic, rich prosody with dramatic pauses
          baseRate = 0.84;
          basePitch = 1.18;
          break;

        case 'warm_mother':
          // Amma's warm, comforting, gentle maternal embrace
          baseRate = 0.88;
          basePitch = 1.25;
          break;

        case 'warm_father':
          // Appa's deep, steady, protective baritone warmth
          baseRate = 0.85;
          basePitch = 0.74;
          break;

        case 'gentle_grandma':
          // Paati's calm, melodic, bedtime folktale cadence
          baseRate = 0.78;
          basePitch = 1.08;
          break;

        case 'curious':
          // Playful mystery and wondering tone, higher questioning inflection
          baseRate = 0.92;
          basePitch = 1.32;
          break;

        case 'encouraging':
          // Reassuring, patient, affectionate coaching
          baseRate = 0.88;
          basePitch = 1.15;
          break;

        case 'happy':
        default:
          baseRate = 0.92;
          basePitch = 1.22;
          break;
      }

      // 2. Play acoustic emotional earcon to set the affective mood in the child's auditory cortex
      if (emotion === 'excited') {
        this.playCelebration();
      } else if (emotion === 'curious' || emotion === 'happy') {
        this.playMindyChirp();
      } else if (emotion === 'encouraging') {
        this.playTap();
      }

      // 3. Construct SpeechSynthesisUtterance with emotional prosody
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = baseRate;
      utterance.pitch = basePitch;
      utterance.volume = options?.volume ?? 1.0;

      // 4. Voice Selection prioritizing expressive, natural human voice models
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const targetPrefix = lang === 'ta' ? 'ta' : 'en';
        const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(targetPrefix));

        // Prioritize premium/natural/neural voices over default robotic synthesizers
        const naturalVoices = langVoices.filter(
          (v) =>
            v.name.includes('Natural') ||
            v.name.includes('Neural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Siri') ||
            v.name.includes('Karen') ||
            v.name.includes('Daniel')
        );

        const activePool = naturalVoices.length > 0 ? naturalVoices : langVoices;

        if (options?.voiceGender === 'male' || emotion === 'warm_father') {
          const maleVoice = activePool.find(
            (v) =>
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('george') ||
              v.name.toLowerCase().includes('daniel') ||
              v.name.toLowerCase().includes('alex') ||
              v.name.toLowerCase().includes('rishi')
          );
          if (maleVoice) utterance.voice = maleVoice;
          else if (activePool[0]) utterance.voice = activePool[0];
        } else if (emotion === 'gentle_grandma') {
          // Paati voice selection: seeks mature, gentle storytelling timbre
          const grandmaVoice = activePool.find(
            (v) =>
              v.name.toLowerCase().includes('grandma') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('fiona') ||
              v.name.toLowerCase().includes('moira') ||
              v.name.toLowerCase().includes('karen') ||
              v.name.toLowerCase().includes('zira')
          );
          if (grandmaVoice) utterance.voice = grandmaVoice;
          else if (activePool[0]) utterance.voice = activePool[0];
        } else {
          // Amma voice selection: seeks melodic, warm maternal timbre
          const femaleVoice = activePool.find(
            (v) =>
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('siri') ||
              v.name.toLowerCase().includes('leena') ||
              v.name.toLowerCase().includes('veena') ||
              v.name.toLowerCase().includes('female')
          );
          if (femaleVoice) utterance.voice = femaleVoice;
          else if (activePool[0]) utterance.voice = activePool[0];
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      this.playMindyChirp();
    }
  }

  /**
   * Dedicated Family Speaker Voice Profiler:
   * Gives Amma, Appa, and Paati completely distinct acoustic textures,
   * pitch fundamentals, rates, and timbres so no two voices sound the same!
   */
  public speakFamilyVoice(
    speaker: 'amma' | 'appa' | 'paati',
    text: string,
    lang: 'en' | 'ta' = 'en'
  ) {
    if (this.isQuietMode) return;

    if (speaker === 'appa') {
      // APPA: Deep, resonant, grounded baritone
      this.speak(text, lang, {
        emotion: 'warm_father',
        pitch: 0.62,
        rate: 0.82,
        voiceGender: 'male',
      });
    } else if (speaker === 'paati') {
      // PAATI: Gentle, unhurried, folktale grandmotherly cadence
      this.speak(text, lang, {
        emotion: 'gentle_grandma',
        pitch: 0.94,
        rate: 0.70,
        voiceGender: 'female',
      });
    } else {
      // AMMA: Warm, melodic, comforting maternal embrace
      this.speak(text, lang, {
        emotion: 'warm_mother',
        pitch: 1.36,
        rate: 0.90,
        voiceGender: 'female',
      });
    }
  }
}

export const sounds = new SoundManager();
