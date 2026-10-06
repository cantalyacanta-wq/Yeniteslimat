import React, { useState } from 'react';
import {
  Package,
  Truck,
  User,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  Phone,
  Bike,
  CheckCircle2,
  Navigation,
  Radio,
  PhoneCall,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Star,
  Sparkles,
  Search,
  History,
  FileText,
  LogOut,
  Zap,
  Headphones,
  Mic,
  UserCheck,
  Flame,
  Tag,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { UserRole, DistrictName, DeliveryRequest, DeliveryStatus } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';
import { ReceiptModal } from './ReceiptModal';
import { CourierPool } from './CourierPool';
import { AnimatedCourierSpeechBubble } from './AnimatedCourierSpeechBubble';
import { PanelvanNakliyeSection } from './PanelvanNakliyeSection';

export const HeroIntro: React.FC = () => {
  const {
    setCurrentView,
    currentUser,
    requests,
    setSelectedTrackingId,
    cancelRequest,
    acceptRequest,
    openAuthModal,
    rateDelivery,
    logout,
    openQuickCourierModal,
    openVoiceAssistant,
  } = useDelivery();

  // If a courier is logged in, directly show CourierPool and never customer interfaces
  if (currentUser.role === 'courier') {
    return <CourierPool />;
  }

  const [confirmCancelModal, setConfirmCancelModal] = useState<DeliveryRequest | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedActiveOrderId, setSelectedActiveOrderId] = useState<string | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [hideDeliveredCard, setHideDeliveredCard] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<DeliveryRequest | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [justCancelledCode, setJustCancelledCode] = useState<string | null>(null);

  // Restore last customer order ID & contact phone from persistent storage
  const lastSavedOrderId = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_order_id') : null;
  const lastSavedPhone = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_phone') : null;

  // Active customer orders (strictly isolated to the current user's own orders)
  const customerOrders = requests.filter((r) => {
    if (!r || r.status === 'cancelled') return false;
    if (currentUser.role === 'admin') return true;

    // If logged in as customer or user
    if (currentUser.id !== 'user-guest-01') {
      const uPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, '').slice(-10) : '';
      const uEmail = currentUser.email ? currentUser.email.trim().toLowerCase() : '';
      const uName = currentUser.name ? currentUser.name.trim().toLowerCase() : '';

      if (r.senderUserId && r.senderUserId === currentUser.id) return true;
      if (uPhone && uPhone.length >= 7) {
        const sPhone = r.sender?.contactPhone ? r.sender.contactPhone.replace(/\D/g, '').slice(-10) : '';
        if (sPhone && sPhone === uPhone) return true;
      }
      if (uEmail && (r as any).senderEmail && (r as any).senderEmail.trim().toLowerCase() === uEmail) return true;
      if (uName && uName !== 'yeni müşteri' && uName !== 'müşteri' && r.sender?.contactName?.trim().toLowerCase() === uName) return true;
      return false;
    }

    // Guest user (not logged in): strictly only orders created in this device / browser session
    const pPhone = lastSavedPhone ? lastSavedPhone.replace(/\D/g, '').slice(-10) : '';
    return (
      (Boolean(lastSavedOrderId) && r.id === lastSavedOrderId) ||
      (Boolean(pPhone) && r.sender?.contactPhone && r.sender.contactPhone.replace(/\D/g, '').slice(-10) === pPhone)
    );
  });

  const activeOrders = customerOrders.filter((r) => r.status !== 'delivered');
  const deliveredOrders = customerOrders.filter((r) => r.status === 'delivered');

  // Active order to display
  const activeCustomerOrder = 
    (selectedActiveOrderId ? activeOrders.find((r) => r.id === selectedActiveOrderId) : null) ||
    activeOrders[0] ||
    null;

  // Delivered order to celebrate if no active order is in progress
  const deliveredOrderToCelebrate =
    !activeCustomerOrder && deliveredOrders.length > 0
      ? deliveredOrders[0]
      : null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending_pool':
        return <span className="text-[10px] font-bold bg-amber-900/80 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded-full">Havuzda Bekliyor</span>;
      case 'courier_assigned':
        return <span className="text-[10px] font-bold bg-blue-900/80 text-blue-300 border border-blue-600/50 px-2 py-0.5 rounded-full">Kurye Yolda (Alış)</span>;
      case 'picked_up':
        return <span className="text-[10px] font-bold bg-indigo-900/80 text-indigo-300 border border-indigo-600/50 px-2 py-0.5 rounded-full">Dağıtımda</span>;
      case 'near_destination':
        return <span className="text-[10px] font-bold bg-purple-900/80 text-purple-300 border border-purple-600/50 px-2 py-0.5 rounded-full">Teslimat Adresinde</span>;
      case 'delivered':
        return <span className="text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full">Teslim Edildi</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  const isUserLoggedIn = currentUser.id !== 'user-guest-01' && currentUser.role === 'customer';

  // Filter history items for logged-in customer
  const filteredDeliveredOrders = deliveredOrders.filter((req) => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    return (
      (req.trackingCode || '').toLowerCase().includes(q) ||
      (req.packageName || '').toLowerCase().includes(q) ||
      (req.receiver?.contactName || '').toLowerCase().includes(q) ||
      (req.receiver?.district || '').toLowerCase().includes(q) ||
      (req.sender?.district || '').toLowerCase().includes(q)
    );
  });

  // =========================================================================
  // SCENARIO 1: GUEST USER HAS ACTIVE ORDER(S)
  // Clean, focused single view with ONLY active order radar & "+ Yeni Paket" button
  // =========================================================================
  if (!isUserLoggedIn && activeCustomerOrder) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Just Cancelled Feedback Banner */}
        {justCancelledCode && (
          <div className="p-4 bg-rose-950/90 border border-rose-600/70 rounded-2xl text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span><strong>#{justCancelledCode}</strong> takip kodlu siparişiniz başarıyla iptal edildi. Kurye görev havuzundan kaldırıldı.</span>
            </div>
            <button
              type="button"
              onClick={() => setJustCancelledCode(null)}
              className="p-1 hover:text-white text-rose-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Action Bar with "+ Yeni Paket" Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] p-4 sm:p-5 rounded-3xl border border-emerald-800/60 shadow-xl text-white">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute"></span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Canlı Aktif Sipariş Takibi
              </h2>
              <p className="text-xs text-emerald-300/80">
                {activeOrders.length > 1
                  ? `Toplam ${activeOrders.length} aktif siparişiniz bulunuyor.`
                  : 'Siparişinizin anlık durumu aşağıda canlı olarak güncellenmektedir.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {isUserLoggedIn && (
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-2.5 bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                title="Oturumu Kapat"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Oturumu Kapat</span>
              </button>
            )}
            <button
              type="button"
              onClick={openVoiceAssistant}
              className="px-3.5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-2xl transition shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 border border-amber-400/50"
              title="Üyeliksiz Sesli Müşteri Hizmetleri ile Kurye Çağır"
            >
              <Headphones className="w-4 h-4 text-amber-200" />
              <span>Sesli Kurye (Üyeliksiz)</span>
            </button>
            <button
              type="button"
              onClick={openQuickCourierModal}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0 border border-emerald-300/40"
              title="Üyelikli Hızlı Kurye Çağır"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Paket (Üyelikli)</span>
            </button>
          </div>
        </div>

        {/* Multi-Order Switcher Tabs (if more than 1 active order) */}
        {activeOrders.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {activeOrders.map((ord, idx) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => setSelectedActiveOrderId(ord.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer border ${
                  activeCustomerOrder.id === ord.id
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                    : 'bg-[#021813] text-emerald-300/80 border-emerald-800/60 hover:bg-[#03241d]'
                }`}
              >
                <span>Paket #{idx + 1}</span>
                <span className="font-mono text-[11px] opacity-80">({ord.trackingCode})</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Live Tracking Box */}
        <div className="bg-gradient-to-br from-[#021f19] via-[#032920] to-[#011813] rounded-3xl border border-emerald-800/60 p-5 sm:p-7 shadow-2xl space-y-6 text-white">
          
          {/* Header with Tracking Code */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600/80 text-emerald-200 border border-emerald-400/40 flex items-center justify-center font-extrabold text-base shadow-md">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider">Takip Kodu:</span>
                  <span className="font-mono font-extrabold text-amber-400 text-sm">{activeCustomerOrder.trackingCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeCustomerOrder.trackingCode)}
                    className="p-1 hover:text-emerald-300 text-emerald-500 transition cursor-pointer"
                    title="Kodu Kopyala"
                  >
                    {copiedCode === activeCustomerOrder.trackingCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {activeCustomerOrder.sender.district} ➔ {activeCustomerOrder.receiver.district}
                </h3>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {activeCustomerOrder.status === 'pending_admin' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-950/80 text-rose-300 border border-rose-600/60 rounded-xl text-xs font-extrabold shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                  <span>Yönetici Onayı Bekleniyor</span>
                </div>
              )}
              {activeCustomerOrder.status === 'pending_pool' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/80 text-amber-300 border border-amber-600/60 rounded-xl text-xs font-extrabold shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Kurye Havuzunda Aranıyor</span>
                </div>
              )}
              {activeCustomerOrder.status === 'courier_assigned' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-950/80 text-blue-300 border border-blue-600/60 rounded-xl text-xs font-extrabold shadow-sm">
                  <Bike className="w-4 h-4 text-blue-400" />
                  <span>Kurye Paketi Almaya Geliyor</span>
                </div>
              )}
              {activeCustomerOrder.status === 'picked_up' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-teal-950/80 text-teal-300 border border-teal-600/60 rounded-xl text-xs font-extrabold shadow-sm">
                  <Package className="w-4 h-4 text-teal-400" />
                  <span>Paket Alındı, Teslimata Yolda</span>
                </div>
              )}
              {activeCustomerOrder.status === 'near_destination' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-purple-950/80 text-purple-300 border border-purple-600/60 rounded-xl text-xs font-extrabold shadow-sm animate-bounce">
                  <Navigation className="w-4 h-4 text-purple-400" />
                  <span>Kurye Teslimat Noktasına Ulaştı</span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Courier Banner (with Animated Motor Courier & Speech Bubble) */}
          {activeCustomerOrder.assignedCourier ? (
            <div className="space-y-2.5">
              <AnimatedCourierSpeechBubble order={activeCustomerOrder} />
              <div className="flex items-center justify-between gap-2 px-1 text-xs">
                <span className="text-[11px] text-emerald-300/80 font-medium truncate">
                  Atanan Kurye: <strong className="text-white">{activeCustomerOrder.assignedCourier.name}</strong> ({activeCustomerOrder.assignedCourier.phone})
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmCancelModal(activeCustomerOrder)}
                  className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-700/60 font-semibold text-[11px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  title="Kurye atanmış olsa bile siparişinizi iptal edebilirsiniz"
                >
                  <X className="w-3 h-3 text-rose-400" />
                  <span>Talebi İptal Et</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-3.5 text-xs text-amber-200 flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>Talebiniz kurye havuzunda yayınlandı. Antalya genelindeki aktif kuryelerden onay bekleniyor.</span>
            </div>
          )}

          {/* 4-Step Visual Progress Bar */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 text-center text-[10px] sm:text-xs font-bold">
              <span className={['pending_admin', 'pending_pool'].includes(activeCustomerOrder.status) ? 'text-amber-400 font-black' : 'text-emerald-400'}>
                1. Talep Alındı {activeCustomerOrder.status === 'pending_admin' && '(Onayda)'}
              </span>
              <span className={activeCustomerOrder.status === 'courier_assigned' ? 'text-amber-400 font-black' : ['picked_up', 'near_destination', 'delivered'].includes(activeCustomerOrder.status) ? 'text-emerald-400' : 'text-emerald-700'}>
                2. Kurye Yolda (Alış)
              </span>
              <span className={['picked_up', 'near_destination'].includes(activeCustomerOrder.status) ? 'text-amber-400 font-black' : activeCustomerOrder.status === 'delivered' ? 'text-emerald-400' : 'text-emerald-700'}>
                3. Teslimata Yolda
              </span>
              <span className={activeCustomerOrder.status === 'delivered' ? 'text-emerald-300 font-black' : 'text-emerald-800'}>
                4. Teslim Edildi
              </span>
            </div>

            <div className="w-full bg-emerald-950 h-2.5 rounded-full overflow-hidden border border-emerald-800/40">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700"
                style={{
                  width:
                    ['pending_admin', 'pending_pool'].includes(activeCustomerOrder.status)
                      ? '25%'
                      : activeCustomerOrder.status === 'courier_assigned'
                      ? '50%'
                      : activeCustomerOrder.status === 'picked_up' || activeCustomerOrder.status === 'near_destination'
                      ? '75%'
                      : '100%',
                }}
              ></div>
            </div>
          </div>

          {/* Route & Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender (Pickup) */}
            <div className="bg-[#011410] p-4 rounded-2xl border border-emerald-800/50 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Package className="w-4 h-4 shrink-0" />
                1. Alış Noktası (Gönderen)
              </span>
              <div className="space-y-1 text-emerald-100">
                <p className="font-extrabold text-sm text-white">{activeCustomerOrder.sender.contactName}</p>
                <p className="text-emerald-300 font-semibold">{activeCustomerOrder.sender.district}</p>
                <p className="text-emerald-200/80 break-words">{activeCustomerOrder.sender.addressDetail}</p>
                <p className="text-emerald-400 font-mono pt-1">Tel: {activeCustomerOrder.sender.contactPhone}</p>
              </div>
            </div>

            {/* Receiver (Delivery) */}
            <div className="bg-[#011410] p-4 rounded-2xl border border-emerald-800/50 space-y-2 text-xs">
              <span className="font-bold text-teal-400 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 shrink-0" />
                2. Teslim Noktası (Alıcı)
              </span>
              <div className="space-y-1 text-emerald-100">
                <p className="font-extrabold text-sm text-white">{activeCustomerOrder.receiver.contactName}</p>
                <p className="text-teal-300 font-semibold">{activeCustomerOrder.receiver.district}</p>
                <p className="text-emerald-200/80 break-words">{activeCustomerOrder.receiver.addressDetail}</p>
                <p className="text-teal-400 font-mono pt-1">Tel: {activeCustomerOrder.receiver.contactPhone}</p>
              </div>
            </div>
          </div>

          {/* Package Info & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-emerald-800/50">
            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold">
                📦 {activeCustomerOrder.packageName}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-600/50 text-amber-300 font-extrabold">
                {activeCustomerOrder.price} ₺ • {activeCustomerOrder.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'}
              </span>
            </div>

            {/* Cancel Order Button */}
            {activeCustomerOrder.status !== 'delivered' && activeCustomerOrder.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => setConfirmCancelModal(activeCustomerOrder)}
                className="px-4 py-2.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-700/60 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <X className="w-4 h-4" />
                <span>
                  {activeCustomerOrder.assignedCourier ? 'Talebi İptal Et (Kurye Atanmış)' : 'Talebi İptal Et'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {confirmCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-[#022019] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-700/60 space-y-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-900/60 text-rose-300 border border-rose-600/50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Siparişi İptal Et</h3>
                  <p className="text-xs text-rose-200/80">Bu kurye talebini iptal etmek istediğinize emin misiniz?</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#011410] rounded-xl border border-emerald-800/60 text-xs text-emerald-200 space-y-1.5">
                <p><strong>Takip No:</strong> {confirmCancelModal.trackingCode}</p>
                <p><strong>Güzergah:</strong> {confirmCancelModal.sender.district} ➔ {confirmCancelModal.receiver.district}</p>
                <p><strong>Alıcı:</strong> {confirmCancelModal.receiver.contactName}</p>
                {confirmCancelModal.assignedCourier ? (
                  <div className="p-2.5 bg-amber-950/60 border border-amber-600/50 rounded-lg text-amber-200 text-xs mt-2">
                    <p className="font-bold text-amber-300 flex items-center gap-1">
                      <span>⚠️ Kurye Atanmış Durumda:</span> {confirmCancelModal.assignedCourier.name}
                    </p>
                    <p className="text-[11px] text-amber-200/90 mt-0.5">
                      Kurye atanmış olsa bile siparişinizi iptal edebilirsiniz. Atanan kuryeye anında iptal bildirimi iletilecek ve teslimat görevi iptal edilecektir.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-300/80 mt-1">
                    Sipariş havuzdan kaldırılacak ve kuryelere kapatılacaktır.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancelModal(null)}
                  className="px-4 py-2.5 rounded-xl text-emerald-300 hover:bg-emerald-900/40 font-bold text-xs cursor-pointer transition"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelRequest(confirmCancelModal.id);
                    setJustCancelledCode(confirmCancelModal.trackingCode);
                    setConfirmCancelModal(null);
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
  }

  // =========================================================================
  // SCENARIO 2: LOGGED-IN CUSTOMER (NO ACTIVE ORDERS)
  // Shows ONLY:
  // 1. Delivered celebration banner (if recently delivered)
  // 2. "+ Yeni Paket" action bar
  // 3. Past Deliveries List (Eski Teslimatlarım)
  // =========================================================================
  if (isUserLoggedIn) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Just Cancelled Feedback Banner */}
        {justCancelledCode && (
          <div className="p-4 bg-rose-950/90 border border-rose-600/70 rounded-2xl text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span><strong>#{justCancelledCode}</strong> takip kodlu siparişiniz başarıyla iptal edildi. Kurye görev havuzundan kaldırıldı.</span>
            </div>
            <button
              type="button"
              onClick={() => setJustCancelledCode(null)}
              className="p-1 hover:text-white text-rose-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Customer Dashboard Action Card (EXACT MATCH TO USER SCREENSHOT) */}
        <div className="bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] p-5 sm:p-6 rounded-3xl border border-emerald-800/60 shadow-xl text-white space-y-4">
          {/* Header Info */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/90 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Müşteri Paneli
              </h1>
              <p className="text-xs sm:text-sm text-emerald-300/80 mt-1 leading-relaxed">
                Sayın <strong className="text-white font-bold">{currentUser.name}</strong>, yeni bir kurye çağırabilir veya geçmiş siparişlerinizi inceleyebilirsiniz.
              </p>
            </div>
          </div>

          {/* Fırsat Tarifesi Banner (Çekici, Şık & Dikkat Çekici) */}
          <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-400/70 bg-gradient-to-r from-[#021f19] via-[#043328] to-[#022018] p-3.5 sm:p-4 shadow-xl shadow-amber-950/40">
            {/* Ambient gold glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-emerald-500/25 to-yellow-500/20 blur-md opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 font-black">
                  <Flame className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-800/90 text-white font-black text-xs border border-emerald-400/50 shadow-inner">
                      📍 10 km'ye Kadar
                    </span>
                    <span className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-sm">
                      Sadece <span className="underline decoration-amber-400 underline-offset-4">100 ₺</span>'den Başlayan Fiyatlar!
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-400/25 text-amber-200 border border-amber-300/40 rounded-full font-black uppercase tracking-wider animate-pulse">
                      🔥 Avantajlı Tarife
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 font-medium mt-0.5">
                    Antalya şehir içi sabit kilometre garantisi • Gizli ek ücret yok • 30-45 dk jet teslimat
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span className="text-xs font-black text-emerald-200 bg-emerald-900/80 border border-emerald-500/60 px-3 py-1.5 rounded-xl shadow-xs">
                  ⚡ 30-45 Dk Jet Kurye
                </span>
              </div>
            </div>
          </div>

          {/* 2 KURYE ÇAĞIRMA BUTONU (ÜYELİKLİ & ÜYELİKSİZ SESLİ ASİSTAN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Buton 1: ÜYELİKLİ KURYE ÇAĞIR */}
            <button
              type="button"
              onClick={openQuickCourierModal}
              className="py-4 px-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-emerald-700/40 flex items-center justify-between gap-3 cursor-pointer active:scale-98 border border-emerald-300/40 group text-left"
              title="Kayıtlı profil ve adresinizle hemen moto kurye çağırın"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-black shadow-md group-hover:scale-110 transition shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-white text-sm sm:text-base">Üyelikli Kurye Çağır</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-400/20 text-emerald-200 border border-emerald-300/40 rounded font-bold uppercase">
                      Kayıtlı
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 font-medium mt-0.5">
                    Profil ve adres bilgilerinizle jet kurye çağırın
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition shrink-0 hidden sm:block" />
            </button>

            {/* Buton 2: ÜYELİKSİZ / SESLİ KURYE ÇAĞIR (DİREKT SESLİ MÜŞTERİ HİZMETLERİ) */}
            <button
              type="button"
              onClick={openVoiceAssistant}
              className="py-4 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-amber-900/40 flex items-center justify-between gap-3 cursor-pointer active:scale-98 border border-amber-300/50 group text-left"
              title="Üyeliksiz, form doldurmadan sesli yapay zeka asistanı ile kurye çağırın"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/40 text-amber-200 flex items-center justify-center font-black shadow-md group-hover:scale-110 transition shrink-0 relative">
                  <Headphones className="w-5 h-5 text-white" />
                  <Mic className="w-3 h-3 text-amber-300 absolute -bottom-0.5 -right-0.5 fill-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-white text-sm sm:text-base">Üyeliksiz Kurye Çağır</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-400/25 text-amber-200 border border-amber-300/40 rounded font-bold uppercase animate-pulse">
                      Sesli 7/24
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/90 font-medium mt-0.5">
                    Formsuz sesli müşteri hizmetlerine bağlanın
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-200 group-hover:translate-x-1 transition shrink-0 hidden sm:block" />
            </button>
          </div>

          {/* Full-width "Geçmiş Teslimatlarım" Button */}
          <button
            type="button"
            id="customer-past-deliveries-button"
            onClick={() => {
              const el = document.getElementById('customer-past-deliveries-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="w-full py-3 px-4 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 hover:text-white border border-emerald-600/60 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            title="Geçmiş Teslimatları Görüntüle"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Geçmiş Teslimatlarım ({deliveredOrders.length})</span>
          </button>

          {/* Oturumu Kapat Butonu */}
          <div className="w-full">
            <button
              type="button"
              onClick={logout}
              className="w-full py-3 bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
              title="Müşteri Oturumunu Kapat"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Oturumu Kapat</span>
            </button>
          </div>
        </div>

        {/* ACTIVE ORDER LIVE TRACKING RADAR (if customer has active in-progress orders) */}
        {activeCustomerOrder && (
          <div className="space-y-4">
            {activeOrders.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeOrders.map((ord, idx) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => setSelectedActiveOrderId(ord.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer border ${
                      activeCustomerOrder.id === ord.id
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                        : 'bg-[#021813] text-emerald-300/80 border-emerald-800/60 hover:bg-[#03241d]'
                    }`}
                  >
                    <span>Paket #{idx + 1}</span>
                    <span className="font-mono text-[11px] opacity-80">({ord.trackingCode})</span>
                  </button>
                ))}
              </div>
            )}

            <div className="bg-gradient-to-br from-[#021f19] via-[#032920] to-[#011813] rounded-3xl border border-emerald-800/60 p-5 sm:p-7 shadow-2xl space-y-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600/80 text-emerald-200 border border-emerald-400/40 flex items-center justify-center font-extrabold text-base shadow-md">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider">Aktif Takip:</span>
                      <span className="font-mono font-extrabold text-amber-400 text-sm">{activeCustomerOrder.trackingCode}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {activeCustomerOrder.sender.district} ➔ {activeCustomerOrder.receiver.district}
                    </h3>
                  </div>
                </div>

                <div>
                  {activeCustomerOrder.status === 'pending_pool' && (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/80 text-amber-300 border border-amber-600/60 rounded-xl text-xs font-extrabold shadow-sm animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>Kurye Havuzunda Aranıyor</span>
                    </div>
                  )}
                  {activeCustomerOrder.status === 'courier_assigned' && (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-950/80 text-blue-300 border border-blue-600/60 rounded-xl text-xs font-extrabold shadow-sm">
                      <Bike className="w-4 h-4 text-blue-400" />
                      <span>Kurye Paketi Almaya Geliyor</span>
                    </div>
                  )}
                  {activeCustomerOrder.status === 'picked_up' && (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-teal-950/80 text-teal-300 border border-teal-600/60 rounded-xl text-xs font-extrabold shadow-sm">
                      <Package className="w-4 h-4 text-teal-400" />
                      <span>Paket Alındı, Teslimata Yolda</span>
                    </div>
                  )}
                  {activeCustomerOrder.status === 'near_destination' && (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-purple-950/80 text-purple-300 border border-purple-600/60 rounded-xl text-xs font-extrabold shadow-sm animate-bounce">
                      <Navigation className="w-4 h-4 text-purple-400" />
                      <span>Kurye Teslimat Noktasına Ulaştı</span>
                    </div>
                  )}
                </div>
              </div>

              {activeCustomerOrder.assignedCourier ? (
                <div className="space-y-2.5">
                  <AnimatedCourierSpeechBubble order={activeCustomerOrder} />
                  <div className="flex items-center justify-between gap-2 px-1 text-xs">
                    <span className="text-[11px] text-emerald-300/80 font-medium truncate">
                      Atanan Kurye: <strong className="text-white">{activeCustomerOrder.assignedCourier.name}</strong> ({activeCustomerOrder.assignedCourier.phone})
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmCancelModal(activeCustomerOrder)}
                      className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-700/60 font-semibold text-[11px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      title="Siparişinizi iptal edebilirsiniz"
                    >
                      <X className="w-3 h-3 text-rose-400" />
                      <span>İptal Et</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-3.5 text-xs text-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span>Talebiniz kurye havuzunda yayınlandı. Kuryelerden onay bekleniyor.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmCancelModal(activeCustomerOrder)}
                    className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-600/60 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-rose-400" />
                    <span>İptal Et</span>
                  </button>
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-emerald-950 h-2.5 rounded-full overflow-hidden border border-emerald-800/40">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700"
                  style={{
                    width:
                      activeCustomerOrder.status === 'pending_pool'
                        ? '25%'
                        : activeCustomerOrder.status === 'courier_assigned'
                        ? '50%'
                        : activeCustomerOrder.status === 'picked_up' || activeCustomerOrder.status === 'near_destination'
                        ? '75%'
                        : '100%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Past Deliveries List Section (Geçmiş Teslimatlar) */}
        <div id="customer-past-deliveries-section" className="bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border border-emerald-800/60 p-5 sm:p-7 shadow-2xl space-y-5 text-white">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Geçmiş Teslimatlarım ({deliveredOrders.length})
              </h2>
            </div>

            {/* Quick Search */}
            {deliveredOrders.length > 0 && (
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-emerald-400/80 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Kayıtlarda ara..."
                  className="w-full pl-9 pr-3.5 py-2 bg-[#011410] border border-emerald-700/60 rounded-xl text-xs text-white placeholder:text-emerald-600/70 outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          {deliveredOrders.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400/80 flex items-center justify-center mx-auto shadow-inner">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Henüz tamamlanmış bir teslimatınız bulunmuyor.</p>
                <p className="text-xs text-emerald-300/70 max-w-md mx-auto">
                  Antalya içi dilediğiniz adrese hemen paket göndermek için yukarıdaki <strong>Yeni Paket</strong> butonuna basınız.
                </p>
              </div>
              <button
                type="button"
                onClick={openQuickCourierModal}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>İlk Paketini Gönder</span>
              </button>
            </div>
          ) : filteredDeliveredOrders.length === 0 ? (
            <div className="text-center py-8 text-xs text-emerald-300/80">
              Aramanıza uygun geçmiş teslimat kaydı bulunamadı.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeliveredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 bg-[#011410]/90 rounded-2xl border border-emerald-800/50 hover:border-emerald-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {ord.trackingCode}
                      </span>
                      {getStatusBadge(ord.status)}
                      <span className="text-[11px] text-emerald-300/70">
                        {new Date(ord.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="text-white font-bold text-sm">
                      {ord.sender.district} ➔ {ord.receiver.district} ({ord.receiver.contactName})
                    </div>

                    <div className="text-emerald-300/80 text-[11px] flex items-center gap-2 flex-wrap">
                      <span>📦 {ord.packageName}</span>
                      <span>•</span>
                      <span>{ord.price} ₺ ({ord.paymentMethod === 'alici_odemeli' ? 'Alıcı Ödemeli' : 'Gönderici Ödemeli'})</span>
                      {ord.assignedCourier && (
                        <>
                          <span>•</span>
                          <span>🏍️ Kurye: {ord.assignedCourier.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Receipt & Details Button */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                    {ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => setConfirmCancelModal(ord)}
                        className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-700/60 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                        title="Talebi İptal Et"
                      >
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        <span>İptal Et</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptOrder(ord)}
                      className="px-3.5 py-2 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Fiş Görüntüle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Receipt Modal */}
        {selectedReceiptOrder && (
          <ReceiptModal
            order={selectedReceiptOrder}
            onClose={() => setSelectedReceiptOrder(null)}
          />
        )}

        {/* Cancellation Confirmation Modal for Scenario 2 */}
        {confirmCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-[#022019] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-700/60 space-y-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-900/60 text-rose-300 border border-rose-600/50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Siparişi İptal Et</h3>
                  <p className="text-xs text-rose-200/80">Bu kurye talebini iptal etmek istediğinize emin misiniz?</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#011410] rounded-xl border border-emerald-800/60 text-xs text-emerald-200 space-y-1.5">
                <p><strong>Takip No:</strong> {confirmCancelModal.trackingCode}</p>
                <p><strong>Güzergah:</strong> {confirmCancelModal.sender.district} ➔ {confirmCancelModal.receiver.district}</p>
                <p><strong>Alıcı:</strong> {confirmCancelModal.receiver.contactName}</p>
                {confirmCancelModal.assignedCourier ? (
                  <div className="p-2.5 bg-amber-950/60 border border-amber-600/50 rounded-lg text-amber-200 text-xs mt-2">
                    <p className="font-bold text-amber-300 flex items-center gap-1">
                      <span>⚠️ Kurye Atanmış Durumda:</span> {confirmCancelModal.assignedCourier.name}
                    </p>
                    <p className="text-[11px] text-amber-200/90 mt-0.5">
                      Kurye atanmış olsa bile siparişinizi iptal edebilirsiniz. Atanan kuryeye anında iptal bildirimi iletilecek ve teslimat görevi sistem tarafından iptal edilecektir.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-300/80 mt-1">
                    Sipariş havuzdan kaldırılacak ve kuryelere kapatılacaktır.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancelModal(null)}
                  className="px-4 py-2.5 rounded-xl text-emerald-300 hover:bg-emerald-900/40 font-bold text-xs cursor-pointer transition"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelRequest(confirmCancelModal.id);
                    setJustCancelledCode(confirmCancelModal.trackingCode);
                    setConfirmCancelModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition shadow-md"
                >
                  Evet, İptal Et
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Konyaaltı Panelvan Parça Eşya Taşıma (900 TL) Bölümü */}
        <PanelvanNakliyeSection className="mt-6" />

      </div>
    );
  }

  // =========================================================================
  // SCENARIO 3: GUEST / VISITOR VIEW
  // Clean Landing page without embedded forms; direct one-click action modals
  // =========================================================================
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-2 sm:p-4 space-y-6">
      
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/50 bg-gradient-to-br from-[#021d17] via-[#042820] to-[#011410] p-6 sm:p-10 lg:p-12 text-white relative">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          
          {/* Fiyat Bilgilendirme Rozeti (Ultra Çekici, Prestijli & Modern Tasarım) */}
          <div className="relative inline-block mx-auto group w-full max-w-2xl">
            {/* Ambient Multi-color Glowing Aura */}
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-500/30 via-emerald-400/40 to-yellow-400/30 blur-xl opacity-90 group-hover:opacity-100 transition duration-500 animate-pulse pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#021f19]/98 via-[#04362a]/98 to-[#02221a]/98 border-2 border-amber-400/80 shadow-2xl backdrop-blur-md">
              {/* Flame Icon + Pulse Badge */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 text-amber-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/40 shrink-0 transform group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
                </div>
                
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/50 text-amber-300 font-black text-[11px] uppercase tracking-wider shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>🔥 Fırsat Kampanyası</span>
                    </span>
                    <span className="text-[11px] text-emerald-300/90 font-semibold hidden sm:inline">
                      Şeffaf Mesafe Tarifesi • Gizli Ek Ücret Yok
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-black border border-emerald-400/70 text-xs sm:text-sm shadow-md flex items-center gap-1">
                      <span>📍 10 km'ye Kadar</span>
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight drop-shadow-md">
                      Sadece <span className="underline decoration-amber-400 decoration-2 underline-offset-4">100 ₺</span>'den Başlayan Fiyatlar!
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Sparkle Accent */}
              <div className="hidden md:flex flex-col items-end pl-3 border-l border-emerald-700/60 text-amber-300 text-xs font-bold gap-0.5 shrink-0">
                <div className="flex items-center gap-1 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-xs font-extrabold text-white whitespace-nowrap">30-45 Dk</span>
                </div>
                <span className="text-[10px] text-emerald-300/80 uppercase tracking-wider">Jet Moto Kurye</span>
              </div>
            </div>
          </div>

          {/* Main Headline for Google Search Ranking */}
          <div className="space-y-3.5">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Antalya Paket Gönder & Kurye Çağır
            </h1>
            <p className="text-base sm:text-lg font-medium text-emerald-300">
              7/24 Acil Moto Kurye • Muratpaşa, Konyaaltı, Kepez & Tüm Antalya
            </p>
            <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed max-w-2xl mx-auto">
              Antalya'da acil paket gönder, tek tıkla en yakın kuryeyi çağır. 30-45 dakikada jet motorlu kurye teslimatı, canlı radar takip ve alıcı/gönderici ödeme güvencesi.
            </p>
          </div>

          {/* 2 KURYE ÇAĞIRMA BUTONU (BİRİ ÜYELİKLİ, DİĞERİ ÜYELİKSİZ SESLİ ASİSTAN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto pt-2 text-left">
            {/* Buton 1: ÜYELİKLİ KURYE ÇAĞIRMA */}
            <button
              type="button"
              onClick={() => {
                if (currentUser && currentUser.role === 'customer' && currentUser.id !== 'user-guest-01') {
                  openQuickCourierModal();
                } else {
                  openAuthModal('login', 'Üyelikli kurye çağırmak, kayıtlı adreslerinizi kullanmak ve siparişlerinizi canlı takip etmek için lütfen giriş yapın veya kayıt olun.');
                }
              }}
              className="relative group p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white border-2 border-emerald-400/50 shadow-2xl shadow-emerald-950/70 hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer active:scale-98 flex flex-col justify-between overflow-hidden"
              title="Üyelikli kurye çağır: Kayıtlı adresler, geçmiş teslimatlar ve canlı radar takibi"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all"></div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition shrink-0">
                    <UserCheck className="w-6 h-6 text-emerald-200" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-100">
                    {isUserLoggedIn ? 'Giriş Yapıldı' : 'Üye Girişi / Kayıt'}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>Üyelikli Kurye Çağır</span>
                  </h2>
                  <p className="text-xs text-emerald-100/90 font-medium mt-1 leading-relaxed">
                    Kayıtlı adreslerinizle tek tıkla çağrı yapın, sipariş geçmişinizi görüntüleyin ve kuryeyi canlı radarla takip edin.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-emerald-500/30 flex items-center justify-between text-xs font-black text-emerald-100 group-hover:text-white relative z-10">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{isUserLoggedIn ? 'Kurye Çağır (Hızlı)' : 'Giriş Yap & Kurye Çağır'}</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Buton 2: ÜYELİKSİZ KURYE ÇAĞIRMA (DİREKT SESLİ MÜŞTERİ HİZMETLERİNE YÖNLENDİRİR) */}
            <button
              type="button"
              onClick={() => {
                openVoiceAssistant();
              }}
              className="relative group p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 hover:from-amber-400 hover:to-orange-500 text-white border-2 border-amber-300/60 shadow-2xl shadow-amber-950/70 hover:shadow-amber-500/40 transition-all duration-300 cursor-pointer active:scale-98 flex flex-col justify-between overflow-hidden"
              title="Üyeliksiz kurye çağır: Doğrudan sesli müşteri hizmetlerine bağlanın"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl group-hover:bg-amber-300/30 transition-all"></div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-200/40 flex items-center justify-center text-amber-200 shadow-md group-hover:scale-110 transition shrink-0 relative">
                    <Headphones className="w-6 h-6 text-white" />
                    <Mic className="w-3.5 h-3.5 text-amber-300 absolute -bottom-0.5 -right-0.5 fill-amber-300" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/25 border border-amber-300/50 text-amber-100 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                    <span>Sesli Asistan 7/24</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>Üyeliksiz Kurye Çağır</span>
                  </h2>
                  <p className="text-xs text-amber-100/90 font-medium mt-1 leading-relaxed">
                    Kayıt olmadan, form doldurmadan sesli müşteri hizmetlerimizle doğrudan konuşarak anında kurye çağırın.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-amber-400/30 flex items-center justify-between text-xs font-black text-amber-100 group-hover:text-white relative z-10">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Sesli Müşteri Hizmetlerine Bağlan</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* 4 Core Services Highlight (Google Target Keywords) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 text-left">
            <div 
              onClick={() => {
                if (currentUser && currentUser.role === 'customer' && currentUser.id !== 'user-guest-01') {
                  openQuickCourierModal();
                } else {
                  openAuthModal('login', 'Paket göndermek için lütfen müşteri girişi yapınız.');
                }
              }}
              className="p-4 rounded-2xl bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-700/50 hover:border-emerald-500 space-y-1 shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Antalya Paket Gönder</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-normal">
                Evrak, koli, anahtar, çiçek ve hediyelikleri kapınızdan alıp Antalya içi dilediğiniz adrese teslim ediyoruz.
              </p>
            </div>

            <div 
              onClick={() => {
                openVoiceAssistant();
              }}
              className="p-4 rounded-2xl bg-emerald-950/70 hover:bg-emerald-950/90 border border-amber-500/50 hover:border-amber-400 space-y-1 shadow-sm transition cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Headphones className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                <span>Üyeliksiz Kurye (Sesli)</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-normal">
                Kayıt olmadan tek tıkla sesli yapay zeka asistanımıza bağlanın, adresinizi söyleyerek kurye çağırın.
              </p>
            </div>

            <div 
              onClick={() => {
                if (currentUser && currentUser.role === 'customer' && currentUser.id !== 'user-guest-01') {
                  openQuickCourierModal();
                } else {
                  openAuthModal('login', 'Acil paket göndermek için lütfen müşteri girişi yapınız.');
                }
              }}
              className="p-4 rounded-2xl bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-700/50 hover:border-teal-500 space-y-1 shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>30-45 Dk Jet Kurye</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-normal">
                Gecikmeye tahammülü olmayan gönderileriniz için 30-45 dakikada süper ekspres jet teslimat.
              </p>
            </div>

            {/* 4th Card: Panelvan Parça Eşya Taşıma 900 TL */}
            <div 
              onClick={() => {
                const el = document.getElementById('panelvan-nakliye');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.open('https://wa.me/905077547484?text=Merhaba,%20Konyaalt%C4%B1%20panelvan%20par%C3%A7a%20e%C5%9Fya%20ta%C5%9F%C4%B1ma%20(900%20TL)%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.', '_blank');
                }
              }}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 to-[#1e1104] hover:from-amber-900/90 hover:to-[#2e1906] border-2 border-amber-500/70 hover:border-amber-400 space-y-1 shadow-md transition cursor-pointer group"
              title="Konyaaltı Panelvan Uygun Nakliye (900 ₺)"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-black text-sm">
                  <Truck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                  <span>Panelvan Nakliye</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 font-black border border-amber-300/40">
                  900 ₺
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-normal">
                Konyaaltı parça eşya, koli, bavul ve beyaz eşya uygun nakliye. (Toplu ev eşyası taşınmaz).
              </p>
            </div>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-300 block">⚡ Jet Teslimat</span>
              <span className="text-[11px] text-emerald-200/70 block">30-45 Dakika</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-300 block">🛡️ Güvenli Taşıma</span>
              <span className="text-[11px] text-emerald-200/70 block">Teyitli Teslimat</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-300 block">📍 Canlı Radar</span>
              <span className="text-[11px] text-emerald-200/70 block">Haritada Takip</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-xs font-bold text-amber-300 block">💳 Kolay Ödeme</span>
              <span className="text-[11px] text-emerald-200/70 block">Alıcı / Gönderici</span>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-800/40">
            <p className="text-xs text-emerald-400/70">
              © 2026 Antalya Şehir İçi Teslimat 7/24 — Muratpaşa • Kepez • Konyaaltı • Lara
            </p>
          </div>

        </div>
      </div>

      {/* DEDICATED PANELVAN PARÇA EŞYA TAŞIMA & KONYAALTI UYGUN NAKLİYE BÖLÜMÜ */}
      <PanelvanNakliyeSection className="w-full mt-4" />

      {/* ========================================================================= */}
      {/* GOOGLE SEO & DISTRICTS LANDING SECTION */}
      {/* Targets: "Antalya kurye cagir, paket gonder, acil kurye, konyaalti, muratpasa, kepez kurye" */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl space-y-6 pt-4 text-white">
        
        {/* SEO Header & Keyword Intro */}
        <div className="text-center space-y-2 px-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Antalya Kurye Çağır & Şehir İçi Hızlı Paket Gönder
          </h2>
          <p className="text-xs sm:text-sm text-emerald-300/80 max-w-2xl mx-auto leading-relaxed">
            Antalya içi <strong>Muratpaşa</strong>, <strong>Konyaaltı</strong>, <strong>Kepez</strong> ve tüm çevre ilçelerde 30-45 dakikada acil moto kurye teslimatı. Canlı radar takip ve alıcı ödemeli güvenli gönderim.
          </p>
        </div>

        {/* District SEO Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Muratpaşa Kurye */}
          <article className="p-5 rounded-2xl bg-[#02231c] border border-emerald-800/60 shadow-lg space-y-3 hover:border-emerald-500/50 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
                01
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Muratpaşa Kurye</h3>
                <span className="text-[11px] text-emerald-400 font-medium">Lara • Şirinyalı • Fener • Meltem</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/75 leading-relaxed">
              Muratpaşa ve Lara bölgesinde acil evrak, medikal paket, anahtar ve kargo teslimatları ortalama 25-35 dakikada kapınızda.
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">Lara Kurye</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">Işıklar</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">Meydankavağı</span>
            </div>
          </article>

          {/* Konyaaltı Kurye */}
          <article className="p-5 rounded-2xl bg-[#02231c] border border-emerald-800/60 shadow-lg space-y-3 hover:border-emerald-500/50 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/40">
                02
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Konyaaltı Kurye</h3>
                <span className="text-[11px] text-amber-300 font-medium">Liman • Hurma • Uncalı • Altınkum</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/75 leading-relaxed">
              Konyaaltı sahil ve iç mahallelerinde 7/24 nöbetçi moto kurye. Gürsu, Toros ve Sarısu bölgelerine anında hızlı paket gönderimi.
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-200 border border-amber-800/50">Liman Kurye</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-200 border border-amber-800/50">Hurma</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-200 border border-amber-800/50">Uncalı</span>
            </div>
          </article>

          {/* Kepez Kurye */}
          <article className="p-5 rounded-2xl bg-[#02231c] border border-emerald-800/60 shadow-lg space-y-3 hover:border-emerald-500/50 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/40">
                03
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Kepez Kurye</h3>
                <span className="text-[11px] text-teal-300 font-medium">Dokuma • Varsak • Kültür • Sanayi</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/75 leading-relaxed">
              Kepez, Fabrikalar, Gülveren ve Akdeniz Üniversitesi çevresinde öğrenci ve işletmelere özel ekonomik ve jet moto kurye çözümleri.
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-200 border border-teal-800/50">Dokuma Kurye</span>
              <span className="px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-200 border border-teal-800/50">Varsak</span>
              <span className="px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-200 border border-teal-800/50">Kültür</span>
            </div>
          </article>

        </div>

        {/* SEO FAQ & Key Features */}
        <div className="p-6 rounded-3xl bg-[#021d17] border border-emerald-800/50 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Antalya Paket Gönder, Kurye Çağır & Acil Teslimat SSS</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold text-emerald-300">📦 Antalya paket gönder: Paketimi nasıl gönderebilirim?</h4>
              <p className="text-slate-300 leading-relaxed">
                Web sitemizde 2 farklı seçenek sunulur: İster <strong>'Üyelikli Kurye Çağır'</strong> ile kayıtlı adreslerinizden hızlıca çağırabilir, isterseniz form doldurmadan <strong>'Üyeliksiz Kurye Çağır'</strong> butonuna basarak doğrudan 7/24 Sesli Müşteri Hizmetlerimizle konuşarak kuryenizi adresinize yönlendirebilirsiniz.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold text-emerald-300">🏍️ Kurye çağır: Antalya'da moto kurye nasıl çağrılır?</h4>
              <p className="text-slate-300 leading-relaxed">
                Antalya içi Muratpaşa, Konyaaltı veya Kepez'de bulunduğunuz konuma tek dokunuşla moto kurye çağırabilirsiniz. Talebiniz anında bölgedeki aktif moto kurye havuzumuza düşer.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold text-emerald-300">⚡ Acil paket gönder: Teslimat kaç dakikada adrese ulaşır?</h4>
              <p className="text-slate-300 leading-relaxed">
                Acil paket gönderimlerinizde şehir içi ortalama teslimat süresi 30 ile 45 dakikadır. Canlı radar ekranımızdan kuryenizin paketle olan hareketini haritada anlık izleyebilirsiniz.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold text-emerald-300">💳 Alıcı ödemeli paket gönderebilir miyim?</h4>
              <p className="text-slate-300 leading-relaxed">
                Evet! Sipariş oluştururken 'Alıcı Ödemeli' seçeneğini seçtiğinizde teslimat ücreti paket teslim edilirken alıcıdan tahsil edilir.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold text-emerald-300">🌙 Gece nöbetçi kurye var mı?</h4>
              <p className="text-slate-300 leading-relaxed">
                Antalya Teslimat 7/24 kesintisiz çalışır. Gece saatlerinde de kurye havuzumuz üzerinden acil paket ve evrak transferi yapabilirsiniz.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold text-emerald-300">📍 Hangi ilçelere kurye ve paket gönderimi yapılıyor?</h4>
              <p className="text-slate-300 leading-relaxed">
                Muratpaşa, Kepez, Konyaaltı ve Lara bölgelerine kesintisiz 7/24 moto kurye ve hızlı teslimat hizmeti verilmektedir.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-[#021f19] border border-amber-500/50 col-span-1 md:col-span-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <span>🚚 Konyaaltı Panelvan Parça Eşya Taşıma (900 ₺) nasıl işler?</span>
              </h4>
              <p className="text-slate-200 leading-relaxed">
                Konyaaltı'nda tekli beyaz eşya, koli, valiz, bekar veya öğrenci eşyası gibi parça yüklerinizi panelvan aracımızla <strong>900 ₺</strong>'den başlayan uygun fiyatla taşıyoruz. <strong>Önemli Kural:</strong> Toplu komple ev eşyası taşınmamaktadır; sadece panelvan araca sığabilecek parça eşyalar taşınır. WhatsApp üzerinden <strong>0507 754 74 84</strong> hattımıza eşyanızın fotoğrafını göndererek sığıp sığmayacağını teyit edebilir ve anında randevu oluşturabilirsiniz.
              </p>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
