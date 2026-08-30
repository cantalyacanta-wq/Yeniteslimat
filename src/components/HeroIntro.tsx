import React from 'react';
import {
  Bike,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Award,
  Navigation,
  FileCheck,
  CreditCard,
  Radio,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';
import { CustomerRequestForm } from './CustomerRequestForm';
import { ANTALYA_DISTRICTS } from '../data/antalyaDistricts';

export const HeroIntro: React.FC = () => {
  const { setCurrentView, poolRequests, requests, currentUser, openAuthModal } = useDelivery();

  const totalDelivered = requests.filter((r) => r.status === 'delivered').length + 420;

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* 1. Hero Welcome & Quick Stats Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#02231c] via-[#043328] to-[#011a14] border border-emerald-800/60 p-6 sm:p-10 shadow-2xl text-white">
        {/* Subtle background glow effect */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Antalya'nın 1 Numaralı 7/24 Moto Kurye Çağrı Ağı</span>
          </div>

          {/* Main Title & Subheading */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Antalya İçi Paket ve Evraklarınızı <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                30-45 Dakikada
              </span>{' '}
              Teslim Ediyoruz!
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
              Muratpaşa, Konyaaltı, Kepez, Lara ve tüm Antalya ilçelerinde restoran siparişleri, acil evrak, 
              anahtar ve koli gönderimlerinizi en yakın moto kuryemiz kapınızdan alıp güvenle ulaştırır.
            </p>
          </div>

          {/* Fast CTA Button Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                const formElem = document.getElementById('gonderi-formu-alani');
                if (formElem) {
                  formElem.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-emerald-500/30 flex items-center gap-2.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-5 h-5" />
              <span>Hemen Paket Gönder</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('courier')}
              className="px-5 py-3.5 bg-[#021813] hover:bg-[#032a21] text-emerald-200 border border-emerald-700/60 font-extrabold text-sm rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Kurye Havuzunu Aç ({poolRequests.length} Canlı İş)</span>
            </button>

            {currentUser.role === 'customer' && (
              <button
                type="button"
                onClick={() => openAuthModal('courier_login')}
                className="px-4 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bike className="w-4 h-4" />
                <span>Kurye Girişi / Başvuru</span>
              </button>
            )}
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-800/50">
            <div className="bg-[#011612] p-3 rounded-2xl border border-emerald-800/40 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400">100-150 ₺</span>
              <span className="text-[11px] text-emerald-300/80 block font-semibold">Şeffaf Sabit Fiyat</span>
            </div>

            <div className="bg-[#011612] p-3 rounded-2xl border border-emerald-800/40 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-300">~30 Dk</span>
              <span className="text-[11px] text-emerald-300/80 block font-semibold">Ortalama Teslimat</span>
            </div>

            <div className="bg-[#011612] p-3 rounded-2xl border border-emerald-800/40 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-teal-300">{totalDelivered}+</span>
              <span className="text-[11px] text-emerald-300/80 block font-semibold">Başarılı Teslimat</span>
            </div>

            <div className="bg-[#011612] p-3 rounded-2xl border border-emerald-800/40 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-amber-300">7/24</span>
              <span className="text-[11px] text-emerald-300/80 block font-semibold">Kesintisiz Hizmet</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Embedded Main Customer Request Creation Form */}
      <section id="gonderi-formu-alani" className="w-full">
        <CustomerRequestForm />
      </section>

      {/* 3. Value Propositions & Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
        <div className="bg-gradient-to-br from-[#021f19] to-[#011410] p-6 rounded-3xl border border-emerald-800/60 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">Anında Kurye Ataması</h3>
          <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
            Talebiniz sisteme girdiği anda en yakın uygun moto kurye havuza düşen görevi anında kabul eder ve kapınıza yönelir.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#021f19] to-[#011410] p-6 rounded-3xl border border-emerald-800/60 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shadow-md">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">Canlı GPS & SMS Takibi</h3>
          <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
            Paketinizin alış noktasından teslimat adresine kadar olan tüm yolculuğunu harita üzerinden adım adım canlı izleyebilirsiniz.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#021f19] to-[#011410] p-6 rounded-3xl border border-emerald-800/60 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">Güvenli & Dijital Makbuzlu</h3>
          <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
            Tüm paketler kuryelerimizce teslim alınırken ve teslim edilirken sistem üzerinde onaylanır, dijital irsaliye makbuzu üretilir.
          </p>
        </div>
      </section>

      {/* 4. Antalya Service Coverage Districts */}
      <section className="bg-[#02211b] rounded-3xl border border-emerald-800/60 p-6 sm:p-8 space-y-4 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/50 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Antalya Hizmet Bölgeleri & İlçeler</span>
            </h3>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Antalya Merkez ve çevre ilçelerde geniş moto kurye ağımızla hizmetinizdeyiz.
            </p>
          </div>
          <span className="text-[11px] font-bold bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/50 self-start sm:self-auto">
            10 İlçe Aktif
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
          {Object.keys(ANTALYA_DISTRICTS).map((districtName) => (
            <div
              key={districtName}
              className="bg-[#011410] border border-emerald-800/40 hover:border-emerald-500/60 p-3 rounded-2xl text-center transition group cursor-default"
            >
              <span className="text-xs font-bold text-emerald-200 group-hover:text-emerald-100 block">
                {districtName}
              </span>
              <span className="text-[10px] text-emerald-400/70 mt-0.5 block">Hızlı Teslimat</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
