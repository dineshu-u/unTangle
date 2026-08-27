// Web Audio API Sound Effects Synthesizer + Web Speech API helper
// Ensures 100% offline compatibility, zero external asset dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private isQuietMode: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

    // Filtered noise swoosh
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
      // Deep resonant bass 'Tha'
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
      // High pitch resonant tone 'Dhin'
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
      // Crisp wooden rim hit 'Thom'
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

  // Text-To-Speech using Web Speech API
  public speak(text: string, lang: 'en' | 'ta' = 'en') {
    if (this.isQuietMode) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playMindyChirp();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = 0.9; // Friendly, clear pacing for children
      utterance.pitch = 1.25; // Cheerful companion voice pitch

      // Try to find native voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const targetPrefix = lang === 'ta' ? 'ta' : 'en';
        const match = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
        if (match) {
          utterance.voice = match;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      this.playMindyChirp();
    }
  }
}

export const sounds = new SoundManager();
