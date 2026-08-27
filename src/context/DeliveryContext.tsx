import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CourierInfo, DeliveryRequest, DeliveryStatus, DistrictName } from '../types';
import { INITIAL_COURIERS, INITIAL_REQUESTS } from '../data/mockData';
import { calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { playAcceptSound, playNewOrderSound, playSuccessSound } from '../utils/audio';

interface DeliveryContextType {
  requests: DeliveryRequest[];
  couriers: CourierInfo[];
  activeCourier: CourierInfo;
  isCourierOnline: boolean;
  setIsCourierOnline: (online: boolean) => void;
  setActiveCourierId: (id: string) => void;
  
  // Navigation & selection
  currentView: 'customer' | 'courier' | 'tracker' | 'map' | 'history';
  setCurrentView: (view: 'customer' | 'courier' | 'tracker' | 'map' | 'history') => void;
  selectedTrackingId: string | null;
  setSelectedTrackingId: (id: string | null) => void;
  
  // Actions
  createNewRequest: (params: Omit<DeliveryRequest, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'status' | 'deliveryCode' | 'estimatedDistanceKm' | 'estimatedDurationMins' | 'price' | 'courierEarnings'>) => DeliveryRequest;
  acceptRequest: (requestId: string, courierId?: string) => void;
  updateStatus: (requestId: string, nextStatus: DeliveryStatus, verificationCode?: string) => { success: boolean; message?: string };
  rateDelivery: (requestId: string, rating: number, feedback: string) => void;
  cancelRequest: (requestId: string) => void;
  addDemoRequest: () => void;
  resetDefaultData: () => void;
  
  // Filtered lists
  poolRequests: DeliveryRequest[];
  activeCourierDeliveries: DeliveryRequest[];
  activeStats: {
    poolCount: number;
    inTransitCount: number;
    completedTodayCount: number;
    courierEarningsToday: number;
  };
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

const STORAGE_KEY = 'antalya_kurye_orders_v2';
const COURIER_KEY = 'antalya_kurye_active_user_v2';

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<DeliveryRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_REQUESTS;
  });

  const [couriers] = useState<CourierInfo[]>(INITIAL_COURIERS);
  const [activeCourierId, setActiveCourierId] = useState<string>('kurye-01');
  const [isCourierOnline, setIsCourierOnline] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'customer' | 'courier' | 'tracker' | 'map' | 'history'>('customer');
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }, [requests]);

  const activeCourier = couriers.find((c) => c.id === activeCourierId) || couriers[0];

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
        status: 'pending_pool',
        deliveryCode,
        estimatedDistanceKm: estimate.distanceKm,
        estimatedDurationMins: estimate.durationMins,
        price: estimate.price,
        courierEarnings: estimate.courierEarnings,
      };

      setRequests((prev) => [newRequest, ...prev]);
      playNewOrderSound();
      
      // Auto-set tracking ID
      setSelectedTrackingId(newRequest.id);

      return newRequest;
    },
    []
  );

  // Courier accepts order
  const acceptRequest = useCallback(
    (requestId: string, courierId?: string) => {
      const selectedCourier = couriers.find((c) => c.id === (courierId || activeCourierId)) || activeCourier;

      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: 'courier_assigned',
              assignedCourier: selectedCourier,
              updatedAt: new Date().toISOString(),
            };
          }
          return req;
        })
      );

      playAcceptSound();
    },
    [activeCourierId, couriers, activeCourier]
  );

  // Update status with optional security code check for completion
  const updateStatus = useCallback(
    (requestId: string, nextStatus: DeliveryStatus, verificationCode?: string) => {
      const targetReq = requests.find((r) => r.id === requestId);
      if (!targetReq) return { success: false, message: 'Sipariş bulunamadı.' };

      if (nextStatus === 'delivered') {
        if (verificationCode && verificationCode.trim() !== targetReq.deliveryCode) {
          return { success: false, message: 'Hatalı teslimat onay kodu! Müşteriden 4 haneli kodu alınız.' };
        }
        
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
          // ignore in environments without canvas
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

  // Reset to default mock
  const resetDefaultData = useCallback(() => {
    setRequests(INITIAL_REQUESTS);
    localStorage.removeItem(STORAGE_KEY);
    playAcceptSound();
  }, []);

  // Filtered queries
  const poolRequests = requests.filter((r) => r.status === 'pending_pool');
  const activeCourierDeliveries = requests.filter(
    (r) =>
      r.assignedCourier?.id === activeCourier.id &&
      (r.status === 'courier_assigned' || r.status === 'picked_up' || r.status === 'near_destination')
  );

  const completedTodayCount = requests.filter((r) => r.status === 'delivered').length;
  const inTransitCount = requests.filter(
    (r) => r.status === 'courier_assigned' || r.status === 'picked_up' || r.status === 'near_destination'
  ).length;

  const courierEarningsToday = requests
    .filter((r) => r.assignedCourier?.id === activeCourier.id && r.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.courierEarnings || 0), 0);

  return (
    <DeliveryContext.Provider
      value={{
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
        resetDefaultData,
        poolRequests,
        activeCourierDeliveries,
        activeStats: {
          poolCount: poolRequests.length,
          inTransitCount,
          completedTodayCount,
          courierEarningsToday,
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
