import {
  HOME_SEO,
  SITE_BASE_URL,
  SITE_LOGO_URL,
  SITE_NAME,
  SeoPageData,
  buildHomeJsonLd,
  buildSeoPageJsonLd,
} from '../data/seoPages';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(data: Record<string, unknown>): void {
  if (typeof document === 'undefined') return;
  const id = 'antalya-seo-jsonld';
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    // Also clean up any legacy static json-ld script to prevent duplicate graphs on SPA route switches
    const legacy = document.head.querySelector('script[type="application/ld+json"]:not(#antalya-seo-jsonld)');
    if (legacy) {
      legacy.id = id;
      script = legacy as HTMLScriptElement;
    } else {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
  }
  script.textContent = JSON.stringify(data);
}

export function applyPageSeo(page: SeoPageData | null): void {
  if (typeof document === 'undefined') return;

  const title = page ? page.metaTitle : HOME_SEO.metaTitle;
  const description = page ? page.metaDescription : HOME_SEO.metaDescription;
  const ogTitle = page ? page.metaTitle : HOME_SEO.ogTitle;
  const ogDescription = page ? page.metaDescription : HOME_SEO.ogDescription;
  const canonicalUrl = page ? `${SITE_BASE_URL}${page.path}` : `${SITE_BASE_URL}/`;
  const jsonLd = page ? buildSeoPageJsonLd(page) : buildHomeJsonLd();

  document.title = title;
  upsertMeta('name', 'title', title);
  upsertMeta('name', 'description', description);
  upsertCanonical(canonicalUrl);

  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:locale', 'tr_TR');
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:title', ogTitle);
  upsertMeta('property', 'og:description', ogDescription);
  upsertMeta('property', 'og:image', SITE_LOGO_URL);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', ogTitle);
  upsertMeta('name', 'twitter:description', ogDescription);
  upsertMeta('name', 'twitter:image', SITE_LOGO_URL);

  upsertJsonLd(jsonLd);
}

export function navigateToPath(path: string, options?: { scrollToTop?: boolean }): void {
  if (typeof window === 'undefined') return;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (window.location.pathname !== normalized || window.location.hash) {
    window.history.pushState({}, '', normalized);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  if (options?.scrollToTop !== false) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function handleSpaLinkClick(e: React.MouseEvent<HTMLAnchorElement>, path: string): void {
  // Preserve native browser behavior for modified clicks (new tab, middle click, etc.)
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return;
  }
  e.preventDefault();
  navigateToPath(path);
}
