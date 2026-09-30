import nodemailer from 'nodemailer';

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
    const { email, code, orderSummary } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'E-posta ve güvenlik kodu zorunludur.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const senderUser = (process.env.SMTP_USER || process.env.GMAIL_USER || 'kuryeantalyam@gmail.com').trim();
    const senderPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'tlnsrezkaobytsvg').replace(/\s+/g, '').trim();

    const subject = `Antalya Kurye - 4 Haneli Güvenlik Kodunuz: ${cleanCode}`;
    const textContent = `Sayın Müşterimiz,\n\nMüşteri hizmetleri sesli asistanımız üzerinden oluşturduğunuz kurye talebini onaylamak için 4 haneli güvenlik kodunuz: ${cleanCode}\n\nBu kod 10 dakika süreyle geçerlidir.\n\nAntalya Şehir İçi Moto Kurye Teslimat 7/24`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #021a14; color: #f8fafc; border-radius: 16px; border: 1px solid #059669; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #34d399; margin: 0; font-size: 22px;">🛵 Antalya Kurye</h2>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">7/24 Şehir İçi Hızlı Moto Kurye Hizmeti</p>
        </div>
        <div style="background: #032d23; border: 1px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <p style="color: #a7f3d0; font-size: 14px; margin: 0 0 10px;">Sesli asistan kurye talebinizi onaylamak için 4 haneli güvenlik kodunuz:</p>
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #fbbf24; background: #011611; padding: 12px 24px; border-radius: 10px; display: inline-block; border: 2px dashed #f59e0b;">
            ${cleanCode}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0;">Bu kod 10 dakika süreyle geçerlidir.</p>
        </div>
        ${orderSummary ? `
        <div style="background: #011611; border-radius: 10px; padding: 14px; font-size: 13px; margin-bottom: 16px; color: #cbd5e1;">
          <div style="margin-bottom: 6px;"><strong style="color: #34d399;">📍 Alış:</strong> ${orderSummary.pickup || 'Belirtildi'}</div>
          <div style="margin-bottom: 6px;"><strong style="color: #fbbf24;">🏁 Teslim:</strong> ${orderSummary.destination || 'Belirtildi'}</div>
          <div><strong style="color: #a7f3d0;">💰 Ücret:</strong> ${orderSummary.price || 150} TL</div>
        </div>` : ''}
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">Bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayınız.</p>
      </div>
    `;

    const directTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: senderUser, pass: senderPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
    });

    await directTransporter.sendMail({
      from: `"Antalya Şehir İçi Teslimat 7/24" <${senderUser}>`,
      to: cleanEmail,
      replyTo: 'kuryeantalyam@gmail.com',
      subject,
      text: textContent,
      html: htmlContent,
      priority: 'high',
    });

    console.log(`[VERCEL SEND CODE REAL DISPATCH] ✅ Sent code ${cleanCode} to ${cleanEmail}`);

    return res.status(200).json({
      success: true,
      message: `${cleanEmail} adresine 4 haneli güvenlik kodu gönderildi.`,
    });
  } catch (err: any) {
    console.error('[VERCEL SEND CODE ERROR]', err?.message);
    return res.status(500).json({ error: 'Güvenlik kodu gönderilemedi: ' + err?.message });
  }
}
