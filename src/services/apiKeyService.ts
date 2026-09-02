const STORAGE_KEY = 'untangle_groq_api_key';

export class ApiKeyService {
  public static getApiKey(): string | null {
    // 1. Check browser localStorage (user entered in UI)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored.trim().length > 0) {
          return stored.trim();
        }
      } catch {
        // ignore
      }
    }

    // 2. Check Vite environment variable
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const envKey = import.meta.env.VITE_GROQ_API_KEY;
      if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
        return envKey.trim();
      }
    }

    return null;
  }

  public static isEnvKeyConfigured(): boolean {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const envKey = import.meta.env.VITE_GROQ_API_KEY;
      return typeof envKey === 'string' && envKey.trim().length > 0;
    }
    return false;
  }

  public static isStorageKeyConfigured(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return typeof stored === 'string' && stored.trim().length > 0;
      } catch {
        return false;
      }
    }
    return false;
  }

  public static setApiKey(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const clean = key.trim();
        if (clean.length > 0) {
          localStorage.setItem(STORAGE_KEY, clean);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // ignore
      }
    }
  }

  public static hasApiKey(): boolean {
    const key = this.getApiKey();
    return key !== null && key.length > 0;
  }

  public static async testKey(key: string): Promise<{ success: boolean; message: string }> {
    const cleanKey = key.trim();
    if (!cleanKey) {
      return { success: false, message: 'Please enter an API key.' };
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: 'Say "OK"' }],
          max_tokens: 5,
        }),
      });

      if (res.ok) {
        return { success: true, message: 'Groq API Key is valid and connected!' };
      }

      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${res.status}: Connection failed.`;
      return { success: false, message: errMsg };
    } catch {
      return { success: false, message: 'Network error connecting to Groq API.' };
    }
  }
}
