import React, { useState } from 'react';
import { 
  User, 
  Bike, 
  LogIn, 
  UserPlus, 
  X, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, UserRole } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    authModalNotice,
    loginUser,
    registerUser,
    switchUser,
    setCurrentView,
  } = useDelivery();

  // Mode selectors
  const isCourierFlow = authModalTab === 'courier_login' || authModalTab === 'courier_register';
  const isAdminFlow = authModalTab === 'admin_login';
  const isRegister = authModalTab === 'register' || authModalTab === 'courier_register';

  // Common Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Customer Register Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState<DistrictName>('Muratpaşa');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerPasswordConfirm, setCustomerPasswordConfirm] = useState('');
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSuccess, setCustomerSuccess] = useState<string | null>(null);

  // Courier Register Form State
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierVehicle, setCourierVehicle] = useState('Motosiklet');
  const [courierPassword, setCourierPassword] = useState('');
  const [courierPasswordConfirm, setCourierPasswordConfirm] = useState('');
  const [courierError, setCourierError] = useState<string | null>(null);
  const [courierSuccess, setCourierSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const targetRole: UserRole = isAdminFlow ? 'admin' : (isCourierFlow ? 'courier' : 'customer');
    const res = loginUser(identifier, password, targetRole);

    if (res.success && res.user) {
      const roleName = res.user.role === 'courier' ? 'Moto Kurye' : res.user.role === 'admin' ? 'Yönetici' : 'Müşteri';
      setLoginSuccess(`${roleName} girişi başarılı! Yönlendiriliyorsunuz...`);
      setTimeout(() => {
        if (res.user?.role === 'courier') {
          setCurrentView('courier');
        } else if (res.user?.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('customer');
        }
        closeAuthModal();
        setLoginSuccess(null);
        setIdentifier('');
        setPassword('');
      }, 600);
    } else {
      setLoginError(res.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    }
  };

  // Quick 1-Click Demo Login Helper
  const handleQuickDemoLogin = (userId: string, targetView: 'courier' | 'customer' | 'admin') => {
    setLoginError(null);
    setLoginSuccess('Hızlı oturum açılıyor...');
    switchUser(userId);
    setTimeout(() => {
      setCurrentView(targetView);
      closeAuthModal();
      setLoginSuccess(null);
    }, 400);
  };

  // Handle Customer Register
  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError(null);
    setCustomerSuccess(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !customerPassword.trim()) {
      setCustomerError('Lütfen tüm zorunlu alanları (*) doldurunuz.');
      return;
    }

    if (customerPassword.length < 6) {
      setCustomerError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (customerPassword !== customerPasswordConfirm) {
      setCustomerError('Belirlediğiniz şifreler birbiriyle uyuşmuyor.');
      return;
    }

    try {
      registerUser({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim().toLowerCase(),
        district: customerDistrict,
        companyName: customerCompany.trim(),
        password: customerPassword.trim(),
        role: 'customer',
      });

      setCustomerSuccess('Müşteri kaydınız başarıyla oluşturuldu ve oturum açıldı!');
      setTimeout(() => {
        setCurrentView('customer');
        closeAuthModal();
        setCustomerSuccess(null);
      }, 800);
    } catch (err: any) {
      setCustomerError(err?.message || 'Kayıt sırasında bir hata meydana geldi.');
    }
  };

  // Handle Courier Register
  const handleCourierRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCourierError(null);
    setCourierSuccess(null);

    if (!courierName.trim() || !courierPhone.trim() || !courierEmail.trim() || !courierPassword.trim()) {
      setCourierError('Lütfen tüm zorunlu alanları (*) doldurunuz.');
      return;
    }

    if (courierPassword.length < 6) {
      setCourierError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (courierPassword !== courierPasswordConfirm) {
      setCourierError('Belirlediğiniz şifreler birbiriyle uyuşmuyor.');
      return;
    }

    try {
      registerUser({
        name: courierName.trim(),
        phone: courierPhone.trim(),
        email: courierEmail.trim().toLowerCase(),
        vehicleType: courierVehicle,
        password: courierPassword.trim(),
        role: 'courier',
        district: 'Muratpaşa',
        isOnline: true,
      });

      setCourierSuccess('Kurye kaydınız tamamlandı ve talep havuzuna yönlendiriliyorsunuz!');
      setTimeout(() => {
        setCurrentView('courier');
        closeAuthModal();
        setCourierSuccess(null);
      }, 800);
    } catch (err: any) {
      setCourierError(err?.message || 'Kayıt sırasında bir hata meydana geldi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#0c1f19] via-[#091a14] to-[#040e0b] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-emerald-700/60 space-y-4 text-white my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/50">
              {isAdminFlow ? (
                <ShieldCheck className="w-5 h-5" />
              ) : isCourierFlow ? (
                <Bike className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isAdminFlow
                  ? 'Yönetici Girişi'
                  : isCourierFlow
                  ? isRegister
                    ? 'Yeni Kurye Kayıt & Başvuru'
                    : 'Kurye Girişi'
                  : isRegister
                  ? 'Ücretsiz Müşteri Kaydı'
                  : 'Müşteri Girişi'}
              </h3>
              <p className="text-xs text-emerald-300/80">
                {isAdminFlow
                  ? 'Sistem ve Operasyon Yönetimi'
                  : isCourierFlow
                  ? 'Antalya Kurye Kazanç Havuzu'
                  : 'Antalya Şehir İçi Paket Gönderimi'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="w-7 h-7 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Alert if present */}
        {authModalNotice && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-2.5 text-xs text-emerald-200 flex items-start gap-2 shadow-md">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{authModalNotice}</div>
          </div>
        )}

        {/* Role Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#050d09] rounded-xl border border-emerald-800/60 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginError(null);
              setAuthModalTab('login');
            }}
            className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              !isCourierFlow && !isAdminFlow
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Müşteri</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginError(null);
              setAuthModalTab('courier_login');
            }}
            className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              isCourierFlow
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Kurye</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginError(null);
              setAuthModalTab('admin_login');
            }}
            className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              isAdminFlow
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Yönetici</span>
          </button>
        </div>

        {/* 2-Tab Navigation for the Current Flow (Giriş Yap vs Kayıt Ol) */}
        {!isAdminFlow && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#050d09] rounded-xl border border-emerald-800/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthModalTab(isCourierFlow ? 'courier_login' : 'login')}
              className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                !isRegister
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Giriş Yap</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthModalTab(isCourierFlow ? 'courier_register' : 'register')}
              className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                isRegister
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Kayıt Ol</span>
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW A: CUSTOMER LOGIN */}
        {/* =================================================================== */}
        {!isCourierFlow && !isAdminFlow && !isRegister && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">
                E-Posta Adresi veya Telefon Numarası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  required
                  placeholder="deniz@antalya.com veya 0533 123 45 67"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="password"
                  placeholder="Şifreniz (Örn: 123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/30 cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Müşteri Olarak Giriş Yap</span>
            </button>

            {/* Quick Demo Customer Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-customer-sample-1', 'customer')}
                className="w-full py-2 bg-[#041a14] hover:bg-[#06291f] border border-emerald-600/40 text-emerald-300 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Hızlı Giriş: Deniz Akdeniz (Şifre: 123)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <p className="text-xs text-emerald-300/80 mb-2">
                Henüz hesabınız yok mu?
              </p>
              <button
                type="button"
                onClick={() => setAuthModalTab('register')}
                className="w-full py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ücretsiz Müşteri Kaydı Oluştur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VIEW B: CUSTOMER REGISTER */}
        {/* =================================================================== */}
        {!isCourierFlow && !isAdminFlow && isRegister && (
          <form onSubmit={handleCustomerRegisterSubmit} className="space-y-2.5">
            {customerError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{customerError}</span>
              </div>
            )}

            {customerSuccess && (
              <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{customerSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Ad Soyad *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Telefon Numarası *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Bulunduğunuz İlçe</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <select
                    value={customerDistrict}
                    onChange={(e) => setCustomerDistrict(e.target.value as DistrictName)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                  >
                    {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((d) => (
                      <option key={d} value={d} className="bg-[#0c1f19] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-emerald-200 block">Firma / Mağaza Adı (İsteğe Bağlı)</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Örn: Eczane, Restoran veya Butik İsmi"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={customerPasswordConfirm}
                    onChange={(e) => setCustomerPasswordConfirm(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/30 cursor-pointer flex items-center justify-center gap-2 mt-1 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Kaydı Tamamla & Hemen Kurye Çağır</span>
            </button>

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <span className="text-xs text-emerald-300/80">Zaten müşteri hesabınız var mı? </span>
              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                className="text-xs text-emerald-400 hover:text-white underline font-bold cursor-pointer"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VIEW C: COURIER LOGIN */}
        {/* =================================================================== */}
        {isCourierFlow && !isRegister && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">
                Kurye E-Posta, İsim veya Telefon Numarası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  required
                  placeholder="ahmet@antalyakurye.com veya 0544 111 22 33"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="password"
                  placeholder="Şifreniz (Varsayılan: 123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
            >
              <Bike className="w-4 h-4" />
              <span>Kurye Olarak Giriş Yap</span>
            </button>

            {/* Quick Demo Courier Buttons */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-courier-01', 'courier')}
                className="w-full py-2 bg-[#1a1404] hover:bg-[#292006] border border-amber-500/40 text-amber-300 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Hızlı Giriş: Ahmet Yılmaz (Kurye - Şifre: 123)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-courier-02', 'courier')}
                className="w-full py-2 bg-[#1a1404] hover:bg-[#292006] border border-amber-500/40 text-amber-300 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Hızlı Giriş: Mustafa Demir (Kurye - Şifre: 123)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <p className="text-xs text-emerald-300/80 mb-2">
                Henüz kurye hesabınız yok mu?
              </p>
              <button
                type="button"
                onClick={() => setAuthModalTab('courier_register')}
                className="w-full py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Bike className="w-3.5 h-3.5 text-emerald-400" />
                <span>Yeni Kurye Kayıt Formu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VIEW D: COURIER REGISTER */}
        {/* =================================================================== */}
        {isCourierFlow && isRegister && (
          <form onSubmit={handleCourierRegisterSubmit} className="space-y-2.5">
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2 text-xs text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Antalya içi bekleyen talep havuzuna katılıp anında kazanın.</span>
            </div>

            {courierError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{courierError}</span>
              </div>
            )}

            {courierSuccess && (
              <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{courierSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Kurye Ad Soyad *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Telefon Numarası *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="email"
                    required
                    placeholder="kurye@antalya.com"
                    value={courierEmail}
                    onChange={(e) => setCourierEmail(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Taşıma Aracı Tipi</label>
                <div className="relative">
                  <Bike className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <select
                    value={courierVehicle}
                    onChange={(e) => setCourierVehicle(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Motosiklet" className="bg-[#0c1f19] text-white">Motosiklet</option>
                    <option value="Scooter" className="bg-[#0c1f19] text-white">Scooter</option>
                    <option value="Bisiklet / E-Bike" className="bg-[#0c1f19] text-white">Bisiklet / E-Bike</option>
                    <option value="Otomobil" className="bg-[#0c1f19] text-white">Otomobil</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPassword}
                    onChange={(e) => setCourierPassword(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPasswordConfirm}
                    onChange={(e) => setCourierPasswordConfirm(e.target.value)}
                    className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-1 active:scale-95"
            >
              <Bike className="w-4 h-4" />
              <span>Kurye Kaydını Tamamla & Havuzuna Katıl</span>
            </button>

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <span className="text-xs text-emerald-300/80">Zaten kurye hesabınız var mı? </span>
              <button
                type="button"
                onClick={() => setAuthModalTab('courier_login')}
                className="text-xs text-amber-400 hover:text-white underline font-bold cursor-pointer"
              >
                Kurye Girişi Yap
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VIEW E: ADMIN LOGIN */}
        {/* =================================================================== */}
        {isAdminFlow && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">
                Yönetici E-Posta veya Kullanıcı Adı
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  required
                  placeholder="kuryeantalyam@gmail.com veya admin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">Yönetici Şifresi</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="password"
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-teal-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Yönetici Olarak Giriş Yap</span>
            </button>

            {/* Quick Demo Admin Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-admin-01', 'admin')}
                className="w-full py-2 bg-[#041a14] hover:bg-[#06291f] border border-teal-500/40 text-teal-300 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Hızlı Yönetici Girişi (Şifre: admin)</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
