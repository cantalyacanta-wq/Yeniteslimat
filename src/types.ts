export type DistrictName =
  | 'Muratpaşa'
  | 'Konyaaltı'
  | 'Kepez'
  | 'Lara (Muratpaşa)'
  | 'Döşemealtı'
  | 'Aksu'
  | 'Kemer'
  | 'Serik'
  | 'Manavgat'
  | 'Alanya';

export type PackageType = 'document' | 'small_box' | 'food' | 'fragile_electronics' | 'large_box';

export type UrgencyType = 'standard' | 'express_vip' | 'scheduled';

export type PaymentMethod = 'cash_on_delivery' | 'card_on_delivery' | 'online_credit_card' | 'bank_transfer';

export type DeliveryStatus =
  | 'pending_pool'      // Havuzda bekliyor (Kurye aranıyor)
  | 'courier_assigned'  // Kurye kabul etti, alış noktasına gidiyor
  | 'picked_up'         // Paket teslim alındı, varış noktasına yola çıktı
  | 'near_destination'  // Teslimat adresine yaklaştı
  | 'delivered'         // Teslim edildi
  | 'cancelled';        // İptal edildi

export interface LocationInfo {
  district: DistrictName;
  neighborhood: string;
  addressDetail: string;
  contactName: string;
  contactPhone: string;
  buildingNo?: string;
  lat: number;
  lng: number;
}

export interface CourierInfo {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  vehicleType: 'Honda PCX 125' | 'Yamaha NMAX 155' | 'Elektrikli Moto' | 'Panelvan Araç';
  plate: string;
  rating: number;
  totalDeliveries: number;
  currentLat?: number;
  currentLng?: number;
}

export interface DeliveryRequest {
  id: string;
  trackingCode: string; // e.g. "ANT-4821"
  createdAt: string;
  updatedAt: string;
  
  // Locations
  sender: LocationInfo;
  receiver: LocationInfo;
  
  // Details
  packageType: PackageType;
  packageName: string;
  packageWeightKg: number;
  noteForCourier?: string;
  
  // Service
  urgency: UrgencyType;
  scheduledTime?: string;
  
  // Pricing & Distance
  estimatedDistanceKm: number;
  estimatedDurationMins: number;
  price: number;
  courierEarnings: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  
  // Status & Courier
  status: DeliveryStatus;
  assignedCourier?: CourierInfo;
  pickupTime?: string;
  deliveryTime?: string;
  deliveryCode: string; // 4-digit confirmation code, e.g. "7294"
  
  // Rating
  customerRating?: number;
  customerFeedback?: string;
}

export interface DistrictData {
  name: DistrictName;
  popularNeighborhoods: string[];
  centerCoordinates: { lat: number; lng: number };
  basePriceExtra: number;
}
