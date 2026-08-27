import React from 'react';
import { 
  Bike, 
  PackagePlus, 
  History, 
  Sparkles, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';

export const Navbar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    poolRequests, 
    activeCourierDeliveries,
    addDemoRequest,
    resetDefaultData
  } = useDelivery();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView('customer')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Antalya<span className="text-orange-600">Kurye</span></span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-md">Express</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium hidden sm:block">Şehir İçi Hızlı Paket & Moto Dağıtım</p>
            </div>
          </div>

          {/* Simple Main Navigation */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {/* Customer Panel */}
            <button
              onClick={() => setCurrentView('customer')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentView === 'customer' || currentView === 'tracker'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PackagePlus className="w-4 h-4 text-orange-600" />
              <span>Paket Gönder</span>
            </button>

            {/* Courier Pool */}
            <button
              onClick={() => setCurrentView('courier')}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentView === 'courier'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Bike className="w-4 h-4 text-blue-600" />
              <span>Kurye Havuzu</span>
              {poolRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white font-bold text-[10px] rounded-full animate-pulse">
                  {poolRequests.length}
                </span>
              )}
            </button>

            {/* History / Orders */}
            <button
              onClick={() => setCurrentView('history')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentView === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <History className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Geçmiş</span>
            </button>
          </nav>

          {/* Quick Demo Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={addDemoRequest}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition cursor-pointer"
              title="Havuz için hazır örnek talep ekle"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">+ Örnek Talep</span>
            </button>
            <button
              onClick={resetDefaultData}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Varsayılana Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
