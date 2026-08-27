import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Package,
  PhoneCall,
  Shield,
  Phone,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
} from 'lucide-react';
import { DeliveryRequest } from '../types';
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
    releaseRequestBackToPool,
    activeStats,
  } = useDelivery();

  // Confirmation Modals State
  const [confirmAcceptOrder, setConfirmAcceptOrder] = useState<DeliveryRequest | null>(null);
  const [confirmPickupOrder, setConfirmPickupOrder] = useState<DeliveryRequest | null>(null);
  const [confirmDeliverOrder, setConfirmDeliverOrder] = useState<DeliveryRequest | null>(null);
  const [confirmReleaseOrder, setConfirmReleaseOrder] = useState<DeliveryRequest | null>(null);

  const handleFinishDelivery = (reqId: string) => {
    updateStatus(reqId, 'delivered');
    setConfirmDeliverOrder(null);
  };

  const handleConfirmAccept = () => {
    if (confirmAcceptOrder) {
      acceptRequest(confirmAcceptOrder.id);
      setConfirmAcceptOrder(null);
    }
  };

  const handleConfirmPickup = () => {
    if (confirmPickupOrder) {
      updateStatus(confirmPickupOrder.id, 'picked_up');
      setConfirmPickupOrder(null);
    }
  };

  const handleConfirmRelease = () => {
    if (confirmReleaseOrder) {
      releaseRequestBackToPool(confirmReleaseOrder.id);
      setConfirmReleaseOrder(null);
    }
  };

  // Helper for Google Maps Navigation URL
  const getNavUrl = (district: string, neighborhood: string, address: string) => {
    const fullQuery = `${neighborhood}, ${address}, ${district}, Antalya, Türkiye`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullQuery)}`;
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
          <strong>Gizlilik Korumalı Havuz:</strong> Kurye havuzunda kuryelerin şahsi kimlik bilgileri gizlenir; yalnızca paket güzergahı ve kazanç bilgileri gösterilir.
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
            {activeCourierDeliveries.map((req) => {
              const currentTarget = req.status === 'courier_assigned' ? req.sender : req.receiver;
              const targetTitle = req.status === 'courier_assigned' ? 'Alış Noktası (Gönderen)' : 'Teslimat Noktası (Alıcı)';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border-2 border-amber-500 shadow-md p-4 sm:p-6 space-y-4"
                >
                  {/* Header of Active Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200">
                        {req.trackingCode}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{req.packageName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        req.paymentMethod === 'alici_odemeli' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {req.paymentMethod === 'alici_odemeli' ? '📥 Alıcı Ödemeli' : '📤 Gönderici Ödemeli'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Kurye Hakedişi: </span>
                        <span className="text-base font-extrabold text-emerald-600">{req.courierEarnings} ₺</span>
                      </div>

                      {/* Main Navigation Shortcut Button */}
                      <a
                        href={getNavUrl(currentTarget.district, currentTarget.neighborhood, currentTarget.addressDetail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs shrink-0"
                        title={`${targetTitle} için navigasyon aç`}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigasyon Aç</span>
                      </a>
                    </div>
                  </div>

                  {/* Pickup & Delivery Details for the assigned courier */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-xl text-xs">
                    {/* Pickup */}
                    <div className={`space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4 ${
                      req.status === 'courier_assigned' ? 'bg-amber-50/60 p-2.5 rounded-xl border border-amber-200' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-600" /> 1. Alış Adresi (Gönderen)
                        </span>
                        <a
                          href={`tel:${req.sender.contactPhone}`}
                          className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"
                        >
                          <PhoneCall className="w-3 h-3 shrink-0" /> {req.sender.contactPhone}
                        </a>
                      </div>
                      <p className="font-bold text-slate-900">{req.sender.contactName}</p>
                      <p className="text-slate-600">{req.sender.district} ({req.sender.neighborhood})</p>
                      <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 break-words">{req.sender.addressDetail}</p>
                      
                      {/* Nav Button for Sender */}
                      <a
                        href={getNavUrl(req.sender.district, req.sender.neighborhood, req.sender.addressDetail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Alış Adresine Haritada Git
                      </a>
                    </div>

                    {/* Delivery */}
                    <div className={`space-y-2 md:pl-2 ${
                      req.status === 'picked_up' ? 'bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> 2. Teslim Adresi (Alıcı)
                        </span>
                        <a
                          href={`tel:${req.receiver.contactPhone}`}
                          className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"
                        >
                          <PhoneCall className="w-3 h-3 shrink-0" /> {req.receiver.contactPhone}
                        </a>
                      </div>
                      <p className="font-bold text-slate-900">{req.receiver.contactName}</p>
                      <p className="text-slate-600">{req.receiver.district} ({req.receiver.neighborhood})</p>
                      <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 break-words">{req.receiver.addressDetail}</p>
                      
                      {/* Nav Button for Receiver */}
                      <a
                        href={getNavUrl(req.receiver.district, req.receiver.neighborhood, req.receiver.addressDetail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Teslimat Adresine Haritada Git
                      </a>
                    </div>
                  </div>

                  {/* Status action buttons for Courier & Cancellation */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-500 block">Şu Anki Görev Durumu:</span>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {req.status === 'courier_assigned' && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                            <span>🛵 Alış adresine gidiyorsunuz (Paket henüz alınmadı)</span>
                          </>
                        )}
                        {req.status === 'picked_up' && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>📦 Paketi aldınız, teslimat adresine gidiyorsunuz</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Step 1: Picked Up Button with confirmation */}
                      {req.status === 'courier_assigned' && (
                        <>
                          {/* Courier Release Task (before pickup) */}
                          <button
                            type="button"
                            onClick={() => setConfirmReleaseOrder(req)}
                            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                            title="Paketi almadan önce görevi bırak ve havuza geri düşür"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Görevi Bırak (Havuza İade Et)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmPickupOrder(req)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Package className="w-4 h-4" />
                            <span>Paketi Adresten Teslim Aldım</span>
                          </button>
                        </>
                      )}

                      {/* Step 2: Deliver Direct Button with confirmation */}
                      {req.status === 'picked_up' && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeliverOrder(req)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Teslimatı Tamamla (Paket Teslim Edildi)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SECTION: Pool of Waiting Orders */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span>Bekleyen Kurye Talep Havuzu ({poolRequests.length})</span>
              </h3>
              <p className="text-xs text-slate-500">Müşterilerin oluşturduğu ve kurye bekleyen anlık siparişler.</p>
            </div>
            <div className="text-right text-xs font-semibold text-slate-500">
              Canlı Akış
            </div>
          </div>
        </div>

        {/* List of Waiting Requests */}
        {poolRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Şu anda havuzda bekleyen paket yok.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Yeni bir sipariş verildiğinde anında burada listelenecek ve bildirim sesi çalacaktır.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poolRequests.map((req) => (
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

                  {/* Package & Payment Note */}
                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">📦 {req.packageName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        req.paymentMethod === 'alici_odemeli' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'}
                      </span>
                    </div>
                    {req.noteForCourier && (
                      <span className="text-slate-500 italic block truncate">
                        "{req.noteForCourier}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action: Acceptance confirmation trigger */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Kurye Kazancı</span>
                    <span className="text-lg font-black text-emerald-600">{req.courierEarnings} ₺</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmAcceptOrder(req)}
                    className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Bike className="w-4 h-4 shrink-0" />
                    <span>Görevi Seç & Teyit Et</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Confirm Order Acceptance & Customer Call Prompt */}
      {confirmAcceptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Müşteriyi Arayarak Teyit Ediniz</h3>
                  <p className="text-xs text-slate-500">Görevi başlatmadan önce gönderici ile görüşünüz.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmAcceptOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-mono font-bold text-slate-700">{confirmAcceptOrder.trackingCode}</span>
                <span className="font-extrabold text-emerald-600 text-sm">Kazanç: {confirmAcceptOrder.courierEarnings} ₺</span>
              </div>

              <div>
                <span className="text-slate-500 block">Gönderici / Müşteri:</span>
                <span className="font-extrabold text-slate-900 text-sm">{confirmAcceptOrder.sender.contactName}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Alış Adresi:</span>
                <span className="font-semibold text-slate-800">{confirmAcceptOrder.sender.district} ({confirmAcceptOrder.sender.neighborhood})</span>
                <p className="text-slate-600 mt-0.5">{confirmAcceptOrder.sender.addressDetail}</p>
              </div>

              <div>
                <span className="text-slate-500 block">Paket:</span>
                <span className="font-semibold text-slate-800">{confirmAcceptOrder.packageName}</span>
              </div>
            </div>

            {/* Direct Call Action */}
            <a
              href={`tel:${confirmAcceptOrder.sender.contactPhone}`}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Phone className="w-5 h-5" />
              <span>Müşteriyi Hemen Ara: {confirmAcceptOrder.sender.contactPhone}</span>
            </a>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Müşteriyi arayıp siparişi teyit ettiyseniz aşağıdaki butona tıklayarak görevi üzerinize alabilirsiniz.</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAcceptOrder(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs cursor-pointer transition shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Teyit Ettim, Görevi Başlat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Confirm Picked Up */}
      {confirmPickupOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Paketi Teslim Almayı Onayla</h3>
                <p className="text-xs text-slate-500">Göndericiden paketi aldığınızı onaylayın.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Paket:</span>
                <span className="font-bold text-slate-800">{confirmPickupOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hedef İlçe:</span>
                <span className="font-bold text-slate-800">{confirmPickupOrder.receiver.district}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Paket teslim alındı olarak işaretlenecek ve müşteri anında bilgilendirilecektir.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPickupOrder(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirmPickup}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm"
              >
                Evet, Paketi Teslim Aldım
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirm Delivery Completed */}
      {confirmDeliverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Teslimatı Tamamla</h3>
                <p className="text-xs text-slate-500">Alıcıya teslim edildi olarak kaydedilecek.</p>
              </div>
            </div>

            {/* Payment reminder */}
            {confirmDeliverOrder.paymentMethod === 'alici_odemeli' ? (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>ÖDEME TAHSİLATI GEREKLİ!</span>
                </div>
                <p>Bu sipariş <strong>Alıcı Ödemeli</strong>dir. Alıcıdan <strong>{confirmDeliverOrder.price} ₺</strong> tahsil edildiğini onaylayınız.</p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span>✓ Gönderici Ödemeli sipariş (Alıcıdan herhangi bir ücret alınmayacaktır).</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeliverOrder(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => handleFinishDelivery(confirmDeliverOrder.id)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm"
              >
                Evet, Teslimatı Tamamla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Confirm Release Task Back to Pool */}
      {confirmReleaseOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Görevi Havuza İade Et</h3>
                <p className="text-xs text-slate-500">Paketi almadan önce görevi bırakıyorsunuz.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Bu görevi üzerinizden bırakmak istediğinizden emin misiniz? Talep derhal kurye havuzuna geri düşecek ve diğer kuryelerin alımına açılacaktır.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmReleaseOrder(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmRelease}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm"
              >
                Evet, Havuza Geri Gönder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
