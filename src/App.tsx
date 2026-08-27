import React from 'react';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Navbar } from './components/Navbar';
import { HeroIntro } from './components/HeroIntro';
import { AuthModal } from './components/AuthModal';
import { CustomerRequestForm } from './components/CustomerRequestForm';
import { CourierPool } from './components/CourierPool';
import { OrderTracker } from './components/OrderTracker';
import { OrderHistory } from './components/OrderHistory';
import { Bike, ShieldCheck, Zap } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView } = useDelivery();

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* If Home view, show ONLY Hero Intro with integrated Membership & Login portal */}
      {currentView === 'home' && (
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
          <HeroIntro />
        </main>
      )}

      {/* Dynamic Tab Views */}
      {currentView !== 'home' && (
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {currentView === 'customer' && <CustomerRequestForm />}
          {currentView === 'courier' && <CourierPool />}
          {currentView === 'tracker' && <OrderTracker />}
          {currentView === 'history' && <OrderHistory />}
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <DeliveryProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white w-full max-w-full overflow-x-hidden">
        {/* Responsive Navbar */}
        <Navbar />

        {/* Dynamic Views */}
        <div className="flex-1 w-full max-w-full">
          <MainContent />
        </div>

        {/* Role & Membership Modal */}
        <AuthModal />

        {/* Minimal Responsive Footer */}
        <footer className="border-t border-slate-200 bg-white mt-12 py-6 text-xs text-slate-500 w-full max-w-full">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                <Bike className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-900">Antalya Kurye Express</span>
              <span className="text-slate-400">© 2026 Antalya İçi 30-45 Dk Moto Kurye</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-slate-600 flex-wrap justify-center sm:justify-end text-[11px] sm:text-xs">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Hızlı ve Güvenilir Teslimat</span>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>30-45 Dk Moto Kurye</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </DeliveryProvider>
  );
}
