import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Bike, 
  Shield, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Navigation
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
    users,
  } = useDelivery();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Customer Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regDistrict, setRegDistrict] = useState<DistrictName>('Muratpaşa');
  const [regCompany, setRegCompany] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Courier Register form state
  const [courierName, setCourierName] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierDistrict, setCourierDistrict] = useState<DistrictName>('Muratpaşa');
  const [courierVehicle, setCourierVehicle] = useState('Motosiklet (125cc - 250cc)');
  const [courierPlate, setCourierPlate] = useState('');
  const [courierPassword, setCourierPassword] = useState('');
  const [courierPasswordConfirm, setCourierPasswordConfirm] = useState('');
  const [courierError, setCourierError] = useState<string | null>(null);
  const [courierSuccess, setCourierSuccess] = useState<string | null>(null);

  // Reset errors when tab or modal changes
  useEffect(() => {
    setLoginError(null);
    setLoginSuccess(null);
    setRegError(null);
    setRegSuccess(null);
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

  // Handle Login Submit
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
        } else if (u.role === 'admin') {
          setCurrentView('admin');
        } else {
          if (authModalNotice) {
            setCurrentView('customer');
          } else {
            setCurrentView('home');
          }
        }
      }, 500);
    } else {
      setLoginError(res.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    }
  };

  // Quick Demo Login
  const handleQuickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    const res = loginUser(email, pass);
    if (res.success && res.user) {
      const u = res.user;
      setLoginSuccess(`Giriş yapıldı: ${u.name}`);
      setTimeout(() => {
        closeAuthModal();
        if (u.role === 'courier') {
          setCurrentView('courier');
        } else if (u.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('customer');
        }
      }, 400);
    }
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
      companyName: courierPlate.trim() ? `${courierVehicle} (${courierPlate.trim()})` : courierVehicle,
      isOnline: true,
    });

    setCourierSuccess(`Tebrikler ${newCourier.name}! Kurye hesabınız başarıyla açıldı. Kurye havuzuna yönlendiriliyorsunuz...`);
    setTimeout(() => {
      closeAuthModal();
      setCurrentView('courier');
    }, 700);
  };

  // Handle Customer Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Lütfen iletişim telefon numaranızı giriniz.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!regPassword.trim()) {
      setRegError('Lütfen şifre belirleyiniz.');
      return;
    }
    if (regPassword.length < 3) {
      setRegError('Şifreniz en az 3 karakter olmalıdır.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    const newUser = registerUser({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
      password: regPassword.trim(),
      role: 'customer',
      district: regDistrict,
      companyName: regCompany.trim() || undefined,
    });

    setRegSuccess(`Tebrikler ${newUser.name}! Hesabınız oluşturuldu ve giriş yapıldı.`);
    setTimeout(() => {
      closeAuthModal();
      setCurrentView('customer');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#022019] via-[#032a21] to-[#011612] rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-emerald-700/60 space-y-5 text-white my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-white ${
              authModalTab === 'courier_login' || authModalTab === 'courier_register'
                ? 'bg-amber-600'
                : authModalTab === 'admin_login'
                ? 'bg-teal-600'
                : 'bg-emerald-600'
            }`}>
              {authModalTab === 'courier_login' ? (
                <Bike className="w-5 h-5" />
              ) : authModalTab === 'courier_register' ? (
                <Bike className="w-5 h-5 animate-pulse" />
              ) : authModalTab === 'admin_login' ? (
                <Shield className="w-5 h-5" />
              ) : authModalTab === 'register' ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {authModalTab === 'courier_login'
                  ? 'Moto Kurye Giriş Paneli'
                  : authModalTab === 'courier_register'
                  ? 'Yeni Moto Kurye Kayıt & Başvuru'
                  : authModalTab === 'admin_login'
                  ? 'Yönetici Giriş Paneli'
                  : authModalTab === 'register'
                  ? 'Ücretsiz Müşteri Kaydı'
                  : 'Müşteri Girişi'}
              </h3>
              <p className="text-xs text-emerald-300/80">Antalya Şehir İçi Teslimat 7/24</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Alert */}
        {authModalNotice && (
          <div className="bg-amber-950/80 border border-amber-500/60 rounded-2xl p-3 text-xs text-amber-200 flex items-start gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{authModalNotice}</div>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#011410] rounded-2xl border border-emerald-800/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthModalTab('courier_login')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalTab === 'courier_login'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Kurye Girişi</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthModalTab('courier_register')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalTab === 'courier_register'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Kurye Kayıt Ol</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthModalTab('login')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalTab === 'login' || authModalTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Müşteri</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthModalTab('admin_login')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalTab === 'admin_login'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Yönetici</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: COURIER LOGIN / CUSTOMER LOGIN / ADMIN LOGIN */}
        {/* =================================================================== */}
        {(authModalTab === 'courier_login' || authModalTab === 'login' || authModalTab === 'admin_login') && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-200 block">
                {authModalTab === 'courier_login'
                  ? 'Kurye E-Posta, Telefon veya İsim'
                  : authModalTab === 'admin_login'
                  ? 'Yönetici E-Posta veya Kullanıcı Adı'
                  : 'E-Posta Adresi, Telefon veya İsim'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-500" />
                <input
                  type="text"
                  required
                  placeholder={
                    authModalTab === 'courier_login'
                      ? 'ahmet@antalyakurye.com veya 0544 111 22 33'
                      : authModalTab === 'admin_login'
                      ? 'kuryeantalyam@gmail.com veya admin'
                      : 'deniz@antalya.com veya 0533 123 45 67'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-200 block">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-500" />
                <input
                  type="password"
                  placeholder={authModalTab === 'admin_login' ? 'admin' : '123'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-extrabold text-sm rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                authModalTab === 'courier_login'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-600/30'
                  : authModalTab === 'admin_login'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 shadow-teal-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-600/30'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {authModalTab === 'courier_login'
                  ? 'Kurye Olarak Giriş Yap'
                  : authModalTab === 'admin_login'
                  ? 'Yönetici Olarak Giriş Yap'
                  : 'Müşteri Olarak Giriş Yap'}
              </span>
            </button>

            {/* If on Courier Login, add clear Callout for Courier Register */}
            {authModalTab === 'courier_login' && (
              <div className="pt-2 border-t border-emerald-900/60 text-center">
                <p className="text-xs text-emerald-300/90 mb-2">
                  Henüz kurye hesabınız yok mu? Antalya ekibimize katılın!
                </p>
                <button
                  type="button"
                  onClick={() => setAuthModalTab('courier_register')}
                  className="w-full py-2.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Bike className="w-4 h-4 text-amber-400" />
                  <span>Yeni Kurye Kayıt & Başvuru Formu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* If on Customer Login, add link to customer register */}
            {authModalTab === 'login' && (
              <div className="pt-2 border-t border-emerald-900/60 text-center">
                <p className="text-xs text-emerald-300/90 mb-2">
                  Hesabınız yok mu?
                </p>
                <button
                  type="button"
                  onClick={() => setAuthModalTab('register')}
                  className="text-xs text-emerald-400 hover:text-white underline font-bold cursor-pointer"
                >
                  Ücretsiz Müşteri Hesabı Oluştur
                </button>
              </div>
            )}

            {/* Fast 1-Click Demo Logins for Quick Testing */}
            <div className="pt-2 border-t border-emerald-900/60">
              <div className="flex items-center justify-between text-[11px] text-emerald-400/80 mb-2 font-medium">
                <span>Hızlı Demo Girişi (1 Tıkla):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ahmet@antalyakurye.com', '123')}
                  className="p-2 rounded-xl bg-[#011410] hover:bg-emerald-950 border border-emerald-800/60 text-left transition cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Bike className="w-3 h-3" />
                    <span>Ahmet (Kurye 1)</span>
                  </div>
                  <div className="text-[9px] text-emerald-400/70 truncate">ahmet@antalyakurye.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('mustafa@antalyakurye.com', '123')}
                  className="p-2 rounded-xl bg-[#011410] hover:bg-emerald-950 border border-emerald-800/60 text-left transition cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Bike className="w-3 h-3" />
                    <span>Mustafa (Kurye 2)</span>
                  </div>
                  <div className="text-[9px] text-emerald-400/70 truncate">mustafa@antalyakurye.com</div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* TAB 2: COURIER REGISTRATION FORM */}
        {/* =================================================================== */}
        {authModalTab === 'courier_register' && (
          <form onSubmit={handleCourierRegisterSubmit} className="space-y-3">
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 text-xs text-amber-200 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Antalya genelinde anında sipariş alıp kazanmaya hemen başlayın.</span>
            </div>

            {courierError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{courierError}</span>
              </div>
            )}

            {courierSuccess && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{courierSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Kurye Ad Soyad *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">İletişim Telefonu *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="email"
                    required
                    placeholder="kurye@antalya.com"
                    value={courierEmail}
                    onChange={(e) => setCourierEmail(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Ana Çalışma Bölgesi / İlçe</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <select
                    value={courierDistrict}
                    onChange={(e) => setCourierDistrict(e.target.value as DistrictName)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-amber-400 outline-hidden font-medium cursor-pointer"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Taşıma Aracı Tipi</label>
                <div className="relative">
                  <Bike className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <select
                    value={courierVehicle}
                    onChange={(e) => setCourierVehicle(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-amber-400 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Motosiklet (125cc - 250cc)" className="bg-[#021f19] text-white">Motosiklet (125cc - 250cc)</option>
                    <option value="Scooter / Maxi Scooter" className="bg-[#021f19] text-white">Scooter / Maxi Scooter</option>
                    <option value="Bisiklet / E-Bike" className="bg-[#021f19] text-white">Bisiklet / E-Bike</option>
                    <option value="Otomobil / Hafif Ticari" className="bg-[#021f19] text-white">Otomobil / Hafif Ticari</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Araç Plaka / Model (İsteğe Bağlı)</label>
                <div className="relative">
                  <Navigation className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="text"
                    placeholder="Örn: 07 ABC 123 - Honda Activa"
                    value={courierPlate}
                    onChange={(e) => setCourierPlate(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPassword}
                    onChange={(e) => setCourierPassword(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={courierPasswordConfirm}
                    onChange={(e) => setCourierPasswordConfirm(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-amber-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2"
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

        {/* =================================================================== */}
        {/* TAB 3: CUSTOMER REGISTRATION FORM */}
        {/* =================================================================== */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Ad Soyad *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Telefon Numarası *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">İlçe</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value as DistrictName)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-400 outline-hidden font-medium cursor-pointer"
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
              <label className="text-xs font-bold text-emerald-200 block">Firma Adı (İsteğe Bağlı)</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Örn: Eczane, Restoran veya Butik İsmi"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-200 block">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    className="w-full bg-[#011410] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Üyeliği Tamamla & Hemen Kurye Çağır</span>
            </button>

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <span className="text-xs text-emerald-300/80">Zaten üye misiniz? </span>
              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                className="text-xs text-emerald-400 hover:text-white underline font-bold cursor-pointer"
              >
                Müşteri Girişi Yap
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
