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
  Star,
  Sparkles,
  Search,
  History,
  FileText
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { UserRole, DistrictName, DeliveryRequest, DeliveryStatus } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';
import { ReceiptModal } from './ReceiptModal';

export const HeroIntro: React.FC = () => {
  const {
    setCurrentView,
    currentUser,
    loginUser,
    registerUser,
    requests,
    setSelectedTrackingId,
    cancelRequest,
    acceptRequest,
    openAuthModal,
    rateDelivery,
  } = useDelivery();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [confirmCancelModal, setConfirmCancelModal] = useState<DeliveryRequest | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedActiveOrderId, setSelectedActiveOrderId] = useState<string | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [hideDeliveredCard, setHideDeliveredCard] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<DeliveryRequest | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Restore last customer order ID & contact phone from persistent storage
  const lastSavedOrderId = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_order_id') : null;
  const lastSavedPhone = typeof window !== 'undefined' ? localStorage.getItem('ant_last_customer_phone') : null;

  // Active customer orders (cross-session & cross-device matching)
  const customerOrders = requests.filter(
    (r) =>
      r &&
      r.status !== 'cancelled' &&
      (r.id === lastSavedOrderId ||
        r.senderUserId === currentUser.id ||
        (Boolean(currentUser.phone) && r.sender?.contactPhone === currentUser.phone) ||
        (Boolean(lastSavedPhone) && r.sender?.contactPhone === lastSavedPhone) ||
        (currentUser.id === 'user-guest-01' && Boolean(r.senderUserId?.startsWith('user-cust-'))) ||
        currentUser.role === 'admin')
  );

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

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('customer');
  const [regDistrict, setRegDistrict] = useState<DistrictName>('Muratpaşa');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Handle Strict Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const cleanInput = email.trim();
    if (!cleanInput) {
      setLoginError('Lütfen e-posta veya telefon numaranızı giriniz.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Lütfen hesabınızın şifresini giriniz.');
      return;
    }

    const res = loginUser(cleanInput, password.trim());
    if (res.success && res.user) {
      const u = res.user;
      setLoginSuccess(`Giriş başarılı! Hoş geldiniz, ${u.name}.`);
      setTimeout(() => {
        setLoginSuccess(null);
        if (u.role === 'customer') {
          setCurrentView('home');
        } else if (u.role === 'courier') {
          setCurrentView('courier');
        } else if (u.role === 'admin') {
          setCurrentView('admin');
        }
      }, 500);
    } else {
      setLoginError(res.error || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    }
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError('Lütfen ad ve soyadınızı giriniz.');
      return;
    }

    if (!regEmail.trim()) {
      setRegError('Lütfen e-posta adresinizi giriniz.');
      return;
    }

    if (!regPhone.trim()) {
      setRegError('Lütfen telefon numaranızı giriniz.');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setRegError('Şifreniz en az 4 karakter olmalıdır.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    const newUser = registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      role: regRole,
      district: regDistrict,
      company: regCompany.trim() || undefined,
      password: regPassword.trim(),
    });

    setRegSuccess('Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
    setTimeout(() => {
      setRegSuccess(null);
      if (newUser.role === 'customer') {
        setCurrentView('home');
      } else {
        setCurrentView('courier');
      }
    }, 800);
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

  const isUserLoggedIn = currentUser.id !== 'user-guest-01' && Boolean(currentUser.email);

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
  // SCENARIO 1: CUSTOMER HAS ACTIVE ORDER(S)
  // Clean, focused single view with ONLY active order radar & "+ Yeni Paket" button
  // =========================================================================
  if (activeCustomerOrder) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        
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

          {/* Primary "+ Yeni Paket" Button */}
          <button
            type="button"
            onClick={() => setCurrentView('customer')}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Paket</span>
          </button>
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

          {/* Assigned Courier Banner (if assigned) */}
          {activeCustomerOrder.assignedCourier ? (
            <div className="bg-[#022e23] border border-emerald-700/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                  {activeCustomerOrder.assignedCourier.name.split(' ')[0][0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{activeCustomerOrder.assignedCourier.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold">
                      ⭐ {activeCustomerOrder.assignedCourier.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-emerald-300/90 text-[11px] font-medium">
                    🏍️ {activeCustomerOrder.assignedCourier.vehiclePlate || '07 KUR 34'} • {activeCustomerOrder.assignedCourier.phone}
                  </p>
                </div>
              </div>

              {activeCustomerOrder.assignedCourier.phone && (
                <a
                  href={`tel:${activeCustomerOrder.assignedCourier.phone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Kuryeyi Ara</span>
                </a>
              )}
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
              <span className={activeCustomerOrder.status === 'pending_pool' ? 'text-amber-400 font-black' : 'text-emerald-400'}>
                1. Talep Alındı
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
            {activeCustomerOrder.status === 'pending_pool' && (
              <button
                type="button"
                onClick={() => setConfirmCancelModal(activeCustomerOrder)}
                className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <X className="w-4 h-4" />
                <span>Talebi İptal Et</span>
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

              <div className="p-3 bg-[#011410] rounded-xl border border-emerald-800/60 text-xs text-emerald-200">
                <p><strong>Takip No:</strong> {confirmCancelModal.trackingCode}</p>
                <p><strong>Alıcı:</strong> {confirmCancelModal.receiver.contactName} ({confirmCancelModal.receiver.district})</p>
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
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Animated "Siparişiniz Teslim Edildi" Celebration Section */}
        {deliveredOrderToCelebrate && !hideDeliveredCard && (
          <div className="w-full bg-gradient-to-br from-[#023125] via-[#044434] to-[#011d15] rounded-3xl border-2 border-emerald-400 p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 shrink-0 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black uppercase tracking-wider">
                      Teslimat Tamamlandı
                    </span>
                    <span className="font-mono text-xs text-amber-300 font-bold">
                      {deliveredOrderToCelebrate.trackingCode}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    🎉 Siparişiniz Başarıyla Teslim Edildi!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5">
                    Paketiniz kuryemiz tarafından alıcıya güvenle teslim edilmiştir.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHideDeliveredCard(true)}
                className="p-1.5 text-emerald-400 hover:text-white transition cursor-pointer"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivered Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#011611]/90 rounded-2xl border border-emerald-700/60 text-xs">
              <div>
                <span className="text-emerald-400/80 font-semibold block text-[11px]">Teslim Eden Kurye:</span>
                <span className="text-white font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                  <Bike className="w-4 h-4 text-emerald-400" />
                  {deliveredOrderToCelebrate.assignedCourier?.name || 'Ahmet Yılmaz (Kurye)'}
                </span>
              </div>
              <div>
                <span className="text-emerald-400/80 font-semibold block text-[11px]">Teslim Adresi:</span>
                <span className="text-white font-bold block mt-0.5">
                  {deliveredOrderToCelebrate.receiver.district} - {deliveredOrderToCelebrate.receiver.contactName}
                </span>
              </div>
              <div>
                <span className="text-emerald-400/80 font-semibold block text-[11px]">Paket Bilgisi:</span>
                <span className="text-amber-300 font-bold block mt-0.5">
                  📦 {deliveredOrderToCelebrate.packageName} ({deliveredOrderToCelebrate.price} ₺)
                </span>
              </div>
            </div>

            {/* Quick Rating Bar & New Order Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 border-t border-emerald-800/60">
              <div className="w-full sm:w-auto">
                {ratingSubmitted ? (
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs bg-emerald-950/90 px-4 py-2 rounded-xl border border-emerald-700/60">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Kurye değerlendirmeniz kaydedildi. Teşekkür ederiz!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-200 font-bold">Kuryeyi Puanla:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setRatingVal(star);
                            rateDelivery(deliveredOrderToCelebrate.id, star, 'Müşteri ana sayfa puanı');
                            setRatingSubmitted(true);
                          }}
                          className={`p-1 transition cursor-pointer hover:scale-125 ${
                            star <= ratingVal ? 'text-amber-400' : 'text-slate-600'
                          }`}
                          title={`${star} Yıldız`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('customer')}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Paket</span>
              </button>
            </div>
          </div>
        )}

        {/* Customer Dashboard Action Bar */}
        <div className="bg-gradient-to-r from-[#02231c] via-[#043328] to-[#021f18] p-5 sm:p-6 rounded-3xl border border-emerald-800/60 shadow-xl text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/80 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                Müşteri Paneli
              </h1>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Hoş geldiniz, <span className="text-white font-bold">{currentUser.name}</span>. Yeni bir kurye çağırabilir veya geçmiş siparişlerinizi inceleyebilirsiniz.
              </p>
            </div>
          </div>

          {/* New Package Button */}
          <button
            type="button"
            onClick={() => setCurrentView('customer')}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm rounded-2xl transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Paket</span>
          </button>
        </div>

        {/* Past Deliveries List Section (Eski Teslimatlar) */}
        <div className="bg-gradient-to-br from-[#021f19] via-[#032a21] to-[#011813] rounded-3xl border border-emerald-800/60 p-5 sm:p-7 shadow-2xl space-y-5 text-white">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Eski Teslimatlarım ({deliveredOrders.length})
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
                onClick={() => setCurrentView('customer')}
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
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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

      </div>
    );
  }

  // =========================================================================
  // SCENARIO 3: GUEST / VISITOR VIEW
  // Clean Landing page with login/registration form for non-logged in users
  // =========================================================================
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-2 sm:p-4 space-y-6">
      
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/50 grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-[#021d17] via-[#042820] to-[#011410]">
        
        {/* LEFT SECTION */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            
            {/* Logo and Brand Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Antalya Kurye</h2>
                <p className="text-xs sm:text-sm text-emerald-300/80">Paket Teslimat Sistemi</p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-3.5 pt-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Paketlerinizi hızlı ve güvenli şekilde gönderin
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-xl">
                Talebinizi oluşturun, kurye havuzuna düşsün. Size en yakın kurye paketinizi seçip teslimatınızı gerçekleştirsin.
              </p>
            </div>

            {/* Primary Action Button: "Hemen Kurye Çağır" */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  openAuthModal('login', 'Kurye talebi oluşturmak için lütfen üye girişi yapınız veya ücretsiz kayıt olunuz.');
                }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-base rounded-2xl transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 cursor-pointer active:scale-98"
              >
                <Plus className="w-5 h-5" />
                <span>Hemen Yeni Kurye Çağır</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Simple Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-xs font-bold text-emerald-300 block">⚡ Jet Teslimat</span>
                <span className="text-[11px] text-emerald-200/70">30-45 Dakika</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-xs font-bold text-emerald-300 block">🛡️ Güvenli Taşıma</span>
                <span className="text-[11px] text-emerald-200/70">Teyitli & Korumalı</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-xs font-bold text-emerald-300 block">📍 Canlı Radar</span>
                <span className="text-[11px] text-emerald-200/70">Anlık Takip</span>
              </div>
            </div>
          </div>

          <div className="pt-8 relative z-10">
            <p className="text-xs text-emerald-400/70">
              © 2026 Antalya Kurye — Tüm hakları saklıdır
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN/REGISTER CARD */}
        <div className="lg:col-span-5 bg-[#03231d] border-t lg:border-t-0 lg:border-l border-emerald-800/50 p-6 sm:p-10 flex flex-col justify-center shadow-xl text-white">
          {mode === 'login' ? (
            <div className="w-full max-w-sm mx-auto space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Hoş geldiniz
                </h2>
                <p className="text-sm text-emerald-300/80 mt-1">
                  Müşteri veya kurye hesabınıza giriş yapın
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-emerald-200">
                    E-posta veya Telefon
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="ornek@email.com"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#021813] border border-emerald-700/60 rounded-xl text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition placeholder:text-emerald-600/60 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-emerald-200">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-[#021813] border border-emerald-700/60 rounded-xl text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition placeholder:text-emerald-600/60 font-medium font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-emerald-400/70 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-600/60 text-rose-200 rounded-xl text-xs font-medium">
                    {loginError}
                  </div>
                )}

                {loginSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{loginSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </button>
              </form>

              <div className="pt-2 text-center border-t border-emerald-800/40">
                <p className="text-xs text-emerald-300/80">
                  Hesabınız yok mu?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setLoginError(null);
                    }}
                    className="font-bold text-white hover:underline cursor-pointer ml-1"
                  >
                    Hemen Kayıt Olun
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Hesap Oluştur</h2>
                <p className="text-xs text-emerald-300/80 mt-1">Hızlıca kayıt olup gönderi oluşturun</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">Hesap Türü</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('customer')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        regRole === 'customer'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-[#021813] text-emerald-300 border-emerald-800/60'
                      }`}
                    >
                      Müşteri
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('courier')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        regRole === 'courier'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-[#021813] text-emerald-300 border-emerald-800/60'
                      }`}
                    >
                      Kurye
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">E-posta</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ornek@mail.com"
                      className="w-full px-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">Telefon</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">Şifre</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">Şifre Tekrar</label>
                    <input
                      type="password"
                      required
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                </div>

                {regError && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-600/60 text-rose-200 rounded-xl text-xs">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kayıt Ol & Giriş Yap</span>
                </button>
              </form>

              <div className="pt-2 text-center border-t border-emerald-800/40">
                <p className="text-xs text-emerald-300/80">
                  Zaten hesabınız var mı?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRegError(null);
                    }}
                    className="font-bold text-white hover:underline cursor-pointer ml-1"
                  >
                    Giriş Yapın
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
