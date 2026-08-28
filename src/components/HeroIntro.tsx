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
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { UserRole, DistrictName, DeliveryRequest } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';

export const HeroIntro: React.FC = () => {
  const {
    setCurrentView,
    currentUser,
    setCurrentUser,
    loginUser,
    switchUser,
    switchRole,
    users,
    registerUser,
    requests,
    setSelectedTrackingId,
    cancelRequest,
  } = useDelivery();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [confirmCancelModal, setConfirmCancelModal] = useState<DeliveryRequest | null>(null);

  // Active order for customer
  const activeCustomerOrder = requests.find(
    (r) =>
      (r.senderUserId === currentUser.id || r.sender.contactPhone === currentUser.phone) &&
      r.status !== 'delivered' &&
      r.status !== 'cancelled'
  ) || (currentUser.role === 'customer' && requests.length > 0 && requests[0].status !== 'delivered' && requests[0].status !== 'cancelled' ? requests[0] : null);

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
  const [regVehicle, setRegVehicle] = useState('Honda Activa - 07 MTO 01');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Quick Login for existing demo roles with verified credentials
  const handleQuickRoleLogin = (role: UserRole) => {
    setLoginError(null);
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setEmail(targetUser.email || targetUser.phone);
      setPassword(targetUser.password || '123456');
      const res = loginUser(targetUser.email || targetUser.phone, targetUser.password || '123456');
      if (res.success && res.user) {
        setLoginSuccess(`Hoş geldiniz, ${res.user.name}!`);
        setTimeout(() => {
          setLoginSuccess(null);
          if (role === 'customer') setCurrentView('customer');
          else if (role === 'courier') setCurrentView('courier');
          else setCurrentView('history');
        }, 500);
      }
    } else {
      switchRole(role);
      setLoginSuccess(`Giriş yapıldı.`);
      setTimeout(() => {
        setLoginSuccess(null);
        if (role === 'customer') setCurrentView('customer');
        else if (role === 'courier') setCurrentView('courier');
        else setCurrentView('history');
      }, 500);
    }
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
          setCurrentView('customer');
        } else if (u.role === 'courier') {
          setCurrentView('courier');
        } else {
          setCurrentView('history');
        }
      }, 600);
    } else {
      setLoginError(res.message || 'Giriş yapılamadı. E-posta ve şifrenizi kontrol ediniz.');
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
    if (!regPassword.trim()) {
      setRegError('Lütfen hesabınız için bir şifre belirleyiniz.');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Şifreniz en az 4 karakter uzunluğunda olmalıdır.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('Belirlediğiniz şifreler birbiriyle eşleşmiyor. Lütfen kontrol ediniz.');
      return;
    }

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setRegError('Bu e-posta adresi ile kayıtlı bir hesap zaten var. Lütfen giriş yapınız.');
      return;
    }

    const newUser = registerUser({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim() || '0532 000 00 00',
      password: regPassword.trim(),
      role: regRole,
      district: regDistrict,
      companyName: regRole === 'customer' ? regCompany.trim() || undefined : undefined,
      vehicleInfo: regRole === 'courier' ? regVehicle.trim() || undefined : undefined,
    });

    setRegSuccess(`Tebrikler ${newUser.name}! Hesabınız oluşturuldu ve giriş yapıldı.`);
    setTimeout(() => {
      setRegSuccess(null);
      if (newUser.role === 'customer') {
        setCurrentView('customer');
      } else {
        setCurrentView('courier');
      }
    }, 800);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/50 grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-[#021d17] via-[#042820] to-[#011410]">
        
        {/* LEFT / TOP DARK SECTION (Matching screenshots exactly) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

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

            {/* Main Headline & Paragraph */}
            <div className="space-y-3.5 pt-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Paketlerinizi hızlı ve güvenli şekilde gönderin
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-xl">
                Talebinizi oluşturun, kurye havuzuna düşsün. Size en yakın kurye paketinizi seçip teslimatınızı gerçekleştirsin.
              </p>
            </div>

            {/* Active Order Card or 3 Feature Bullets */}
            {activeCustomerOrder ? (
              <div className="space-y-3 pt-2">
                <div className={`p-5 rounded-3xl border shadow-xl transition-all space-y-4 ${
                  activeCustomerOrder.status === 'courier_assigned' || activeCustomerOrder.status === 'picked_up'
                    ? 'bg-gradient-to-br from-[#011a15] via-[#022a21] to-[#011410] border-emerald-500/50 text-white shadow-emerald-500/10'
                    : 'bg-gradient-to-br from-[#011a15] via-[#03231c] to-[#011410] border-emerald-700/40 text-white'
                }`}>
                  {/* Status header with pulse */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute"></span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">Canlı Aktif Siparişiniz</span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-white">
                          {activeCustomerOrder.status === 'pending_pool' && '🛵 Havuzda Kurye Aranıyor...'}
                          {activeCustomerOrder.status === 'courier_assigned' && '🎉 Kurye Talebinizi Kabul Etti!'}
                          {activeCustomerOrder.status === 'picked_up' && '📦 Paket Alındı, Teslimata Gidiyor'}
                        </h4>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black bg-white/15 px-2.5 py-1 rounded-lg border border-white/20">
                      {activeCustomerOrder.trackingCode}
                    </span>
                  </div>

                  {/* Courier details if accepted */}
                  {activeCustomerOrder.assignedCourier ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-600/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                          <Bike className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{activeCustomerOrder.assignedCourier.name}</span>
                            <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1 py-0.2 rounded font-semibold">Kurye</span>
                          </div>
                          <p className="text-[11px] text-emerald-200/80">
                            {activeCustomerOrder.assignedCourier.vehicleType} • <span className="font-mono">{activeCustomerOrder.assignedCourier.plate}</span>
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${activeCustomerOrder.assignedCourier.phone}`}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs shrink-0"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Ara</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-emerald-200/80">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                      <span>Antalya moto kurye havuzunda en yakın sürücüyle eşleşiyor...</span>
                    </div>
                  )}

                  {/* Animated step bar */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-semibold">
                      <span className={activeCustomerOrder.status === 'pending_pool' ? 'text-amber-400 font-bold' : 'text-emerald-400/70'}>Havuzda</span>
                      <span className={activeCustomerOrder.status === 'courier_assigned' ? 'text-emerald-300 font-bold' : 'text-emerald-400/70'}>Kurye Yolda</span>
                      <span className={activeCustomerOrder.status === 'picked_up' ? 'text-teal-300 font-bold' : 'text-emerald-400/70'}>Teslimat</span>
                    </div>
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                        style={{
                          width:
                            activeCustomerOrder.status === 'pending_pool'
                              ? '33%'
                              : activeCustomerOrder.status === 'courier_assigned'
                              ? '66%'
                              : '100%',
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmCancelModal(activeCustomerOrder)}
                      className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>İptal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrackingId(activeCustomerOrder.id);
                        setCurrentView('tracker');
                      }}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Canlı Haritada İzle ➔</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* 3 Feature Bullets */
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-emerald-100">
                    Tek tıkla paket talebi oluştur
                  </span>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-emerald-100">
                    Kurye havuzundan otomatik eşleşme
                  </span>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-emerald-100">
                    Anlık takip ve durum bildirimleri
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer inside Left Section */}
          <div className="pt-8 relative z-10">
            <p className="text-xs text-emerald-400/70">
              © 2026 Antalya Kurye — Tüm hakları saklıdır
            </p>
          </div>
        </div>

        {/* RIGHT / BOTTOM DARK GREEN FORM CARD (Matching screenshots exactly) */}
        <div className="lg:col-span-5 bg-[#03231d] border-t lg:border-t-0 lg:border-l border-emerald-800/50 p-6 sm:p-10 flex flex-col justify-center shadow-xl text-white">
          {mode === 'login' ? (
            /* LOGIN VIEW */
            <div className="w-full max-w-sm mx-auto space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Hoş geldiniz
                </h2>
                <p className="text-sm text-emerald-300/80 mt-1">
                  Devam etmek için giriş yapın
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* E-posta */}
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

                {/* Şifre */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-emerald-200">
                      Şifre
                    </label>
                    <span className="text-[10px] text-emerald-400/70 font-mono">Demo: 123456</span>
                  </div>
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

                {/* Login Errors / Success */}
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

                {/* Giriş Yap Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-98 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick Role Selection Shortcut */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px bg-emerald-800/60 flex-1"></div>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Hızlı Rol Seçimi</span>
                    <div className="h-px bg-emerald-800/60 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickRoleLogin('customer')}
                      className="p-2 rounded-xl bg-[#021813] hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Müşteri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRoleLogin('courier')}
                      className="p-2 rounded-xl bg-[#021813] hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Bike className="w-3.5 h-3.5 text-amber-400" />
                      <span>Moto Kurye</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRoleLogin('admin')}
                      className="p-2 rounded-xl bg-[#021813] hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-teal-400" />
                      <span>Yönetici</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Toggle to Register */}
              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-emerald-300/80">
                  Hesabınız yok mu?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setLoginError(null);
                    }}
                    className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Kayıt olun
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* REGISTER VIEW */
            <div className="w-full max-w-sm mx-auto space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Kayıt Olun
                </h2>
                <p className="text-sm text-emerald-300/80 mt-0.5">
                  Antalya Kurye sistemine katılın
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                {/* Role selection */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#021813] rounded-xl border border-emerald-800/60">
                  <button
                    type="button"
                    onClick={() => setRegRole('customer')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      regRole === 'customer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    Müşteri (Gönderici)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('courier')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      regRole === 'courier'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-300/70 hover:text-white'
                    }`}
                  >
                    Moto Kurye (Taşıyıcı)
                  </button>
                </div>

                {/* Ad Soyad */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-emerald-200">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-medium"
                    />
                  </div>
                </div>

                {/* E-posta */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-emerald-200">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-medium"
                    />
                  </div>
                </div>

                {/* Telefon */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-emerald-200">
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0532 123 45 67"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-medium"
                    />
                  </div>
                </div>

                {/* İlçe */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-emerald-200">
                    Antalya İlçesi
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value as DistrictName)}
                    className="w-full px-3 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-medium cursor-pointer"
                  >
                    {Object.values(ANTALYA_DISTRICTS).map((d) => (
                      <option key={d.name} value={d.name} className="bg-[#021813] text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Şifre */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-emerald-200">
                      Şifre
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-medium font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-emerald-200">
                      Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      required
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-[#021813] border border-emerald-700/60 rounded-xl text-xs text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Error/Success */}
                {regError && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-600/60 text-rose-200 rounded-xl text-xs font-medium">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </button>
              </form>

              {/* Toggle to Login */}
              <div className="text-center pt-1">
                <p className="text-xs text-emerald-300/80">
                  Zaten hesabınız var mı?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRegError(null);
                    }}
                    className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Giriş yapın
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Modal for Customer Cancellation */}
      {confirmCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#02241d] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-700/60 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-950/80 border border-rose-600/40 text-rose-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Siparişi İptal Et</h3>
                <p className="text-xs text-emerald-400/80">{confirmCancelModal.trackingCode} numaralı talebiniz</p>
              </div>
            </div>

            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Bu siparişi iptal etmek istediğinizden emin misiniz? Sipariş kurye havuzundan kaldırılacaktır.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelModal(null)}
                className="px-4 py-2.5 rounded-xl text-emerald-300 hover:bg-emerald-900/60 font-bold text-xs cursor-pointer transition border border-emerald-800/40"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelRequest(confirmCancelModal.id);
                  setConfirmCancelModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm"
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
