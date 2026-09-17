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
  ArrowLeft,
  KeyRound,
  Sparkles,
  Zap,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { DistrictName, UserRole } from '../types';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';
import { TermsOfUseModal } from './TermsOfUseModal';
import { KvkkModal } from './KvkkModal';

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
    requestPasswordReset,
  } = useDelivery();

  // Mode selectors
  const isCourierFlow = authModalTab === 'courier_login' || authModalTab === 'courier_register' || authModalTab === 'courier_forgot_password';
  const isRegister = authModalTab === 'register' || authModalTab === 'courier_register';
  const isForgotPassword = authModalTab === 'forgot_password' || authModalTab === 'courier_forgot_password';

  // Common Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<{
    message: string;
    email: string;
    isSelfSent?: boolean;
    refCode?: number;
  } | null>(null);

  // Customer Register Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState<DistrictName>('Muratpaşa');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerPasswordConfirm, setCustomerPasswordConfirm] = useState('');
  const [customerTermsAccepted, setCustomerTermsAccepted] = useState(false);
  const [customerKvkkAccepted, setCustomerKvkkAccepted] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSuccess, setCustomerSuccess] = useState<string | null>(null);

  // Courier Register Form State
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierVehicle, setCourierVehicle] = useState('Motosiklet');
  const [courierPassword, setCourierPassword] = useState('');
  const [courierPasswordConfirm, setCourierPasswordConfirm] = useState('');
  const [courierTermsAccepted, setCourierTermsAccepted] = useState(false);
  const [courierKvkkAccepted, setCourierKvkkAccepted] = useState(false);
  const [courierError, setCourierError] = useState<string | null>(null);
  const [courierSuccess, setCourierSuccess] = useState<string | null>(null);

  // Terms of Use Modal State
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsAcceptTarget, setTermsAcceptTarget] = useState<'customer' | 'courier'>('customer');

  // KVKK Modal State
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState(false);
  const [kvkkAcceptTarget, setKvkkAcceptTarget] = useState<'customer' | 'courier'>('customer');

  if (!isAuthModalOpen) return null;

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const clean = forgotIdentifier.trim();
    if (!clean) {
      setForgotError('Lütfen kayıtlı e-posta adresinizi veya telefon numaranızı giriniz.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await requestPasswordReset(clean, isCourierFlow ? 'courier' : 'customer');
      if (res.success) {
        setForgotSuccess({
          message: res.message,
          email: res.email || clean,
          isSelfSent: res.isSelfSent,
          refCode: res.refCode,
        });
      } else {
        setForgotError(res.message || 'Şifre hatırlatma işlemi tamamlanamadı. Lütfen bilgilerinizi kontrol ediniz.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Bir bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!identifier.trim()) {
      setLoginError('Lütfen e-posta veya telefon numaranızı giriniz.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Lütfen kayıt olurken belirlediğiniz şifrenizi giriniz.');
      return;
    }

    const targetRole: UserRole = isCourierFlow ? 'courier' : 'customer';
    const res = loginUser(identifier, password, targetRole);

    if (res.success && res.user) {
      const roleName = res.user.role === 'courier' ? 'Moto Kurye' : 'Müşteri';
      setLoginSuccess(`${roleName} girişi başarılı! Yönlendiriliyorsunuz...`);
      setTimeout(() => {
        if (res.user?.role === 'courier') {
          setCurrentView('courier');
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

    if (!customerTermsAccepted) {
      setCustomerError("Lütfen devam etmek için Kullanım Koşulları'nı okuyup onaylayınız.");
      return;
    }

    if (!customerKvkkAccepted) {
      setCustomerError("Lütfen devam etmek için KVKK Aydınlatma Metni'ni okuyup onaylayınız.");
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

    if (!courierTermsAccepted) {
      setCourierError("Lütfen devam etmek için Kullanım Koşulları'nı okuyup onaylayınız.");
      return;
    }

    if (!courierKvkkAccepted) {
      setCourierError("Lütfen devam etmek için KVKK Aydınlatma Metni'ni okuyup onaylayınız.");
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
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md text-white ${
              isForgotPassword
                ? 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-900/50'
                : isCourierFlow
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-900/50'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/50'
            }`}>
              {isForgotPassword ? (
                <KeyRound className="w-5 h-5 text-white" />
              ) : isCourierFlow ? (
                <Bike className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isForgotPassword
                  ? isCourierFlow
                    ? 'Kurye Şifre Hatırlatma'
                    : 'Müşteri Şifre Hatırlatma'
                  : isCourierFlow
                  ? isRegister
                    ? 'Yeni Kurye Kayıt & Başvuru'
                    : 'Kurye Girişi'
                  : isRegister
                  ? 'Ücretsiz Müşteri Kaydı'
                  : 'Müşteri Girişi'}
              </h3>
              <p className="text-xs text-emerald-300/80">
                {isForgotPassword
                  ? 'Kayıtlı e-posta adresinize şifre bilgisi gönderilir'
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

        {/* Navigation bar: Forgot Password Return Bar OR 2-Tab Navigation */}
        {isForgotPassword ? (
          <div className="flex items-center justify-between p-2 bg-[#050d09] rounded-xl border border-emerald-800/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setForgotError(null);
                setForgotSuccess(null);
                setAuthModalTab(isCourierFlow ? 'courier_login' : 'login');
              }}
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isCourierFlow ? 'Kurye Girişine Dön' : 'Giriş Ekranına Dön'}</span>
            </button>
            <span className="text-[11px] text-emerald-300/70 font-medium">Şifremi Unuttum</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#050d09] rounded-xl border border-emerald-800/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginError(null);
                setAuthModalTab(isCourierFlow ? 'courier_login' : 'login');
              }}
              className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                !isRegister
                  ? isCourierFlow
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              {isCourierFlow ? (
                <Bike className="w-3.5 h-3.5" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              <span>{isCourierFlow ? 'Kurye Girişi' : 'Giriş Yap'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCustomerError(null);
                setCourierError(null);
                setAuthModalTab(isCourierFlow ? 'courier_register' : 'register');
              }}
              className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                isRegister
                  ? isCourierFlow
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isCourierFlow ? 'Kurye Kayıt Ol' : 'Kayıt Ol'}</span>
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW A: CUSTOMER LOGIN */}
        {/* =================================================================== */}
        {!isCourierFlow && !isRegister && !isForgotPassword && (
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
              <label className="text-xs font-bold text-orange-400 block">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-orange-400 block">Şifre *</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(identifier);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setAuthModalTab('forgot_password');
                  }}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer transition"
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="password"
                  required
                  placeholder="Kayıtlı şifreniz"
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
        {!isCourierFlow && isRegister && !isForgotPassword && (
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
                <label className="text-[11px] font-bold text-orange-400 block">Ad Soyad *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Telefon Numarası *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">E-Posta Adresi *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Bulunduğunuz İlçe</label>
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
              <label className="text-[11px] font-bold text-orange-400 block">Firma / Mağaza Adı (İsteğe Bağlı)</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Şifre Belirleyin *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Şifre Tekrar *</label>
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

            {/* KULLANIM KOŞULLARI ONAYI */}
            <div className="p-3 bg-[#031812] rounded-xl border border-emerald-800/80 space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={customerTermsAccepted}
                  onChange={(e) => setCustomerTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md border-emerald-600 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 bg-[#06120d] cursor-pointer"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsAcceptTarget('customer');
                      setIsTermsModalOpen(true);
                    }}
                    className="font-bold text-emerald-400 hover:text-emerald-300 underline inline cursor-pointer mr-1"
                  >
                    Kullanım Koşulları'nı
                  </button>
                  okudum ve kabul ediyorum.
                </span>
              </label>
              <p className="text-[10px] text-emerald-400/80 pl-6.5 leading-relaxed">
                Antalya Teslimat'ın aracı ve ücretsiz bir platform olduğunu, taşıma ve ücret anlaşmasının bağımsız kurye ile doğrudan yapıldığını kabul etmektesiniz.
              </p>
            </div>

            {/* KVKK AYDINLATMA METNİ ONAYI */}
            <div className="p-3 bg-[#031812] rounded-xl border border-emerald-800/80 space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={customerKvkkAccepted}
                  onChange={(e) => setCustomerKvkkAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md border-emerald-600 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 bg-[#06120d] cursor-pointer"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setKvkkAcceptTarget('customer');
                      setIsKvkkModalOpen(true);
                    }}
                    className="font-bold text-emerald-400 hover:text-emerald-300 underline inline cursor-pointer mr-1"
                  >
                    KVKK Aydınlatma Metni'ni
                  </button>
                  okudum ve kabul ediyorum.
                </span>
              </label>
              <p className="text-[10px] text-emerald-400/80 pl-6.5 leading-relaxed">
                Kişisel verilerinizin 6698 sayılı KVKK kapsamında teslimat süreçlerinin yürütülmesi amacıyla işlenmesine ve aktarılmasına onay vermektesiniz.
              </p>
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
              <label className="text-xs font-bold text-orange-400 block">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-orange-400 block">Şifre *</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(identifier);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setAuthModalTab('courier_forgot_password');
                  }}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer transition"
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="password"
                  required
                  placeholder="Kayıtlı şifreniz"
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
        {isCourierFlow && isRegister && !isForgotPassword && (
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
                <label className="text-[11px] font-bold text-orange-400 block">Kurye Ad Soyad *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Telefon Numarası *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">E-Posta Adresi *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Taşıma Aracı Tipi</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Şifre Belirleyin *</label>
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
                <label className="text-[11px] font-bold text-orange-400 block">Şifre Tekrar *</label>
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

            {/* KULLANIM KOŞULLARI ONAYI */}
            <div className="p-3 bg-[#031812] rounded-xl border border-amber-800/80 space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={courierTermsAccepted}
                  onChange={(e) => setCourierTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md border-amber-600 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 bg-[#06120d] cursor-pointer"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsAcceptTarget('courier');
                      setIsTermsModalOpen(true);
                    }}
                    className="font-bold text-amber-400 hover:text-amber-300 underline inline cursor-pointer mr-1"
                  >
                    Kullanım Koşulları'nı
                  </button>
                  okudum ve kabul ediyorum.
                </span>
              </label>
              <p className="text-[10px] text-amber-400/80 pl-6.5 leading-relaxed">
                Antalya Teslimat'ın işveren veya istihdam eden olmadığını, bağımsız kurye/hizmet sağlayıcı olarak kendi adınıza hizmet sunduğunuzu kabul etmektesiniz.
              </p>
            </div>

            {/* KVKK AYDINLATMA METNİ ONAYI */}
            <div className="p-3 bg-[#031812] rounded-xl border border-amber-800/80 space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={courierKvkkAccepted}
                  onChange={(e) => setCourierKvkkAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md border-amber-600 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 bg-[#06120d] cursor-pointer"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setKvkkAcceptTarget('courier');
                      setIsKvkkModalOpen(true);
                    }}
                    className="font-bold text-amber-400 hover:text-amber-300 underline inline cursor-pointer mr-1"
                  >
                    KVKK Aydınlatma Metni'ni
                  </button>
                  okudum ve kabul ediyorum.
                </span>
              </label>
              <p className="text-[10px] text-amber-400/80 pl-6.5 leading-relaxed">
                Kurye hizmeti ve teslimat organizasyonu kapsamında kişisel verilerinizin 6698 sayılı KVKK'ya uygun şekilde işlenmesini kabul etmektesiniz.
              </p>
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
        {/* VIEW E: FORGOT PASSWORD (CUSTOMER OR COURIER) */}
        {/* =================================================================== */}
        {isForgotPassword && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
            <div className="p-3 bg-[#03231d] border border-emerald-700/60 rounded-xl text-xs text-emerald-200/90 leading-relaxed flex items-start gap-2.5 shadow-xs">
              <KeyRound className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white mb-0.5">Şifrenizi mi unuttunuz?</p>
                <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                  Kayıtlı e-posta adresinizi giriniz. Sistemde kayıtlı şifre hatırlatma bilgileriniz mail adresinize anında güvenli olarak gönderilecektir.
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-4 bg-[#03231d] border border-emerald-500/70 rounded-2xl text-xs text-emerald-200 space-y-3 shadow-lg">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-white text-sm">E-Posta Başarıyla Gönderildi!</p>
                    <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                      Şifre hatırlatma bilgileriniz <strong>{forgotSuccess.email}</strong> adresine Google SMTP sunucusu aracılığıyla iletildi.
                    </p>
                    {forgotSuccess.refCode && (
                      <p className="text-[10px] text-emerald-400/80 font-mono">
                        Güvenlik Referans Kodu: #{forgotSuccess.refCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detailed Deliverability Guidance */}
                <div className="p-3 bg-[#011612] border border-emerald-700/60 rounded-xl space-y-2 text-[11px] text-emerald-300/90 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Mail Adresinize Henüz Ulaşmadıysa:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-emerald-200/85">
                    <li>Lütfen e-posta kutunuzun <strong>Spam / İstenmeyen</strong> ve <strong>Tanıtımlar</strong> klasörlerini kontrol ediniz.</li>
                    <li>Gmail arama çubuğuna <strong>in:anywhere Antalya</strong> yazarak tüm klasörlerde aratabilirsiniz.</li>
                    {forgotSuccess.isSelfSent && (
                      <li className="text-amber-200 font-semibold">
                        <strong>Gmail Bildirimi:</strong> Kendi adresinize (kuryeantalyam@gmail.com) gönderildiği için Gmail bu mesajı Gelen Kutusu yerine <strong>"Gönderilmiş Öğeler" (Sent)</strong> veya <strong>"Tüm Postalar" (All Mail)</strong> sekmesinde gösterir.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier(forgotSuccess.email);
                      setForgotSuccess(null);
                      setAuthModalTab(isCourierFlow ? 'courier_login' : 'login');
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Giriş Ekranına Dön</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess(null);
                    }}
                    className="px-3 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            )}

            {!forgotSuccess && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-orange-400 block">
                    Kayıtlı E-Posta Adresi veya Telefon Numarası *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                    <input
                      type="text"
                      required
                      placeholder="ornek@antalya.com veya 05XX XXX XX XX"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="w-full bg-[#06120d] border border-emerald-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-400/80 pl-1">
                    Hesabınızın bağlı olduğu e-posta adresine şifre hatırlatma maili iletilecektir.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className={`w-full py-2.5 ${
                    isCourierFlow
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-600/30'
                      : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30'
                  } text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:opacity-60`}
                >
                  {forgotLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mail Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Şifremi Mail Adresime Gönder</span>
                    </>
                  )}
                </button>
              </>
            )}

            <div className="pt-2 border-t border-emerald-900/60 text-center">
              <button
                type="button"
                onClick={() => {
                  setForgotError(null);
                  setForgotSuccess(null);
                  setAuthModalTab(isCourierFlow ? 'courier_login' : 'login');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-white underline font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Giriş Yap Ekranına Geri Dön</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Terms of Use Modal */}
      <TermsOfUseModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          if (termsAcceptTarget === 'customer') {
            setCustomerTermsAccepted(true);
          } else {
            setCourierTermsAccepted(true);
          }
        }}
      />

      {/* KVKK Modal */}
      <KvkkModal
        isOpen={isKvkkModalOpen}
        onClose={() => setIsKvkkModalOpen(false)}
        onAccept={() => {
          if (kvkkAcceptTarget === 'customer') {
            setCustomerKvkkAccepted(true);
          } else {
            setCourierKvkkAccepted(true);
          }
        }}
      />
    </div>
  );
};
