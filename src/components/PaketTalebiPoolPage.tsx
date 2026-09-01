import React, { useState, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, DeliveryRequest, CourierInfo } from '../types';
import {
  Bike,
  Navigation,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  Vibrate,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  Zap,
  DollarSign,
  MapPin,
  ExternalLink,
  Mail,
  ShieldCheck,
  Copy,
  Check,
  PhoneCall,
  X,
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
    releaseRequestBackToPool,
    syncWithServer,
    openAuthModal,
  } = useDelivery();

  const [activePoolTab, setActivePoolTab] = useState<'pool' | 'my_active'>('pool');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [claimedOrderModal, setClaimedOrderModal] = useState<DeliveryRequest | null>(null);

  // Auto-refresh every 3 seconds for real-time live stream
  useEffect(() => {
    const interval = setInterval(async () => {
      if (typeof syncWithServer === 'function') {
        try {
          await syncWithServer();
        } catch (err) {
          console.debug('Background pool sync status:', err);
        }
      }
      setLastSyncTime(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Filter pending pool orders
  const poolRequests = requests.filter((r) => r.status === 'pending_pool');

  const filteredRequests = poolRequests.filter((req) => {
    if (selectedDistrict !== 'all') {
      if (req.sender.district !== selectedDistrict && req.receiver.district !== selectedDistrict) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = req.trackingCode?.toLowerCase().includes(q);
      const matchSender = req.sender.district.toLowerCase().includes(q) || req.sender.addressDetail?.toLowerCase().includes(q) || req.sender.contactName?.toLowerCase().includes(q);
      const matchReceiver = req.receiver.district.toLowerCase().includes(q) || req.receiver.addressDetail?.toLowerCase().includes(q) || req.receiver.contactName?.toLowerCase().includes(q);
      const matchPkg = req.packageName?.toLowerCase().includes(q);
      return matchCode || matchSender || matchReceiver || matchPkg;
    }
    return true;
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (typeof syncWithServer === 'function') {
      try {
        await syncWithServer();
      } catch (err) {
        console.debug('Manual pool sync status:', err);
      }
    }
    setLastSyncTime(new Date());
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAcceptJob = async (order: DeliveryRequest) => {
    // If not logged in as courier or admin, guide them to pick courier
    if (currentUser.role !== 'courier' && currentUser.role !== 'admin') {
      // If default courier exists, switch or open login
      openAuthModal('courier_login', 'İşi üzerinize almak için lütfen kurye girişi yapınız.');
      return;
    }

    setAcceptingOrderId(order.id);
    if (audioEnabled) playAcceptSound();
    if (vibrationEnabled) triggerHapticVibration([150, 100, 200]);

    try {
      // Find current courier info
      const courierObj = couriers.find((c) => c.id === currentUser.id) || {
        id: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
        rating: 5.0,
        totalDeliveries: currentUser.totalOrders || 0,
      };

      acceptRequest(order.id, courierObj as CourierInfo);

      // Open unmasked claimed order modal immediately so courier sees full contact details
      setClaimedOrderModal({
        ...order,
        status: 'courier_assigned',
        courier: courierObj as CourierInfo,
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      setActionSuccessMessage(`✅ Sipariş (#${order.trackingCode}) başarıyla üzerinize atandı! Müşteri iletişim bilgileri açıldı.`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAcceptingOrderId(null);
    }
  };

  // List of active couriers in the system for quick switch
  const activeCouriers = users.filter((u) => u.role === 'courier');

  // Active deliveries for current courier
  const myActiveDeliveries = requests.filter(
    (r) =>
      (r.status === 'courier_assigned' || r.status === 'picked_up') &&
      r.courier &&
      (r.courier.id === currentUser.id || currentUser.role === 'admin')
  );

  const getNavUrl = (district: string, addressDetail?: string) => {
    const full = encodeURIComponent(`Antalya, ${district}, ${addressDetail || ''}`);
    return `https://www.google.com/maps/search/?api=1&query=${full}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011410] via-[#021d17] to-[#011410] text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP BRAND & LIVE BADGE HEADER */}
        <div className="bg-[#021f19]/90 border border-emerald-700/60 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40 shrink-0">
                  <Bike className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Antalya 7/24 Canlı Paket Talep Havuzu
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold hidden sm:inline-block">
                      /pakettalebi
                    </span>
                  </div>
                  <p className="text-xs text-emerald-300/80 font-medium">
                    Anlık gelen tüm müşteri talepleri ve kurye görevleri canlı radar ekranı
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Live Status Indicators & Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Canlı Akış Aktif</span>
                <span className="text-[10px] text-emerald-500/80 font-mono">({lastSyncTime.toLocaleTimeString()})</span>
              </div>

              <button
                type="button"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  audioEnabled
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
                title={audioEnabled ? 'Sesli Uyarı Açık' : 'Sesli Uyarı Kapalı'}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{audioEnabled ? 'Ses Açık' : 'Ses Kapalı'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  vibrationEnabled
                    ? 'bg-amber-900/50 border-amber-500/60 text-amber-200'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
                title={vibrationEnabled ? 'Titreşim Açık' : 'Titreşim Kapalı'}
              >
                <Vibrate className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Titreşim</span>
              </button>

              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-2 rounded-xl bg-emerald-700/40 hover:bg-emerald-700/60 border border-emerald-600/60 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Şimdi Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yenile</span>
              </button>

              <a
                href="/"
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-700/60 text-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Ana Sayfaya / Panele Dön"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Ana Sayfa</span>
              </a>
            </div>

          </div>

          {/* ACTIVE COURIER STATUS BAR */}
          <div className="mt-4 pt-4 border-t border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-emerald-400/80 font-medium">Aktif Kullanıcı / Kurye:</span>
              {currentUser.role === 'courier' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                  <Bike className="w-3.5 h-3.5" />
                  <span>{currentUser.name} ({currentUser.email || currentUser.phone})</span>
                </div>
              ) : currentUser.role === 'admin' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Yönetici: {currentUser.name}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Giriş Yapılmadı (Kurye Girişi Gerekli)</span>
                </div>
              )}
            </div>

            {/* Quick Courier Selection Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-emerald-400/70 text-[11px]">Hızlı Kurye Değiştir:</span>
              <select
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-[#011410] border border-emerald-700 text-emerald-200 text-xs rounded-lg px-2.5 py-1 outline-none font-bold cursor-pointer"
              >
                {activeCouriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏍️ {c.name} ({c.district || 'Antalya'})
                  </option>
                ))}
                <option value="user-admin-01">🛡️ Antalya Kurye Yönetim (Admin)</option>
              </select>
            </div>
          </div>

        </div>

        {/* SUCCESS ACTION BANNER */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-100 flex items-center justify-between gap-3 shadow-xl animate-bounce">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{actionSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMessage(null)}
              className="text-xs text-emerald-400 hover:text-white underline cursor-pointer"
            >
              Kapat
            </button>
          </div>
        )}

        {/* EMAIL NOTIFICATION INFO BANNER */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#02241d] to-emerald-950/80 border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block">Otomatik Kurye E-posta Bildirimi Aktif</strong>
              <span className="text-[11px] text-emerald-300/80">
                Havuzdaki tüm yeni talepler sisteme kayıtlı kuryelerin e-posta adreslerine anlık olarak postalanmaktadır.
              </span>
            </div>
          </div>
          <div className="text-[11px] text-amber-300 font-mono font-bold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-600/40 shrink-0 self-start sm:self-auto">
            ⚡ Havuzdaki Aktif Talep: {poolRequests.length} Adet
          </div>
        </div>

        {/* POOL & MY ACTIVE TABS */}
        <div className="flex items-center gap-2 border-b border-emerald-800/60 pb-3">
          <button
            type="button"
            onClick={() => setActivePoolTab('pool')}
            className={`px-4 sm:px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activePoolTab === 'pool'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-[#011a14] text-emerald-300/80 hover:bg-[#02241d] hover:text-white border border-emerald-800/50'
            }`}
          >
            <Radio className={`w-4 h-4 ${activePoolTab === 'pool' ? 'animate-pulse text-amber-300' : ''}`} />
            <span>Bekleyen Talep Havuzu</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono font-bold">
              {poolRequests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePoolTab('my_active')}
            className={`px-4 sm:px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activePoolTab === 'my_active'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-[#011a14] text-emerald-300/80 hover:bg-[#02241d] hover:text-white border border-emerald-800/50'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Üzerimdeki Görevler</span>
            {myActiveDeliveries.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-xs font-mono font-black animate-pulse">
                {myActiveDeliveries.length}
              </span>
            )}
          </button>
        </div>

        {activePoolTab === 'pool' && (
          <div className="space-y-4">
            {/* SEARCH & DISTRICT FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Box */}
              <div className="md:col-span-7 relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Takip no, ilçe, mahalle veya paket ara..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#021f19] border border-emerald-700/70 rounded-2xl text-xs sm:text-sm text-white placeholder:text-emerald-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* District Filter */}
              <div className="md:col-span-5 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#021f19] border border-emerald-700/70 rounded-2xl text-xs sm:text-sm text-white outline-none focus:border-emerald-400 font-medium cursor-pointer"
                >
                  <option value="all">Tüm Antalya İlçeleri ({poolRequests.length} Talep)</option>
                  <option value="Muratpaşa">Muratpaşa</option>
                  <option value="Konyaaltı">Konyaaltı</option>
                  <option value="Kepez">Kepez</option>
                  <option value="Lara (Muratpaşa)">Lara</option>
                  <option value="Döşemealtı">Döşemealtı</option>
                  <option value="Aksu">Aksu</option>
                </select>
              </div>
            </div>

            {/* POOL REQUESTS LIST */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#021f19]/70 border border-emerald-800/60 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-900/40 border border-emerald-700/60 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                    <Bike className="w-8 h-8 opacity-70" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Havuzda Bekleyen Talep Yok</h3>
                    <p className="text-xs text-emerald-300/70 max-w-md mx-auto">
                      Şu an için havuzda atanmamış talep bulunmuyor. Yeni bir çağrı geldiğinde sistem sesli, görsel ve titreşimli olarak otomatik bildirecektir.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleManualRefresh}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Havuzu Şimdi Yenile</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRequests.map((req) => {
                    const isAliciOdemeli = req.paymentMethod === 'alici_odemeli';

                    return (
                      <div
                        key={req.id}
                        className="p-5 sm:p-6 rounded-3xl bg-[#021f19] border-2 border-emerald-700/80 hover:border-emerald-500 transition shadow-2xl space-y-4 text-white relative overflow-hidden"
                      >
                        {/* Top Order Badge & Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/60">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                              <Zap className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-base text-amber-400">
                                  #{req.trackingCode}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(req.trackingCode)}
                                  className="text-emerald-400/80 hover:text-white p-1"
                                  title="Kodu Kopyala"
                                >
                                  {copiedCode === req.trackingCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                                  {req.packageName || 'Standart Paket'}
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-400/70 mt-0.5">
                                Oluşturulma: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Yaklaşık {req.estimatedDurationMins || 35} Dk Teslimat
                              </p>
                            </div>
                          </div>

                          {/* Price / Earnings Badge */}
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-400/70 block">Kurye Hakedişi</span>
                              <span className="text-lg sm:text-xl font-black text-emerald-300">
                                +{req.courierEarnings || Math.round(req.price * 0.85)} ₺
                              </span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-[#011410] border border-emerald-700/60 text-right">
                              <span className="text-[10px] text-slate-400 block">Sipariş Tutarı</span>
                              <span className="text-sm font-bold text-white">{req.price} ₺</span>
                            </div>
                          </div>
                        </div>

                        {/* Route Details Box (Masked for Pool Privacy) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Sender Box */}
                          <div className="p-3.5 rounded-2xl bg-[#011410] border border-emerald-800/60 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                1. ALIŞ NOKTASI (GÖNDERİCİ)
                              </span>
                              <span className="text-white font-extrabold">{req.sender.district}</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                              {req.sender.addressDetail || req.sender.neighborhood || req.sender.district}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-emerald-900/60 text-[11px]">
                              <span className="text-emerald-300/80 font-bold">
                                👤 {maskCustomerName(req.sender.contactName)}
                              </span>
                              <span className="text-amber-300/90 font-mono font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-amber-400" />
                                {maskPhoneNumber(req.sender.contactPhone)}
                              </span>
                            </div>
                          </div>

                          {/* Receiver Box */}
                          <div className="p-3.5 rounded-2xl bg-[#011410] border border-emerald-800/60 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                              <span className="flex items-center gap-1.5">
                                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                                2. TESLİMAT NOKTASI (ALICI)
                              </span>
                              <span className="text-white font-extrabold">{req.receiver.district}</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                              {req.receiver.addressDetail || req.receiver.neighborhood || req.receiver.district}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-emerald-900/60 text-[11px]">
                              <span className="text-amber-300/80 font-bold">
                                👤 {maskCustomerName(req.receiver.contactName)}
                              </span>
                              <span className="text-amber-300/90 font-mono font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-amber-400" />
                                {maskPhoneNumber(req.receiver.contactPhone)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Note if any */}
                        {req.noteForCourier && (
                          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 flex items-start gap-2">
                            <span className="font-bold shrink-0">📝 Müşteri Notu:</span>
                            <span>{req.noteForCourier}</span>
                          </div>
                        )}

                        {/* PAYMENT METHOD WARNING ALERT */}
                        {isAliciOdemeli ? (
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-2 border-red-500 flex items-center gap-3 text-white shadow-lg">
                            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div className="text-xs">
                              <strong className="text-red-200 block uppercase tracking-wide">
                                🔴 ÖNEMLİ: ALICI ÖDEMELİ SİPARİŞ
                              </strong>
                              <span className="text-red-100">
                                Paketi alıcıya teslim ederken alıcıdan <strong className="text-amber-300 font-black">{req.price} ₺</strong> ödemeyi tahsil etmeyi <u>unutmayınız</u>.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border border-emerald-600/70 flex items-center gap-3 text-white">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-xs">
                              <strong className="text-emerald-200 block uppercase tracking-wide">
                                🟢 GÖNDERİCİ ÖDEMELİ SİPARİŞ
                              </strong>
                              <span className="text-emerald-100">
                                Paketi adresten teslim alırken göndericiden <strong className="text-amber-300 font-bold">{req.price} ₺</strong> ücret tahsilatını kontrol ediniz.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ACTION BUTTON */}
                        <div className="pt-2 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            disabled={acceptingOrderId === req.id}
                            onClick={() => handleAcceptJob(req)}
                            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                          >
                            <Bike className="w-5 h-5" />
                            <span>{acceptingOrderId === req.id ? 'İş Atanıyor...' : '⚡ Görevi Kabul Et & Üzerime Al'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY ACTIVE DELIVERIES (UNMASKED FULL ACCESS FOR COURIER) */}
        {activePoolTab === 'my_active' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#021f19] border border-emerald-700/60 flex items-center justify-between text-white">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">Üzerinizdeki Aktif Görevler ({myActiveDeliveries.length})</h3>
                <p className="text-xs text-emerald-300/80">Kabul ettiğiniz görevlerin tüm müşteri bilgileri (isim, telefon, açık adres) eksiksiz görüntülenmektedir.</p>
              </div>
              <button
                type="button"
                onClick={() => setActivePoolTab('pool')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition"
              >
                + Yeni Talep Al
              </button>
            </div>

            {myActiveDeliveries.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#021f19] border border-emerald-800/60 text-center space-y-3 text-white">
                <p className="text-sm font-bold">Şu anda üzerinizde aktif bir teslimat görevi bulunmuyor.</p>
                <button
                  type="button"
                  onClick={() => setActivePoolTab('pool')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  Havuzdan İş Seç & Al
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveDeliveries.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] border-2 border-emerald-500 shadow-2xl space-y-4 text-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-[#011410] text-amber-400 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                          #{req.trackingCode}
                        </span>
                        <span className="text-xs font-bold text-white">{req.packageName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-600/50">
                          {req.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-emerald-300/80">Kurye Kazancınız: </span>
                        <span className="text-base font-extrabold text-amber-400">+{req.courierEarnings} ₺</span>
                      </div>
                    </div>

                    {/* UNMASKED ROUTE & FULL CONTACT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#011410] p-4 rounded-2xl border border-emerald-800/40 text-xs">
                      {/* Pickup */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> 1. Alış Adresi (Gönderen)
                          </span>
                          <a
                            href={`tel:${req.sender.contactPhone}`}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 text-xs shadow-md"
                          >
                            <PhoneCall className="w-3 h-3" /> {req.sender.contactPhone}
                          </a>
                        </div>
                        <p className="font-black text-sm text-white">{req.sender.contactName}</p>
                        <p className="text-emerald-300 font-bold">{req.sender.district}</p>
                        <p className="text-emerald-200/90 break-words">{req.sender.addressDetail}</p>
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
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold flex items-center gap-1 text-xs shadow-md"
                          >
                            <PhoneCall className="w-3 h-3" /> {req.receiver.contactPhone}
                          </a>
                        </div>
                        <p className="font-black text-sm text-white">{req.receiver.contactName}</p>
                        <p className="text-teal-300 font-bold">{req.receiver.district}</p>
                        <p className="text-emerald-200/90 break-words">{req.receiver.addressDetail}</p>
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

                    {/* Actions */}
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
                              onClick={() => releaseRequestBackToPool(req.id)}
                              className="px-3.5 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Görevi Bırak
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(req.id, 'picked_up')}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer"
                            >
                              Paketi Adresten Teslim Aldım
                            </button>
                          </>
                        )}

                        {req.status === 'picked_up' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(req.id, 'delivered')}
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

        {/* CLAIMED ORDER FULL UNMASKED DETAILS POPUP MODAL */}
        {claimedOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-gradient-to-b from-[#032a21] to-[#011a14] rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-500 space-y-5 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/40">
                    <PhoneCall className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700/50">
                      Görev Üzerinize Alındı
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white pt-0.5">
                      Müşteri İletişim Detayları
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setClaimedOrderModal(null)}
                  className="p-1.5 rounded-lg bg-[#011410] hover:bg-[#02241d] text-emerald-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-emerald-200 leading-relaxed">
                Talebi başarıyla üzerinize aldınız. Gönderici ve alıcının tüm iletişim bilgileri açılmıştır. Lütfen göndericiyi hemen arayarak hazır olduğunu teyit ediniz:
              </p>

              {/* UNMASKED SENDER & RECEIVER CARDS */}
              <div className="space-y-3">
                {/* Sender */}
                <div className="p-4 bg-[#011410] rounded-2xl border border-emerald-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 1. Gönderici (Alış Noktası)
                    </span>
                    <span className="font-bold text-amber-300">{claimedOrderModal.sender.district}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-black text-sm">{claimedOrderModal.sender.contactName}</span>
                    <a
                      href={`tel:${claimedOrderModal.sender.contactPhone}`}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {claimedOrderModal.sender.contactPhone}
                    </a>
                  </div>
                  <p className="text-emerald-200/90 text-[11px] break-words">{claimedOrderModal.sender.addressDetail}</p>
                  <a
                    href={getNavUrl(claimedOrderModal.sender.district, claimedOrderModal.sender.addressDetail)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Alış Adresine Haritada Git
                  </a>
                </div>

                {/* Receiver */}
                <div className="p-4 bg-[#011410] rounded-2xl border border-emerald-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-400 font-bold flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" /> 2. Alıcı (Teslim Noktası)
                    </span>
                    <span className="font-bold text-teal-300">{claimedOrderModal.receiver.district}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-black text-sm">{claimedOrderModal.receiver.contactName}</span>
                    <a
                      href={`tel:${claimedOrderModal.receiver.contactPhone}`}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {claimedOrderModal.receiver.contactPhone}
                    </a>
                  </div>
                  <p className="text-emerald-200/90 text-[11px] break-words">{claimedOrderModal.receiver.addressDetail}</p>
                  <a
                    href={getNavUrl(claimedOrderModal.receiver.district, claimedOrderModal.receiver.addressDetail)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Teslimat Adresine Haritada Git
                  </a>
                </div>
              </div>

              {/* Direct call sender CTA */}
              <a
                href={`tel:${claimedOrderModal.sender.contactPhone}`}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-white font-black text-sm rounded-2xl transition flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30 text-center"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>Göndericiyi Hemen Ara ({claimedOrderModal.sender.contactPhone})</span>
              </a>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setClaimedOrderModal(null);
                    setActivePoolTab('my_active');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs cursor-pointer transition border border-emerald-800/60 text-center"
                >
                  Üzerimdeki Görevlerime Git
                </button>
                <button
                  type="button"
                  onClick={() => setClaimedOrderModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition text-center"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER NOTE */}
        <div className="pt-6 border-t border-emerald-800/40 text-center text-xs text-emerald-400/60 space-y-1">
          <p>
            © 2026 Antalya Şehir İçi Teslimat 7/24 • Özel Kurye Havuz Akışı • <span className="font-mono">www.antalyateslimat.com/pakettalebi</span>
          </p>
          <p className="text-[11px] text-emerald-500/50">
            Muratpaşa • Kepez • Konyaaltı • Lara • Döşemealtı • Aksu
          </p>
        </div>

      </div>
    </div>
  );
};
