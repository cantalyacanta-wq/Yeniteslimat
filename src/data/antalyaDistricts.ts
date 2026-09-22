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
  },
  'Konyaaltı': {
    'Muratpaşa': 12,
    'Konyaaltı': 8,
    'Kepez': 13,
    'Lara (Muratpaşa)': 24,
  },
  'Kepez': {
    'Muratpaşa': 10,
    'Konyaaltı': 13,
    'Kepez': 9,
    'Lara (Muratpaşa)': 21,
  },
  'Lara (Muratpaşa)': {
    'Muratpaşa': 14,
    'Konyaaltı': 24,
    'Kepez': 21,
    'Lara (Muratpaşa)': 7,
  },
};

/**
 * Antalya şehir içi ve ilçeler arası teslimat mesafesi, kurye sürüş süresi ve fiyat hesaplaması.
 * Kural:
 * - Yemek / Restoran: 100 TL (Taban)
 * - Diğer Tüm Gönderiler: 150 TL (Taban)
 * - Aynı İlçeden Alım ve Teslimat: Baz fiyat geçerlidir (fark 0 TL).
 * - Farklı İlçelerden Alım ve Teslimat: Baz fiyata +30 TL ilçe farkı eklenir.
 * - KM başına mesafe farkı eklenmez.
 * - Kurye Hakedişi: Tam Ücret
 */
export function calculateDeliveryEstimate(
  fromDistrict: DistrictName,
  toDistrict: DistrictName,
  packageType: string,
  urgency?: string
) {
  const km = DISTRICT_DISTANCE_MATRIX[fromDistrict]?.[toDistrict] || 12;
  
  const isFood = packageType === 'food';
  const basePrice = isFood ? 100 : 150;

  // Aynı ilçe vs farklı ilçe kontrolü:
  // KM bazlı ek ücret kaldırıldı. Aynı ilçede baz fiyat, farklı ilçede +30 TL eklenir.
  const isSameDistrict = fromDistrict === toDistrict;
  const districtDiffExtra = isSameDistrict ? 0 : 30;
  const totalPrice = basePrice + districtDiffExtra;
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
    basePrice,
    isSameDistrict,
    districtDiffExtra,
    extraKm: 0,
    distanceExtra: districtDiffExtra,
    price: totalPrice,
    courierEarnings,
  };
}
