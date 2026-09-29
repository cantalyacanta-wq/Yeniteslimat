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
    const lower = userText.toLowerCase();

    const currentState = {
      step: state?.step || 'ask_pickup',
      pickupAddress: state?.pickupAddress || '',
      pickupDistrict: state?.pickupDistrict || 'Muratpaşa',
      destAddress: state?.destAddress || '',
      destDistrict: state?.destDistrict || 'Muratpaşa',
      packageContent: state?.packageContent || '',
      phone: state?.phone || '',
      customerName: state?.customerName || 'Değerli Müşterimiz',
      estimatedPrice: state?.estimatedPrice || 150,
      estimatedDistanceKm: state?.estimatedDistanceKm || 8,
      estimatedDurationMins: state?.estimatedDurationMins || 35,
    };

    let replyText = '';
    let shouldCreateOrder = false;

    // Check cancellation
    if (lower.includes('iptal') || lower.includes('vazgeçtim') || lower.includes('kapat')) {
      return res.status(200).json({
        success: true,
        replyText: 'Talebiniz iptal edildi. Dilediğiniz zaman mikrofona dokunarak bana seslenebilirsiniz, iyi günler dilerim!',
        state: { ...currentState, step: 'ask_pickup' },
        shouldCreateOrder: false,
      });
    }

    const currentStep = currentState.step;

    // STEP 1: Pickup Address -> Ask Destination
    if (currentStep === 'ask_pickup' || currentStep === 'pickup' || currentStep === 'greeting' || !currentState.pickupAddress) {
      if (userText) {
        currentState.pickupAddress = userText;
        currentState.step = 'ask_destination';
        replyText = 'Paketiniz nereye, hangi adrese teslim edilecek?';
      } else {
        currentState.step = 'ask_pickup';
        replyText = 'Adresinize hemen kurye gönderebilirim. Paketiniz nereden, hangi mahalle veya adresten alınacak?';
      }
    }
    // STEP 2: Destination Address -> Ask Package Content
    else if (currentStep === 'ask_destination' || currentStep === 'delivery' || currentStep === 'destination' || !currentState.destAddress) {
      currentState.destAddress = userText;
      currentState.step = 'ask_package_content';
      replyText = 'Paketinizin içeriği nedir?';
    }
    // STEP 3: Package Content -> Ask Phone
    else if (currentStep === 'ask_package_content' || currentStep === 'package' || !currentState.packageContent) {
      currentState.packageContent = userText;
      currentState.step = 'ask_phone';
      replyText = 'Kuryemizin size kolayca ulaşabilmesi için telefon numaranızı söyler misiniz?';
    }
    // STEP 4: Phone Number -> Confirm
    else if (currentStep === 'ask_phone' || currentStep === 'phone' || !currentState.phone) {
      const digits = userText.replace(/\D/g, '');
      currentState.phone = digits.length >= 7 ? userText : (currentState.phone || '0500 000 00 00');
      currentState.step = 'confirm';
      replyText = `Tüm bilgilerinizi aldım. Alış: ${currentState.pickupAddress}, Teslim: ${currentState.destAddress}. Onaylıyorsanız hemen en yakın kuryemizi yönlendiriyorum, onaylıyor musunuz?`;
    }
    // STEP 5: Confirmation -> Complete Order
    else if (currentStep === 'confirm' || currentStep === 'confirmation') {
      const positiveWords = ['evet', 'onay', 'onaylıyorum', 'onayliyorum', 'tamam', 'tamamdır', 'tamamdir', 'olur', 'gönder', 'gonder', 'çağır', 'cagir', 'gelsin', 'yolla'];
      if (positiveWords.some((w) => lower.includes(w))) {
        currentState.step = 'completed';
        shouldCreateOrder = true;
        replyText = 'Siparişiniz oluşturuldu, en yakın kuryemiz hemen yönlendirildi! Sizi müşteri panelinize aktarıyorum, iyi günler dilerim.';
      } else {
        replyText = 'Anladım. Değiştirmek istediğiniz bilgiyi belirtebilir ya da sipariş için "Evet" diyebilirsiniz.';
      }
    } else {
      currentState.step = 'ask_destination';
      replyText = 'Paketiniz nereye, hangi adrese teslim edilecek?';
    }

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
