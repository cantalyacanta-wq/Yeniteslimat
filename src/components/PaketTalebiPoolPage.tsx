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
  LogIn,
  UserPlus,
  Lock,
  X,
  FileText,
  ShieldCheck,
  History,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Volume2,
  Bell,
} from 'lucide-react';
import { playAcceptSound, playNewOrderSound, unlockAudioContext } from '../utils/audio';
import { triggerHapticVibration } from '../services/notificationService';
import { maskCustomerName, maskPhoneNumber } from '../utils/masking';
import { TermsOfUseModal } from './TermsOfUseModal';
import { KvkkModal } from './KvkkModal';
import confetti from 'canvas-confetti';

export const PaketTalebiPoolPage: React.FC = () => {
  const {
    requests,
    users,
    couriers,
    currentUser,
    myCourierDeliveries,
    switchUser,
    acceptRequest,
    updateStatus,
    syncWithServer,
    openAuthModal,
    logout,
    requestNotifications,
  } = useDelivery();

  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [acceptedOrder, setAcceptedOrder] = useState<DeliveryRequest | null>(null);
  const [courierAuthPromptOrder, setCourierAuthPromptOrder] = useState<DeliveryRequest | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState<boolean>(false);

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

  // Check if current user is an authenticated courier or admin (excluding any fake mock accounts)
  const isCourier =
    (currentUser.role === 'courier' || currentUser.role === 'admin') &&
    !!currentUser.email &&
    currentUser.id !== 'user-guest-01' &&
    currentUser.id !== 'user-courier-01' &&
    currentUser.id !== 'user-courier-02' &&
    !currentUser.name?.includes('Ahmet Yılmaz') &&
    !currentUser.name?.includes('Mustafa Demir');

  const [showHistory, setShowHistory] = useState<boolean>(false);

  // If user accepted an order, check if it's currently in their active list
  const activeUserDeliveries = requests.filter(
    (r) =>
      (r.status === 'courier_assigned' || r.status === 'picked_up') &&
      ((r.assignedCourier && r.assignedCourier.id === currentUser.id) ||
        (r.courier && r.courier.id === currentUser.id) ||
        (Boolean(currentUser.phone) &&
          (r.assignedCourier?.phone?.replace(/\D/g, '').slice(-10) === currentUser.phone.replace(/\D/g, '').slice(-10) ||
           r.courier?.phone?.replace(/\D/g, '').slice(-10) === currentUser.phone.replace(/\D/g, '').slice(-10))))
  );

  // Past completed deliveries strictly by THIS courier (isolated)
  const myCompletedDeliveries = myCourierDeliveries;

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
    // ENFORCE COURIER LOGIN: Kurye olmayan havuzdan talep seçemesin!
    if (!isCourier) {
      setCourierAuthPromptOrder(order);
      return;
    }

    // ENFORCE ACTIVE ORDER LOCK: Üzerinde aktif siparişi olan kurye yeni sipariş alamaz!
    if (activeUserDeliveries.length > 0) {
      alert(`Üzerinizde henüz teslimatı yapılmamış aktif bir sipariş bulunmaktadır (#${activeUserDeliveries[0].trackingCode}). Teslimatı gerçekleştirene kadar havuzdan yeni sipariş kabul edemezsiniz.`);
      return;
    }

    setAcceptingOrderId(order.id);
    try {
      playAcceptSound();
      triggerHapticVibration([150, 100, 200]);
    } catch {
      // ignore audio errors
    }

    try {
      const courierObj: CourierInfo = couriers.find((c) => c.id === currentUser.id) || {
        id: currentUser.id,
        name: currentUser.name || 'Aktif Kurye',
        phone: currentUser.phone || '0500 000 00 00',
        email: currentUser.email || 'kurye@antalyakurye.com',
        district: currentUser.district || 'Muratpaşa',
        rating: 5.0,
        totalDeliveries: (currentUser.totalOrders || 0) + 1,
      };

      acceptRequest(order.id, courierObj);

      setAcceptedOrder({
        ...order,
        status: 'courier_assigned',
        courier: courierObj,
        assignedCourier: courierObj,
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
            <button
              type="button"
              onClick={() => {
                unlockAudioContext();
                playNewOrderSound();
                triggerHapticVibration([200, 100, 200]);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-[11px] font-bold text-emerald-300 transition cursor-pointer active:scale-95 shadow-xs"
              title="Kurye yeni sipariş bildirim sesini test edin"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sesi Test Et</span>
            </button>

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

        {/* COURIER AUTHENTICATION STATUS & MANDATORY LOGIN BANNER */}
        {isCourier ? (
          <div className="p-3.5 bg-gradient-to-r from-[#03241d] to-[#021a15] border border-emerald-600/70 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-200 font-black text-[10px]">
                    AKTİF KURYE OTURUMU
                  </span>
                </div>
                <span className="text-[11px] text-emerald-300/90 font-mono">
                  {currentUser.phone} • {currentUser.vehicleType || 'Motosiklet'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('courier_login', 'Farklı bir kurye hesabına geçmek için lütfen giriş yapınız.')}
                className="px-3 py-1.5 rounded-xl bg-[#021813] hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold transition cursor-pointer shrink-0"
              >
                Kurye Değiştir
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-[11px] font-semibold transition cursor-pointer shrink-0"
                title="Oturumu Kapat"
              >
                Çıkış
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/95 via-amber-900/90 to-amber-950/95 border-2 border-amber-500/90 text-white space-y-3 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-pulse text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-300">
                  Talep Havuzundan Sipariş Seçmek İçin Kurye Girişi Zorunludur
                </h4>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  Havuzdaki siparişleri yalnızca kayıtlı Antalya Teslimat kuryeleri kabul edebilir. Kurye olmayanlar talep seçemez. Kuryemiz iseniz giriş yapınız; değilseniz hemen Kurye Başvuru Formu'nu doldurunuz.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => openAuthModal('courier_login', 'Talep havuzundaki siparişleri kabul edebilmek için kurye girişi yapmalısınız.')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Kurye Girişi Yap</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('courier_register', 'Kurye ekibimize katılmak için lütfen aşağıdaki başvuru formunu doldurunuz.')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl transition border border-emerald-400/50 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Kurye Ol / Başvuru Formu Doldur</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('courier_forgot_password', 'Kayıtlı e-posta adresinizi yazarak kurye şifrenizi e-posta adresinize alabilirsiniz.')}
                className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-white font-bold text-xs rounded-xl transition border border-amber-500/40 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Şifremi Unuttum</span>
              </button>
            </div>
          </div>
        )}

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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-base text-amber-400">
                            #{req.trackingCode}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-800/60">
                            {req.packageName || 'Standart Paket'}
                          </span>
                          {req.tipAmount && req.tipAmount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 font-extrabold text-[10px] border border-amber-500/80 shadow-sm animate-pulse">
                              +{req.tipAmount} ₺ Bahşiş
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 font-black text-[10px] border border-emerald-600/70 shadow-xs flex items-center gap-1">
                            📍 ~{req.estimatedDistanceKm || 5} km
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-400/80 mt-0.5">
                          Yaklaşık Mesafe: ~{req.estimatedDistanceKm || 5} km • Süre: ~{req.estimatedDurationMins || 35} Dk
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-emerald-400/70 block font-medium">Kurye Kazancı</span>
                        {req.tipAmount && req.tipAmount > 0 && (
                          <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/60 px-1 rounded">
                            Bahşiş Dahil
                          </span>
                        )}
                      </div>
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
                    {isCourier ? (
                      activeUserDeliveries.length > 0 ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-4 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400/60 font-bold text-sm rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Önce Aktif Siparişinizi Teslim Ediniz</span>
                        </button>
                      ) : (
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
                      )
                    ) : (
                      <button
                        type="button"
                        disabled={acceptingOrderId === req.id}
                        onClick={() => handleAcceptJob(req)}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-98 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-slate-950" />
                        <span>Kurye Girişi Yap & Talebi Seç</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* COURIER PAST DELIVERIES (DATA ISOLATED: ONLY THIS COURIER'S DELIVERIES) */}
        {isCourier && (
          <div className="bg-[#021f19] border border-emerald-800/80 rounded-3xl p-4 sm:p-5 text-white shadow-xl space-y-4">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between gap-3 text-left cursor-pointer transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-emerald-300 transition">
                    Tamamlanan Teslimatlarım ({myCompletedDeliveries.length})
                  </h3>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#011410] border border-emerald-800 text-emerald-400">
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showHistory && (
              <div className="pt-3 border-t border-emerald-800/60 space-y-2.5 animate-in fade-in duration-200">
                {myCompletedDeliveries.length === 0 ? (
                  <div className="p-6 text-center text-xs text-emerald-300/70 bg-[#011410] rounded-2xl border border-emerald-800/50">
                    Henüz tamamladığınız bir teslimat bulunmuyor. Havuzdan talep kabul edip teslim ettikçe burada listelenecektir.
                  </div>
                ) : (
                  myCompletedDeliveries.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-[#011813] border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">#{req.trackingCode}</span>
                          <span className="font-extrabold text-white">{req.packageName}</span>
                          <span className="text-emerald-400 font-bold">✓ Teslim Edildi</span>
                        </div>
                        <p className="text-emerald-300/75">
                          {req.sender.district} ➔ {req.receiver.district} ({req.receiver.contactName})
                        </p>
                      </div>
                      <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                        <span className="text-[11px] text-emerald-400/80">Kurye Kazancı:</span>
                        <span className="text-emerald-300 font-black text-sm">+{req.courierEarnings || Math.round(req.price * 0.85)} ₺</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer with Terms and KVKK links */}
        <div className="pt-8 pb-4 text-center text-xs text-emerald-400/70 border-t border-emerald-900/40 mt-8 space-y-2">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-200 underline font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kullanım Koşulları</span>
            </button>
            <span className="text-emerald-800">•</span>
            <button
              type="button"
              onClick={() => setIsKvkkModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-200 underline font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KVKK Aydınlatma Metni</span>
            </button>
            <span className="text-emerald-800">•</span>
            <span className="text-emerald-500/80">Antalya 7/24 Moto Kurye Talep Havuzu</span>
          </div>
          <p className="text-[10px] text-emerald-600">
            © 2026 Antalya Teslimat — Bağımsız kuryeler ile göndericileri buluşturan dijital platform.
          </p>
        </div>

      </div>

      {/* COURIER AUTHENTICATION REQUIRED MODAL */}
      {courierAuthPromptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#0c221a] via-[#081813] to-[#040e0b] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-500/80 space-y-4 text-white text-center relative">
            <button
              type="button"
              onClick={() => setCourierAuthPromptOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Bike className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                Kurye Girişi Zorunludur
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Bu Talebi Seçmek İçin Kurye Girişi Yapmalısınız
              </h3>
              <p className="text-xs text-amber-100/90 leading-relaxed px-2">
                Talep havuzundaki paketler yalnızca kayıtlı kuryelerimiz tarafından kabul edilebilir. Kuryemiz iseniz lütfen giriş yapınız. Henüz kuryemiz değilseniz hemen başvuru formunu doldurarak ekibimize katılabilirsiniz.
              </p>
            </div>

            {/* Target Order Summary */}
            <div className="p-3.5 bg-[#011410] rounded-2xl border border-emerald-800/80 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-1.5">
                <span className="font-mono font-bold text-amber-400">
                  #{courierAuthPromptOrder.trackingCode}
                </span>
                <span className="text-emerald-300 font-extrabold text-sm">
                  +{courierAuthPromptOrder.courierEarnings || Math.round(courierAuthPromptOrder.price * 0.85)} ₺ Kazanç
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>📍 Alış: <strong className="text-white">{courierAuthPromptOrder.sender.district}</strong></span>
                <span>🏁 Teslimat: <strong className="text-white">{courierAuthPromptOrder.receiver.district}</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const orderCode = courierAuthPromptOrder.trackingCode;
                  setCourierAuthPromptOrder(null);
                  openAuthModal(
                    'courier_login',
                    `#${orderCode} nolu siparişi kabul edebilmek için lütfen kurye girişi yapınız.`
                  );
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Kurye Girişi Yap</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCourierAuthPromptOrder(null);
                  openAuthModal(
                    'courier_register',
                    'Antalya Kurye Ekibimize katılmak için lütfen aşağıdaki formu eksiksiz doldurunuz.'
                  );
                }}
                className="w-full py-3 bg-[#032a21] hover:bg-[#04372c] active:scale-98 text-emerald-200 font-bold text-xs sm:text-sm rounded-xl transition border border-emerald-600/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Kurye Başvuru & Kayıt Formu Doldur</span>
              </button>

              <button
                type="button"
                onClick={() => setCourierAuthPromptOrder(null)}
                className="w-full py-2 bg-transparent hover:bg-emerald-950/40 text-slate-400 hover:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      <TermsOfUseModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* KVKK Modal */}
      <KvkkModal
        isOpen={isKvkkModalOpen}
        onClose={() => setIsKvkkModalOpen(false)}
      />
    </div>
  );
};
