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
      /* Per-service deep links: client lands directly on that massage.
         If a service is renamed or re-created in MangoMint its serviceId
         changes: Settings → Services → [service] → Online Booking →
         Direct link. All durations of a service share one link. */
      "signature-60": "https://booking.mangomint.com/rootedtherapeutics?serviceId=7",
      "signature-90": "https://booking.mangomint.com/rootedtherapeutics?serviceId=7",
      "signature-120": "https://booking.mangomint.com/rootedtherapeutics?serviceId=7",
      "relax-reset-60": "https://booking.mangomint.com/rootedtherapeutics?serviceId=10",
      "relax-reset-90": "https://booking.mangomint.com/rootedtherapeutics?serviceId=10",
      "relax-reset-120": "https://booking.mangomint.com/rootedtherapeutics?serviceId=10",
      "targeted-60": "https://booking.mangomint.com/rootedtherapeutics?serviceId=13",
      "targeted-90": "https://booking.mangomint.com/rootedtherapeutics?serviceId=13",
      "deep-tissue-90": "https://booking.mangomint.com/rootedtherapeutics?serviceId=15",
      "deep-tissue-120": "https://booking.mangomint.com/rootedtherapeutics?serviceId=15",
      "lymphatic-90": "https://booking.mangomint.com/rootedtherapeutics?serviceId=17",
    },
  },
  giftCards: "https://clients.mangomint.com/gift-cards/rootedtherapeutics",
  portal: null,
};

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
      /* With the MangoMint overlay script in <head>, clicks open the
         in-page scheduler; only fall back to a new tab without it. */
      if (!window.Mangomint) {
        btn.setAttribute("target", "_blank");
        btn.setAttribute("rel", "noopener");
      }
    }
  });
}

/* ================================================================
   NEW CLIENT SIGN-UP POP-UP. One dialog, built here so there is a
   single copy to edit. It sends people to the MangoMint email-signup
   form (SIGNUP.formUrl), which collects the address and reveals the
   discount code. The code is intentionally never printed on the site.

   Behavior:
   - Auto-opens once per visitor: after SIGNUP.delaySeconds, at
     SIGNUP.scrollPercent of the page, or on exit intent (desktop),
     whichever happens first.
   - Closing or "No thanks" stays quiet for SIGNUP.remindAfterDays.
   - Clicking Get My Code, or any direct email-list link on the
     pages, marks the visitor as joined and the pop-up never
     auto-opens for them again.
   Any element with data-open-signup opens the dialog on demand.
   ================================================================ */
const SIGNUP = {
  formUrl: "https://mangomint.co/MT9obD",
  delaySeconds: 12,
  scrollPercent: 45,
  exitIntent: true,
  remindAfterDays: 30,
};

const SIGNUP_STORE = "rooted:signup";

function readSignupState() {
  try {
    return JSON.parse(localStorage.getItem(SIGNUP_STORE) || "{}");
  } catch {
    return {};
  }
}

function writeSignupState(state) {
  try {
    localStorage.setItem(SIGNUP_STORE, JSON.stringify(state));
  } catch {
    /* private browsing: the pop-up just reappears next visit */
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
      <p class="signup__kicker">New Client Offer</p>
      <h2 class="signup__title" id="signupTitle">Take 15% Off Your First Massage</h2>
      <p class="signup__body" id="signupBody">Join the Rooted email list and your discount code
        comes straight to you. Good for a Signature Custom Massage, one use per client.</p>
      <a class="btn signup__submit" data-signup-cta href="${SIGNUP.formUrl}"
         target="_blank" rel="noopener">Get My Code</a>
      <button class="signup__decline" type="button" data-signup-close>No thanks, maybe another time</button>
    </div>`;
  return el;
}

function initSignup() {
  const modal = buildSignupDialog();
  document.body.appendChild(modal);

  const panel = modal.querySelector(".signup__panel");
  let lastFocused = null;
  let autoTimer = null;

  const isOpen = () => !modal.hidden;
  const joined = () => readSignupState().status === "joined";

  function openSignup() {
    if (isOpen()) return;
    cancelAutoOpen();
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("signup-open");
    const cta = modal.querySelector("[data-signup-cta]");
    window.requestAnimationFrame(() => cta && cta.focus());
  }

  function closeSignup(reason) {
    if (!isOpen()) return;
    modal.hidden = true;
    document.body.classList.remove("signup-open");
    if (reason === "dismiss" && !joined()) {
      writeSignupState({
        status: "dismissed",
        until: Date.now() + SIGNUP.remindAfterDays * 86400000,
      });
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function markJoined() {
    writeSignupState({ status: "joined", at: Date.now() });
  }

  /* Keep tabbing inside the dialog while it's open. */
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const focusable = [
      ...panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
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

  modal.querySelector("[data-signup-cta]").addEventListener("click", () => {
    markJoined();
    closeSignup("joined");
  });

  /* Direct email-list links on the pages count as joining too, so the
     pop-up stops nagging people who already signed up through one. */
  document.querySelectorAll('a[href*="mangomint.co/MT9obD"]').forEach((a) => {
    a.addEventListener("click", markJoined);
  });

  document.querySelectorAll("[data-open-signup]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openSignup();
    });
  });

  /* ---- Auto-open triggers ---- */
  function cancelAutoOpen() {
    clearTimeout(autoTimer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("mouseout", onExitIntent);
  }

  function autoOpen() {
    if (!shouldAutoOpen()) return cancelAutoOpen();
    openSignup();
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    if ((window.scrollY / max) * 100 >= SIGNUP.scrollPercent) autoOpen();
  }

  function onExitIntent(e) {
    if (e.clientY <= 0 && !e.relatedTarget) autoOpen();
  }

  function shouldAutoOpen() {
    const state = readSignupState();
    if (state.status === "joined") return false;
    if (state.status === "dismissed" && Date.now() < (state.until || 0)) return false;
    return true;
  }

  if (shouldAutoOpen()) {
    autoTimer = setTimeout(autoOpen, SIGNUP.delaySeconds * 1000);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (SIGNUP.exitIntent && window.matchMedia("(pointer: fine)").matches) {
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
