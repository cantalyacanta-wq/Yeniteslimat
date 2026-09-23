import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Bike,
  MapPin,
  Navigation,
  User,
  Phone,
  Package,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Edit3,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  DollarSign,
  Building,
  RotateCcw,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, PackageType, PaymentMethod } from '../types';
import { ANTALYA_DISTRICTS, calculateDeliveryEstimate } from '../data/antalyaDistricts';

export const QuickCourierModal: React.FC = () => {
  const {
    isQuickCourierOpen,
    closeQuickCourierModal,
    currentUser,
    createNewRequest,
    updateCurrentUserProfile,
    setCurrentView,
    requests,
    openAuthModal,
  } = useDelivery();

  const isUserLoggedIn = currentUser && currentUser.id !== 'user-guest-01' && currentUser.role === 'customer';

  // Find last order address as fallback if profile address is empty
  const lastCustomerOrder = useMemo(() => {
    return requests.find(
      (r) =>
        r.senderUserId === currentUser.id ||
        (currentUser.phone && r.sender?.contactPhone === currentUser.phone)
    );
  }, [requests, currentUser.id, currentUser.phone]);

  const defaultAddressFromProfile = currentUser.address || lastCustomerOrder?.sender?.addressDetail || '';

  // Pickup Address state (Defaults to registered address)
  const [pickupDistrict, setPickupDistrict] = useState<DistrictName>('Muratpaşa');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [isEditingPickupAddress, setIsEditingPickupAddress] = useState<boolean>(false);
  const [savePickupAddressToProfile, setSavePickupAddressToProfile] = useState<boolean>(true);

  // Destination Address state (User specifies where package will go)
  const [destDistrict, setDestDistrict] = useState<DistrictName>('Konyaaltı');
  const [destAddress, setDestAddress] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverPhone, setReceiverPhone] = useState<string>('');

  // Package details
  const [packageType, setPackageType] = useState<PackageType>('small_box');
  const [packageNote, setPackageNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gonderici_odemeli');

  // Form error & loading
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state whenever modal opens or user profile changes
  useEffect(() => {
    if (isQuickCourierOpen) {
      setFormError(null);
      setIsSubmitting(false);

      const regDistrict = (currentUser.district && currentUser.district in ANTALYA_DISTRICTS)
        ? currentUser.district
        : 'Muratpaşa';
      setPickupDistrict(regDistrict);

      const savedAddr = currentUser.address || lastCustomerOrder?.sender?.addressDetail || '';
      setPickupAddress(savedAddr);

      // If user already has an address, do not force edit mode; if empty, show edit mode
      setIsEditingPickupAddress(!savedAddr);

      // Default destination to a complementary district
      if (regDistrict === 'Konyaaltı') {
        setDestDistrict('Muratpaşa');
      } else {
        setDestDistrict('Konyaaltı');
      }

      setDestAddress('');
      setReceiverName('');
      setReceiverPhone('');
      setPackageType('small_box');
      setPackageNote('');
      setPaymentMethod('gonderici_odemeli');
    }
  }, [isQuickCourierOpen, currentUser, lastCustomerOrder]);

  // Live price & time calculation
  const estimate = useMemo(() => {
    return calculateDeliveryEstimate(pickupDistrict, destDistrict, packageType, 'express_vip');
  }, [pickupDistrict, destDistrict, packageType]);

  if (!isQuickCourierOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate Pickup Address
    const cleanPickupAddr = pickupAddress.trim();
    if (!cleanPickupAddr) {
      setFormError('Lütfen kuryenin paketi alacağı adresinizi yazınız.');
      setIsEditingPickupAddress(true);
      return;
    }

    // Validate Destination Address
    const cleanDestAddr = destAddress.trim();
    if (!cleanDestAddr || cleanDestAddr.length < 5) {
      setFormError('Lütfen paketin nereye teslim edileceğini (Cadde, bina no, firma vs.) yazınız.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If user edited address and chose to save to profile, update profile
      if (savePickupAddressToProfile && cleanPickupAddr !== currentUser.address) {
        updateCurrentUserProfile({
          district: pickupDistrict,
          address: cleanPickupAddr,
        });
      }

      // 2. Build and create delivery request
      const pkgLabel =
        packageType === 'document'
          ? 'Acil Evrak / Dosya'
          : packageType === 'food'
          ? 'Sıcak Yemek / Sipariş'
          : packageType === 'flower'
          ? 'Çiçek / Hediye'
          : 'Acil Kurye Paketi';

      const newRequest = createNewRequest({
        senderUserId: currentUser.id,
        sender: {
          district: pickupDistrict,
          neighborhood: '',
          addressDetail: cleanPickupAddr,
          contactName: currentUser.name || 'Müşteri',
          contactPhone: currentUser.phone || '0500 000 00 00',
          contactEmail: currentUser.email,
          lat: ANTALYA_DISTRICTS[pickupDistrict]?.centerCoordinates.lat || 36.886,
          lng: ANTALYA_DISTRICTS[pickupDistrict]?.centerCoordinates.lng || 30.7065,
        },
        receiver: {
          district: destDistrict,
          neighborhood: '',
          addressDetail: cleanDestAddr,
          contactName: receiverName.trim() || 'Alıcı / Yetkili',
          contactPhone: receiverPhone.trim() || currentUser.phone || '0500 000 00 00',
          contactEmail: '',
          lat: ANTALYA_DISTRICTS[destDistrict]?.centerCoordinates.lat || 36.8732,
          lng: ANTALYA_DISTRICTS[destDistrict]?.centerCoordinates.lng || 30.6384,
        },
        packageType,
        packageName: pkgLabel,
        packageWeightKg: 1,
        urgency: 'express_vip',
        paymentMethod,
        isPaid: false,
        noteForCourier: packageNote.trim()
          ? `[Acil Hızlı Çağrı] ${packageNote.trim()}`
          : '[Acil Hızlı Çağrı] 30-45 dk ekspres teslimat',
      });

      // 3. Close modal & navigate to home radar
      closeQuickCourierModal();
      setCurrentView('home');
    } catch (err: any) {
      console.error('Failed to submit quick courier request:', err);
      setFormError('Sipariş oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#02231c] via-[#021f19] to-[#011410] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-emerald-600/60 space-y-5 text-white my-6 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={closeQuickCourierModal}
          className="absolute top-4 right-4 p-2 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-900/60 transition cursor-pointer"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-emerald-800/60 pb-4 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/40 shrink-0">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Acil Kurye Çağır</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-md font-bold uppercase tracking-wider">
                Ekspres
              </span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Form doldurmadan kayıtlı adresinize 30-45 dakikada anında moto kurye çağırın.
            </p>
          </div>
        </div>

        {/* If user is not logged in as customer */}
        {!isUserLoggedIn ? (
          <div className="p-6 bg-[#011a14] rounded-2xl border border-emerald-700/60 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-white">Müşteri Girişi Gerekli</h3>
              <p className="text-xs text-emerald-300/80 leading-relaxed max-w-sm mx-auto">
                Kayıtlı adresinize tek tıkla kurye çağırabilmek için lütfen müşteri hesabınıza giriş yapınız.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  closeQuickCourierModal();
                  openAuthModal('login', 'Acil kurye çağırmak için lütfen müşteri girişi yapın.');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  closeQuickCourierModal();
                  openAuthModal('register', 'Hemen 1 dakikada ücretsiz müşteri hesabı oluşturun.');
                }}
                className="px-5 py-2.5 bg-teal-900/80 hover:bg-teal-800 text-teal-200 text-xs font-bold rounded-xl transition cursor-pointer border border-teal-700/60"
              >
                Yeni Hesap Oluştur
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Banner */}
            {formError && (
              <div className="p-3.5 bg-rose-950/90 border border-rose-600/70 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 shadow-md animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            {/* 1. ALIŞ NOKTASI (Kuryenin Geleceği Adres) */}
            <div className="bg-[#011a14] rounded-2xl border border-emerald-800/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-300">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>1. Alış Noktası (Kuryenin Geleceği Adres)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPickupAddress(!isEditingPickupAddress)}
                  className="text-[11px] text-teal-400 hover:text-teal-200 underline font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingPickupAddress ? 'Vazgeç' : 'Adresi Değiştir'}</span>
                </button>
              </div>

              {/* View Mode: Shows verified registered address */}
              {!isEditingPickupAddress && (
                <div className="p-3 bg-[#022820] rounded-xl border border-emerald-700/50 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{pickupDistrict}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-md font-bold">
                      ✓ Kayıtlı Alış Adresiniz
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 break-words leading-relaxed font-medium">
                    {pickupAddress || 'Açık adres kaydı bulunamadı. Lütfen "Adresi Değiştir"e tıklayıp açık adresinizi yazınız.'}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono pt-0.5">
                    {currentUser.name} • {currentUser.phone}
                  </p>
                </div>
              )}

              {/* Edit Mode: Allows changing pickup district & address */}
              {isEditingPickupAddress && (
                <div className="space-y-3 p-3 bg-[#022820] rounded-xl border border-emerald-600/70 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                      Kuryenin Geleceği İlçe
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((dist) => (
                        <button
                          key={dist}
                          type="button"
                          onClick={() => setPickupDistrict(dist)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            pickupDistrict === dist
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                              : 'bg-[#011913] text-emerald-300/80 border-emerald-800/60 hover:bg-[#022b22]'
                          }`}
                        >
                          {dist === 'Lara (Muratpaşa)' ? 'Lara' : dist}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                      Açık Alış Adresi (Cadde, Sokak, Bina No, Kapı) *
                    </label>
                    <textarea
                      rows={2}
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Örn: Fener Mah. Tekelioğlu Cad. No:14 Daire:6 (Asansörlü)"
                      className="w-full bg-[#011410] border border-emerald-700/60 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700 focus:outline-none transition resize-none font-medium"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-emerald-300 select-none">
                    <input
                      type="checkbox"
                      checked={savePickupAddressToProfile}
                      onChange={(e) => setSavePickupAddressToProfile(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-emerald-700 text-emerald-500 focus:ring-0 bg-[#011410]"
                    />
                    <span>Bu adresi profilimde varsayılan alış adresim olarak güncelle</span>
                  </label>
                </div>
              )}
            </div>

            {/* 2. TESLİMAT NOKTASI (Paket Nereye Gidecek? - Kuryenin Göreceği Varış Yeri) */}
            <div className="bg-[#011a14] rounded-2xl border border-teal-800/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-teal-300">
                  <Navigation className="w-4 h-4 text-teal-400" />
                  <span>2. Teslimat Noktası (Paket Nereye Gidecek?) *</span>
                </div>
                <span className="text-[10px] text-teal-400/80 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-700/50">
                  Kuryeye İletilir
                </span>
              </div>

              {/* Destination District Selection */}
              <div>
                <label className="block text-[11px] font-bold text-teal-300 mb-1">
                  Varış İlçesi (Hangi İlçeye Gidecek?)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setDestDistrict(dist)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        destDistrict === dist
                          ? 'bg-teal-600 text-white border-teal-400 shadow-sm'
                          : 'bg-[#011913] text-teal-300/80 border-teal-800/60 hover:bg-[#022b22]'
                      }`}
                    >
                      {dist === 'Lara (Muratpaşa)' ? 'Lara' : dist}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Detailed Address Input */}
              <div>
                <label className="block text-[11px] font-bold text-teal-300 mb-1">
                  Teslimat Açık Adresi (Bina, No, Daire, Firma vb.) *
                </label>
                <textarea
                  rows={2}
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  placeholder="Örn: Arapsuyu Mah. Akdeniz Bulvarı No:45 Kat:2 Konyaaltı"
                  required
                  autoFocus
                  className="w-full bg-[#011410] border border-teal-700/60 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-white placeholder-teal-700 focus:outline-none transition resize-none font-medium"
                />
              </div>

              {/* Receiver Contact Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-teal-300 mb-1">
                    Alıcı Adı Soyadı
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Örn: Mehmet Bey / Şirket"
                    className="w-full bg-[#011410] border border-teal-700/60 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-white placeholder-teal-700 focus:outline-none transition font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-teal-300 mb-1">
                    Alıcı Telefonu
                  </label>
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full bg-[#011410] border border-teal-700/60 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-white placeholder-teal-700 focus:outline-none transition font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 3. PAKET TİPİ VE ÖDEME SEÇİMİ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#011a14] rounded-2xl border border-emerald-800/60 p-3.5 text-xs">
              {/* Package Type Chips */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 mb-1.5">
                  Paket Tipi
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'small_box', label: '📦 Paket / Kutu' },
                    { id: 'document', label: '📄 Acil Evrak' },
                    { id: 'food', label: '🍔 Yemek (100 ₺)' },
                    { id: 'other', label: '🎁 Diğer' },
                  ].map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setPackageType(pkg.id as PackageType)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer border text-center ${
                        packageType === pkg.id
                          ? 'bg-emerald-700 text-white border-emerald-400'
                          : 'bg-[#011913] text-emerald-300/80 border-emerald-800/60 hover:bg-[#022b22]'
                      }`}
                    >
                      {pkg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Chips */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 mb-1.5">
                  Ödeme Yöntemi
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'gonderici_odemeli', label: 'Gönderici Öder (Ben)' },
                    { id: 'alici_odemeli', label: 'Alıcı Öder (Varışta)' },
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentMethod(pay.id as PaymentMethod)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer border text-center ${
                        paymentMethod === pay.id
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-[#011913] text-amber-300/80 border-emerald-800/60 hover:bg-[#022b22]'
                      }`}
                    >
                      {pay.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note for Courier (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                Kuryeye Özel Not (Opsiyonel)
              </label>
              <input
                type="text"
                value={packageNote}
                onChange={(e) => setPackageNote(e.target.value)}
                placeholder="Örn: Zile basmayınız, lütfen acele ediniz."
                className="w-full bg-[#011410] border border-emerald-800/60 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700 focus:outline-none transition font-medium"
              />
            </div>

            {/* Price & ETA Summary Bar */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#032d23] to-teal-950 rounded-2xl border border-emerald-600/70 flex items-center justify-between gap-3 shadow-md">
              <div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tahmini Varış: <strong>{estimate.durationMins} Dakika</strong></span>
                  <span className="text-emerald-600">•</span>
                  <span>{estimate.distanceKm} km</span>
                </div>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  {pickupDistrict} ➔ {destDistrict}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Toplam Tutar</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  {estimate.price} ₺
                </span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base rounded-2xl transition shadow-xl shadow-emerald-700/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-emerald-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>{isSubmitting ? 'Kurye Aranıyor...' : `Kuryeyi Çağır (${estimate.price} ₺)`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
