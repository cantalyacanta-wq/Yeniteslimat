import { CourierInfo, DeliveryRequest, UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
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
    companyName: 'Antalya Şehir İçi Teslimat 7/24',
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

export const INITIAL_COURIERS: CourierInfo[] = [
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
  },
];

export const INITIAL_REQUESTS: DeliveryRequest[] = [];



