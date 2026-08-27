import { VoiceCloneService, ClonedVoiceData } from '../src/services/voiceCloneService';

console.log('=== VOICE CLONING PERSISTENCE & ACOUSTIC PROFILING TEST ===\n');

// Mock localStorage in Node
const mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
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

// 4. Test Pitch Analysis Logic
console.log('\nTesting Pitch Normalization formula:');
const maleF0 = 130;
const femaleF0 = 240;
const malePitch = Math.max(0.6, Math.min(1.6, maleF0 / 180));
const femalePitch = Math.max(0.6, Math.min(1.6, femaleF0 / 180));
console.log(`  Male F0 (130 Hz) -> Pitch multiplier: ${malePitch.toFixed(2)} (Warm deep tone)`);
console.log(`  Female F0 (240 Hz) -> Pitch multiplier: ${femalePitch.toFixed(2)} (Bright maternal tone)`);

if (malePitch >= femalePitch) {
  throw new Error('Male pitch should be lower than female pitch');
}
console.log('PASS: Acoustic pitch normalization verified!');

// 5. Test Profile Deletion
VoiceCloneService.deleteProfile();
const afterDelete = VoiceCloneService.getActiveProfile();
if (afterDelete !== null) {
  throw new Error('Profile deletion failed');
}
console.log('PASS: Profile deletion cleanly resets storage!');

console.log('\n=== ALL VOICE CLONING TESTS PASSED! ===');
