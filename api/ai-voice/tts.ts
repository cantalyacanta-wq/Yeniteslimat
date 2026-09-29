import { EdgeTTS } from 'node-edge-tts';
import os from 'os';
import path from 'path';
import fs from 'fs';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawText = String(req.query?.text || '').trim();
    // Tok ve karizmatik Türkçe erkek ses tonu (Microsoft Ahmet Neural)
    const voiceName = 'tr-TR-AhmetNeural';
    const pitch = '-8Hz';
    const rate = '+6%';

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

    const tmpId = `tts_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`;
    const tmpPath = path.join(os.tmpdir(), tmpId);

    const tts = new EdgeTTS({
      voice: voiceName,
      lang: 'tr-TR',
      outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      rate,
      pitch,
      timeout: 12000,
    });

    await tts.ttsPromise(cleanSpeech, tmpPath);
    const audioBuffer = await fs.promises.readFile(tmpPath);
    fs.promises.unlink(tmpPath).catch(() => {});

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.status(200).send(audioBuffer);
  } catch (err: any) {
    console.error('[VERCEL TTS ERROR]', err?.message);
    return res.status(500).json({ error: 'TTS audio could not be generated' });
  }
}
