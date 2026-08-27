import React from 'react';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Navbar } from './components/Navbar';
import { CustomerRequestForm } from './components/CustomerRequestForm';
import { CourierPool } from './components/CourierPool';
import { OrderTracker } from './components/OrderTracker';
import { OrderHistory } from './components/OrderHistory';
import { Bike, ShieldCheck, MapPin, Phone } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView } = useDelivery();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Dynamic Main View */}
      {currentView === 'customer' && <CustomerRequestForm />}
      {currentView === 'courier' && <CourierPool />}
      {currentView === 'tracker' && <OrderTracker />}
      {currentView === 'history' && <OrderHistory />}
    </main>
  );
};

export default function App() {
  return (
    <DeliveryProvider>
      <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
        {/* Simple Navbar */}
        <Navbar />

        {/* Dynamic Views */}
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Minimal Clean Footer */}
        <footer className="border-t border-slate-200 bg-white mt-12 py-6 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-orange-600 flex items-center justify-center text-white font-bold text-[10px]">
                <Bike className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-800">Antalya Kurye Express</span>
              <span className="text-slate-400">© 2026 Antalya İçi Hızlı & Güvenilir Moto Kurye</span>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                4 Haneli Kod Güvenliği
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                Muratpaşa, Konyaaltı, Kepez, Lara, Aksu
              </span>
            </div>
          </div>
        </footer>
      </div>
    </DeliveryProvider>
  );
}
