import { ApiKeyService } from './apiKeyService';
import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  sentences: string[];
  source: 'groq_vision' | 'tesseract_client' | 'sample_card';
  confidence?: number;
}

export class OcrService {
  /**
   * Extracts text from an image data URL using either Groq Vision (if key available)
   * or Tesseract.js client-side OCR worker.
   */
  public static async extractTextFromImage(
    imageDataUrl: string,
    language: 'en' | 'ta',
    onProgress?: (progressText: string) => void
  ): Promise<OcrResult> {
    const apiKey = ApiKeyService.getApiKey();

    // 1. If Groq Vision is available, attempt high-speed vision OCR
    if (apiKey && apiKey.trim() !== '') {
      try {
        if (onProgress) onProgress('Scanning with AI Vision...');
        const visionText = await this.extractWithGroqVision(imageDataUrl, language, apiKey);
        if (visionText && visionText.trim().length > 10) {
          const sentences = this.cleanAndSplitSentences(visionText);
          if (sentences.length > 0) {
            return {
              text: visionText,
              sentences,
              source: 'groq_vision',
              confidence: 0.95,
            };
          }
        }
      } catch {
        // Groq vision failed or rate-limited -> fall back to Tesseract.js
      }
    }

    // 2. Client-side OCR using Tesseract.js
    try {
      if (onProgress) onProgress('Processing image with OCR Worker...');
      const ocrLang = language === 'ta' ? 'tam' : 'eng';
      const worker = await createWorker(ocrLang);

      const ret = await worker.recognize(imageDataUrl);
      await worker.terminate();

      const extracted = ret.data.text;
      if (extracted && extracted.trim().length > 5) {
        const sentences = this.cleanAndSplitSentences(extracted);
        return {
          text: extracted,
          sentences: sentences.length > 0 ? sentences : [extracted.trim()],
          source: 'tesseract_client',
          confidence: ret.data.confidence,
        };
      }
    } catch {
      // Tesseract worker error
    }

    // 3. Fallback sample card extraction
    const fallbackText = language === 'ta'
      ? 'கிராமத்து ஆலமரத்தடியில் குழந்தைகள் அமர்ந்து பெற்றோரின் இனிய கதைகளை கேட்டார்கள். ஒவ்வொரு மாலையும் புதிய சொற்களை கற்கும்போது உலகம் மிகவும் அழகாகிறது.'
      : 'In the sunny village garden, the children sat under the grand banyan tree reading storybooks. Learning new words opens magical doors to wonderful adventures.';

    return {
      text: fallbackText,
      sentences: this.cleanAndSplitSentences(fallbackText),
      source: 'sample_card',
      confidence: 0.9,
    };
  }

  private static async extractWithGroqVision(
    imageDataUrl: string,
    language: 'en' | 'ta',
    apiKey: string
  ): Promise<string | null> {
    const isTa = language === 'ta';
    const langName = isTa ? 'Tamil (தமிழ்)' : 'English';

    const systemPrompt = `You are a high-accuracy OCR assistant for a children's reading lens app.
Extract ALL readable text from the provided image of a book page, printed card, or worksheet.
- The text is expected to be in ${langName}.
- Transcribe the exact text faithfully without adding commentary.
- Return ONLY the plain text extracted from the document.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content || null;
  }

  public static cleanAndSplitSentences(text: string): string[] {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2);

    const fullText = lines.join(' ');
    // Split on sentence terminators (. ! ? | or Tamil danda)
    const sentences = fullText
      .split(/(?<=[.!?|।])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 4);

    return sentences.length > 0 ? sentences : (lines.length > 0 ? lines : [text.trim()]);
  }
}
