import React, { useState, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { DeliveryRequest, CourierInfo } from '../types';
import {
  Bike,
  Navigation,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  Zap,
  MapPin,
  ExternalLink,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import { playAcceptSound, playNewOrderSound } from '../utils/audio';
import { triggerHapticVibration } from '../services/notificationService';
import { maskCustomerName, maskPhoneNumber } from '../utils/masking';
import confetti from 'canvas-confetti';

export const PaketTalebiPoolPage: React.FC = () => {
  const {
    requests,
    users,
    couriers,
    currentUser,
    switchUser,
    acceptRequest,
    updateStatus,
    syncWithServer,
  } = useDelivery();

  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [acceptedOrder, setAcceptedOrder] = useState<DeliveryRequest | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Auto-sync real-time every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (typeof syncWithServer === 'function') {
        try {
          await syncWithServer();
        } catch (err) {
          console.debug('Live sync status:', err);
        }
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Pool requests waiting for courier
  const poolRequests = requests.filter((r) => r.status === 'pending_pool');

  // If user accepted an order, also check if it's currently in their active list
  const activeUserDeliveries = requests.filter(
    (r) =>
      (r.status === 'courier_assigned' || r.status === 'picked_up') &&
      r.courier &&
      (r.courier.id === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'courier')
  );

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (typeof syncWithServer === 'function') {
      try {
        await syncWithServer();
      } catch (err) {
        console.debug('Refresh status:', err);
      }
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAcceptJob = async (order: DeliveryRequest) => {
    setAcceptingOrderId(order.id);
    try {
      playAcceptSound();
      triggerHapticVibration([150, 100, 200]);
    } catch {
      // ignore audio errors
    }

    try {
      // Ensure courier identity is ready
      let courierUser = currentUser;
      if (courierUser.role !== 'courier' && courierUser.role !== 'admin') {
        // Auto-assign to default active courier
        const firstCourier = users.find((u) => u.role === 'courier');
        if (firstCourier) {
          switchUser(firstCourier.id);
          courierUser = firstCourier;
        }
      }

      const courierObj: CourierInfo = couriers.find((c) => c.id === courierUser.id) || {
        id: courierUser.id || 'user-courier-01',
        name: courierUser.name || 'Ahmet Yılmaz',
        phone: courierUser.phone || '0507 754 74 84',
        email: courierUser.email || 'kuryeantalyam@gmail.com',
        rating: 5.0,
        totalDeliveries: courierUser.totalOrders || 14,
      };

      acceptRequest(order.id, courierObj);

      setAcceptedOrder({
        ...order,
        status: 'courier_assigned',
        courier: courierObj,
      });

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Accept job error:', err);
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const getNavUrl = (district: string, addressDetail?: string) => {
    const full = encodeURIComponent(`Antalya, ${district}, ${addressDetail || ''}`);
    return `https://www.google.com/maps/search/?api=1&query=${full}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011410] via-[#021d17] to-[#011410] text-slate-100 py-6 px-3 sm:px-6 flex flex-col justify-start items-center">
      <div className="w-full max-w-2xl space-y-5">
        
        {/* MINIMAL HEADER: Antalya Teslimat 7/24 */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Antalya Şehir İçi Teslimat 7/24
              </h1>
              <p className="text-xs text-emerald-400 font-medium">
                Paket Talebi & Kurye Görev Ekranı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-bold text-emerald-300">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Canlı</span>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 rounded-xl bg-[#021f19] hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 transition cursor-pointer"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* RECENTLY ACCEPTED ORDER VIEW (FULL UNMASKED CONTACT DETAILS) */}
        {acceptedOrder && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#022820] to-[#011612] border-2 border-emerald-400 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500 text-white shadow-sm">
                  GÖREV ÜZERİNİZE ALINDI
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  #{acceptedOrder.trackingCode}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-300 block">Kurye Kazancınız</span>
                <span className="text-base font-black text-emerald-300">+{acceptedOrder.courierEarnings} ₺</span>
              </div>
            </div>

            {/* Unmasked Full Contacts */}
            <div className="space-y-3">
              {/* Sender */}
              <div className="p-3.5 bg-[#011410] rounded-2xl border border-emerald-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    1. Gönderici (Alış Adresi):
                  </span>
                  <span className="font-black text-amber-300">{acceptedOrder.sender.district}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-extrabold text-sm">{acceptedOrder.sender.contactName}</span>
                  <a
                    href={`tel:${acceptedOrder.sender.contactPhone}`}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {acceptedOrder.sender.contactPhone}
                  </a>
                </div>
                <p className="text-emerald-200 font-medium">{acceptedOrder.sender.addressDetail}</p>
                <a
                  href={getNavUrl(acceptedOrder.sender.district, acceptedOrder.sender.addressDetail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Haritada Alış Adresine Git
                </a>
              </div>

              {/* Receiver */}
              <div className="p-3.5 bg-[#011410] rounded-2xl border border-emerald-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-teal-400 font-bold flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-teal-400" />
                    2. Alıcı (Teslim Adresi):
                  </span>
                  <span className="font-black text-teal-300">{acceptedOrder.receiver.district}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-extrabold text-sm">{acceptedOrder.receiver.contactName}</span>
                  <a
                    href={`tel:${acceptedOrder.receiver.contactPhone}`}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {acceptedOrder.receiver.contactPhone}
                  </a>
                </div>
                <p className="text-emerald-200 font-medium">{acceptedOrder.receiver.addressDetail}</p>
                <a
                  href={getNavUrl(acceptedOrder.receiver.district, acceptedOrder.receiver.addressDetail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Haritada Teslim Adresine Git
                </a>
              </div>
            </div>

            {/* Direct Call Button */}
            <a
              href={`tel:${acceptedOrder.sender.contactPhone}`}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-white font-black text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 text-center"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>Göndericiyi Hemen Ara ({acceptedOrder.sender.contactPhone})</span>
            </a>

            {/* Status Steps Buttons */}
            <div className="pt-2 flex items-center gap-2">
              {acceptedOrder.status === 'courier_assigned' && (
                <button
                  type="button"
                  onClick={() => {
                    updateStatus(acceptedOrder.id, 'picked_up');
                    setAcceptedOrder({ ...acceptedOrder, status: 'picked_up' });
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer"
                >
                  📦 Paketi Adresten Teslim Aldım
                </button>
              )}

              {acceptedOrder.status === 'picked_up' && (
                <button
                  type="button"
                  onClick={() => {
                    updateStatus(acceptedOrder.id, 'delivered');
                    setAcceptedOrder(null);
                  }}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-teal-500/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Teslimatı Tamamla (Paket Teslim Edildi)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PENDING POOL REQUESTS LIST (ONLY TALEP & TALEBİ KABUL ET BUTTON) */}
        <div className="space-y-4">
          {poolRequests.length === 0 ? (
            !acceptedOrder && (
              <div className="p-10 rounded-3xl bg-[#021f19] border border-emerald-800/80 text-center space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900/50 border border-emerald-700/60 text-emerald-400 mx-auto flex items-center justify-center">
                  <Bike className="w-7 h-7 opacity-70" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Havuzda Bekleyen Talep Yok</h3>
                  <p className="text-xs text-emerald-300/70">
                    Yeni bir müşteri talebi oluşturulduğunda ekranda anında gözükecektir.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Yenile</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            poolRequests.map((req) => {
              const isAliciOdemeli = req.paymentMethod === 'alici_odemeli';

              return (
                <div
                  key={req.id}
                  className="p-5 sm:p-6 rounded-3xl bg-[#021f19] border-2 border-emerald-600/90 shadow-2xl space-y-4 text-white"
                >
                  {/* Talep Başlığı & Kazanç */}
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                        <Zap className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-amber-400">
                            #{req.trackingCode}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-800/60">
                            {req.packageName || 'Standart Paket'}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-400/80 mt-0.5">
                          Tahmini Teslimat: ~{req.estimatedDurationMins || 35} Dk
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400/70 block font-medium">Kurye Kazancı</span>
                      <span className="text-xl font-black text-emerald-300">
                        +{req.courierEarnings || Math.round(req.price * 0.85)} ₺
                      </span>
                    </div>
                  </div>

                  {/* 1. Alış & 2. Teslimat Noktaları */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Alış Noktası */}
                    <div className="p-3 bg-[#011410] rounded-2xl border border-emerald-800/70 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> 1. Alış Noktası
                        </span>
                        <span className="text-white font-extrabold">{req.sender.district}</span>
                      </div>
                      <p className="text-slate-200 font-medium truncate">{req.sender.addressDetail || req.sender.district}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-900/60 text-[11px]">
                        <span className="text-emerald-300/80">👤 {maskCustomerName(req.sender.contactName)}</span>
                        <span className="text-amber-300/90 font-mono font-bold">{maskPhoneNumber(req.sender.contactPhone)}</span>
                      </div>
                    </div>

                    {/* Teslimat Noktası */}
                    <div className="p-3 bg-[#011410] rounded-2xl border border-emerald-800/70 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5" /> 2. Teslimat Noktası
                        </span>
                        <span className="text-white font-extrabold">{req.receiver.district}</span>
                      </div>
                      <p className="text-slate-200 font-medium truncate">{req.receiver.addressDetail || req.receiver.district}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-900/60 text-[11px]">
                        <span className="text-amber-300/80">👤 {maskCustomerName(req.receiver.contactName)}</span>
                        <span className="text-amber-300/90 font-mono font-bold">{maskPhoneNumber(req.receiver.contactPhone)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Varsa Müşteri Notu */}
                  {req.noteForCourier && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 flex items-start gap-2">
                      <span className="font-bold shrink-0">📝 Not:</span>
                      <span>{req.noteForCourier}</span>
                    </div>
                  )}

                  {/* Ödeme Yöntemi Uyarısı */}
                  {isAliciOdemeli ? (
                    <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-600/70 text-xs text-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>
                        <strong>ALICI ÖDEMELİ:</strong> Teslimatta alıcıdan <strong>{req.price} ₺</strong> tahsil edilecektir.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>GÖNDERİCİ ÖDEMELİ:</strong> Ücret: <strong>{req.price} ₺</strong>
                      </span>
                    </div>
                  )}

                  {/* TALEBİ KABUL ET BUTONU (MAIN CTA) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={acceptingOrderId === req.id}
                      onClick={() => handleAcceptJob(req)}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 disabled:opacity-50 text-white font-black text-base rounded-2xl transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Bike className="w-5 h-5" />
                      <span>{acceptingOrderId === req.id ? 'Talep Kabul Ediliyor...' : 'TALEBİ KABUL ET'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
