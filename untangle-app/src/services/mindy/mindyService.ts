import { MindyRequest, MindyResponse, MindyEmotion, MindySuggestedAction } from '../../domain/models/mindy';
import { LocalMindyFallback } from './localMindyFallback';

export interface IMindyService {
  getCompanionResponse(request: MindyRequest): Promise<MindyResponse>;
}

export class MindyService implements IMindyService {
  private apiEndpoint = '/api/mindy/respond';
  private requestTimeoutMs = 3500;

  public async getCompanionResponse(request: MindyRequest): Promise<MindyResponse> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        return LocalMindyFallback.getFallbackResponse(request);
      }

      const data = await response.json();
      if (this.isValidMindyResponse(data)) {
        return data as MindyResponse;
      }

      return LocalMindyFallback.getFallbackResponse(request);
    } catch {
      // Offline, timeout, network error, or backend not configured -> use deterministic local fallback
      return LocalMindyFallback.getFallbackResponse(request);
    }
  }

  private isValidMindyResponse(data: unknown): data is MindyResponse {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    const validEmotions: MindyEmotion[] = [
      'happy', 'excited', 'confused', 'thinking', 'encouraging', 'celebrating', 'curious'
    ];
    const validActions: MindySuggestedAction[] = [
      'continue', 'retry', 'explore', 'practice', 'teach_mindy', 'word_kite', 'letter_garden', 'mela'
    ];

    return (
      typeof obj.message === 'string' &&
      obj.message.trim().length > 0 &&
      typeof obj.emotion === 'string' &&
      validEmotions.includes(obj.emotion as MindyEmotion) &&
      typeof obj.suggestedAction === 'string' &&
      validActions.includes(obj.suggestedAction as MindySuggestedAction)
    );
  }
}

export const mindyService = new MindyService();
