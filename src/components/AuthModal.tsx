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
  Sparkles
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
    login,
    registerCustomer,
    registerCourier,
  } = useDelivery();

  // Mode selectors
  const isCourierFlow = authModalTab === 'courier_login' || authModalTab === 'courier_register';
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

    const targetRole: UserRole = isCourierFlow ? 'courier' : 'customer';
    const res = login(identifier, password, targetRole);

    if (res.success) {
      setLoginSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        closeAuthModal();
        setLoginSuccess(null);
        setIdentifier('');
        setPassword('');
      }, 700);
    } else {
      setLoginError(res.message);
    }
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

    const res = registerCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      district: customerDistrict,
      company: customerCompany,
      password: customerPassword,
    });

    if (res.success) {
      setCustomerSuccess('Müşteri kaydınız başarıyla oluşturuldu ve oturum açıldı!');
      setTimeout(() => {
        closeAuthModal();
        setCustomerSuccess(null);
      }, 900);
    } else {
      setCustomerError(res.message);
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

    const res = registerCourier({
      name: courierName,
      phone: courierPhone,
      email: courierEmail,
      vehicle: courierVehicle,
      password: courierPassword,
    });

    if (res.success) {
      setCourierSuccess('Kurye kaydınız tamamlandı ve havuz erişiminiz açıldı!');
      setTimeout(() => {
        closeAuthModal();
        setCourierSuccess(null);
      }, 900);
    } else {
      setCourierError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#241304] via-[#331b05] to-[#1c0d02] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-amber-700/60 space-y-4 text-white my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md text-white bg-amber-500">
              {isCourierFlow ? <Bike className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isCourierFlow
                  ? isRegister
                    ? 'Yeni Kurye Kayıt & Başvuru'
                    : 'Kurye Girişi'
                  : isRegister
                  ? 'Ücretsiz Müşteri Kaydı'
                  : 'Müşteri Girişi'}
              </h3>
              <p className="text-xs text-amber-200/80">
                {isCourierFlow ? 'Antalya Kurye Kazanç Havuzu' : 'Antalya Şehir İçi Paket Gönderimi'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="w-7 h-7 rounded-full bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Alert if present */}
        {authModalNotice && (
          <div className="bg-amber-950/80 border border-amber-500/60 rounded-xl p-2.5 text-xs text-amber-200 flex items-start gap-2 shadow-md">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{authModalNotice}</div>
          </div>
        )}

        {/* 2-Tab Navigation for the Current Flow (Giriş Yap vs Kayıt Ol) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#140801] rounded-xl border border-amber-800/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthModalTab(isCourierFlow ? 'courier_login' : 'login')}
            className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegister
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-300/80 hover:text-white'
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
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-300/80 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Kayıt Ol</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* VIEW A: CUSTOMER LOGIN */}
        {/* =================================================================== */}
        {!isCourierFlow && !isRegister && (
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
              <label className="text-xs font-bold text-amber-200 block">
                E-Posta Adresi veya Telefon Numarası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-amber-400" />
                <input
                  type="text"
                  required
                  placeholder="ornek@email.com veya 05XX XXX XX XX"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-200 block">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-amber-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Müşteri Olarak Giriş Yap</span>
            </button>

            <div className="pt-2 border-t border-amber-900/60 text-center">
              <p className="text-xs text-amber-200/80 mb-2">
                Henüz hesabınız yok mu?
              </p>
              <button
                type="button"
                onClick={() => setAuthModalTab('register')}
                className="w-full py-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Ücretsiz Müşteri Kaydı Oluştur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VIEW B: CUSTOMER REGISTER */}
        {/* =================================================================== */}
        {!isCourierFlow && isRegister && (
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
                <label className="text-[11px] font-bold text-amber-200 block">Ad Soyad *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Telefon Numarası *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Bulunduğunuz İlçe</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <select
                    value={customerDistrict}
                    onChange={(e) => setCustomerDistrict(e.target.value as DistrictName)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-hidden font-medium cursor-pointer"
                  >
                    {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((d) => (
                      <option key={d} value={d} className="bg-[#1f0e03] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-200 block">Firma / Mağaza Adı (İsteğe Bağlı)</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                <input
                  type="text"
                  placeholder="Örn: Eczane, Restoran veya Butik İsmi"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={customerPasswordConfirm}
                    onChange={(e) => setCustomerPasswordConfirm(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-1 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Kaydı Tamamla & Hemen Kurye Çağır</span>
            </button>

            <div className="pt-2 border-t border-amber-900/60 text-center">
              <span className="text-xs text-amber-200/80">Zaten müşteri hesabınız var mı? </span>
              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                className="text-xs text-amber-400 hover:text-white underline font-bold cursor-pointer"
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
              <label className="text-xs font-bold text-amber-200 block">
                Kurye E-Posta veya Telefon Numarası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-amber-400" />
                <input
                  type="text"
                  required
                  placeholder="ahmet@antalyakurye.com veya 05XX XXX XX XX"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-200 block">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-amber-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Kurye Olarak Giriş Yap</span>
            </button>

            <div className="pt-2 border-t border-amber-900/60 text-center">
              <p className="text-xs text-amber-200/80 mb-2">
                Henüz kurye hesabınız yok mu?
              </p>
              <button
                type="button"
                onClick={() => setAuthModalTab('courier_register')}
                className="w-full py-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Bike className="w-3.5 h-3.5 text-amber-400" />
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
            <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-2 text-xs text-amber-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                <label className="text-[11px] font-bold text-amber-200 block">Kurye Ad Soyad *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Telefon Numarası *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="email"
                    required
                    placeholder="kurye@antalya.com"
                    value={courierEmail}
                    onChange={(e) => setCourierEmail(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Taşıma Aracı Tipi</label>
                <div className="relative">
                  <Bike className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <select
                    value={courierVehicle}
                    onChange={(e) => setCourierVehicle(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Motosiklet" className="bg-[#1f0e03] text-white">Motosiklet</option>
                    <option value="Scooter" className="bg-[#1f0e03] text-white">Scooter</option>
                    <option value="Bisiklet / E-Bike" className="bg-[#1f0e03] text-white">Bisiklet / E-Bike</option>
                    <option value="Otomobil" className="bg-[#1f0e03] text-white">Otomobil</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPassword}
                    onChange={(e) => setCourierPassword(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPasswordConfirm}
                    onChange={(e) => setCourierPasswordConfirm(e.target.value)}
                    className="w-full bg-[#120701] border border-amber-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-amber-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-1 active:scale-95"
            >
              <Bike className="w-4 h-4" />
              <span>Kurye Kaydını Tamamla & Havuzuna Katıl</span>
            </button>

            <div className="pt-2 border-t border-amber-900/60 text-center">
              <span className="text-xs text-amber-200/80">Zaten kurye hesabınız var mı? </span>
              <button
                type="button"
                onClick={() => setAuthModalTab('courier_login')}
                className="text-xs text-amber-300 hover:text-white underline font-bold cursor-pointer"
              >
                Kurye Girişi Yap
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
