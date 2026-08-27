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
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  registerUser: (userData: Omit<UserAccount, 'id' | 'createdAt' | 'totalOrders' | 'totalEarnings'>) => UserAccount;
  updateCurrentUserProfile: (data: Partial<UserAccount>) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Requests
  requests: DeliveryRequest[];
  couriers: CourierInfo[];
  activeCourier: CourierInfo;
  isCourierOnline: boolean;
  setIsCourierOnline: (online: boolean) => void;
  setActiveCourierId: (id: string) => void;
  
  // Navigation & selection
  currentView: 'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'profile';
  setCurrentView: (view: 'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'profile') => void;
  selectedTrackingId: string | null;
  setSelectedTrackingId: (id: string | null) => void;
  
  // Actions
  createNewRequest: (params: Omit<DeliveryRequest, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'status' | 'deliveryCode' | 'estimatedDistanceKm' | 'estimatedDurationMins' | 'price' | 'courierEarnings'>) => DeliveryRequest;
  acceptRequest: (requestId: string, courierId?: string) => void;
  updateStatus: (requestId: string, nextStatus: DeliveryStatus) => { success: boolean; message?: string };
  rateDelivery: (requestId: string, rating: number, feedback: string) => void;
  cancelRequest: (requestId: string) => void;
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
  };
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

// Persistent Local Database Keys (v3)
const STORAGE_ORDERS_KEY = 'antalya_kurye_db_v3_orders';
const STORAGE_USERS_KEY = 'antalya_kurye_db_v3_users';
const STORAGE_ACTIVE_USER_ID_KEY = 'antalya_kurye_db_v3_active_user_id';

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Persistent Users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('User storage read error:', e);
    }
    return INITIAL_USERS;
  });

  // 2. Active Authenticated User
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_USER_ID_KEY);
      if (saved) return saved;
    } catch (e) {
      console.warn('Active user id read error:', e);
    }
    return INITIAL_USERS[0].id;
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // 3. Persistent Orders
  const [requests, setRequests] = useState<DeliveryRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Orders storage read error:', e);
    }
    return INITIAL_REQUESTS;
  });

  const [couriers] = useState<CourierInfo[]>(INITIAL_COURIERS);
  const [activeCourierId, setActiveCourierId] = useState<string>('user-courier-01');
  const [isCourierOnline, setIsCourierOnline] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'home' | 'customer' | 'courier' | 'tracker' | 'history' | 'profile'>('home');
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync to persistent storage immediately whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn('Failed to persist orders:', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to persist users:', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_USER_ID_KEY, currentUserId);
    } catch (e) {
      console.warn('Failed to persist active user:', e);
    }
  }, [currentUserId]);

  const activeCourier = couriers.find((c) => c.id === activeCourierId) || couriers[0];

  // Helper to switch user
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

  // Helper to switch role by finding or creating a default user with that role
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
        role,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(newUser.id);
    }
    playAcceptSound();
  }, [users]);

  // Register a new user
  const registerUser = useCallback((userData: Omit<UserAccount, 'id' | 'createdAt' | 'totalOrders' | 'totalEarnings'>): UserAccount => {
    const newUser: UserAccount = {
      ...userData,
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

  // Helper to generate 4-digit numeric code
  const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  // Create new delivery request
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
      const deliveryCode = generateCode();

      const newRequest: DeliveryRequest = {
        ...params,
        id: `req-${Date.now()}`,
        trackingCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderUserId: currentUser.id,
        status: 'pending_pool',
        deliveryCode,
        estimatedDistanceKm: estimate.distanceKm,
        estimatedDurationMins: estimate.durationMins,
        price: estimate.price,
        courierEarnings: estimate.courierEarnings,
      };

      setRequests((prev) => [newRequest, ...prev]);
      
      // Update customer total orders
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, totalOrders: (u.totalOrders || 0) + 1 } : u
        )
      );

      playNewOrderSound();
      setSelectedTrackingId(newRequest.id);

      return newRequest;
    },
    [currentUser.id]
  );

  // Courier accepts order
  const acceptRequest = useCallback(
    (requestId: string, courierId?: string) => {
      const targetCourierId = courierId || currentUser.id || activeCourierId;
      const courierObj: CourierInfo = {
        id: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
        vehicleType: currentUser.vehicleType || 'Honda PCX 125',
        plate: currentUser.plate || '07 ANT 07',
        rating: 4.95,
        totalDeliveries: (currentUser.totalOrders || 0) + 1,
        currentLat: 36.8860,
        currentLng: 30.7065,
      };

      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: 'courier_assigned',
              assignedCourier: courierObj,
              updatedAt: new Date().toISOString(),
            };
          }
          return req;
        })
      );

      playAcceptSound();
    },
    [currentUser, activeCourierId]
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

  // Cancel order
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

  // Add realistic demo request to test pool
  const addDemoRequest = useCallback(() => {
    const districts: DistrictName[] = ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Lara (Muratpaşa)', 'Döşemealtı', 'Aksu'];
    const from = districts[Math.floor(Math.random() * districts.length)];
    let to = districts[Math.floor(Math.random() * districts.length)];
    if (to === from) to = districts[(districts.indexOf(from) + 1) % districts.length];

    const demoTitles = [
      'Acil Eczane / Reçeteli İlaç Teslimatı',
      'Yedek Anahtar ve Evrak Zarfı',
      'Gusto Gurme Soğuk Meze Paketi',
      'Laptop Şarj Aleti & Taşınabilir Disk',
      'Tekstil Numune Kumaş Paketi',
      'Gözlük ve Optik Sipariş Kutusu',
    ];

    const randomTitle = demoTitles[Math.floor(Math.random() * demoTitles.length)];
    const packageTypes: ('document' | 'small_box' | 'food' | 'fragile_electronics')[] = ['document', 'small_box', 'food', 'fragile_electronics'];
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
      noteForCourier: 'Zile basıp güvenliğe veya kapıya teslim edebilirsiniz.',
      paymentMethod: 'card_on_delivery',
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
      r.assignedCourier?.id === currentUser.id &&
      (r.status === 'courier_assigned' || r.status === 'picked_up' || r.status === 'near_destination')
  );

  const myCustomerOrders = requests.filter(
    (r) => r.senderUserId === currentUser.id || currentUser.role === 'admin'
  );

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
        switchUser,
        switchRole,
        registerUser,
        updateCurrentUserProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
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
