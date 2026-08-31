import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bike, 
  User,
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName } from '../types';
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
    setCurrentView,
  } = useDelivery();

  // Determine modal flow type: 'customer' or 'courier'
  const isCourierFlow = authModalTab === 'courier_login' || authModalTab === 'courier_register';
  const isRegister = authModalTab === 'register' || authModalTab === 'courier_register';

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Customer Register form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState<DistrictName>('Muratpaşa');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerPasswordConfirm, setCustomerPasswordConfirm] = useState('');
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSuccess, setCustomerSuccess] = useState<string | null>(null);

  // Courier Register form state
  const [courierName, setCourierName] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierDistrict, setCourierDistrict] = useState<DistrictName>('Muratpaşa');
  const [courierVehicle, setCourierVehicle] = useState('Motosiklet');
  const [courierPassword, setCourierPassword] = useState('');
  const [courierPasswordConfirm, setCourierPasswordConfirm] = useState('');
  const [courierError, setCourierError] = useState<string | null>(null);
  const [courierSuccess, setCourierSuccess] = useState<string | null>(null);

  // Reset errors when tab or modal changes
  useEffect(() => {
    setLoginError(null);
    setLoginSuccess(null);
    setCustomerError(null);
    setCustomerSuccess(null);
    setCourierError(null);
    setCourierSuccess(null);
  }, [authModalTab, isAuthModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Handle Login Submit (Customer or Courier)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!identifier.trim()) {
      setLoginError('Lütfen e-posta adresinizi veya telefon numaranızı giriniz.');
      return;
    }

    const res = loginUser(identifier.trim(), password);
    if (res.success && res.user) {
      const u = res.user;
      setLoginSuccess(`Giriş başarılı! Hoş geldiniz, ${u.name}.`);
      setTimeout(() => {
        closeAuthModal();
        if (u.role === 'courier') {
          setCurrentView('courier');
        } else {
          setCurrentView('customer');
        }
      }, 500);
    } else {
      setLoginError(res.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    }
  };

  // Handle Customer Register Submit
  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError(null);
    setCustomerSuccess(null);

    if (!customerName.trim()) {
      setCustomerError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!customerPhone.trim()) {
      setCustomerError('Lütfen iletişim telefon numaranızı giriniz.');
      return;
    }
    if (!customerEmail.trim()) {
      setCustomerError('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!customerPassword.trim()) {
      setCustomerError('Lütfen şifre belirleyiniz.');
      return;
    }
    if (customerPassword.length < 3) {
      setCustomerError('Şifreniz en az 3 karakter olmalıdır.');
      return;
    }
    if (customerPassword !== customerPasswordConfirm) {
      setCustomerError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    const newUser = registerUser({
      name: customerName.trim(),
      email: customerEmail.trim().toLowerCase(),
      phone: customerPhone.trim(),
      password: customerPassword.trim(),
      role: 'customer',
      district: customerDistrict,
      companyName: customerCompany.trim() || undefined,
    });

    setCustomerSuccess(`Tebrikler ${newUser.name}! Hesabınız başarıyla oluşturuldu. Paket çağırma ekranına yönlendiriliyorsunuz...`);
    setTimeout(() => {
      closeAuthModal();
      setCurrentView('customer');
    }, 600);
  };

  // Handle Courier Register Submit
  const handleCourierRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCourierError(null);
    setCourierSuccess(null);

    if (!courierName.trim()) {
      setCourierError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!courierPhone.trim()) {
      setCourierError('Lütfen iletişim telefon numaranızı giriniz.');
      return;
    }
    if (!courierEmail.trim()) {
      setCourierError('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!courierPassword.trim()) {
      setCourierError('Lütfen şifre belirleyiniz.');
      return;
    }
    if (courierPassword.length < 3) {
      setCourierError('Şifreniz en az 3 karakter olmalıdır.');
      return;
    }
    if (courierPassword !== courierPasswordConfirm) {
      setCourierError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    const newCourier = registerUser({
      name: courierName.trim(),
      email: courierEmail.trim().toLowerCase(),
      phone: courierPhone.trim(),
      password: courierPassword.trim(),
      role: 'courier',
      district: courierDistrict,
      companyName: courierVehicle,
      isOnline: true,
    });

    setCourierSuccess(`Tebrikler ${newCourier.name}! Kurye hesabınız başarıyla açıldı. Bekleyen talep havuzuna aktarılıyorsunuz...`);
    setTimeout(() => {
      closeAuthModal();
      setCurrentView('courier');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#022019] via-[#032a21] to-[#011612] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-emerald-700/60 space-y-4 text-white my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md text-white ${
              isCourierFlow ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
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
              <p className="text-xs text-emerald-300/80">
                {isCourierFlow ? 'Antalya Kurye Kazanç Havuzu' : 'Antalya Şehir İçi Paket Gönderimi'}
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

        {/* 2-Tab Navigation for the Current Flow (Giriş Yap vs Kayıt Ol) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#011410] rounded-xl border border-emerald-800/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthModalTab(isCourierFlow ? 'courier_login' : 'login')}
            className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegister
                ? isCourierFlow
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-emerald-600 text-white shadow-md'
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
                ? isCourierFlow
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
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
              <label className="text-xs font-bold text-emerald-200 block">
                E-Posta Adresi veya Telefon Numarası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                <input
                  type="text"
                  required
                  placeholder="ornek@email.com veya 05XX XXX XX XX"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Müşteri Olarak Giriş Yap</span>
            </button>

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
                <label className="text-[11px] font-bold text-emerald-200 block">Ad Soyad *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Telefon Numarası *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Bulunduğunuz İlçe</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                  <select
                    value={customerDistrict}
                    onChange={(e) => setCustomerDistrict(e.target.value as DistrictName)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
                  >
                    {(Object.keys(ANTALYA_DISTRICTS) as DistrictName[]).map((d) => (
                      <option key={d} value={d} className="bg-[#021f19] text-white">
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
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Örn: Eczane, Restoran veya Butik İsmi"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={customerPasswordConfirm}
                    onChange={(e) => setCustomerPasswordConfirm(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2 mt-1 active:scale-95"
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
                Kurye E-Posta veya Telefon Numarası
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                <input
                  type="text"
                  required
                  placeholder="ahmet@antalyakurye.com veya 05XX XXX XX XX"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-200 block">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Kurye Olarak Giriş Yap</span>
            </button>

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <p className="text-xs text-emerald-300/80 mb-2">
                Henüz kurye hesabınız yok mu?
              </p>
              <button
                type="button"
                onClick={() => setAuthModalTab('courier_register')}
                className="w-full py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
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
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-2 text-xs text-amber-200 flex items-center gap-2">
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
                <label className="text-[11px] font-bold text-emerald-200 block">Kurye Ad Soyad *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Telefon Numarası *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                  <input
                    type="email"
                    required
                    placeholder="kurye@antalya.com"
                    value={courierEmail}
                    onChange={(e) => setCourierEmail(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Taşıma Aracı Tipi</label>
                <div className="relative">
                  <Bike className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                  <select
                    value={courierVehicle}
                    onChange={(e) => setCourierVehicle(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Motosiklet" className="bg-[#021f19] text-white">Motosiklet</option>
                    <option value="Scooter" className="bg-[#021f19] text-white">Scooter</option>
                    <option value="Bisiklet / E-Bike" className="bg-[#021f19] text-white">Bisiklet / E-Bike</option>
                    <option value="Otomobil" className="bg-[#021f19] text-white">Otomobil</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPassword}
                    onChange={(e) => setCourierPassword(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPasswordConfirm}
                    onChange={(e) => setCourierPasswordConfirm(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-1 active:scale-95"
            >
              <Bike className="w-4 h-4" />
              <span>Kurye Kaydını Tamamla & Havuzuna Katıl</span>
            </button>

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <span className="text-xs text-emerald-300/80">Zaten kurye hesabınız var mı? </span>
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
