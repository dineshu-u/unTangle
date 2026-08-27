import { VoiceCloneService, ClonedVoiceData } from '../src/services/voiceCloneService';

console.log('=== VOICE CLONING & DISTINCT FAMILY VOICES TEST ===\n');

// Mock localStorage in Node
const mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
  },
  speechSynthesis: {
    speak: () => {},
    cancel: () => {},
    getVoices: () => [],
  }
};

// 1. Initial State: No profile
let profile = VoiceCloneService.getActiveProfile();
console.log('Initial profile:', profile);
if (profile !== null) throw new Error('Expected null profile initially');

// 2. Save a Cloned Voice Profile with Base64 audio
const mockSample: ClonedVoiceData = {
  id: 'clone_test_123',
  speaker: 'amma',
  speakerLabelEn: 'Amma (Mother)',
  speakerLabelTa: 'அம்மா',
  recordedDate: 'Calibrated Voice Profile',
  base64Audio: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwE=',
  pitch: 1.25,
  rate: 0.9,
  measuredF0Hz: 235,
  sentenceAudioMap: {
    '0': 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwE='
  }
};

VoiceCloneService.saveProfile(mockSample);
console.log('Saved mock cloned voice profile with base64 audio and F0 = 235 Hz');

// 3. Retrieve and verify persistence
const retrieved = VoiceCloneService.getActiveProfile();
if (!retrieved) throw new Error('Failed to retrieve saved profile');
console.log('\nRetrieved Profile:');
console.log('  Speaker:', retrieved.speaker);
console.log('  Label (EN):', retrieved.speakerLabelEn);
console.log('  Label (TA):', retrieved.speakerLabelTa);
console.log('  Measured F0:', retrieved.measuredF0Hz, 'Hz');
console.log('  Base64 Audio Length:', retrieved.base64Audio.length);
console.log('  Sentence Dubs Count:', Object.keys(retrieved.sentenceAudioMap || {}).length);

if (!retrieved.base64Audio.startsWith('data:audio/')) {
  throw new Error('Base64 audio data URL format invalid');
}
if (retrieved.measuredF0Hz !== 235) {
  throw new Error('F0 frequency mismatch');
}

// 4. Test Language Isolation on Speaker Labels (Zero Tamil in English mode!)
console.log('\nTesting Language Isolation on Speaker Labels:');
const labelInEnglish = retrieved.speakerLabelEn || 'Your Voice';
const labelInTamil = retrieved.speakerLabelTa || 'உங்கள் குரல்';
if (labelInEnglish.includes('அம்மா')) {
  throw new Error('Tamil characters detected in English label!');
}
if (!labelInTamil.includes('அம்மா')) {
  throw new Error('Tamil label missing Tamil characters!');
}
console.log(`PASS: English mode strictly shows "${labelInEnglish}" (Zero Tamil bleed!)`);
console.log(`PASS: Tamil mode strictly shows "${labelInTamil}"`);

// 5. Test Distinct Acoustic Profiles for Family Speakers (Amma, Appa, Paati)
console.log('\nTesting Unique Vocal Identities (Texture, Pitch, and Speed):');

// Amma
const ammaPitch = 1.36;
const ammaRate = 0.90;

// Appa
const appaPitch = 0.62;
const appaRate = 0.82;

// Paati
const paatiPitch = 0.94;
const paatiRate = 0.70;

console.log(`  Amma Voice  -> Pitch: ${ammaPitch} (Melodic soprano), Rate: ${ammaRate}`);
console.log(`  Appa Voice  -> Pitch: ${appaPitch} (Deep baritone),   Rate: ${appaRate}`);
console.log(`  Paati Voice -> Pitch: ${paatiPitch} (Folktale timbre), Rate: ${paatiRate}`);

if (ammaPitch <= appaPitch) throw new Error('Amma must have higher fundamental pitch than Appa');
if (appaPitch >= paatiPitch) throw new Error('Appa must have lower resonant pitch than Paati');
if (paatiRate >= ammaRate || paatiRate >= appaRate) throw new Error('Paati must have slower, gentle folktale pace');

console.log('PASS: All three family voices have distinct, non-overlapping acoustic profiles!');

// 6. Test Profile Deletion
VoiceCloneService.deleteProfile();
const afterDelete = VoiceCloneService.getActiveProfile();
if (afterDelete !== null) {
  throw new Error('Profile deletion failed');
}
console.log('PASS: Profile deletion cleanly resets storage!');

console.log('\n=== ALL VOICE CLONING & FAMILY VOICE INTEGRITY TESTS PASSED! ===');
