import { GoogleGenAI } from '@google/genai';
import { EdgeTTS } from '@andresaya/edge-tts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawText = String(req.query?.text || '').trim();
    const voiceParam = String(req.query?.voice || '').toLowerCase();
    const voiceName = voiceParam === 'female' ? 'tr-TR-EmelNeural' : 'tr-TR-AhmetNeural';
    const pitch = '+0Hz';
    const rate = voiceParam === 'female' ? '+13%' : '+14%';

    if (!rawText) {
      return res.status(400).send('Text parameter is required');
    }

    let s = rawText;
    s = s.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    s = s.replace(/[#*•_~`]/g, '');
    s = s.replace(/\bTL\b/gi, 'lira');
    s = s.replace(/\btl\b/gi, 'lira');
    s = s.replace(/\bDk\b/gi, 'dakika');
    s = s.replace(/\bdk\b/gi, 'dakika');
    s = s.replace(/\bCad\./gi, 'Caddesi');
    s = s.replace(/\bMah\./gi, 'Mahallesi');
    s = s.replace(/\bSok\./gi, 'Sokağı');
    s = s.replace(/\bNo:\s*(\d+)/gi, 'numara $1');
    s = s.replace(/ANT-V(\d+)/gi, (_m: any, d: string) => 'A N T V ' + d.split('').join(' '));
    s = s.replace(/\s*,\s*/g, ', ');
    s = s.replace(/\s+/g, ' ');
    const cleanSpeech = s.trim();

    if (!cleanSpeech) {
      return res.status(400).send('No speakable text');
    }

    // 1. Primary: Gemini 3.8 Flash Lite TTS (Puck natural Turkish male)
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanSpeech,
                  speechMetadata: {
                    style:
                      voiceParam === 'female'
                        ? 'Warm, natural, friendly Turkish female customer service representative speaking fluently at a brisk conversational pace.'
                        : 'Warm, natural, friendly Turkish male customer service representative speaking fluently at a brisk conversational pace with natural intonation, never slow or robotic.',
                  },
                },
              ],
            },
          ] as any,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceParam === 'female' ? 'Kore' : 'Puck' },
              },
            },
          },
        });
        const parts = response.candidates?.[0]?.content?.parts || [];
        const audioPart = parts.find((p: any) => p?.inlineData?.data);
        const base64Audio = audioPart?.inlineData?.data;
        if (base64Audio) {
          const buf = Buffer.from(base64Audio, 'base64');
          res.setHeader('Content-Type', audioPart?.inlineData?.mimeType || 'audio/wav');
          res.setHeader('Content-Length', buf.length);
          res.setHeader('X-TTS-Engine', 'gemini');
          res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          return res.status(200).send(buf);
        }
      } catch (e: any) {
        console.warn('[SERVERLESS GEMINI TTS FALLBACK]', e?.message);
      }
    }

    // 2. Secondary: Edge Neural TTS (@andresaya/edge-tts AhmetNeural, +0Hz, +14%)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const tts = new EdgeTTS();
        await tts.synthesize(cleanSpeech, voiceName, {
          rate,
          pitch,
          outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
        });
        const audioBuffer = tts.toBuffer();
        if (audioBuffer && audioBuffer.length > 100) {
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', audioBuffer.length);
          res.setHeader('X-TTS-Engine', 'edge');
          res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          return res.status(200).send(audioBuffer);
        }
      } catch (e: any) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        throw e;
      }
    }

    return res.status(500).json({ error: 'TTS audio could not be generated' });
  } catch (err: any) {
    console.error('[VERCEL TTS ERROR]', err?.message);
    return res.status(500).json({ error: 'TTS audio could not be generated' });
  }
}
