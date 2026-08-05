/* Rooted Massage & Bodywork — site behavior */

/* ================================================================
   MANGOMINT BOOKING LINKS
   Fill these in from MangoMint → Settings → Online Booking →
   Setup & Integration. Every element with class "book-btn" is wired
   automatically from its data-book attribute:

     <a class="book-btn" data-book="default">      → BOOKING.default
     <a class="book-btn" data-book="giftCards">    → BOOKING.giftCards
     <a class="book-btn" data-book="therapeutic-90"> → per-service link

   Any key left null falls back to BOOKING.default; if that is also
   null the button keeps its normal href (the Services page).
   You only NEED to set "default" to go live — per-service deep links
   are optional extras you can add any time.
   ================================================================ */
const BOOKING = {
  default: null,        // main online-booking link
  giftCards: null,      // MangoMint gift-card purchase link
  portal: null,         // client portal / login link

  /* Optional per-service deep links (leave null to use default): */
  "relaxation-60": null,
  "relaxation-90": null,
  "therapeutic-60": null,
  "therapeutic-90": null,
  "therapeutic-120": null,
  "deep-tissue-60": null,
  "deep-tissue-90": null,
  "lymphatic-90": null,
};

document.addEventListener("DOMContentLoaded", () => {
  /* Wire Book buttons once links exist */
  document.querySelectorAll(".book-btn").forEach((btn) => {
    const key = btn.dataset.book || "default";
    const url = BOOKING[key] || BOOKING.default;
    if (url) {
      btn.setAttribute("href", url);
      /* Without the MangoMint script tag in <head>, open in a new tab.
         With it, MangoMint intercepts the click and opens its overlay. */
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
    }
  });

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
