import fs from 'fs';
import path from 'path';
import {
  SEO_PAGES,
  SITE_BASE_URL,
  SITE_LOGO_URL,
  SITE_NAME,
  SeoPageData,
  buildSeoPageJsonLd,
} from '../src/data/seoPages';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildNoscriptHtml(page: SeoPageData): string {
  const scenariosHtml = page.scenarios
    .map(
      (s) =>
        `<li><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.description)}</p></li>`
    )
    .join('');

  const faqsHtml = page.faqs
    .map(
      (f) =>
        `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`
    )
    .join('');

  const linksHtml = page.contextualLinks
    .map(
      (l) =>
        `<li><a href="${escapeHtml(l.path)}" style="color:#34d399;">${escapeHtml(l.anchor)}</a> — ${escapeHtml(l.context)}</li>`
    )
    .join('');

  return `<noscript>
      <article style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:system-ui,sans-serif;color:#f1f5f9;">
        <p><a href="/" style="color:#34d399;">Ana Sayfa</a> / ${escapeHtml(page.breadcrumbParent)} / ${escapeHtml(page.navLabel)}</p>
        <h1>${escapeHtml(page.h1)}</h1>
        <p>${escapeHtml(page.lead)}</p>
        <h2>${escapeHtml(page.intentSectionTitle)}</h2>
        ${page.intentParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
        <h2>${escapeHtml(page.platformAngleTitle)}</h2>
        <p>${escapeHtml(page.platformAngleBody)}</p>
        <h2>${escapeHtml(page.scenariosTitle)}</h2>
        <ul>${scenariosHtml}</ul>
        <h2>Sıkça Sorulan Sorular</h2>
        ${faqsHtml}
        <h2>İlgili Sayfalar</h2>
        <ul>${linksHtml}</ul>
      </article>
    </noscript>`;
}

function renderPageHtml(baseHtml: string, page: SeoPageData): string {
  const fullUrl = `${SITE_BASE_URL}${page.path}`;
  const titleEsc = escapeHtml(page.metaTitle);
  const descEsc = escapeHtml(page.metaDescription);
  const jsonLd = JSON.stringify(buildSeoPageJsonLd(page));

  let html = baseHtml;

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleEsc}</title>`);

  // Replace canonical URL
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${fullUrl}" />`
  );

  // Replace standard meta tags
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="title" content="${titleEsc}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${descEsc}" />`
  );

  // Replace Open Graph tags
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${fullUrl}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${titleEsc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${descEsc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${SITE_LOGO_URL}" />`
  );
  html = html.replace(
    /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:site_name" content="${SITE_NAME}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${titleEsc}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${descEsc}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${SITE_LOGO_URL}" />`
  );

  // Replace Schema.org JSON-LD block
  html = html.replace(
    /<script\s+id="antalya-seo-jsonld"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="antalya-seo-jsonld" type="application/ld+json">${jsonLd}</script>`
  );

  // Replace body <noscript> fallback with page-specific semantic SEO HTML
  html = html.replace(
    /<div id="root"[^>]*><\/div>\s*<noscript>[\s\S]*?<\/noscript>/i,
    `<div id="root" class="min-h-screen w-full"></div>\n    ${buildNoscriptHtml(page)}`
  );

  return html;
}

function main(): void {
  const distDir = path.resolve(process.cwd(), 'dist');
  const baseIndexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(baseIndexPath)) {
    console.error('[SEO PRERENDER] dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseIndexPath, 'utf-8');

  for (const page of SEO_PAGES) {
    const outDir = path.join(distDir, page.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, 'index.html');
    const html = renderPageHtml(baseHtml, page);
    fs.writeFileSync(outFile, html, 'utf-8');
    console.log(`[SEO PRERENDER] Generated ${page.path}/index.html (${html.length} bytes)`);
  }

  console.log(`[SEO PRERENDER] Successfully pre-rendered ${SEO_PAGES.length} SEO landing routes.`);
}

main();
