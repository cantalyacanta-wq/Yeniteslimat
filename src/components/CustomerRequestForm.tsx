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
  Check
} from 'lucide-react';
import { DistrictName, PackageType, PaymentMethod, UrgencyType, DeliveryRequest } from '../types';
import { ANTALYA_DISTRICTS, calculateDeliveryEstimate } from '../data/antalyaDistricts';
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
    return '';
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

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<DeliveryRequest | null>(null);

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

  // Sync sender name and phone when user switches profile (if not locked)
  useEffect(() => {
    if (!isSenderLocked) {
      if (currentUser.name && !senderName) setSenderName(currentUser.name);
      if (currentUser.phone && !senderPhone) setSenderPhone(currentUser.phone);
      if (currentUser.district) setSenderDistrict(currentUser.district);
    }
  }, [currentUser, isSenderLocked]);

  // Real-time calculation
  const estimate = useMemo(() => {
    return calculateDeliveryEstimate(senderDistrict, receiverDistrict, packageType, urgency);
  }, [senderDistrict, receiverDistrict, packageType, urgency]);

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
      });

      // Clear non-locked fields
      if (!isReceiverLocked) {
        setReceiverAddress('');
        setReceiverName('');
        setReceiverPhone('');
      }
      setPackageName('');
      setNoteForCourier('');

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

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      
      {/* Top Emerald Header Bar */}
      <div className="bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] rounded-3xl border border-emerald-800/60 p-5 sm:p-6 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-600/80 text-emerald-200 border border-emerald-500/40 flex items-center justify-center text-base font-bold shrink-0 shadow-md">
              <Package className="w-5 h-5" />
            </span>
            <span>Antalya İçi Kurye Çağır</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
            Alış ve teslimat bilgilerini girin; talebiniz anında moto kurye havuzuna düşsün.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-300 bg-[#011a14] px-3.5 py-2 rounded-2xl border border-emerald-800/50 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Antalya İçi 30-45 Dk Jet Kurye</span>
        </div>
      </div>

      {/* Main Form Layout */}
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border border-emerald-800/60 p-5 sm:p-8 shadow-2xl text-white">
        <form onSubmit={handleSubmit} className="space-y-7">
          
          {/* Step 1: Pickup Location (Gönderen) */}
          <div className="space-y-4 bg-[#011914]/80 p-4 sm:p-5 rounded-2xl border border-emerald-800/40">
            <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0 shadow-xs">
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
                  className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
                >
                  {Object.keys(ANTALYA_DISTRICTS).map((d) => (
                    <option key={d} value={d} className="bg-[#021813] text-white">{d}</option>
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
                  className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Açık Adres (Cadde, Sokak, Bina No, Daire) *</label>
              <input
                type="text"
                required
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                placeholder="Örn: İsmet Gökşen Cad. No: 48 Daire: 2"
                className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
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
                className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium font-mono"
              />
            </div>
          </div>

          {/* Step 2: Delivery Location (Alıcı) */}
          <div className="space-y-4 bg-[#011914]/80 p-4 sm:p-5 rounded-2xl border border-emerald-800/40">
            <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0 shadow-xs">
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
                  className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
                >
                  {Object.keys(ANTALYA_DISTRICTS).map((d) => (
                    <option key={d} value={d} className="bg-[#021813] text-white">{d}</option>
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
                  className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Açık Adres (Cadde, Sokak, Bina No, Daire) *</label>
              <input
                type="text"
                required
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="Örn: Atatürk Bulvarı No: 120 Daire: 4"
                className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium"
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
                className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition font-medium font-mono"
              />
            </div>
          </div>

          {/* Step 3: Package & Payment Details */}
          <div className="space-y-4 bg-[#011914]/80 p-4 sm:p-5 rounded-2xl border border-emerald-800/40">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm border-b border-emerald-800/50 pb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0 shadow-xs">
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
                  className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 outline-none"
                >
                  <option value="food" className="bg-[#021813] text-white">🍔 Yemek & Restoran Siparişi (100 ₺)</option>
                  <option value="petshop" className="bg-[#021813] text-white">🐾 Petshop Ürünleri (150 ₺)</option>
                  <option value="market" className="bg-[#021813] text-white">🛒 Market / Bakkal Siparişi (150 ₺)</option>
                  <option value="flower" className="bg-[#021813] text-white">💐 Çiçek & Hediye (150 ₺)</option>
                  <option value="other" className="bg-[#021813] text-white">📦 Diğer (Evrak, Koli, Eşya) (150 ₺)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">Paket İçerik Açıklaması</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Örn: 2 porsiyon yemek, evrak dosyası, pet mama vb."
                  className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 outline-none"
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
                      ? 'border-emerald-400 bg-emerald-900/60 text-white ring-2 ring-emerald-400/50 shadow-md'
                      : 'border-emerald-800/60 bg-[#021813] text-emerald-300 hover:bg-emerald-950/60'
                  }`}
                >
                  <span className="text-lg">📤</span>
                  <span className="font-extrabold text-sm">Gönderici Ödemeli</span>
                  <span className="text-[11px] font-normal text-emerald-300/80">Ücret çıkış noktasında ödenir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('alici_odemeli')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'alici_odemeli'
                      ? 'border-emerald-400 bg-emerald-900/60 text-white ring-2 ring-emerald-400/50 shadow-md'
                      : 'border-emerald-800/60 bg-[#021813] text-emerald-300 hover:bg-emerald-950/60'
                  }`}
                >
                  <span className="text-lg">📥</span>
                  <span className="font-extrabold text-sm">Alıcı Ödemeli</span>
                  <span className="text-[11px] font-normal text-emerald-300/80">Ücret teslim noktasında ödenir</span>
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
                className="w-full bg-[#021813] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-emerald-600/60 focus:border-emerald-400 outline-none"
              />
            </div>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-600/70 text-rose-200 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Summary & Single-Click Protected Action Bar */}
          <div className="bg-[#011410] border border-emerald-700/60 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3 flex-wrap gap-2">
              <div className="text-xs text-emerald-300">
                <span className="font-extrabold text-white text-sm">{senderDistrict}</span> ➔ <span className="font-extrabold text-white text-sm">{receiverDistrict}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-400/80 block font-medium">Tahmini Mesafe & Süre</span>
                <span className="text-xs font-bold text-emerald-200">{estimate.distanceKm} km • ~{estimate.durationMins} dk</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-xs text-emerald-300/80 block font-medium">
                  Kurye Hizmet Bedeli ({packageType === 'food' ? 'Yemek Menüsü' : 'Standart Paket'})
                </span>
                <span className="text-3xl font-black text-amber-400">{estimate.price} ₺</span>
              </div>

              {/* Protected Submit Button (Disabled while submitting to avoid multiple duplicate requests) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer min-w-[220px] ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed scale-98' : 'active:scale-98'
                }`}
              >
                <Bike className="w-5 h-5 shrink-0" />
                <span>{isSubmitting ? 'Talep İletiliyor...' : `Kurye Çağır (${estimate.price} ₺)`}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
