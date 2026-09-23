import { DistrictName } from '../types';
import { ANTALYA_DISTRICTS, DISTRICT_DISTANCE_MATRIX } from '../data/antalyaDistricts';

export interface DistanceMeasureResult {
  distanceKm: number;
  durationMins: number;
  source: string;
  pickupCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
}

// Client-side cache to make instant repeats free
const clientDistanceCache = new Map<string, DistanceMeasureResult>();

/**
 * Calculates Haversine straight-line distance in KM
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Measures real driving distance between pickup and destination addresses in Antalya.
 * Uses server API with OSRM and OpenStreetMap geocoding, with local fallback.
 */
export async function measureRealDistance(params: {
  pickupAddress: string;
  pickupDistrict: DistrictName;
  destAddress: string;
  destDistrict: DistrictName;
  pickupCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
}): Promise<DistanceMeasureResult> {
  const cacheKey = `${params.pickupDistrict}_${params.pickupAddress.trim().toLowerCase()}_TO_${params.destDistrict}_${params.destAddress.trim().toLowerCase()}`;
  if (clientDistanceCache.has(cacheKey)) {
    return clientDistanceCache.get(cacheKey)!;
  }

  // 1. Try server backend /api/distance/measure
  try {
    const res = await fetch('/api/distance/measure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.distanceKm === 'number' && data.distanceKm > 0) {
        const result: DistanceMeasureResult = {
          distanceKm: Math.round(data.distanceKm * 10) / 10,
          durationMins: Math.max(15, Math.round(data.durationMins || 25)),
          source: data.source || 'server_osrm',
          pickupCoords: data.pickupCoords,
          destCoords: data.destCoords,
        };
        clientDistanceCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Backend fetch failed or timed out, proceed to client fallback
  }

  // 2. Client-side fallback using coordinates
  const p1 =
    params.pickupCoords ||
    ANTALYA_DISTRICTS[params.pickupDistrict]?.centerCoordinates || {
      lat: 36.886,
      lng: 30.7065,
    };
  const p2 =
    params.destCoords ||
    ANTALYA_DISTRICTS[params.destDistrict]?.centerCoordinates || {
      lat: 36.8732,
      lng: 30.6384,
    };

  // Try direct OSRM call from browser
  try {
    const osrmRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${p1.lng},${p1.lat};${p2.lng},${p2.lat}?overview=false`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData?.routes?.[0]?.distance) {
        const distKm = Math.round((osrmData.routes[0].distance / 1000) * 10) / 10;
        const durMins = Math.max(15, Math.round(osrmData.routes[0].duration / 60));
        const res: DistanceMeasureResult = {
          distanceKm: distKm,
          durationMins: durMins,
          source: 'client_osrm',
          pickupCoords: p1,
          destCoords: p2,
        };
        clientDistanceCache.set(cacheKey, res);
        return res;
      }
    }
  } catch {}

  // 3. Mathematical road curvature fallback
  const crowFlies = haversineKm(p1.lat, p1.lng, p2.lat, p2.lng);
  const matrixDist =
    DISTRICT_DISTANCE_MATRIX[params.pickupDistrict]?.[params.destDistrict] || 10;
  const estimatedKm =
    crowFlies > 0.5 ? Math.round(crowFlies * 1.32 * 10) / 10 : matrixDist;

  const result: DistanceMeasureResult = {
    distanceKm: Math.max(2.0, estimatedKm),
    durationMins: Math.max(15, Math.round(10 + estimatedKm * 1.5)),
    source: 'haversine_road_grid',
    pickupCoords: p1,
    destCoords: p2,
  };

  clientDistanceCache.set(cacheKey, result);
  return result;
}
