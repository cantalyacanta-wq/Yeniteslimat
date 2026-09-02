import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';

export const AdminLoginGate: React.FC = () => {
  const { loginUser, setCurrentView } = useDelivery();
  const [identifier, setIdentifier] = useState('kuryeantalyam@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const cleanIdent = identifier.trim();
    const cleanPass = password.trim();

    const res = loginUser(cleanIdent, cleanPass, 'admin');

    if (res.success && res.user && res.user.role === 'admin') {
      setSuccess('Yönetici kimliği doğrulandı. Yönetim paneli açılıyor...');
      setTimeout(() => {
        setCurrentView('admin');
      }, 500);
    } else {
      setError(res.message || 'Geçersiz yönetici kullanıcı bilgisi veya şifresi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#021f19] border border-emerald-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-teal-900/50">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">Yönetici Güvenlik Kapısı</h2>
          <p className="text-xs text-emerald-300/80 max-w-xs mx-auto">
            Bu alana sadece yetkili sistem yöneticisi özel uzantı ve şifresiyle erişebilir.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/90 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-300 block">
              Yönetici E-Posta / Kullanıcı Adı
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="kuryeantalyam@gmail.com veya admin"
                className="w-full bg-[#051410] border border-emerald-800/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-300 block">
              Yönetici Giriş Şifresi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#051410] border border-emerald-800/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-hidden font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-teal-900/50 cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Doğrulanıyor...' : 'Giriş Yap ve Yönetim Panelini Aç'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-emerald-900/60 text-center">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
              setCurrentView('home');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400/80 hover:text-emerald-300 font-medium transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ana Sayfaya Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};
