import React, { useState } from 'react';
import {
  Send,
  Bike,
  Search,
  History,
  Menu,
  X,
  User,
  Shield,
  Download,
  Upload,
  Home,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeStats,
    currentUser,
    setIsAuthModalOpen,
    exportDatabaseBackup,
    importDatabaseBackup,
    logout,
  } = useDelivery();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseBackup(content);
        if (ok) {
          setImportStatus('Veritabanı yüklendi!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Hatalı dosya formatı.');
          setTimeout(() => setImportStatus(null), 3000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  interface NavItem {
    id: 'home' | 'customer' | 'courier' | 'tracker' | 'history';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Ana Sayfa', icon: Home, badge: null, badgeColor: '' },
    { id: 'customer', label: 'Paket Gönder', icon: Send, badge: null, badgeColor: '' },
    {
      id: 'courier',
      label: 'Kurye Havuzu',
      icon: Bike,
      badge: activeStats.poolCount > 0 ? activeStats.poolCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'tracker', label: 'Kargo Takip', icon: Search, badge: null, badgeColor: '' },
    { id: 'history', label: 'Geçmiş & Kayıtlar', icon: History, badge: null, badgeColor: '' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo */}
          <div
            onClick={() => {
              setCurrentView('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  Antalya<span className="text-sky-600">Kurye</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                  Express
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">Şehir İçi Jet Teslimat</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Role / Profile Button & DB tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Role / Profile Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-xs"
              title="Rolü veya Profili Değiştir"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${
                  currentUser.role === 'customer'
                    ? 'bg-sky-600'
                    : currentUser.role === 'courier'
                    ? 'bg-amber-600'
                    : 'bg-indigo-600'
                }`}
              >
                {currentUser.role === 'customer' ? (
                  <User className="w-3.5 h-3.5" />
                ) : currentUser.role === 'courier' ? (
                  <Bike className="w-3.5 h-3.5" />
                ) : (
                  <Shield className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-left hidden xs:block">
                <div className="font-bold text-slate-800 text-xs truncate max-w-[100px] sm:max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium capitalize">
                  {currentUser.role === 'customer'
                    ? 'Müşteri'
                    : currentUser.role === 'courier'
                    ? 'Moto Kurye'
                    : 'Yönetici'}
                </div>
              </div>
            </button>

            {/* Logout Quick Button */}
            <button
              type="button"
              onClick={logout}
              title="Oturumu Kapat"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* DB Export / Backup Button (desktop) */}
            <button
              type="button"
              onClick={exportDatabaseBackup}
              title="Veritabanını Yedekle (Kalıcı JSON)"
              className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Guaranteed no overflow) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1 bg-white/95 max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    isActive ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Role & Backup inside mobile menu */}
            <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-800"
                >
                  <span className="truncate">Profil: {currentUser.name}</span>
                  <span className="text-sky-600 text-[11px] shrink-0">Değiştir &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıkış</span>
                </button>
              </div>

              <div className="flex items-center gap-2 px-1">
                <button
                  type="button"
                  onClick={exportDatabaseBackup}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Yedek İndir
                </button>
                <label className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Yedek Yükle
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div className="text-center text-xs font-bold text-emerald-600 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                  {importStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
