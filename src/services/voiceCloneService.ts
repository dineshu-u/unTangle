export interface ClonedVoiceData {
  id: string;
  speaker: 'amma' | 'appa' | 'paati';
  speakerLabelEn: string;
  speakerLabelTa: string;
  recordedDate: string;
  base64Audio: string; // Persistent Base64 audio Data URL (e.g. data:audio/webm;base64,...)
  pitch: number;
  rate: number;
  measuredF0Hz?: number;
  elevenLabsVoiceId?: string;
  sentenceAudioMap?: Record<string, string>; // Maps sentence index to custom recorded audio
}

export class VoiceCloneService {
  private static STORAGE_KEY = 'untangle_cloned_family_voice_v2';
  private static ELEVENLABS_KEY_STORAGE = 'untangle_elevenlabs_api_key';

  /**
   * Retrieves the active cloned voice profile from persistent local storage.
   */
  public static getActiveProfile(): ClonedVoiceData | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const saved = window.localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as ClonedVoiceData;
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Saves a newly calibrated or recorded family voice profile.
   */
  public static saveProfile(profile: ClonedVoiceData): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('[VoiceCloneService] Storage error:', e);
    }
  }

  /**
   * Saves recorded audio for a specific story sentence.
   * Guaranteed to persist even if a cloned profile hasn't been calibrated yet!
   */
  public static saveSentenceAudio(storyId: string, sentenceIdx: number, base64Audio: string): void {
    if (!base64Audio) return;

    let profile = this.getActiveProfile();
    if (!profile) {
      profile = {
        id: 'clone_story_' + Date.now(),
        speaker: 'amma',
        speakerLabelEn: 'Family Voice (Your Voice)',
        speakerLabelTa: 'குடும்பக் குரல் (உங்கள் குரல்)',
        recordedDate: new Date().toLocaleDateString(),
        base64Audio: base64Audio,
        pitch: 1.18,
        rate: 0.88,
        sentenceAudioMap: {},
      };
    }

    const map = profile.sentenceAudioMap || {};
    map[`${storyId}_${sentenceIdx}`] = base64Audio;
    profile.sentenceAudioMap = map;
    if (!profile.base64Audio) {
      profile.base64Audio = base64Audio;
    }
    this.saveProfile(profile);

    // Direct standalone fail-safe persistence in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(`untangle_dub_${storyId}_${sentenceIdx}`, base64Audio);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Retrieves recorded audio for a specific story sentence.
   * Checks both standalone fail-safe storage and profile map.
   */
  public static getSentenceAudio(storyId: string, sentenceIdx: number): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const directAudio = window.localStorage.getItem(`untangle_dub_${storyId}_${sentenceIdx}`);
        if (directAudio && directAudio.length > 50) {
          return directAudio;
        }
      } catch {
        // ignore
      }
    }

    const profile = this.getActiveProfile();
    if (!profile || !profile.sentenceAudioMap) return null;
    return profile.sentenceAudioMap[`${storyId}_${sentenceIdx}`] || null;
  }

  /**
   * Checks how many sentences of a story have been dubbed in the family voice.
   */
  public static getStoryDubCount(storyId: string, totalSentences: number): number {
    let count = 0;
    for (let i = 0; i < totalSentences; i++) {
      if (this.getSentenceAudio(storyId, i)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Clears the saved cloned voice profile.
   */
  public static deleteProfile(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  /**
   * Saves or retrieves ElevenLabs API key for neural cloning.
   */
  public static getElevenLabsKey(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(this.ELEVENLABS_KEY_STORAGE);
  }

  public static setElevenLabsKey(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (key.trim()) {
      window.localStorage.setItem(this.ELEVENLABS_KEY_STORAGE, key.trim());
    } else {
      window.localStorage.removeItem(this.ELEVENLABS_KEY_STORAGE);
    }
  }

  /**
   * Analyzes an audio buffer to detect the fundamental frequency (pitch F0 in Hz).
   * This ensures the acoustic profile matches the parent's real vocal pitch.
   */
  public static async analyzePitch(audioBlob: Blob): Promise<{ f0Hz: number; pitchMultiplier: number }> {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return { f0Hz: 200, pitchMultiplier: 1.0 };

      const ctx = new AudioCtx();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      // Simple autocorrelation algorithm to detect dominant vocal pitch
      let bestCorrelation = 0;
      let bestOffset = -1;
      const minOffset = Math.floor(sampleRate / 400); // Max pitch ~400 Hz
      const maxOffset = Math.floor(sampleRate / 80);  // Min pitch ~80 Hz

      const start = Math.floor(channelData.length * 0.2);
      const length = Math.min(2048, channelData.length - start - maxOffset);

      for (let offset = minOffset; offset <= maxOffset; offset++) {
        let correlation = 0;
        for (let i = 0; i < length; i++) {
          correlation += channelData[start + i] * channelData[start + i + offset];
        }
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }

      ctx.close();

      if (bestOffset > 0) {
        const f0Hz = Math.round(sampleRate / bestOffset);
        // Normalize against standard TTS pitch of ~180Hz
        const pitchMultiplier = Math.max(0.6, Math.min(1.6, f0Hz / 180));
        return { f0Hz, pitchMultiplier };
      }
    } catch {
      // ignore
    }
    return { f0Hz: 180, pitchMultiplier: 1.0 };
  }

  /**
   * Converts an audio blob into a permanent Base64 Data URL string.
   */
  public static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert audio blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Clones a voice using ElevenLabs Instant Voice Cloning API.
   * Takes the 10-second reference audio sample and returns a neural voice_id.
   */
  public static async cloneVoiceWithElevenLabs(
    apiKey: string,
    audioBlob: Blob,
    speakerName: string
  ): Promise<{ success: boolean; voiceId?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('name', `${speakerName} - Family Voice (${Date.now()})`);
      formData.append('description', 'Parent cloned voice for Untangle bedtime story recitation');
      formData.append('files', audioBlob, 'voice_sample.webm');

      const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.detail?.message || `HTTP ${res.status}: Failed to clone voice`;
        return { success: false, error: msg };
      }

      const data = await res.json();
      return { success: true, voiceId: data.voice_id };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error connecting to ElevenLabs' };
    }
  }

  /**
   * Synthesizes audio using ElevenLabs Neural Instant Voice Cloning if API key is provided.
   */
  public static async synthesizeNeuralVoice(
    text: string,
    apiKey: string,
    voiceId: string
  ): Promise<string | null> {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
          },
        }),
      });

      if (!res.ok) return null;
      const blob = await res.blob();
      return await this.blobToBase64(blob);
    } catch {
      return null;
    }
  }
}
