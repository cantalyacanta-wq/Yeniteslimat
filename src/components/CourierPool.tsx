import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Package,
  PhoneCall,
  Shield,
  Zap
} from 'lucide-react';
import { DeliveryRequest, DistrictName } from '../types';
import { useDelivery } from '../context/DeliveryContext';

export const CourierPool: React.FC = () => {
  const {
    poolRequests,
    activeCourierDeliveries,
    currentUser,
    isCourierOnline,
    setIsCourierOnline,
    acceptRequest,
    updateStatus,
    addDemoRequest,
    activeStats,
    setIsAuthModalOpen,
  } = useDelivery();

  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  const filteredPool = poolRequests.filter((req) => {
    if (filterDistrict !== 'all' && req.sender.district !== filterDistrict && req.receiver.district !== filterDistrict) {
      return false;
    }
    return true;
  });

  const handleFinishDelivery = (reqId: string) => {
    updateStatus(reqId, 'delivered');
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      
      {/* Active Courier Profile / Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {currentUser.role === 'courier' ? currentUser.name : `${currentUser.name} (Kurye Modu)`}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                {currentUser.vehicleType || 'Honda PCX 125'}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              Plaka: <span className="font-mono font-semibold text-slate-700">{currentUser.plate || '07 BKR 412'}</span> • {currentUser.totalOrders || 0} Teslimat
            </p>
          </div>
        </div>

        {/* Courier Controls: Toggle Online & Earnings */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Bugünkü Kazanç</span>
            <span className="text-base sm:text-lg font-black text-emerald-600">
              {activeStats.courierEarningsToday} ₺
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCourierOnline(!isCourierOnline)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isCourierOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCourierOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>{isCourierOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200/80 flex items-center gap-2.5 text-xs text-sky-800">
        <Shield className="w-4 h-4 text-sky-600 shrink-0" />
        <span className="leading-snug">
          <strong>Gizlilik Korumalı Havuz:</strong> Kurye havuzunda kuryelerin şahsi iletişim ve kimlik bilgileri gizlenir; yalnızca paket güzergahı ve kazanç bilgileri gösterilir.
        </span>
      </div>

      {/* 1. SECTION: Active Deliveries (For Logged-in Courier) */}
      {activeCourierDeliveries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>Üzerinizdeki Aktif Görevler ({activeCourierDeliveries.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {activeCourierDeliveries.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border-2 border-amber-500 shadow-md p-4 sm:p-6 space-y-4"
              >
                {/* Header of Active Card */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200">
                      {req.trackingCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{req.packageName}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Kurye Hakedişi: </span>
                    <span className="text-base font-extrabold text-emerald-600">{req.courierEarnings} ₺</span>
                  </div>
                </div>

                {/* Pickup & Delivery Details for the assigned courier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-xl text-xs">
                  {/* Pickup */}
                  <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> 1. Alış Adresi (Gönderen)
                      </span>
                      <a
                        href={`tel:${req.sender.contactPhone}`}
                        className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3 shrink-0" /> {req.sender.contactPhone}
                      </a>
                    </div>
                    <p className="font-bold text-slate-900">{req.sender.contactName}</p>
                    <p className="text-slate-600">{req.sender.district} ({req.sender.neighborhood})</p>
                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 break-words">{req.sender.addressDetail}</p>
                  </div>

                  {/* Delivery */}
                  <div className="space-y-1.5 md:pl-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 shrink-0" /> 2. Teslim Adresi (Alıcı)
                      </span>
                      <a
                        href={`tel:${req.receiver.contactPhone}`}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3 shrink-0" /> {req.receiver.contactPhone}
                      </a>
                    </div>
                    <p className="font-bold text-slate-900">{req.receiver.contactName}</p>
                    <p className="text-slate-600">{req.receiver.district} ({req.receiver.neighborhood})</p>
                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 break-words">{req.receiver.addressDetail}</p>
                  </div>
                </div>

                {/* Status action buttons for Courier */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Şu Anki Görev Durumu:</span>
                    <span className="text-xs font-bold text-slate-800">
                      {req.status === 'courier_assigned' && '🛵 Alış adresine gidiyorsunuz'}
                      {req.status === 'picked_up' && '📦 Paketi aldınız, teslimata gidiyorsunuz'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Step 1: Picked Up Button */}
                    {req.status === 'courier_assigned' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'picked_up')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Package className="w-4 h-4" />
                        <span>Paketi Adresten Teslim Aldım</span>
                      </button>
                    )}

                    {/* Step 2: Deliver Direct Button */}
                    {req.status === 'picked_up' && (
                      <button
                        type="button"
                        onClick={() => handleFinishDelivery(req.id)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Teslimatı Tamamla (Paket Teslim Edildi)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECTION: Pool of Waiting Orders (ANONYMIZED - NO COURIER DETAILS SHOWN) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <span>Bekleyen Kurye Talep Havuzu ({filteredPool.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Müşterilerin oluşturduğu ve kurye bekleyen anlık paketler.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">Tüm Antalya İlçeleri</option>
              <option value="Muratpaşa">Muratpaşa</option>
              <option value="Konyaaltı">Konyaaltı</option>
              <option value="Kepez">Kepez</option>
              <option value="Lara (Muratpaşa)">Lara</option>
              <option value="Döşemealtı">Döşemealtı</option>
              <option value="Aksu">Aksu</option>
            </select>

            <button
              type="button"
              onClick={addDemoRequest}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 border border-amber-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Talep Ekle</span>
            </button>
          </div>
        </div>

        {/* List of Waiting Requests */}
        {filteredPool.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Şu anda havuzda bekleyen paket yok.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Paket Gönder sekmesinden yeni bir talep oluşturabilir veya yukarıdaki "+ Talep Ekle" butonuyla örnek sipariş gönderebilirsiniz.
            </p>
            <button
              type="button"
              onClick={addDemoRequest}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              ⚡ Hemen Örnek Talep Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPool.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition p-4 sm:p-5 flex flex-col justify-between gap-4"
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                      {req.trackingCode}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ~{req.estimatedDurationMins} dk teslimat
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                      <span className="font-bold text-slate-900">{req.sender.district}</span>
                      <span className="text-slate-500">({req.sender.neighborhood})</span>
                    </div>
                    <div className="pl-1 text-slate-300">↓ {req.estimatedDistanceKm} km</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-bold text-slate-900">{req.receiver.district}</span>
                      <span className="text-slate-500">({req.receiver.neighborhood})</span>
                    </div>
                  </div>

                  {/* Package Note */}
                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800 block truncate">📦 {req.packageName}</span>
                    {req.noteForCourier && (
                      <span className="text-slate-500 italic block mt-0.5 truncate">
                        "{req.noteForCourier}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action: Acceptance */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Kurye Kazancı</span>
                    <span className="text-lg font-black text-emerald-600">{req.courierEarnings} ₺</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => acceptRequest(req.id)}
                    className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Bike className="w-4 h-4 shrink-0" />
                    <span>Görevi Kabul Et</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
