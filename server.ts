import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

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

interface ServerDatabase {
  users: any[];
  couriers: any[];
  requests: any[];
  updatedAt: string;
}

let dbState: ServerDatabase = {
  users: DEFAULT_USERS,
  couriers: DEFAULT_COURIERS,
  requests: [],
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
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
        console.log(`[DB] Database loaded successfully: ${dbState.requests.length} requests, ${dbState.users.length} users`);
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
    res.json({ success: true, request: newRequest });
  } catch (err: any) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
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
