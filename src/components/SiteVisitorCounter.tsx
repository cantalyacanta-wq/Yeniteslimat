import React, { useState } from 'react';
import {
  Eye,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useDelivery } from '../context/DeliveryContext';

interface SiteVisitorCounterProps {
  variant?: 'compact' | 'detailed' | 'public';
  onNavigateToDetailed?: () => void;
}

export const SiteVisitorCounter: React.FC<SiteVisitorCounterProps> = ({
  variant = 'compact',
  onNavigateToDetailed,
}) => {
  const { visitorStats, resetSiteCounter, syncWithServer } = useDelivery();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [initialValue, setInitialValue] = useState('0');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalVisits = visitorStats?.totalVisits ?? 0;
  const todayVisits = visitorStats?.todayVisits ?? 0;
  const uniqueVisitors = visitorStats?.uniqueVisitors ?? 0;
  const activeNow = visitorStats?.activeNow ?? (totalVisits > 0 ? 1 : 0);
  const recentVisitors = visitorStats?.recentVisitors || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncWithServer();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetMessage(null);
    try {
      const num = parseInt(initialValue, 10);
      const ok = await resetSiteCounter(isNaN(num) ? 0 : Math.max(0, num));
      if (ok) {
        setResetMessage('Site sayacı başarıyla güncellendi.');
        setTimeout(() => {
          setIsResetModalOpen(false);
          setResetMessage(null);
        }, 1200);
      } else {
        setResetMessage('Sayaç güncellenemedi, lütfen tekrar deneyin.');
      }
    } catch {
      setResetMessage('Bir hata oluştu.');
    } finally {
      setIsResetting(false);
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Az önce';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins} dk önce`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} sa önce`;
      return new Date(isoString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return 'Yakın zamanda';
    }
  };

  // --------------------------------------------------------------------------
  // PUBLIC VARIANT (For Site Footer / Public Visitors)
  // --------------------------------------------------------------------------
  if (variant === 'public') {
    return (
      <div className="w-full max-w-5xl mx-auto my-3 px-3.5 py-3 sm:py-2.5 rounded-2xl bg-[#021a14]/95 border border-emerald-800/70 shadow-lg text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Title & Live Status */}
          <button
            type="button"
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-3 text-left hover:opacity-90 transition cursor-pointer group"
            title="Ayrıntılı ziyaretçi istatistiklerini görüntüle"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/90 group-hover:bg-emerald-500 border border-emerald-500/50 flex items-center justify-center text-white shadow-xs transition">
                <Eye className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight group-hover:text-emerald-300 transition">
                  Canlı Site Ziyaretçi Sayacı
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-full font-bold">
                  Canlı
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80">
                Antalya İçi Kurye Ağı • Gerçek Zamanlı Takip
              </p>
            </div>
          </button>

          {/* Metric Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center">
            {/* Toplam Ziyaret */}
            <div
              onClick={() => setIsStatsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#011410] hover:bg-[#022119] border border-emerald-800/80 rounded-xl transition cursor-pointer"
              title="Toplam Sayfa Görüntüleme"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase font-bold text-emerald-400/90 tracking-wider">
                  Toplam
                </span>
                <span className="text-xs sm:text-sm font-black text-white font-mono">
                  {totalVisits.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Bugün */}
            <div
              onClick={() => setIsStatsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#011410] hover:bg-[#022119] border border-emerald-800/80 rounded-xl transition cursor-pointer"
              title="Bugünkü Ziyaret Sayısı"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase font-bold text-amber-400/90 tracking-wider">
                  Bugün
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                  +{todayVisits.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Tekil Ziyaretçi */}
            <div
              onClick={() => setIsStatsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#011410] hover:bg-[#022119] border border-emerald-800/80 rounded-xl transition cursor-pointer"
              title="Farklı Tekil Ziyaretçiler"
            >
              <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase font-bold text-teal-400/90 tracking-wider">
                  Tekil
                </span>
                <span className="text-xs sm:text-sm font-black text-teal-200 font-mono">
                  {uniqueVisitors.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Çevrimiçi */}
            <div
              onClick={() => setIsStatsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#011410] hover:bg-[#022119] border border-emerald-800/80 rounded-xl transition cursor-pointer"
              title="Anlık Çevrimiçi Ziyaretçi"
            >
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase font-bold text-emerald-400/90 tracking-wider">
                  Çevrimiçi
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                  {activeNow} aktif
                </span>
              </div>
            </div>

            {/* Manuel Yenileme Butonu */}
            <button
              type="button"
              onClick={handleRefresh}
              title="Sayacı Anlık Güncelle"
              className="p-2 rounded-xl bg-[#011410] hover:bg-emerald-950 text-emerald-300 border border-emerald-800/80 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Public Details Modal */}
        {isStatsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-6 max-w-md w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ziyaretçi İstatistikleri</h4>
                    <p className="text-[11px] text-emerald-300/80">Antalya Şehir İçi Moto Kurye</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#011410] p-3 rounded-xl border border-emerald-800/70">
                  <span className="text-[10px] text-emerald-400/80 block font-semibold uppercase">Toplam Görüntüleme</span>
                  <span className="text-xl font-black text-white font-mono">{totalVisits.toLocaleString('tr-TR')}</span>
                </div>
                <div className="bg-[#011410] p-3 rounded-xl border border-emerald-800/70">
                  <span className="text-[10px] text-amber-400/80 block font-semibold uppercase">Bugün Ziyaret</span>
                  <span className="text-xl font-black text-amber-300 font-mono">+{todayVisits.toLocaleString('tr-TR')}</span>
                </div>
                <div className="bg-[#011410] p-3 rounded-xl border border-emerald-800/70">
                  <span className="text-[10px] text-teal-400/80 block font-semibold uppercase">Tekil Kullanıcı</span>
                  <span className="text-xl font-black text-teal-200 font-mono">{uniqueVisitors.toLocaleString('tr-TR')}</span>
                </div>
                <div className="bg-[#011410] p-3 rounded-xl border border-emerald-800/70">
                  <span className="text-[10px] text-emerald-400/80 block font-semibold uppercase">Anlık Çevrimiçi</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{activeNow} kişi</span>
                </div>
              </div>

              <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40 text-xs text-emerald-300/90 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nasıl Çalışır?</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                  Web sitemize gelen her ziyaret ve sayfa değişimi otomatik olarak sayılır. Veriler Cloud Firestore ve sunucu veri tabanı ile anlık olarak senkronize edilir.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // COMPACT VARIANT (For Admin Header / Top Bar)
  // --------------------------------------------------------------------------
  if (variant === 'compact') {
    return (
      <div
        onClick={onNavigateToDetailed}
        className={`bg-[#011410] px-3.5 py-2 rounded-2xl border border-emerald-800/80 text-emerald-300 flex items-center gap-3 transition cursor-pointer hover:border-emerald-600 hover:bg-[#021c16] shadow-sm select-none`}
        title="Site ziyaretçi istatistiklerini görüntülemek için tıklayın"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center text-emerald-300">
            <Eye className="w-4 h-4" />
          </div>
          {/* Pulsing online indicator */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[10px] uppercase font-bold text-emerald-400/90 tracking-wider">
              Site Sayacı
            </span>
            <span className="text-[9px] px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded font-semibold">
              Canlı
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <strong className="text-sm font-black text-white">{totalVisits.toLocaleString('tr-TR')}</strong>
            <span className="text-[11px] text-emerald-300/80">toplam</span>
            <span className="text-emerald-700">•</span>
            <span className="text-[11px] font-bold text-amber-300">+{todayVisits} bugün</span>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // DETAILED VARIANT (For System / Analytics Tab)
  // --------------------------------------------------------------------------
  return (
    <div className="bg-[#021d17] p-5 sm:p-6 rounded-3xl border border-emerald-800/70 text-white space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/90 flex items-center justify-center text-white shadow-md shadow-emerald-700/30 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                Canlı Site Ziyaretçi Sayacı
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Canlı İzleme
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Antalya Kurye web sitesine gelen gerçek zamanlı ziyaretçi ve sayfa görüntüleme sayısı.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            title="Verileri yenile"
            className="px-3 py-2 bg-[#032920] hover:bg-[#043328] text-emerald-200 border border-emerald-800/80 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Yenile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            title="Sayacı sıfırla veya başlangıç değeri ata"
            className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Sayacı Sıfırla / Düzenle</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Toplam Ziyaret */}
        <div className="bg-[#021813] p-4 rounded-2xl border border-emerald-800/60 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400/90 text-xs font-medium">
            <span>Toplam Ziyaret</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalVisits.toLocaleString('tr-TR')}
          </p>
          <span className="text-[10px] text-emerald-300/80 block">
            Toplam sayfa görüntüleme
          </span>
        </div>

        {/* Card 2: Bugünkü Ziyaretler */}
        <div className="bg-[#021813] p-4 rounded-2xl border border-emerald-800/60 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400/90 text-xs font-medium">
            <span>Bugünkü Ziyaret</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
            +{todayVisits.toLocaleString('tr-TR')}
          </p>
          <span className="text-[10px] text-emerald-300/80 block">
            Bugün gelen kullanıcılar
          </span>
        </div>

        {/* Card 3: Tekil Ziyaretçiler */}
        <div className="bg-[#021813] p-4 rounded-2xl border border-emerald-800/60 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-teal-400/90 text-xs font-medium">
            <span>Tekil Ziyaretçi</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-200 tracking-tight">
            {uniqueVisitors.toLocaleString('tr-TR')}
          </p>
          <span className="text-[10px] text-emerald-300/80 block">
            Farklı cihaz / tarayıcı
          </span>
        </div>

        {/* Card 4: Anlık Çevrimiçi */}
        <div className="bg-[#021813] p-4 rounded-2xl border border-emerald-800/60 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-medium">
            <span>Anlık Aktif</span>
            <div className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight flex items-baseline gap-1.5">
            {activeNow}
            <span className="text-xs font-semibold text-emerald-300/70">kişi</span>
          </p>
          <span className="text-[10px] text-emerald-300/80 block">
            Son 10 dk içinde sitede olan
          </span>
        </div>
      </div>

      {/* Son Ziyaretçi Akışı (Recent Visitors Log) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300/90 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Son Ziyaretçi Akışı</span>
          </h4>
          <span className="text-[11px] text-emerald-400/70">
            {recentVisitors.length > 0 ? `${recentVisitors.length} kayıt gösteriliyor` : 'Henüz ziyaret kaydedilmedi'}
          </span>
        </div>

        {recentVisitors.length === 0 ? (
          <div className="bg-[#011410] p-6 rounded-2xl border border-emerald-900/60 text-center text-emerald-400/70 text-xs">
            Siteye henüz yeni bir ziyaretçi kaydı düşmedi. Sayfa yenilendiğinde otomatik sayılacaktır.
          </div>
        ) : (
          <div className="bg-[#011410] rounded-2xl border border-emerald-900/60 overflow-hidden divide-y divide-emerald-900/40 max-h-72 overflow-y-auto">
            {recentVisitors.map((vis) => (
              <div
                key={vis.id}
                className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-[#021f19] transition gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-900/70 border border-emerald-800/80 flex items-center justify-center text-emerald-300 shrink-0">
                    {vis.deviceType === 'mobile' ? (
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    ) : vis.deviceType === 'tablet' ? (
                      <Tablet className="w-3.5 h-3.5 text-teal-400" />
                    ) : (
                      <Monitor className="w-3.5 h-3.5 text-emerald-300" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">
                        {vis.deviceType === 'mobile'
                          ? 'Mobil Ziyaretçi'
                          : vis.deviceType === 'tablet'
                          ? 'Tablet Ziyaretçi'
                          : 'Masaüstü Ziyaretçi'}
                      </span>
                      {vis.isUnique && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-teal-950 text-teal-300 border border-teal-800 rounded font-bold">
                          Yeni
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400/70 block truncate">
                      Sayfa: <span className="text-emerald-300">{vis.path || '/'}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-medium text-emerald-300">
                    {formatTimeAgo(vis.timestamp)}
                  </span>
                  <span className="text-[9px] text-emerald-500/70 block">
                    {new Date(vis.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-300/90">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <strong>Otomatik Sayım:</strong> Kullanıcılar sitenize her girdiğinde veya sipariş formu, kurye ekranı gibi sayfaları açtığında sayaç arka planda otomatik artar ve yöneticilere canlı olarak aktarılır.
        </p>
      </div>

      {/* Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#02231c] rounded-3xl border border-emerald-600/70 p-6 max-w-sm w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Site Sayacını Düzenle</h4>
                <p className="text-[11px] text-emerald-300/80">Başlangıç ziyaretçi sayısı belirleyin</p>
              </div>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-emerald-300 block mb-1">
                  Yeni Başlangıç Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#011410] border border-emerald-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400 font-mono"
                  placeholder="Örn: 150 veya 0"
                />
                <span className="text-[10px] text-emerald-400/70 mt-1 block">
                  0 yazarsanız sayaç tamamen sıfırlanır. Bir sayı girerseniz sayaç o sayıdan devam eder.
                </span>
              </div>

              {resetMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    resetMessage.includes('başarıyla')
                      ? 'bg-emerald-950 text-emerald-200 border border-emerald-700'
                      : 'bg-rose-950 text-rose-200 border border-rose-700'
                  }`}
                >
                  {resetMessage.includes('başarıyla') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{resetMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  disabled={isResetting}
                  className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isResetting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
