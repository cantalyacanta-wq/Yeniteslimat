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
  Heart,
  Coins,
  Loader2,
  Map as MapIcon,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, PackageType, PaymentMethod } from '../types';
import { ANTALYA_DISTRICTS, calculateDeliveryEstimate } from '../data/antalyaDistricts';
import { measureRealDistance } from '../utils/distanceService';
import { MapLocationPickerModal, LocationSelectedResult } from './MapLocationPickerModal';

export const QUICK_PACKAGE_OPTIONS: {
  id: PackageType;
  title: string;
  desc: string;
  icon: string;
  basePrice: number;
}[] = [
  { id: 'food', title: 'Yemek & Restoran', desc: 'Restoran & Paket Sipariş', icon: '🍔', basePrice: 100 },
  { id: 'petshop', title: 'Petshop Ürünleri', desc: 'Evcil Hayvan / Kedi-Köpek Maması', icon: '🐾', basePrice: 150 },
  { id: 'market', title: 'Market & Bakkal', desc: 'Market Alışverişi & İhtiyaçlar', icon: '🛒', basePrice: 150 },
  { id: 'flower', title: 'Çiçek & Hediye', desc: 'Buket, Çiçek & Sürpriz Hediye', icon: '💐', basePrice: 150 },
  { id: 'other', title: 'Diğer (Evrak / Koli)', desc: 'Evrak, Dosya, Koli, Eşya', icon: '📦', basePrice: 150 },
];

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
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Destination Address state (User specifies where package will go)
  const [destDistrict, setDestDistrict] = useState<DistrictName>('Konyaaltı');
  const [destAddress, setDestAddress] = useState<string>('');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Receiver info state - optional & can be notified later
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverPhone, setReceiverPhone] = useState<string>('');
  const [notifyReceiverLater, setNotifyReceiverLater] = useState<boolean>(false);

  // Map Picker Modal state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);
  const [mapPickerType, setMapPickerType] = useState<'sender' | 'receiver'>('receiver');

  // Real Driving Distance measurement state
  const [measuredDistanceKm, setMeasuredDistanceKm] = useState<number | null>(null);
  const [measuredDurationMins, setMeasuredDurationMins] = useState<number | null>(null);
  const [isMeasuringDistance, setIsMeasuringDistance] = useState<boolean>(false);

  // Package details - all package types supported
  const [packageType, setPackageType] = useState<PackageType>('food');
  const [packageName, setPackageName] = useState<string>('');
  const [packageNote, setPackageNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gonderici_odemeli');

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
      setDestCoords(undefined);
      setPickupCoords(undefined);
      setReceiverName('');
      setReceiverPhone('');
      setNotifyReceiverLater(false);
      setPackageType('food');
      setPackageName('');
      setPackageNote('');
      setPaymentMethod('gonderici_odemeli');
      setSelectedTip(0);
      setIsCustomTip(false);
      setCustomTipInput('');
      setMeasuredDistanceKm(null);
      setMeasuredDurationMins(null);
      setIsMeasuringDistance(false);
    }
  }, [isQuickCourierOpen, currentUser, lastCustomerOrder]);

  // Real road distance live measurement (debounced on typing address or changing district/map)
  useEffect(() => {
    if (!isQuickCourierOpen) return;

    const cleanDest = destAddress.trim();
    const cleanPickup = pickupAddress.trim();

    if (!cleanDest && !destCoords) {
      setMeasuredDistanceKm(null);
      setMeasuredDurationMins(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsMeasuringDistance(true);
      try {
        const result = await measureRealDistance({
          pickupAddress: cleanPickup,
          pickupDistrict,
          destAddress: cleanDest,
          destDistrict,
          pickupCoords,
          destCoords,
        });

        if (result && typeof result.distanceKm === 'number' && result.distanceKm > 0) {
          setMeasuredDistanceKm(result.distanceKm);
          setMeasuredDurationMins(result.durationMins);
        }
      } catch (err) {
        console.warn('Real road distance calculation fallback:', err);
      } finally {
        setIsMeasuringDistance(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [
    isQuickCourierOpen,
    destAddress,
    destDistrict,
    destCoords,
    pickupAddress,
    pickupDistrict,
    pickupCoords,
  ]);

  // Live price & time calculation
  const estimate = useMemo(() => {
    return calculateDeliveryEstimate(pickupDistrict, destDistrict, packageType, 'express_vip');
  }, [pickupDistrict, destDistrict, packageType]);

  // Real measured distance taking priority over rough matrix
  const activeDistanceKm = measuredDistanceKm !== null ? measuredDistanceKm : estimate.distanceKm;
  const activeDurationMins = measuredDurationMins !== null ? measuredDurationMins : estimate.durationMins;

  const grandTotal = estimate.price + tipAmount;

  if (!isQuickCourierOpen) return null;

  const handleLocationConfirmed = (res: LocationSelectedResult) => {
    if (mapPickerType === 'sender') {
      setPickupDistrict(res.district);
      setPickupAddress(res.address);
      setPickupCoords({ lat: res.lat, lng: res.lng });
      setIsEditingPickupAddress(true);
    } else {
      setDestDistrict(res.district);
      setDestAddress(res.address);
      setDestCoords({ lat: res.lat, lng: res.lng });
    }
    setIsMapPickerOpen(false);
  };

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
    if (!cleanDestAddr || cleanDestAddr.length < 3) {
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
      const selectedOption = QUICK_PACKAGE_OPTIONS.find((p) => p.id === packageType);
      const defaultLabel = selectedOption ? `${selectedOption.icon} ${selectedOption.title}` : 'Acil Kurye Paketi';
      const finalPkgName = packageName.trim() || defaultLabel;

      // Receiver details: optional and not required
      const finalReceiverName = notifyReceiverLater
        ? 'Kuryeye Daha Sonra Bildirilecek'
        : (receiverName.trim() || 'Kuryeye Bildirilecek');

      const finalReceiverPhone = notifyReceiverLater
        ? (currentUser.phone || 'Daha Sonra Bildirilecek')
        : (receiverPhone.trim() || currentUser.phone || '0500 000 00 00');

      let courierNotes = packageNote.trim()
        ? `[Acil Hızlı Çağrı] ${packageNote.trim()}`
        : '[Acil Hızlı Çağrı] 30-45 dk ekspres teslimat';

      if (notifyReceiverLater) {
        courierNotes += ' (Not: Alıcı iletişim bilgileri kuryeye daha sonra iletilecektir)';
      }

      const newRequest = createNewRequest({
        senderUserId: currentUser.id,
        sender: {
          district: pickupDistrict,
          neighborhood: '',
          addressDetail: cleanPickupAddr,
          contactName: currentUser.name || 'Müşteri',
          contactPhone: currentUser.phone || '0500 000 00 00',
          contactEmail: currentUser.email,
          lat: pickupCoords?.lat || ANTALYA_DISTRICTS[pickupDistrict]?.centerCoordinates.lat || 36.886,
          lng: pickupCoords?.lng || ANTALYA_DISTRICTS[pickupDistrict]?.centerCoordinates.lng || 30.7065,
        },
        receiver: {
          district: destDistrict,
          neighborhood: '',
          addressDetail: cleanDestAddr,
          contactName: finalReceiverName,
          contactPhone: finalReceiverPhone,
          contactEmail: '',
          lat: destCoords?.lat || ANTALYA_DISTRICTS[destDistrict]?.centerCoordinates.lat || 36.8732,
          lng: destCoords?.lng || ANTALYA_DISTRICTS[destDistrict]?.centerCoordinates.lng || 30.6384,
        },
        packageType,
        packageName: finalPkgName,
        packageWeightKg: 1,
        urgency: 'express_vip',
        paymentMethod,
        isPaid: false,
        tipAmount: tipAmount > 0 ? tipAmount : undefined,
        estimatedDistanceKm: activeDistanceKm,
        estimatedDurationMins: activeDurationMins,
        noteForCourier: courierNotes,
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-emerald-300">
                        Açık Alış Adresi (Cadde, Sokak, Bina No, Kapı) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMapPickerType('sender');
                          setIsMapPickerOpen(true);
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer bg-emerald-950/70 hover:bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/50 transition"
                      >
                        <MapIcon className="w-3 h-3" />
                        <span>Haritadan Seç</span>
                      </button>
                    </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-teal-300">
                    Teslimat Açık Adresi (Bina, No, Daire, Firma vb.) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMapPickerType('receiver');
                      setIsMapPickerOpen(true);
                    }}
                    className="text-[11px] text-teal-300 hover:text-teal-200 font-bold flex items-center gap-1 cursor-pointer bg-teal-950/80 hover:bg-teal-900 px-2 py-0.5 rounded border border-teal-700/60 transition"
                  >
                    <MapIcon className="w-3 h-3" />
                    <span>Haritadan Seç</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  placeholder="Örn: Arapsuyu Mah. Akdeniz Bulvarı No:45 Kat:2 Konyaaltı"
                  required
                  autoFocus
                  className="w-full bg-[#011410] border border-teal-700/60 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-white placeholder-teal-700 focus:outline-none transition resize-none font-medium"
                />
                <div className="flex items-center justify-between text-[11px] text-teal-300/90 pt-1">
                  <span className="flex items-center gap-1 font-semibold">
                    {isMeasuringDistance ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                        <span className="text-amber-300 font-medium">Gerçek sürüş mesafesi hesaplanıyor...</span>
                      </>
                    ) : measuredDistanceKm ? (
                      <>
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">
                          Ölçülen Karayolu Mesafesi: <span className="text-white font-extrabold underline decoration-emerald-400">~{measuredDistanceKm} km</span>
                        </span>
                      </>
                    ) : (
                      <span>Tahmini Mesafe: ~{estimate.distanceKm} km</span>
                    )}
                  </span>
                  <span className="text-[10px] text-teal-400/80 font-mono">({pickupDistrict} ➔ {destDistrict})</span>
                </div>
              </div>

              {/* Receiver Info: Optional & Notify Later option */}
              <div className="pt-2 border-t border-teal-800/40 space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 bg-[#011410] border border-teal-700/60 rounded-xl cursor-pointer select-none hover:bg-teal-950/50 transition">
                  <input
                    type="checkbox"
                    checked={notifyReceiverLater}
                    onChange={(e) => {
                      setNotifyReceiverLater(e.target.checked);
                      if (e.target.checked) {
                        setReceiverName('');
                        setReceiverPhone('');
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-teal-600 text-teal-500 focus:ring-0 bg-[#011a14] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-teal-200">
                      Alıcı bilgilerini kuryeye daha sonra bildireceğim
                    </span>
                    <p className="text-[10px] text-teal-400/70 mt-0.5">
                      Alıcı adı ve telefonunu şimdi girmek zorunda değilsiniz. Kurye paketi aldığında veya varışta iletebilirsiniz.
                    </p>
                  </div>
                </label>

                {!notifyReceiverLater ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-teal-300 mb-1">
                        Alıcı Adı Soyadı <span className="text-teal-400/60 font-normal">(Opsiyonel)</span>
                      </label>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="Örn: Mehmet Bey / Şirket (Opsiyonel)"
                        className="w-full bg-[#011410] border border-teal-700/60 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-white placeholder-teal-700 focus:outline-none transition font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-teal-300 mb-1">
                        Alıcı Telefonu <span className="text-teal-400/60 font-normal">(Opsiyonel)</span>
                      </label>
                      <input
                        type="tel"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="05XX XXX XX XX (Opsiyonel)"
                        className="w-full bg-[#011410] border border-teal-700/60 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-white placeholder-teal-700 focus:outline-none transition font-mono font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-teal-950/70 border border-teal-700/50 text-[11px] text-teal-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Alıcı bilgisi kuryeye <strong>"Daha Sonra Bildirilecek"</strong> olarak kaydedilecek.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. PAKET TİPİ SEÇİMİ (DETAYLI FORMDAKİ GİBİ HEPSİ) */}
            <div className="bg-[#011a14] rounded-2xl border border-emerald-800/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    3
                  </div>
                  <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                    Paket Tipi Seçimi
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400/80 font-medium">5 Farklı Kategori</span>
              </div>

              {/* Grid of all 5 package types mirroring the detailed form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {QUICK_PACKAGE_OPTIONS.map((pkg) => {
                  const isSelected = packageType === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setPackageType(pkg.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-900/80 text-white shadow-md ring-2 ring-emerald-400/40'
                          : 'border-emerald-800/60 bg-[#011410] text-emerald-200/90 hover:bg-emerald-950/70 hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{pkg.icon}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        }`}>
                          Taban {pkg.basePrice} ₺
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white mt-1">
                          {pkg.title}
                        </div>
                        <div className="text-[10px] text-emerald-300/70 leading-snug line-clamp-1">
                          {pkg.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Package Content Description */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                  Paket İçerik Açıklaması (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Örn: 2 porsiyon yemek, evrak dosyası, kedi maması, hediye paketi vb."
                  className="w-full bg-[#011410] border border-emerald-700/60 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700 focus:outline-none transition font-medium"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-emerald-300 mb-1.5">
                  Ödeme Yöntemi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gonderici_odemeli')}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'gonderici_odemeli'
                        ? 'border-emerald-400 bg-emerald-900/80 text-white ring-2 ring-emerald-400/40'
                        : 'border-emerald-800/60 bg-[#011410] text-emerald-200 hover:bg-emerald-950/60'
                    }`}
                  >
                    <span className="text-base">📤</span>
                    <span className="font-extrabold text-xs">Gönderici Ödemeli</span>
                    <span className="text-[10px] font-normal text-emerald-300/70">Ücret çıkışta ödenir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('alici_odemeli')}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'alici_odemeli'
                        ? 'border-emerald-400 bg-emerald-900/80 text-white ring-2 ring-emerald-400/40'
                        : 'border-emerald-800/60 bg-[#011410] text-emerald-200 hover:bg-emerald-950/60'
                    }`}
                  >
                    <span className="text-base">📥</span>
                    <span className="font-extrabold text-xs">Alıcı Ödemeli</span>
                    <span className="text-[10px] font-normal text-emerald-300/70">Ücret teslimatta tahsil edilir</span>
                  </button>
                </div>
              </div>

              {/* Optional Note for Courier */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                  Kuryeye Not (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={packageNote}
                  onChange={(e) => setPackageNote(e.target.value)}
                  placeholder="Örn: Zile basmayın lütfen, güvenliğe teslim edilecek."
                  className="w-full bg-[#011410] border border-emerald-800/60 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-700 focus:outline-none transition font-medium"
                />
              </div>
            </div>

            {/* 4. KURYE BAHŞİŞ KISMI (AÇIKLAMASIYLA BERABER) */}
            <div className="bg-[#011d17] border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md">
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
                          : 'bg-[#011410] text-emerald-200 border-emerald-800/70 hover:bg-emerald-950/70 hover:border-emerald-700'
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
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    isCustomTip
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-[#011410] text-emerald-200 border-emerald-800/70 hover:bg-emerald-950/70'
                  }`}
                >
                  Özel Tutar
                </button>
              </div>

              {/* Özel Tutar Giriş Kutusu */}
              {isCustomTip && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={customTipInput}
                      onChange={(e) => setCustomTipInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="İstediğiniz tutarı yazın (Örn: 150)"
                      autoFocus
                      className="w-full bg-[#011410] border border-amber-500/70 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 font-bold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-amber-400">
                      ₺
                    </span>
                  </div>
                  {tipAmount > 0 && (
                    <span className="text-xs font-extrabold text-amber-300 shrink-0">
                      +{tipAmount} ₺ Bahşiş
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 5. FİYAT, MESAFE VE SÜRE ÖZETİ */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#032d23] to-teal-950 rounded-2xl border border-emerald-600/70 flex items-center justify-between gap-3 shadow-md">
              <div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-bold flex-wrap">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tahmini Varış: <strong>{activeDurationMins} Dakika</strong></span>
                  <span className="text-emerald-600">•</span>
                  <span className="text-emerald-300 font-extrabold flex items-center gap-1">
                    📍 Yaklaşık Mesafe: <span className="text-amber-300 font-black">~{activeDistanceKm} km</span>
                    {isMeasuringDistance && <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-1" />}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  {pickupDistrict} ➔ {destDistrict}
                </p>
                {tipAmount > 0 && (
                  <p className="text-[10px] text-amber-300 font-semibold mt-1">
                    Tarife: {estimate.price} ₺ + Bahşiş: {tipAmount} ₺
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Toplam Tutar</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  {grandTotal} ₺
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
              <span>{isSubmitting ? 'Kurye Aranıyor...' : `Kuryeyi Çağır (${grandTotal} ₺)`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Map Location Picker Modal */}
      {isMapPickerOpen && (
        <MapLocationPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          title={
            mapPickerType === 'sender'
              ? 'Paketin Alınacağı Konumu Haritadan Seç'
              : 'Paketin Teslim Edileceği Konumu Haritadan Seç'
          }
          type={mapPickerType}
          initialDistrict={mapPickerType === 'sender' ? pickupDistrict : destDistrict}
          initialAddress={mapPickerType === 'sender' ? pickupAddress : destAddress}
          onConfirmLocation={handleLocationConfirmed}
        />
      )}
    </div>
  );
};
