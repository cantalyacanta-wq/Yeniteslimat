import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import {
  SEO_PAGES,
  SITE_BASE_URL,
  SITE_LOGO_URL,
  SITE_NAME,
  SeoPageData,
  buildSeoPageJsonLd,
} from './src/data/seoPages';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    .map((s) => `<li><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.description)}</p></li>`)
    .join('');
  const faqsHtml = page.faqs
    .map((f) => `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`)
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

function seoPrerenderPlugin(): Plugin {
  return {
    name: 'antalya-seo-prerender',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const baseIndexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(baseIndexPath)) return;

      const baseHtml = fs.readFileSync(baseIndexPath, 'utf-8');
      for (const page of SEO_PAGES) {
        const fullUrl = `${SITE_BASE_URL}${page.path}`;
        const titleEsc = escapeHtml(page.metaTitle);
        const descEsc = escapeHtml(page.metaDescription);
        const jsonLd = JSON.stringify(buildSeoPageJsonLd(page));

        let html = baseHtml;
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleEsc}</title>`);
        html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${fullUrl}" />`);
        html = html.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${titleEsc}" />`);
        html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${descEsc}" />`);
        html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${fullUrl}" />`);
        html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${titleEsc}" />`);
        html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${descEsc}" />`);
        html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${SITE_LOGO_URL}" />`);
        html = html.replace(/<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:site_name" content="${SITE_NAME}" />`);
        html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${titleEsc}" />`);
        html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${descEsc}" />`);
        html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${SITE_LOGO_URL}" />`);
        html = html.replace(
          /<script\s+id="antalya-seo-jsonld"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
          `<script id="antalya-seo-jsonld" type="application/ld+json">${jsonLd}</script>`
        );
        html = html.replace(
          /<div id="root"[^>]*><\/div>\s*<noscript>[\s\S]*?<\/noscript>/i,
          `<div id="root" class="min-h-screen w-full"></div>\n    ${buildNoscriptHtml(page)}`
        );

        const outDir = path.join(distDir, page.slug);
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
      }
      console.log(`[SEO PRERENDER] Generated ${SEO_PAGES.length} static SEO routes in dist/.`);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.png', 'app-logo.png', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Antalya Kurye Talep Havuzu',
          short_name: 'AntalyaKurye',
          description: 'Antalya Şehir İçi Moto Kurye Talep Havuzu ve Anlık Canlı Teslimat Bildirimleri',
          theme_color: '#dc2626',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/#pakettalebi',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallbackDenylist: [
            /^\/api\//,
            /^\/sitemap\.xml$/,
            /^\/robots\.txt$/,
            /^\/google.*\.html$/,
            /^\/downloads\//,
          ],
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
      seoPrerenderPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'icons-vendor': ['lucide-react'],
            'maps-vendor': ['leaflet', '@vis.gl/react-google-maps'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
