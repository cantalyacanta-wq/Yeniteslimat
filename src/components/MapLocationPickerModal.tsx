import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Check, 
  X, 
  Loader2, 
  Navigation,
  Compass,
  AlertCircle
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

// Fallback Google Maps API Key
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

/**
 * Parses Geocoder result to identify Antalya district and street address
 */
function parseGeocoderResult(result: google.maps.GeocoderResult): {
  district: DistrictName;
  formattedAddress: string;
  neighborhood: string;
} {
  let foundDistrict: DistrictName | null = null;
  let neighborhood = '';

  const components = result.address_components || [];

  for (const comp of components) {
    const types = comp.types || [];
    const name = comp.long_name;

    // Check sublocality / neighborhood
    if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
      neighborhood = name;
    }

    // Match district against Antalya known districts
    (Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).forEach((d) => {
      const cleanD = d.toLowerCase().replace(/[^a-zçğıöşü]/g, '');
      const cleanName = name.toLowerCase().replace(/[^a-zçğıöşü]/g, '');
      if (cleanName.includes(cleanD) || cleanD.includes(cleanName)) {
        foundDistrict = d;
      }
    });
  }

  // Fallback to coordinates if district not identified in components
  const finalDistrict =
    foundDistrict ||
    findNearestAntalyaDistrict(
      result.geometry.location.lat(),
      result.geometry.location.lng()
    );

  return {
    district: finalDistrict,
    formattedAddress: result.formatted_address || '',
    neighborhood,
  };
}

/**
 * Inner Map Controller Component with click handling, reverse geocoding, and GPS
 */
const MapPickerController: React.FC<{
  type: 'sender' | 'receiver';
  position: { lat: number; lng: number };
  setPosition: (pos: { lat: number; lng: number }) => void;
  setAddress: (addr: string) => void;
  setDistrict: (dist: DistrictName) => void;
  setIsGeocoding: (val: boolean) => void;
}> = ({ type, position, setPosition, setAddress, setDistrict, setIsGeocoding }) => {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize geocoder once library is loaded
  useEffect(() => {
    if (geocodingLib && !geocoderRef.current) {
      geocoderRef.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib]);

  // Reverse geocode whenever position changes
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!geocoderRef.current) return;
      setIsGeocoding(true);

      geocoderRef.current.geocode(
        { location: { lat, lng }, language: 'tr' },
        (results, status) => {
          setIsGeocoding(false);
          if (status === 'OK' && results && results[0]) {
            const parsed = parseGeocoderResult(results[0]);
            setAddress(parsed.formattedAddress);
            setDistrict(parsed.district);
          } else {
            // Fallback: estimate district based on coordinates
            const nearest = findNearestAntalyaDistrict(lat, lng);
            setDistrict(nearest);
            setAddress(`${nearest}, Antalya (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          }
        }
      );
    },
    [setIsGeocoding, setAddress, setDistrict]
  );

  // Pan map when position updates
  useEffect(() => {
    if (map) {
      map.panTo(position);
    }
  }, [map, position]);

  return (
    <>
      <AdvancedMarker
        position={position}
        draggable={true}
        onDragEnd={(e) => {
          if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setPosition(newPos);
            reverseGeocode(newPos.lat, newPos.lng);
          }
        }}
        title="Konumu hassas ayarlamak için pini sürükleyin"
      >
        <Pin
          background={type === 'sender' ? '#059669' : '#0284c7'}
          borderColor="#ffffff"
          glyphColor="#ffffff"
          scale={1.25}
        />
      </AdvancedMarker>
    </>
  );
};

/**
 * Autocomplete search bar using Google Places library
 */
const PlacesSearchBox: React.FC<{
  onSelectPlace: (lat: number, lng: number, address: string) => void;
}> = ({ onSelectPlace }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const placesLib = useMapsLibrary('places');
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (placesLib && !autocompleteService.current) {
      autocompleteService.current = new placesLib.AutocompleteService();
    }
    if (geocodingLib && !geocoder.current) {
      geocoder.current = new geocodingLib.Geocoder();
    }
  }, [placesLib, geocodingLib]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val || val.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (autocompleteService.current) {
      // Prioritize Antalya bounds
      autocompleteService.current.getPlacePredictions(
        {
          input: `${val} Antalya`,
          componentRestrictions: { country: 'tr' },
          language: 'tr',
        },
        (res, status) => {
          if (status === 'OK' && res) {
            setPredictions(res.slice(0, 5));
            setIsOpen(true);
          } else {
            setPredictions([]);
          }
        }
      );
    }
  };

  const handleSelectPrediction = (pred: google.maps.places.AutocompletePrediction) => {
    setQuery(pred.description);
    setIsOpen(false);

    if (geocoder.current) {
      geocoder.current.geocode({ placeId: pred.place_id, language: 'tr' }, (res, status) => {
        if (status === 'OK' && res && res[0]) {
          const loc = res[0].geometry.location;
          onSelectPlace(loc.lat(), loc.lng(), res[0].formatted_address || pred.description);
        }
      });
    }
  };

  return (
    <div className="relative w-full z-20">
      <div className="relative">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Antalya içinde cadde, mahalle veya mekan ara (örn: Şirinyalı, Terracity, Güllük)..."
          className="w-full bg-[#05110d]/95 border border-emerald-600/70 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-emerald-500/70 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none shadow-lg transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setPredictions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-2.5 text-emerald-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#091f17] border border-emerald-600/80 rounded-xl shadow-2xl overflow-hidden divide-y divide-emerald-900/60 z-50 max-h-56 overflow-y-auto">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onClick={() => handleSelectPrediction(p)}
              className="w-full px-3.5 py-2.5 text-left text-xs text-emerald-100 hover:bg-emerald-800/50 hover:text-white transition flex items-start gap-2.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-xs">{p.structured_formatting?.main_text || p.description}</p>
                <p className="text-[11px] text-emerald-300/70 line-clamp-1">{p.structured_formatting?.secondary_text || ''}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      const coords = initialLat && initialLng
        ? { lat: initialLat, lng: initialLng }
        : ANTALYA_DISTRICTS[initialDistrict]?.centerCoordinates || { lat: 36.8860, lng: 30.7065 };
      setPosition(coords);
      setAddress(initialAddress || '');
      setDistrict(initialDistrict);
      setGpsError(null);
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
        setPosition({ lat, lng });

        // Identify nearest Antalya district
        const detected = findNearestAntalyaDistrict(lat, lng);
        setDistrict(detected);
        setAddress(`GPS Konumum (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        id="map-picker-dialog"
        className="w-full max-w-3xl bg-[#091b15] border border-emerald-600/70 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
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
                  Google Maps
                </span>
              </h3>
              <p className="text-xs text-emerald-300/80">
                Pini sürükleyerek veya haritaya tıklayarak tam lokasyonu belirleyin
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

        {/* Search & GPS Quick Actions */}
        <div className="p-3 sm:p-4 bg-[#061410] border-b border-emerald-900/80 space-y-2.5">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'marker', 'geocoding']}>
            <PlacesSearchBox
              onSelectPlace={(lat, lng, formatted) => {
                setPosition({ lat, lng });
                setAddress(formatted);
                setDistrict(findNearestAntalyaDistrict(lat, lng));
              }}
            />
          </APIProvider>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gpsLoading}
                className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-600/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {gpsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Mevcut Konumumu Bul (GPS)</span>
              </button>

              {/* Quick district selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-emerald-400/80 hidden sm:inline">İlçe Odakla:</span>
                <select
                  value={district}
                  onChange={(e) => {
                    const d = e.target.value as DistrictName;
                    setDistrict(d);
                    const center = ANTALYA_DISTRICTS[d]?.centerCoordinates;
                    if (center) {
                      setPosition(center);
                    }
                  }}
                  className="bg-[#0c241c] text-emerald-200 border border-emerald-700/70 rounded-lg px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
                >
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((d) => (
                    <option key={d} value={d} className="bg-[#091b15] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-[11px] text-emerald-400/80 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>Pini tutup istediğiniz noktaya taşıyabilirsiniz</span>
            </div>
          </div>

          {gpsError && (
            <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Google Map Canvas Area */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[400px] w-full bg-[#030d0a]">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'geocoding', 'places']}>
            <Map
              mapId="bf51a910020fa25a"
              defaultZoom={15}
              defaultCenter={position}
              center={position}
              gestureHandling="greedy"
              disableDefaultUI={false}
              streetViewControl={false}
              mapTypeControl={false}
              fullscreenControl={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              onClick={(e) => {
                if (e.detail?.latLng) {
                  const newPos = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
                  setPosition(newPos);
                  // Reverse geocode fallback
                  const nearest = findNearestAntalyaDistrict(newPos.lat, newPos.lng);
                  setDistrict(nearest);
                  setAddress(`${nearest}, Antalya (${newPos.lat.toFixed(5)}, ${newPos.lng.toFixed(5)})`);
                }
              }}
              className="w-full h-full"
            >
              <MapPickerController
                type={type}
                position={position}
                setPosition={setPosition}
                setAddress={setAddress}
                setDistrict={setDistrict}
                setIsGeocoding={setIsGeocoding}
              />
            </Map>
          </APIProvider>

          {/* Floating Live Coordinates / Status Badge */}
          <div className="absolute bottom-3 left-3 bg-[#061410]/90 backdrop-blur-xs border border-emerald-700/60 rounded-xl px-3 py-1.5 text-[11px] text-emerald-300 font-mono shadow-lg flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
            {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-emerald-400 ml-1" />}
          </div>
        </div>

        {/* Selected Address Confirmation Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-[#061410] via-[#091b15] to-[#091b15] border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Seçilen İlçe & Adres:
              </span>
              <span className="text-xs font-black text-amber-300 bg-amber-950/60 border border-amber-600/60 px-2 py-0.5 rounded-full">
                {district}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white font-medium line-clamp-2">
              {address || `${district}, Antalya (Pin ile belirlenen konum)`}
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
