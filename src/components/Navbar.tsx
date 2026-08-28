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
    id: 'home' | 'customer' | 'courier';
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
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#021c17]/95 backdrop-blur-md border-b border-emerald-900/60 shadow-lg w-full max-w-full text-white">
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
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition shrink-0 shadow-emerald-500/30">
              <Bike className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Antalya<span className="text-emerald-400">Kurye</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                  Express
                </span>
              </div>
              <p className="text-[10px] text-emerald-400/80 hidden sm:block truncate">Şehir İçi Jet Teslimat</p>
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
                      ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/40 shadow-xs'
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

          {/* Right Section: Role / Profile Button & DB tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Role / Profile Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-800/60 bg-[#03241d] hover:bg-[#042d25] transition cursor-pointer text-xs text-white"
              title="Rolü veya Profili Değiştir"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${
                  currentUser.role === 'customer'
                    ? 'bg-emerald-600'
                    : currentUser.role === 'courier'
                    ? 'bg-amber-600'
                    : 'bg-teal-600'
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
                <div className="font-bold text-white text-xs truncate max-w-[100px] sm:max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium capitalize">
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
              className="p-1.5 text-emerald-400/80 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* DB Export / Backup Button (desktop) */}
            <button
              type="button"
              onClick={exportDatabaseBackup}
              title="Veritabanını Yedekle (Kalıcı JSON)"
              className="hidden lg:flex p-1.5 text-emerald-400/80 hover:text-white hover:bg-emerald-900/50 rounded-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 transition cursor-pointer"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Guaranteed no overflow) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-900/60 py-3 space-y-1 bg-[#021c17] max-w-full">
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
                    isActive ? 'bg-emerald-900/70 text-emerald-300 font-bold' : 'text-emerald-100/80 hover:bg-emerald-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-emerald-400/60'}`} />
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
            <div className="pt-2 mt-2 border-t border-emerald-900/50 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-between px-3 py-2 bg-[#03241d] rounded-lg text-xs font-bold text-white border border-emerald-800/40"
                >
                  <span className="truncate">Profil: {currentUser.name}</span>
                  <span className="text-emerald-400 text-[11px] shrink-0">Değiştir &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer border border-rose-900/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıkış</span>
                </button>
              </div>

              <div className="flex items-center gap-2 px-1">
                <button
                  type="button"
                  onClick={exportDatabaseBackup}
                  className="flex-1 py-1.5 px-2 bg-[#03241d] hover:bg-[#042d25] text-emerald-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 border border-emerald-800/40"
                >
                  <Download className="w-3.5 h-3.5" /> Yedek İndir
                </button>
                <label className="flex-1 py-1.5 px-2 bg-[#03241d] hover:bg-[#042d25] text-emerald-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-emerald-800/40">
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
                <div className="text-center text-xs font-bold text-emerald-400 py-1">
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
