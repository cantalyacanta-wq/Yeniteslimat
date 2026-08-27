import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  KeyRound, 
  Package,
  Compass,
  PhoneCall
} from 'lucide-react';
import { DeliveryRequest, DistrictName } from '../types';
import { useDelivery } from '../context/DeliveryContext';

export const CourierPool: React.FC = () => {
  const {
    poolRequests,
    activeCourierDeliveries,
    activeCourier,
    couriers,
    setActiveCourierId,
    isCourierOnline,
    setIsCourierOnline,
    acceptRequest,
    updateStatus,
    addDemoRequest,
    activeStats,
  } = useDelivery();

  const [inputCode, setInputCode] = useState<{ [id: string]: string }>({});
  const [errorMsg, setErrorMsg] = useState<{ [id: string]: string }>({});
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  const filteredPool = poolRequests.filter((req) => {
    if (filterDistrict !== 'all' && req.sender.district !== filterDistrict && req.receiver.district !== filterDistrict) {
      return false;
    }
    return true;
  });

  const handleFinishDelivery = (req: DeliveryRequest) => {
    const code = inputCode[req.id] || '';
    if (!code) {
      setErrorMsg({ ...errorMsg, [req.id]: 'Lütfen 4 haneli teslimat kodunu giriniz.' });
      return;
    }

    const res = updateStatus(req.id, 'delivered', code);
    if (!res.success) {
      setErrorMsg({ ...errorMsg, [req.id]: res.message || 'Hatalı teslimat kodu!' });
    } else {
      setErrorMsg({ ...errorMsg, [req.id]: '' });
      setInputCode({ ...inputCode, [req.id]: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Courier Profile & Status Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{activeCourier.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                {activeCourier.vehicleType}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Plaka: <span className="font-mono font-semibold text-slate-700">{activeCourier.plate}</span> • {activeCourier.totalDeliveries} Başarılı Teslimat
            </p>
          </div>
        </div>

        {/* Courier Online / Offline Toggle & Earnings */}
        <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Bugünkü Kazanç</span>
            <span className="text-base sm:text-lg font-black text-emerald-600">
              {activeStats.courierEarningsToday} ₺
            </span>
          </div>

          <button
            onClick={() => setIsCourierOnline(!isCourierOnline)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isCourierOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCourierOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            {isCourierOnline ? '🟢 Çevrimiçi' : '🔴 Çevrimdışı'}
          </button>
        </div>
      </div>

      {/* 1. SECTION: Active Deliveries (If Courier has accepted jobs) */}
      {activeCourierDeliveries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
              Üzerinizdeki Aktif Görevler ({activeCourierDeliveries.length})
            </h3>
          </div>

          <div className="space-y-4">
            {activeCourierDeliveries.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border-2 border-blue-500 shadow-md p-5 sm:p-6 space-y-4"
              >
                {/* Header of Active Card */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                      {req.trackingCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{req.packageName}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Kurye Hakediş: </span>
                    <span className="text-base font-extrabold text-emerald-600">{req.courierEarnings} ₺</span>
                  </div>
                </div>

                {/* Pickup & Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                  {/* Pickup */}
                  <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> 1. Alış Adresi (Gönderen)
                      </span>
                      <a
                        href={`tel:${req.sender.contactPhone}`}
                        className="text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> {req.sender.contactPhone}
                      </a>
                    </div>
                    <p className="font-bold text-slate-900">{req.sender.contactName}</p>
                    <p className="text-slate-600">{req.sender.district} ({req.sender.neighborhood})</p>
                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">{req.sender.addressDetail}</p>
                  </div>

                  {/* Delivery */}
                  <div className="space-y-1.5 md:pl-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5" /> 2. Teslim Adresi (Alıcı)
                      </span>
                      <a
                        href={`tel:${req.receiver.contactPhone}`}
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> {req.receiver.contactPhone}
                      </a>
                    </div>
                    <p className="font-bold text-slate-900">{req.receiver.contactName}</p>
                    <p className="text-slate-600">{req.receiver.district} ({req.receiver.neighborhood})</p>
                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">{req.receiver.addressDetail}</p>
                  </div>
                </div>

                {/* Status action buttons for Courier */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Şu Anki Durum:</span>
                    <span className="text-xs font-bold text-slate-800">
                      {req.status === 'courier_assigned' && '🛵 Alış adresine gidiyorsunuz'}
                      {req.status === 'picked_up' && '📦 Paketi aldınız, alıcıya gidiyorsunuz'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Step 1: Picked Up Button */}
                    {req.status === 'courier_assigned' && (
                      <button
                        onClick={() => updateStatus(req.id, 'picked_up')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Package className="w-4 h-4" />
                        Paketi Adresten Teslim Aldım
                      </button>
                    )}

                    {/* Step 2: Deliver with 4-Digit Code */}
                    {req.status === 'picked_up' && (
                      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                        <div className="relative w-full sm:w-44">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            maxLength={4}
                            value={inputCode[req.id] || ''}
                            onChange={(e) => {
                              setInputCode({ ...inputCode, [req.id]: e.target.value });
                              setErrorMsg({ ...errorMsg, [req.id]: '' });
                            }}
                            placeholder="Müşteri Kodu (4 Hane)"
                            className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center tracking-widest text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                          />
                        </div>

                        <button
                          onClick={() => handleFinishDelivery(req)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Teslimatı Tamamla
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {errorMsg[req.id] && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg[req.id]}</span>
                    <span className="text-[11px] text-slate-500 ml-auto">(Test kodu: {req.deliveryCode})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECTION: Pool of Waiting Orders */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              Bekleyen Kurye Talep Havuzu ({filteredPool.length})
            </h3>
            <p className="text-xs text-slate-500">Müşterilerin oluşturduğu ve kurye bekleyen anlık paketler.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden"
            >
              <option value="all">Tüm Antalya İlçeleri</option>
              <option value="Muratpaşa">Muratpaşa</option>
              <option value="Konyaaltı">Konyaaltı</option>
              <option value="Kepez">Kepez</option>
              <option value="Lara (Muratpaşa)">Lara</option>
            </select>

            <button
              onClick={addDemoRequest}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              + Talep Ekle
            </button>
          </div>
        </div>

        {/* List of Waiting Requests */}
        {filteredPool.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Şu anda havuzda bekleyen talep yok.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Paket Gönder sekmesinden yeni bir talep oluşturabilir veya yukarıdaki "+ Talep Ekle" butonuyla hazır örnek talep yükleyebilirsiniz.
            </p>
            <button
              onClick={addDemoRequest}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-orange-500/20"
            >
              ⚡ Hemen Örnek Talep Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPool.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition p-5 flex flex-col justify-between gap-4"
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                      {req.trackingCode}
                    </span>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      {req.estimatedDurationMins} dk teslimat
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                      <span className="font-bold text-slate-900">{req.sender.district}</span>
                      <span className="text-slate-500">({req.sender.neighborhood})</span>
                    </div>
                    <div className="pl-1 text-slate-300">↓ {req.estimatedDistanceKm} km</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="font-bold text-slate-900">{req.receiver.district}</span>
                      <span className="text-slate-500">({req.receiver.neighborhood})</span>
                    </div>
                  </div>

                  {/* Package Note */}
                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800 block">📦 {req.packageName}</span>
                    {req.noteForCourier && <span className="text-slate-500 italic block mt-0.5">"{req.noteForCourier}"</span>}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Kurye Kazancı</span>
                    <span className="text-lg font-black text-emerald-600">{req.courierEarnings} ₺</span>
                  </div>

                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Bike className="w-4 h-4" />
                    Görevi Kabul Et
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
