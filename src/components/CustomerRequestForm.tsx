import React, { useState, useMemo } from 'react';
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  Clock, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Bike,
  ShieldCheck,
  Zap,
  PhoneCall
} from 'lucide-react';
import { DistrictName, PackageType, PaymentMethod, UrgencyType } from '../types';
import { ANTALYA_DISTRICTS, calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { useDelivery } from '../context/DeliveryContext';

export const CustomerRequestForm: React.FC = () => {
  const { createNewRequest, requests, setCurrentView, setSelectedTrackingId } = useDelivery();

  // Sender state
  const [senderDistrict, setSenderDistrict] = useState<DistrictName>('Muratpaşa');
  const [senderNeighborhood, setSenderNeighborhood] = useState<string>('Şirinyalı');
  const [senderAddress, setSenderAddress] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');

  // Receiver state
  const [receiverDistrict, setReceiverDistrict] = useState<DistrictName>('Konyaaltı');
  const [receiverNeighborhood, setReceiverNeighborhood] = useState<string>('Gürsu');
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverPhone, setReceiverPhone] = useState<string>('');

  // Package info
  const [packageType, setPackageType] = useState<PackageType>('document');
  const [packageName, setPackageName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [urgency, setUrgency] = useState<UrgencyType>('standard');
  const [noteForCourier, setNoteForCourier] = useState<string>('');

  // UI state
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdDeliveryCode, setCreatedDeliveryCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Real-time calculation
  const estimate = useMemo(() => {
    return calculateDeliveryEstimate(senderDistrict, receiverDistrict, packageType, urgency);
  }, [senderDistrict, receiverDistrict, packageType, urgency]);

  // Quick autofill demo for user convenience
  const handleQuickFill = () => {
    setSenderDistrict('Muratpaşa');
    setSenderNeighborhood('Şirinyalı');
    setSenderAddress('İsmet Gökşen Cad. No: 48 (Ofis Kat: 2)');
    setSenderName('Mehmet Yılmaz');
    setSenderPhone('0532 555 12 34');

    setReceiverDistrict('Konyaaltı');
    setReceiverNeighborhood('Gürsu');
    setReceiverAddress('Atatürk Bulvarı No: 120 Daire: 4');
    setReceiverName('Ayşe Demir');
    setReceiverPhone('0544 333 98 76');

    setPackageType('document');
    setPackageName('Sözleşme & Noter Evrakı');
    setPaymentMethod('cash_on_delivery');
    setNoteForCourier('Zile basıp güvenliğe bırakmayınız, bizzat teslim edilsin.');
    setFormError(null);
  };

  // Submit request to courier pool
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderAddress.trim() || !senderName.trim() || !senderPhone.trim()) {
      setFormError('Lütfen paketin alınacağı adres, isim ve telefon bilgisini giriniz.');
      return;
    }
    if (!receiverAddress.trim() || !receiverName.trim() || !receiverPhone.trim()) {
      setFormError('Lütfen teslimat yapılacak adres, isim ve telefon bilgisini giriniz.');
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
    setCreatedDeliveryCode(newReq.deliveryCode);
  };

  // Active tracking order if available
  const latestActiveOrder = createdOrderId
    ? requests.find((r) => r.id === createdOrderId)
    : requests[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Friendly Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
              📦
            </span>
            Antalya İçi Kurye Çağır
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Alış ve teslimat bilgilerini girin; talebiniz anında moto kurye havuzuna düşsün.
          </p>
        </div>

        {/* Quick autofill button */}
        <button
          type="button"
          onClick={handleQuickFill}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition cursor-pointer border border-orange-200 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-orange-600" />
          ⚡ 1 Tıkla Örnek Doldur
        </button>
      </div>

      {/* Main Form & Live Status Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Pickup Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-extrabold">
                  1
                </span>
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Nereden Alınacak? (Gönderen)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İlçe</label>
                  <select
                    value={senderDistrict}
                    onChange={(e) => {
                      const d = e.target.value as DistrictName;
                      setSenderDistrict(d);
                      setSenderNeighborhood(ANTALYA_DISTRICTS[d]?.popularNeighborhoods[0] || 'Merkez');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-orange-500 outline-hidden"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres (Cadde, Sokak, Kapı No)</label>
                <input
                  type="text"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="Örn: İsmet Gökşen Cad. No: 48 Daire: 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gönderen Adı Soyadı</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İletişim Telefonu</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="0532 XXX XX XX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Location */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-extrabold">
                  2
                </span>
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Nereye Teslim Edilecek? (Alıcı)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İlçe</label>
                  <select
                    value={receiverDistrict}
                    onChange={(e) => {
                      const d = e.target.value as DistrictName;
                      setReceiverDistrict(d);
                      setReceiverNeighborhood(ANTALYA_DISTRICTS[d]?.popularNeighborhoods[0] || 'Merkez');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres (Cadde, Sokak, Kapı No)</label>
                <input
                  type="text"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="Örn: Atatürk Bulvarı No: 120 Daire: 4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alıcı Adı Soyadı</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Alıcı Adı Soyadı"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alıcı Telefonu</label>
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Package & Payment */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-extrabold">
                  3
                </span>
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Paket & Ödeme</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paket Türü</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as PackageType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 outline-hidden"
                  >
                    <option value="document">📄 Evrak / Dosya / Noter</option>
                    <option value="small_box">📦 Kutu / Paket / Koli</option>
                    <option value="food">🍔 Yemek / Restoran Siparişi</option>
                    <option value="fragile_electronics">📱 Hassas / Elektronik Eşya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paket Açıklaması</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="Örn: Hukuk evrakı, anahtar vb."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ödeme Şekli</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    💵 Kapıda Nakit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_on_delivery')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      paymentMethod === 'card_on_delivery'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    💳 Kapıda Kart
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online_credit_card')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      paymentMethod === 'online_credit_card'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ⚡ Online Öde
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kuryeye Not (Opsiyonel)</label>
                <input
                  type="text"
                  value={noteForCourier}
                  onChange={(e) => setNoteForCourier(e.target.value)}
                  placeholder="Örn: 3. kat zili çalın, acil teslim."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-hidden"
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
                <div className="text-xs text-slate-400">
                  <span>{senderDistrict}</span> ➔ <span>{receiverDistrict}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Tahmini Mesafe / Süre</span>
                  <span className="text-xs font-bold text-slate-200">{estimate.distanceKm} km • ~{estimate.durationMins} dk</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Kurye Hizmet Bedeli</span>
                  <span className="text-2xl font-black text-orange-400">{estimate.totalPrice} ₺</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-xl transition shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Bike className="w-5 h-5" />
                  Kurye Çağır (Havuza Gönder)
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Info & Live Order Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Created Success Banner or Active Delivery Card */}
          {createdOrderCode && latestActiveOrder ? (
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Talebiniz Kurye Havuzuna Düştü!</span>
                </div>
                <span className="font-mono text-xs bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200 font-bold">
                  {latestActiveOrder.trackingCode}
                </span>
              </div>

              {/* 4-digit verification code */}
              <div className="bg-white/10 rounded-xl p-3 border border-white/15 text-center">
                <span className="text-[11px] text-emerald-300 font-semibold block uppercase tracking-wider">
                  🔑 Kuryeye Vereceğiniz Teslimat Kodu
                </span>
                <span className="text-3xl font-black tracking-widest text-amber-400 block my-1">
                  {latestActiveOrder.deliveryCode}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  Paket teslim edilirken kuryeye bu kodu söyleyiniz.
                </span>
              </div>

              {/* Status Tracker */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Mevcut Durum:</span>
                  <span className="font-bold text-amber-400">
                    {latestActiveOrder.status === 'pending_pool' && '🛵 Havuzda Kurye Bekliyor'}
                    {latestActiveOrder.status === 'courier_assigned' && '🏍️ Kurye Alış Adresine Geliyor'}
                    {latestActiveOrder.status === 'picked_up' && '📦 Paket Alındı, Teslimata Gidiyor'}
                    {latestActiveOrder.status === 'delivered' && '✅ Teslim Edildi'}
                  </span>
                </div>

                {latestActiveOrder.assignedCourier && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Kuryeniz:</span>
                      <span className="font-bold text-white">{latestActiveOrder.assignedCourier.name}</span>
                      <span className="text-[10px] text-slate-400 block">{latestActiveOrder.assignedCourier.vehicleType} • {latestActiveOrder.assignedCourier.plate}</span>
                    </div>
                    <a
                      href={`tel:${latestActiveOrder.assignedCourier.phone}`}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Ara
                    </a>
                  </div>
                )}
              </div>

              {/* Switch to Courier Pool or Tracker */}
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('courier')}
                  className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition text-center cursor-pointer"
                >
                  🛵 Kurye Paneline Geç ve Talebi Kabul Et
                </button>
              </div>
            </div>
          ) : (
            /* Information Card when no immediate order is placed */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                Antalya Kurye Express Nasıl Çalışır?
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Paket Talebi Girin:</strong>
                    Alış ve varış adreslerini girip kurye çağır butonuna basın.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Kurye Havuzuna Düşer:</strong>
                    En yakındaki uygun moto kurye anında çağrınızı kabul eder ve paketi alır.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Güvenli Teslimat:</strong>
                    Paket 4 haneli teslimat kodunuz kontrol edilerek alıcıya elden ulaştırılır.
                  </div>
                </div>
              </div>

              {/* Service guarantee */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Muratpaşa, Konyaaltı, Kepez, Lara ve Aksu bölgelerine 30-45 dk hızlı teslimat garantisi.</span>
              </div>
            </div>
          )}

          {/* Quick List of Active / Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Mevcut Siparişler ({requests.length})
              </h3>
              <button
                onClick={() => setCurrentView('history')}
                className="text-xs text-orange-600 hover:text-orange-700 font-bold"
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
                  className="p-3 bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 rounded-xl cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{req.trackingCode}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        req.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'pending_pool'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.status === 'delivered' ? 'Teslim Edildi' : req.status === 'pending_pool' ? 'Havuzda' : 'Kuryede'}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] mt-0.5 block">
                      {req.sender.district} ➔ {req.receiver.district}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-800">{req.price} ₺</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
