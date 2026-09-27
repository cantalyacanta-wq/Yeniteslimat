const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  auth: {
    user: 'kuryeantalyam@gmail.com',
    pass: 'tlnsrezkaobytsvg',
  },
});

const apkUrl = 'https://www.antalyateslimat.com/downloads/Antalya-Kurye-Talep-Havuzu.apk';

function buildEmailHtml(courierName, courierEmail) {
  const displayName = courierName ? `${courierName} (${courierEmail})` : courierEmail;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antalya Kurye Mobil Uygulaması</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #022019; border-radius: 16px; overflow: hidden; border: 1px solid #059669; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
    <tr>
      <td style="background: linear-gradient(135deg, #047857 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.15); border-radius: 18px; margin-bottom: 12px; line-height: 64px; text-align: center;">
          <span style="font-size: 36px;">🚴</span>
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">Antalya Kurye Ekspres</h1>
        <p style="margin: 8px 0 0 0; font-size: 15px; color: #a7f3d0; font-weight: 500;">Kuryeler İçin Özel Android Mobil Uygulaması (APK)</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px; color: #e2e8f0;">
        <p style="font-size: 16px; margin-top: 0; color: #ffffff; font-weight: 700;">Merhaba Sayın Kuryemiz (${displayName}),</p>
        <p style="font-size: 14px; line-height: 1.7; color: #cbd5e1; margin-bottom: 24px;">
          Antalya genelindeki paket ve teslimat taleplerini anında yakalamanız için geliştirilen <strong>Antalya Kurye Android Mobil Uygulaması (v1.5.0)</strong> kullanıma sunuldu!
        </p>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px; background-color: #032d24; border: 1px solid #065f46; border-radius: 12px; margin-bottom: 10px;">
              <strong style="color: #34d399; font-size: 14px;">🔔 Ekran Kapalıyken Sesli & Titreşimli Çağrı</strong>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Telefonunuz cebinizdeyken veya ekranı kilitliyken yeni paket düştüğünde yüksek sesli siren ve titreşim ile anında uyarır.
              </p>
            </td>
          </tr>
          <tr><td style="height: 10px;"></td></tr>
          <tr>
            <td style="padding: 12px; background-color: #032d24; border: 1px solid #065f46; border-radius: 12px; margin-bottom: 10px;">
              <strong style="color: #34d399; font-size: 14px;">⚡ Üst Bildirim Çubuğu Canlı Durumu</strong>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Bildirim çubuğunda sürekli canlı kalarak arka planda kapanmaz, paket kaçırmanızı engeller.
              </p>
            </td>
          </tr>
          <tr><td style="height: 10px;"></td></tr>
          <tr>
            <td style="padding: 12px; background-color: #032d24; border: 1px solid #065f46; border-radius: 12px;">
              <strong style="color: #34d399; font-size: 14px;">🚴 Yenilenen Yeşil Bisiklet İkonu</strong>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Telefonunuzun ana ekranında kolayca fark edebileceğiniz zümrüt yeşili zemin üzerine beyaz bisiklet ikonu uygulandı.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Main CTA Button -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto 24px auto;">
          <tr>
            <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
              <a href="${apkUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                📲 Antalya Kurye APK'yı İndir (v1.5.0)
              </a>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #061e18; border: 1px solid #0f4c3a; border-radius: 12px; padding: 18px; margin-top: 24px;">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 0.5px;">📌 Kurulum Talimatları:</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #cbd5e1; line-height: 1.7;">
            <li>Yukarıdaki <strong>"APK'yı İndir"</strong> butonuna tıklayarak dosyayı telefonunuza kaydedin.</li>
            <li>İndirme tamamlandığında bildirime tıklayıp kurulumu başlatın. <em>("Bilinmeyen kaynaklar" uyarısı çıkarsa izin veriniz)</em>.</li>
            <li><strong>Önemli:</strong> Telefonunuzda uygulamanın daha önceki bir sürümü yüklüyse, imza uyuşmazlığı yaşamamak için lütfen önce eski uygulamayı kaldırıp ardından yenisini kurunuz.</li>
            <li>Uygulama açıldığında kurye bilgilerinizle oturum açıp çağrıları almaya başlayabilirsiniz.</li>
          </ol>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 20px; text-align: center;">
          Doğrudan APK Bağlantısı: <a href="${apkUrl}" style="color: #34d399; text-decoration: none; word-break: break-all;">${apkUrl}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #011410; padding: 20px 24px; text-align: center; border-top: 1px solid #064e3b;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8;">
          Antalya Şehir İçi Moto Kurye Hizmetleri • 7/24 Kesintisiz Teslimat
        </p>
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          İletişim & Destek: <a href="mailto:kuryeantalyam@gmail.com" style="color: #34d399; text-decoration: none;">kuryeantalyam@gmail.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function run() {
  const dbPath = path.join(process.cwd(), 'data', 'server-db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const courierUsers = (db.users || []).filter((u) => u.role === 'courier');
  const extraEmails = db.extraCourierEmails || [];

  const recipientMap = new Map();

  courierUsers.forEach((u) => {
    const em = (u.email || '').trim().toLowerCase();
    if (
      em &&
      em.includes('@') &&
      !em.endsWith('@example.com') &&
      !em.endsWith('@gg.com') &&
      !em.endsWith('@antalyakurye.com')
    ) {
      if (!recipientMap.has(em)) {
        recipientMap.set(em, u.name || 'Değerli Kuryemiz');
      }
    }
  });

  extraEmails.forEach((em) => {
    const clean = em.trim().toLowerCase();
    if (clean && clean.includes('@') && !recipientMap.has(clean)) {
      recipientMap.set(clean, 'Değerli Kuryemiz');
    }
  });

  if (!recipientMap.has('cantalyacanta@gmail.com')) {
    recipientMap.set('cantalyacanta@gmail.com', 'Kurye umit');
  }

  const recipients = Array.from(recipientMap.entries());
  console.log(`[DISPATCH START] Toplam ${recipients.length} kayıtlı kuryeye APK tanıtım e-postası gönderiliyor...`);

  let successCount = 0;
  let failCount = 0;
  const failedList = [];

  for (let i = 0; i < recipients.length; i++) {
    const [email, name] = recipients[i];
    const html = buildEmailHtml(name, email);

    try {
      await transporter.sendMail({
        from: '"Antalya Kurye Ekspres" <kuryeantalyam@gmail.com>',
        to: email,
        subject: 'Antalya Kurye Mobil Uygulaması (APK) Yayınlandı - Hemen İndirin 🚴',
        html,
      });

      successCount++;
      console.log(`[${i + 1}/${recipients.length}] ✅ İletildi: ${email} (${name})`);
    } catch (err) {
      failCount++;
      failedList.push({ email, error: err.message });
      console.error(`[${i + 1}/${recipients.length}] ❌ Hata (${email}):`, err.message);
    }

    // Short spacing between sends to avoid triggering spam filters
    if (i < recipients.length - 1) {
      await new Promise((r) => setTimeout(r, 180));
    }
  }

  console.log(`\n========================================`);
  console.log(`[DISPATCH COMPLETE] Gönderim Tamamlandı!`);
  console.log(`Başarılı: ${successCount}`);
  console.log(`Başarısız: ${failCount}`);
  console.log(`========================================\n`);

  // Record dispatch in email logs
  if (!Array.isArray(db.emailLogs)) db.emailLogs = [];
  db.emailLogs.unshift({
    id: `mail-apk-batch-${Date.now()}`,
    timestamp: new Date().toISOString(),
    orderId: 'APK-MASS-DISPATCH',
    trackingCode: 'APK-v1.5.0',
    recipients: recipients.map(([email]) => email),
    subject: 'Antalya Kurye Mobil Uygulaması (APK) Yayınlandı - Hemen İndirin 🚴',
    status: failCount === 0 ? 'sent' : 'sent',
    summary: `Tüm Kayıtlı Kuryelere APK Tanıtımı (${successCount} başarılı / ${failCount} başarısız)`,
  });
  if (db.emailLogs.length > 80) db.emailLogs = db.emailLogs.slice(0, 80);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  process.exit(0);
}

run().catch((err) => {
  console.error('Mass dispatch fatal error:', err);
  process.exit(1);
});
