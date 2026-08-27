import React from 'react';
import { Clock, ShieldCheck, Zap, Bike, CheckCircle2 } from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';

export const StatsBanner: React.FC = () => {
  const { activeStats } = useDelivery();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            Antalya İçi Jet Moto Kurye Ağı
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Dakikalar İçinde Kapınızda, Güvenle Teslimatta
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Talebinizi oluşturun, en yakın moto kurye anında teslim alsın. Tüm Antalya merkez ilçelerinde kapıdan kapıya 30-60 dk express teslimat.
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs text-slate-300 font-medium">Ort. Teslimat</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">28 dk</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
              <Bike className="w-4 h-4" />
              <span className="text-xs text-slate-300 font-medium">Aktif Kurye</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">24 Moto</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-xs text-slate-300 font-medium">Havuzda</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">{activeStats.poolCount} Talep</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-white/5">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs text-slate-300 font-medium">Bugün Biten</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">{activeStats.completedTodayCount + 18}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
