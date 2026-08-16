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

**Already live** in `js/main.js`:

- Booking (all Book buttons): `https://booking.mangomint.com/rootedtherapeutics`
- Gift cards (Buy buttons): `https://clients.mangomint.com/gift-cards/rootedtherapeutics`

**Still to add** (all from MangoMint → Settings → Online Booking → Setup & Integration):

1. **Script tag** → paste into the marked `MANGOMINT` comment block in the
   `<head>` of **every** html page. This upgrades Book buttons from new-tab
   links to MangoMint's in-page booking overlay.
2. **Client portal link** → set `BOOKING.portal` in `js/main.js` for the nav's
   Client Portal button (falls back to Contact until set).
3. *(Optional)* per-service deep links → fill the per-service keys under
   `BOOKING.therapists.arielle` (`"signature-60"` etc.) so each button jumps
   straight to that service; unset keys use her `default` booking link.

### Adding a therapist later

1. In `js/main.js`, copy Arielle's block under a new key (e.g. `jordan: {...}`)
   with that provider's MangoMint links.
2. In `services.html`, duplicate the `.therapist-card` in the Choose Your
   Therapist section with `data-therapist="jordan"` and `aria-pressed="false"`.
Selecting a card re-wires every Book button to that therapist's links.

## Before launch — placeholder checklist

Prices, the service menu, per-service booking deep links, phone, and address are
**real** (matching the live MangoMint setup). Search the repo for `PLACEHOLDER`
for what remains:

- [x] Contact info complete: phone, email, address, and hours are live
      (socials intentionally omitted for now)
- [ ] Arielle's bio paragraphs (`arielle.html`, intro on `index.html`)
- [ ] FAQ answers: cancellation policy, HSA/FSA, parking/location, gratuity
- [ ] Cancellation policy line (footer of every page + services/faq pages)
- [ ] Google Maps embed (`contact.html` — swap the placeholder div contents for the
      iframe from Google Maps → Share → Embed a map)
- [ ] Hero tagline on `index.html` ("Bodywork that gets to the root of it" — draft)
- [ ] MangoMint: script tag, portal link, optional per-service links (see above)
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
