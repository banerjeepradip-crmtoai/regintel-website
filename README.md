# regintel.eu

Website for RegIntel by InsightBridge Labs, published with GitHub Pages.

## Structure

- `app.js` – page content, navigation and interactions; the single source of truth for page text
- `index.html`, `product/index.html`, `economics/index.html`, … , `404.html`, `sitemap.xml` – **generated** by `tools/build-pages.mjs`; do not edit by hand
- `robots.txt` – crawler rules and sitemap location
- `1de355270af19c9075a5854483a77af1.txt` – IndexNow key (lets Bing, Yandex and others accept URL submissions); keep it
- `styles.css` – design system
- `fonts/` – self-hosted web fonts (no requests to Google Fonts)
- `assets/` – images
- `RegIntel_Demo.html` – self-contained interactive product demo, opened from "Explore the platform"

## Pages and SEO

Every page has a real URL (`/product/`, `/economics/`, …) so search engines can index each one. Old `#/page` links still work: `app.js` forwards them to the new URL.

After changing page content in `app.js`, regenerate the static pages and sitemap, then commit the results:

```bash
node tools/build-pages.mjs
```

The generator pre-renders each page's content into its HTML (so crawlers that skip JavaScript still see it) and sets its title, description, canonical URL and social-sharing tags. Page descriptions come from each page's hero subtitle.

To ask search engines to re-crawl after a change, submit the changed URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep):

```bash
curl -X POST https://api.indexnow.org/indexnow -H "Content-Type: application/json"   -d '{"host":"www.regintel.eu","key":"1de355270af19c9075a5854483a77af1","urlList":["https://www.regintel.eu/"]}'
```

Google is handled through Google Search Console (sitemap: `https://www.regintel.eu/sitemap.xml`).

## Run locally

```bash
python -m http.server 8080
```

Then visit http://localhost:8080. The enquiry form only works when the site is served over http(s), not when `index.html` is opened as a file.

## Enquiry form

The request-a-demo form posts to `POST /regintel/submit` on InsightBridge Labs' own Cloudflare Worker (shared with insightbridgelabs.com's contact form), which sends the email itself via Resend. The endpoint is set in `FORM_ENDPOINT` at the top of `app.js`. Previously used FormSubmit, moved off it after its origin started returning HTTP 521 (unreliable third-party uptime) — see `cloudflare/cms-worker/README.md` in the `insightbridgelabs` repo for the backend.

## Content notes

Dashboard and cost figures on the site are illustrative sample data, not customer results.
