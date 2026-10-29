# regintel.eu

Website for RegIntel by InsightBridge Labs, published with GitHub Pages.

## Structure

- `index.html` – entry point
- `app.js` – page content, navigation and interactions (hash-based routes such as `#/product`, so no server routing is needed)
- `styles.css` – design system
- `fonts/` – self-hosted web fonts (no requests to Google Fonts)
- `assets/` – images
- `RegIntel_Demo.html` – self-contained interactive product demo, opened from "Explore the platform"

## Run locally

```bash
python -m http.server 8080
```

Then visit http://localhost:8080. The enquiry form only works when the site is served over http(s), not when `index.html` is opened as a file.

## Enquiry form

The request-a-demo form posts to [FormSubmit](https://formsubmit.co), which emails each enquiry to InsightBridge Labs. The endpoint is set in `FORM_ENDPOINT` at the top of `app.js`.

## Content notes

Dashboard and cost figures on the site are illustrative sample data, not customer results.
