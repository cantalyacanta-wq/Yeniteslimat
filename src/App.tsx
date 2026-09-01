import React, { useState, useEffect } from 'react';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Navbar } from './components/Navbar';
import { HeroIntro } from './components/HeroIntro';
import { CustomerRequestForm } from './components/CustomerRequestForm';
import { CourierPool } from './components/CourierPool';
import { OrderTracker } from './components/OrderTracker';
import { OrderHistory } from './components/OrderHistory';
import { AdminManagement } from './components/AdminManagement';
import { PaketTalebiPoolPage } from './components/PaketTalebiPoolPage';
import { AuthModal } from './components/AuthModal';
import { Bike, ShieldCheck, Zap } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, currentUser, setCurrentView, openAuthModal, switchUser } = useDelivery();

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Home View - Always the Classic Homepage */}
      {currentView === 'home' && (
        <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
          <HeroIntro />
        </main>
      )}

      {/* Dynamic Tab Views */}
      {currentView !== 'home' && (
        <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
          {currentView === 'customer' && <CustomerRequestForm />}
          {currentView === 'courier' && (
            currentUser.role === 'courier' || currentUser.role === 'admin' ? (
              <CourierPool />
            ) : (
              <div className="max-w-md mx-auto my-12 p-8 bg-[#021f19] border border-emerald-800/80 rounded-3xl text-center space-y-4 text-white shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                  <Bike className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-white">Kurye Yetkisi Gerekli</h3>
                  <p className="text-xs text-emerald-300/80">
                    Kurye havuzu ve anlık görevler kayıtlı moto kuryelerimiz ve yöneticiler içindir.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => switchUser('user-courier-01')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Ahmet Yılmaz (Kurye) Olarak Havuzu Aç</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('courier_login')}
                    className="w-full py-2.5 bg-emerald-800/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Farklı Kurye Girişi Yap
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('home')}
                    className="w-full py-2 bg-[#011410] hover:bg-[#02241d] text-emerald-400 font-medium text-xs rounded-xl transition border border-emerald-800/60 cursor-pointer"
                  >
                    Ana Sayfaya Dön
                  </button>
                </div>
              </div>
            )
          )}
          {currentView === 'tracker' && <OrderTracker />}
          {currentView === 'admin' && (
            currentUser.role === 'admin' ? (
              <AdminManagement />
            ) : (
              <div className="max-w-md mx-auto my-12 p-8 bg-[#021f19] border border-emerald-800/80 rounded-3xl text-center space-y-4 text-white shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-white">Yönetici Yetkisi Gerekli</h3>
                  <p className="text-xs text-emerald-300/80">
                    Yönetim paneli kurye onayları, irsaliyeler ve sistem kontrolü içindir.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => switchUser('user-admin-01')}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Yönetici Olarak Paneli Aç</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('admin_login')}
                    className="w-full py-2.5 bg-emerald-800/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Yönetici Girişi Yap
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('home')}
                    className="w-full py-2 bg-[#011410] hover:bg-[#02241d] text-emerald-400 font-medium text-xs rounded-xl transition border border-emerald-800/60 cursor-pointer"
                  >
                    Ana Sayfaya Dön
                  </button>
                </div>
              </div>
            )
          )}
          {currentView === 'history' && <OrderHistory />}
        </main>
      )}
    </div>
  );
};

const checkIsPaketTalebiRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.toLowerCase();
  const s = window.location.search.toLowerCase();
  const h = window.location.hash.toLowerCase();
  const keywords = ['pakettalebi', 'paket-talebi', 'pakettalep', 'kuryehavuz', 'kurye-havuz', 'havuz', 'pool'];
  return keywords.some((k) => p.includes(k) || s.includes(k) || h.includes(k));
};

const AppFooter: React.FC = () => {
  const { setCurrentView } = useDelivery();

  return (
    <footer className="border-t border-emerald-900/40 bg-[#011410] mt-12 py-6 text-xs text-emerald-400/70 w-full max-w-full">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-xs shadow-emerald-500/30">
            <Bike className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white">Antalya Şehir İçi Teslimat 7/24</span>
          <span className="text-emerald-500/80">© 2026 Antalya İçi 30-45 Dk Moto Kurye & Havuz</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-emerald-300/80 flex-wrap justify-center sm:justify-end text-[11px] sm:text-xs">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>30-45 Dk Moto Kurye</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [isPaketTalebiRoute, setIsPaketTalebiRoute] = useState<boolean>(checkIsPaketTalebiRoute);

  useEffect(() => {
    const checkRoute = () => {
      setIsPaketTalebiRoute(checkIsPaketTalebiRoute());
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  return (
    <DeliveryProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#021814] via-[#03241e] to-[#011410] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white w-full max-w-full overflow-x-hidden m-0 p-0">
        {/* Global Auth Modal */}
        <AuthModal />

        {/* Dedicated Standalone /pakettalebi Route View */}
        {isPaketTalebiRoute ? (
          <div className="flex-1 w-full">
            <PaketTalebiPoolPage />
          </div>
        ) : (
          <>
            {/* Responsive Navbar (Without links to /pakettalebi as requested) */}
            <Navbar />

            {/* Dynamic Views */}
            <div className="flex-1 w-full max-w-full">
              <MainContent />
            </div>

            {/* Minimal Responsive Footer */}
            <AppFooter />
          </>
        )}
      </div>
    </DeliveryProvider>
  );
}
