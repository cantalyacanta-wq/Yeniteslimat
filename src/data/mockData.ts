import { CourierInfo, DeliveryRequest, UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
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
];

export const INITIAL_COURIERS: CourierInfo[] = [];

export const INITIAL_REQUESTS: DeliveryRequest[] = [];


