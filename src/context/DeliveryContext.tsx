import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CourierInfo, DeliveryRequest, DeliveryStatus, DistrictName, UserAccount, UserRole } from '../types';
import { INITIAL_COURIERS, INITIAL_REQUESTS, INITIAL_USERS } from '../data/mockData';
import { calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { playAcceptSound, playNewOrderSound, playSuccessSound } from '../utils/audio';
import {
  dispatchOrderStatusNotification,
  getNotificationPermission,
  requestNotificationPermission,
} from '../services/notificationService';
import {
  subscribeToDeliveryRequests,
  subscribeToUsers,
  saveRequestToFirestore,
  updateRequestInFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
} from '../services/firestoreService';

interface DeliveryContextType {
  // Users & Auth
  currentUser: UserAccount;
  users: UserAccount[];
  courierUsers: UserAccount[];
  switchUser: (userId: string) => void;
  setCurrentUser: (user: UserAccount) => void;
  loginUser: (identifier: string, passwordInput?: string) => { success: boolean; user?: UserAccount; message?: string };
  switchRole: (role: UserRole) => void;
  registerUser: (userData: Omit<UserAccount, 'id' | 'createdAt' | 'totalOrders' | 'totalEarnings'>) => UserAccount;
  updateCurrentUserProfile: (data: Partial<UserAccount>) => void;
  logout: () => void;
  addCourier: (data: { name: string; phone: string; email: string; password?: string; district?: DistrictName }) => UserAccount;
  deleteCourier: (courierId: string) => void;
  updateCourier: (courierId: string, data: Partial<UserAccount>) => void;

  // Auth Modal Controls
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'courier_login' | 'admin_login';
  setAuthModalTab: (tab: 'login' | 'register' | 'courier_login' | 'admin_login') => void;
  authModalNotice: string | null;
  setAuthModalNotice: (notice: string | null) => void;
  openAuthModal: (tab?: 'login' | 'register' | 'courier_login' | 'admin_login', notice?: string | null) => void;
  closeAuthModal: () => void;

  // Requests
  requests: DeliveryRequest[];
  couriers: CourierInfo[];
  activeCourier: CourierInfo;
  isCourierOnline: boolean;
  setIsCourierOnline: (online: boolean) => void;
  setActiveCourierId: (id: string) => void;
  
  // Navigation & selection
  currentView: 'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'admin' | 'profile';
  setCurrentView: (view: 'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'admin' | 'profile') => void;
  selectedTrackingId: string | null;
  setSelectedTrackingId: (id: string | null) => void;
  
  // Actions
  createNewRequest: (params: Omit<DeliveryRequest, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'status' | 'deliveryCode' | 'estimatedDistanceKm' | 'estimatedDurationMins' | 'price' | 'courierEarnings'>) => DeliveryRequest;
  acceptRequest: (requestId: string, courierId?: string) => void;
  updateStatus: (requestId: string, nextStatus: DeliveryStatus) => { success: boolean; message?: string };
  rateDelivery: (requestId: string, rating: number, feedback: string) => void;
  cancelRequest: (requestId: string) => void;
  releaseRequestBackToPool: (requestId: string) => void;
  addDemoRequest: () => void;
  exportDatabaseBackup: () => void;
  importDatabaseBackup: (jsonString: string) => boolean;
  resetDefaultData: () => void;
  
  // Notification Service Controls
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotifications: () => Promise<boolean>;
  
  // Filtered lists
  poolRequests: DeliveryRequest[];
  activeCourierDeliveries: DeliveryRequest[];
  myCustomerOrders: DeliveryRequest[];
  activeStats: {
    poolCount: number;
    inTransitCount: number;
    completedTodayCount: number;
    courierEarningsToday: number;
    myOrdersCount: number;
    courierCount: number;
  };
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

// Persistent Local Database Keys (permanent keys with backwards migration)
const STORAGE_ORDERS_KEY = 'antalya_kurye_database_orders';
const STORAGE_USERS_KEY = 'antalya_kurye_database_users';
const STORAGE_ACTIVE_USER_ID_KEY = 'antalya_kurye_database_active_user_id';
const STORAGE_CURRENT_VIEW_KEY = 'antalya_kurye_database_current_view';

const ALL_USER_KEYS = [
  STORAGE_USERS_KEY,
  'antalya_kurye_database_v7_users',
  'antalya_kurye_database_v6_users',
  'antalya_kurye_database_v5_users',
  'antalya_kurye_database_v4_users',
];

const ALL_ORDER_KEYS = [
  STORAGE_ORDERS_KEY,
  'antalya_kurye_database_v7_orders',
  'antalya_kurye_database_v6_orders',
  'antalya_kurye_database_v5_orders',
  'antalya_kurye_database_v4_orders',
];

// Helper to safely determine initial view from URL hash or localStorage
const getInitialView = (): 'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'profile' => {
  try {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (['home', 'customer', 'courier', 'tracker', 'history', 'profile'].includes(hash)) {
        return hash as any;
      }
      const saved = localStorage.getItem(STORAGE_CURRENT_VIEW_KEY) || sessionStorage.getItem(STORAGE_CURRENT_VIEW_KEY);
      if (saved && ['home', 'customer', 'courier', 'tracker', 'history', 'profile'].includes(saved)) {
        return saved as any;
      }
    }
  } catch (e) {
    console.warn('Initial view load error:', e);
  }
  return 'home';
};

// Helper to safely load and merge users ensuring system accounts NEVER disappear
const loadPersistentUsers = (): UserAccount[] => {
  let savedUsers: UserAccount[] = [];
  try {
    for (const key of ALL_USER_KEYS) {
      const saved = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            savedUsers = parsed;
            break;
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('User storage read error:', e);
  }

  // Combine initial system accounts and saved custom accounts
  const userMap = new Map<string, UserAccount>();
  
  // 1. Initial standard system accounts
  INITIAL_USERS.forEach((u) => {
    userMap.set(u.id, u);
    if (u.email) userMap.set(u.email.toLowerCase(), u);
  });

  // 2. Merge saved users (preserve any passwords and new registered accounts)
  savedUsers.forEach((u) => {
    if (u && u.id) {
      const existing = userMap.get(u.id);
      if (existing) {
        userMap.set(u.id, { ...existing, ...u });
      } else {
        userMap.set(u.id, u);
      }
    }
  });

  // Return unique user objects
  const uniqueUsers = Array.from(new Set(Array.from(userMap.values())));
  return uniqueUsers;
};

// Helper to safely load orders and ensure pending requests exist
const loadPersistentOrders = (): DeliveryRequest[] => {
  try {
    for (const key of ALL_ORDER_KEYS) {
      const saved = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out old legacy sample requests so only real customer orders are shown
            const realOrders = parsed.filter(
              (r: DeliveryRequest) => r && r.id && typeof r.id === 'string' && !r.id.startsWith('req-sample-')
            );
            if (realOrders.length > 0) {
              return realOrders;
            }
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('Orders storage read error:', e);
  }
  return [];
};

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Persistent Users (Always resilient)
  const [users, setUsers] = useState<UserAccount[]>(loadPersistentUsers);

  // 2. Active Authenticated User
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_USER_ID_KEY) || sessionStorage.getItem(STORAGE_ACTIVE_USER_ID_KEY);
      if (saved) return saved;
    } catch (e) {
      console.warn('Active user id read error:', e);
    }
    return INITIAL_USERS[0].id;
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  // 3. Persistent Orders
  const [requests, setRequests] = useState<DeliveryRequest[]>(loadPersistentOrders);

  const [couriers, setCouriers] = useState<CourierInfo[]>(INITIAL_COURIERS);
  const [activeCourierId, setActiveCourierId] = useState<string>('user-courier-01');
  const [isCourierOnline, setIsCourierOnline] = useState<boolean>(true);
  
  // 4. Persistent Current View (Preserved across page refreshes!)
  const [currentView, setCurrentViewInternal] = useState<'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'admin' | 'profile'>(getInitialView as any);
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);

  // 5. Global Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'courier_login' | 'admin_login'>('login');
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);

  // Ref to track last seen pool count for audio notification across devices
  const prevPoolCountRef = React.useRef<number>(0);

  // =========================================================================
  // REAL-TIME FIRESTORE & SERVER SYNC (Cross-Device Cloud Synchronization)
  // =========================================================================
  useEffect(() => {
    // 1. Cloud Firestore Real-time Listener for instant cross-device updates
    const unsubscribeRequests = subscribeToDeliveryRequests((cloudRequests) => {
      if (cloudRequests && cloudRequests.length > 0) {
        setRequests((prev) => {
          const newPool = cloudRequests.filter((r) => r.status === 'pending_pool');
          if (newPool.length > prevPoolCountRef.current && prevPoolCountRef.current > 0) {
            try {
              playNewOrderSound();
            } catch {}
          }
          prevPoolCountRef.current = newPool.length;

          try {
            localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(cloudRequests));
          } catch {}
          return cloudRequests;
        });
      }
    });

    const unsubscribeUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers((prev) => {
          const userMap = new Map();
          INITIAL_USERS.forEach((u) => userMap.set(u.id, u));
          prev.forEach((u) => userMap.set(u.id, u));
          cloudUsers.forEach((u) => userMap.set(u.id, { ...(userMap.get(u.id) || {}), ...u }));
          const merged = Array.from(userMap.values());
          try {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    // 2. Also poll Express API as additional resilient fallback
    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/sync');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success) {
          if (Array.isArray(data.requests) && data.requests.length > 0) {
            setRequests((prev) => {
              const newPool = data.requests.filter((r: DeliveryRequest) => r.status === 'pending_pool');
              if (newPool.length > prevPoolCountRef.current && prevPoolCountRef.current > 0) {
                try {
                  playNewOrderSound();
                } catch {}
              }
              prevPoolCountRef.current = newPool.length;

              if (JSON.stringify(prev) !== JSON.stringify(data.requests)) {
                try {
                  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(data.requests));
                } catch {}
                return data.requests;
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);

    return () => {
      unsubscribeRequests();
      unsubscribeUsers();
      clearInterval(interval);
    };
  }, []);

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'courier_login' | 'admin_login' = 'login', notice: string | null = null) => {
    setAuthModalTab(tab);
    setAuthModalNotice(notice);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalNotice(null);
  }, []);

  // Set Current View with persistence and URL history pushState for mobile back-button support
  const setCurrentView = useCallback((view: 'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'admin' | 'profile') => {
    setCurrentViewInternal(view);
    try {
      localStorage.setItem(STORAGE_CURRENT_VIEW_KEY, view);
      sessionStorage.setItem(STORAGE_CURRENT_VIEW_KEY, view);
      if (typeof window !== 'undefined') {
        const targetHash = view === 'home' ? '' : `#${view}`;
        const currentHash = window.location.hash;
        if (currentHash !== targetHash) {
          window.history.pushState({ view }, '', targetHash || window.location.pathname);
        }
      }
    } catch (e) {
      console.warn('Failed to save current view:', e);
    }
  }, []);

  // Listen to popstate and hashchange events for browser / mobile back button
  useEffect(() => {
    const handleNavigationChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (['home', 'customer', 'courier', 'tracker', 'history', 'admin', 'profile'].includes(hash)) {
        setCurrentViewInternal(hash as any);
        localStorage.setItem(STORAGE_CURRENT_VIEW_KEY, hash);
      } else {
        setCurrentViewInternal('home');
        localStorage.setItem(STORAGE_CURRENT_VIEW_KEY, 'home');
      }
    };
    window.addEventListener('popstate', handleNavigationChange);
    window.addEventListener('hashchange', handleNavigationChange);
    return () => {
      window.removeEventListener('popstate', handleNavigationChange);
      window.removeEventListener('hashchange', handleNavigationChange);
    };
  }, []);

  // Real-time multi-tab and local storage sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_ORDERS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setRequests(parsed);
          }
        } catch (err) {
          console.warn('Sync orders parse error:', err);
        }
      }
      if (e.key === STORAGE_USERS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
          }
        } catch (err) {
          console.warn('Sync users parse error:', err);
        }
      }
      if (e.key === STORAGE_ACTIVE_USER_ID_KEY && e.newValue) {
        setCurrentUserId(e.newValue);
      }
      if (e.key === STORAGE_CURRENT_VIEW_KEY && e.newValue) {
        setCurrentViewInternal(e.newValue as any);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync to persistent storage immediately
  useEffect(() => {
    try {
      const payload = JSON.stringify(requests);
      localStorage.setItem(STORAGE_ORDERS_KEY, payload);
      sessionStorage.setItem(STORAGE_ORDERS_KEY, payload);
    } catch (e) {
      console.warn('Failed to persist orders:', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      const payload = JSON.stringify(users);
      localStorage.setItem(STORAGE_USERS_KEY, payload);
      sessionStorage.setItem(STORAGE_USERS_KEY, payload);
    } catch (e) {
      console.warn('Failed to persist users:', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_USER_ID_KEY, currentUserId);
      sessionStorage.setItem(STORAGE_ACTIVE_USER_ID_KEY, currentUserId);
    } catch (e) {
      console.warn('Failed to persist active user:', e);
    }
  }, [currentUserId]);

  const activeCourier = couriers.find((c) => c.id === activeCourierId) || couriers[0];

  // Helper to switch user by ID
  const switchUser = useCallback((userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      if (target.role === 'courier') {
        setActiveCourierId(target.id);
      }
      playAcceptSound();
    }
  }, [users]);

  // Helper to set current user directly
  const setCurrentUser = useCallback((user: UserAccount) => {
    setUsers((prev) => {
      if (!prev.some((u) => u.id === user.id)) {
        return [user, ...prev];
      }
      return prev;
    });
    setCurrentUserId(user.id);
    if (user.role === 'courier') {
      setActiveCourierId(user.id);
    }
    playAcceptSound();
  }, []);

  // Resilient Login by identifier (email/phone/name/alias) AND password
  const loginUser = useCallback((identifier: string, passwordInput?: string): { success: boolean; user?: UserAccount; message?: string } => {
    const rawClean = identifier.trim().toLowerCase();
    if (!rawClean) {
      return { success: false, message: 'Lütfen e-posta, telefon veya kullanıcı adınızı giriniz.' };
    }

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

    // 1. Direct Email Match
    let found = users.find((u) => u.email && (u.email.toLowerCase() === rawClean || normalize(u.email) === clean));

    // 2. Email Prefix Match (e.g. "kuryeantalyam", "ahmet", "mustafa")
    if (!found) {
      found = users.find((u) => u.email && normalize(u.email.split('@')[0]) === clean);
    }

    // 3. Phone Match (ignoring spaces, dashes, +90)
    if (!found && digitsOnly.length >= 7) {
      found = users.find((u) => {
        const uDigits = (u.phone || '').replace(/\D/g, '');
        return uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits) || uDigits === digitsOnly;
      });
    }

    // 4. Name / Display Name Match
    if (!found) {
      found = users.find((u) => normalize(u.name) === clean || normalize(u.name).includes(clean));
    }

    // 5. Role Keyword Shortcuts
    if (!found) {
      if (clean === 'admin' || clean === 'yonetici' || clean === 'yonetim' || clean === 'kuryeantalyam') {
        found = users.find((u) => u.role === 'admin') || INITIAL_USERS[1];
      } else if (clean === 'kurye' || clean === 'courier' || clean === 'motokurye' || clean === 'ahmet') {
        found = users.find((u) => u.id === 'user-courier-01') || users.find((u) => u.role === 'courier') || INITIAL_USERS[2];
      } else if (clean === 'mustafa' || clean === 'kurye2') {
        found = users.find((u) => u.id === 'user-courier-02') || INITIAL_USERS[3];
      } else if (clean === 'musteri' || clean === 'customer' || clean === 'deniz') {
        found = users.find((u) => u.role === 'customer' && u.email) || INITIAL_USERS[4] || INITIAL_USERS[0];
      }
    }

    if (!found) {
      return { success: false, message: 'Bu e-posta veya telefon numarasına ait kayıtlı hesap bulunamadı.' };
    }

    // PASSWORD VERIFICATION
    if (passwordInput !== undefined && passwordInput.trim() !== '') {
      const userExpectedPassword = (found.password || '123').trim();
      const enteredPassword = passwordInput.trim();

      const isDefaultValid = 
        enteredPassword === userExpectedPassword ||
        (found.role === 'admin' && (enteredPassword === 'admin' || enteredPassword === '123' || enteredPassword === '123456' || enteredPassword === 'admin123')) ||
        (found.role === 'courier' && (enteredPassword === '123' || enteredPassword === '123456' || enteredPassword === 'admin')) ||
        (found.role === 'customer' && (enteredPassword === '123' || enteredPassword === '123456'));

      if (!isDefaultValid) {
        return { 
          success: false, 
          message: 'Girdiğiniz şifre hatalıdır! Lütfen şifrenizi kontrol edip tekrar deneyiniz.' 
        };
      }
    }

    // Password matches! Log in
    setCurrentUserId(found.id);
    if (found.role === 'courier') {
      setActiveCourierId(found.id);
    }
    playAcceptSound();
    return { success: true, user: found };
  }, [users]);

  // Helper to switch role by finding user with that role
  const switchRole = useCallback((role: UserRole) => {
    const matchingUser = users.find((u) => u.role === role);
    if (matchingUser) {
      setCurrentUserId(matchingUser.id);
      if (role === 'courier') {
        setActiveCourierId(matchingUser.id);
      }
    } else {
      // create a default user for this role
      const newUser: UserAccount = {
        id: `user-${role}-${Date.now()}`,
        name: role === 'courier' ? 'Yeni Moto Kurye' : role === 'admin' ? 'Sistem Yöneticisi' : 'Yeni Müşteri',
        phone: '0532 000 00 00',
        email: `${role}@antalyakurye.com`,
        password: '123456',
        role,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(newUser.id);
    }
    playAcceptSound();
  }, [users]);

  // Register a new user with password
  const registerUser = useCallback((userData: Omit<UserAccount, 'id' | 'createdAt' | 'totalOrders' | 'totalEarnings'>): UserAccount => {
    const newUser: UserAccount = {
      ...userData,
      password: userData.password?.trim() || '123456',
      id: `user-${userData.role}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalEarnings: 0,
    };

    // 1. Local state update
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    if (newUser.role === 'courier') {
      setActiveCourierId(newUser.id);
    }
    playSuccessSound();

    // 2. Cloud Firestore Real-time Persistence
    saveUserToFirestore(newUser).catch((e) => console.warn('Firestore user save err:', e));

    // 3. Async sync to server
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch((e) => console.warn('Failed to sync user to server:', e));

    return newUser;
  }, []);

  // Update current user profile
  const updateCurrentUserProfile = useCallback((data: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUserId) {
          const updated = { ...u, ...data };
          saveUserToFirestore(updated).catch(() => {});
          return updated;
        }
        return u;
      })
    );
    fetch(`/api/users/${currentUserId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((e) => console.warn('Failed to sync profile update:', e));
  }, [currentUserId]);

  // Admin add courier
  const addCourier = useCallback((data: { name: string; phone: string; email: string; password?: string; district?: DistrictName }): UserAccount => {
    const newCourier: UserAccount = {
      id: `user-courier-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password?.trim() || '123',
      role: 'courier',
      district: data.district || 'Muratpaşa',
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalEarnings: 0,
      isOnline: true,
    };
    setUsers((prev) => [newCourier, ...prev]);
    playSuccessSound();

    saveUserToFirestore(newCourier).catch(() => {});

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourier),
    }).catch((e) => console.warn('Failed to sync new courier to server:', e));

    return newCourier;
  }, []);

  // Admin delete courier
  const deleteCourier = useCallback((courierId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== courierId));
    if (currentUserId === courierId) {
      setCurrentUserId(INITIAL_USERS[0].id);
    }
    playAcceptSound();

    deleteUserFromFirestore(courierId).catch(() => {});

    fetch(`/api/users/${courierId}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Failed to delete courier on server:', e));
  }, [currentUserId]);

  // Admin update courier
  const updateCourier = useCallback((courierId: string, data: Partial<UserAccount>) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id === courierId) {
        const updated = { ...u, ...data };
        saveUserToFirestore(updated).catch(() => {});
        return updated;
      }
      return u;
    }));
    playAcceptSound();

    fetch(`/api/users/${courierId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((e) => console.warn('Failed to update courier on server:', e));
  }, []);

  // Logout feature - cleanly resets to guest customer & classic home view
  const logout = useCallback(() => {
    let guestUser = users.find((u) => u.id === 'user-guest-01') || INITIAL_USERS[0];
    if (!guestUser) {
      guestUser = {
        id: 'user-guest-01',
        name: 'Misafir Müşteri',
        phone: '',
        email: '',
        password: '',
        role: 'customer',
        district: 'Muratpaşa',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      setUsers((prev) => [guestUser, ...prev]);
    }
    setCurrentUserId(guestUser.id);
    try {
      localStorage.setItem(STORAGE_ACTIVE_USER_ID_KEY, guestUser.id);
      sessionStorage.setItem(STORAGE_ACTIVE_USER_ID_KEY, guestUser.id);
      localStorage.setItem(STORAGE_CURRENT_VIEW_KEY, 'home');
      sessionStorage.setItem(STORAGE_CURRENT_VIEW_KEY, 'home');
    } catch (e) {
      console.warn('Logout storage write error:', e);
    }
    setCurrentView('home');
    playAcceptSound();
  }, [users, setCurrentView]);

  // Create new delivery request - Guaranteed to fall into courier pool immediately across all devices
  const createNewRequest = useCallback(
    (
      params: Omit<
        DeliveryRequest,
        | 'id'
        | 'trackingCode'
        | 'createdAt'
        | 'updatedAt'
        | 'status'
        | 'deliveryCode'
        | 'estimatedDistanceKm'
        | 'estimatedDurationMins'
        | 'price'
        | 'courierEarnings'
      >
    ): DeliveryRequest => {
      const estimate = calculateDeliveryEstimate(
        params.sender.district,
        params.receiver.district,
        params.packageType,
        params.urgency
      );

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const trackingCode = `ANT-${randomNum}`;

      // If user is guest or has no email, automatically establish an active customer profile
      let effectiveUserId = currentUser.id;
      if (effectiveUserId === 'user-guest-01' || !currentUser.email) {
        effectiveUserId = `user-cust-${Date.now()}`;
        const autoCustomer: UserAccount = {
          id: effectiveUserId,
          name: params.sender.contactName.trim() || 'Müşteri',
          phone: params.sender.contactPhone.trim() || '0532 000 00 00',
          email: `${params.sender.contactName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'musteri'}_${randomNum}@antalyakurye.com`,
          password: '123',
          role: 'customer',
          district: params.sender.district || 'Muratpaşa',
          createdAt: new Date().toISOString(),
          totalOrders: 1,
          totalEarnings: 0,
        };
        setUsers((prev) => [autoCustomer, ...prev.filter((u) => u.id !== autoCustomer.id)]);
        setCurrentUserId(effectiveUserId);
        try {
          localStorage.setItem(STORAGE_ACTIVE_USER_ID_KEY, effectiveUserId);
          sessionStorage.setItem(STORAGE_ACTIVE_USER_ID_KEY, effectiveUserId);
        } catch {}

        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(autoCustomer),
        }).catch(() => {});
      }

      const newRequest: DeliveryRequest = {
        ...params,
        id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        trackingCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderUserId: effectiveUserId,
        status: 'pending_pool', // ALWAYS starts in pool waiting for courier
        estimatedDistanceKm: estimate.distanceKm,
        estimatedDurationMins: estimate.durationMins,
        price: estimate.price,
        courierEarnings: estimate.courierEarnings,
      };

      // 1. Immediately update local state
      setRequests((prev) => {
        const updated = [newRequest, ...prev.filter((r) => r.id !== newRequest.id)];
        try {
          const payload = JSON.stringify(updated);
          localStorage.setItem(STORAGE_ORDERS_KEY, payload);
          sessionStorage.setItem(STORAGE_ORDERS_KEY, payload);
        } catch (err) {
          console.warn('Direct order storage write error:', err);
        }
        return updated;
      });
      
      // 2. Update customer total orders
      setUsers((prev) =>
        prev.map((u) =>
          u.id === effectiveUserId ? { ...u, totalOrders: (u.totalOrders || 0) + 1 } : u
        )
      );

      // 3. Audio & Global Dispatch & Customer Session Persistence
      try {
        localStorage.setItem('ant_last_customer_order_id', newRequest.id);
        localStorage.setItem('ant_last_customer_phone', newRequest.sender.contactPhone);
      } catch {}
      playNewOrderSound();
      setSelectedTrackingId(newRequest.id);

      // 4. Send to Cloud Firestore for Immediate Cross-Device Real-Time Sync
      saveRequestToFirestore(newRequest).catch((e) => console.warn('Firestore request save error:', e));

      // 5. Send to Server Backend for Cross-Device Sync
      fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      }).catch((e) => console.warn('Failed to push new order to server:', e));

      return newRequest;
    },
    [currentUser]
  );

  // Courier accepts order
  const acceptRequest = useCallback(
    (requestId: string, courierId?: string) => {
      const isActualCourier = currentUser.role === 'courier';
      const courierObj: CourierInfo = {
        id: isActualCourier ? currentUser.id : 'user-courier-01',
        name: isActualCourier ? currentUser.name : 'Ahmet Yılmaz (Kurye)',
        phone: isActualCourier ? currentUser.phone : '0544 111 22 33',
        email: isActualCourier ? currentUser.email : 'ahmet@antalyakurye.com',
        district: currentUser.district || 'Muratpaşa',
        rating: 4.95,
        totalDeliveries: (currentUser.totalOrders || 0) + 1,
        currentLat: 36.8860,
        currentLng: 30.7065,
      };

      const now = new Date().toISOString();

      setRequests((prev) => {
        const updated = prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: 'courier_assigned' as const,
              assignedCourier: courierObj,
              updatedAt: now,
            };
          }
          return req;
        });
        try {
          const payload = JSON.stringify(updated);
          localStorage.setItem(STORAGE_ORDERS_KEY, payload);
          sessionStorage.setItem(STORAGE_ORDERS_KEY, payload);
        } catch {}
        return updated;
      });

      playAcceptSound();

      // Cloud Firestore sync
      updateRequestInFirestore(requestId, {
        status: 'courier_assigned',
        assignedCourier: courierObj,
        updatedAt: now,
      }).catch(() => {});

      // Backend sync
      fetch(`/api/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierId: courierObj.id }),
      }).catch((e) => console.warn('Failed to sync accept order:', e));
    },
    [currentUser]
  );

  // Update status without needing verification code
  const updateStatus = useCallback(
    (requestId: string, nextStatus: DeliveryStatus) => {
      const targetReq = requests.find((r) => r.id === requestId);
      if (!targetReq) return { success: false, message: 'Sipariş bulunamadı.' };

      const now = new Date().toISOString();
      const updates: any = {
        status: nextStatus,
        updatedAt: now,
      };
      if (nextStatus === 'picked_up') updates.pickupTime = now;
      if (nextStatus === 'delivered') updates.deliveryTime = now;

      if (nextStatus === 'delivered') {
        // Success celebration
        playSuccessSound();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0284c7', '#10b981', '#f59e0b', '#6366f1'],
          });
        } catch {}

        // Update courier earnings & deliveries
        if (targetReq.assignedCourier?.id) {
          const cId = targetReq.assignedCourier.id;
          setUsers((prev) =>
            prev.map((u) => {
              if (u.id === cId) {
                const updated = {
                  ...u,
                  totalOrders: (u.totalOrders || 0) + 1,
                  totalEarnings: (u.totalEarnings || 0) + (targetReq.courierEarnings || 0),
                };
                saveUserToFirestore(updated).catch(() => {});
                return updated;
              }
              return u;
            })
          );
        }
      }

      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              ...updates,
            };
          }
          return req;
        })
      );

      // Cloud Firestore sync
      updateRequestInFirestore(requestId, updates).catch(() => {});

      // Backend sync
      fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch((e) => console.warn('Failed to sync status update:', e));

      return { success: true };
    },
    [requests]
  );

  // Rating
  const rateDelivery = useCallback((requestId: string, rating: number, feedback: string) => {
    const updates = { customerRating: rating, customerFeedback: feedback, updatedAt: new Date().toISOString() };
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            ...updates,
          };
        }
        return req;
      })
    );

    updateRequestInFirestore(requestId, updates).catch(() => {});

    fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((e) => console.warn('Failed to sync rating:', e));
  }, []);

  // Cancel order (by customer or admin)
  const cancelRequest = useCallback((requestId: string) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'cancelled',
            updatedAt: now,
          };
        }
        return req;
      })
    );

    updateRequestInFirestore(requestId, { status: 'cancelled', updatedAt: now }).catch(() => {});

    fetch(`/api/requests/${requestId}/cancel`, {
      method: 'POST',
    }).catch((e) => console.warn('Failed to cancel request on server:', e));
  }, []);

  // Courier releases task before picking up -> drops back to pool
  const releaseRequestBackToPool = useCallback((requestId: string) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'pending_pool',
            assignedCourier: undefined,
            updatedAt: now,
          };
        }
        return req;
      })
    );
    playAcceptSound();

    updateRequestInFirestore(requestId, {
      status: 'pending_pool',
      assignedCourier: undefined,
      updatedAt: now,
    }).catch(() => {});

    fetch(`/api/requests/${requestId}/release`, {
      method: 'POST',
    }).catch((e) => console.warn('Failed to release request on server:', e));
  }, []);

  // Add realistic demo request to test pool
  const addDemoRequest = useCallback(() => {
    const districts: DistrictName[] = ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Lara (Muratpaşa)', 'Döşemealtı', 'Aksu'];
    const from = districts[Math.floor(Math.random() * districts.length)];
    let to = districts[Math.floor(Math.random() * districts.length)];
    if (to === from) to = districts[(districts.indexOf(from) + 1) % districts.length];

    const demoTitles = [
      'Acil Eczane / Reçeteli İlaç Teslimatı',
      'Petshop Kedi Maması & Vitamin',
      'Market & Bakkal Sipariş Poşeti',
      'Özel Tasarım Canlı Çiçek Buketi',
      'Sıcak Kebap & Lahmacun Menüsü',
      'Tekstil ve Numune Koli Paketi',
    ];

    const randomTitle = demoTitles[Math.floor(Math.random() * demoTitles.length)];
    const packageTypes: ('food' | 'petshop' | 'market' | 'flower' | 'other')[] = [
      'food',
      'petshop',
      'market',
      'flower',
      'other',
    ];
    const randomType = packageTypes[Math.floor(Math.random() * packageTypes.length)];

    createNewRequest({
      sender: {
        district: from,
        neighborhood: 'Merkez Mah.',
        addressDetail: 'Atatürk Cad. No: ' + Math.floor(Math.random() * 100 + 1),
        contactName: 'Antalya İşletme',
        contactPhone: '0532 555 ' + Math.floor(1000 + Math.random() * 9000),
        lat: 36.8860 + (Math.random() - 0.5) * 0.05,
        lng: 30.7065 + (Math.random() - 0.5) * 0.05,
      },
      receiver: {
        district: to,
        neighborhood: 'Cumhuriyet Mah.',
        addressDetail: 'Gazi Bulvarı Kat 2 Daire ' + Math.floor(Math.random() * 20 + 1),
        contactName: 'Ahmet Alıcı',
        contactPhone: '0544 333 ' + Math.floor(1000 + Math.random() * 9000),
        lat: 36.8732 + (Math.random() - 0.5) * 0.05,
        lng: 30.6384 + (Math.random() - 0.5) * 0.05,
      },
      packageType: randomType,
      packageName: randomTitle,
      packageWeightKg: parseFloat((Math.random() * 2 + 0.3).toFixed(1)),
      urgency: Math.random() > 0.5 ? 'express_vip' : 'standard',
      noteForCourier: 'Zile basıp kapıya veya güvenliğe teslim edebilirsiniz.',
      paymentMethod: Math.random() > 0.5 ? 'gonderici_odemeli' : 'alici_odemeli',
      isPaid: false,
    });
  }, [createNewRequest]);

  // Export database backup as JSON
  const exportDatabaseBackup = useCallback(() => {
    const backupData = {
      timestamp: new Date().toISOString(),
      orders: requests,
      users,
      activeUserId: currentUserId,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antalya_kurye_yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [requests, users, currentUserId]);

  // Import database backup
  const importDatabaseBackup = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.orders && Array.isArray(data.orders)) {
        setRequests(data.orders);
      }
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      }
      if (data.activeUserId) {
        setCurrentUserId(data.activeUserId);
      }
      playSuccessSound();

      fetch('/api/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            users: data.users || users,
            requests: data.orders || requests,
          },
        }),
      }).catch(() => {});

      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, [users, requests]);

  // Reset to default mock data safely
  const resetDefaultData = useCallback(() => {
    setRequests(INITIAL_REQUESTS);
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    localStorage.removeItem(STORAGE_ORDERS_KEY);
    localStorage.removeItem(STORAGE_USERS_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_USER_ID_KEY);
    playAcceptSound();

    fetch('/api/database/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          users: INITIAL_USERS,
          requests: INITIAL_REQUESTS,
        },
      }),
    }).catch(() => {});
  }, []);

  // Filtered queries
  const poolRequests = requests.filter((r) => r.status === 'pending_pool');
  const activeCourierDeliveries = requests.filter(
    (r) =>
      (r.assignedCourier?.id === currentUser.id || 
       currentUser.role === 'admin' || 
       (currentUser.role === 'courier' && (!r.assignedCourier || r.assignedCourier.id === currentUser.id || r.assignedCourier.id === 'user-courier-01'))) &&
      (r.status === 'courier_assigned' || r.status === 'picked_up' || r.status === 'near_destination')
  );

  const myCustomerOrders = requests.filter(
    (r) => r.senderUserId === currentUser.id || currentUser.role === 'admin'
  );

  const courierUsers = users.filter((u) => u.role === 'courier');

  const completedTodayCount = requests.filter((r) => r.status === 'delivered').length;
  const inTransitCount = requests.filter(
    (r) => r.status === 'courier_assigned' || r.status === 'picked_up' || r.status === 'near_destination'
  ).length;

  const courierEarningsToday = requests
    .filter((r) => r.assignedCourier?.id === currentUser.id && r.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.courierEarnings || 0), 0);

  return (
    <DeliveryContext.Provider
      value={{
        currentUser,
        users,
        courierUsers,
        switchUser,
        setCurrentUser,
        loginUser,
        switchRole,
        registerUser,
        updateCurrentUserProfile,
        logout,
        addCourier,
        deleteCourier,
        updateCourier,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        authModalNotice,
        setAuthModalNotice,
        openAuthModal,
        closeAuthModal,
        requests,
        couriers,
        activeCourier,
        isCourierOnline,
        setIsCourierOnline,
        setActiveCourierId,
        currentView,
        setCurrentView,
        selectedTrackingId,
        setSelectedTrackingId,
        createNewRequest,
        acceptRequest,
        updateStatus,
        rateDelivery,
        cancelRequest,
        releaseRequestBackToPool,
        addDemoRequest,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetDefaultData,
        poolRequests,
        activeCourierDeliveries,
        myCustomerOrders,
        activeStats: {
          poolCount: poolRequests.length,
          inTransitCount,
          completedTodayCount,
          courierEarningsToday,
          myOrdersCount: myCustomerOrders.length,
          courierCount: courierUsers.length,
        },
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
}
