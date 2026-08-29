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
  Plus,
  Radio,
  Check
} from 'lucide-react';
import { DeliveryRequest } from '../types';
import { useDelivery } from '../context/DeliveryContext';

export const CourierPool: React.FC = () => {
  const {
    requests,
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

  const [activeTab, setActiveTab] = useState<'pool' | 'active' | 'completed'>('pool');

  // Confirmation Modals State
  const [confirmAcceptOrder, setConfirmAcceptOrder] = useState<DeliveryRequest | null>(null);
  const [customerCallReminderOrder, setCustomerCallReminderOrder] = useState<DeliveryRequest | null>(null);
  const [confirmPickupOrder, setConfirmPickupOrder] = useState<DeliveryRequest | null>(null);
  const [confirmDeliverOrder, setConfirmDeliverOrder] = useState<DeliveryRequest | null>(null);
  const [confirmReleaseOrder, setConfirmReleaseOrder] = useState<DeliveryRequest | null>(null);

  const handleFinishDelivery = (reqId: string) => {
    updateStatus(reqId, 'delivered');
    setConfirmDeliverOrder(null);
  };

  const handleConfirmAccept = () => {
    if (confirmAcceptOrder) {
      const order = confirmAcceptOrder;
      // 1. Instantly assign request so it leaves the pool for all couriers
      acceptRequest(order.id);
      setConfirmAcceptOrder(null);
      // 2. Open prominent customer phone call reminder
      setCustomerCallReminderOrder(order);
      setActiveTab('active');
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

  // Google Maps Navigation Helper
  const getNavUrl = (district: string, address: string) => {
    const fullQuery = `${address}, ${district}, Antalya, Türkiye`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullQuery)}`;
  };

  // Completed deliveries
  const completedDeliveries = requests.filter((r) => r.status === 'delivered');

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 animate-in fade-in duration-300">
      
      {/* Top Emerald Courier Bar */}
      <div className="bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] rounded-3xl border border-emerald-800/60 p-4 sm:p-6 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 rounded-md">
                {currentUser.role === 'courier' ? 'Moto Kurye' : 'Kurye Paneli'}
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 truncate">
              {currentUser.phone} • {currentUser.district || 'Antalya'}
            </p>
          </div>
        </div>

        {/* Courier Online / Today Earnings Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-800/40">
          <div className="text-left sm:text-right">
            <span className="text-[10px] sm:text-[11px] text-emerald-400/80 block font-medium">Bugünkü Kazanç</span>
            <span className="text-base sm:text-lg font-black text-amber-400">
              {activeStats.courierEarningsToday} ₺
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCourierOnline(!isCourierOnline)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              isCourierOnline
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                : 'bg-emerald-950/40 text-emerald-400/70 border-emerald-800/60'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCourierOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span>{isCourierOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('pool')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'pool'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Bekleyen Talep Havuzu ({poolRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Üzerimdeki Aktif Görevler ({activeCourierDeliveries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer border shrink-0 ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
              : 'bg-[#021813] text-emerald-300 border-emerald-800/60 hover:bg-[#03241d]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tamamlananlar ({completedDeliveries.length})</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: POOL OF WAITING REQUESTS */}
      {/* ================================================================= */}
      {activeTab === 'pool' && (
        <div className="space-y-4">
          <div className="bg-[#021d17] p-4 rounded-2xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                <span>Anlık Kurye Bekleyen Müşteri Talepleri ({poolRequests.length})</span>
              </h3>
              <p className="text-xs text-emerald-300/80">
                Müşterilerin oluşturduğu ve kurye kabulü bekleyen canlı siparişler.
              </p>
            </div>
          </div>

          {poolRequests.length === 0 ? (
            <div className="bg-gradient-to-br from-[#021f19] to-[#011410] rounded-3xl border border-emerald-800/60 p-8 sm:p-12 text-center space-y-4 text-white">
              <div className="w-14 h-14 rounded-3xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">Şu anda havuzda bekleyen müşteri paketi yok</h4>
                <p className="text-xs text-emerald-300/80 max-w-md mx-auto">
                  Müşteriler paket gönderim talebi oluşturduğunda anında burada canlı olarak listelenecektir.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poolRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border border-emerald-700/60 hover:border-emerald-400 transition p-5 flex flex-col justify-between gap-4 text-white shadow-xl"
                >
                  {/* Top Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-800/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-[#011410] text-amber-400 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                          {req.trackingCode}
                        </span>
                        <span className="text-xs font-bold text-emerald-200 truncate max-w-[150px]">
                          {req.packageName}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-600/50 px-2.5 py-0.5 rounded-full">
                        ~{req.estimatedDurationMins} dk
                      </span>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-2 bg-[#011410] p-3.5 rounded-2xl border border-emerald-800/40 text-xs">
                      {/* Sender */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-bold text-white block">1. Alış: {req.sender.district}</span>
                          <p className="text-emerald-300/80 text-[11px] truncate">{req.sender.addressDetail}</p>
                          <p className="text-emerald-400 font-mono text-[11px] mt-0.5">Gönderen: {req.sender.contactName} ({req.sender.contactPhone})</p>
                        </div>
                      </div>

                      {/* Receiver */}
                      <div className="flex items-start gap-2 pt-2 border-t border-emerald-900/60">
                        <Navigation className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-bold text-white block">2. Teslimat: {req.receiver.district}</span>
                          <p className="text-emerald-300/80 text-[11px] truncate">{req.receiver.addressDetail}</p>
                          <p className="text-teal-400 font-mono text-[11px] mt-0.5">Alıcı: {req.receiver.contactName} ({req.receiver.contactPhone})</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment & Note */}
                    <div className="flex items-center justify-between text-[11px] bg-[#011914] px-3 py-1.5 rounded-xl border border-emerald-800/30">
                      <span className="text-emerald-300">
                        Ödeme: <strong>{req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'}</strong>
                      </span>
                      <span className="text-emerald-400/80">Mesafe: {req.estimatedDistanceKm} km</span>
                    </div>
                  </div>

                  {/* Accept Action */}
                  <div className="pt-3 border-t border-emerald-800/50 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-emerald-400/80 block font-medium">Kurye Kazancı</span>
                      <span className="text-xl font-black text-amber-400">{req.courierEarnings} ₺</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmAcceptOrder(req)}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-2 shrink-0"
                    >
                      <Bike className="w-4 h-4 shrink-0" />
                      <span>Görevi Seç & Başlat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: ACTIVE DELIVERIES ASSIGNED TO COURIER */}
      {/* ================================================================= */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="bg-[#021d17] p-4 rounded-2xl border border-emerald-800/60 text-white">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <span>Üzerinizdeki Aktif Görevler ({activeCourierDeliveries.length})</span>
            </h3>
            <p className="text-xs text-emerald-300/80">
              Kabul ettiğiniz ve şu anda taşımakta olduğunuz paketler.
            </p>
          </div>

          {activeCourierDeliveries.length === 0 ? (
            <div className="bg-gradient-to-br from-[#021f19] to-[#011410] rounded-3xl border border-emerald-800/60 p-8 sm:p-12 text-center space-y-3 text-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700/50 text-emerald-400 mx-auto flex items-center justify-center">
                <Bike className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Şu anda üzerinizde aktif görev bulunmuyor.</p>
              <button
                type="button"
                onClick={() => setActiveTab('pool')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Talep Havuzuna Git
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCourierDeliveries.map((req) => (
                <div
                  key={req.id}
                  className="bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border-2 border-emerald-500 shadow-2xl p-5 sm:p-6 space-y-4 text-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-[#011410] text-amber-400 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                        {req.trackingCode}
                      </span>
                      <span className="text-xs font-bold text-white">{req.packageName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-600/50">
                        {req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-emerald-300/80">Kurye Hakedişi: </span>
                      <span className="text-base font-extrabold text-amber-400">{req.courierEarnings} ₺</span>
                    </div>
                  </div>

                  {/* Route & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#011410] p-4 rounded-2xl border border-emerald-800/40 text-xs">
                    {/* Pickup */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> 1. Alış Adresi (Gönderen)
                        </span>
                        <a
                          href={`tel:${req.sender.contactPhone}`}
                          className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-700/60 font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" /> {req.sender.contactPhone}
                        </a>
                      </div>
                      <p className="font-bold text-white">{req.sender.contactName}</p>
                      <p className="text-emerald-300">{req.sender.district}</p>
                      <p className="text-emerald-200/80 break-words">{req.sender.addressDetail}</p>
                      <a
                        href={getNavUrl(req.sender.district, req.sender.addressDetail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Alış Adresine Haritada Git
                      </a>
                    </div>

                    {/* Delivery */}
                    <div className="space-y-2 md:pl-3 md:border-l border-emerald-800/50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-400 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5" /> 2. Teslim Adresi (Alıcı)
                        </span>
                        <a
                          href={`tel:${req.receiver.contactPhone}`}
                          className="px-2 py-0.5 bg-emerald-950 text-teal-300 rounded border border-emerald-700/60 font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" /> {req.receiver.contactPhone}
                        </a>
                      </div>
                      <p className="font-bold text-white">{req.receiver.contactName}</p>
                      <p className="text-teal-300">{req.receiver.district}</p>
                      <p className="text-emerald-200/80 break-words">{req.receiver.addressDetail}</p>
                      <a
                        href={getNavUrl(req.receiver.district, req.receiver.addressDetail)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Teslimat Adresine Haritada Git
                      </a>
                    </div>
                  </div>

                  {/* Actions for active assignment */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-emerald-800/50">
                    <span className="text-xs font-bold text-emerald-300">
                      {req.status === 'courier_assigned' && '🛵 Alış adresine gidiyorsunuz (Paket henüz alınmadı)'}
                      {req.status === 'picked_up' && '📦 Paketi aldınız, teslimat adresine gidiyorsunuz'}
                    </span>

                    <div className="flex items-center gap-2">
                      {req.status === 'courier_assigned' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setConfirmReleaseOrder(req)}
                            className="px-3.5 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Görevi Bırak
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmPickupOrder(req)}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer"
                          >
                            Paketi Adresten Teslim Aldım
                          </button>
                        </>
                      )}

                      {req.status === 'picked_up' && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeliverOrder(req)}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/30 cursor-pointer flex items-center gap-2"
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
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: COMPLETED DELIVERIES */}
      {/* ================================================================= */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="bg-[#021d17] p-4 rounded-2xl border border-emerald-800/60 text-white">
            <h3 className="font-extrabold text-sm sm:text-base">Tamamlanan Teslimatlar ({completedDeliveries.length})</h3>
            <p className="text-xs text-emerald-300/80">Başarıyla alıcıya ulaştırılan geçmiş teslimatlar.</p>
          </div>

          {completedDeliveries.length === 0 ? (
            <div className="bg-[#021f19] rounded-3xl border border-emerald-800/60 p-8 text-center text-white">
              <p className="text-xs text-emerald-300/80">Henüz tamamlanmış teslimat bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedDeliveries.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#011813] border border-emerald-800/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{req.trackingCode}</span>
                      <span className="font-extrabold">{req.packageName}</span>
                      <span className="text-emerald-400">✓ Teslim Edildi</span>
                    </div>
                    <p className="text-emerald-300/70">
                      {req.sender.district} ➔ {req.receiver.district} ({req.receiver.contactName})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-extrabold text-sm">+{req.courierEarnings} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SIMPLE CONFIRM ACCEPT MODAL (Evet / Hayır Only) */}
      {confirmAcceptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#022019] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-600/70 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">Görevi Kabul Etmek İstiyor Musunuz?</h3>
                <p className="text-xs text-emerald-300/80">Bu teslimat görevi adınıza atanacaktır.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#011410] rounded-2xl border border-emerald-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between border-b border-emerald-900 pb-1.5 font-bold">
                <span className="text-amber-400 font-mono">{confirmAcceptOrder.trackingCode}</span>
                <span className="text-emerald-300">Hakediş: {confirmAcceptOrder.courierEarnings} ₺</span>
              </div>
              <p className="text-emerald-100"><strong>Paket:</strong> {confirmAcceptOrder.packageName}</p>
              <p className="text-emerald-200/90"><strong>Güzergah:</strong> {confirmAcceptOrder.sender.district} ➔ {confirmAcceptOrder.receiver.district}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAcceptOrder(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-sm cursor-pointer transition text-center"
              >
                Hayır
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-extrabold text-sm cursor-pointer transition shadow-lg shadow-emerald-500/30 text-center"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER PHONE CALL REMINDER MODAL (Shown after clicking Evet) */}
      {customerCallReminderOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#032a21] to-[#011a14] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-emerald-500/80 space-y-5 text-white">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/40">
                <PhoneCall className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700/50">
                  Görev Üzerinize Alındı
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white pt-1">
                  Müşteriyi Arayarak Teyit Ediniz!
                </h3>
              </div>
            </div>

            <p className="text-xs text-emerald-200 leading-relaxed">
              Talebi üzerinize aldınız ve talep havuzdan çıkarıldı. Teslimatı sorunsuz başlatmak için lütfen gönderici müşteriyi hemen arayıp hazır olduğunu teyit ediniz:
            </p>

            <div className="p-4 bg-[#011410] rounded-2xl border border-emerald-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Gönderici Müşteri:</span>
                <span className="text-white font-black text-sm">{customerCallReminderOrder.sender.contactName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Telefon Numarası:</span>
                <span className="text-amber-400 font-mono font-black text-sm">{customerCallReminderOrder.sender.contactPhone}</span>
              </div>
              <div className="pt-1 border-t border-emerald-900 text-[11px] text-emerald-300/80">
                <span>Adres: {customerCallReminderOrder.sender.addressDetail} ({customerCallReminderOrder.sender.district})</span>
              </div>
            </div>

            <a
              href={`tel:${customerCallReminderOrder.sender.contactPhone}`}
              className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-white font-black text-sm rounded-2xl transition flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30"
            >
              <Phone className="w-5 h-5 animate-pulse" />
              <span>Müşteriyi Hemen Ara ({customerCallReminderOrder.sender.contactPhone})</span>
            </a>

            <button
              type="button"
              onClick={() => setCustomerCallReminderOrder(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs cursor-pointer transition border border-emerald-800/60"
            >
              Teyit Ettim / Göreve Başla
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM PICKUP MODAL */}
      {confirmPickupOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#022019] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-600/60 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Paketi Teslim Almayı Onayla</h3>
                <p className="text-xs text-emerald-300/80">Göndericiden paketi aldığınızı onaylayın.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#011410] rounded-xl text-xs space-y-2 border border-emerald-800/60">
              <div className="flex justify-between">
                <span className="text-emerald-400/80">Paket:</span>
                <span className="font-bold text-white">{confirmPickupOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400/80">Hedef İlçe:</span>
                <span className="font-bold text-white">{confirmPickupOrder.receiver.district}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPickupOrder(null)}
                className="px-4 py-2.5 rounded-xl text-emerald-300 hover:bg-emerald-900/40 font-bold text-xs cursor-pointer transition"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirmPickup}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer transition shadow-md"
              >
                Evet, Paketi Teslim Aldım
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELIVER MODAL */}
      {confirmDeliverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#022019] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-600/60 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Teslimatı Tamamla</h3>
                <p className="text-xs text-emerald-300/80">Alıcıya teslim edildi olarak kaydedilecek.</p>
              </div>
            </div>

            {confirmDeliverOrder.paymentMethod === 'alici_odemeli' ? (
              <div className="p-3.5 bg-amber-950/80 border border-amber-600/60 rounded-xl text-xs space-y-1 text-amber-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>ÖDEME TAHSİLATI GEREKLİ!</span>
                </div>
                <p>Bu sipariş <strong>Alıcı Ödemeli</strong>dir. Alıcıdan <strong>{confirmDeliverOrder.price} ₺</strong> tahsil edildiğini teyit ediniz.</p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-200">
                <span>✓ Gönderici Ödemeli sipariş (Alıcıdan ücret alınmayacaktır).</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeliverOrder(null)}
                className="px-4 py-2.5 rounded-xl text-emerald-300 hover:bg-emerald-900/40 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => handleFinishDelivery(confirmDeliverOrder.id)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer transition shadow-md"
              >
                Evet, Teslimatı Tamamla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RELEASE TASK BACK TO POOL MODAL */}
      {confirmReleaseOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#022019] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-700/60 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-900/80 text-rose-300 border border-rose-600/50 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Görevi Havuza İade Et</h3>
                <p className="text-xs text-rose-200/80">Paketi almadan önce görevi bırakıyorsunuz.</p>
              </div>
            </div>

            <p className="text-xs text-emerald-200/90">
              Bu görevi bırakmak istediğinizden emin misiniz? Talep derhal kurye havuzuna geri düşecek ve diğer kuryelerin alımına açılacaktır.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmReleaseOrder(null)}
                className="px-4 py-2.5 rounded-xl text-emerald-300 hover:bg-emerald-900/40 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmRelease}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition shadow-md"
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
