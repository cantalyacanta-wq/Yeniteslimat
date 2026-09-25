import React, { useState, useEffect } from 'react';
import {
  Bike,
  Shield,
  LogOut,
  Package,
  User,
  Lock,
  Volume2,
  VolumeX,
  Smartphone,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import {
  isSoundAlertsEnabled,
  setSoundAlertsEnabled,
  playNewOrderSound,
  unlockAudioContext,
} from '../utils/audio';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeStats,
    currentUser,
    logout,
    openAuthModal,
    activeCourierDeliveries,
  } = useDelivery();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(isSoundAlertsEnabled);
  const [soundFeedback, setSoundFeedback] = useState<string | null>(null);

  useEffect(() => {
    const handleSync = () => setSoundEnabled(isSoundAlertsEnabled());
    window.addEventListener('antalya_sound_toggle', handleSync);
    return () => window.removeEventListener('antalya_sound_toggle', handleSync);
  }, []);

  const handleTestOrToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudioContext();
    if (!soundEnabled) {
      setSoundAlertsEnabled(true);
      setSoundEnabled(true);
      playNewOrderSound();
      setSoundFeedback('Ses Açıldı!');
    } else {
      playNewOrderSound();
      setSoundFeedback('Ses Test!');
    }
    setTimeout(() => setSoundFeedback(null), 2000);
  };

  const hasActiveCourierDelivery =
    currentUser.role === 'courier' &&
    Array.isArray(activeCourierDeliveries) &&
    activeCourierDeliveries.length > 0;

  interface NavItem {
    id: 'home' | 'customer' | 'courier' | 'tracker' | 'admin' | 'history';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string | null;
    badgeColor?: string;
  }

  // Dynamic Navigation Items tailored by Role
  const navItems: NavItem[] = React.useMemo(() => {
    if (currentUser.role === 'courier') {
      if (hasActiveCourierDelivery) {
        const currentActiveOrder = activeCourierDeliveries[0];
        return [
          {
            id: 'courier',
            label: `Aktif Siparişim (#${currentActiveOrder?.trackingCode || 'Görev'})`,
            icon: Lock,
            badge: 'Kilitli',
            badgeColor: 'bg-amber-400 text-slate-950 font-black animate-pulse',
          },
        ];
      }
      return [
        {
          id: 'courier',
          label: 'Bekleyen Talep Havuzu',
          icon: Bike,
          badge: activeStats.poolCount > 0 ? activeStats.poolCount : null,
          badgeColor: 'bg-amber-500 text-white font-extrabold animate-pulse',
        },
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        { id: 'admin', label: 'Yönetim Paneli', icon: Shield, badge: null, badgeColor: '' },
        {
          id: 'courier',
          label: 'Kurye Havuzu',
          icon: Bike,
          badge: activeStats.poolCount > 0 ? activeStats.poolCount : null,
          badgeColor: 'bg-amber-500 text-white font-extrabold animate-pulse',
        },
      ];
    }

    return [];
  }, [currentUser.role, activeStats.poolCount]);

  return (
    <header className="sticky top-0 z-40 bg-[#021c17]/95 backdrop-blur-md border-b border-emerald-900/60 shadow-lg w-full max-w-full text-white">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo and Brand Title */}
          <div
            onClick={() => {
              if (currentUser.role === 'courier') {
                setCurrentView('courier');
              } else if (currentUser.role === 'admin') {
                setCurrentView('admin');
              } else {
                setCurrentView('home');
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group min-w-0 shrink"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition shrink-0 shadow-emerald-500/30">
              <Bike className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="font-extrabold text-xs sm:text-sm md:text-base text-white tracking-tight whitespace-nowrap">
                  Antalya <span className="text-emerald-400">Şehir İçi Teslimat</span>
                </span>
                <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 sm:py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                  7/24
                </span>
              </div>
              <p className="text-[10px] text-emerald-400/80 hidden md:block truncate">Acil Moto Kurye & Hızlı Paket Havuzu</p>
            </div>
          </div>

          {/* Navigation Items (for courier / admin) */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id || (item.id === 'admin' && currentView === 'history');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentView(item.id as any)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-md'
                        : 'text-emerald-100/75 hover:text-white hover:bg-emerald-950/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-emerald-400/70'}`} />
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Section: Compact Button or Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Kurye APK / PWA İndir Butonu */}
            <a
              href="/downloads/Antalya-Kurye-Talep-Havuzu.apk"
              download="Antalya-Kurye-Talep-Havuzu.apk"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-[11px] sm:text-xs transition shadow-md shadow-red-950/40 border border-amber-400/40 active:scale-95 shrink-0"
              title="Kuryeler İçin Talep Havuzu Android APK İndir"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="whitespace-nowrap">APK İndir</span>
            </a>

            {/* Audio Alert Status & Test Button */}
            <button
              type="button"
              onClick={handleTestOrToggleSound}
              title={soundEnabled ? 'Bildirim sesi aktif. Sesi test etmek için tıklayın.' : 'Bildirim sesi kapalı. Açmak için tıklayın.'}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none border active:scale-95 shadow-xs ${
                soundEnabled
                  ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-600/60 text-emerald-300'
                  : 'bg-rose-950/50 hover:bg-rose-900/60 border-rose-700/50 text-rose-300'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span className="hidden sm:inline text-[11px] whitespace-nowrap">
                {soundFeedback || (soundEnabled ? 'Sesli Bildirim' : 'Sessiz')}
              </span>
              {soundEnabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 hidden sm:inline" />
              )}
            </button>

            {/* If logged in with active account */}
            {currentUser.id !== 'user-guest-01' && currentUser.email ? (
              <>
                {/* User Profile Info Badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl border border-emerald-800/60 bg-[#03241d] text-xs text-white">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-[10px] sm:text-[11px] ${
                      currentUser.role === 'customer'
                        ? 'bg-emerald-600'
                        : currentUser.role === 'courier'
                        ? 'bg-amber-600'
                        : 'bg-teal-600'
                    }`}
                  >
                    {currentUser.name.split(' ')[0][0]}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-white text-xs truncate max-w-[90px] sm:max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium capitalize">
                      {currentUser.role === 'customer'
                        ? 'Müşteri'
                        : currentUser.role === 'courier'
                        ? 'Moto Kurye'
                        : 'Yönetici'}
                    </div>
                  </div>
                </div>

                {/* Direct Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  title="Oturumu Kapat / Çıkış Yap"
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden md:inline text-[11px]">Çıkış</span>
                </button>
              </>
            ) : (
              /* If Guest / Not Logged In -> Dedicated Courier Login Button in Header Banner */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('courier_login')}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md active:scale-95 border border-amber-400/40 shrink-0"
                  title="Moto Kurye Girişi & Şifre İşlemleri"
                >
                  <Bike className="w-3.5 h-3.5 text-amber-100 shrink-0" />
                  <span className="whitespace-nowrap">Kurye Girişi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
