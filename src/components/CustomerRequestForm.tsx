import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Bike,
  ShieldCheck,
  Zap,
  PhoneCall,
  Clock,
  RotateCcw,
  X,
  Radio,
  Navigation,
  Lock,
  Unlock,
  Check,
  History,
  Heart,
  Coins,
  Sparkles,
  BookmarkCheck,
} from 'lucide-react';
import { DistrictName, PackageType, PaymentMethod, UrgencyType, DeliveryRequest } from '../types';
import { ANTALYA_DISTRICTS, DISTRICT_DISTANCE_MATRIX, calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { useDelivery } from '../context/DeliveryContext';

const SENDER_LOCKED_STORAGE_KEY = 'antalya_kurye_locked_sender_address_v6';
const RECEIVER_LOCKED_STORAGE_KEY = 'antalya_kurye_locked_receiver_address_v6';

export const CustomerRequestForm: React.FC = () => {
  const { 
    createNewRequest, 
    requests, 
    setCurrentView, 
    setSelectedTrackingId, 
    currentUser, 
    cancelRequest,
    openAuthModal,
  } = useDelivery();

  // Address Lock checkbox state
  const [isSenderLocked, setIsSenderLocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SENDER_LOCKED_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  const [isReceiverLocked, setIsReceiverLocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(RECEIVER_LOCKED_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  // Sender state initialized with locked cache or currentUser data
  const [senderDistrict, setSenderDistrict] = useState<DistrictName>(() => {
    try {
      const saved = localStorage.getItem(SENDER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.district) return parsed.district;
      }
    } catch {}
    return currentUser.district || 'Muratpaşa';
  });

  const [senderAddress, setSenderAddress] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SENDER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address) return parsed.address;
      }
    } catch {}
    return currentUser.address || '';
  });

  const [senderName, setSenderName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SENDER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return currentUser.name || '';
  });

  const [senderPhone, setSenderPhone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SENDER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) return parsed.phone;
      }
    } catch {}
    return currentUser.phone || '';
  });

  // Receiver state
  const [receiverDistrict, setReceiverDistrict] = useState<DistrictName>(() => {
    try {
      const saved = localStorage.getItem(RECEIVER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.district) return parsed.district;
      }
    } catch {}
    return 'Konyaaltı';
  });

  const [receiverAddress, setReceiverAddress] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(RECEIVER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address) return parsed.address;
      }
    } catch {}
    return '';
  });

  const [receiverName, setReceiverName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(RECEIVER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return '';
  });

  const [receiverPhone, setReceiverPhone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(RECEIVER_LOCKED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) return parsed.phone;
      }
    } catch {}
    return '';
  });

  // Package info
  const [packageType, setPackageType] = useState<PackageType>('food');
  const [packageName, setPackageName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gonderici_odemeli');
  const [urgency, setUrgency] = useState<UrgencyType>('standard');
  const [noteForCourier, setNoteForCourier] = useState<string>('');

  // Tip / Bahşiş state
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);
  const [customTipInput, setCustomTipInput] = useState<string>('');

  const tipAmount = useMemo(() => {
    if (isCustomTip) {
      const parsed = parseInt(customTipInput.replace(/\D/g, ''), 10);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    return selectedTip;
  }, [isCustomTip, customTipInput, selectedTip]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync locked addresses to localStorage when lock toggle or input changes
  useEffect(() => {
    try {
      if (isSenderLocked) {
        localStorage.setItem(
          SENDER_LOCKED_STORAGE_KEY,
          JSON.stringify({
            district: senderDistrict,
            address: senderAddress,
            name: senderName,
            phone: senderPhone,
          })
        );
      } else {
        localStorage.removeItem(SENDER_LOCKED_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Sender lock error:', e);
    }
  }, [isSenderLocked, senderDistrict, senderAddress, senderName, senderPhone]);

  useEffect(() => {
    try {
      if (isReceiverLocked) {
        localStorage.setItem(
          RECEIVER_LOCKED_STORAGE_KEY,
          JSON.stringify({
            district: receiverDistrict,
            address: receiverAddress,
            name: receiverName,
            phone: receiverPhone,
          })
        );
      } else {
        localStorage.removeItem(RECEIVER_LOCKED_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Receiver lock error:', e);
    }
  }, [isReceiverLocked, receiverDistrict, receiverAddress, receiverName, receiverPhone]);

  // Sync sender info when user switches profile (if not locked)
  useEffect(() => {
    if (!isSenderLocked) {
      if (currentUser.name && !senderName) setSenderName(currentUser.name);
      if (currentUser.phone && !senderPhone) setSenderPhone(currentUser.phone);
      if (currentUser.district) setSenderDistrict(currentUser.district);
      if (currentUser.address && !senderAddress) setSenderAddress(currentUser.address);
    }
  }, [currentUser, isSenderLocked]);

  // Real-time calculation of distance, duration and price
  const estimate = useMemo(() => {
    return calculateDeliveryEstimate(senderDistrict, receiverDistrict, packageType, urgency);
  }, [senderDistrict, receiverDistrict, packageType, urgency]);

  const [cancelModalOrder, setCancelModalOrder] = useState<DeliveryRequest | null>(null);

  // Check if customer has any active in-progress order
  const activeOrder = useMemo(() => {
    const lastSavedOrderId = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_order_id') : null;
    const lastSavedPhone = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_phone') : null;
    const pPhone = lastSavedPhone ? lastSavedPhone.replace(/\D/g, '').slice(-10) : '';

    const uPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, '').slice(-10) : '';
    const uEmail = currentUser.email ? currentUser.email.trim().toLowerCase() : '';
    const uName = currentUser.name ? currentUser.name.trim().toLowerCase() : '';

    return requests.find((r) => {
      if (!r || r.status === 'delivered' || r.status === 'cancelled') return false;
      if (currentUser.id !== 'user-guest-01') {
        if (r.senderUserId && r.senderUserId === currentUser.id) return true;
        if (uPhone && uPhone.length >= 7) {
          const sPhone = r.sender?.contactPhone ? r.sender.contactPhone.replace(/\D/g, '').slice(-10) : '';
          if (sPhone && sPhone === uPhone) return true;
        }
        if (uEmail && (r as any).senderEmail && (r as any).senderEmail.trim().toLowerCase() === uEmail) return true;
        if (uName && uName !== 'yeni müşteri' && uName !== 'müşteri' && r.sender?.contactName?.trim().toLowerCase() === uName) return true;
      }
      return (
        (Boolean(lastSavedOrderId) && r.id === lastSavedOrderId) ||
        (Boolean(pPhone) && r.sender?.contactPhone && r.sender.contactPhone.replace(/\D/g, '').slice(-10) === pPhone)
      );
    });
  }, [requests, currentUser]);

  // Submit request to courier pool and seamlessly route to tracking view
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate clicks

    if (!senderAddress.trim() || !senderName.trim() || !senderPhone.trim()) {
      setFormError('Lütfen paketin alınacağı açık adres, isim ve telefon bilgisini giriniz.');
      return;
    }
    if (!receiverAddress.trim() || !receiverName.trim() || !receiverPhone.trim()) {
      setFormError('Lütfen teslimat yapılacak açık adres, isim ve telefon bilgisini giriniz.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const newReq = createNewRequest({
        sender: {
          district: senderDistrict,
          neighborhood: 'Merkez',
          addressDetail: senderAddress.trim(),
          contactName: senderName.trim(),
          contactPhone: senderPhone.trim(),
          lat: ANTALYA_DISTRICTS[senderDistrict]?.centerCoordinates.lat || 36.8841,
          lng: ANTALYA_DISTRICTS[senderDistrict]?.centerCoordinates.lng || 30.7056,
        },
        receiver: {
          district: receiverDistrict,
          neighborhood: 'Merkez',
          addressDetail: receiverAddress.trim(),
          contactName: receiverName.trim(),
          contactPhone: receiverPhone.trim(),
          lat: ANTALYA_DISTRICTS[receiverDistrict]?.centerCoordinates.lat || 36.8625,
          lng: ANTALYA_DISTRICTS[receiverDistrict]?.centerCoordinates.lng || 30.6375,
        },
        packageType,
        packageName: packageName.trim() || (packageType === 'food' ? 'Sıcak Yemek Siparişi' : 'Standart Paket'),
        packageWeightKg: 1,
        noteForCourier: noteForCourier.trim(),
        urgency,
        paymentMethod,
        isPaid: paymentMethod === 'online_credit_card',
        tipAmount: tipAmount > 0 ? tipAmount : undefined,
      });

      // Clear non-locked fields
      if (!isReceiverLocked) {
        setReceiverAddress('');
        setReceiverName('');
        setReceiverPhone('');
      }
      setPackageName('');
      setNoteForCourier('');
      setSelectedTip(0);
      setIsCustomTip(false);
      setCustomTipInput('');

      // Auto redirect to customer home and focus tracking radar screen as requested
      setSelectedTrackingId(newReq.id);
      setTimeout(() => {
        setCurrentView('home');
      }, 400);
    } catch (err) {
      console.error('Request creation error:', err);
      setFormError('Talep oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyiniz.');
      setIsSubmitting(false);
    }
  };

  if (currentUser.role === 'courier') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#021f19] border border-emerald-800/80 rounded-3xl text-center space-y-4 text-white shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
          <Bike className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-white">Kurye Paneli Aktif</h3>
          <p className="text-xs text-emerald-300/80">
            Kuryeler yeni paket gönderim talebi oluşturamaz. Gelen siparişleri kabul etmek ve yönetmek için Kurye Havuzu'nu kullanınız.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentView('courier')}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <Bike className="w-4 h-4" />
          <span>Kurye Havuzuna Git</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      
      {/* Top Emerald Header Bar */}
      <div className="bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] rounded-3xl border border-emerald-700/60 p-5 sm:p-6 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-500 text-white border border-emerald-400/50 flex items-center justify-center text-base font-bold shrink-0 shadow-md">
              <Package className="w-5 h-5" />
            </span>
            <span>Antalya İçi Kurye Çağır</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
            Alış ve teslimat bilgilerini girin; talebiniz anında moto kurye havuzuna düşsün.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {currentUser.id !== 'user-guest-01' && (
            <button
              type="button"
              id="customer-form-history-btn"
              onClick={() => setCurrentView('history')}
              className="px-4 py-2 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-600/70 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 shrink-0"
              title="Geçmiş Teslimatlarımı Görüntüle"
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span>Geçmiş Teslimatlarım</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-emerald-300 bg-[#011a14] px-3.5 py-2 rounded-2xl border border-emerald-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Antalya İçi 30-45 Dk Jet Kurye</span>
          </div>
        </div>
      </div>

      {/* Active In-Progress Order Notification with Quick Cancel Button */}
      {activeOrder && (
        <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-[#03251e] via-[#043328] to-[#021c15] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <Bike className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-extrabold text-amber-300 text-sm">#{activeOrder.trackingCode}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  activeOrder.assignedCourier
                    ? 'bg-blue-950 text-blue-300 border-blue-500/60'
                    : 'bg-amber-950 text-amber-300 border-amber-600/60'
                }`}>
                  {activeOrder.assignedCourier
                    ? `🏍️ Kurye Atandı: ${activeOrder.assignedCourier.name}`
                    : '⏳ Kurye Havuzunda Aranıyor'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {activeOrder.sender.district} ➔ {activeOrder.receiver.district} ({activeOrder.receiver.contactName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSelectedTrackingId(activeOrder.id);
                setCurrentView('home');
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Canlı Takip</span>
            </button>
            <button
              type="button"
              onClick={() => setCancelModalOrder(activeOrder)}
              className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-600/60 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Kurye atanmış olsa bile talebi iptal edebilirsiniz"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Talebi İptal Et</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Form Layout */}
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#0c1f19] via-[#091a14] to-[#040e0b] rounded-3xl border border-emerald-700/60 p-5 sm:p-8 shadow-2xl text-white">
        <form onSubmit={handleSubmit} className="space-y-7">
          
          {/* Step 1: Pickup Location (Gönderen) */}
          <div className="space-y-4 bg-[#05110d]/90 p-4 sm:p-5 rounded-2xl border border-emerald-800/50">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-extrabold shrink-0 shadow-xs">
                  1
                </span>
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Nereden Alınacak? (Gönderici Bilgileri)</span>
              </div>

              {/* Lock Toggle for Sender Address */}
              <button
                type="button"
                onClick={() => setIsSenderLocked(!isSenderLocked)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isSenderLocked
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-xs'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400/80 hover:text-emerald-200'
                }`}
                title="Sonraki siparişleriniz için bu adresi kilitler ve otomatik doldurur"
              >
                {isSenderLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Adres Kilitli (Kayıtlı)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400/70" />
                    <span>Adresi Kilitle / Hatırla</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Alış İlçesi *</label>
                <select
                  value={senderDistrict}
                  onChange={(e) => setSenderDistrict(e.target.value as DistrictName)}
                  className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
                >
                  {Object.keys(ANTALYA_DISTRICTS).map((d) => (
                    <option key={d} value={d} className="bg-[#0c1f19] text-white">{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Gönderen Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="block text-xs font-semibold text-emerald-200">Açık Adres (Cadde, Sokak, Bina No, Daire) *</label>
                {currentUser.address && (
                  <button
                    type="button"
                    onClick={() => {
                      setSenderAddress(currentUser.address || '');
                      if (currentUser.district) {
                        setSenderDistrict(currentUser.district);
                      }
                      if (currentUser.name && !senderName) {
                        setSenderName(currentUser.name);
                      }
                      if (currentUser.phone && !senderPhone) {
                        setSenderPhone(currentUser.phone);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      senderAddress === currentUser.address
                        ? 'bg-orange-500/25 border-orange-400 text-orange-300 shadow-2xs'
                        : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 hover:text-white'
                    }`}
                    title={`Kayıtlı adresiniz: ${currentUser.address || ''}`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>{senderAddress === currentUser.address ? '✓ Kayıtlı Adresim Seçili' : 'Kayıtlı Adresimden Kullanacağım'}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                placeholder="Örn: İsmet Gökşen Cad. No: 48 Daire: 2"
                className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1.5">İletişim Telefonu *</label>
              <input
                type="tel"
                required
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="0532 XXX XX XX"
                className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium font-mono"
              />
            </div>
          </div>

          {/* Step 2: Delivery Location (Alıcı) */}
          <div className="space-y-4 bg-[#05110d]/90 p-4 sm:p-5 rounded-2xl border border-emerald-800/50">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center font-extrabold shrink-0 shadow-xs">
                  2
                </span>
                <Navigation className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Nereye Teslim Edilecek? (Alıcı Bilgileri)</span>
              </div>

              {/* Lock Toggle for Receiver Address */}
              <button
                type="button"
                onClick={() => setIsReceiverLocked(!isReceiverLocked)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isReceiverLocked
                    ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-xs'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400/80 hover:text-emerald-200'
                }`}
                title="Sonraki siparişleriniz için bu adresi kilitler ve hatırlar"
              >
                {isReceiverLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Adres Kilitli (Kayıtlı)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400/70" />
                    <span>Adresi Kilitle / Hatırla</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Teslimat İlçesi *</label>
                <select
                  value={receiverDistrict}
                  onChange={(e) => setReceiverDistrict(e.target.value as DistrictName)}
                  className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
                >
                  {Object.keys(ANTALYA_DISTRICTS).map((d) => (
                    <option key={d} value={d} className="bg-[#0c1f19] text-white">{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Alıcı Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Alıcı Adı Soyadı"
                  className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="block text-xs font-semibold text-emerald-200">Açık Adres (Cadde, Sokak, Bina No, Daire) *</label>
                {currentUser.address && (
                  <button
                    type="button"
                    onClick={() => {
                      setReceiverAddress(currentUser.address || '');
                      if (currentUser.district) {
                        setReceiverDistrict(currentUser.district);
                      }
                      if (currentUser.name && !receiverName) {
                        setReceiverName(currentUser.name);
                      }
                      if (currentUser.phone && !receiverPhone) {
                        setReceiverPhone(currentUser.phone);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      receiverAddress === currentUser.address
                        ? 'bg-orange-500/25 border-orange-400 text-orange-300 shadow-2xs'
                        : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 hover:text-white'
                    }`}
                    title={`Kayıtlı adresiniz: ${currentUser.address || ''}`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>{receiverAddress === currentUser.address ? '✓ Kayıtlı Adresim Seçili' : 'Kayıtlı Adresimden Kullanacağım'}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="Örn: Atatürk Bulvarı No: 120 Daire: 4"
                className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Alıcı Telefonu *</label>
              <input
                type="tel"
                required
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium font-mono"
              />
            </div>
          </div>

          {/* Step 3: Package & Payment Details */}
          <div className="space-y-4 bg-[#05110d]/90 p-4 sm:p-5 rounded-2xl border border-emerald-800/50">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm border-b border-emerald-800/60 pb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-extrabold shrink-0 shadow-xs">
                3
              </span>
              <Package className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Paket Türü & Ödeme Şekli</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Paket Türü</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as PackageType)}
                  className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 outline-none"
                >
                  <option value="food" className="bg-[#0c1f19] text-white">🍔 Yemek & Restoran Siparişi (Taban 100 ₺)</option>
                  <option value="petshop" className="bg-[#0c1f19] text-white">🐾 Petshop Ürünleri (Taban 150 ₺)</option>
                  <option value="market" className="bg-[#0c1f19] text-white">🛒 Market / Bakkal Siparişi (Taban 150 ₺)</option>
                  <option value="flower" className="bg-[#0c1f19] text-white">💐 Çiçek & Hediye (Taban 150 ₺)</option>
                  <option value="other" className="bg-[#0c1f19] text-white">📦 Diğer (Evrak, Koli, Eşya) (Taban 150 ₺)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Paket İçerik Açıklaması</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Örn: 2 porsiyon yemek, evrak dosyası, pet mama vb."
                  className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-2">Ödeme Yöntemi</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gonderici_odemeli')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'gonderici_odemeli'
                      ? 'border-emerald-400 bg-emerald-900/70 text-white ring-2 ring-emerald-400/50 shadow-md'
                      : 'border-emerald-800/60 bg-[#06120d] text-emerald-200 hover:bg-emerald-950/60'
                  }`}
                >
                  <span className="text-lg">📤</span>
                  <span className="font-extrabold text-sm">Gönderici Ödemeli</span>
                  <span className="text-[11px] font-normal text-emerald-200/80">Ücret çıkış noktasında ödenir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('alici_odemeli')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'alici_odemeli'
                      ? 'border-emerald-400 bg-emerald-900/70 text-white ring-2 ring-emerald-400/50 shadow-md'
                      : 'border-emerald-800/60 bg-[#06120d] text-emerald-200 hover:bg-emerald-950/60'
                  }`}
                >
                  <span className="text-lg">📥</span>
                  <span className="font-extrabold text-sm">Alıcı Ödemeli</span>
                  <span className="text-[11px] font-normal text-emerald-200/80">Ücret teslim noktasında ödenir</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Kuryeye Not (Opsiyonel)</label>
              <input
                type="text"
                value={noteForCourier}
                onChange={(e) => setNoteForCourier(e.target.value)}
                placeholder="Örn: Zile basıp güvenliğe bırakabilirsiniz."
                className="w-full bg-[#06120d] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-emerald-400 outline-none"
              />
            </div>

            {/* Kuryeye Bahşiş Alanı */}
            <div className="bg-[#021f19] border border-emerald-700/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0">
                    <Heart className="w-4 h-4 fill-amber-400/30" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-extrabold text-white tracking-wide">
                        Kuryeye Bahşiş Ekleyin
                      </label>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-full">
                        Opsiyonel
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 leading-relaxed mt-0.5">
                      Bahşişin %100'ü doğrudan kuryeye aktarılır. Bahşişli siparişler kurye havuzunda öne çıkar ve çok daha hızlı kabul edilir.
                    </p>
                  </div>
                </div>

                {tipAmount > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-amber-300/90 block font-medium">Eklenen Bahşiş</span>
                    <span className="text-sm font-black text-amber-400">+{tipAmount} ₺</span>
                  </div>
                )}
              </div>

              {/* Bahşiş Seçenek Butonları */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: 'Yok', value: 0 },
                  { label: '25 ₺', value: 25 },
                  { label: '50 ₺', value: 50 },
                  { label: '75 ₺', value: 75 },
                  { label: '100 ₺', value: 100 },
                ].map((preset) => {
                  const isSelected = !isCustomTip && selectedTip === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setIsCustomTip(false);
                        setSelectedTip(preset.value);
                        setCustomTipInput('');
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40'
                          : 'bg-[#06120d] text-emerald-200 border-emerald-800/70 hover:bg-emerald-950/70 hover:border-emerald-700'
                      }`}
                    >
                      {preset.value > 0 && <Coins className="w-3 h-3 text-amber-300" />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}

                {/* Özel Tutar Butonu */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomTip(true);
                    setSelectedTip(0);
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isCustomTip
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40'
                      : 'bg-[#06120d] text-emerald-200 border-emerald-800/70 hover:bg-emerald-950/70 hover:border-emerald-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Özel Tutar</span>
                </button>
              </div>

              {/* Özel Tutar Giriş Kutusu */}
              {isCustomTip && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      step="5"
                      value={customTipInput}
                      onChange={(e) => setCustomTipInput(e.target.value)}
                      placeholder="Bahşiş tutarını yazınız (Örn: 150)"
                      className="w-full bg-[#06120d] border border-amber-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-700/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none font-bold"
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                      ₺ Bahşiş
                    </span>
                  </div>
                  {customTipInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTipInput('');
                        setIsCustomTip(false);
                        setSelectedTip(0);
                      }}
                      className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 hover:text-white transition cursor-pointer"
                      title="Sıfırla"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-600/70 text-rose-200 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Summary & Protected Action Bar */}
          <div className="bg-[#04140f] border border-emerald-600/60 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 flex-wrap gap-2">
              <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm">{senderDistrict}</span> ➔ <span className="font-extrabold text-white text-sm">{receiverDistrict}</span>
              </div>
              <div className="text-right">
                {estimate.isSameDistrict ? (
                  <span className="text-[11px] text-emerald-300 font-semibold px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-lg inline-block">
                    Aynı İlçe İçi Teslimat (Baz Fiyat)
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/80 border border-amber-600/60 rounded-lg inline-block">
                    Farklı İlçe Teslimatı (+{estimate.districtDiffExtra} ₺)
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-xs text-emerald-300/80 block font-medium">
                  {tipAmount > 0 ? 'Toplam Tutar (Bahşiş Dahil)' : `Kurye Hizmet Bedeli (${packageType === 'food' ? 'Yemek Menüsü' : 'Standart Paket'})`}
                </span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl font-black text-emerald-400">{estimate.price + tipAmount} ₺</span>
                  {tipAmount > 0 ? (
                    <span className="text-xs text-amber-300 bg-amber-950/80 border border-amber-600/60 px-2.5 py-0.5 rounded-lg font-medium">
                      Tarife {estimate.price} ₺ + Bahşiş {tipAmount} ₺
                    </span>
                  ) : estimate.isSameDistrict ? (
                    <span className="text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-lg font-medium">
                      Aynı ilçe ({senderDistrict}) • Baz Fiyat ({estimate.basePrice} ₺)
                    </span>
                  ) : (
                    <span className="text-xs text-amber-300 bg-amber-950/70 border border-amber-600/60 px-2.5 py-0.5 rounded-lg font-medium">
                      Taban {estimate.basePrice} ₺ + Farklı ilçe farkı (+{estimate.districtDiffExtra} ₺)
                    </span>
                  )}
                </div>
              </div>

              {/* Protected Submit Button (Disabled while submitting to avoid multiple duplicate requests) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer min-w-[220px] ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed scale-98' : 'active:scale-98'
                }`}
              >
                <Bike className="w-5 h-5 shrink-0" />
                <span>{isSubmitting ? 'Talep İletiliyor...' : `Kurye Çağır (${estimate.price + tipAmount} ₺)`}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal for Request Form */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#022019] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-700/60 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-900/60 text-rose-300 border border-rose-600/50 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Siparişi İptal Et</h3>
                <p className="text-xs text-rose-200/80">#{cancelModalOrder.trackingCode} numaralı sipariş</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#011410] rounded-xl border border-emerald-800/60 text-xs text-emerald-200 space-y-1.5">
              <p><strong>Güzergah:</strong> {cancelModalOrder.sender.district} ➔ {cancelModalOrder.receiver.district}</p>
              <p><strong>Alıcı:</strong> {cancelModalOrder.receiver.contactName}</p>
              {cancelModalOrder.assignedCourier ? (
                <div className="p-2.5 bg-amber-950/60 border border-amber-600/50 rounded-lg text-amber-200 text-xs mt-2">
                  <p className="font-bold text-amber-300 flex items-center gap-1">
                    <span>⚠️ Kurye Atanmış Durumda:</span> {cancelModalOrder.assignedCourier.name}
                  </p>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    Kurye atanmış olsa bile siparişinizi iptal edebilirsiniz. Atanan kuryeye anında iptal bildirimi iletilecek ve görev iptal edilecektir.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  Sipariş kurye havuzundan kaldırılacaktır.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2.5 rounded-xl text-emerald-300 hover:bg-emerald-900/40 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelRequest(cancelModalOrder.id);
                  setCancelModalOrder(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition shadow-md"
              >
                Evet, İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
