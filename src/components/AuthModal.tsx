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
    users,
  } = useDelivery();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regDistrict, setRegDistrict] = useState<DistrictName>('Muratpaşa');
  const [regCompany, setRegCompany] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Reset errors when tab or modal changes
  useEffect(() => {
    setLoginError(null);
    setLoginSuccess(null);
    setRegError(null);
    setRegSuccess(null);
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
          // If customer was opening modal to call courier, direct to customer form
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

  // Handle Register Submit
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/90 text-white flex items-center justify-center shadow-md">
              {authModalTab === 'courier_login' ? (
                <Bike className="w-5 h-5" />
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
                  : authModalTab === 'admin_login'
                  ? 'Yönetici Giriş Paneli'
                  : authModalTab === 'register'
                  ? 'Ücretsiz Müşteri Kaydı'
                  : 'Müşteri Girişi'}
              </h3>
              <p className="text-xs text-emerald-300/80">Antalya Kurye Ekspres Sistemi</p>
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

        {/* Notice Alert (if triggered by trying to order without login) */}
        {authModalNotice && (
          <div className="bg-amber-950/80 border border-amber-500/60 rounded-2xl p-3 text-xs text-amber-200 flex items-start gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{authModalNotice}</div>
          </div>
        )}

        {/* Role / Mode Tabs (4 distinct tabs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#011410] rounded-2xl border border-emerald-800/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthModalTab('login')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalTab === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Müşteri</span>
          </button>

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
            <span>Kurye</span>
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

          <button
            type="button"
            onClick={() => setAuthModalTab('register')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-300/80 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Kayıt Ol</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1 & 2 & 4: LOGIN FORM (Customer / Courier / Admin) */}
        {/* =================================================================== */}
        {authModalTab !== 'register' && (
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
                      ? 'ahmet@antalyakurye.com, 0544 111 22 33 veya Ahmet'
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
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2"
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
          </form>
        )}

        {/* =================================================================== */}
        {/* TAB 3: CUSTOMER REGISTRATION FORM */}
        {/* =================================================================== */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
          </form>
        )}

      </div>
    </div>
  );
};
