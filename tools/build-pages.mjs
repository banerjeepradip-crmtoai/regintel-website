// Generates one static HTML file per page (index.html, product/index.html, ...)
// with the page content pre-rendered, its own title, description, canonical URL
// and social tags, plus sitemap.xml and 404.html. Search engines then see every
// page as a real URL with real content; app.js takes over in the browser.
//
// Run from the repository root after changing app.js:  node tools/build-pages.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const SITE = 'https://www.regintel.eu';
const today = new Date().toISOString().slice(0, 10);

// Load app.js with a minimal fake DOM so its page functions can run in Node.
const appEl = { innerHTML: '' };
const ctx = {
  document: { querySelector: sel => (sel === '#app' ? appEl : null), getElementById: () => null, title: '' },
  location: { hash: '', pathname: '/', replace() {} },
  window: { addEventListener() {}, scrollTo() {} },
};
vm.createContext(ctx);
vm.runInContext(readFileSync('app.js', 'utf8') + '\n;globalThis.__app={pages,header,footer,titles,href};', ctx);
const { pages, header, footer, titles, href } = ctx.__app;

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const HOME_DESCRIPTION =
  'RegIntel is the enterprise AI command center from InsightBridge Labs: one system of record for what enterprise AI costs, what it returns, and what governance is holding back.';

function description(page, body) {
  if (page === 'home') return HOME_DESCRIPTION;
  // Use the page hero's subtitle, which every non-home page has.
  const m = body.match(/<section class="pagehero">[\s\S]*?<p>([\s\S]*?)<\/p>/);
  return m ? strip(m[1]) : HOME_DESCRIPTION;
}

function html({ title, desc, url, body, noindex = false, jsonLd = '' }) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#e8f0f4">` +
    `<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">` +
    (noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`) +
    `<meta property="og:type" content="website"><meta property="og:site_name" content="RegIntel"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/assets/video-cover.jpg"><meta name="twitter:card" content="summary_large_image">` +
    jsonLd +
    `<link rel="stylesheet" href="/fonts/fonts.css"><link rel="stylesheet" href="/styles.css"></head>` +
    `<body><div id="app">${body}</div><script src="/app.js"></script></body></html>\n`;
}

const homeJsonLd = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', name: 'RegIntel', url: `${SITE}/` },
    {
      '@type': 'SoftwareApplication',
      name: 'RegIntel',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: HOME_DESCRIPTION,
      url: `${SITE}/`,
      publisher: { '@type': 'Organization', name: 'InsightBridge Labs', url: 'https://www.insightbridgelabs.com/' },
    },
  ],
}).replace(/</g, '\\u003c')}</script>`;

const urls = [];
for (const page of Object.keys(pages)) {
  const body = header(page) + pages[page]() + footer();
  const path = href(page);
  const url = SITE + path;
  const file = page === 'home' ? 'index.html' : `${page}/index.html`;
  if (page !== 'home') mkdirSync(page, { recursive: true });
  writeFileSync(file, html({ title: titles[page], desc: description(page, body), url, body, jsonLd: page === 'home' ? homeJsonLd : '' }));
  urls.push(url);
  console.log('wrote', file);
}

// GitHub Pages serves 404.html for unknown paths; app.js shows the home page there.
writeFileSync('404.html', html({ title: 'Page not found | RegIntel', desc: HOME_DESCRIPTION, url: `${SITE}/`, body: header('home') + pages.home() + footer(), noindex: true }));
console.log('wrote 404.html');

urls.push(`${SITE}/RegIntel_Demo.html`);
writeFileSync('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n') +
  `\n</urlset>\n`);
console.log('wrote sitemap.xml with', urls.length, 'URLs');
