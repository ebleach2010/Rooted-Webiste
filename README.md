# Rooted Massage & Bodywork — Website

Static site (plain HTML/CSS/JS, **no build step**) for Rooted Massage & Bodywork,
a family-run massage studio in Boise / the Treasure Valley. Layout modeled on
en-spa.com, restyled to the Rooted brand.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home — hero banner, about, featured services, Arielle intro, studio photos |
| `services.html` | Full service menu with pricing, add-ons, and per-duration Book buttons |
| `arielle.html` | Arielle's bio page |
| `faq.html` | FAQ accordions (+ FAQ structured data for Google) |
| `contact.html` | Contact info, hours, map placeholder, studio photos |
| `gift-cards.html` | Gift card pitch + purchase button |
| `404.html` | Branded not-found page (required — without it Cloudflare serves index.html for bad URLs) |
| `css/styles.css` | All styling; the **color palette lives in the `:root` variables** at the top |
| `js/main.js` | Booking-link map (MangoMint), mobile nav |
| `assets/` | Web-optimized logos, banner, photos, icons |

### Shared blocks (copy-paste chrome)

There is no template system — the header/nav, top contact strip, and footer are
**copied into every page**. Each is wrapped in a loud comment:

```
SHARED TOP STRIP  — change in ALL 7 html files
SHARED HEADER/NAV — change in ALL 7 html files (move aria-current="page" per page)
SHARED FOOTER     — change in ALL 7 html files
```

If you edit one of these blocks, paste the same edit into: `index.html`,
`services.html`, `arielle.html`, `faq.html`, `contact.html`, `gift-cards.html`
(404.html has no chrome).

## Deploy (Cloudflare Pages, free)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick `ebleach2010/Rooted-Webiste`, branch `main`.
   *Tip: consider renaming the repo (it's a typo'd twin of the old `Rooted-Website`)
   **before** connecting Cloudflare — the `*.pages.dev` name derives from it.*
3. Build settings: **no framework, no build command, output directory `/`**.
4. Deploy — site goes live at `rooted-webiste.pages.dev` (or similar).
5. Later: **Custom domains** tab → add `rootedmassagebodywork.com` once its DNS
   is moved off the current Figma Sites setup.

Every push to `main` redeploys automatically. Internal links are extensionless
(`/services`) which matches how Cloudflare Pages serves the files.

## MangoMint hookup

Everything comes from **MangoMint → Settings → Online Booking → Setup & Integration**:

1. **Script tag** → paste into the marked `MANGOMINT` comment block in the
   `<head>` of **every** html page. This enables the in-page booking overlay.
2. **Booking link** → set `BOOKING.default` at the top of `js/main.js`.
   Every Book button on every page picks it up automatically.
3. **Gift card link** → set `BOOKING.giftCards` (MangoMint's gift-card purchase
   URL is separate from booking). The Buy buttons on `gift-cards.html` use it.
4. **Client portal link** → set `BOOKING.portal` for the nav's Client Portal button.
5. *(Optional, any time)* per-service deep links → fill the per-service keys in
   `js/main.js` (`"therapeutic-90"` etc.) so each Book button jumps straight to
   that service in MangoMint.

Until a link is set, its buttons fall back to the Services page (or Contact).

## Before launch — placeholder checklist

Search the repo for `PLACEHOLDER` and `DRAFT PRICE` — every spot that needs real
content is marked:

- [ ] **Prices** — all prices are drafts (`DRAFT PRICE` comments in `services.html`,
      `index.html`, `faq.html`); set the real menu
- [ ] Phone, email, street address, hours — top strip, footer, contact page, and
      the JSON-LD block in every page's `<head>`
- [ ] Instagram / Facebook URLs (top strip in every page)
- [ ] Arielle's bio paragraphs (`arielle.html`, intro on `index.html`)
- [ ] FAQ answers: cancellation policy, HSA/FSA, parking/location, gratuity
- [ ] Cancellation policy line (footer of every page + services/faq pages)
- [ ] Google Maps embed (`contact.html` — swap the placeholder div contents for the
      iframe from Google Maps → Share → Embed a map)
- [ ] Hero tagline on `index.html` ("Bodywork that gets to the root of it" — draft)
- [ ] Gift card expiration wording (`gift-cards.html`)
- [ ] MangoMint: script tag + the links in `js/main.js` (see above)
- [ ] Domain: if the final domain differs from `rootedmassagebodywork.com`, update
      the `canonical`/`og:url`/`og:image`/JSON-LD URLs in every page + `sitemap.xml`

## Future ideas (noted, not built)

- **Couples massage** page/section once there's a second therapist (EN Spa's
  biggest draw that doesn't fit a solo practice yet)
- Testimonials section once real client reviews exist
- Additional therapist cards on the home page (`bio-grid` handles it)

## Assets

Web copies live in `assets/`; **original full-res files stay in
`~/Desktop/Rooted TP/` and are not in git** (that folder also holds business
documents — never `git add` from it directly). `logo-mark.png` is the wreath
logo with true transparency (the original PNGs had a fake checkerboard baked in;
re-export from the design tool with real alpha for a cleaner edge if possible).
