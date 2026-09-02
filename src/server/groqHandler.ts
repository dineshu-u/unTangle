import type { IncomingMessage, ServerResponse } from 'http';

interface MindyServerPayload {
  language: 'en' | 'ta';
  activityType: string;
  contentId: string;
  outcome: 'success' | 'retry' | 'neutral';
  context?: {
    emotion?: string;
    childName?: string;
    word?: string;
    letter?: string;
  };
}

export async function handleMindyGroqRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', (chunk: Buffer | string) => {
    body += chunk;
  });

  req.on('end', async () => {
    res.setHeader('Content-Type', 'application/json');

    try {
      const payload: MindyServerPayload = JSON.parse(body);
      const { language, activityType, outcome, context } = payload;
      const apiKey = typeof process !== 'undefined' ? process.env.GROQ_API_KEY : undefined;

      // If no Groq API key is set on the server, return server-side deterministic response
      if (!apiKey || apiKey.trim() === '') {
        const fallback = getDeterministicServerResponse(language, activityType, outcome);
        res.statusCode = 200;
        res.end(JSON.stringify(fallback));
        return;
      }

      // Groq Chat Completions request
      const isTa = language === 'ta';
      const promptLang = isTa ? 'Tamil (தமிழ்)' : 'English';
      const systemPrompt = `You are Mindy, an affectionate and playful little blue bird companion living in the Untangle storybook learning village.
Your audience is a 5-7 year old child named ${context?.childName || 'Aarav'}.
STRICT RULES:
1. Respond ONLY in the requested language: ${promptLang}. Do NOT mix languages or include English transliteration in Tamil, or Tamil in English.
2. Be encouraging, warm, brief (1-2 child-friendly sentences), and cheerful.
3. NEVER make diagnostic statements, never mention dyslexia, screening scores, risk, or medical terms.
4. Output MUST be valid JSON matching this exact structure:
{
  "message": "your brief speech message here",
  "emotion": "happy" | "excited" | "confused" | "thinking" | "encouraging" | "celebrating",
  "suggestedAction": "continue" | "retry" | "explore" | "practice"
}`;

      const userPrompt = `Event: Activity "${activityType}" completed with outcome "${outcome}". Context: ${JSON.stringify(context || {})}. Please provide Mindy's cheerful reaction.`;

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!groqResponse.ok) {
        const fallback = getDeterministicServerResponse(language, activityType, outcome);
        res.statusCode = 200;
        res.end(JSON.stringify(fallback));
        return;
      }

      const groqData = (await groqResponse.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = groqData.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.message && parsed.emotion) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            message: parsed.message,
            emotion: parsed.emotion,
            suggestedAction: parsed.suggestedAction || (outcome === 'success' ? 'continue' : 'retry'),
          }));
          return;
        }
      }

      // Safe fallback
      res.statusCode = 200;
      res.end(JSON.stringify(getDeterministicServerResponse(language, activityType, outcome)));
    } catch {
      // Offline or network error: return safe fallback
      res.statusCode = 200;
      res.end(JSON.stringify({
        message: 'Hello friend! Let us have fun exploring our village!',
        emotion: 'happy',
        suggestedAction: 'explore',
      }));
    }
  });
}

function getDeterministicServerResponse(language: 'en' | 'ta', activityType: string, outcome: string) {
  const isTa = language === 'ta';
  const isSuccess = outcome === 'success';

  if (activityType === 'word_kite') {
    return {
      message: isTa
        ? (isSuccess ? 'அற்புதம்! பட்டம் வானத்தில் அழகாக பறக்கிறது!' : 'காற்றாடிக்கு தலை சுற்றுகிறது! மீண்டும் முயற்சி செய்வோமா?')
        : (isSuccess ? 'Look at your kite soar high into the bright sky!' : 'The kite got a little dizzy! Let us rearrange the tiles!'),
      emotion: isSuccess ? 'celebrating' : 'encouraging',
      suggestedAction: isSuccess ? 'continue' : 'retry',
    };
  }

  if (activityType === 'teach_mindy') {
    return {
      message: isTa
        ? 'நன்றி! நீங்கள் எனக்கு மிக அருமையாக கற்றுக்கொடுத்தீர்கள்!'
        : 'Thank you! You are such a caring teacher!',
      emotion: 'celebrating',
      suggestedAction: 'continue',
    };
  }

  return {
    message: isTa
      ? 'கிராமத்து தோட்டத்தில் புதிய சாகசங்களை தொடர்ந்து ஆராய்வோம்!'
      : 'Let us keep exploring wonderful adventures together in our village!',
    emotion: 'happy',
    suggestedAction: 'explore',
  };
}
