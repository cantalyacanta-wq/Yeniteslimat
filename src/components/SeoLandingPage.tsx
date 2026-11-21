import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Headphones,
  MapPin,
  UserCheck,
  Check,
  Minus,
} from 'lucide-react';
import {
  DISTRICT_SEO_PAGES,
  SERVICE_SEO_PAGES,
  SeoPageData,
} from '../data/seoPages';
import { handleSpaLinkClick } from '../utils/seoManager';
import { useDelivery } from '../context/DeliveryContext';

interface SeoLandingPageProps {
  page: SeoPageData;
}

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ page }) => {
  const { currentUser, openQuickCourierModal, openAuthModal, openVoiceAssistant } = useDelivery();
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const isRegisteredCustomer =
    currentUser &&
    currentUser.role === 'customer' &&
    currentUser.id !== 'user-guest-01' &&
    !currentUser.id.startsWith('user-guest');

  const handlePrimaryOrderAction = () => {
    if (isRegisteredCustomer) {
      openQuickCourierModal();
    } else {
      openAuthModal(
        'login',
        'Online kurye çağırmak, kayıtlı adreslerinizle talebinizi anında kurye havuzunda yayınlamak ve canlı takip yapmak için giriş yapın veya ücretsiz kayıt olun.'
      );
    }
  };

  const relatedServices = SERVICE_SEO_PAGES.filter((item) => item.slug !== page.slug);
  const relatedDistricts = DISTRICT_SEO_PAGES.filter((item) => item.slug !== page.slug);

  return (
    <article className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-12 sm:space-y-16 text-slate-100">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-emerald-300/75 flex-wrap">
        <a
          href="/"
          onClick={(e) => handleSpaLinkClick(e, '/')}
          className="hover:text-white underline-offset-4 hover:underline transition-colors"
        >
          Ana Sayfa
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
        <span className="text-emerald-400/75">{page.breadcrumbParent}</span>
        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
        <span className="text-white font-medium" aria-current="page">
          {page.navLabel}
        </span>
      </nav>

      {/* Hero Section: Proposition + Focused Conversion */}
      <header className="rounded-3xl bg-[#02211b] border border-emerald-800/50 p-6 sm:p-10 lg:p-12 space-y-6">
        <p className="text-xs sm:text-sm font-medium text-emerald-300/90 tracking-wide">
          {page.kicker}
        </p>

        <h1
          className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl"
          style={{ textWrap: 'balance' }}
        >
          {page.h1}
        </h1>

        <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
          {page.lead}
        </p>

        {/* Unboxed Key Proof Strip (Tabular Numerals, Zero Pills) */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-emerald-800/40">
          <div>
            <dt className="text-xs text-emerald-300/70">Standart Gönderi</dt>
            <dd className="text-lg sm:text-xl font-bold text-white tabular-nums mt-0.5">200 ₺</dd>
          </div>
          <div>
            <dt className="text-xs text-emerald-300/70">Ortalama Süre</dt>
            <dd className="text-lg sm:text-xl font-bold text-white tabular-nums mt-0.5">30–45 dk</dd>
          </div>
          <div>
            <dt className="text-xs text-emerald-300/70">Talep Havuzu</dt>
            <dd className="text-lg sm:text-xl font-bold text-white tabular-nums mt-0.5">7/24 Açık</dd>
          </div>
          <div>
            <dt className="text-xs text-emerald-300/70">Ödeme Seçeneği</dt>
            <dd className="text-sm sm:text-base font-semibold text-emerald-200 mt-1">Gönderici / Alıcı</dd>
          </div>
        </dl>

        {/* Focused CTA Row (1 Primary + 1 Secondary Action) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrimaryOrderAction}
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#021814] font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <UserCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{isRegisteredCustomer ? 'Hemen Online Kurye Çağır' : 'Üyelikli Online Kurye Çağır'}</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={openVoiceAssistant}
            className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-emerald-900/50 text-amber-200 hover:text-amber-100 border border-amber-400/50 font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <Headphones className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
            <span>Üyeliksiz Sesli Kurye Çağır</span>
          </button>
        </div>
      </header>

      {/* Platform Positioning & Search Intent Explanation (2-Column Editorial Split) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 space-y-4">
          <h2
            className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug"
            style={{ textWrap: 'balance' }}
          >
            {page.intentSectionTitle}
          </h2>
          {page.intentParagraphs.map((paragraph, idx) => (
            <p key={idx} className="text-sm sm:text-[15px] text-slate-200/85 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="lg:col-span-5 rounded-2xl bg-[#021d17] border border-emerald-800/50 p-6 space-y-3">
          <p className="text-xs font-semibold text-emerald-400 tracking-wide">
            Dijital Kurye Talep Platformu Yaklaşımı
          </p>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {page.platformAngleTitle}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {page.platformAngleBody}
          </p>
        </aside>
      </section>

      {/* Real-World Scenarios Grid (Asymmetric 2x2 Editorial Grid) */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-2xl">
          <h2
            className="text-xl sm:text-2xl font-bold text-white tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            {page.scenariosTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {page.scenarios.map((scenario, idx) => (
            <div
              key={scenario.title}
              className="rounded-2xl bg-[#02201a] border border-emerald-900/60 p-6 space-y-2.5"
            >
              <p className="text-xs font-mono tabular-nums text-emerald-400/80">
                {String(idx + 1).padStart(2, '0')}.
              </p>
              <h3 className="text-base font-bold text-white leading-snug">
                {scenario.title}
              </h3>
              <p className="text-sm text-slate-300/90 leading-relaxed">
                {scenario.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Numbered Process Steps */}
      <section className="space-y-6 pt-2 border-t border-emerald-900/50">
        <h2
          className="text-xl sm:text-2xl font-bold text-white tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {page.processTitle}
        </h2>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {page.processSteps.map((step) => (
            <li key={step.number} className="space-y-2">
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums block">
                {step.number}
              </span>
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-sm text-slate-300/85 leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Coverage / Service Specifications Table-Style Grid */}
      <section className="rounded-3xl bg-[#021d17] border border-emerald-800/50 p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {page.highlightsTitle}
          </h2>
          <p className="text-sm text-emerald-200/75">{page.highlightsSubtitle}</p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 pt-2 border-t border-emerald-900/60">
          {page.highlights.map((item) => (
            <div key={item.label} className="space-y-1">
              <dt className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
                {page.category === 'district' ? (
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                ) : null}
                <span>{item.label}</span>
              </dt>
              <dd className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Platform Comparison Section */}
      <section className="space-y-6">
        <h2
          className="text-xl sm:text-2xl font-bold text-white tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {page.comparisonTitle}
        </h2>

        <div className="divide-y divide-emerald-900/50 rounded-2xl border border-emerald-900/60 bg-[#021e18] overflow-hidden">
          {page.comparisonPoints.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-2.5 text-sm text-slate-400">
                <Minus className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Klasik Süreç</span>
                  <p className="leading-relaxed">{row.traditional}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-xs text-emerald-400 block mb-0.5">Antalya Teslimat Platformu</span>
                  <p className="leading-relaxed font-medium">{row.platform}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contextual Internal Links */}
      <section className="space-y-5">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          İlgili Sayfalar ve Bağlantılı Rotalar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {page.contextualLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              onClick={(e) => handleSpaLinkClick(e, link.path)}
              className="group rounded-2xl bg-[#02201a] hover:bg-[#032a22] border border-emerald-900/60 hover:border-emerald-600/60 p-5 transition-colors flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-emerald-300 group-hover:text-white transition-colors">
                  {link.anchor}
                </span>
                <ArrowRight
                  className="w-4 h-4 text-emerald-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-transform shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed">{link.context}</p>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ Section (Synced with Schema.org FAQPage) */}
      <section className="space-y-5">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sıkça Sorulan Sorular
        </h2>

        <div className="divide-y divide-emerald-900/60 rounded-2xl border border-emerald-900/60 bg-[#021d17]">
          {page.faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={faq.question} className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="w-full text-left flex items-start justify-between gap-4 cursor-pointer"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-400 shrink-0 mt-1 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div className={isOpen ? 'mt-3' : 'sr-only'}>
                  <p className="text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Conversion Strip */}
      <section className="rounded-3xl bg-[#032920] border border-emerald-700/50 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Çevrenizdeki Uygun Kuryeye Şimdi Talep Gönderin
          </h2>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Kayıtlı hesabınızla talebiniz onay beklemeden anında kurye havuzunda yayınlanır. Dilerseniz üyeliksiz 7/24 sesli asistan üzerinden de çağrı açabilirsiniz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handlePrimaryOrderAction}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#021814] font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Online Kurye Çağır</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={openVoiceAssistant}
            className="px-5 py-3 rounded-xl bg-[#021b15] hover:bg-emerald-950 text-amber-200 border border-amber-500/40 font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Headphones className="w-4 h-4 text-amber-300" aria-hidden="true" />
            <span>Sesli Çağır</span>
          </button>
        </div>
      </section>

      {/* Complete Site Cross-Link Directory */}
      <nav
        aria-label="Hizmetler ve Antalya Bölgeleri"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-emerald-900/50 text-sm"
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold text-emerald-400">Diğer Kurye Hizmet Sayfaları</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <a
                href="/"
                onClick={(e) => handleSpaLinkClick(e, '/')}
                className="text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors"
              >
                Antalya Kurye Ana Sayfa
              </a>
            </li>
            {relatedServices.map((s) => (
              <li key={s.slug}>
                <a
                  href={s.path}
                  onClick={(e) => handleSpaLinkClick(e, s.path)}
                  className="text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors"
                >
                  {s.navLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-emerald-400">Antalya Yerel Kurye Bölgeleri</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {relatedDistricts.map((d) => (
              <li key={d.slug}>
                <a
                  href={d.path}
                  onClick={(e) => handleSpaLinkClick(e, d.path)}
                  className="text-slate-300 hover:text-white underline-offset-4 hover:underline transition-colors"
                >
                  {d.navLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </article>
  );
};

export default SeoLandingPage;
