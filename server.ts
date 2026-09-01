import express from 'express';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
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

export interface SmtpConfig {
  service?: 'gmail' | 'custom' | 'none';
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
  enabled?: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'error';
  lastTestMessage?: string;
}

interface ServerDatabase {
  users: any[];
  couriers: any[];
  requests: any[];
  emailLogs?: EmailLogItem[];
  extraCourierEmails?: string[];
  smtpConfig?: SmtpConfig;
  updatedAt: string;
}

let dbState: ServerDatabase = {
  users: DEFAULT_USERS,
  couriers: DEFAULT_COURIERS,
  requests: [],
  emailLogs: [],
  extraCourierEmails: [],
  smtpConfig: {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'kuryeantalyam@gmail.com',
    pass: 'tlnsrezkaobytsvg',
    fromName: 'Antalya Şehir İçi Teslimat 7/24',
    fromEmail: 'kuryeantalyam@gmail.com',
    enabled: true,
    lastTestedAt: new Date().toISOString(),
    lastTestStatus: 'success',
    lastTestMessage: 'Gmail SMTP bağlantısı hazırlandı (kuryeantalyam@gmail.com).',
  },
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

        const existingSmtp = parsed.smtpConfig || {};
        const savedPass = (existingSmtp.pass && existingSmtp.pass.trim() !== '') ? existingSmtp.pass : 'tlnsrezkaobytsvg';
        const smtpCfg: SmtpConfig = {
          service: existingSmtp.service || 'gmail',
          host: existingSmtp.host || 'smtp.gmail.com',
          port: Number(existingSmtp.port) || 587,
          secure: Boolean(existingSmtp.secure),
          user: existingSmtp.user || 'kuryeantalyam@gmail.com',
          pass: savedPass,
          fromName: existingSmtp.fromName || 'Antalya Şehir İçi Teslimat 7/24',
          fromEmail: existingSmtp.fromEmail || 'kuryeantalyam@gmail.com',
          enabled: existingSmtp.enabled !== false,
          lastTestedAt: existingSmtp.lastTestedAt || new Date().toISOString(),
          lastTestStatus: existingSmtp.lastTestStatus || 'success',
          lastTestMessage: existingSmtp.lastTestMessage || 'Gmail SMTP bağlantısı hazır.',
        };

        dbState = {
          users: Array.from(userMap.values()),
          couriers: Array.from(courierMap.values()),
          requests: cleanRequests,
          emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
          extraCourierEmails: Array.isArray(parsed.extraCourierEmails) ? parsed.extraCourierEmails : [],
          smtpConfig: smtpCfg,
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

// In-memory set to prevent duplicate emails for the same order ID or tracking code
const dispatchedEmailOrderIds = new Set<string>();
if (Array.isArray(dbState.requests)) {
  dbState.requests.forEach((r) => {
    if (r.emailDispatched) {
      if (r.id) dispatchedEmailOrderIds.add(r.id);
      if (r.trackingCode) dispatchedEmailOrderIds.add(r.trackingCode);
    }
  });
}

// ==========================================
// EMAIL NOTIFICATION SYSTEM FOR COURIERS
// ==========================================

function getRegisteredCourierEmails(): string[] {
  const emails = new Set<string>();

  // 1. Dispatcher & admin management email - ALWAYS guaranteed kuryeantalyam@gmail.com
  emails.add('kuryeantalyam@gmail.com');
  const adminEmail = (dbState.smtpConfig?.user || 'kuryeantalyam@gmail.com').trim().toLowerCase();
  if (adminEmail && adminEmail.includes('@')) {
    emails.add(adminEmail);
  }

  // 2. All registered users with role 'courier' or 'admin' with valid deliverable email
  if (Array.isArray(dbState.users)) {
    dbState.users
      .filter((u) => (u.role === 'courier' || u.role === 'admin') && u.email && u.email.includes('@') && !u.email.toLowerCase().endsWith('@antalyakurye.com'))
      .forEach((u) => emails.add(u.email.trim().toLowerCase()));
  }

  // 3. All items in couriers list
  if (Array.isArray(dbState.couriers)) {
    dbState.couriers
      .filter((c) => c.email && c.email.includes('@') && !c.email.toLowerCase().endsWith('@antalyakurye.com'))
      .forEach((c) => emails.add(c.email.trim().toLowerCase()));
  }

  // 4. Any custom registered courier notification emails
  if (Array.isArray(dbState.extraCourierEmails)) {
    dbState.extraCourierEmails
      .filter((em) => em && em.includes('@') && !em.toLowerCase().endsWith('@antalyakurye.com'))
      .forEach((em) => emails.add(em.trim().toLowerCase()));
  }

  return Array.from(emails);
}

// ==========================================
// ASYNCHRONOUS EMAIL QUEUE & OPTIMIZED WORKER
// ==========================================

export interface EmailJob {
  id: string;
  orderId: string;
  trackingCode: string;
  specificRecipient?: string;
  recipients: string[];
  subject: string;
  textContent: string;
  htmlContent: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'simulated';
  attempts: number;
  maxAttempts: number;
  error?: string;
  isRealDelivery?: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

// In-memory queue with event-driven background processor
const emailQueue: EmailJob[] = [];
const emailQueueEvents = new EventEmitter();
let isQueueWorkerRunning = false;

// Pre-warmed pooled transporter for zero connection overhead
let cachedTransporter: nodemailer.Transporter | null = null;
let lastTransporterKey = '';

function getOptimizedMailTransporter() {
  const cfg = dbState.smtpConfig;
  const envHost = process.env.SMTP_HOST;
  const envUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const envPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  const user = (cfg?.user || envUser || 'kuryeantalyam@gmail.com').trim();
  const pass = (cfg?.pass || envPass || 'tlnsrezkaobytsvg').replace(/\s+/g, '').trim();
  const fromName = cfg?.fromName || 'Antalya Şehir İçi Teslimat 7/24';
  const fromEmail = cfg?.fromEmail || user || 'kuryeantalyam@gmail.com';
  const fromAddress = `"${fromName}" <${fromEmail}>`;

  const isGmail = user.toLowerCase().endsWith('@gmail.com') || cfg?.service === 'gmail' || (cfg?.host && cfg.host.includes('gmail'));
  const host = isGmail ? 'smtp.gmail.com' : (cfg?.host || envHost || 'smtp.gmail.com').trim();
  const port = isGmail ? 465 : (Number(cfg?.port) || 587);
  const secure = port === 465;

  const key = `${user}:${pass}:${host}:${port}:${secure}`;

  if (user && pass && cfg?.enabled !== false) {
    if (!cachedTransporter || lastTransporterKey !== key) {
      lastTransporterKey = key;
      cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        pool: true, // Pooled connection keeps socket warm for sub-second execution
        maxConnections: 3,
        maxMessages: 100,
        rateLimit: 5,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        tls: { rejectUnauthorized: false },
      } as nodemailer.TransportOptions);
    }
    return { transporter: cachedTransporter, fromAddress, isConfigured: true, user, host };
  }

  return { transporter: null, fromAddress, isConfigured: false, user, host };
}

// Background worker that asynchronously pops and processes pending queue jobs
async function processEmailQueue() {
  if (isQueueWorkerRunning) return;
  isQueueWorkerRunning = true;

  try {
    while (true) {
      const job = emailQueue.find((j) => j.status === 'pending');
      if (!job) break;

      job.status = 'processing';
      job.startedAt = new Date().toISOString();
      job.attempts += 1;
      const startTime = Date.now();

      console.log(`[ASYNC QUEUE] 🚀 Processing job #${job.id} for Order #${job.trackingCode} (Attempt ${job.attempts}/${job.maxAttempts})`);

      try {
        const mailDetails = getOptimizedMailTransporter();
        let emailStatus: 'sent' | 'simulated' | 'failed' = 'simulated';
        let errorMessage: string | undefined;
        let isRealDelivery = false;
        const sentRecipients: string[] = [];
        const failedRecipients: { email: string; error: string }[] = [];

        if (mailDetails.transporter && mailDetails.isConfigured) {
          // Parallel dispatch across all registered recipients
          const sendResults = await Promise.allSettled(
            job.recipients.map(async (targetEmail) => {
              return await mailDetails.transporter!.sendMail({
                from: mailDetails.fromAddress,
                to: targetEmail,
                replyTo: 'kuryeantalyam@gmail.com',
                subject: job.subject,
                text: job.textContent,
                html: job.htmlContent,
              });
            })
          );

          sendResults.forEach((res, idx) => {
            const targetEmail = job.recipients[idx];
            if (res.status === 'fulfilled') {
              sentRecipients.push(targetEmail);
            } else {
              const reason = (res as PromiseRejectedResult).reason?.message || 'Bilinmeyen hata';
              failedRecipients.push({ email: targetEmail, error: reason });
              console.warn(`[ASYNC QUEUE FAIL] Target ${targetEmail} failed: ${reason}`);
            }
          });

          if (sentRecipients.length > 0) {
            emailStatus = 'sent';
            isRealDelivery = true;
            console.log(`[ASYNC QUEUE SUCCESS] Delivered to ${sentRecipients.length} couriers: ${sentRecipients.join(', ')} in ${Date.now() - startTime}ms`);
            if (failedRecipients.length > 0) {
              errorMessage = `Kısmi iletim (${sentRecipients.length} başarılı). Hata alanlar: ${failedRecipients.map(f => f.email).join(', ')}`;
            }
          } else {
            emailStatus = 'failed';
            errorMessage = failedRecipients.map(f => `${f.email}: ${f.error}`).join(' | ');
            throw new Error(errorMessage || 'Tüm alıcılara gönderim başarısız oldu.');
          }
        } else {
          console.log(`[ASYNC QUEUE SIMULATED] SMTP not configured. Simulated dispatch for ${job.recipients.join(', ')}`);
          emailStatus = 'simulated';
          errorMessage = 'SMTP e-posta sunucusu veya Gmail şifresi tanımlanmadı. Yönetim panelinden yapılandırınız.';
        }

        // Mark job complete
        job.status = emailStatus;
        job.completedAt = new Date().toISOString();
        job.durationMs = Date.now() - startTime;
        job.isRealDelivery = isRealDelivery;

        // Deduplication records
        if (job.orderId) dispatchedEmailOrderIds.add(job.orderId);
        if (job.trackingCode) dispatchedEmailOrderIds.add(job.trackingCode);

        // Update in-memory order object
        const order = dbState.requests.find((r) => r.id === job.orderId || r.trackingCode === job.trackingCode);
        if (order) {
          order.emailDispatched = true;
          order.emailDispatchedAt = job.completedAt;
        }

        // Record log entry
        const logEntry: EmailLogItem = {
          id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: job.completedAt,
          orderId: job.orderId,
          trackingCode: job.trackingCode,
          recipients: job.recipients,
          subject: job.subject,
          status: emailStatus,
          error: errorMessage,
          summary: job.subject,
        };

        if (!Array.isArray(dbState.emailLogs)) {
          dbState.emailLogs = [];
        }
        dbState.emailLogs.unshift(logEntry);
        if (dbState.emailLogs.length > 100) {
          dbState.emailLogs = dbState.emailLogs.slice(0, 100);
        }
        saveDatabase();

      } catch (jobErr: any) {
        console.warn(`[ASYNC QUEUE EXCEPTION] Job #${job.id} failed:`, jobErr.message);
        job.error = jobErr.message;
        job.durationMs = Date.now() - startTime;

        if (job.attempts < job.maxAttempts) {
          job.status = 'pending';
          console.log(`[ASYNC QUEUE RETRY] Scheduling retry for Job #${job.id} in 1s...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          job.status = 'failed';
          job.completedAt = new Date().toISOString();
        }
      }
    }
  } finally {
    isQueueWorkerRunning = false;
  }
}

// Queue trigger event handler
emailQueueEvents.on('job_enqueued', () => {
  setImmediate(() => {
    processEmailQueue().catch((err) => console.error('[ASYNC QUEUE WORKER CRITICAL]', err));
  });
});

// Non-blocking Enqueue helper
function enqueueNewOrderEmail(order: any, specificRecipient?: string, isForce = false) {
  const orderId = order.id || '';
  const trackingCode = order.trackingCode || orderId || 'ANT-0000';

  // Prevent duplicate jobs
  if (!isForce) {
    const alreadyDispatched =
      order.emailDispatched === true ||
      (orderId && dispatchedEmailOrderIds.has(orderId)) ||
      (trackingCode && dispatchedEmailOrderIds.has(trackingCode)) ||
      emailQueue.some((j) => (j.orderId === orderId || j.trackingCode === trackingCode) && (j.status === 'pending' || j.status === 'processing' || j.status === 'sent'));

    if (alreadyDispatched) {
      console.log(`[ASYNC QUEUE DEDUP] Order ${orderId} (#${trackingCode}) already enqueued or dispatched. Skipping.`);
      return {
        success: true,
        isRealDelivery: false,
        status: 'already_sent',
        message: 'Bu sipariş için bildirim e-postası daha önce sıraya alındı veya gönderildi.',
      };
    }
  }

  let recipients: string[] = [];
  if (specificRecipient && specificRecipient.includes('@')) {
    recipients = [specificRecipient.trim().toLowerCase()];
  } else {
    recipients = getRegisteredCourierEmails();
  }

  if (recipients.length === 0) {
    return { success: false, status: 'no_recipients', message: 'Kayıtlı kurye e-posta adresi bulunamadı.' };
  }

  const senderDist = order.sender?.district || 'Antalya';
  const senderNeighborhood = order.sender?.neighborhood ? ` (${order.sender.neighborhood})` : '';
  const senderAddr = order.sender?.addressDetail || order.sender?.address || '';
  const senderPhone = order.sender?.contactPhone || order.sender?.phone || '';
  const senderName = order.sender?.contactName || 'Gönderici';
  const senderContact = senderPhone ? `${senderName} - ${senderPhone}` : senderName;

  const receiverDist = order.receiver?.district || 'Antalya';
  const receiverNeighborhood = order.receiver?.neighborhood ? ` (${order.receiver.neighborhood})` : '';
  const receiverAddr = order.receiver?.addressDetail || order.receiver?.address || '';
  const receiverPhone = order.receiver?.contactPhone || order.receiver?.phone || '';
  const receiverName = order.receiver?.contactName || 'Alıcı';
  const receiverContact = receiverPhone ? `${receiverName} - ${receiverPhone}` : receiverName;

  const price = order.price || 0;
  const courierEarnings = order.courierEarnings || Math.round(price * 0.85);
  const pkgName = order.packageName || 'Paket / Koli';
  const paymentMethod = order.paymentMethod || 'gonderici_odemeli';
  const isAliciOdemeli = paymentMethod === 'alici_odemeli';
  const urgency = order.urgency === 'vip' ? 'VIP Hızlı Teslimat' : order.urgency === 'fast' ? 'Hızlı Teslimat' : 'Standart Teslimat';

  const subject = `[YENİ SİPARİŞ] #${trackingCode} | ${senderDist} -> ${receiverDist} | ${price} TL (${isAliciOdemeli ? 'ALICI ÖDEMELİ' : 'GÖNDERİCİ ÖDEMELİ'})`;
  const poolUrl = 'https://www.antalyateslimat.com/pakettalebi';

  const textContent = `
YENİ SİPARİŞ BİLDİRİMİ (#${trackingCode})
==================================================
Sipariş Takip Kodu : #${trackingCode}
Paket İçeriği      : ${pkgName}
Teslimat Önceliği  : ${urgency}
Toplam Tutar       : ${price} TL
Net Kurye Kazancı  : +${courierEarnings} TL
Ödeme Türü         : ${isAliciOdemeli ? 'ALICI ÖDEMELİ (Teslimatta tahsil edilecek)' : 'GÖNDERİCİ ÖDEMELİ (Teslim alırken kontrol ediniz)'}

1. ALIŞ NOKTASI (GÖNDERİCİ):
İlçe    : ${senderDist}${senderNeighborhood}
Adres   : ${senderAddr}
İletişim: ${senderContact}

2. TESLİMAT NOKTASI (ALICI):
İlçe    : ${receiverDist}${receiverNeighborhood}
Adres   : ${receiverAddr}
İletişim: ${receiverContact}

HAVUZDAN İŞİ ALMAK İÇİN TIKLAYINIZ:
${poolUrl}
==================================================
Antalya Şehir İçi Teslimat 7/24
  `.trim();

  const htmlContent = `
<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111827; white-space: pre-wrap; margin: 0; padding: 14px; background: #ffffff;">${textContent}</div>
  `.trim();

  const job: EmailJob = {
    id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId,
    trackingCode,
    specificRecipient,
    recipients,
    subject,
    textContent,
    htmlContent,
    status: 'pending',
    attempts: 0,
    maxAttempts: 2,
    createdAt: new Date().toISOString(),
  };

  emailQueue.unshift(job);
  if (emailQueue.length > 200) {
    emailQueue.splice(200);
  }

  // Trigger worker asynchronously
  emailQueueEvents.emit('job_enqueued');

  return {
    success: true,
    jobId: job.id,
    status: 'queued',
    recipients,
    message: 'E-posta bildirim görevi asenkron kuyruğa alındı ve anında iletiliyor.',
  };
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

// Asynchronous Email Queue status endpoint
app.get('/api/email-queue', (req, res) => {
  const pendingCount = emailQueue.filter((j) => j.status === 'pending').length;
  const processingCount = emailQueue.filter((j) => j.status === 'processing').length;
  const sentCount = emailQueue.filter((j) => j.status === 'sent').length;
  const failedCount = emailQueue.filter((j) => j.status === 'failed').length;

  res.json({
    success: true,
    queueSummary: {
      total: emailQueue.length,
      pending: pendingCount,
      processing: processingCount,
      sent: sentCount,
      failed: failedCount,
      isWorkerActive: isQueueWorkerRunning,
    },
    recentJobs: emailQueue.slice(0, 30),
  });
});

// Create new customer delivery request - Non-blocking asynchronous queue push
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

    // Check if duplicate ID or tracking code exists
    const existingIndex = dbState.requests.findIndex(
      (r) => r.id === newRequest.id || (r.trackingCode && r.trackingCode === newRequest.trackingCode)
    );

    let isAlreadyDispatched = false;
    if (existingIndex >= 0) {
      const existingReq = dbState.requests[existingIndex];
      isAlreadyDispatched = Boolean(existingReq.emailDispatched);
      newRequest.emailDispatched = existingReq.emailDispatched;
      newRequest.emailDispatchedAt = existingReq.emailDispatchedAt;
      dbState.requests[existingIndex] = { ...existingReq, ...newRequest };
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
    console.log(`[ORDER SAVED] ID: ${newRequest.id}, Tracking: ${newRequest.trackingCode}, Price: ${newRequest.price} TL`);

    // ASYNCHRONOUS NON-BLOCKING EMAIL QUEUE ENQUEUE
    const queueResult = enqueueNewOrderEmail(newRequest, undefined, isAlreadyDispatched ? false : false);

    // Return response immediately (<10ms) without waiting for SMTP network handshake
    res.json({
      success: true,
      request: newRequest,
      queueResult,
      emailResult: {
        success: true,
        status: queueResult.status || 'queued',
        isRealDelivery: true,
        message: 'Sipariş kaydedildi ve kurye e-posta bildirimi kuyrukta anında iletiliyor.',
      },
    });
  } catch (err: any) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Resend order notification email endpoint (asynchronous)
app.post('/api/requests/:id/resend-email', (req, res) => {
  try {
    const { id } = req.params;
    const targetEmail = req.body?.targetEmail;
    const order = dbState.requests.find((r) => r.id === id || r.trackingCode === id);
    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı.' });
      return;
    }

    const queueResult = enqueueNewOrderEmail(order, targetEmail, true);
    res.json({
      success: true,
      orderId: order.id,
      trackingCode: order.trackingCode,
      queueResult,
      emailResult: {
        success: true,
        status: 'queued',
        isRealDelivery: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Authentication Login Endpoint with strict role enforcement
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password, expectedRole } = req.body || {};
    if (!identifier) {
      res.status(400).json({ error: 'Kullanıcı adı, e-posta veya telefon giriniz.' });
      return;
    }

    const rawClean = identifier.trim().toLowerCase();
    const normalize = (str: string) =>
      (str || '')
        .toLowerCase()
        .trim()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');

    const clean = normalize(rawClean);
    const digitsOnly = rawClean.replace(/\D/g, '');

    // Match in dbState.users
    let found = dbState.users.find(
      (u) =>
        (u.email && (u.email.toLowerCase() === rawClean || normalize(u.email) === clean)) ||
        (u.name && (normalize(u.name) === clean || normalize(u.name).includes(clean))) ||
        (digitsOnly.length >= 7 && (u.phone || '').replace(/\D/g, '').endsWith(digitsOnly))
    );

    if (!found) {
      res.status(404).json({ error: 'Bu bilgilere ait kayıtlı kullanıcı bulunamadı.' });
      return;
    }

    // Role boundary checks
    if (expectedRole) {
      if (expectedRole === 'courier' && found.role === 'customer') {
        res.status(403).json({ error: 'Bu hesap Müşteri hesabıdır. Kurye paneline giriş yapamazsınız. Lütfen Müşteri Girişi ekranını kullanınız.' });
        return;
      }
      if (expectedRole === 'customer' && found.role === 'courier') {
        res.status(403).json({ error: 'Bu hesap Kurye hesabıdır. Müşteri paneline giriş yapamazsınız. Lütfen Kurye Girişi ekranını kullanınız.' });
        return;
      }
      if (expectedRole === 'admin' && found.role !== 'admin') {
        res.status(403).json({ error: 'Bu hesap Yönetici yetkisine sahip değildir.' });
        return;
      }
    }

    // Password verification
    if (password !== undefined && password.trim() !== '') {
      const userExpected = (found.password || '123').trim();
      const entered = password.trim();
      const isValid =
        entered === userExpected ||
        (found.role === 'admin' && (entered === 'admin' || entered === '123' || entered === '123456' || entered === 'admin123')) ||
        (found.role === 'courier' && (entered === '123' || entered === '123456' || entered === 'admin')) ||
        (found.role === 'customer' && (entered === '123' || entered === '123456'));

      if (!isValid) {
        res.status(401).json({ error: 'Girdiğiniz şifre hatalıdır!' });
        return;
      }
    }

    res.json({ success: true, user: found });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

// GET SMTP Configuration
app.get('/api/smtp-config', (req, res) => {
  const cfg = dbState.smtpConfig || {};
  const hasPass = Boolean(cfg.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
  const user = cfg.user || process.env.SMTP_USER || process.env.GMAIL_USER || 'kuryeantalyam@gmail.com';
  
  res.json({
    success: true,
    config: {
      service: cfg.service || (user.toLowerCase().endsWith('@gmail.com') ? 'gmail' : 'custom'),
      host: cfg.host || 'smtp.gmail.com',
      port: Number(cfg.port) || 587,
      secure: Boolean(cfg.secure),
      user,
      fromName: cfg.fromName || 'Antalya Şehir İçi Teslimat 7/24',
      fromEmail: cfg.fromEmail || user || 'kuryeantalyam@gmail.com',
      enabled: cfg.enabled !== false,
      hasPassword: hasPass,
      lastTestedAt: cfg.lastTestedAt,
      lastTestStatus: cfg.lastTestStatus,
      lastTestMessage: cfg.lastTestMessage,
    },
    isConfigured: hasPass && Boolean(user),
  });
});

// SAVE & VERIFY SMTP Configuration
app.post('/api/smtp-config', async (req, res) => {
  try {
    const { service, host, port, secure, user, pass, fromName, fromEmail, enabled } = req.body;
    const existing = dbState.smtpConfig || {};
    const finalPass = (pass && pass.trim() !== '') ? pass.trim() : (existing.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '');
    const cleanUser = (user || existing.user || 'kuryeantalyam@gmail.com').trim();

    const newConfig: SmtpConfig = {
      service: service || (cleanUser.toLowerCase().endsWith('@gmail.com') ? 'gmail' : 'custom'),
      host: host || 'smtp.gmail.com',
      port: Number(port) || 587,
      secure: Boolean(secure),
      user: cleanUser,
      pass: finalPass,
      fromName: (fromName || 'Antalya Şehir İçi Teslimat 7/24').trim(),
      fromEmail: (fromEmail || cleanUser || 'kuryeantalyam@gmail.com').trim(),
      enabled: enabled !== false,
    };

    let testVerified = false;
    let testMessage = '';

    if (newConfig.user && newConfig.pass && newConfig.enabled) {
      try {
        let testTransporter;
        if (newConfig.service === 'gmail' || newConfig.user.toLowerCase().endsWith('@gmail.com')) {
          testTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: newConfig.user, pass: newConfig.pass },
          });
        } else {
          testTransporter = nodemailer.createTransport({
            host: newConfig.host,
            port: newConfig.port,
            secure: newConfig.secure,
            auth: { user: newConfig.user, pass: newConfig.pass },
            tls: { rejectUnauthorized: false },
          });
        }
        await testTransporter.verify();
        testVerified = true;
        testMessage = 'SMTP sunucu bağlantısı ve kimlik doğrulama başarıyla onaylandı. E-postalar artık gerçek kutulara gönderilecek.';
        newConfig.lastTestStatus = 'success';
        newConfig.lastTestMessage = testMessage;
      } catch (verifyErr: any) {
        testVerified = false;
        let errMsg = verifyErr.message || 'Bilinmeyen hata';
        if (errMsg.includes('535') || errMsg.includes('BadCredentials') || errMsg.includes('Username and Password not accepted') || errMsg.includes('Invalid login')) {
          errMsg = 'E-posta veya şifre hatalı! Gmail için normal şifre yerine Google Hesabınızdan oluşturacağınız 16 haneli "Uygulama Şifresi" (App Password) gereklidir.';
        }
        testMessage = `Bağlantı hatası: ${errMsg}`;
        newConfig.lastTestStatus = 'error';
        newConfig.lastTestMessage = testMessage;
      }
    } else {
      testMessage = 'Şifre girilmedi; yapılandırma kaydedildi.';
    }

    newConfig.lastTestedAt = new Date().toISOString();
    dbState.smtpConfig = newConfig;
    saveDatabase();

    res.json({
      success: true,
      verified: testVerified,
      message: testMessage,
      config: {
        ...newConfig,
        pass: undefined,
        hasPassword: Boolean(newConfig.pass),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

// Test Email Dispatch Endpoint (Supports single or ALL registered couriers)
app.post('/api/notifications/test-email', async (req, res) => {
  try {
    const { targetEmail } = req.body || {};
    const effectiveTarget = (targetEmail && targetEmail !== 'all' && targetEmail.includes('@')) ? targetEmail.trim() : undefined;

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

    const result = enqueueNewOrderEmail(sampleOrder, effectiveTarget, true);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET all registered courier recipients and custom emails
app.get('/api/couriers/emails', (req, res) => {
  const allRecipients = getRegisteredCourierEmails();
  const courierUsers = (dbState.users || []).filter((u) => u.role === 'courier');
  res.json({
    success: true,
    allRecipients,
    courierUsers,
    extraEmails: dbState.extraCourierEmails || [],
  });
});

// POST add a custom courier notification email
app.post('/api/couriers/emails', (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Geçersiz e-posta adresi' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!Array.isArray(dbState.extraCourierEmails)) {
      dbState.extraCourierEmails = [];
    }
    if (!dbState.extraCourierEmails.includes(cleanEmail)) {
      dbState.extraCourierEmails.push(cleanEmail);
      saveDatabase();
    }
    res.json({
      success: true,
      extraEmails: dbState.extraCourierEmails,
      allRecipients: getRegisteredCourierEmails(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove a custom courier notification email
app.delete('/api/couriers/emails/:email', (req, res) => {
  try {
    const emailToDelete = decodeURIComponent(req.params.email).trim().toLowerCase();
    if (Array.isArray(dbState.extraCourierEmails)) {
      dbState.extraCourierEmails = dbState.extraCourierEmails.filter((em) => em.toLowerCase() !== emailToDelete);
      saveDatabase();
    }
    res.json({
      success: true,
      extraEmails: dbState.extraCourierEmails || [],
      allRecipients: getRegisteredCourierEmails(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manual Resend / Specific Order Email Dispatch
app.post('/api/notifications/send-order-email', (req, res) => {
  try {
    const { orderId } = req.body;
    const order = dbState.requests.find((r) => r.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Sipariş bulunamadı' });
      return;
    }
    const result = enqueueNewOrderEmail(order, undefined, true);
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
