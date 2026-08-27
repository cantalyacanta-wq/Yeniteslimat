import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Layers, 
  Radio, 
  Sparkles, 
  Eye, 
  Compass, 
  Clock, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';
import { DistrictName, DeliveryRequest } from '../types';
import { useDelivery } from '../context/DeliveryContext';

interface AntalyaMapProps {
  highlightedOrderId?: string;
  onSelectOrder?: (order: DeliveryRequest) => void;
}

export const AntalyaMap: React.FC<AntalyaMapProps> = ({ highlightedOrderId, onSelectOrder }) => {
  const { requests, setSelectedTrackingId, setCurrentView } = useDelivery();
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictName | 'all'>('all');
  const [animationStep, setAnimationStep] = useState<number>(0);

  // Animated courier movement ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Filter requests with coordinates
  const activeRequests = requests.filter(
    (r) => r.status === 'courier_assigned' || r.status === 'picked_up' || r.status === 'near_destination' || r.status === 'pending_pool'
  );

  const selectedOrder = requests.find((r) => r.id === (highlightedOrderId || requests[0]?.id));

  // Map coordinates projection to SVG viewbox (Antalya bounding box approx 36.5 to 37.1 lat, 30.4 to 31.6 lng)
  const minLat = 36.50;
  const maxLat = 37.10;
  const minLng = 30.50;
  const maxLng = 31.25;

  const projectCoords = (lat: number, lng: number) => {
    // x: 0 to 800 (longitude)
    // y: 0 to 500 (latitude inverted)
    const x = ((lng - minLng) / (maxLng - minLng)) * 750 + 25;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 420 + 30;
    return { x: Math.max(30, Math.min(770, x)), y: Math.max(30, Math.min(470, y)) };
  };

  // Landmark list
  const landmarks = [
    { name: 'Kaleiçi & Marina', lat: 36.884, lng: 30.705, type: 'center' },
    { name: 'Konyaaltı Sahili', lat: 36.872, lng: 30.635, type: 'beach' },
    { name: 'Lara Düden Şelalesi', lat: 36.851, lng: 30.785, type: 'nature' },
    { name: 'Antalya Havalimanı (AYT)', lat: 36.901, lng: 30.800, type: 'airport' },
    { name: 'Akdeniz Üniversitesi', lat: 36.892, lng: 30.655, type: 'uni' },
    { name: 'MarkAntalya & Şarampol', lat: 36.895, lng: 30.702, type: 'mall' },
    { name: 'Terracity AVM', lat: 36.853, lng: 30.758, type: 'mall' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              Antalya Şehir İçi Canlı Kurye & Rota Radarı
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
            <p className="text-xs text-slate-500">Antalya merkez ilçeleri canlı teslimat ve kurye takip görünümü</p>
          </div>
        </div>

        {/* District filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Bölge:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value as DistrictName | 'all')}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold outline-hidden cursor-pointer"
          >
            <option value="all">Tüm Antalya Haritası</option>
            {Object.keys(ANTALYA_DISTRICTS).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SVG Interactive Map Container */}
      <div className="relative w-full aspect-16/10 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
        {/* Background Grid & Sea */}
        <svg className="w-full h-full" viewBox="0 0 800 500">
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>

            {/* Gradients */}
            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Grid background */}
          <rect width="800" height="500" fill="url(#grid)" />

          {/* Coastline shape representation for Antalya Bay (Körfez) */}
          <path
            d="M 0 500 L 150 500 Q 220 380 280 340 T 400 330 Q 560 360 800 480 L 800 500 Z"
            fill="url(#seaGradient)"
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Sea Label */}
          <text x="350" y="440" fill="#38bdf8" fontSize="14" fontWeight="600" opacity="0.4" letterSpacing="4">
            AKDENİZ (ANTALYA KÖRFEZİ)
          </text>

          {/* District Area Zones */}
          {Object.entries(ANTALYA_DISTRICTS).map(([name, data]) => {
            const pt = projectCoords(data.centerCoordinates.lat, data.centerCoordinates.lng);
            const isMatch = selectedDistrict === 'all' || selectedDistrict === name;
            return (
              <g key={name} opacity={isMatch ? 1 : 0.35}>
                {/* District circle radius */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="34"
                  fill="rgba(99, 102, 241, 0.08)"
                  stroke="rgba(129, 140, 248, 0.25)"
                  strokeWidth="1.5"
                />
                <circle cx={pt.x} cy={pt.y} r="3" fill="#818cf8" />
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {name}
                </text>
              </g>
            );
          })}

          {/* Landmarks */}
          {landmarks.map((lm, idx) => {
            const pt = projectCoords(lm.lat, lm.lng);
            return (
              <g key={idx}>
                <circle cx={pt.x} cy={pt.y} r="2" fill="#fbbf24" opacity="0.7" />
                <text x={pt.x + 4} y={pt.y + 3} fill="#94a3b8" fontSize="8">
                  {lm.name}
                </text>
              </g>
            );
          })}

          {/* Active Orders Routes & Animated Motorbike */}
          {activeRequests.map((req, idx) => {
            const startPt = projectCoords(req.sender.lat || 36.8860, req.sender.lng || 30.7065);
            const endPt = projectCoords(req.receiver.lat || 36.8732, req.receiver.lng || 30.6384);

            // Curve control point for aesthetic route arc
            const midX = (startPt.x + endPt.x) / 2 + (idx % 2 === 0 ? 25 : -25);
            const midY = (startPt.y + endPt.y) / 2 - 20;
            const pathD = `M ${startPt.x} ${startPt.y} Q ${midX} ${midY} ${endPt.x} ${endPt.y}`;

            // Interpolate courier motor position based on animation step
            const t = ((animationStep + idx * 25) % 100) / 100;
            // Quadratic bezier calculation
            const currentX = (1 - t) * (1 - t) * startPt.x + 2 * (1 - t) * t * midX + t * t * endPt.x;
            const currentY = (1 - t) * (1 - t) * startPt.y + 2 * (1 - t) * t * midY + t * t * endPt.y;

            const isSelected = selectedOrder?.id === req.id;

            return (
              <g key={req.id} className="cursor-pointer" onClick={() => onSelectOrder && onSelectOrder(req)}>
                {/* Route Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? 'url(#routeGradient)' : '#64748b'}
                  strokeWidth={isSelected ? '3.5' : '2'}
                  strokeDasharray={req.status === 'pending_pool' ? '4 3' : 'none'}
                  opacity={isSelected ? 0.95 : 0.4}
                />

                {/* Pickup point (Orange) */}
                <circle cx={startPt.x} cy={startPt.y} r="5" fill="#f97316" stroke="#fff" strokeWidth="1.5" />
                
                {/* Dropoff point (Blue) */}
                <circle cx={endPt.x} cy={endPt.y} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />

                {/* Moving Courier Icon on Active Missions */}
                {req.status !== 'pending_pool' && (
                  <g transform={`translate(${currentX - 10}, ${currentY - 10})`}>
                    <circle cx="10" cy="10" r="10" fill="#f59e0b" className="animate-pulse" />
                    <circle cx="10" cy="10" r="8" fill="#1e293b" />
                    <text x="10" y="13" textAnchor="middle" fill="#fbbf24" fontSize="10">
                      🛵
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Map Legend & Selected Tracker info */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-white text-xs max-w-xs space-y-1.5 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aktif Trafik: {activeRequests.length} Görev</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Alış
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Varış
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Moto Kurye
            </span>
          </div>
        </div>

        {/* Selected Order Bottom Mini Card */}
        {selectedOrder && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 text-white shadow-xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
                  {selectedOrder.trackingCode}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {selectedOrder.packageName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {selectedOrder.sender.district} ➔ {selectedOrder.receiver.district} ({selectedOrder.estimatedDistanceKm} km)
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedTrackingId(selectedOrder.id);
                setCurrentView('tracker');
              }}
              className="shrink-0 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Takip Et
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
