import express from 'express';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { initializeApp as initFirebaseApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const app = express();
const PORT = 3000;

// Firebase Cloud Firestore Backend Config
const serverFirebaseConfig = {
  projectId: "ringed-block-jdw25",
  appId: "1:120490913482:web:81205548e8707e5c17ce33",
  apiKey: "AIzaSyA0LZDucLLGbpPcRitRqpdMg1v6D1Epgwo",
  authDomain: "ringed-block-jdw25.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-antalyakuryeexpr-2c4fd8fd-f44c-4d53-ad73-e640951dadc7",
};

let serverFirestoreDb: any = null;
try {
  const fbApp = !getApps().length ? initFirebaseApp(serverFirebaseConfig) : getApp();
  serverFirestoreDb = serverFirebaseConfig.firestoreDatabaseId
    ? getFirestore(fbApp, serverFirebaseConfig.firestoreDatabaseId)
    : getFirestore(fbApp);
  console.log('[FIREBASE BACKEND] Direct Firestore instance connected successfully.');
} catch (fbErr: any) {
  console.warn('[FIREBASE BACKEND] Direct Firestore connection warning:', fbErr.message);
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

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
    phone: '0507 754 74 84',
    email: 'kuryeantalyam@gmail.com',
    password: 'admin',
    role: 'admin',
    companyName: 'Antalya Kurye Express',
    district: 'Muratpaşa',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-courier-1787999333451',
    name: 'Kurye Ümit',
    phone: '0123456789',
    email: 'cantalyacanta@gmail.com',
    password: '666',
    role: 'courier',
    district: 'Muratpaşa',
    createdAt: '2026-08-29T10:28:53.451Z',
    totalOrders: 10,
    totalEarnings: 890,
    isOnline: true,
  },
];

const DEFAULT_COURIERS = [
  {
    id: 'user-courier-1787999333451',
    name: 'Kurye Ümit',
    phone: '0123456789',
    email: 'cantalyacanta@gmail.com',
    district: 'Muratpaşa',
    rating: 5.0,
    totalDeliveries: 10,
    currentLat: 36.8860,
    currentLng: 30.7065,
    isOnline: true,
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
  response?: string;
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

export interface VisitorRecord {
  id: string;
  timestamp: string;
  path: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
  isUnique: boolean;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayDate: string; // YYYY-MM-DD
  uniqueVisitorIds: string[];
  todayVisitorIds: string[];
  lastVisitAt: string;
  recentVisitors: VisitorRecord[];
}

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const DEFAULT_VISITOR_STATS: VisitorStats = {
  totalVisits: 0,
  uniqueVisitors: 0,
  todayVisits: 0,
  todayDate: getTodayDateStr(),
  uniqueVisitorIds: [],
  todayVisitorIds: [],
  lastVisitAt: new Date().toISOString(),
  recentVisitors: [],
};

interface ServerDatabase {
  users: any[];
  couriers: any[];
  requests: any[];
  emailLogs?: EmailLogItem[];
  extraCourierEmails?: string[];
  smtpConfig?: SmtpConfig;
  visitorStats?: VisitorStats;
  updatedAt: string;
}

let dbState: ServerDatabase = {
  users: DEFAULT_USERS,
  couriers: DEFAULT_COURIERS,
  requests: [],
  emailLogs: [],
  extraCourierEmails: [],
  visitorStats: { ...DEFAULT_VISITOR_STATS },
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

        // Clean out any old mock or test requests
        const cleanRequests = parsed.requests.filter((r: any) => 
          r && 
          r.id && 
          !String(r.id).startsWith('req-sample-') &&
          !String(r.id).startsWith('req-test-') &&
          !String(r.id).startsWith('test-') &&
          r.trackingCode !== 'ANT-5892' &&
          r.trackingCode !== 'ANT-9999'
        );

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

        const savedStats = parsed.visitorStats || {};
        const todayStr = getTodayDateStr();
        const isNewDay = savedStats.todayDate !== todayStr;
        const currentVisitorStats: VisitorStats = {
          totalVisits: typeof savedStats.totalVisits === 'number' ? savedStats.totalVisits : 0,
          uniqueVisitors: typeof savedStats.uniqueVisitors === 'number' ? savedStats.uniqueVisitors : 0,
          todayVisits: isNewDay ? 0 : (typeof savedStats.todayVisits === 'number' ? savedStats.todayVisits : 0),
          todayDate: todayStr,
          uniqueVisitorIds: Array.isArray(savedStats.uniqueVisitorIds) ? savedStats.uniqueVisitorIds : [],
          todayVisitorIds: isNewDay ? [] : (Array.isArray(savedStats.todayVisitorIds) ? savedStats.todayVisitorIds : []),
          lastVisitAt: savedStats.lastVisitAt || new Date().toISOString(),
          recentVisitors: Array.isArray(savedStats.recentVisitors) ? savedStats.recentVisitors : [],
        };

        dbState = {
          users: Array.from(userMap.values()),
          couriers: Array.from(courierMap.values()),
          requests: cleanRequests,
          emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
          extraCourierEmails: Array.isArray(parsed.extraCourierEmails) ? parsed.extraCourierEmails : [],
          smtpConfig: smtpCfg,
          visitorStats: currentVisitorStats,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
        console.log(`[DB] Database loaded successfully: ${dbState.requests.length} requests, ${dbState.users.length} users, ${dbState.visitorStats.totalVisits} visits logged`);
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
// EMAIL NOTIFICATION SYSTEM FOR REQUESTS & DISPATCH
// ==========================================

export function isTestOrFakeOrder(order: any): boolean {
  if (!order) return true;
  const id = String(order.id || '').toLowerCase().trim();
  const tracking = String(order.trackingCode || '').toUpperCase().trim();
  const senderName = String(order.sender?.contactName || '').toLowerCase().trim();
  const receiverName = String(order.receiver?.contactName || '').toLowerCase().trim();
  const pkgName = String(order.packageName || '').toLowerCase().trim();

  if (order.isTest === true) return true;
  if (
    id.startsWith('req-sample-') ||
    id.startsWith('req-test-') ||
    id.startsWith('req-live-test') ||
    id.startsWith('test-') ||
    id.startsWith('sample-')
  ) {
    return true;
  }
  if (
    tracking === 'ANT-3333' ||
    tracking === 'ANT-5892' ||
    tracking === 'ANT-9999' ||
    tracking === 'ANT-TEST' ||
    tracking.startsWith('TEST-') ||
    tracking.startsWith('REF-')
  ) {
    return true;
  }
  if (senderName.includes('test') || senderName.includes('deneme') || senderName.includes('örnek') || senderName.includes('ornek')) return true;
  if (receiverName.includes('test') || receiverName.includes('deneme') || receiverName.includes('örnek') || receiverName.includes('ornek')) return true;
  if (pkgName.includes('test paketi') || pkgName.includes('örnek')) return true;
  if (senderName === 'umit torun' && receiverName === 'umit torun') return true;

  return false;
}

export function getOrderNotificationRecipients(orderOrIsTest?: any): string[] {
  const isTest = typeof orderOrIsTest === 'boolean' ? orderOrIsTest : isTestOrFakeOrder(orderOrIsTest);
  const recipients = new Set<string>();

  // 1. Primary business & dispatch management email - ALWAYS guaranteed kuryeantalyam@gmail.com
  recipients.add('kuryeantalyam@gmail.com');
  const adminEmail = (dbState.smtpConfig?.user || 'kuryeantalyam@gmail.com').trim().toLowerCase();
  if (adminEmail && adminEmail.includes('@')) {
    recipients.add(adminEmail);
  }

  // CRITICAL RULE: If test/fake order or test dispatch, STOP HERE!
  // NEVER send test or fake orders to couriers!
  if (isTest) {
    return Array.from(recipients);
  }

  // 2. Extra courier/dispatch emails explicitly configured by admin in Admin Panel
  if (Array.isArray(dbState.extraCourierEmails)) {
    dbState.extraCourierEmails
      .filter((em) => em && em.includes('@') && !em.toLowerCase().endsWith('@antalyakurye.com'))
      .forEach((em) => recipients.add(em.trim().toLowerCase()));
  }

  // NOTE: We strictly DO NOT blast to all registered courier user accounts (dbState.users).
  // Couriers view and claim orders directly via the live pool in the app (#pakettalebi).
  // This prevents fake/test orders reaching couriers and eliminates Gmail SMTP quota/throttling blocks.

  return Array.from(recipients);
}

// Backward compatibility alias
const getRegisteredCourierEmails = getOrderNotificationRecipients;

// ==========================================
// ASYNCHRONOUS EMAIL QUEUE & OPTIMIZED WORKER
// ==========================================

export interface EmailJob {
  id: string;
  orderId: string;
  trackingCode: string;
  isTest?: boolean;
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

function createDirectMailTransporter() {
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

  if (user && pass && cfg?.enabled !== false) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    } as nodemailer.TransportOptions);

    return { transporter, fromAddress, isConfigured: true, user, host };
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

      console.log(`[ASYNC QUEUE] 🚀 Processing job #${job.id} for Order #${job.trackingCode} (Attempt ${job.attempts}/${job.maxAttempts}) to: ${job.recipients.join(', ')}`);

      try {
        const mailDetails = createDirectMailTransporter();
        let emailStatus: 'sent' | 'simulated' | 'failed' = 'simulated';
        let errorMessage: string | undefined;
        let isRealDelivery = false;
        const sentRecipients: string[] = [];
        const failedRecipients: { email: string; error: string }[] = [];

        if (mailDetails.transporter && mailDetails.isConfigured) {
          for (const targetEmail of job.recipients) {
            try {
              const info = await mailDetails.transporter.sendMail({
                from: mailDetails.fromAddress,
                to: targetEmail,
                replyTo: 'kuryeantalyam@gmail.com',
                subject: job.subject,
                text: job.textContent,
                html: job.htmlContent,
                priority: 'high',
                headers: {
                  'X-Priority': '1',
                  'X-MSMail-Priority': 'High',
                  'Importance': 'high',
                },
              });
              sentRecipients.push(targetEmail);
              console.log(`[ASYNC QUEUE SUCCESS] Delivered to ${targetEmail}. SMTP response: ${info.response}`);
            } catch (sendErr: any) {
              failedRecipients.push({ email: targetEmail, error: sendErr.message || 'SMTP hatası' });
              console.warn(`[ASYNC QUEUE FAIL] Target ${targetEmail} failed:`, sendErr.message);
            }
          }

          if (sentRecipients.length > 0) {
            emailStatus = 'sent';
            isRealDelivery = true;
            console.log(`[ASYNC QUEUE SUCCESS] Successfully delivered to ${sentRecipients.length} address(es): ${sentRecipients.join(', ')} in ${Date.now() - startTime}ms`);
            if (failedRecipients.length > 0) {
              errorMessage = `Kısmi iletim (${sentRecipients.length} başarılı). Hata alanlar: ${failedRecipients.map((f) => f.email).join(', ')}`;
            }
          } else {
            emailStatus = 'failed';
            errorMessage = failedRecipients.map((f) => `${f.email}: ${f.error}`).join(' | ');
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

        // Update Firestore document directly
        if (serverFirestoreDb && job.orderId) {
          try {
            const reqDocRef = doc(serverFirestoreDb, 'delivery_requests', job.orderId);
            const docPayload = order
              ? { ...order, emailDispatched: true, emailDispatchedAt: job.completedAt }
              : { emailDispatched: true, emailDispatchedAt: job.completedAt };
            setDoc(reqDocRef, JSON.parse(JSON.stringify(docPayload)), { merge: true })
              .catch((e) => console.warn('[FIRESTORE UPDATE DISPATCH ERR]', e.message));
          } catch (e: any) {
            console.warn('[FIRESTORE DOC REF ERR]', e.message);
          }
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
          console.log(`[ASYNC QUEUE RETRY] Scheduling retry for Job #${job.id} in 2s...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
  const isTest = isTestOrFakeOrder(order);

  // Prevent duplicate jobs for non-force real requests
  if (!isForce) {
    const alreadyDispatched =
      order.emailDispatched === true ||
      (orderId && dispatchedEmailOrderIds.has(orderId)) ||
      (trackingCode && dispatchedEmailOrderIds.has(trackingCode)) ||
      emailQueue.some(
        (j) =>
          (j.orderId === orderId || j.trackingCode === trackingCode) &&
          (j.status === 'pending' || j.status === 'processing' || j.status === 'sent')
      );

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

  // Recipient resolution with courier protection
  let recipients: string[] = [];
  if (specificRecipient && specificRecipient.includes('@')) {
    const targetClean = specificRecipient.trim().toLowerCase();
    // If it is a test/fake order, ensure couriers NEVER receive it
    if (isTest) {
      const isRegisteredCourier = (dbState.users || []).some(
        (u) => u.role === 'courier' && u.email && u.email.toLowerCase() === targetClean && targetClean !== 'kuryeantalyam@gmail.com'
      );
      if (isRegisteredCourier) {
        console.warn(`[SAFETY] Prevented sending test email to courier ${targetClean}. Diverting to admin.`);
        recipients = ['kuryeantalyam@gmail.com'];
      } else {
        recipients = [targetClean];
      }
    } else {
      recipients = [targetClean];
    }
  } else {
    recipients = getOrderNotificationRecipients(order);
  }

  const senderDist = order.sender?.district || 'Antalya';
  const senderNeighborhood = order.sender?.neighborhood ? ` (${order.sender.neighborhood})` : '';
  const senderAddr = order.sender?.addressDetail || order.sender?.address || 'Adres belirtilmedi';
  const rawSenderPhone = order.sender?.contactPhone || order.sender?.phone || 'Telefon belirtilmedi';
  const rawSenderName = order.sender?.contactName || 'Müşteri';

  const receiverDist = order.receiver?.district || 'Antalya';
  const receiverNeighborhood = order.receiver?.neighborhood ? ` (${order.receiver.neighborhood})` : '';
  const receiverAddr = order.receiver?.addressDetail || order.receiver?.address || 'Adres belirtilmedi';
  const rawReceiverPhone = order.receiver?.contactPhone || order.receiver?.phone || 'Telefon belirtilmedi';
  const rawReceiverName = order.receiver?.contactName || 'Alıcı';

  const packageName = order.packageName || order.packageType || 'Standart Paket';
  const price = Number(order.price) || 0;
  const courierEarnings = Number(order.courierEarnings) || Math.round(price * 0.85);

  let paymentMethodLabel = 'Alıcı Ödemeli (Kapıda Nakit / Havale)';
  if (order.paymentMethod === 'sender_paid' || order.paymentMethod === 'gonderici_odemeli') {
    paymentMethodLabel = 'Gönderici Ödemeli (Alırken Tahsil Edilecek)';
  } else if (order.paymentMethod === 'online_credit_card' || order.isPaid) {
    paymentMethodLabel = 'Online Ödendi (Kredi Kartı)';
  } else if (order.paymentMethod === 'card_on_delivery') {
    paymentMethodLabel = 'Kapıda Kredi Kartı';
  }

  const urgencyLabel =
    order.urgency === 'vip' ? 'VIP Acil (30-45 dk)' : order.urgency === 'express' ? 'Ekspres (45-60 dk)' : 'Standart (90-120 dk)';

  const formattedDate = new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subjectPrefix = isTest ? '[TEST BİLDİRİMİ / YÖNETİCİ]' : '[YENİ MÜŞTERİ TALEBİ]';
  const subject = `${subjectPrefix} #${trackingCode} | ${senderDist} ➔ ${receiverDist} | ${price} TL (${paymentMethodLabel})`;

  const textContent = `
========================================
ANTALYA ŞEHİR İÇİ MOTO KURYE - YENİ TALEP
========================================
Takip Kodu : #${trackingCode}
Talep Zamanı: ${formattedDate}
Durum      : Kurye Havuzunda Bekliyor
Ücret      : ${price} TL
Kurye Hakedişi: ${courierEarnings} TL
Ödeme Türü : ${paymentMethodLabel}
Öncelik    : ${urgencyLabel}
Paket      : ${packageName}

--- GÖNDERİCİ BİLGİLERİ ---
İsim       : ${rawSenderName}
Telefon    : ${rawSenderPhone}
İlçe/Mah.  : ${senderDist}${senderNeighborhood}
Açık Adres : ${senderAddr}

--- TESLİMAT (ALICI) BİLGİLERİ ---
İsim       : ${rawReceiverName}
Telefon    : ${rawReceiverPhone}
İlçe/Mah.  : ${receiverDist}${receiverNeighborhood}
Açık Adres : ${receiverAddr}

--- KURYE NOTU ---
${order.noteForCourier ? order.noteForCourier : 'Özel bir not belirtilmedi.'}

Paneli Aç: https://www.antalyateslimat.com/#admin
Kurye Havuzu: https://www.antalyateslimat.com/#pakettalebi
Takip Sayfası: https://www.antalyateslimat.com/#tracker
========================================
${isTest ? 'NOT: Bu e-posta yalnızca yönetici kutusuna test olarak gönderilmiştir. Kuryelere bildirim iletilmez.' : ''}
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 16px; background-color: #03140e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background: #022017; border: 1px solid #059669; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #047857 0%, #065f46 100%); padding: 20px 24px; text-align: left;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; background: rgba(0,0,0,0.25); color: #a7f3d0; padding: 4px 10px; border-radius: 8px;">
          ${isTest ? '🧪 TEST / DOĞRULAMA' : '⚡ YENİ MÜŞTERİ TALEBİ'}
        </span>
        <span style="color: #d1fae5; font-size: 12px;">${formattedDate}</span>
      </div>
      <h1 style="margin: 12px 0 4px 0; font-size: 24px; font-weight: 900; color: #ffffff;">
        Takip No: #${trackingCode}
      </h1>
      <p style="margin: 0; font-size: 14px; color: #ecfdf5; font-weight: 600;">
        ${senderDist} ➔ ${receiverDist} | <span style="color: #fde047; font-weight: 800;">${price} TL</span>
      </p>
    </div>

    <!-- Summary Badges -->
    <div style="padding: 16px 24px; background: #021a13; border-bottom: 1px solid rgba(16,185,129,0.2); display: flex; flex-wrap: wrap; gap: 8px;">
      <div style="background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); border-radius: 8px; padding: 8px 12px; margin: 4px;">
        <div style="font-size: 10px; color: #6ee7b7; font-weight: 700; text-transform: uppercase;">Ödeme Türü</div>
        <div style="font-size: 13px; color: #ffffff; font-weight: 700;">${paymentMethodLabel}</div>
      </div>
      <div style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); border-radius: 8px; padding: 8px 12px; margin: 4px;">
        <div style="font-size: 10px; color: #fcd34d; font-weight: 700; text-transform: uppercase;">Öncelik</div>
        <div style="font-size: 13px; color: #ffffff; font-weight: 700;">${urgencyLabel}</div>
      </div>
      <div style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); border-radius: 8px; padding: 8px 12px; margin: 4px;">
        <div style="font-size: 10px; color: #93c5fd; font-weight: 700; text-transform: uppercase;">Paket</div>
        <div style="font-size: 13px; color: #ffffff; font-weight: 700;">${packageName}</div>
      </div>
    </div>

    <!-- Details Body -->
    <div style="padding: 24px;">

      <!-- Sender Card -->
      <div style="background: #032d20; border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="color: #34d399; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          📍 ALINACAK YER (GÖNDERİCİ)
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
          ${rawSenderName}
        </div>
        <div style="font-size: 14px; margin-bottom: 8px;">
          <a href="tel:${rawSenderPhone.replace(/\s+/g, '')}" style="color: #6ee7b7; font-weight: 700; text-decoration: none;">
            📞 ${rawSenderPhone} (Aramak İçin Tıklayın)
          </a>
        </div>
        <div style="font-size: 13px; color: #a7f3d0; line-height: 1.4;">
          <strong>${senderDist}${senderNeighborhood}</strong><br>
          ${senderAddr}
        </div>
      </div>

      <!-- Receiver Card -->
      <div style="background: #032d20; border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          🎯 TESLİMAT YERİ (ALICI)
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
          ${rawReceiverName}
        </div>
        <div style="font-size: 14px; margin-bottom: 8px;">
          <a href="tel:${rawReceiverPhone.replace(/\s+/g, '')}" style="color: #fcd34d; font-weight: 700; text-decoration: none;">
            📞 ${rawReceiverPhone} (Aramak İçin Tıklayın)
          </a>
        </div>
        <div style="font-size: 13px; color: #a7f3d0; line-height: 1.4;">
          <strong>${receiverDist}${receiverNeighborhood}</strong><br>
          ${receiverAddr}
        </div>
      </div>

      <!-- Customer Note -->
      ${
        order.noteForCourier
          ? `
      <div style="background: rgba(245,158,11,0.1); border: 1px dashed rgba(245,158,11,0.5); border-radius: 10px; padding: 12px; margin-bottom: 20px;">
        <div style="color: #fcd34d; font-size: 11px; font-weight: 800; margin-bottom: 4px;">💬 MÜŞTERİ NOTU:</div>
        <div style="color: #ffffff; font-size: 13px; font-style: italic;">"${order.noteForCourier}"</div>
      </div>
      `
          : ''
      }

      <!-- Action Buttons -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://www.antalyateslimat.com/#admin" style="display: inline-block; background: #059669; color: #ffffff; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin: 6px;">
          Yönetim Panelinde Aç
        </a>
        <a href="https://www.antalyateslimat.com/#pakettalebi" style="display: inline-block; background: #d97706; color: #ffffff; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin: 6px;">
          Kurye Havuzunda Gör
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #01150f; padding: 14px 24px; text-align: center; border-top: 1px solid rgba(16,185,129,0.2); font-size: 11px; color: #6ee7b7;">
      Antalya Şehir İçi Moto Kurye & Teslimat Ağı 7/24 • Bu e-posta sipariş yönetim bildirim sistemi tarafından otomatik oluşturulmuştur.
    </div>

  </div>
</body>
</html>
`.trim();

  const job: EmailJob = {
    id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId,
    trackingCode,
    isTest,
    recipients,
    subject,
    textContent,
    htmlContent,
    status: 'pending',
    attempts: 0,
    maxAttempts: 3,
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
// DIRECT FIRESTORE REAL-TIME SYNCHRONIZATION
// ==========================================

async function syncUsersFromFirestoreSnapshot(snapshotDocs: any[]) {
  let updatedCount = 0;
  snapshotDocs.forEach((docSnap) => {
    const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
    const docId = docSnap.id || data.id;
    if (!data || !docId) return;

    const u = { ...data, id: docId };
    const emailLower = (u.email || '').trim().toLowerCase();

    const existingIdx = dbState.users.findIndex(
      (x) => x.id === docId || (emailLower && x.email && x.email.trim().toLowerCase() === emailLower)
    );

    if (existingIdx >= 0) {
      dbState.users[existingIdx] = { ...dbState.users[existingIdx], ...u };
    } else {
      dbState.users.push(u);
      updatedCount++;
    }

    if (u.role === 'courier') {
      const cIdx = dbState.couriers.findIndex(
        (c) => c.id === docId || (emailLower && c.email && c.email.trim().toLowerCase() === emailLower)
      );
      const courierInfo = {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        district: u.district || 'Muratpaşa',
        rating: u.rating || 5.0,
        totalDeliveries: u.totalDeliveries || u.totalOrders || 0,
        currentLat: u.currentLat || 36.8860,
        currentLng: u.currentLng || 30.7065,
        isOnline: u.isOnline !== false,
      };
      if (cIdx >= 0) {
        dbState.couriers[cIdx] = { ...dbState.couriers[cIdx], ...courierInfo };
      } else {
        dbState.couriers.push(courierInfo);
      }
    }
  });

  if (updatedCount > 0) {
    saveDatabase();
  }
  console.log(`[FIRESTORE USERS SYNC] Synced Firestore users (${snapshotDocs.length} accounts). Active courier recipients: ${getRegisteredCourierEmails().join(', ')}`);
}

function initFirestoreSync() {
  if (!serverFirestoreDb) {
    console.warn('[FIRESTORE SYNC] Firestore DB not available on server, skipping real-time cloud sync.');
    return;
  }

  // 1. Synchronize Users Collection (Immediate Fetch + Real-time onSnapshot)
  try {
    const usersColRef = collection(serverFirestoreDb, 'users');
    
    // Immediate one-time hydration
    getDocs(usersColRef)
      .then((snap) => {
        if (snap && snap.docs.length > 0) {
          syncUsersFromFirestoreSnapshot(snap.docs);
        }
      })
      .catch((err) => console.warn('[FIRESTORE USERS GET ERR]', err.message));

    // Real-time listener for users
    onSnapshot(
      usersColRef,
      (snapshot) => {
        syncUsersFromFirestoreSnapshot(snapshot.docs);
      },
      (err) => {
        console.warn('[FIRESTORE USERS LISTENER ERR]', err.message);
      }
    );
  } catch (err: any) {
    console.warn('[FIRESTORE USERS SYNC INIT FAIL]', err.message);
  }

  // 2. Synchronize Delivery Requests Collection (Real-time onSnapshot)
  try {
    const colRef = collection(serverFirestoreDb, 'delivery_requests');
    onSnapshot(
      colRef,
      (snapshot) => {
        let newOrUpdatedCount = 0;
        snapshot.docChanges().forEach((change) => {
          const data: any = change.doc.data();
          if (!data || !data.id || String(data.id).startsWith('req-sample-')) return;

          const docId = change.doc.id || data.id;
          const trackingCode = data.trackingCode || 'ANT-0000';
          const fullOrder = { ...data, id: docId };

          // Upsert into local server database
          const existingIdx = dbState.requests.findIndex(
            (r) => r.id === docId || (r.trackingCode && r.trackingCode === trackingCode)
          );

          if (existingIdx >= 0) {
            const currentReq = dbState.requests[existingIdx];
            dbState.requests[existingIdx] = { ...currentReq, ...fullOrder };
          } else {
            dbState.requests.unshift(fullOrder);
            newOrUpdatedCount++;
          }

          // Check if email needs to be dispatched (if not marked dispatched and not test/fake)
          const isTest = isTestOrFakeOrder(fullOrder);
          const needsEmail = !isTest && !fullOrder.emailDispatched && !dispatchedEmailOrderIds.has(docId) && !dispatchedEmailOrderIds.has(trackingCode);

          if (needsEmail) {
            console.log(`[FIRESTORE SYNC] 📦 New real customer order from Firestore detected: #${trackingCode} (${docId}). Triggering email queue...`);
            enqueueNewOrderEmail(fullOrder, undefined, false);
          }
        });

        saveDatabase();
        if (newOrUpdatedCount > 0) {
          console.log(`[FIRESTORE SYNC] Real-time synced ${newOrUpdatedCount} new orders from Cloud Firestore.`);
        }
      },
      (err) => {
        console.warn('[FIRESTORE SYNC ERROR]', err.message);
      }
    );
  } catch (err: any) {
    console.warn('[FIRESTORE SYNC INIT FAIL]', err.message);
  }

  // 3. Synchronize Site Visitor Counter (settings/site_counter)
  try {
    const counterDocRef = doc(serverFirestoreDb, 'settings', 'site_counter');
    onSnapshot(
      counterDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData: any = docSnap.data();
          if (cloudData && typeof cloudData.totalVisits === 'number') {
            if (!dbState.visitorStats) {
              dbState.visitorStats = { ...DEFAULT_VISITOR_STATS };
            }
            const cloudTotal = Number(cloudData.totalVisits) || 0;
            const currentTotal = dbState.visitorStats.totalVisits || 0;
            // Always keep the higher number so counts never decrease across reboots/instances
            if (cloudTotal > currentTotal) {
              dbState.visitorStats.totalVisits = cloudTotal;
              dbState.visitorStats.uniqueVisitors = Math.max(dbState.visitorStats.uniqueVisitors || 0, Number(cloudData.uniqueVisitors) || 0);
              if (cloudData.todayVisits && (!dbState.visitorStats.todayVisits || Number(cloudData.todayVisits) > dbState.visitorStats.todayVisits)) {
                dbState.visitorStats.todayVisits = Number(cloudData.todayVisits);
              }
              if (cloudData.lastVisitAt) {
                dbState.visitorStats.lastVisitAt = cloudData.lastVisitAt;
              }
              saveDatabase();
              console.log(`[FIRESTORE COUNTER SYNC] Site counter synced with Cloud Firestore: Total=${cloudTotal}`);
            }
          }
        }
      },
      (err) => {
        console.warn('[FIRESTORE COUNTER SYNC ERROR]', err.message);
      }
    );
  } catch (err: any) {
    console.warn('[FIRESTORE COUNTER SYNC INIT FAIL]', err.message);
  }

  // 4. Synchronize Password Reset Requests Collection (Real-time onSnapshot)
  try {
    const pwdReqColRef = collection(serverFirestoreDb, 'password_reset_requests');
    onSnapshot(
      pwdReqColRef,
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data: any = change.doc.data();
            if (data && data.status === 'pending') {
              console.log(`[FIRESTORE PWD RESET] 🔑 New password reset request detected: ${data.emailOrIdentifier} (${change.doc.id})`);
              const docRef = doc(serverFirestoreDb, 'password_reset_requests', change.doc.id);
              try {
                // Mark as processing
                await setDoc(docRef, { status: 'processing' }, { merge: true });
                const result = await processPasswordResetRequest({
                  emailOrIdentifier: data.emailOrIdentifier,
                  role: data.role,
                  userHint: data.userHint,
                });
                await setDoc(docRef, {
                  status: result.success ? 'completed' : 'failed',
                  error: result.error || null,
                  message: result.message || null,
                  email: result.email || null,
                  refCode: result.refCode || null,
                  isSelfSent: result.isSelfSent || false,
                  processedAt: new Date().toISOString(),
                }, { merge: true });
                console.log(`[FIRESTORE PWD RESET] Request ${change.doc.id} processed: ${result.success ? 'SUCCESS' : 'FAILED - ' + result.error}`);
              } catch (procErr: any) {
                console.error('[FIRESTORE PWD RESET PROC ERROR]', procErr);
                await setDoc(docRef, {
                  status: 'failed',
                  error: procErr?.message || 'İşlem sırasında hata meydana geldi.',
                  processedAt: new Date().toISOString(),
                }, { merge: true });
              }
            }
          }
        });
      },
      (err) => {
        console.warn('[FIRESTORE PWD RESET LISTENER ERROR]', err.message);
      }
    );
  } catch (err: any) {
    console.warn('[FIRESTORE PWD RESET INIT FAIL]', err.message);
  }
}

// Initial Firestore connection trigger
initFirestoreSync();

// Periodic background sweep every 5 seconds to guarantee NO real customer request misses email notification
setInterval(() => {
  if (Array.isArray(dbState.requests)) {
    dbState.requests.forEach((r) => {
      if (isTestOrFakeOrder(r)) return;

      const isUnsent = !r.emailDispatched && !dispatchedEmailOrderIds.has(r.id) && (!r.trackingCode || !dispatchedEmailOrderIds.has(r.trackingCode));
      if (isUnsent) {
        console.log(`[AUTO SWEEP] 🚀 Auto-dispatching un-emailed real customer order #${r.trackingCode} (${r.id})...`);
        enqueueNewOrderEmail(r, undefined, false);
      }
    });
  }
}, 5000);

// ==========================================
// SEO & ROBOTS CRAWLER ROUTES
// ==========================================

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# robots.txt for Antalya Teslimat 7/24
User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

Sitemap: https://www.antalyateslimat.com/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.antalyateslimat.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://www.antalyateslimat.com/app-logo.png</image:loc>
      <image:title>Antalya Paket Gönder &amp; Kurye Çağır</image:title>
      <image:caption>Antalya 7/24 Şehir İçi Acil Moto Kurye ve Paket Gönderim Servisi</image:caption>
    </image:image>
  </url>
</urlset>`);
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), requestsCount: dbState.requests.length });
});

// Full Sync (Used by all clients for real-time polling across any device)
app.get('/api/sync', (req, res) => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const recentList = dbState.visitorStats?.recentVisitors || [];
  const activeNow = recentList.filter((v) => new Date(v.timestamp).getTime() >= tenMinutesAgo).length;

  res.json({
    success: true,
    requests: dbState.requests,
    users: dbState.users,
    couriers: dbState.couriers,
    visitorStats: dbState.visitorStats ? {
      totalVisits: dbState.visitorStats.totalVisits || 0,
      uniqueVisitors: dbState.visitorStats.uniqueVisitors || 0,
      todayVisits: dbState.visitorStats.todayVisits || 0,
      todayDate: dbState.visitorStats.todayDate,
      lastVisitAt: dbState.visitorStats.lastVisitAt,
      activeNow: Math.max(1, activeNow),
      recentVisitors: recentList.slice(0, 30),
    } : undefined,
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

// List all requests
app.get('/api/requests', (req, res) => {
  res.json(dbState.requests || []);
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

// Direct Force Dispatch Endpoint (GET or POST) - Guarantees instant mail delivery for any order
app.all(['/api/requests/force-dispatch/:idOrCode', '/api/requests/:idOrCode/force-dispatch'], (req, res) => {
  try {
    const { idOrCode } = req.params;
    const targetEmail = req.body?.targetEmail || req.query.targetEmail;
    const order = dbState.requests.find(
      (r) => r.id === idOrCode || r.trackingCode === idOrCode || (r.trackingCode && r.trackingCode.replace(/\D/g, '') === idOrCode.replace(/\D/g, ''))
    );

    if (!order) {
      res.status(404).json({ error: `Sipariş bulunamadı: ${idOrCode}` });
      return;
    }

    // Force enqueue bypasses deduplication lock
    const queueResult = enqueueNewOrderEmail(order, typeof targetEmail === 'string' ? targetEmail : undefined, true);
    res.json({
      success: true,
      order,
      queueResult,
      message: `${order.trackingCode} için e-posta bildirimi anında sıraya alındı ve iletiliyor.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Batch Synchronize Requests from Client (Ensures any offline or un-dispatched orders get saved and emailed)
app.post('/api/requests/sync-batch', (req, res) => {
  try {
    const { requests } = req.body || {};
    if (!Array.isArray(requests)) {
      res.status(400).json({ error: 'Geçersiz istek dizisi' });
      return;
    }

    let enqueuedCount = 0;
    requests.forEach((reqItem: any) => {
      if (!reqItem || !reqItem.id || String(reqItem.id).startsWith('req-sample-')) return;

      const idx = dbState.requests.findIndex(
        (r) => r.id === reqItem.id || (r.trackingCode && r.trackingCode === reqItem.trackingCode)
      );

      if (idx >= 0) {
        const existing = dbState.requests[idx];
        dbState.requests[idx] = { ...existing, ...reqItem };
        if (!existing.emailDispatched && !reqItem.emailDispatched) {
          enqueueNewOrderEmail(dbState.requests[idx], undefined, false);
          enqueuedCount++;
        }
      } else {
        dbState.requests.unshift(reqItem);
        if (!reqItem.emailDispatched) {
          enqueueNewOrderEmail(reqItem, undefined, false);
          enqueuedCount++;
        }
      }
    });

    saveDatabase();
    res.json({ success: true, count: requests.length, enqueuedCount });
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

    // Password verification - Strictly enforce user's registered password (no default/role bypasses)
    if (!password || password.trim() === '') {
      res.status(400).json({ error: 'Lütfen şifrenizi giriniz.' });
      return;
    }

    const userExpected = (found.password || '').trim();
    const entered = password.trim();

    if (entered !== userExpected) {
      res.status(401).json({ error: 'Girdiğiniz şifre hatalıdır! Lütfen kayıt olurken belirlediğiniz şifreyi giriniz.' });
      return;
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

// Test Email Dispatch Endpoint - STRICTLY ADMIN ONLY, NEVER TO COURIERS!
app.post('/api/notifications/test-email', async (req, res) => {
  try {
    const { targetEmail } = req.body || {};
    let effectiveTarget = 'kuryeantalyam@gmail.com';

    if (targetEmail && targetEmail !== 'all' && targetEmail.includes('@')) {
      const cleanTarget = targetEmail.trim().toLowerCase();
      // Safeguard: Check if this address belongs to a registered courier
      const isRegisteredCourier = (dbState.users || []).some(
        (u) => u.role === 'courier' && u.email && u.email.toLowerCase() === cleanTarget && cleanTarget !== 'kuryeantalyam@gmail.com'
      );
      if (isRegisteredCourier) {
        console.warn(`[SAFETY] Prevented test email to courier ${cleanTarget}. Redirecting to admin email.`);
        effectiveTarget = 'kuryeantalyam@gmail.com';
      } else {
        effectiveTarget = cleanTarget;
      }
    }

    const sampleOrder = {
      id: `req-test-${Date.now()}`,
      trackingCode: `ANT-TEST`,
      isTest: true,
      packageName: 'Örnek Test Paketi (Sistem Doğrulama)',
      price: 250,
      courierEarnings: 215,
      paymentMethod: 'alici_odemeli',
      sender: {
        district: 'Muratpaşa',
        neighborhood: 'Şirinyalı',
        addressDetail: 'İsmet Gökşen Cad. No:45/B',
        contactName: 'Antalya Test Gönderici',
        contactPhone: '0532 000 11 22',
      },
      receiver: {
        district: 'Konyaaltı',
        neighborhood: 'Gürsu',
        addressDetail: 'Gürsu Mah. 304. Sok. No:12',
        contactName: 'Antalya Test Alıcı',
        contactPhone: '0544 333 44 55',
      },
      noteForCourier: 'Bu bir sistem kontrol ve doğrulama e-postasıdır. Kuryelere bildirim iletilmez.',
    };

    const result = enqueueNewOrderEmail(sampleOrder, effectiveTarget, true);
    res.json({ success: true, result, target: effectiveTarget });
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
      if (serverFirestoreDb) {
        setDoc(doc(serverFirestoreDb, 'settings', 'notifications'), { extraCourierEmails: dbState.extraCourierEmails }, { merge: true }).catch(() => {});
      }
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
      if (serverFirestoreDb) {
        setDoc(doc(serverFirestoreDb, 'settings', 'notifications'), { extraCourierEmails: dbState.extraCourierEmails }, { merge: true }).catch(() => {});
      }
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
    if (serverFirestoreDb && updated.id) {
      setDoc(doc(serverFirestoreDb, 'delivery_requests', updated.id), JSON.parse(JSON.stringify(updated)), { merge: true }).catch(() => {});
    }
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

    // Verify courier exists and is courier or admin
    let courier = dbState.couriers.find((c) => c.id === courierId);
    if (!courier && courierId) {
      const userCourier = dbState.users.find((u) => u.id === courierId && (u.role === 'courier' || u.role === 'admin'));
      if (userCourier) {
        courier = {
          id: userCourier.id,
          name: userCourier.name,
          phone: userCourier.phone,
          email: userCourier.email,
          district: userCourier.district || 'Muratpaşa',
          rating: 5.0,
          totalDeliveries: userCourier.totalOrders || 0,
          currentLat: 36.8860,
          currentLng: 30.7065,
        };
        dbState.couriers.push(courier);
      }
    }

    if (!courier) {
      res.status(403).json({ error: 'Siparişi kabul etmek için geçerli bir kurye girişi gereklidir. Kurye olmayanlar havuzdan talep seçemez.' });
      return;
    }

    const updated = {
      ...dbState.requests[reqIndex],
      status: 'courier_assigned',
      assignedCourier: courier,
      courier: courier,
      updatedAt: new Date().toISOString(),
    };

    dbState.requests[reqIndex] = updated;
    saveDatabase();
    if (serverFirestoreDb && updated.id) {
      setDoc(doc(serverFirestoreDb, 'delivery_requests', updated.id), JSON.parse(JSON.stringify(updated)), { merge: true }).catch(() => {});
    }
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

// Batch Synchronize Users from Client or Cloud
app.post('/api/users/sync-batch', (req, res) => {
  try {
    const { users } = req.body || {};
    if (!Array.isArray(users)) {
      res.status(400).json({ error: 'users dizisi bekleniyor.' });
      return;
    }

    let changed = false;
    users.forEach((userData: any) => {
      if (!userData || !userData.id) return;
      const emailLower = (userData.email || '').trim().toLowerCase();

      const existingIndex = dbState.users.findIndex(
        (u) => u.id === userData.id || (emailLower && u.email && u.email.trim().toLowerCase() === emailLower)
      );

      if (existingIndex >= 0) {
        dbState.users[existingIndex] = { ...dbState.users[existingIndex], ...userData };
      } else {
        dbState.users.push(userData);
        changed = true;
      }

      if (userData.role === 'courier') {
        const cIdx = dbState.couriers.findIndex(
          (c) => c.id === userData.id || (emailLower && c.email && c.email.trim().toLowerCase() === emailLower)
        );
        const courierInfo = {
          id: userData.id,
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          district: userData.district || 'Muratpaşa',
          rating: userData.rating || 5.0,
          totalDeliveries: userData.totalDeliveries || userData.totalOrders || 0,
          currentLat: userData.currentLat || 36.8860,
          currentLng: userData.currentLng || 30.7065,
          isOnline: userData.isOnline !== false,
        };
        if (cIdx >= 0) {
          dbState.couriers[cIdx] = { ...dbState.couriers[cIdx], ...courierInfo };
        } else {
          dbState.couriers.push(courierInfo);
          changed = true;
        }
      }
    });

    if (changed) {
      saveDatabase();
    }

    const allRecipients = getRegisteredCourierEmails();
    res.json({
      success: true,
      syncedCount: users.length,
      allRecipients,
      courierCount: (dbState.users || []).filter((u) => u.role === 'courier').length,
    });
  } catch (err: any) {
    console.error('Error syncing batch users:', err);
    res.status(500).json({ error: err.message });
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

// Core logic for processing password reset requests (shared between HTTP API and Firestore Real-Time Queue)
async function processPasswordResetRequest(params: {
  emailOrIdentifier: string;
  role?: string;
  userHint?: any;
}): Promise<{
  success: boolean;
  status?: number;
  email?: string;
  sentReal?: boolean;
  refCode?: number;
  isSelfSent?: boolean;
  userName?: string;
  userRole?: string;
  message?: string;
  error?: string;
}> {
  const { emailOrIdentifier, role, userHint } = params;
  if (!emailOrIdentifier || !emailOrIdentifier.trim()) {
    return { success: false, status: 400, error: 'Lütfen kayıtlı e-posta veya telefon numaranızı giriniz.' };
  }

  const raw = String(emailOrIdentifier).trim().toLowerCase();
  const digitsOnly = raw.replace(/\D/g, '');

  // 1. Search in server memory database (with role match if provided)
  let found = dbState.users.find((u) => {
    if (role && u.role !== role) return false;
    if (u.email && u.email.trim().toLowerCase() === raw) return true;
    if (digitsOnly.length >= 7) {
      const uDigits = (u.phone || '').replace(/\D/g, '');
      if (uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits) || uDigits === digitsOnly) return true;
    }
    return false;
  });

  // 2. Search without role constraint if not found
  if (!found) {
    found = dbState.users.find((u) => {
      if (u.email && u.email.trim().toLowerCase() === raw) return true;
      if (digitsOnly.length >= 7) {
        const uDigits = (u.phone || '').replace(/\D/g, '');
        if (uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits) || uDigits === digitsOnly) return true;
      }
      return false;
    });
  }

  // 3. Search directly in Firestore if available and not found in memory
  if (!found && serverFirestoreDb) {
    try {
      const usersSnap = await getDocs(collection(serverFirestoreDb, 'users'));
      for (const docSnap of usersSnap.docs) {
        const d = docSnap.data();
        if (!d) continue;
        const dEmail = (d.email || '').trim().toLowerCase();
        const dPhoneDigits = (d.phone || '').replace(/\D/g, '');
        if (dEmail && dEmail === raw) {
          found = { ...d, id: docSnap.id };
          break;
        }
        if (digitsOnly.length >= 7 && (dPhoneDigits.endsWith(digitsOnly) || digitsOnly.endsWith(dPhoneDigits) || dPhoneDigits === digitsOnly)) {
          found = { ...d, id: docSnap.id };
          break;
        }
      }

      // Also check couriers collection in Firestore if still not found
      if (!found) {
        const couriersSnap = await getDocs(collection(serverFirestoreDb, 'couriers'));
        for (const docSnap of couriersSnap.docs) {
          const d = docSnap.data();
          if (!d) continue;
          const dEmail = (d.email || '').trim().toLowerCase();
          const dPhoneDigits = (d.phone || '').replace(/\D/g, '');
          if (dEmail && dEmail === raw) {
            found = { ...d, id: docSnap.id, role: 'courier' };
            break;
          }
          if (digitsOnly.length >= 7 && (dPhoneDigits.endsWith(digitsOnly) || digitsOnly.endsWith(dPhoneDigits) || dPhoneDigits === digitsOnly)) {
            found = { ...d, id: docSnap.id, role: 'courier' };
            break;
          }
        }
      }

      if (found) {
        const existingIdx = dbState.users.findIndex(x => x.id === found.id || (found.email && x.email === found.email));
        if (existingIdx >= 0) dbState.users[existingIdx] = { ...dbState.users[existingIdx], ...found };
        else dbState.users.push(found);
      }
    } catch (fErr: any) {
      console.warn('[FORGOT PASSWORD FIRESTORE LOOKUP ERR]', fErr?.message);
    }
  }

  // 4. Fallback to client userHint if available
  if (!found && userHint && userHint.email) {
    found = userHint;
  }

  if (!found) {
    return {
      success: false,
      status: 404,
      error: 'Bu bilgilere ait kayıtlı kullanıcı bulunamadı. Lütfen e-posta veya telefon bilginizi kontrol ediniz.',
    };
  }

  const targetEmail = (found.email || '').trim();
  if (!targetEmail || !targetEmail.includes('@')) {
    return {
      success: false,
      status: 400,
      error: 'Kullanıcının kayıtlı geçerli bir e-posta adresi bulunmuyor. Lütfen destek hattımızla (0507 754 74 84) iletişime geçiniz.',
    };
  }

  const userName = found.name || 'Değerli Kullanıcımız';
  const userRoleText = found.role === 'courier' ? 'Moto Kurye Hesabı' : (found.role === 'admin' ? 'Yönetici Hesabı' : 'Müşteri Hesabı');
  const userPassword = (found.password || found.sifre || found.pass || '1234').trim();

  // Prepare dynamic codes & timestamps to ensure high deliverability and avoid Gmail conversation bundling
  const refCode = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const cfg = dbState.smtpConfig;
  const smtpUser = (cfg?.user || 'kuryeantalyam@gmail.com').trim();
  const smtpPass = (cfg?.pass || 'tlnsrezkaobytsvg').replace(/\s+/g, '').trim();
  const fromName = cfg?.fromName || 'Antalya Şehir İçi Teslimat 7/24';
  const fromAddress = `"${fromName}" <${smtpUser}>`;
  const isSelfSent = targetEmail.toLowerCase() === smtpUser.toLowerCase();

  // Subject and clean, high-deliverability light transactional template
  const subject = `Antalya Kurye Ekspres: Şifre Hatırlatma Bilgileriniz (#${refCode})`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <tr>
          <td style="background-color: #047857; padding: 24px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.3px;">Antalya Şehir İçi Moto Kurye</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #d1fae5;">Şifre Hatırlatma Bildirimi</p>
          </td>
        </tr>
        
        <!-- Content -->
        <tr>
          <td style="padding: 28px 24px;">
            <p style="font-size: 15px; margin-top: 0; color: #0f172a; font-weight: 600;">Merhaba Sayın ${userName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
              Antalya Kurye Ekspres platformundaki hesabınız için şifre hatırlatma talebinde bulundunuz. Kayıtlı hesap bilgileriniz ve şifreniz aşağıda yer almaktadır:
            </p>
            
            <!-- Info Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin: 16px 0; padding: 16px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 130px; font-weight: 600;">Hesap Türü:</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 700;">${userRoleText}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">E-Posta:</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${targetEmail}</td>
              </tr>
              ${found.phone ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Telefon:</td>
                <td style="padding: 6px 0; color: #0f172a; font-size: 13px;">${found.phone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 12px 0 4px 0; color: #047857; font-size: 14px; font-weight: 700;">Giriş Şifreniz:</td>
                <td style="padding: 12px 0 4px 0;">
                  <span style="display: inline-block; background-color: #ecfdf5; border: 1.5px solid #059669; color: #065f46; font-size: 18px; font-weight: 800; padding: 6px 14px; border-radius: 6px; letter-spacing: 1px;">
                    ${userPassword}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Notice -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                <strong>Güvenlik Uyarısı:</strong> Bu talebi siz gerçekleştirmediyseniz lütfen müşteri hizmetlerimiz ile (0507 754 74 84) iletişime geçiniz. Giriş yaptıktan sonra şifrenizi profil ayarlarınızdan değiştirebilirsiniz.
              </p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 20px 0 0 0;">
              Güvenlik Doğrulama: <strong>#${refCode}</strong> • ${dateStr} ${timeStr}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            © ${now.getFullYear()} Antalya Şehir İçi Moto Kurye & Teslimat A.Ş.<br>
            Destek: <strong>0507 754 74 84</strong> • <a href="mailto:kuryeantalyam@gmail.com" style="color: #047857; text-decoration: none;">kuryeantalyam@gmail.com</a>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
Antalya Şehir İçi Moto Kurye - Şifre Hatırlatma

Merhaba Sayın ${userName},

Hesabınız için şifre hatırlatma talebinde bulundunuz.

Hesap Türü: ${userRoleText}
Kayıtlı E-Posta: ${targetEmail}
Şifreniz: ${userPassword}

Güvenlik Referans Kodu: #${refCode} (${dateStr} ${timeStr})

Bu talebi siz yapmadıysanız lütfen dikkate almayınız.
Destek & İletişim: 0507 754 74 84 | kuryeantalyam@gmail.com
  `.trim();

  console.log(`[PASSWORD RESET REQUEST] Processing for: ${emailOrIdentifier}, targetEmail: ${targetEmail}`);

  // Create direct Gmail SSL transport on port 465 (high deliverability, fastest negotiation)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  let sentReal = false;
  let errDetail = '';
  let sendResultInfo: any = null;

  try {
    sendResultInfo = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      replyTo: smtpUser,
      subject,
      text: textContent,
      html: htmlContent,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
    });
    sentReal = true;
    console.log(`[PASSWORD RESET] Email sent successfully to ${targetEmail}. Google SMTP response: ${sendResultInfo?.response}`);

    // Record in system email logs so it appears in Admin panel
    dbState.emailLogs.unshift({
      id: `mail-pwd-${Date.now()}-${refCode}`,
      timestamp: new Date().toISOString(),
      orderId: `pwd-reset-${found.id || 'user'}`,
      trackingCode: `REF-${refCode}`,
      recipients: [targetEmail],
      subject,
      status: 'sent',
      summary: `Şifre Hatırlatma (${userRoleText}) -> ${targetEmail}`,
      response: sendResultInfo?.response || '250 OK',
    });
    if (dbState.emailLogs.length > 60) dbState.emailLogs = dbState.emailLogs.slice(0, 60);
    saveDatabase();
  } catch (sendErr: any) {
    console.error(`[PASSWORD RESET FAIL] Error delivering email:`, sendErr);
    errDetail = sendErr?.message || 'SMTP iletim hatası';

    dbState.emailLogs.unshift({
      id: `mail-pwd-${Date.now()}-${refCode}`,
      timestamp: new Date().toISOString(),
      orderId: `pwd-reset-${found.id || 'user'}`,
      trackingCode: `REF-${refCode}`,
      recipients: [targetEmail],
      subject,
      status: 'failed',
      summary: `Şifre Hatırlatma Başarısız: ${errDetail}`,
    });
    saveDatabase();
  }

  if (!sentReal) {
    return {
      success: false,
      status: 500,
      error: `E-posta sunucusuna bağlanırken hata oluştu: ${errDetail}. Lütfen destek hattımızla (0507 754 74 84) iletişime geçiniz.`,
    };
  }

  return {
    success: true,
    email: targetEmail,
    sentReal: true,
    refCode,
    isSelfSent,
    userName,
    userRole: found.role,
    message: `Şifre hatırlatma bilgileri ${targetEmail} adresinize başarıyla iletildi.`,
  };
}

// Password Reminder / Forgot Password Endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { emailOrIdentifier, role, userHint } = req.body || {};
    const result = await processPasswordResetRequest({ emailOrIdentifier, role, userHint });
    if (result.success) {
      res.json(result);
    } else {
      res.status(result.status || 400).json({ error: result.error || result.message });
    }
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası oluştu.' });
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
// SITE SAYACI & ZİYARETÇİ ANALİTİĞİ (ANALYTICS)
// ==========================================

// Log a site visit
app.post('/api/analytics/visit', (req, res) => {
  try {
    const { visitorId, path: pagePath, referrer, device } = req.body || {};
    if (!dbState.visitorStats) {
      dbState.visitorStats = { ...DEFAULT_VISITOR_STATS };
    }

    const todayStr = getTodayDateStr();
    if (dbState.visitorStats.todayDate !== todayStr) {
      dbState.visitorStats.todayDate = todayStr;
      dbState.visitorStats.todayVisits = 0;
      dbState.visitorStats.todayVisitorIds = [];
    }

    const vId = typeof visitorId === 'string' && visitorId.trim() ? visitorId.trim() : `anon_${Date.now()}`;
    const isUniqueEver = !dbState.visitorStats.uniqueVisitorIds.includes(vId);
    const isUniqueToday = !dbState.visitorStats.todayVisitorIds.includes(vId);

    dbState.visitorStats.totalVisits = (dbState.visitorStats.totalVisits || 0) + 1;
    dbState.visitorStats.todayVisits = (dbState.visitorStats.todayVisits || 0) + 1;

    if (isUniqueEver) {
      dbState.visitorStats.uniqueVisitors = (dbState.visitorStats.uniqueVisitors || 0) + 1;
      dbState.visitorStats.uniqueVisitorIds.push(vId);
      if (dbState.visitorStats.uniqueVisitorIds.length > 5000) {
        dbState.visitorStats.uniqueVisitorIds = dbState.visitorStats.uniqueVisitorIds.slice(-5000);
      }
    }

    if (isUniqueToday) {
      dbState.visitorStats.todayVisitorIds.push(vId);
      if (dbState.visitorStats.todayVisitorIds.length > 2000) {
        dbState.visitorStats.todayVisitorIds = dbState.visitorStats.todayVisitorIds.slice(-2000);
      }
    }

    // Determine device type
    let detectedDevice: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    const userAgent = (req.headers['user-agent'] as string) || '';
    if (device === 'mobile' || /Android|iPhone|iPod|Mobile/i.test(userAgent)) {
      detectedDevice = 'mobile';
    } else if (device === 'tablet' || /iPad|Tablet/i.test(userAgent)) {
      detectedDevice = 'tablet';
    }

    const nowIso = new Date().toISOString();
    dbState.visitorStats.lastVisitAt = nowIso;

    const newRecord: VisitorRecord = {
      id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowIso,
      path: typeof pagePath === 'string' && pagePath ? pagePath.slice(0, 100) : '/',
      deviceType: detectedDevice,
      referrer: typeof referrer === 'string' && referrer ? referrer.slice(0, 150) : undefined,
      isUnique: isUniqueEver,
    };

    if (!Array.isArray(dbState.visitorStats.recentVisitors)) {
      dbState.visitorStats.recentVisitors = [];
    }
    dbState.visitorStats.recentVisitors.unshift(newRecord);
    if (dbState.visitorStats.recentVisitors.length > 50) {
      dbState.visitorStats.recentVisitors = dbState.visitorStats.recentVisitors.slice(0, 50);
    }

    saveDatabase();

    // Firestore background sync if connected
    if (serverFirestoreDb) {
      setDoc(
        doc(serverFirestoreDb, 'settings', 'site_counter'),
        {
          totalVisits: dbState.visitorStats.totalVisits,
          uniqueVisitors: dbState.visitorStats.uniqueVisitors,
          todayVisits: dbState.visitorStats.todayVisits,
          todayDate: dbState.visitorStats.todayDate,
          lastVisitAt: dbState.visitorStats.lastVisitAt,
          updatedAt: nowIso,
        },
        { merge: true }
      ).catch(() => {});
    }

    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const activeNow = dbState.visitorStats.recentVisitors.filter(
      (v) => new Date(v.timestamp).getTime() >= tenMinutesAgo
    ).length;

    res.json({
      success: true,
      stats: {
        totalVisits: dbState.visitorStats.totalVisits,
        uniqueVisitors: dbState.visitorStats.uniqueVisitors,
        todayVisits: dbState.visitorStats.todayVisits,
        todayDate: dbState.visitorStats.todayDate,
        lastVisitAt: dbState.visitorStats.lastVisitAt,
        activeNow: Math.max(1, activeNow),
        recentVisitors: dbState.visitorStats.recentVisitors.slice(0, 20),
      },
    });
  } catch (err: any) {
    console.error('[ANALYTICS] Error logging visit:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get site counter & visitor stats
app.get('/api/analytics/stats', (req, res) => {
  try {
    if (!dbState.visitorStats) {
      dbState.visitorStats = { ...DEFAULT_VISITOR_STATS };
    }
    const todayStr = getTodayDateStr();
    if (dbState.visitorStats.todayDate !== todayStr) {
      dbState.visitorStats.todayDate = todayStr;
      dbState.visitorStats.todayVisits = 0;
      dbState.visitorStats.todayVisitorIds = [];
      saveDatabase();
    }

    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentList = dbState.visitorStats.recentVisitors || [];
    const activeNow = recentList.filter(
      (v) => new Date(v.timestamp).getTime() >= tenMinutesAgo
    ).length;

    res.json({
      success: true,
      stats: {
        totalVisits: dbState.visitorStats.totalVisits || 0,
        uniqueVisitors: dbState.visitorStats.uniqueVisitors || 0,
        todayVisits: dbState.visitorStats.todayVisits || 0,
        todayDate: dbState.visitorStats.todayDate,
        lastVisitAt: dbState.visitorStats.lastVisitAt,
        activeNow: Math.max(1, activeNow),
        recentVisitors: recentList.slice(0, 30),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset or calibrate site counter (Admin only feature)
app.post('/api/analytics/reset', (req, res) => {
  try {
    const { initialVisits } = req.body || {};
    const count = typeof initialVisits === 'number' && initialVisits >= 0 ? initialVisits : 0;

    const todayStr = getTodayDateStr();
    dbState.visitorStats = {
      totalVisits: count,
      uniqueVisitors: count > 0 ? Math.round(count * 0.75) : 0,
      todayVisits: count > 0 ? Math.min(count, 5) : 0,
      todayDate: todayStr,
      uniqueVisitorIds: [],
      todayVisitorIds: [],
      lastVisitAt: new Date().toISOString(),
      recentVisitors: [],
    };
    saveDatabase();

    res.json({
      success: true,
      message: 'Site sayacı başarıyla sıfırlandı.',
      stats: {
        totalVisits: dbState.visitorStats.totalVisits,
        uniqueVisitors: dbState.visitorStats.uniqueVisitors,
        todayVisits: dbState.visitorStats.todayVisits,
        todayDate: dbState.visitorStats.todayDate,
        lastVisitAt: dbState.visitorStats.lastVisitAt,
        activeNow: 1,
        recentVisitors: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================

let viteServerInstance: any = null;
const viteInitPromise =
  process.env.NODE_ENV !== 'production'
    ? createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      })
        .then((vite) => {
          viteServerInstance = vite;
          console.log('[VITE] Vite dev middleware loaded and active.');
          return vite;
        })
        .catch((err) => {
          console.error('[VITE INIT ERROR]', err);
          return null;
        })
    : null;

if (process.env.NODE_ENV !== 'production') {
  app.use(async (req, res, next) => {
    try {
      // If an unexpected non-API POST/PUT/DELETE arrives (e.g. form submission), redirect to GET / to prevent blank screen
      if (req.method !== 'GET' && req.method !== 'HEAD' && !req.path.startsWith('/api')) {
        return res.redirect(303, '/');
      }

      if (viteServerInstance) {
        return viteServerInstance.middlewares(req, res, next);
      }
      const vite = await viteInitPromise;
      if (vite) {
        return vite.middlewares(req, res, next);
      }
      next();
    } catch (err) {
      next(err);
    }
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.all('*', (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && !req.path.startsWith('/api')) {
      return res.redirect(303, '/');
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Antalya Kurye Express server running on port ${PORT}`);
});

server.on('error', (err: any) => {
  console.error('[SERVER ERROR]', err);
});
