import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Check, 
  X, 
  Loader2, 
  Navigation,
  Compass,
  AlertCircle,
  Layers,
  Map as MapIcon,
  Globe
} from 'lucide-react';
import { DistrictName } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';

export interface LocationSelectedResult {
  address: string;
  district: DistrictName;
  neighborhood?: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'sender' | 'receiver';
  initialDistrict?: DistrictName;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  onConfirmLocation: (result: LocationSelectedResult) => void;
}

// Google Maps API Key
const GOOGLE_MAPS_API_KEY =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyAubHBV1xzZ-B8YawPQuAiZJaOzxJ8l4rA';

/**
 * Calculates nearest Antalya district from coordinates
 */
function findNearestAntalyaDistrict(lat: number, lng: number): DistrictName {
  let closestDistrict: DistrictName = 'Muratpaşa';
  let minDistance = Infinity;

  (Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).forEach((dName) => {
    const center = ANTALYA_DISTRICTS[dName].centerCoordinates;
    const dist = Math.hypot(center.lat - lat, center.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestDistrict = dName;
    }
  });

  return closestDistrict;
}

// Well-known Antalya POIs for instant search autocomplete
const ANTALYA_POPULAR_PLACES = [
  { name: 'Kaleiçi Tarihi Merkez', district: 'Muratpaşa' as DistrictName, lat: 36.8841, lng: 30.7056 },
  { name: 'Konyaaltı Sahili / Beach Park', district: 'Konyaaltı' as DistrictName, lat: 36.8838, lng: 30.6526 },
  { name: 'Terracity AVM (Lara)', district: 'Muratpaşa' as DistrictName, lat: 36.8524, lng: 30.7562 },
  { name: 'MarkAntalya AVM', district: 'Muratpaşa' as DistrictName, lat: 36.8920, lng: 30.7020 },
  { name: 'Mall of Antalya & Deepo', district: 'Kepez' as DistrictName, lat: 36.9205, lng: 30.7835 },
  { name: 'Antalya Havalimanı (AYT)', district: 'Muratpaşa' as DistrictName, lat: 36.8987, lng: 30.8005 },
  { name: 'Akdeniz Üniversitesi Kampüsü', district: 'Konyaaltı' as DistrictName, lat: 36.8942, lng: 30.6515 },
  { name: 'Antalya Şehirlerarası Otobüs Terminali', district: 'Kepez' as DistrictName, lat: 36.9230, lng: 30.6690 },
  { name: 'Lara Plajı ve Oteller Bölgesi', district: 'Muratpaşa' as DistrictName, lat: 36.8550, lng: 30.8120 },
  { name: 'Düden Şelalesi (Aşağı Düden / Lara)', district: 'Muratpaşa' as DistrictName, lat: 36.8510, lng: 30.7840 },
  { name: 'Yukarı Düden Şelalesi', district: 'Kepez' as DistrictName, lat: 36.9640, lng: 30.7260 },
  { name: 'Güllük Caddesi (Ana Arter)', district: 'Muratpaşa' as DistrictName, lat: 36.8900, lng: 30.6980 },
  { name: 'Işıklar Caddesi & Karaalioğlu Parkı', district: 'Muratpaşa' as DistrictName, lat: 36.8800, lng: 30.7080 },
  { name: 'Şirinyalı Mahallesi & Fener', district: 'Muratpaşa' as DistrictName, lat: 36.8610, lng: 30.7380 },
  { name: 'Özgürlük Bulvarı & Barınaklar', district: 'Muratpaşa' as DistrictName, lat: 36.8540, lng: 30.7680 },
  { name: 'Gürsu Mahallesi & Altınkum', district: 'Konyaaltı' as DistrictName, lat: 36.8720, lng: 30.6300 },
  { name: 'Hurma & Sarısu', district: 'Konyaaltı' as DistrictName, lat: 36.8450, lng: 30.5980 },
  { name: 'Liman Mahallesi & Boğaçayı', district: 'Konyaaltı' as DistrictName, lat: 36.8580, lng: 30.6120 },
  { name: 'Varsak & Masal Parkı', district: 'Kepez' as DistrictName, lat: 36.9620, lng: 30.7080 },
  { name: 'Dokuma Park & Kepez Kent Ormanı', district: 'Kepez' as DistrictName, lat: 36.9180, lng: 30.6850 },
  { name: 'Kemer Marina & Merkez', district: 'Kemer' as DistrictName, lat: 36.6025, lng: 30.5600 },
  { name: 'Belek Turizm Merkezi', district: 'Serik' as DistrictName, lat: 36.8625, lng: 31.0556 },
  { name: 'Side Antik Kenti & Manavgat', district: 'Manavgat' as DistrictName, lat: 36.7869, lng: 31.3908 },
  { name: 'Alanya Kalesi & Damlataş', district: 'Alanya' as DistrictName, lat: 36.5438, lng: 31.9998 },
];

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  initialDistrict = 'Muratpaşa',
  initialAddress = '',
  initialLat,
  initialLng,
  onConfirmLocation,
}) => {
  // Center determination
  const defaultCenter = ANTALYA_DISTRICTS[initialDistrict]?.centerCoordinates || {
    lat: 36.8860,
    lng: 30.7065,
  };

  const [position, setPosition] = useState<{ lat: number; lng: number }>(() => ({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  }));

  const [address, setAddress] = useState<string>(initialAddress);
  const [district, setDistrict] = useState<DistrictName>(initialDistrict);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Map layer view mode: 'osm' (streets), 'satellite' (aerial), 'google' (Google Maps iframe view)
  const [layerMode, setLayerMode] = useState<'osm' | 'satellite' | 'google'>('osm');

  // Search query & autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; district: DistrictName; lat: number; lng: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Leaflet map container refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Reverse geocode handler
  const fetchAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    const nearest = findNearestAntalyaDistrict(lat, lng);
    setDistrict(nearest);

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=tr`,
        { headers: { 'User-Agent': 'AntalyaKuryeTeslimat/1.0' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
        const houseNumber = addr.house_number ? `No: ${addr.house_number}` : '';
        const suburb = addr.suburb || addr.neighbourhood || addr.city_district || '';
        
        let formatted = '';
        if (road && houseNumber) {
          formatted = `${road}, ${houseNumber}, ${suburb ? suburb + ' Mah., ' : ''}${nearest}, Antalya`;
        } else if (road) {
          formatted = `${road}, ${suburb ? suburb + ' Mah., ' : ''}${nearest}, Antalya`;
        } else if (data.display_name) {
          const parts = data.display_name.split(',').slice(0, 3).join(',').trim();
          formatted = `${parts}, ${nearest}, Antalya`;
        } else {
          formatted = `${nearest}, Antalya (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        }

        setAddress(formatted);
      } else {
        setAddress(`${nearest}, Antalya (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
      }
    } catch {
      setAddress(`${nearest}, Antalya (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || layerMode === 'google') return;

    // Timeout ensures DOM modal container has mounted and dimensions are set
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const primaryColor = type === 'sender' ? '#059669' : '#0284c7';
      const pinLabel = type === 'sender' ? 'ALIŞ NOKTASI' : 'TESLİMAT NOKTASI';

      // Custom high-DPI HTML Pin Icon
      const customPinIcon = L.divIcon({
        className: 'custom-interactive-pin',
        html: `
          <div style="position: relative; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: grab;">
            <div style="background: ${primaryColor}; color: white; padding: 6px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5); border: 2px solid white; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
              <span>📍</span>
              <span>${pinLabel}</span>
            </div>
            <div style="width: 32px; height: 32px; background: ${primaryColor}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
              <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [40, 56],
        iconAnchor: [20, 56],
      });

      if (!leafletMapRef.current) {
        // Create Leaflet Map Instance
        const map = L.map(mapContainerRef.current, {
          center: [position.lat, position.lng],
          zoom: 15,
          zoomControl: true,
          attributionControl: false,
        });

        leafletMapRef.current = map;

        // Choose Tile Layer (Streets vs Satellite)
        const tileUrl = layerMode === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const tiles = L.tileLayer(tileUrl, {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        tileLayerRef.current = tiles;

        // Add Draggable Marker
        const marker = L.marker([position.lat, position.lng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        leafletMarkerRef.current = marker;

        // Marker drag events
        marker.on('dragend', () => {
          const newLatLng = marker.getLatLng();
          const newPos = { lat: newLatLng.lat, lng: newLatLng.lng };
          setPosition(newPos);
          fetchAddressFromCoords(newPos.lat, newPos.lng);
        });

        // Map click places the pin
        map.on('click', (e: L.LeafletMouseEvent) => {
          const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
          setPosition(newPos);
          marker.setLatLng([newPos.lat, newPos.lng]);
          fetchAddressFromCoords(newPos.lat, newPos.lng);
        });

        // Ensure Leaflet map recalculates its container dimensions correctly
        map.invalidateSize();
      } else {
        const map = leafletMapRef.current;
        map.invalidateSize();

        // Update tile layer if changed
        if (tileLayerRef.current) {
          tileLayerRef.current.remove();
        }
        const tileUrl = layerMode === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        tileLayerRef.current = L.tileLayer(tileUrl, {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        // Update marker position
        if (leafletMarkerRef.current) {
          leafletMarkerRef.current.setLatLng([position.lat, position.lng]);
          leafletMarkerRef.current.setIcon(customPinIcon);
        }
      }
    }, 60);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, layerMode, type, position.lat, position.lng, fetchAddressFromCoords]);

  // Clean up Leaflet on modal close
  useEffect(() => {
    if (!isOpen && leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
      leafletMarkerRef.current = null;
      tileLayerRef.current = null;
    }
  }, [isOpen]);

  // Reset values when modal opens
  useEffect(() => {
    if (isOpen) {
      const coords = initialLat && initialLng
        ? { lat: initialLat, lng: initialLng }
        : ANTALYA_DISTRICTS[initialDistrict]?.centerCoordinates || { lat: 36.8860, lng: 30.7065 };
      setPosition(coords);
      setAddress(initialAddress || '');
      setDistrict(initialDistrict);
      setGpsError(null);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  }, [isOpen, initialDistrict, initialAddress, initialLat, initialLng]);

  // Current GPS location trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Cihazınız konum servisini desteklemiyor.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newPos = { lat, lng };
        setPosition(newPos);

        // Update Leaflet map view
        if (leafletMapRef.current && leafletMarkerRef.current) {
          leafletMapRef.current.flyTo([lat, lng], 16, { duration: 1 });
          leafletMarkerRef.current.setLatLng([lat, lng]);
        }

        fetchAddressFromCoords(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Konum izni verilmedi. Lütfen tarayıcı ayarlarından konuma izin verin.');
        } else {
          setGpsError('Konum alınamadı. Harita üzerinden pini seçebilirsiniz.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Quick district focus
  const handleDistrictChange = (d: DistrictName) => {
    setDistrict(d);
    const center = ANTALYA_DISTRICTS[d]?.centerCoordinates;
    if (center) {
      setPosition(center);
      if (leafletMapRef.current && leafletMarkerRef.current) {
        leafletMapRef.current.flyTo([center.lat, center.lng], 14, { duration: 0.8 });
        leafletMarkerRef.current.setLatLng([center.lat, center.lng]);
      }
      fetchAddressFromCoords(center.lat, center.lng);
    }
  };

  // Handle Search Input Change
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const q = val.toLowerCase();
    // Filter internal popular Antalya spots
    const matchedPopular = ANTALYA_POPULAR_PLACES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)
    );

    setSearchResults(matchedPopular);
    setShowSearchResults(true);

    // Also fetch OpenStreetMap Nominatim results in background
    if (val.trim().length >= 3) {
      setIsSearching(true);
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val + ' Antalya')}&countrycodes=tr&limit=5&accept-language=tr`
        );
        if (resp.ok) {
          const data = await resp.json();
          const remoteResults = data.map((item: { display_name: string; lat: string; lon: string }) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            return {
              name: item.display_name.split(',').slice(0, 2).join(', '),
              district: findNearestAntalyaDistrict(lat, lng),
              lat,
              lng,
            };
          });

          // Combine with deduplication
          const combined = [...matchedPopular];
          remoteResults.forEach((rem: { name: string; district: DistrictName; lat: number; lng: number }) => {
            if (!combined.some((c) => Math.hypot(c.lat - rem.lat, c.lng - rem.lng) < 0.005)) {
              combined.push(rem);
            }
          });
          setSearchResults(combined.slice(0, 6));
        }
      } catch {
        // Keep popular matches if remote query fails
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelectSearchResult = (item: { name: string; district: DistrictName; lat: number; lng: number }) => {
    setSearchQuery(item.name);
    setShowSearchResults(false);
    setPosition({ lat: item.lat, lng: item.lng });
    setDistrict(item.district);

    if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.flyTo([item.lat, item.lng], 16, { duration: 1 });
      leafletMarkerRef.current.setLatLng([item.lat, item.lng]);
    }

    fetchAddressFromCoords(item.lat, item.lng);
  };

  const handleConfirm = () => {
    const finalAddress = address.trim() || `${district}, Antalya`;
    onConfirmLocation({
      address: finalAddress,
      district,
      lat: position.lat,
      lng: position.lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div 
        id="map-picker-dialog"
        className="w-full max-w-4xl bg-[#091b15] border border-emerald-600/70 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d271f] via-[#091b15] to-[#0d271f] border-b border-emerald-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
              type === 'sender' ? 'bg-emerald-600' : 'bg-sky-600'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                {title}
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Canlı Harita
                </span>
              </h3>
              <p className="text-xs text-emerald-300/80">
                Pini sürükleyin veya haritada istediğiniz noktaya dokunarak konumu belirleyin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Layer Switcher & Quick Controls */}
        <div className="p-3 sm:p-4 bg-[#061410] border-b border-emerald-900/80 space-y-2.5">
          {/* Autocomplete Search Bar */}
          <div className="relative w-full z-30">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
                placeholder="Antalya içinde mekan, cadde veya mahalle ara (örn: Konyaaltı Sahili, Terracity, Güllük)..."
                className="w-full bg-[#05110d]/95 border border-emerald-600/70 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-emerald-500/70 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none shadow-lg transition"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-3" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-2.5 text-emerald-400 hover:text-white p-0.5 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Suggestions Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#091f17] border border-emerald-600/80 rounded-xl shadow-2xl overflow-hidden divide-y divide-emerald-900/60 z-50 max-h-56 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full px-3.5 py-2.5 text-left text-xs text-emerald-100 hover:bg-emerald-800/50 hover:text-white transition flex items-start gap-2.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-xs">{item.name}</p>
                      <p className="text-[11px] text-emerald-300/70">{item.district}, Antalya</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Row: GPS, District Selector & Map Style Toggles */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* GPS Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gpsLoading}
                className="px-3 py-1.5 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-600/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {gpsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Mevcut Konumumu Bul (GPS)</span>
              </button>

              {/* District Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-emerald-400/80 hidden sm:inline font-medium">İlçe Odakla:</span>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value as DistrictName)}
                  className="bg-[#0c241c] text-emerald-200 border border-emerald-700/70 rounded-lg px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer hover:border-emerald-500"
                >
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((d) => (
                    <option key={d} value={d} className="bg-[#091b15] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Map Layer Mode Switcher */}
            <div className="flex items-center bg-[#071712] p-0.5 rounded-xl border border-emerald-800/80 text-xs">
              <button
                type="button"
                onClick={() => setLayerMode('osm')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  layerMode === 'osm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300/80 hover:text-white hover:bg-emerald-950'
                }`}
                title="Sokak ve cadde haritası"
              >
                <MapIcon className="w-3 h-3" />
                <span>Sokak</span>
              </button>

              <button
                type="button"
                onClick={() => setLayerMode('satellite')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  layerMode === 'satellite'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300/80 hover:text-white hover:bg-emerald-950'
                }`}
                title="Gerçek uydu fotoğrafı görünümü"
              >
                <Globe className="w-3 h-3" />
                <span>Uydu</span>
              </button>

              <button
                type="button"
                onClick={() => setLayerMode('google')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  layerMode === 'google'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300/80 hover:text-white hover:bg-emerald-950'
                }`}
                title="Google Maps haritası"
              >
                <span>Google</span>
              </button>
            </div>
          </div>

          {gpsError && (
            <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Live Interactive Map Canvas Container */}
        <div className="relative w-full h-[380px] sm:h-[450px] bg-[#030d0a] overflow-hidden">
          {layerMode === 'google' ? (
            /* Google Maps Embed / Interactive View with fallback */
            <div className="relative w-full h-full">
              <iframe
                title="Google Maps Pin Picker"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${position.lat},${position.lng}&zoom=15&language=tr`}
              />
              <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-600/70 p-2 rounded-xl text-xs text-emerald-200 shadow-xl max-w-xs pointer-events-auto">
                <p className="font-bold text-white text-[11px]">📍 Pini Sürüklemek İçin:</p>
                <p className="text-[10px] text-emerald-300">
                  Yukarıdan <strong>Sokak</strong> veya <strong>Uydu</strong> moduna geçerek pini harita üzerinde istediğiniz yere sürükleyip bırakabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => setLayerMode('osm')}
                  className="mt-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-extrabold cursor-pointer transition w-full"
                >
                  Sürüklenebilir Harita Moduna Geç
                </button>
              </div>
            </div>
          ) : (
            /* Leaflet Interactive Map with Draggable Custom Pin */
            <div
              ref={mapContainerRef}
              id="leaflet-picker-canvas"
              style={{ width: '100%', height: '100%' }}
              className="w-full h-full z-10"
            />
          )}

          {/* Floating Live Coordinates & Tip */}
          <div className="absolute bottom-3 left-3 z-20 bg-[#061410]/95 backdrop-blur-xs border border-emerald-700/70 rounded-xl px-3 py-1.5 text-[11px] text-emerald-300 font-mono shadow-2xl flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
            {isGeocoding && (
              <span className="flex items-center gap-1 text-emerald-400 ml-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-sans">Adres alınıyor...</span>
              </span>
            )}
          </div>

          <div className="absolute top-3 left-3 z-20 hidden sm:flex items-center gap-1.5 bg-[#061410]/90 backdrop-blur-xs border border-emerald-700/60 rounded-lg px-2.5 py-1 text-[11px] text-emerald-300 shadow pointer-events-none">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>Pini sürükleyebilir veya haritada herhangi bir yere tıklayabilirsiniz</span>
          </div>
        </div>

        {/* Selected Address Confirmation Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-[#061410] via-[#091b15] to-[#091b15] border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Seçilen İlçe & Adres:
              </span>
              <span className="text-xs font-black text-amber-300 bg-amber-950/70 border border-amber-600/70 px-2.5 py-0.5 rounded-full">
                {district}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white font-medium line-clamp-2">
              {address || `${district}, Antalya (Harita üzerinde belirlenen konum)`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              id="confirm-map-location-btn"
              onClick={handleConfirm}
              className={`px-5 py-2.5 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                type === 'sender'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/50'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-900/50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Bu Konumu Kullan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
