/* Rooted Massage & Bodywork: site behavior */

/* ================================================================
   MANGOMINT BOOKING LINKS, organized per therapist.

   Every element with class "book-btn" is wired automatically:
     data-book="signature-60"  → active therapist's link for that service
     data-book="default"       → active therapist's general booking link
     data-book="giftCards"     → gift-card purchase page
     data-book="portal"        → client portal (fill in when available)

   The "active therapist" is the .therapist-card with aria-pressed="true"
   on the Services page (Arielle by default, and on pages with no picker).

   TO ADD A THERAPIST LATER:
   1. Copy Arielle's block below under a new key (e.g. jordan: {...})
      and paste that provider's MangoMint service links into it.
   2. Duplicate the .therapist-card in services.html with
      data-therapist="jordan". Done. Buttons re-wire on selection.

   Any per-service key left null falls back to that therapist's
   "default" link, so only "default" is required per therapist.
   ================================================================ */
const BOOKING = {
  therapists: {
    arielle: {
      default: "https://booking.mangomint.com/rootedtherapeutics",
      /* Optional per-service deep links. Paste from MangoMint when ready: */
      "signature-60": null,
      "signature-90": null,
      "signature-120": null,
      "relax-reset-60": null,
      "relax-reset-90": null,
      "relax-reset-120": null,
      "targeted-60": null,
      "targeted-90": null,
      "deep-tissue-90": null,
      "deep-tissue-120": null,
      "lymphatic-90": null,
    },
  },
  giftCards: "https://clients.mangomint.com/gift-cards/rootedtherapeutics",
  portal: null,
};

/* ================================================================
   EMAIL SIGN-UP POP-UP. Trades the new-client discount code for an
   email address, so people join the list even if they don't book now.

   TO GO LIVE, set `endpoint` below to your email platform's form URL:

     Mailchimp  → Audience ▸ Signup forms ▸ Embedded form. Copy the
                  <form action="..."> URL. Keep mode "form", field "EMAIL".
     Klaviyo    → https://manage.kmail-lists.com/ajax/subscriptions/subscribe-to-list
                  mode "form", field "email", plus extra: { g: "LIST_ID" }.
     ConvertKit → https://app.convertkit.com/forms/FORM_ID/subscriptions
                  mode "form", field "email_address".
     Formspree / Zapier / Make → mode "json", field "email".

   Until an endpoint is set, the form still shows the code and opens a
   pre-filled email to fallbackMailto so no address is lost, but nothing
   lands in a list automatically. Set the endpoint before launch.
   ================================================================ */
const EMAIL_SIGNUP = {
  endpoint: null,             /* PLACEHOLDER: paste the form URL from your email platform */
  mode: "form",               /* "form" = classic form POST (Mailchimp/Klaviyo/ConvertKit) | "json" */
  emailField: "EMAIL",        /* the field name your platform expects */
  extraFields: {},            /* e.g. { g: "ABC123" } for a Klaviyo list id */
  fallbackMailto: "hello@example.com", /* PLACEHOLDER: real inbox */

  promoCode: "ROOTED410",
  offerLine: "15% off a Signature Custom Massage + one free add-on",

  /* When it appears (first match wins), and how long a dismissal sticks. */
  delaySeconds: 18,
  scrollPercent: 45,
  exitIntent: true,
  remindAfterDays: 30,
};

const SIGNUP_STORE = "rooted:signup";

let activeTherapist = "arielle";

function wireBookButtons() {
  document.querySelectorAll(".book-btn").forEach((btn) => {
    const key = btn.dataset.book || "default";
    let url = null;
    if (key === "giftCards" || key === "portal") {
      url = BOOKING[key];
    } else {
      const t = BOOKING.therapists[activeTherapist] || {};
      url = t[key] || t.default || null;
    }
    if (url) {
      btn.setAttribute("href", url);
      /* Without the MangoMint script tag in <head>, open in a new tab.
         With it, MangoMint intercepts the click and opens its overlay. */
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
    }
  });
}

/* ---- Sign-up pop-up ------------------------------------------------------
   The dialog is built here rather than pasted into all 7 HTML files, so
   there is one copy to edit. Any element with data-open-signup opens it. */

function readSignupState() {
  try {
    return JSON.parse(localStorage.getItem(SIGNUP_STORE) || "{}");
  } catch {
    return {};
  }
}

/* Same person, slightly different typing: Bob@Gmail.com, bob+spa@gmail.com and
   b.o.b@gmail.com are all one address. Gmail ignores dots and +tags, so we
   fold those before comparing. Other providers only get case folded. */
function normalizeEmail(raw) {
  const value = String(raw || "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 0) return value;
  let user = value.slice(0, at);
  const domain = value.slice(at + 1);
  user = user.split("+")[0];
  if (domain === "gmail.com" || domain === "googlemail.com") {
    user = user.replace(/\./g, "");
    return `${user}@gmail.com`;
  }
  return `${user}@${domain}`;
}

function hasClaimed(email) {
  const claimed = readSignupState().claimed || [];
  return claimed.includes(normalizeEmail(email));
}

function writeSignupState(state) {
  try {
    localStorage.setItem(SIGNUP_STORE, JSON.stringify(state));
  } catch {
    /* private browsing. The pop-up just reappears next visit */
  }
}

function buildSignupDialog() {
  const el = document.createElement("div");
  el.className = "signup";
  el.id = "signupModal";
  el.hidden = true;
  el.innerHTML = `
    <div class="signup__backdrop" data-signup-close></div>
    <div class="signup__panel" role="dialog" aria-modal="true"
         aria-labelledby="signupTitle" aria-describedby="signupBody">
      <button class="signup__close" type="button" aria-label="Close" data-signup-close>&times;</button>
      <img class="signup__mark" src="/assets/logo-mark.png" alt="" aria-hidden="true">

      <div class="signup__step" data-step="form">
        <p class="signup__kicker">New Client Offer</p>
        <h2 class="signup__title" id="signupTitle">Take 15% Off Your First Massage</h2>
        <p class="signup__body" id="signupBody">Plus one free add-on on a Signature Custom Massage.
          Tell us where to send your code and it&rsquo;s yours.</p>

        <form class="signup__form" novalidate>
          <label class="signup__label" for="signupEmail">Email address</label>
          <input class="signup__input" id="signupEmail" type="email" name="email"
                 autocomplete="email" placeholder="you@example.com" required>
          <p class="signup__error" data-signup-error hidden></p>
          <!-- Bot trap: real people never fill this in. -->
          <input class="signup__trap" type="text" name="company" tabindex="-1"
                 autocomplete="off" aria-hidden="true">
          <button class="btn signup__submit" type="submit">Send My Code</button>
        </form>
        <button class="signup__decline" type="button" data-signup-close>No thanks, maybe another time</button>
      </div>

      <div class="signup__step" data-step="done" hidden>
        <p class="signup__kicker" data-signup-kicker>All Set</p>
        <h2 class="signup__title">Here&rsquo;s Your Code</h2>
        <p class="signup__body" data-signup-donetext>Use it when you book online for 15% off a
          Signature Custom Massage plus one free add-on. One use per client.</p>
        <p class="signup__code"><span data-signup-code>ROOTED410</span></p>
        <button class="signup__copy" type="button" data-signup-copy>Copy code</button>
        <a class="btn signup__submit book-btn" data-book="signature-60" href="/services#signature">Book Now</a>
        <button class="signup__decline" type="button" data-signup-close>Maybe later</button>
      </div>
    </div>`;
  return el;
}

function initSignup() {
  const modal = buildSignupDialog();
  document.body.appendChild(modal);

  const panel = modal.querySelector(".signup__panel");
  const form = modal.querySelector(".signup__form");
  const input = modal.querySelector(".signup__input");
  const trap = modal.querySelector(".signup__trap");
  const errorEl = modal.querySelector("[data-signup-error]");
  const submit = modal.querySelector(".signup__submit");
  const stepForm = modal.querySelector('[data-step="form"]');
  const stepDone = modal.querySelector('[data-step="done"]');

  modal.querySelectorAll("[data-signup-code]").forEach((n) => {
    n.textContent = EMAIL_SIGNUP.promoCode;
  });

  let lastFocused = null;
  let autoTimer = null;

  const isOpen = () => !modal.hidden;
  const subscribed = () => readSignupState().status === "subscribed";

  const kickerEl = modal.querySelector("[data-signup-kicker]");
  const doneTextEl = modal.querySelector("[data-signup-donetext]");
  const doneCopy = {
    fresh: {
      kicker: "All Set",
      text: "Use it when you book online for 15% off a Signature Custom Massage plus one free add-on. One use per client.",
    },
    repeat: {
      kicker: "You Already Have This One",
      text: "That address is already signed up, so here&rsquo;s the same code again. It&rsquo;s good for one visit, on a Signature Custom Massage.",
    },
  };

  function showStep(name, opts) {
    stepForm.hidden = name !== "form";
    stepDone.hidden = name !== "done";
    if (name === "done") {
      const copy = doneCopy[opts && opts.repeat ? "repeat" : "fresh"];
      kickerEl.textContent = copy.kicker;
      doneTextEl.innerHTML = copy.text;
    }
  }

  function openSignup(step) {
    if (isOpen()) return;
    cancelAutoOpen();
    lastFocused = document.activeElement;
    showStep(step || (subscribed() ? "done" : "form"));
    modal.hidden = false;
    document.body.classList.add("signup-open");
    /* Focus the first useful control, not the close button. */
    const target = stepForm.hidden
      ? modal.querySelector("[data-signup-copy]")
      : input;
    window.requestAnimationFrame(() => target && target.focus());
  }

  function closeSignup(reason) {
    if (!isOpen()) return;
    modal.hidden = true;
    document.body.classList.remove("signup-open");
    if (reason === "dismiss" && !subscribed()) {
      writeSignupState({
        status: "dismissed",
        until: Date.now() + EMAIL_SIGNUP.remindAfterDays * 86400000,
      });
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* Keep tabbing inside the dialog while it's open. */
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const focusable = [
      ...panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not(.signup__trap), [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((n) => n.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") closeSignup("dismiss");
    else trapFocus(e);
  });

  modal.querySelectorAll("[data-signup-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeSignup("dismiss"));
  });

  document.querySelectorAll("[data-open-signup]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openSignup();
    });
  });

  const copyBtn = modal.querySelector("[data-signup-copy]");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_SIGNUP.promoCode);
      copyBtn.textContent = "Copied!";
    } catch {
      copyBtn.textContent = "Press Ctrl/Cmd + C to copy";
    }
    setTimeout(() => (copyBtn.textContent = "Copy code"), 2500);
  });

  /* ---- Submission ---- */
  async function sendToList(email) {
    if (!EMAIL_SIGNUP.endpoint) {
      /* No platform wired up yet. Hand the address off by email instead of
         dropping it. Remove once EMAIL_SIGNUP.endpoint is set. */
      console.warn(
        "EMAIL_SIGNUP.endpoint is not set. Falling back to a mailto draft. " +
          "Paste your email platform's form URL into js/main.js to collect addresses automatically."
      );
      const subject = encodeURIComponent("New client list sign-up");
      const body = encodeURIComponent(`Please add ${email} to the Rooted email list.`);
      window.open(
        `mailto:${EMAIL_SIGNUP.fallbackMailto}?subject=${subject}&body=${body}`,
        "_blank"
      );
      return;
    }

    if (EMAIL_SIGNUP.mode === "json") {
      const res = await fetch(EMAIL_SIGNUP.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          [EMAIL_SIGNUP.emailField]: email,
          ...EMAIL_SIGNUP.extraFields,
        }),
      });
      if (!res.ok) throw new Error(`Sign-up failed (${res.status})`);
      return;
    }

    /* Classic form POST. Mailchimp and friends don't send CORS headers, so
       the response is opaque, so a resolved fetch is our success signal. */
    const data = new FormData();
    data.append(EMAIL_SIGNUP.emailField, email);
    Object.entries(EMAIL_SIGNUP.extraFields).forEach(([k, v]) => data.append(k, v));
    await fetch(EMAIL_SIGNUP.endpoint, {
      method: "POST",
      mode: "no-cors",
      body: data,
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    errorEl.hidden = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errorEl.textContent = "Please enter a valid email address.";
      errorEl.hidden = false;
      input.focus();
      return;
    }
    if (trap.value) {
      /* Bot filled the honeypot. Show success, send nothing. */
      showStep("done");
      return;
    }
    if (hasClaimed(email)) {
      /* Already signed up on this browser. Hand back the code without
         posting a duplicate to the list. */
      showStep("done", { repeat: true });
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";
    try {
      await sendToList(email);
      const state = readSignupState();
      writeSignupState({
        status: "subscribed",
        at: Date.now(),
        claimed: [...new Set([...(state.claimed || []), normalizeEmail(email)])],
      });
      showStep("done");
      wireBookButtons();
      const copy = modal.querySelector("[data-signup-copy]");
      window.requestAnimationFrame(() => copy && copy.focus());
    } catch (err) {
      console.error(err);
      errorEl.textContent =
        "Something went wrong on our end. Please try again, or email us and we'll send your code.";
      errorEl.hidden = false;
    } finally {
      submit.disabled = false;
      submit.textContent = "Send My Code";
    }
  });

  /* ---- Auto-open triggers ---- */
  function cancelAutoOpen() {
    clearTimeout(autoTimer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("mouseout", onExitIntent);
  }

  function autoOpen() {
    if (!shouldAutoOpen()) return cancelAutoOpen();
    openSignup("form");
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    if ((window.scrollY / max) * 100 >= EMAIL_SIGNUP.scrollPercent) autoOpen();
  }

  function onExitIntent(e) {
    if (e.clientY <= 0 && !e.relatedTarget) autoOpen();
  }

  function shouldAutoOpen() {
    const state = readSignupState();
    if (state.status === "subscribed") return false;
    if (state.status === "dismissed" && Date.now() < (state.until || 0)) return false;
    return true;
  }

  if (shouldAutoOpen()) {
    autoTimer = setTimeout(autoOpen, EMAIL_SIGNUP.delaySeconds * 1000);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (EMAIL_SIGNUP.exitIntent && window.matchMedia("(pointer: fine)").matches) {
      document.addEventListener("mouseout", onExitIntent);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  /* Therapist picker (Services page). One card today; selecting a card
     re-wires every Book button to that therapist's links. */
  const cards = document.querySelectorAll(".therapist-card[data-therapist]");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      activeTherapist = card.dataset.therapist;
      cards.forEach((c) =>
        c.setAttribute("aria-pressed", String(c === card))
      );
      wireBookButtons();
    });
  });

  wireBookButtons();

  /* Mobile nav toggle */
  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  initSignup();
});
