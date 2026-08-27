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
  Navigation
} from 'lucide-react';
import { DistrictName, PackageType, PaymentMethod, UrgencyType, DeliveryRequest } from '../types';
import { ANTALYA_DISTRICTS, calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { useDelivery } from '../context/DeliveryContext';

export const CustomerRequestForm: React.FC = () => {
  const { createNewRequest, requests, setCurrentView, setSelectedTrackingId, currentUser, cancelRequest } = useDelivery();

  // Sender state initialized with currentUser data
  const [senderDistrict, setSenderDistrict] = useState<DistrictName>(currentUser.district || 'Muratpaşa');
  const [senderNeighborhood, setSenderNeighborhood] = useState<string>('Şirinyalı');
  const [senderAddress, setSenderAddress] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(currentUser.name || '');
  const [senderPhone, setSenderPhone] = useState<string>(currentUser.phone || '');

  // Receiver state
  const [receiverDistrict, setReceiverDistrict] = useState<DistrictName>('Konyaaltı');
  const [receiverNeighborhood, setReceiverNeighborhood] = useState<string>('Gürsu');
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverPhone, setReceiverPhone] = useState<string>('');

  // Package info
  const [packageType, setPackageType] = useState<PackageType>('food');
  const [packageName, setPackageName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gonderici_odemeli');
  const [urgency, setUrgency] = useState<UrgencyType>('standard');
  const [noteForCourier, setNoteForCourier] = useState<string>('');

  // UI state
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<DeliveryRequest | null>(null);

  // Sync sender name and phone when user switches profile
  useEffect(() => {
    if (currentUser.name && !senderName) setSenderName(currentUser.name);
    if (currentUser.phone && !senderPhone) setSenderPhone(currentUser.phone);
    if (currentUser.district) setSenderDistrict(currentUser.district);
  }, [currentUser]);

  // Real-time calculation
  const estimate = useMemo(() => {
    return calculateDeliveryEstimate(senderDistrict, receiverDistrict, packageType, urgency);
  }, [senderDistrict, receiverDistrict, packageType, urgency]);

  // Submit request to courier pool
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderAddress.trim() || !senderName.trim() || !senderPhone.trim()) {
      setFormError('Lütfen paketin alınacağı açık adres, isim ve telefon bilgisini giriniz.');
      return;
    }
    if (!receiverAddress.trim() || !receiverName.trim() || !receiverPhone.trim()) {
      setFormError('Lütfen teslimat yapılacak açık adres, isim ve telefon bilgisini giriniz.');
      return;
    }

    setFormError(null);

    const newReq = createNewRequest({
      sender: {
        district: senderDistrict,
        neighborhood: senderNeighborhood || 'Merkez',
        addressDetail: senderAddress,
        contactName: senderName,
        contactPhone: senderPhone,
        lat: ANTALYA_DISTRICTS[senderDistrict]?.centerCoordinates.lat || 36.8841,
        lng: ANTALYA_DISTRICTS[senderDistrict]?.centerCoordinates.lng || 30.7056,
      },
      receiver: {
        district: receiverDistrict,
        neighborhood: receiverNeighborhood || 'Merkez',
        addressDetail: receiverAddress,
        contactName: receiverName,
        contactPhone: receiverPhone,
        lat: ANTALYA_DISTRICTS[receiverDistrict]?.centerCoordinates.lat || 36.8625,
        lng: ANTALYA_DISTRICTS[receiverDistrict]?.centerCoordinates.lng || 30.6375,
      },
      packageType,
      packageName: packageName.trim() || 'Paket / Gönderi',
      packageWeightKg: 1,
      noteForCourier,
      urgency,
      paymentMethod,
      isPaid: paymentMethod === 'online_credit_card',
    });

    setCreatedOrderCode(newReq.trackingCode);
    setCreatedOrderId(newReq.id);
  };

  // Active tracking order for current user or just created
  const latestActiveOrder = (createdOrderId
    ? requests.find((r) => r.id === createdOrderId)
    : requests.find((r) => (r.senderUserId === currentUser.id || r.sender.contactPhone === currentUser.phone) && r.status !== 'delivered' && r.status !== 'cancelled')) || (requests.length > 0 && requests[0].status !== 'delivered' && requests[0].status !== 'cancelled' ? requests[0] : null);

  const handleConfirmCancel = () => {
    if (confirmCancelModal) {
      cancelRequest(confirmCancelModal.id);
      setConfirmCancelModal(null);
      if (createdOrderId === confirmCancelModal.id) {
        setCreatedOrderId(null);
        setCreatedOrderCode(null);
      }
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      
      {/* Top Friendly Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold shrink-0">
              📦
            </span>
            <span>Antalya İçi Kurye Çağır</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Alış ve teslimat bilgilerini girin; talebiniz anında moto kurye havuzuna düşsün.
          </p>
        </div>
      </div>

      {/* Main Form & Live Status Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Pickup Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                  1
                </span>
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate">Nereden Alınacak? (Gönderen)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İlçe *</label>
                  <select
                    value={senderDistrict}
                    onChange={(e) => {
                      const d = e.target.value as DistrictName;
                      setSenderDistrict(d);
                      setSenderNeighborhood(ANTALYA_DISTRICTS[d]?.popularNeighborhoods[0] || 'Merkez');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
                  >
                    {Object.keys(ANTALYA_DISTRICTS).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mahalle / Semt</label>
                  <input
                    type="text"
                    value={senderNeighborhood}
                    onChange={(e) => setSenderNeighborhood(e.target.value)}
                    placeholder="Örn: Şirinyalı"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres (Cadde, Sokak, Kapı No) *</label>
                <input
                  type="text"
                  required
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="Örn: İsmet Gökşen Cad. No: 48 Daire: 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gönderen Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İletişim Telefonu *</label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="0532 XXX XX XX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Location */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                  2
                </span>
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">Nereye Teslim Edilecek? (Alıcı)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İlçe *</label>
                  <select
                    value={receiverDistrict}
                    onChange={(e) => {
                      const d = e.target.value as DistrictName;
                      setReceiverDistrict(d);
                      setReceiverNeighborhood(ANTALYA_DISTRICTS[d]?.popularNeighborhoods[0] || 'Merkez');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    {Object.keys(ANTALYA_DISTRICTS).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mahalle / Semt</label>
                  <input
                    type="text"
                    value={receiverNeighborhood}
                    onChange={(e) => setReceiverNeighborhood(e.target.value)}
                    placeholder="Örn: Gürsu Mah."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres (Cadde, Sokak, Kapı No) *</label>
                <input
                  type="text"
                  required
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="Örn: Atatürk Bulvarı No: 120 Daire: 4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alıcı Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Alıcı Adı Soyadı"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alıcı Telefonu *</label>
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Package & Payment */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                  3
                </span>
                <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Paket Detayı & Ödeme</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paket Türü</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as PackageType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  >
                    <option value="food">🍔 Yemek & Restoran Siparişi (100 ₺)</option>
                    <option value="petshop">🐾 Petshop Ürünleri (150 ₺)</option>
                    <option value="market">🛒 Market / Bakkal Siparişi (150 ₺)</option>
                    <option value="flower">💐 Çiçek & Hediye (150 ₺)</option>
                    <option value="other">📦 Diğer (Evrak, Koli, Eşya) (150 ₺)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paket İçerik Açıklaması</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="Örn: 2 porsiyon kebap, kedi maması, evrak vb."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods: Only Gönderici Ödemeli and Alıcı Ödemeli */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ödeme Yöntemi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gonderici_odemeli')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'gonderici_odemeli'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">📤</span>
                    <span className="font-bold">Gönderici Ödemeli</span>
                    <span className="text-[10px] font-normal text-slate-500">Ücret çıkış noktasında ödenir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('alici_odemeli')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'alici_odemeli'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">📥</span>
                    <span className="font-bold">Alıcı Ödemeli</span>
                    <span className="text-[10px] font-normal text-slate-500">Ücret teslim noktasında ödenir</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kuryeye Not (Opsiyonel)</label>
                <input
                  type="text"
                  value={noteForCourier}
                  onChange={(e) => setNoteForCourier(e.target.value)}
                  placeholder="Örn: Zile basıp güvenliğe bırakabilirsiniz."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Error message */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Summary & Big Submit Button */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs text-slate-400 min-w-0 pr-2">
                  <span className="font-bold text-white">{senderDistrict}</span> ➔ <span className="font-bold text-white">{receiverDistrict}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Tahmini Mesafe / Süre</span>
                  <span className="text-xs font-bold text-slate-200">{estimate.distanceKm} km • ~{estimate.durationMins} dk</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Kurye Hizmet Bedeli ({packageType === 'food' ? 'Yemek Menüsü' : 'Standart Paket'})</span>
                  <span className="text-2xl font-black text-amber-400">{estimate.price} ₺</span>
                </div>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-3 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white font-extrabold text-sm sm:text-base rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer min-w-[200px]"
                >
                  <Bike className="w-5 h-5 shrink-0" />
                  <span>Kurye Çağır ({estimate.price} ₺)</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Info & Live Order Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Live Delivery Card (with high-craft animation & courier assignment) */}
          {latestActiveOrder && latestActiveOrder.status !== 'cancelled' ? (
            <div className={`rounded-3xl p-5 sm:p-6 shadow-xl border space-y-5 transition-all ${
              latestActiveOrder.status === 'courier_assigned' || latestActiveOrder.status === 'picked_up'
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 border-teal-500/50 text-white shadow-teal-500/10'
                : latestActiveOrder.status === 'delivered'
                ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 border-emerald-500/40 text-white'
                : 'bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border-sky-500/40 text-white'
            }`}>
              
              {/* Header with Pulsating Live Radar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    <span className={`w-3.5 h-3.5 rounded-full ${
                      latestActiveOrder.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-400 animate-ping'
                    }`}></span>
                    <span className={`w-2 h-2 rounded-full absolute ${
                      latestActiveOrder.status === 'delivered' ? 'bg-emerald-400' : 'bg-amber-500'
                    }`}></span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Canlı Sipariş Takibi</span>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      {latestActiveOrder.status === 'pending_pool' && '🛵 Kurye Bekleniyor'}
                      {latestActiveOrder.status === 'courier_assigned' && '🎉 Kurye Kabul Etti & Yolda!'}
                      {latestActiveOrder.status === 'picked_up' && '📦 Paket Alındı, Teslimata Gidiyor'}
                      {latestActiveOrder.status === 'delivered' && '✅ Teslim Edildi'}
                    </h4>
                  </div>
                </div>

                <span className="font-mono text-xs font-black bg-white/15 text-white px-2.5 py-1 rounded-lg border border-white/20">
                  {latestActiveOrder.trackingCode}
                </span>
              </div>

              {/* Courier Accepted Hero Section (when courier assigned) */}
              {latestActiveOrder.assignedCourier ? (
                <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                        <Bike className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">{latestActiveOrder.assignedCourier.name}</span>
                          <span className="text-[10px] font-bold bg-teal-400/20 text-teal-300 px-1.5 py-0.2 rounded">Kuryeniz</span>
                        </div>
                        <p className="text-xs text-teal-200/80">
                          {latestActiveOrder.assignedCourier.vehicleType} • <span className="font-mono font-bold text-white">{latestActiveOrder.assignedCourier.plate}</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tel:${latestActiveOrder.assignedCourier.phone}`}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 shrink-0"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Kuryeyi Ara</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-teal-200/90 leading-snug bg-black/20 p-2 rounded-xl border border-teal-500/20">
                    🛵 <strong>Kurye Bildirimi:</strong> Kuryeniz siparişi kabul etti ve alış adresine doğru hareket halinde.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="leading-snug">
                    <strong className="text-white block">Kurye Havuzunda Dağıtılıyor</strong>
                    Antalya kurye havuzundaki en yakın sürücüler çağrılıyor.
                  </div>
                </div>
              )}

              {/* Visual Step Tracker with Glowing Transition */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold">
                  <span className={latestActiveOrder.status === 'pending_pool' ? 'text-amber-400 font-bold' : 'text-slate-400'}>Havuzda</span>
                  <span className={latestActiveOrder.status === 'courier_assigned' ? 'text-teal-300 font-bold' : 'text-slate-400'}>Kuryede</span>
                  <span className={latestActiveOrder.status === 'picked_up' ? 'text-sky-300 font-bold' : 'text-slate-400'}>Yolda</span>
                  <span className={latestActiveOrder.status === 'delivered' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>Teslim</span>
                </div>
                <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width:
                        latestActiveOrder.status === 'pending_pool'
                          ? '25%'
                          : latestActiveOrder.status === 'courier_assigned'
                          ? '50%'
                          : latestActiveOrder.status === 'picked_up'
                          ? '75%'
                          : '100%',
                    }}
                  ></div>
                </div>
              </div>

              {/* Order quick overview */}
              <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Gönderi Türü:</span>
                  <span className="font-bold text-white capitalize">{latestActiveOrder.packageName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Güzergah:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                    {latestActiveOrder.sender.district} ➔ {latestActiveOrder.receiver.district}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Ödeme Şekli:</span>
                  <span className="font-bold text-amber-300">
                    {latestActiveOrder.paymentMethod === 'alici_odemeli' ? '📥 Alıcı Ödemeli' : '📤 Gönderici Ödemeli'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/10">
                  <span>Tutar:</span>
                  <span className="font-black text-amber-400 text-sm">{latestActiveOrder.price} ₺</span>
                </div>
              </div>

              {/* Action Buttons: Track & Cancel */}
              <div className="flex items-center gap-2 pt-1">
                {latestActiveOrder.status !== 'delivered' && (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelModal(latestActiveOrder)}
                    className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Siparişi İptal Et"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>İptal Et</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrackingId(latestActiveOrder.id);
                    setCurrentView('tracker');
                  }}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white text-xs font-bold rounded-xl transition text-center cursor-pointer shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Canlı Harita Takibine Git</span>
                </button>
              </div>
            </div>
          ) : (
            /* Information Card when no immediate order is placed */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600" />
                <span>Antalya Kurye Express Nasıl Çalışır?</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Paket Talebi Girin:</strong>
                    Alış ve varış adreslerini girip kurye çağır butonuna basın.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Kurye Havuzuna Düşer:</strong>
                    Talebiniz gizlilik korumalı olarak moto kurye havuzunda listelenir.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Hızlı ve Güvenilir Teslimat:</strong>
                    Paket kurye tarafından adresten teslim alınıp varış noktasına ulaştırılır.
                  </div>
                </div>
              </div>

              {/* Service guarantee */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Muratpaşa, Konyaaltı, Kepez, Lara ve Aksu bölgelerine 30-45 dk hızlı teslimat.</span>
              </div>
            </div>
          )}

          {/* Quick List of Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Kayıtlı Siparişler ({requests.length})
              </h3>
              <button
                type="button"
                onClick={() => setCurrentView('history')}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold cursor-pointer"
              >
                Tümünü Gör ➔
              </button>
            </div>

            <div className="space-y-2">
              {requests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedTrackingId(req.id);
                    setCreatedOrderId(req.id);
                    setCreatedOrderCode(req.trackingCode);
                  }}
                  className="p-3 bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 rounded-xl cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{req.trackingCode}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        req.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : req.status === 'pending_pool'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {req.status === 'delivered' ? 'Teslim Edildi' : req.status === 'cancelled' ? 'İptal' : req.status === 'pending_pool' ? 'Havuzda' : 'Kuryede'}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] mt-0.5 block truncate">
                      {req.sender.district} ➔ {req.receiver.district}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0">{req.price} ₺</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Customer Cancellation */}
      {confirmCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Siparişi İptal Et</h3>
                <p className="text-xs text-slate-500">{confirmCancelModal.trackingCode} numaralı talebiniz</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bu siparişi iptal etmek istediğinizden emin misiniz? Sipariş sistemden ve kurye havuzundan kaldırılacaktır.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelModal(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm"
              >
                Evet, Siparişi İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
