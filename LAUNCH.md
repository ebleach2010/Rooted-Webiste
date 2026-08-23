# Launch runbook: putting rootedmassagebodywork.com live

Written for a Claude agent (Cowork) working alongside Eric. The goal: the finished
site, currently served by GitHub Pages at https://ebleach2010.github.io/Rooted-Webiste/,
becomes the site at https://rootedmassagebodywork.com. No site files need to change;
this is all merge, settings, and DNS.

## Current state

- Repo: `ebleach2010/Rooted-Webiste` on GitHub. Static HTML/CSS/JS, no build step.
- GitHub Pages serves branch `main` and redeploys automatically on every push to it.
- Finished work lives in PR #1 (branch `claude/email-signup-popup-discount-zjz0il`).
- The domain `rootedmassagebodywork.com` currently points at an old Figma Sites setup.
- Site URLs (canonicals, sitemap, structured data) already assume the real domain.

## Step 1: Merge PR #1

https://github.com/ebleach2010/Rooted-Webiste/pull/1

Merge it into `main` (a normal merge; take it out of draft first if needed). Then
confirm the redeploy: the Actions tab shows a green "pages build and deployment" run,
and a hard refresh of the beta URL shows the new serif font (Fraunces) in headings.

Note: on the temporary github.io address the in-page navigation can misbehave, because
the site's links are written for a domain root (`/services`) while github.io serves it
under `/Rooted-Webiste/`. That is expected and disappears once the custom domain is on.

## Step 2: Tell GitHub Pages about the domain

Repo → Settings → Pages:

1. Confirm Source is "Deploy from a branch", branch `main`, folder `/ (root)`.
2. In "Custom domain", enter `rootedmassagebodywork.com` and save. GitHub commits a
   `CNAME` file to `main`; leave that file alone forever after.
3. The DNS check will fail until Step 3 is done. That is fine.

## Step 3: DNS changes at the domain registrar

This is the part that needs Eric logged in to wherever `rootedmassagebodywork.com` is
managed (the registrar he bought it from, or wherever its nameservers point).

**Before touching anything, copy or screenshot every existing DNS record.** That is
the rollback.

Then, changing only the records for `@` (the bare domain) and `www`:

1. Delete the A and/or CNAME records that point the bare domain and `www` at Figma
   Sites. Touch nothing else. MX and TXT records, if any, stay exactly as they are.
2. Add four A records on `@`, one per address:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add a CNAME record: `www` → `ebleach2010.github.io`
4. Optional but nice, four AAAA records on `@`:
   - `2606:50c0:8000::153`
   - `2606:50c0:8001::153`
   - `2606:50c0:8002::153`
   - `2606:50c0:8003::153`

Also open Figma's site settings and detach the custom domain there, so Figma stops
claiming it.

## Step 4: HTTPS

Back in GitHub → Settings → Pages: once the DNS check passes (minutes to an hour),
tick **Enforce HTTPS**. The checkbox may be greyed out while GitHub provisions the
certificate; that usually resolves within the hour. Do not skip this.

## Step 5: Verify

- https://rootedmassagebodywork.com loads with a padlock
- https://www.rootedmassagebodywork.com works too
- /services, /faq, /contact, /gift-cards, /arielle all load; a made-up URL like
  /nonsense shows the branded 404 page
- Navigation links work when clicked (this is the github.io quirk being gone)
- A "Book Now" button opens the MangoMint scheduler overlay in-page
- The new-client popup appears after about 12 seconds or half a page of scrolling,
  and "Get My Code" opens the MangoMint email-signup form
- The map renders on the contact page
- On a phone: menu opens, phone number link dials, email link opens mail

## Step 6: After launch

1. Google Business Profile: change the website field to https://rootedmassagebodywork.com
2. Google Search Console: add the domain as a property and submit
   `https://rootedmassagebodywork.com/sitemap.xml`
3. MangoMint: confirm the ROOTED410 offer has "Once per client" and
   "New clients only" both enabled

## Rollback

Nothing here is destructive. The site keeps working at the github.io address no matter
what happens with DNS. If the domain misbehaves, restore the DNS records copied at the
top of Step 3 and the old Figma site is back while things get sorted.
