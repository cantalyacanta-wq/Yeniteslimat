import React from 'react';
import {
  Truck,
  Phone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface PanelvanNakliyeSectionProps {
  className?: string;
}

export const PanelvanNakliyeSection: React.FC<PanelvanNakliyeSectionProps> = ({
  className = '',
}) => {
  const whatsappNumber = '905077547484';
  const displayPhone = '0507 754 74 84';
  const whatsappMessage = encodeURIComponent(
    'Merhaba, Konyaaltı panelvan parça eşya taşıma (900 TL) hizmetiniz hakkında bilgi almak ve randevu oluşturmak istiyorum. Eşyalarımın detayları:'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const phoneUrl = `tel:05077547484`;

  return (
    <section
      id="panelvan-nakliye"
      className={`w-full max-w-5xl rounded-3xl overflow-hidden border-2 border-amber-500/60 bg-gradient-to-br from-[#021f19] via-[#042820] to-[#011611] p-5 sm:p-8 lg:p-10 text-white relative shadow-2xl shadow-emerald-950/80 scroll-mt-6 ${className}`}
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Badges & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-wider shadow-xs">
                <Truck className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Panelvan Parça Eşya Taşıma</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-extrabold text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Konyaaltı & Antalya İçi</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>Konyaaltı Uygun Nakliye</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                Sadece 900 ₺
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              Büyük kamyon nakliyecilerine binlerce lira ödemeyin! Tekli mobilya, beyaz eşya, koli ve valiz gibi parça eşyalarınızı temiz panelvan aracımızla güvenle, ekonomik ve hızlı taşıyoruz.
            </p>
          </div>

          {/* Quick Price Tag Badge */}
          <div className="sm:self-center shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-center shadow-lg shadow-amber-500/30 border border-amber-300/60">
              <span className="text-[10px] uppercase font-bold tracking-wider block text-amber-950/80">
                Konyaaltı Başlangıç
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white drop-shadow-sm">
                900 ₺
              </span>
              <span className="text-[10px] block font-semibold text-amber-950/90 mt-0.5">
                Şehir İçi Parça Taşıma
              </span>
            </div>
          </div>
        </div>

        {/* CRITICAL CONDITION BANNER: Toplu Ev Eşyası Olmayacak */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-[#261505]/80 to-amber-950/70 border-2 border-amber-500/70 text-amber-200 shadow-md flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-black text-amber-300 text-sm sm:text-base flex items-center gap-1.5">
              <span>Önemli Bilgilendirme: Taşıma Kapsamı ve Araç Kapasitesi</span>
            </h4>
            <p className="text-amber-100/95 leading-relaxed font-medium">
              Bu hizmetimiz <strong>yalnızca panelvan araca sığabilecek parça eşyalar</strong> içindir.
              <strong className="text-white underline ml-1">Toplu komple ev eşyası taşınmamaktadır.</strong>
              Taşınacak eşyalarınızın fotoğrafını WhatsApp'tan göndererek sığıp sığmayacağını anında teyit edebilirsiniz.
            </p>
          </div>
        </div>

        {/* 2 Comparison Columns: Ne Taşınır vs Ne Taşınmaz */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Ne Taşınır (Sığacak Eşyalar) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#022820]/80 border border-emerald-600/60 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm pb-1 border-b border-emerald-700/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Sadece Panelvana Sığacak Eşyalar Taşınır:</span>
            </div>
            <ul className="space-y-2 text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span><strong>Koli, bavul ve valizler:</strong> Taşınma kutuları, kıyafet hurçları, kişisel eşyalar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span><strong>Tekli beyaz eşyalar:</strong> Çamaşır makinesi, mini/tek kapılı buzdolabı, bulaşık makinesi, ocak.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span><strong>Parça mobilyalar:</strong> Tekli koltuk, çalışma masası, TV sehpası, komodin, baza başlığı, sandalye vb.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span><strong>Öğrenci & bekar evi eşyaları:</strong> Az adetli hafif oda eşyaları, parça nakliyat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span><strong>Ofis & dükkan ürünleri:</strong> Bilgisayar kasaları, monitörler, evrak arşivleri, numuneler.</span>
              </li>
            </ul>
          </div>

          {/* Ne Taşınmaz (Toplu Ev Eşyası Olmayacak) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#200c0a]/60 border border-rose-800/60 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold text-sm pb-1 border-b border-rose-800/40">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Taşınmayan Eşyalar (Hizmet Dışı):</span>
            </div>
            <ul className="space-y-2 text-rose-100/90">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">✗</span>
                <span><strong>Toplu komple ev eşyaları:</strong> 1+1, 2+1, 3+1 bütün ev taşıma hizmeti verilmemektedir.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">✗</span>
                <span><strong>Büyük hantal mobilyalar:</strong> 3'lü geniş koltuk takımları, dev gardırop ve vitrinler.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">✗</span>
                <span><strong>Kamyon gerektiren yükler:</strong> İnşaat molozu, ağır sanayi makineleri vb.</span>
              </li>
            </ul>
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700/50 text-[11px] text-rose-200 mt-2">
              💡 <strong>İpucu:</strong> Eşyanızın sığıp sığmayacağından emin değilseniz WhatsApp'tan fotoğrafını atmanız yeterlidir!
            </div>
          </div>
        </div>

        {/* 3 Steps / Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#021813]/90 border border-emerald-800/50 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1. WhatsApp'tan Fotoğraf Atın</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Taşınacak eşyaların resmini WhatsApp'tan bize gönderin, dakikalar içinde onay ve kesin fiyat alın.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#021813]/90 border border-emerald-800/50 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>2. Saatinde Kapınızda</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Konyaaltı'nda Hurma, Liman, Altınkum, Gürsu, Uncalı ve çevre bölgelerde söz verdiğimiz saatte hazırız.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#021813]/90 border border-emerald-800/50 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>3. Güvenli & Hasarsız Teslim</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Eşyalarınız panelvan aracın içinde sabitlenerek çizilmeden ve sarsılmadan yeni adresinize ulaştırılır.
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS: WhatsApp & Direct Call */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-emerald-800/60">
          <div className="text-center sm:text-left">
            <div className="text-xs text-emerald-300 font-bold">Hızlı İletişim & Randevu:</div>
            <div className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{displayPhone}</span>
              <span className="text-xs font-semibold text-emerald-400/80">(Konyaaltı Nakliye Hattı)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* WHATSAPP BUTTON (Primary Direct Link) */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#25D366]/30 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer border border-white/20"
              title="WhatsApp üzerinden 0507 754 74 84 numarasına mesaj atın"
            >
              <svg
                className="w-5 h-5 fill-current shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.07-1.107-.062-.271-.086-.615-.2-1.05-.392-1.834-.812-3.023-2.658-3.115-2.781-.092-.123-.748-.994-.748-1.897 0-.903.473-1.347.641-1.53.169-.184.37-.23.493-.23.123 0 .247.001.353.007.114.006.265-.044.415.318.155.373.53 1.29.576 1.383.046.092.077.2.016.323-.062.123-.093.2-.185.308-.092.108-.194.242-.277.325-.092.092-.188.192-.081.376.108.185.479.791 1.028 1.279.707.63 1.302.825 1.487.917.185.092.293.077.4-.046.108-.123.462-.538.585-.723.123-.185.246-.154.415-.092.169.062 1.077.508 1.262.6.185.092.308.138.354.215.046.077.046.446-.098.851z" />
              </svg>
              <span>WhatsApp'tan Yaz (0507 754 74 84)</span>
            </a>

            {/* CALL BUTTON */}
            <a
              href={phoneUrl}
              className="px-4 py-3.5 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white font-bold text-xs sm:text-sm border border-emerald-600/70 transition flex items-center justify-center gap-2 active:scale-98 shrink-0 cursor-pointer"
              title="0507 754 74 84 numarasını hemen arayın"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>Hemen Ara</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
