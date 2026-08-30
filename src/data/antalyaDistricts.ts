import { DistrictData, DistrictName } from '../types';

export const ANTALYA_DISTRICTS: Record<DistrictName, DistrictData> = {
  'Muratpaşa': {
    name: 'Muratpaşa',
    popularNeighborhoods: ['Şirinyalı', 'Kaleiçi', 'Meltem', 'Fener', 'Yeşilbahçe', 'Kızılsaray', 'Çağlayan', 'Memurevleri', 'Güllük', 'Kışla'],
    centerCoordinates: { lat: 36.8860, lng: 30.7065 },
    basePriceExtra: 0,
  },
  'Konyaaltı': {
    name: 'Konyaaltı',
    popularNeighborhoods: ['Gürsu', 'Altınkum', 'Toros', 'Uncalı', 'Arapsuyu', 'Liman', 'Hurma', 'Sarısu', 'Uluç', 'Molla Yusuf'],
    centerCoordinates: { lat: 36.8732, lng: 30.6384 },
    basePriceExtra: 10,
  },
  'Kepez': {
    name: 'Kepez',
    popularNeighborhoods: ['Fabrikalar', 'Gülveren', 'Dokuma', 'Varsak', 'Ahatlı', 'Yeşilyurt', 'Teomanpaşa', 'Kültür', 'Şafak', 'Barış'],
    centerCoordinates: { lat: 36.9250, lng: 30.6870 },
    basePriceExtra: 10,
  },
  'Lara (Muratpaşa)': {
    name: 'Lara (Muratpaşa)',
    popularNeighborhoods: ['Örnekköy', 'Kırcami', 'Fener Mah.', 'Güzeloba', 'Şirinyalı Sahil', 'Çağlayan', 'Barınaklar', 'Kundu Sahili'],
    centerCoordinates: { lat: 36.8520, lng: 30.7650 },
    basePriceExtra: 15,
  },
  'Döşemealtı': {
    name: 'Döşemealtı',
    popularNeighborhoods: ['Yeniköy', 'Yeşilbayır', 'Düzlerçamı', 'Çıplaklı', 'Organize Sanayi Bölgesi (AOSB)', 'Nebiler', 'Bahçeyaka'],
    centerCoordinates: { lat: 37.0160, lng: 30.6080 },
    basePriceExtra: 45,
  },
  'Aksu': {
    name: 'Aksu',
    popularNeighborhoods: ['Kundubucağı (Kundu)', 'Macun', 'Çalkaya', 'Havalimanı Çevresi', 'Güzelyurt', 'Karanlık', 'Pınarlı'],
    centerCoordinates: { lat: 36.9450, lng: 30.8520 },
    basePriceExtra: 40,
  },
  'Kemer': {
    name: 'Kemer',
    popularNeighborhoods: ['Merkez', 'Göynük', 'Beldibi', 'Kiriş', 'Çamyuva', 'Tekirova', 'Aslanbucak', 'Kuzdere'],
    centerCoordinates: { lat: 36.6020, lng: 30.5600 },
    basePriceExtra: 90,
  },
  'Serik': {
    name: 'Serik',
    popularNeighborhoods: ['Belek', 'Kadriye', 'Merkez', 'Boğazkent', 'Gediz', 'Yukarı Kocayatak', 'Çandır'],
    centerCoordinates: { lat: 36.9170, lng: 31.0990 },
    basePriceExtra: 95,
  },
  'Manavgat': {
    name: 'Manavgat',
    popularNeighborhoods: ['Side', 'Şelale', 'Merkez', 'Ilıca', 'Çolaklı', 'Evrenseki', 'Kızılot', 'Kumköy'],
    centerCoordinates: { lat: 36.7860, lng: 31.4420 },
    basePriceExtra: 160,
  },
  'Alanya': {
    name: 'Alanya',
    popularNeighborhoods: ['Merkez', 'Mahmutlar', 'Oba', 'Tosmur', 'Kestel', 'Avsallar', 'Konaklı', 'Cikcilli'],
    centerCoordinates: { lat: 36.5440, lng: 31.9960 },
    basePriceExtra: 260,
  },
};

/**
 * Gerçek Karayolu ve Navigasyon Sürüş Mesafeleri (KM) - Antalya İl & İlçeleri
 * Antalya Büyükşehir sınırları, çevre yolları ve D400 karayolu rotaları baz alınmıştır.
 */
export const DISTRICT_DISTANCE_MATRIX: Record<DistrictName, Record<DistrictName, number>> = {
  'Muratpaşa': {
    'Muratpaşa': 7,
    'Konyaaltı': 12,
    'Kepez': 10,
    'Lara (Muratpaşa)': 14,
    'Döşemealtı': 28,
    'Aksu': 22,
    'Kemer': 46,
    'Serik': 43,
    'Manavgat': 78,
    'Alanya': 138,
  },
  'Konyaaltı': {
    'Muratpaşa': 12,
    'Konyaaltı': 8,
    'Kepez': 13,
    'Lara (Muratpaşa)': 24,
    'Döşemealtı': 30,
    'Aksu': 32,
    'Kemer': 38,
    'Serik': 54,
    'Manavgat': 89,
    'Alanya': 149,
  },
  'Kepez': {
    'Muratpaşa': 10,
    'Konyaaltı': 13,
    'Kepez': 9,
    'Lara (Muratpaşa)': 21,
    'Döşemealtı': 20,
    'Aksu': 23,
    'Kemer': 49,
    'Serik': 41,
    'Manavgat': 77,
    'Alanya': 137,
  },
  'Lara (Muratpaşa)': {
    'Muratpaşa': 14,
    'Konyaaltı': 24,
    'Kepez': 21,
    'Lara (Muratpaşa)': 7,
    'Döşemealtı': 36,
    'Aksu': 15,
    'Kemer': 58,
    'Serik': 36,
    'Manavgat': 72,
    'Alanya': 132,
  },
  'Döşemealtı': {
    'Muratpaşa': 28,
    'Konyaaltı': 30,
    'Kepez': 20,
    'Lara (Muratpaşa)': 36,
    'Döşemealtı': 10,
    'Aksu': 35,
    'Kemer': 65,
    'Serik': 52,
    'Manavgat': 92,
    'Alanya': 152,
  },
  'Aksu': {
    'Muratpaşa': 22,
    'Konyaaltı': 32,
    'Kepez': 23,
    'Lara (Muratpaşa)': 15,
    'Döşemealtı': 35,
    'Aksu': 8,
    'Kemer': 66,
    'Serik': 24,
    'Manavgat': 62,
    'Alanya': 122,
  },
  'Kemer': {
    'Muratpaşa': 46,
    'Konyaaltı': 38,
    'Kepez': 49,
    'Lara (Muratpaşa)': 58,
    'Döşemealtı': 65,
    'Aksu': 66,
    'Kemer': 15,
    'Serik': 86,
    'Manavgat': 124,
    'Alanya': 184,
  },
  'Serik': {
    'Muratpaşa': 43,
    'Konyaaltı': 54,
    'Kepez': 41,
    'Lara (Muratpaşa)': 36,
    'Döşemealtı': 52,
    'Aksu': 24,
    'Kemer': 86,
    'Serik': 12,
    'Manavgat': 38,
    'Alanya': 98,
  },
  'Manavgat': {
    'Muratpaşa': 78,
    'Konyaaltı': 89,
    'Kepez': 77,
    'Lara (Muratpaşa)': 72,
    'Döşemealtı': 92,
    'Aksu': 62,
    'Kemer': 124,
    'Serik': 38,
    'Manavgat': 10,
    'Alanya': 62,
  },
  'Alanya': {
    'Muratpaşa': 138,
    'Konyaaltı': 149,
    'Kepez': 137,
    'Lara (Muratpaşa)': 132,
    'Döşemealtı': 152,
    'Aksu': 122,
    'Kemer': 184,
    'Serik': 98,
    'Manavgat': 62,
    'Alanya': 14,
  },
};

/**
 * Antalya şehir içi ve ilçeler arası teslimat mesafesi, kurye sürüş süresi ve fiyat hesaplaması.
 * Kural:
 * - Yemek / Restoran: 100 TL
 * - Diğer Tüm Gönderiler: 150 TL
 * - Kurye Hakedişi: Tam Ücret (100 TL veya 150 TL)
 */
export function calculateDeliveryEstimate(
  fromDistrict: DistrictName,
  toDistrict: DistrictName,
  packageType: string,
  urgency?: string
) {
  const km = DISTRICT_DISTANCE_MATRIX[fromDistrict]?.[toDistrict] || 12;
  
  const isFood = packageType === 'food';
  const totalPrice = isFood ? 100 : 150;
  const courierEarnings = totalPrice; // Kuryeye tam ücret yansıtılır

  // Gerçekçi Moto Kurye Ulaşım Süresi Hesabı:
  // - Paket teslim alma + park + müşteri teslimi baz süre: 8-10 dk
  // - Şehir içi trafik (<= 20 km): km başına ~1.5 dk
  // - İlçe / Karayolu D400 (> 20 km): km başına ~1.0 dk
  let durationMins: number;
  if (km <= 20) {
    durationMins = Math.round(9 + km * 1.5);
  } else {
    durationMins = Math.round(9 + 20 * 1.5 + (km - 20) * 1.0);
  }

  // Acil / VIP Teslimat Önceliği
  if (urgency === 'express_vip') {
    durationMins = Math.max(15, Math.round(durationMins * 0.75));
  } else {
    durationMins = Math.max(20, durationMins);
  }
  
  return {
    distanceKm: km,
    durationMins,
    price: totalPrice,
    courierEarnings,
  };
}
