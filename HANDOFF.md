# Rooted Massage & Bodywork: developer handoff

Everything a fresh session needs to pick up work on this site. Read this
first, then `LAUNCH.md` (domain and DNS runbook) and `README.md` (file map
and MangoMint hookup).

**No secrets live in this file.** The repo is public. The new-client discount
code and MangoMint admin notes are in a private file outside the repo:
`~/Desktop/Rooted TP/Rooted Website: Private Notes.md`

---

## 1. The essentials

| | |
| --- | --- |
| Live site | https://rootedmassagebodywork.com (HTTPS, custom domain) |
| Repo | `ebleach2010/Rooted-Webiste` (public). The typo in the name is real, not a mistake to fix. |
| Local clone | `~/Desktop/Rooted-Webiste` |
| Hosting | GitHub Pages, serving from branch **`main`**, path `/` |
| Build step | None. Plain HTML, CSS, JS. |

**Pushing to `main` publishes to the live customer-facing site within a
minute or two.** There is no staging. Verify locally before pushing.

The `gh-pages` branch is dead. It was the old preview before the real domain
existed. Pages no longer serves it. Ignore it, and do not sync to it.

### Before you touch anything

```bash
cd ~/Desktop/Rooted-Webiste && git pull
```

Work gets pushed from more than one place (Claude Code sessions, GitHub web
uploads, Cowork). A previous session skipped this and went 16 commits stale,
which was caught only because the push was rejected. Pull first, every time.

---

## 2. The business, as the site states it

- **Rooted Massage & Bodywork**, Boise, Idaho. Family-run studio.
- **Arielle** is the owner and the only licensed massage therapist. Every
  booking goes to her. She is the only provider in MangoMint.
- Eric runs operations. Mentions of him by name were deliberately removed
  from the homepage; "family-run" language stayed. Do not reintroduce his
  name without asking.
- Phone: **(208) 266-4525**
- Email: **office@rootedmassageandwellness.com**
- Address: **410 S Orchard St, Suite 264, Boise, ID 83705**
- Hours: **Tue to Fri 10:00 AM to 7:00 PM, Sat 9:00 AM to 5:00 PM,
  Sun and Mon closed**
- No social media accounts yet. Icons were removed on purpose; add them back
  only when real profiles exist.

### Service menu (matches the live MangoMint booking menu)

| Service | Durations and prices | Included free |
| --- | --- | --- |
| Signature Custom Massage | 60 min $95, 90 min $145, 120 min $190 | Nothing; any add-on can be purchased |
| Relax & Reset Massage | 60 min $125, 90 min $160, 120 min $205 | Aromatherapy |
| Targeted Tension Massage | 60 min $95, 90 min $145 | Scraping |
| Deep Tissue Massage | 90 min $155, 120 min $200 | Cupping, fascial scraping |
| Lymphatic Drainage Massage | 90 min $160 | Lymphatic face massage, fascial massage, dry brushing, red light |

**Add-ons** ($5 to $25): Aromatherapy $5, Hot Stone Therapy $10, Peppermint
Scalp Massage $10, Cupping $15, Fascial Scraping $15, Lymphatic Face Massage
$25 (heated infrared Gua Sha tool). Available on Signature Custom, Relax &
Reset, and Targeted Tension only; the other two already include their
specialty treatments. Add-ons are chosen inside MangoMint after a service is
picked, so the site lists them for information only, with no booking buttons.

**Gift cards never expire.** E-gift cards online, physical cards in studio.

---

## 3. House style rules

These came from the owner directly and are not negotiable. Breaking them is
the fastest way to get work rejected.

1. **No em dashes or en dashes anywhere in visitor-facing copy.** Use commas,
   semicolons, colons, periods, or the word "to" for ranges ("Tue to Fri",
   "$5 to $25"). Hyphens inside compound words ("add-on", "e-gift",
   "first-time") are fine. The site is currently at zero dashes; keep it there:

   ```bash
   grep -rn "—\|–\|&mdash;\|&ndash;" --include="*.html" .   # must return nothing
   ```

2. **No wordplay on the brand name.** No "get rooted", "root of it",
   "rooted in". It reads as overkill and on the nose. Earlier taglines were
   rewritten to kill it.

3. **Duration always comes before price**: "60 min · $95", never "$95 / 60".
   Applies to service cards, price pills, and home page teasers.

4. **All Book buttons are solid green.** No `btn--ghost` on booking buttons.
   The alternating filled and outlined look was explicitly rejected.

5. **Keep copy tight.** The site is modeled on en-spa.com structurally but
   deliberately far less wordy. Two sentences beat six.

---

## 4. How the site is put together

```
index.html        Home
services.html     Services and pricing. The centerpiece: 3-step flow.
arielle.html      Arielle's bio
faq.html          FAQ accordions, plus FAQPage structured data
contact.html      Contact details, hours, live Google Maps embed
gift-cards.html   Gift cards
404.html          Branded not-found page. Required: see gotchas.
css/styles.css    Whole design system. Palette lives in :root at the top.
js/main.js        Booking link wiring, mobile nav, sign-up pop-up
assets/           Logos, banner, studio photos, icons, OG image
copy/copy-manifest.json   Every visitor-facing text block, with stable IDs
LAUNCH.md         Domain and DNS runbook
```

### Shared chrome is copy-pasted, not templated

There is no build step, so the top contact strip, header/nav, and footer are
duplicated in all six content pages. Each block is wrapped in a loud comment:

```
SHARED TOP STRIP: if you change this, change it in ALL 7 html files
SHARED HEADER / NAV: ... (and move aria-current="page" per page)
SHARED FOOTER: ...
```

**Editing one means editing all of them.** A scripted find-and-replace across
`*.html` is usually the right tool. `404.html` has no chrome.

This was a deliberate choice: the owner edits these files directly, and JS
includes break when a file is opened from disk (`file://` blocks `fetch`).

### Links and URLs

Internal links are **root-relative and extensionless**: `/services`, not
`services.html`. GitHub Pages serves them that way. Each page carries a
matching `<link rel="canonical">`, and `sitemap.xml` lists the extensionless
forms.

### Local preview

Because links are extensionless, opening files directly from disk gives you
broken navigation. Use a server that maps `/services` to `services.html`:

```python
# save to your scratch dir as serve.py, then: python3 serve.py ~/Desktop/Rooted-Webiste 8642
import http.server, os, sys
ROOT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8642
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=ROOT, **kw)
    def send_head(self):
        p = self.path.split("?")[0].split("#")[0]
        fs = os.path.join(ROOT, p.lstrip("/"))
        if p != "/" and not os.path.exists(fs) and not p.endswith("/"):
            self.path = p + ".html" if os.path.exists(fs + ".html") else "/404.html"
        return super().send_head()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
```

Note this dev server returns the 404 page with a **200** status, so "does
this asset still exist?" checks against it are misleading. Check the file
system, or the live site, instead.

---

## 5. Design system

All tokens are in `:root` at the top of `css/styles.css`. Change them there
and the whole site follows.

| Token | Value | Use |
| --- | --- | --- |
| `--accent` | `#3e5c41` | Deep forest green. Buttons, links, banners, nav pill. |
| `--accent-bright` | `#4e7050` | Hover state |
| `--parchment` | `#f6f1e6` | Page background |
| `--parchment-deep` | `#ece2cd` | Tinted sections, price pills |
| `--card` | `#fdfaf3` | Cards |
| `--bark` | `#48361b` | Headings, prices, footer |
| `--bark-deep` | `#34160c` | Contact strip, footer background |
| `--sage` | `#a4ac92` | Soft accents, dividers |
| `--leaf` | `#5f7250` | Section kickers |

Type: **Lora** (display, headings) and **Karla** (body), from Google Fonts.
An earlier plum/maroon accent was rejected ("tastes like Tylenol"), and
Fraunces/Karla was swapped out for Lora/Karla later. The green is settled.

Prices use the **body** font, not the display serif: Lora's old-style
numerals looked fussy at large sizes. See `.price-pill` and `.card__price`.

---

## 6. MangoMint integration

MangoMint is the booking system. Company ID **630678**. The account slug is
`rootedtherapeutics` (note: not "rootedmassage").

### Booking links

All wiring lives in the `BOOKING` object at the top of `js/main.js`. Any
element with `class="book-btn"` is wired automatically from its
`data-book` attribute:

| `data-book` | Goes to |
| --- | --- |
| `default` | General booking page |
| `signature-60` / `-90` / `-120` | serviceId 7 |
| `relax-reset-60` / `-90` / `-120` | serviceId 10 |
| `targeted-60` / `-90` | serviceId 13 |
| `deep-tissue-90` / `-120` | serviceId 15 |
| `lymphatic-90` | serviceId 17 |
| `giftCards` | Gift card store |
| `portal` | **Still null.** Falls back to `/contact`. |

All durations of one service share a single link; MangoMint asks for the
length after the client lands. If a service is renamed or re-created in
MangoMint its serviceId changes, and the link must be re-copied from
Settings → Services → [service] → Online Booking → Direct link.

### Structure for multiple therapists

`BOOKING.therapists` is keyed by therapist, with Arielle as the only entry
today. The Services page has a "Choose Your Therapist" step (Step One) whose
cards carry `data-therapist`. Selecting a card re-wires every Book button on
the page. Adding a second therapist is: one new object in `js/main.js`, one
duplicated `.therapist-card` in `services.html`. Nothing else changes.

### Booking overlay

Every page carries the MangoMint overlay script in `<head>`. With it loaded,
Book buttons open the scheduler in-page instead of a new tab. `js/main.js`
checks `window.Mangomint` and only adds `target="_blank"` when the script is
absent, so both paths work.

### New-client sign-up pop-up

Configured via the `SIGNUP` object in `js/main.js`: opens after 12 seconds,
at 45% scroll, or on exit intent, whichever comes first. Dismissing stays
quiet for 30 days; clicking through marks the visitor as joined permanently.
State is in `localStorage` under `rooted:signup`. Any element with
`data-open-signup` opens it on demand.

The pop-up and the Services page banner both link to a MangoMint email
signup form. **The discount code is deliberately never printed on the site**:
the visitor joins the email list and the code reaches them from MangoMint.
This is on purpose, to stop throwaway emails from harvesting the code. Do not
"helpfully" add the code to the site.

---

## 7. Open items

- [ ] **Client portal link.** `BOOKING.portal` is `null`; the nav button
      falls back to `/contact`. Needs the real MangoMint client portal URL.
- [ ] **FAQ placeholders.** Three answers still say `[PLACEHOLDER]`: first
      appointment intake flow, gratuity preference, and location/parking.
      Search `grep -rn PLACEHOLDER *.html`. (HSA/FSA is answered.)
- [ ] **Home page parking note.** `index.html` has a placeholder comment for
      neighborhood and parking detail.
- [ ] **MangoMint email automation.** A Flow named "Email discount code on
      signup" exists but is still a **Draft**: its trigger and recipient are
      correct, but the email body is unedited template filler. It cannot be
      finished programmatically; the email editor is a third-party drag-and-
      drop tool in a cross-origin iframe that rejects automated input. A human
      must type it and click Activate. Details in the private notes file.
- [ ] **Social links**, if and when accounts exist.
- [ ] **Landing page video.** The owner mentioned wanting hero footage like
      en-spa.com. Not shot yet.

Keeping `copy/copy-manifest.json` in sync when copy changes is a nice-to-have;
it is a snapshot with stable block IDs, useful for review passes in a doc.

---

## 8. Gotchas

- **The repo is public.** Never commit the discount code, client data, or
  anything from `~/Desktop/Rooted TP/` (that folder holds the EIN
  application, insurance documents, and other business paperwork). Copy
  individual assets into `assets/` deliberately; never `git add` that folder.
- **`404.html` must exist.** Without it, GitHub Pages falls back to serving
  `index.html` with a 200 status for bad URLs, which Google indexes as
  duplicate soft-404s.
- **Headless Chrome clamps the window width** to roughly 500px on this Mac,
  so 375px mobile screenshots come out cropped and look broken when they are
  fine. Use the in-app browser pane with a mobile viewport for mobile checks.
- **Arielle's photo was removed** from the site at the owner's request
  (home page bio, her bio page, therapist card) and the image files were
  deleted. The CSS for `.bio-grid__photo` and `.therapist-card__photo` is
  still present and dormant. To restore: the source image is at
  `~/Desktop/Rooted TP/Pics and B-roll/Arielle/`, and the bio sections need
  their `bio-grid--text-only` class removed.
- **Logo source files have a fake transparency checkerboard baked into the
  pixels.** `assets/logo-mark.png` was cleaned up programmatically. If the
  logo is ever re-exported, check for real alpha before using it.
- **Don't reach for a framework.** The no-build, plain-files setup is
  intentional so the owner can edit the site directly.
