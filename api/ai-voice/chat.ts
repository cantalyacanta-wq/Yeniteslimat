import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (e) {
    console.debug('[GEMINI CLIENT INIT FAILED]', e);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, state } = req.body || {};
    const userText = String(message || '').trim();
    const currentState = state || {
      step: 'pickup',
      pickupAddress: '',
      deliveryAddress: '',
      packageContent: '',
      phone: '',
    };

    // Client/Server state transition logic
    let nextStep = currentState.step;
    let replyText = '';
    let shouldCreateOrder = false;

    if (currentState.step === 'pickup') {
      currentState.pickupAddress = userText;
      nextStep = 'delivery';
      replyText = 'Adresiniz kaydedildi. Paketiniz nereye, hangi adrese teslim edilecek?';
    } else if (currentState.step === 'delivery') {
      currentState.deliveryAddress = userText;
      nextStep = 'package';
      replyText = 'Teslimat adresi kaydedildi. Taşınacak paketin içeriği nedir?';
    } else if (currentState.step === 'package') {
      currentState.packageContent = userText;
      nextStep = 'phone';
      replyText = 'Kuryemizin size ulaşabilmesi için telefon numaranızı söyler misiniz?';
    } else if (currentState.step === 'phone') {
      currentState.phone = userText.replace(/\D/g, '') || userText;
      nextStep = 'confirmation';
      replyText = `Bilgileriniz alındı. Alış: ${currentState.pickupAddress}, Teslim: ${currentState.deliveryAddress}. Hemen kurye çağıralım mı?`;
    } else if (currentState.step === 'confirmation') {
      const lower = userText.toLowerCase();
      if (lower.includes('evet') || lower.includes('tamam') || lower.includes('çağır') || lower.includes('olur') || lower.includes('gönder')) {
        nextStep = 'completed';
        shouldCreateOrder = true;
        replyText = 'Kurye çağrınız oluşturuldu. Kuryemiz en kısa sürede adresinize yönlendiriliyor.';
      } else {
        replyText = 'Siparişiniz onaylanmadı. Yardımcı olmamı istediğiniz başka bir konu var mı?';
      }
    }

    currentState.step = nextStep;

    return res.status(200).json({
      success: true,
      replyText,
      state: currentState,
      shouldCreateOrder,
    });
  } catch (err: any) {
    console.error('[VERCEL CHAT ERROR]', err?.message);
    return res.status(500).json({ error: 'Chat processing failed' });
  }
}
