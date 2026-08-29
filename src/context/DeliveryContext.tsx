import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CourierInfo, DeliveryRequest, DeliveryStatus, DistrictName, UserAccount, UserRole } from '../types';
import { INITIAL_COURIERS, INITIAL_REQUESTS, INITIAL_USERS } from '../data/mockData';
import { calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { playAcceptSound, playNewOrderSound, playSuccessSound } from '../utils/audio';

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

// Persistent Local Database Keys (v7 - clean state, locked address support & strict courier pool isolation)
const STORAGE_ORDERS_KEY = 'antalya_kurye_database_v7_orders';
const STORAGE_USERS_KEY = 'antalya_kurye_database_v7_users';
const STORAGE_ACTIVE_USER_ID_KEY = 'antalya_kurye_database_v7_active_user_id';
const STORAGE_CURRENT_VIEW_KEY = 'antalya_kurye_database_v7_current_view';

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

// Helper to safely load and merge users ensuring clean state
const loadPersistentUsers = (): UserAccount[] => {
  try {
    const saved = localStorage.getItem(STORAGE_USERS_KEY) || sessionStorage.getItem(STORAGE_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasGuest = parsed.some((u: UserAccount) => u.id === 'user-guest-01');
        if (!hasGuest) {
          return [INITIAL_USERS[0], ...parsed];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('User storage read error:', e);
  }
  return INITIAL_USERS;
};

// Helper to safely load orders
const loadPersistentOrders = (): DeliveryRequest[] => {
  try {
    const saved = localStorage.getItem(STORAGE_ORDERS_KEY) || sessionStorage.getItem(STORAGE_ORDERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Orders storage read error:', e);
  }
  return INITIAL_REQUESTS;
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

  const [couriers] = useState<CourierInfo[]>(INITIAL_COURIERS);
  const [activeCourierId, setActiveCourierId] = useState<string>('user-courier-01');
  const [isCourierOnline, setIsCourierOnline] = useState<boolean>(true);
  
  // 4. Persistent Current View (Preserved across page refreshes!)
  const [currentView, setCurrentViewInternal] = useState<'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'admin' | 'profile'>(getInitialView as any);
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);

  // 5. Global Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'courier_login' | 'admin_login'>('login');
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);

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

  // Strict Login by identifier (email/phone) AND password
  const loginUser = useCallback((identifier: string, passwordInput?: string): { success: boolean; user?: UserAccount; message?: string } => {
    const clean = identifier.trim().toLowerCase();
    const digitsOnly = clean.replace(/\D/g, '');

    // 1. Direct Email Match
    let found = users.find((u) => u.email && u.email.toLowerCase() === clean);

    // 2. Email Prefix Match
    if (!found) {
      found = users.find((u) => u.email && u.email.toLowerCase().split('@')[0] === clean);
    }

    // 3. Phone Match (ignoring spaces, dashes, +90)
    if (!found && digitsOnly.length >= 7) {
      found = users.find((u) => {
        const uDigits = u.phone.replace(/\D/g, '');
        return uDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uDigits);
      });
    }

    // 4. Name Match
    if (!found) {
      found = users.find((u) => u.name.toLowerCase() === clean);
    }

    if (!found) {
      return { success: false, message: 'Bu e-posta veya telefon numarasına ait kayıtlı hesap bulunamadı.' };
    }

    // STRICT PASSWORD VERIFICATION
    if (passwordInput !== undefined) {
      const userExpectedPassword = (found.password || '123456').trim();
      const enteredPassword = passwordInput.trim();

      if (!enteredPassword) {
        return { success: false, message: 'Lütfen şifrenizi giriniz.' };
      }

      if (userExpectedPassword !== enteredPassword) {
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

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    if (newUser.role === 'courier') {
      setActiveCourierId(newUser.id);
    }
    playSuccessSound();
    return newUser;
  }, []);

  // Update current user profile
  const updateCurrentUserProfile = useCallback((data: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...data } : u))
    );
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
    return newCourier;
  }, []);

  // Admin delete courier
  const deleteCourier = useCallback((courierId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== courierId));
    if (currentUserId === courierId) {
      setCurrentUserId(INITIAL_USERS[0].id);
    }
    playAcceptSound();
  }, [currentUserId]);

  // Admin update courier
  const updateCourier = useCallback((courierId: string, data: Partial<UserAccount>) => {
    setUsers((prev) => prev.map((u) => (u.id === courierId ? { ...u, ...data } : u)));
    playAcceptSound();
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

  // Create new delivery request - Guaranteed to fall into courier pool immediately
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

      // 1. Immediately update state
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

      // 3. Audio & Global Dispatch
      playNewOrderSound();
      setSelectedTrackingId(newRequest.id);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        try {
          window.dispatchEvent(new CustomEvent('antalya_new_pool_order', { detail: newRequest }));
        } catch {}
      }

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

      setRequests((prev) => {
        const updated = prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: 'courier_assigned' as const,
              assignedCourier: courierObj,
              updatedAt: new Date().toISOString(),
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
    },
    [currentUser]
  );

  // Update status without needing verification code
  const updateStatus = useCallback(
    (requestId: string, nextStatus: DeliveryStatus) => {
      const targetReq = requests.find((r) => r.id === requestId);
      if (!targetReq) return { success: false, message: 'Sipariş bulunamadı.' };

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
        } catch {
          // ignore
        }

        // Update courier earnings & deliveries
        if (targetReq.assignedCourier?.id) {
          const cId = targetReq.assignedCourier.id;
          setUsers((prev) =>
            prev.map((u) =>
              u.id === cId
                ? {
                    ...u,
                    totalOrders: (u.totalOrders || 0) + 1,
                    totalEarnings: (u.totalEarnings || 0) + (targetReq.courierEarnings || 0),
                  }
                : u
            )
          );
        }
      }

      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            const now = new Date().toISOString();
            return {
              ...req,
              status: nextStatus,
              updatedAt: now,
              pickupTime: nextStatus === 'picked_up' ? now : req.pickupTime,
              deliveryTime: nextStatus === 'delivered' ? now : req.deliveryTime,
            };
          }
          return req;
        })
      );

      return { success: true };
    },
    [requests]
  );

  // Rating
  const rateDelivery = useCallback((requestId: string, rating: number, feedback: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            customerRating: rating,
            customerFeedback: feedback,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );
  }, []);

  // Cancel order (by customer or admin)
  const cancelRequest = useCallback((requestId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );
  }, []);

  // Courier releases task before picking up -> drops back to pool
  const releaseRequestBackToPool = useCallback((requestId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'pending_pool',
            assignedCourier: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );
    playAcceptSound();
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
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);

  // Reset to default mock data safely
  const resetDefaultData = useCallback(() => {
    setRequests(INITIAL_REQUESTS);
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    localStorage.removeItem(STORAGE_ORDERS_KEY);
    localStorage.removeItem(STORAGE_USERS_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_USER_ID_KEY);
    playAcceptSound();
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
