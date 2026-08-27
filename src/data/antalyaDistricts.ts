import { DistrictData, DistrictName } from '../types';

export const ANTALYA_DISTRICTS: Record<DistrictName, DistrictData> = {
  'Muratpaşa': {
    name: 'Muratpaşa',
    popularNeighborhoods: ['Şirinyalı', 'Kaleiçi', 'Meltem', 'Fener', 'Yeşilbahçe', 'Kızılsaray', 'Çağlayan', 'Memurevleri'],
    centerCoordinates: { lat: 36.8860, lng: 30.7065 },
    basePriceExtra: 0,
  },
  'Konyaaltı': {
    name: 'Konyaaltı',
    popularNeighborhoods: ['Gürsu', 'Altınkum', 'Toros', 'Uncalı', 'Arapsuyu', 'Liman', 'Hurma', 'Sarısu'],
    centerCoordinates: { lat: 36.8732, lng: 30.6384 },
    basePriceExtra: 10,
  },
  'Kepez': {
    name: 'Kepez',
    popularNeighborhoods: ['Fabrikalar', 'Gülveren', 'Dokuma', 'Varsak', 'Ahatlı', 'Yeşilyurt', 'Teomanpaşa', 'Kültür'],
    centerCoordinates: { lat: 36.9250, lng: 30.6870 },
    basePriceExtra: 10,
  },
  'Lara (Muratpaşa)': {
    name: 'Lara (Muratpaşa)',
    popularNeighborhoods: ['Örnekköy', 'Kırcami', 'Fener Mah.', 'Güzeloba', 'Şirinyalı Sahil', 'Çağlayan'],
    centerCoordinates: { lat: 36.8520, lng: 30.7650 },
    basePriceExtra: 15,
  },
  'Döşemealtı': {
    name: 'Döşemealtı',
    popularNeighborhoods: ['Yeniköy', 'Yeşilbayır', 'Düzlerçamı', 'Çıplaklı', 'Organize Sanayi Bölgesi (AOSB)', 'Nebiler'],
    centerCoordinates: { lat: 37.0160, lng: 30.6080 },
    basePriceExtra: 45,
  },
  'Aksu': {
    name: 'Aksu',
    popularNeighborhoods: ['Kundubucağı (Kundu)', 'Macun', 'Çalkaya', 'Havalimanı Çevresi', 'Güzelyurt', 'Karanlık'],
    centerCoordinates: { lat: 36.9450, lng: 30.8520 },
    basePriceExtra: 40,
  },
  'Kemer': {
    name: 'Kemer',
    popularNeighborhoods: ['Merkez', 'Göynük', 'Beldibi', 'Kiriş', 'Çamyuva', 'Tekirova'],
    centerCoordinates: { lat: 36.6020, lng: 30.5600 },
    basePriceExtra: 90,
  },
  'Serik': {
    name: 'Serik',
    popularNeighborhoods: ['Belek', 'Kadriye', 'Merkez', 'Boğazkent', 'Gediz'],
    centerCoordinates: { lat: 36.9170, lng: 31.0990 },
    basePriceExtra: 95,
  },
  'Manavgat': {
    name: 'Manavgat',
    popularNeighborhoods: ['Side', 'Şelale', 'Merkez', 'Ilıca', 'Çolaklı', 'Evrenseki'],
    centerCoordinates: { lat: 36.7860, lng: 31.4420 },
    basePriceExtra: 160,
  },
  'Alanya': {
    name: 'Alanya',
    popularNeighborhoods: ['Merkez', 'Mahmutlar', 'Oba', 'Tosmur', 'Kestel', 'Avsallar'],
    centerCoordinates: { lat: 36.5440, lng: 31.9960 },
    basePriceExtra: 260,
  },
};

// Distance matrix (in KM approx) between Antalya districts
export const DISTRICT_DISTANCE_MATRIX: Record<DistrictName, Record<DistrictName, number>> = {
  'Muratpaşa': {
    'Muratpaşa': 4,
    'Konyaaltı': 7,
    'Kepez': 6,
    'Lara (Muratpaşa)': 6,
    'Döşemealtı': 22,
    'Aksu': 18,
    'Kemer': 42,
    'Serik': 38,
    'Manavgat': 75,
    'Alanya': 135,
  },
  'Konyaaltı': {
    'Muratpaşa': 7,
    'Konyaaltı': 4,
    'Kepez': 8,
    'Lara (Muratpaşa)': 13,
    'Döşemealtı': 24,
    'Aksu': 23,
    'Kemer': 36,
    'Serik': 44,
    'Manavgat': 82,
    'Alanya': 142,
  },
  'Kepez': {
    'Muratpaşa': 6,
    'Konyaaltı': 8,
    'Kepez': 5,
    'Lara (Muratpaşa)': 12,
    'Döşemealtı': 16,
    'Aksu': 17,
    'Kemer': 45,
    'Serik': 37,
    'Manavgat': 76,
    'Alanya': 136,
  },
  'Lara (Muratpaşa)': {
    'Muratpaşa': 6,
    'Konyaaltı': 13,
    'Kepez': 12,
    'Lara (Muratpaşa)': 4,
    'Döşemealtı': 28,
    'Aksu': 14,
    'Kemer': 48,
    'Serik': 33,
    'Manavgat': 70,
    'Alanya': 130,
  },
  'Döşemealtı': {
    'Muratpaşa': 22,
    'Konyaaltı': 24,
    'Kepez': 16,
    'Lara (Muratpaşa)': 28,
    'Döşemealtı': 5,
    'Aksu': 30,
    'Kemer': 62,
    'Serik': 48,
    'Manavgat': 89,
    'Alanya': 150,
  },
  'Aksu': {
    'Muratpaşa': 18,
    'Konyaaltı': 23,
    'Kepez': 17,
    'Lara (Muratpaşa)': 14,
    'Döşemealtı': 30,
    'Aksu': 6,
    'Kemer': 58,
    'Serik': 22,
    'Manavgat': 60,
    'Alanya': 120,
  },
  'Kemer': {
    'Muratpaşa': 42,
    'Konyaaltı': 36,
    'Kepez': 45,
    'Lara (Muratpaşa)': 48,
    'Döşemealtı': 62,
    'Aksu': 58,
    'Kemer': 5,
    'Serik': 78,
    'Manavgat': 116,
    'Alanya': 176,
  },
  'Serik': {
    'Muratpaşa': 38,
    'Konyaaltı': 44,
    'Kepez': 37,
    'Lara (Muratpaşa)': 33,
    'Döşemealtı': 48,
    'Aksu': 22,
    'Kemer': 78,
    'Serik': 6,
    'Manavgat': 38,
    'Alanya': 98,
  },
  'Manavgat': {
    'Muratpaşa': 75,
    'Konyaaltı': 82,
    'Kepez': 76,
    'Lara (Muratpaşa)': 70,
    'Döşemealtı': 89,
    'Aksu': 60,
    'Kemer': 116,
    'Serik': 38,
    'Manavgat': 6,
    'Alanya': 60,
  },
  'Alanya': {
    'Muratpaşa': 135,
    'Konyaaltı': 142,
    'Kepez': 136,
    'Lara (Muratpaşa)': 130,
    'Döşemealtı': 150,
    'Aksu': 120,
    'Kemer': 176,
    'Serik': 98,
    'Manavgat': 60,
    'Alanya': 8,
  },
};

/**
 * Calculates realistic delivery pricing, courier payout and estimated duration for Antalya intra-city.
 */
export function calculateDeliveryEstimate(
  fromDistrict: DistrictName,
  toDistrict: DistrictName,
  packageType: string,
  urgency: string
) {
  const km = DISTRICT_DISTANCE_MATRIX[fromDistrict]?.[toDistrict] || 10;
  
  // Base cost calculation
  // Antalya base moto courier: 120 TL + 12 TL per km
  let basePrice = 120 + km * 14;
  
  // Package type multiplier
  let packageExtra = 0;
  if (packageType === 'small_box') packageExtra = 20;
  if (packageType === 'food') packageExtra = 15;
  if (packageType === 'fragile_electronics') packageExtra = 40;
  if (packageType === 'large_box') packageExtra = 80;
  
  // Urgency multiplier
  let urgencyMultiplier = 1.0;
  let durationMins = Math.round(15 + km * 2.2); // Base speed with traffic
  
  if (urgency === 'express_vip') {
    urgencyMultiplier = 1.5;
    durationMins = Math.round(durationMins * 0.65); // faster moto priority
  } else if (urgency === 'scheduled') {
    urgencyMultiplier = 1.1;
  }
  
  const totalPrice = Math.round((basePrice + packageExtra) * urgencyMultiplier);
  // Courier receives 75% of delivery fee
  const courierEarnings = Math.round(totalPrice * 0.76);
  
  return {
    distanceKm: km,
    durationMins: Math.max(20, durationMins),
    price: totalPrice,
    courierEarnings,
  };
}
