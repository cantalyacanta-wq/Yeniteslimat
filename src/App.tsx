import React from 'react';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Navbar } from './components/Navbar';
import { HeroIntro } from './components/HeroIntro';
import { CustomerRequestForm } from './components/CustomerRequestForm';
import { CourierPool } from './components/CourierPool';
import { OrderTracker } from './components/OrderTracker';
import { OrderHistory } from './components/OrderHistory';
import { AdminManagement } from './components/AdminManagement';
import { Bike, ShieldCheck, Zap } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView } = useDelivery();

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
          {currentView === 'courier' && <CourierPool />}
          {currentView === 'tracker' && <OrderTracker />}
          {currentView === 'admin' && <AdminManagement />}
          {currentView === 'history' && <OrderHistory />}
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <DeliveryProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#021814] via-[#03241e] to-[#011410] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white w-full max-w-full overflow-x-hidden m-0 p-0">
        {/* Responsive Navbar */}
        <Navbar />

        {/* Dynamic Views */}
        <div className="flex-1 w-full max-w-full">
          <MainContent />
        </div>

        {/* Minimal Responsive Footer */}
        <footer className="border-t border-emerald-900/40 bg-[#011410] mt-12 py-6 text-xs text-emerald-400/70 w-full max-w-full">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-xs shadow-emerald-500/30">
                <Bike className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white">Antalya Kurye Express</span>
              <span className="text-emerald-500/80">© 2026 Antalya İçi 30-45 Dk Moto Kurye</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-emerald-300/80 flex-wrap justify-center sm:justify-end text-[11px] sm:text-xs">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hızlı ve Güvenilir Teslimat</span>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>30-45 Dk Moto Kurye</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </DeliveryProvider>
  );
}
