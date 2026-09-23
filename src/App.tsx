import React, { useState, useEffect } from 'react';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Navbar } from './components/Navbar';
import { HeroIntro } from './components/HeroIntro';
import { CustomerRequestForm } from './components/CustomerRequestForm';
import { CourierPool } from './components/CourierPool';
import { OrderTracker } from './components/OrderTracker';
import { OrderHistory } from './components/OrderHistory';
import { AdminManagement } from './components/AdminManagement';
import { AdminLoginGate } from './components/AdminLoginGate';
import { PaketTalebiPoolPage } from './components/PaketTalebiPoolPage';
import { AuthModal } from './components/AuthModal';
import { TermsOfUseModal } from './components/TermsOfUseModal';
import { KvkkModal } from './components/KvkkModal';
import { Bike, ShieldCheck, Zap, FileText } from 'lucide-react';

const checkIsAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.toLowerCase();
  const s = window.location.search.toLowerCase();
  const h = window.location.hash.toLowerCase();
  const keywords = ['admin', 'yonetim', 'yonetimpaneli', 'yonetici', 'panel'];
  return keywords.some((k) => p.includes(k) || s.includes(k) || h.includes(k));
};

const MainContent: React.FC = () => {
  const { currentView, currentUser, setCurrentView, openAuthModal, switchUser, activeCourierDeliveries } = useDelivery();

  // If courier has an active delivery in progress, lock them strictly to the courier panel until delivered!
  React.useEffect(() => {
    if (
      currentUser.role === 'courier' &&
      activeCourierDeliveries &&
      activeCourierDeliveries.length > 0 &&
      currentView !== 'courier'
    ) {
      setCurrentView('courier');
    }
  }, [currentUser.role, activeCourierDeliveries, currentView, setCurrentView]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Home View - If courier, always show CourierPool */}
      {currentView === 'home' && (
        <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
          {currentUser.role === 'courier' ? <CourierPool /> : <HeroIntro />}
        </main>
      )}

      {/* Dynamic Tab Views */}
      {currentView !== 'home' && (
        <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
          {currentView === 'customer' && (
            currentUser.role === 'courier' ? <CourierPool /> : <CustomerRequestForm />
          )}
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
                    onClick={() => openAuthModal('courier_login')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Kurye Girişi Yap (Kayıtlı Şifrenizle)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('courier_register')}
                    className="w-full py-2.5 bg-emerald-800/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Yeni Kurye Başvurusu / Kayıt Ol</span>
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
              <AdminLoginGate />
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

const AppFooter: React.FC<{ onOpenTerms: () => void; onOpenKvkk: () => void }> = ({
  onOpenTerms,
  onOpenKvkk,
}) => {
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
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-emerald-400 hover:text-emerald-200 underline font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kullanım Koşulları</span>
            </button>
            <span className="text-emerald-800">•</span>
            <button
              type="button"
              onClick={onOpenKvkk}
              className="text-emerald-400 hover:text-emerald-200 underline font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KVKK Aydınlatma Metni</span>
            </button>
            <span className="text-emerald-800">•</span>
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className="text-emerald-400 hover:text-emerald-200 underline font-semibold transition cursor-pointer flex items-center gap-1"
              title="Yönetim Paneli Girişi"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Yönetim</span>
            </button>
            <span className="text-emerald-800">•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>30-45 Dk Moto Kurye</span>
            </span>
          </div>
        </div>
    </footer>
  );
};

const AppViewRouter: React.FC<{ isPaketTalebiRoute: boolean }> = ({ isPaketTalebiRoute }) => {
  const { setCurrentView, recordSiteVisit, isImpersonating, returnToAdmin, currentUser } = useDelivery();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentView('admin');
      }
      if (recordSiteVisit) {
        recordSiteVisit(window.location.pathname + window.location.hash);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [setCurrentView, recordSiteVisit]);

  return (
    <>
      {/* Global Auth Modal */}
      <AuthModal />

      {/* Dedicated Standalone /pakettalebi Route View */}
      {isPaketTalebiRoute ? (
        <div className="flex-1 w-full">
          <PaketTalebiPoolPage />
        </div>
      ) : (
        <>
          {/* Admin Impersonation Banner */}
          {isImpersonating && (
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-white text-xs py-2 px-3 sm:px-6 flex items-center justify-between shadow-lg sticky top-0 z-50 border-b border-amber-400/50">
              <div className="flex items-center gap-2 font-medium min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping shrink-0" />
                <span className="truncate">
                  <strong>Yönetici Önizleme Modu:</strong> Şu anda <span className="font-bold underline text-amber-100">{currentUser.name}</span> ({currentUser.role === 'courier' ? 'Moto Kurye' : 'Müşteri'}) hesabı olarak görüntülüyorsunuz.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  returnToAdmin();
                  setCurrentView('admin');
                }}
                className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-[11px] sm:text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0 ml-2 active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Yönetim Paneline Dön</span>
              </button>
            </div>
          )}

          {/* Responsive Navbar */}
          <Navbar />

          {/* Dynamic Views */}
          <div className="flex-1 w-full max-w-full">
            <MainContent />
          </div>

          {/* Minimal Responsive Footer */}
          <AppFooter
            onOpenTerms={() => setIsTermsModalOpen(true)}
            onOpenKvkk={() => setIsKvkkModalOpen(true)}
          />
        </>
      )}

      {/* Global Terms of Use Modal */}
      <TermsOfUseModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* Global KVKK Modal */}
      <KvkkModal
        isOpen={isKvkkModalOpen}
        onClose={() => setIsKvkkModalOpen(false)}
      />
    </>
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
        <AppViewRouter isPaketTalebiRoute={isPaketTalebiRoute} />
      </div>
    </DeliveryProvider>
  );
}
