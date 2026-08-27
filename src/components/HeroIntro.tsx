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
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { UserRole, DistrictName } from '../types';
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
  } = useDelivery();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Quick Login for existing roles
  const handleQuickRoleLogin = (role: UserRole) => {
    setLoginError(null);
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setEmail(targetUser.email || targetUser.phone);
      switchUser(targetUser.id);
      setLoginSuccess(`Hoş geldiniz, ${targetUser.name}!`);
      setTimeout(() => {
        setLoginSuccess(null);
        if (role === 'customer') setCurrentView('customer');
        else if (role === 'courier') setCurrentView('courier');
        else setCurrentView('history');
      }, 500);
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

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const cleanInput = email.trim();
    if (!cleanInput) {
      setLoginError('Lütfen e-posta veya telefon numaranızı giriniz.');
      return;
    }

    const res = loginUser(cleanInput);
    if (res.success && res.user) {
      const u = res.user;
      setLoginSuccess(`Hoş geldiniz, ${u.name}! Yönlendiriliyorsunuz...`);
      setTimeout(() => {
        setLoginSuccess(null);
        if (u.role === 'customer') {
          setCurrentView('customer');
        } else if (u.role === 'courier') {
          setCurrentView('courier');
        } else {
          setCurrentView('history');
        }
      }, 700);
    } else {
      // Auto-register smoothly so the user is never locked out
      const fallbackUser = registerUser({
        name: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput,
        email: cleanInput.includes('@') ? cleanInput.toLowerCase() : `${cleanInput.replace(/\s+/g, '')}@antalyakurye.com`,
        phone: '0532 000 00 00',
        role: 'customer',
        district: 'Muratpaşa',
      });
      setLoginSuccess(`Hoş geldiniz, ${fallbackUser.name}! Giriş yapıldı.`);
      setTimeout(() => {
        setLoginSuccess(null);
        setCurrentView('customer');
      }, 700);
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

    const newUser = registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '0532 000 00 00',
      role: regRole,
      district: regDistrict,
      companyName: regRole === 'customer' ? regCompany.trim() || undefined : undefined,
      vehicleInfo: regRole === 'courier' ? regVehicle.trim() || undefined : undefined,
    });

    setRegSuccess(`Tebrikler ${newUser.name}! Hesabınız oluşturuldu.`);
    setTimeout(() => {
      setRegSuccess(null);
      if (newUser.role === 'customer') {
        setCurrentView('customer');
      } else {
        setCurrentView('courier');
      }
    }, 900);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800/60 grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-[#0c1824] via-[#09222b] to-[#043330]">
        
        {/* LEFT / TOP DARK SECTION (Matching screenshots exactly) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-8">
            {/* Logo and Brand Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Antalya Kurye</h2>
                <p className="text-xs sm:text-sm text-slate-300">Paket Teslimat Sistemi</p>
              </div>
            </div>

            {/* Main Headline & Paragraph */}
            <div className="space-y-3.5 pt-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Paketlerinizi hızlı ve güvenli şekilde gönderin
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Talebinizi oluşturun, kurye havuzuna düşsün. Size en yakın kurye paketinizi seçip teslimatınızı gerçekleştirsin.
              </p>
            </div>

            {/* 3 Feature Bullets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  Tek tıkla paket talebi oluştur
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  Kurye havuzundan otomatik eşleşme
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  Anlık takip ve durum bildirimleri
                </span>
              </div>
            </div>
          </div>

          {/* Footer inside Left Section */}
          <div className="pt-8 relative z-10">
            <p className="text-xs text-slate-400">
              © 2026 Antalya Kurye — Tüm hakları saklıdır
            </p>
          </div>
        </div>

        {/* RIGHT / BOTTOM WHITE FORM CARD (Matching screenshots exactly) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-10 flex flex-col justify-center shadow-xl">
          {mode === 'login' ? (
            /* LOGIN VIEW */
            <div className="w-full max-w-sm mx-auto space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Hoş geldiniz
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Devam etmek için giriş yapın
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* E-posta */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="ornek@email.com"
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                {/* Şifre */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition placeholder:text-slate-400 font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Login Errors / Success */}
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                    {loginError}
                  </div>
                )}

                {loginSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{loginSuccess}</span>
                  </div>
                )}

                {/* Giriş Yap Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
                >
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick Role Selection Shortcut */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kayıtlı Roller İle Giriş</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickRoleLogin('customer')}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-slate-700 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Müşteri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRoleLogin('courier')}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 text-slate-700 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Bike className="w-3.5 h-3.5 text-amber-600" />
                      <span>Moto Kurye</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRoleLogin('admin')}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 text-slate-700 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Yönetici</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Toggle to Register */}
              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-slate-600">
                  Hesabınız yok mu?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setLoginError(null);
                    }}
                    className="font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                  >
                    Kayıt olun
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* REGISTER VIEW */
            <div className="w-full max-w-sm mx-auto space-y-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Kayıt Olun
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Antalya Kurye sistemine katılın
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Role selection */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRegRole('customer')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      regRole === 'customer'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Müşteri (Gönderici)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('courier')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      regRole === 'courier'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Moto Kurye (Taşıyıcı)
                  </button>
                </div>

                {/* Ad Soyad */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* E-posta */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* Telefon */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0532 123 45 67"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* İlçe */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Antalya İlçesi
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value as DistrictName)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 font-medium cursor-pointer"
                  >
                    {Object.values(ANTALYA_DISTRICTS).map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Şifre */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Error/Success */}
                {regError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </button>
              </form>

              {/* Toggle to Login */}
              <div className="text-center pt-1">
                <p className="text-xs text-slate-600">
                  Zaten hesabınız var mı?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRegError(null);
                    }}
                    className="font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                  >
                    Giriş yapın
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
