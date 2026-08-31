import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Storage directory & file setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'server-db.json');

// Default initial state
const DEFAULT_USERS = [
  {
    id: 'user-guest-01',
    name: 'Misafir Müşteri',
    phone: '',
    email: '',
    password: '',
    role: 'customer',
    district: 'Muratpaşa',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-admin-01',
    name: 'Antalya Kurye Yönetim',
    phone: '0532 000 00 00',
    email: 'kuryeantalyam@gmail.com',
    password: 'admin',
    role: 'admin',
    companyName: 'Antalya Kurye Express',
    district: 'Muratpaşa',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-courier-01',
    name: 'Ahmet Yılmaz (Kurye)',
    phone: '0544 111 22 33',
    email: 'ahmet@antalyakurye.com',
    password: '123',
    role: 'courier',
    district: 'Muratpaşa',
    createdAt: '2026-01-02T00:00:00.000Z',
    totalOrders: 14,
    totalEarnings: 3200,
    isOnline: true,
  },
  {
    id: 'user-courier-02',
    name: 'Mustafa Demir (Kurye)',
    phone: '0555 222 33 44',
    email: 'mustafa@antalyakurye.com',
    password: '123',
    role: 'courier',
    district: 'Konyaaltı',
    createdAt: '2026-01-03T00:00:00.000Z',
    totalOrders: 9,
    totalEarnings: 2150,
    isOnline: true,
  },
  {
    id: 'user-customer-sample-1',
    name: 'Deniz Akdeniz (Müşteri)',
    phone: '0533 123 45 67',
    email: 'deniz@antalya.com',
    password: '123',
    role: 'customer',
    district: 'Muratpaşa',
    createdAt: '2026-01-04T00:00:00.000Z',
  },
];

const DEFAULT_COURIERS = [
  {
    id: 'user-courier-01',
    name: 'Ahmet Yılmaz (Kurye)',
    phone: '0544 111 22 33',
    email: 'ahmet@antalyakurye.com',
    district: 'Muratpaşa',
    rating: 4.95,
    totalDeliveries: 14,
    currentLat: 36.8860,
    currentLng: 30.7065,
  },
  {
    id: 'user-courier-02',
    name: 'Mustafa Demir (Kurye)',
    phone: '0555 222 33 44',
    email: 'mustafa@antalyakurye.com',
    district: 'Konyaaltı',
    rating: 4.88,
    totalDeliveries: 9,
    currentLat: 36.8732,
    currentLng: 30.6384,
  },
];

interface EmailLogItem {
  id: string;
  timestamp: string;
  orderId?: string;
  trackingCode?: string;
  recipients: string[];
  subject: string;
  status: 'sent' | 'simulated' | 'failed';
  error?: string;
  summary: string;
}

interface ServerDatabase {
  users: any[];
  couriers: any[];
  requests: any[];
  emailLogs?: EmailLogItem[];
  updatedAt: string;
}

let dbState: ServerDatabase = {
  users: DEFAULT_USERS,
  couriers: DEFAULT_COURIERS,
  requests: [],
  emailLogs: [],
  updatedAt: new Date().toISOString(),
};

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

function loadDatabase() {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.requests)) {
        // Ensure standard system accounts always exist
        const userMap = new Map();
        DEFAULT_USERS.forEach((u) => userMap.set(u.id, u));
        parsed.users.forEach((u: any) => userMap.set(u.id, { ...(userMap.get(u.id) || {}), ...u }));

        const courierMap = new Map();
        DEFAULT_COURIERS.forEach((c) => courierMap.set(c.id, c));
        if (Array.isArray(parsed.couriers)) {
          parsed.couriers.forEach((c: any) => courierMap.set(c.id, { ...(courierMap.get(c.id) || {}), ...c }));
        }

        // Clean out any old mock requests
        const cleanRequests = parsed.requests.filter((r: any) => r && r.id && !String(r.id).startsWith('req-sample-'));

        dbState = {
          users: Array.from(userMap.values()),
          couriers: Array.from(courierMap.values()),
          requests: cleanRequests,
          emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
        console.log(`[DB] Database loaded successfully: ${dbState.requests.length} requests, ${dbState.users.length} users, ${dbState.emailLogs?.length || 0} email logs`);
        return;
      }
    }
  } catch (err) {
    console.warn('[DB] Failed to load database file, using default state:', err);
  }
  saveDatabase();
}

function saveDatabase() {
  ensureDataDir();
  try {
    dbState.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save database to disk:', err);
  }
}

// Initial DB load
loadDatabase();

// ==========================================
// EMAIL NOTIFICATION SYSTEM FOR COURIERS
// ==========================================

function getRegisteredCourierEmails(): string[] {
  const emails = new Set<string>();

  // Management & dispatcher email for real-time dispatch alerts
  emails.add('kuryeantalyam@gmail.com');

  // Add all users with role 'courier' or 'admin' who have a valid email
  if (Array.isArray(dbState.users)) {
    dbState.users
      .filter((u) => (u.role === 'courier' || u.role === 'admin') && u.email && u.email.includes('@'))
      .forEach((u) => emails.add(u.email.trim().toLowerCase()));
  }

  // Add all items in couriers list who have a valid email
  if (Array.isArray(dbState.couriers)) {
    dbState.couriers
      .filter((c) => c.email && c.email.includes('@'))
      .forEach((c) => emails.add(c.email.trim().toLowerCase()));
  }

  // Ensure default registered couriers are included
  emails.add('ahmet@antalyakurye.com');
  emails.add('mustafa@antalyakurye.com');

  return Array.from(emails);
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

async function sendNewOrderEmailToCouriers(order: any) {
  try {
    const recipients = getRegisteredCourierEmails();
    if (recipients.length === 0) {
      console.log('[EMAIL] No courier email addresses registered.');
      return { success: false, recipients: [] };
    }

    const trackingCode = order.trackingCode || order.id || 'ANT-0000';
    const senderDist = order.sender?.district || 'Antalya';
    const senderAddr = order.sender?.address || '';
    const senderContact = `${order.sender?.contactName || 'Gönderici'} (${order.sender?.phone || ''})`;
    const receiverDist = order.receiver?.district || 'Antalya';
    const receiverAddr = order.receiver?.address || '';
    const receiverContact = `${order.receiver?.contactName || 'Alıcı'} (${order.receiver?.phone || ''})`;
    const price = order.price || 0;
    const courierEarnings = order.courierEarnings || Math.round(price * 0.85);
    const pkgName = order.packageName || 'Paket / Koli';
    const paymentMethod = order.paymentMethod || 'gonderici_odemeli';
    const isAliciOdemeli = paymentMethod === 'alici_odemeli';

    const subject = `⚡ [YENİ PAKET TALEBİ] ${senderDist} ➔ ${receiverDist} | ${price} ₺ (${isAliciOdemeli ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'})`;
    const poolUrl = 'https://www.antalyateslimat.com/pakettalebi';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Paket Talebi</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #011410; color: #ffffff; margin: 0; padding: 16px;">
  <div style="max-width: 600px; margin: 0 auto; background: #021f19; border: 1px solid #059669; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #047857, #065f46); padding: 24px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">🛵 ANTALYA ŞEHİR İÇİ TESLİMAT</h1>
      <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Canlı Kurye Havuzuna Yeni Paket Çağrısı Düştü!</p>
    </div>

    <!-- Content Body -->
    <div style="padding: 24px 20px;">
      
      <!-- Tracking Badge -->
      <div style="background: #011410; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Sipariş Takip Kodu</div>
        <div style="font-size: 20px; color: #f59e0b; font-weight: 900; margin-top: 2px;">#${trackingCode}</div>
        <div style="font-size: 13px; color: #d1fae5; margin-top: 4px;">Paket İçeriği: <strong style="color:#ffffff;">${pkgName}</strong></div>
      </div>

      <!-- Route Details -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #022b22; border-radius: 12px; overflow: hidden; border: 1px solid #065f46;">
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #064e3b; vertical-align: top; width: 50%;">
            <div style="font-size: 11px; color: #34d399; font-weight: bold; text-transform: uppercase;">📍 1. ALIŞ NOKTASI (GÖNDERİCİ)</div>
            <div style="font-size: 16px; color: #ffffff; font-weight: bold; margin-top: 3px;">${senderDist}</div>
            <div style="font-size: 12px; color: #cbd5e1; margin-top: 3px; line-height: 1.4;">${senderAddr}</div>
            <div style="font-size: 11px; color: #6ee7b7; margin-top: 5px;">👤 ${senderContact}</div>
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #064e3b; vertical-align: top; width: 50%;">
            <div style="font-size: 11px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">🎯 2. TESLİMAT NOKTASI (ALICI)</div>
            <div style="font-size: 16px; color: #ffffff; font-weight: bold; margin-top: 3px;">${receiverDist}</div>
            <div style="font-size: 12px; color: #cbd5e1; margin-top: 3px; line-height: 1.4;">${receiverAddr}</div>
            <div style="font-size: 11px; color: #fde68a; margin-top: 5px;">👤 ${receiverContact}</div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 14px 16px; background: #011b15;">
            <table style="width: 100%;">
              <tr>
                <td>
                  <span style="font-size: 12px; color: #9ca3af;">Müşteri Ücreti:</span>
                  <strong style="font-size: 15px; color: #ffffff; margin-left: 6px;">${price} ₺</strong>
                </td>
                <td style="text-align: right;">
                  <span style="font-size: 12px; color: #9ca3af;">Net Kurye Kazancı:</span>
                  <strong style="font-size: 18px; color: #10b981; margin-left: 6px;">+${courierEarnings} ₺</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Payment Alert Box -->
      ${
        isAliciOdemeli
          ? `<div style="background: #450a0a; border: 1.5px solid #ef4444; border-radius: 10px; padding: 14px 16px; margin-bottom: 22px; color: #fecaca;">
              <strong style="color: #ffffff; font-size: 13px; display: block;">🔴 ÖNEMLİ: ALICI ÖDEMELİ SİPARİŞ</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.5; color: #fee2e2;">
                Paketi adresten teslim alırken göndericiden ücret almayınız. Paketi alıcıya teslim ederken alıcıdan <strong>${price} ₺</strong> tutarındaki ödemeyi tahsil etmeyi <u>unutmayınız</u>.
              </p>
            </div>`
          : `<div style="background: #14532d; border: 1.5px solid #22c55e; border-radius: 10px; padding: 14px 16px; margin-bottom: 22px; color: #bbf7d0;">
              <strong style="color: #ffffff; font-size: 13px; display: block;">🟢 GÖNDERİCİ ÖDEMELİ SİPARİŞ</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.5; color: #dcfce7;">
                Paketi adresten teslim alırken göndericiden <strong>${price} ₺</strong> ücret tahsilatını kontrol ediniz. Alıcıya teslim ederken alıcıdan ücret talep etmeyiniz.
              </p>
            </div>`
      }

      <!-- Direct Action CTA Button -->
      <div style="text-align: center; margin: 24px 0 16px 0;">
        <a href="${poolUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 15px; font-weight: 800; border-radius: 12px; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          ⚡ Havuzdan İşi Kabul Et (${poolUrl})
        </a>
      </div>

      <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 14px; line-height: 1.4;">
        Bu bildirim Antalya Kurye sisteminde kayıtlı kurye e-posta adreslerine (${recipients.join(', ')}) otomatik olarak iletilmiştir.
      </p>

    </div>

    <!-- Footer -->
    <div style="background: #011410; padding: 14px 20px; text-align: center; border-top: 1px solid #064e3b;">
      <span style="font-size: 11px; color: #10b981; font-weight: bold;">© 2026 Antalya Şehir İçi Teslimat 7/24 • Jet Moto Kurye</span>
    </div>

  </div>
</body>
</html>
    `;

    const transporter = getMailTransporter();
    let emailStatus: 'sent' | 'simulated' | 'failed' = 'simulated';
    let errorMessage: string | undefined;

    if (transporter) {
      try {
        const fromAddress = process.env.SMTP_FROM || 'Antalya Şehir İçi Teslimat <bildirim@antalyateslimat.com>';
        await transporter.sendMail({
          from: fromAddress,
          to: recipients.join(', '),
          subject,
          html: htmlContent,
        });
        emailStatus = 'sent';
        console.log(`[EMAIL SMTP SENT] New order notification sent to ${recipients.length} couriers.`);
      } catch (smtpErr: any) {
        console.warn('[EMAIL SMTP ERROR] Failed sending via SMTP, logged as simulated:', smtpErr.message);
        emailStatus = 'simulated';
        errorMessage = smtpErr.message;
      }
    } else {
      console.log(`[EMAIL DISPATCH] Dispatched to ${recipients.length} registered couriers: ${recipients.join(', ')}`);
      emailStatus = 'simulated';
    }

    const logEntry: EmailLogItem = {
      id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      orderId: order.id,
      trackingCode,
      recipients,
      subject,
      status: emailStatus,
      error: errorMessage,
      summary: `${senderDist} ➔ ${receiverDist} (${price} ₺, ${pkgName})`,
    };

    if (!Array.isArray(dbState.emailLogs)) {
      dbState.emailLogs = [];
    }
    dbState.emailLogs.unshift(logEntry);
    if (dbState.emailLogs.length > 100) {
      dbState.emailLogs = dbState.emailLogs.slice(0, 100);
    }
    saveDatabase();

    return { success: true, log: logEntry, recipients };
  } catch (err: any) {
    console.error('[EMAIL DISPATCH EXCEPTION]', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), requestsCount: dbState.requests.length });
});

// Full Sync (Used by all clients for real-time polling across any device)
app.get('/api/sync', (req, res) => {
  res.json({
    success: true,
    requests: dbState.requests,
    users: dbState.users,
    couriers: dbState.couriers,
    updatedAt: dbState.updatedAt,
  });
});

// Create new customer delivery request
app.post('/api/requests', (req, res) => {
  try {
    const newRequest = req.body;
    if (!newRequest || !newRequest.id || !newRequest.sender || !newRequest.receiver) {
      res.status(400).json({ error: 'Geçersiz talep parametreleri' });
      return;
    }

    // Ensure status is pending_pool for new order
    if (!newRequest.status) {
      newRequest.status = 'pending_pool';
    }
    if (!newRequest.createdAt) {
      newRequest.createdAt = new Date().toISOString();
    }
    newRequest.updatedAt = new Date().toISOString();

    // Check if duplicate ID exists
    const existingIndex = dbState.requests.findIndex((r) => r.id === newRequest.id);
    if (existingIndex >= 0) {
      dbState.requests[existingIndex] = newRequest;
    } else {
      dbState.requests.unshift(newRequest);
    }

    // If sender user exists, increment order count
    if (newRequest.senderUserId) {
      const user = dbState.users.find((u) => u.id === newRequest.senderUserId);
      if (user) {
        user.totalOrders = (user.totalOrders || 0) + 1;
      }
    }

    saveDatabase();
    console.log(`[ORDER CREATED] ID: ${newRequest.id}, Tracking: ${newRequest.trackingCode}, Price: ${newRequest.price} TL`);

    // ASYNCHRONOUSLY DISPATCH EMAIL NOTIFICATIONS TO ALL REGISTERED COURIERS
    sendNewOrderEmailToCouriers(newRequest).catch((mailErr) => {
      console.error('[EMAIL ERROR ON REQUEST CREATE]', mailErr);
    });

    res.json({ success: true, request: newRequest });
  } catch (err: any) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Email Logs Endpoint
app.get('/api/email-logs', (req, res) => {
  res.json({
    success: true,
    emailLogs: dbState.emailLogs || [],
    courierRecipients: getRegisteredCourierEmails(),
  });
});

// Test Email Dispatch Endpoint
app.post('/api/notifications/test-email', async (req, res) => {
  try {
    const sampleOrder = {
      id: `req-test-${Date.now()}`,
      trackingCode: `ANT-${Math.floor(1000 + Math.random() * 9000)}`,
      packageName: 'Örnek Test Paketi (Elektronik & Belge)',
      price: 250,
      courierEarnings: 215,
      paymentMethod: 'alici_odemeli',
      sender: {
        district: 'Muratpaşa',
        address: 'Işıklar Cad. No:45/B',
        contactName: 'Antalya Test Gönderici',
        phone: '0532 000 11 22',
      },
      receiver: {
        district: 'Konyaaltı',
        address: 'Gürsu Mah. 304. Sok. No:12',
        contactName: 'Antalya Test Alıcı',
        phone: '0544 333 44 55',
      },
    };

    const result = await sendNewOrderEmailToCouriers(sampleOrder);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manual Resend / Specific Order Email Dispatch
app.post('/api/notifications/send-order-email', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = dbState.requests.find((r) => r.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' });
      return;
    }
    const result = await sendNewOrderEmailToCouriers(order);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing request (status, courier, rating, notes, etc.)
app.patch('/api/requests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const reqIndex = dbState.requests.findIndex((r) => r.id === id);

    if (reqIndex === -1) {
      res.status(404).json({ error: 'Talep bulunamadı' });
      return;
    }

    const current = dbState.requests[reqIndex];
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If marked delivered, update courier stats
    if (updates.status === 'delivered' && current.status !== 'delivered') {
      if (updated.assignedCourier?.id) {
        const courierUser = dbState.users.find((u) => u.id === updated.assignedCourier.id);
        if (courierUser) {
          courierUser.totalOrders = (courierUser.totalOrders || 0) + 1;
          courierUser.totalEarnings = (courierUser.totalEarnings || 0) + (updated.courierEarnings || 0);
        }
        const courierInfo = dbState.couriers.find((c) => c.id === updated.assignedCourier.id);
        if (courierInfo) {
          courierInfo.totalDeliveries = (courierInfo.totalDeliveries || 0) + 1;
        }
      }
    }

    dbState.requests[reqIndex] = updated;
    saveDatabase();
    res.json({ success: true, request: updated });
  } catch (err: any) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Accept request by courier
app.post('/api/requests/:id/accept', (req, res) => {
  try {
    const { id } = req.params;
    const { courierId } = req.body;
    const reqIndex = dbState.requests.findIndex((r) => r.id === id);

    if (reqIndex === -1) {
      res.status(404).json({ error: 'Talep bulunamadı' });
      return;
    }

    const courier = dbState.couriers.find((c) => c.id === courierId) || dbState.couriers[0];
    const updated = {
      ...dbState.requests[reqIndex],
      status: 'courier_assigned',
      assignedCourier: courier,
      updatedAt: new Date().toISOString(),
    };

    dbState.requests[reqIndex] = updated;
    saveDatabase();
    res.json({ success: true, request: updated });
  } catch (err: any) {
    console.error('Error accepting request:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Release request back to pool
app.post('/api/requests/:id/release', (req, res) => {
  try {
    const { id } = req.params;
    const reqIndex = dbState.requests.findIndex((r) => r.id === id);

    if (reqIndex === -1) {
      res.status(404).json({ error: 'Talep bulunamadı' });
      return;
    }

    const updated = {
      ...dbState.requests[reqIndex],
      status: 'pending_pool',
      assignedCourier: undefined,
      updatedAt: new Date().toISOString(),
    };

    dbState.requests[reqIndex] = updated;
    saveDatabase();
    res.json({ success: true, request: updated });
  } catch (err: any) {
    console.error('Error releasing request:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Cancel request
app.post('/api/requests/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    const reqIndex = dbState.requests.findIndex((r) => r.id === id);

    if (reqIndex === -1) {
      res.status(404).json({ error: 'Talep bulunamadı' });
      return;
    }

    const updated = {
      ...dbState.requests[reqIndex],
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    dbState.requests[reqIndex] = updated;
    saveDatabase();
    res.json({ success: true, request: updated });
  } catch (err: any) {
    console.error('Error cancelling request:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Register / Create new User or Courier
app.post('/api/users', (req, res) => {
  try {
    const userData = req.body;
    if (!userData || !userData.name || !userData.phone) {
      res.status(400).json({ error: 'Kullanıcı bilgileri eksik' });
      return;
    }

    const newUser = {
      id: userData.id || `user-custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalEarnings: 0,
      isOnline: userData.role === 'courier' ? true : undefined,
      ...userData,
    };

    const existingIndex = dbState.users.findIndex((u) => u.id === newUser.id || (newUser.email && u.email === newUser.email));
    if (existingIndex >= 0) {
      dbState.users[existingIndex] = { ...dbState.users[existingIndex], ...newUser };
    } else {
      dbState.users.push(newUser);
    }

    // If role is courier, also add/update to couriers list
    if (newUser.role === 'courier') {
      const courierInfo = {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        district: newUser.district || 'Muratpaşa',
        rating: 5.0,
        totalDeliveries: 0,
        currentLat: 36.8860,
        currentLng: 30.7065,
      };
      const existingCIndex = dbState.couriers.findIndex((c) => c.id === newUser.id);
      if (existingCIndex >= 0) {
        dbState.couriers[existingCIndex] = { ...dbState.couriers[existingCIndex], ...courierInfo };
      } else {
        dbState.couriers.push(courierInfo);
      }
    }

    saveDatabase();
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Update User
app.patch('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userIndex = dbState.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }

    dbState.users[userIndex] = { ...dbState.users[userIndex], ...updates };

    // If courier, update courier list as well
    const courierIndex = dbState.couriers.findIndex((c) => c.id === id);
    if (courierIndex >= 0) {
      dbState.couriers[courierIndex] = {
        ...dbState.couriers[courierIndex],
        name: updates.name || dbState.couriers[courierIndex].name,
        phone: updates.phone || dbState.couriers[courierIndex].phone,
        email: updates.email || dbState.couriers[courierIndex].email,
        district: updates.district || dbState.couriers[courierIndex].district,
      };
    }

    saveDatabase();
    res.json({ success: true, user: dbState.users[userIndex] });
  } catch (err: any) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Delete Courier / User
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    dbState.users = dbState.users.filter((u) => u.id !== id);
    dbState.couriers = dbState.couriers.filter((c) => c.id !== id);
    saveDatabase();
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Courier Location Update
app.post('/api/couriers/location', (req, res) => {
  try {
    const { courierId, lat, lng } = req.body;
    const courier = dbState.couriers.find((c) => c.id === courierId);
    if (courier && typeof lat === 'number' && typeof lng === 'number') {
      courier.currentLat = lat;
      courier.currentLng = lng;
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Database Import / Reset
app.post('/api/database/backup', (req, res) => {
  try {
    const { data } = req.body;
    if (data && Array.isArray(data.users) && Array.isArray(data.requests)) {
      dbState = {
        users: data.users,
        couriers: data.couriers || DEFAULT_COURIERS,
        requests: data.requests,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Geçersiz yedek verisi' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Antalya Kurye Express server running on port ${PORT}`);
  });
}

startServer();
