/* Rooted Massage & Bodywork — site behavior */

/* ================================================================
   MANGOMINT BOOKING LINKS — organized per therapist.

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
      data-therapist="jordan". Done — buttons re-wire on selection.

   Any per-service key left null falls back to that therapist's
   "default" link, so only "default" is required per therapist.
   ================================================================ */
const BOOKING = {
  therapists: {
    arielle: {
      default: "https://booking.mangomint.com/rootedtherapeutics",
      /* Per-service deep links — client lands directly on that massage.
         If a service is renamed/re-created in MangoMint its serviceId
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
});
