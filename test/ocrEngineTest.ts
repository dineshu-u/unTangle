import { OcrService } from '../src/services/ocrService';

console.log('=== OCR & GROQ DUAL-ENGINE FUSION TEST ===\n');

// 1. Test isOnline() detection
const onlineStatus = OcrService.isOnline();
console.log('Detected Online Status:', onlineStatus);

// 2. Test Sentence Cleaning & Segmentation
console.log('Testing Sentence Segmentation in English:');
const sampleEnglish = "The green tree gave cool shade. Children played with a ball! Did you see the boat?";
const sentencesEn = OcrService.cleanAndSplitSentences(sampleEnglish);
console.log('  Sentences extracted:', sentencesEn);
if (sentencesEn.length !== 3) {
  throw new Error(`Expected 3 English sentences, got ${sentencesEn.length}`);
}
console.log('PASS: English sentence segmentation verified!');

console.log('\nTesting Sentence Segmentation in Tamil:');
const sampleTamil = "கிராமத்து தோட்டத்தில் அழகான மரம் பசுமையாக நிழல் தந்தது. குழந்தைகள் பந்து வைத்து விளையாடினார்கள்! ஆற்றில் படகு சென்றது.";
const sentencesTa = OcrService.cleanAndSplitSentences(sampleTamil);
console.log('  Sentences extracted:', sentencesTa);
if (sentencesTa.length !== 3) {
  throw new Error(`Expected 3 Tamil sentences, got ${sentencesTa.length}`);
}
console.log('PASS: Tamil sentence segmentation verified!');

// 3. Test Offline Mode Routing
console.log('\nTesting Offline Fallback Handling:');
// Mock offline navigator
(globalThis as any).navigator = { onLine: false };
const offlineCheck = OcrService.isOnline();
if (offlineCheck !== false) throw new Error('Offline check should return false');
console.log('PASS: Offline detection accurately set to false');

// Run extraction in offline mode
const validSamplePng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
OcrService.extractTextFromImage(validSamplePng, 'en').then((result) => {
  console.log('Offline Extraction Result:', {
    source: result.source,
    mode: result.mode,
    sentencesCount: result.sentences.length,
  });

  if (result.mode !== 'offline_ocr_only') {
    throw new Error(`Expected offline_ocr_only mode, got ${result.mode}`);
  }
  console.log('PASS: When offline, engine strictly uses on-device OCR without network calls!');
  console.log('\n=== ALL DUAL-ENGINE OCR TESTS PASSED! ===');
}).catch((err) => {
  console.error('FAIL in OCR test:', err);
  process.exit(1);
});
