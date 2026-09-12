/* Kaiden Penney — site behaviour
   1. scroll reveals   2. nav scroll-spy   3. theme toggle   4. email de-obfuscation
   Everything here is progressive: with JS off the page is fully readable. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. reveal on scroll ------------------------------------- */
  /* Deliberately a rect sweep rather than an IntersectionObserver. An observer
     only fires for elements that actually cross the viewport, so any jump that
     skips over content — a nav click, a #section deep link, browser scroll
     restoration on reload — leaves everything it skipped stuck at opacity 0
     forever. The sweep reveals anything at or above the fold, so content can
     never be left invisible however the reader got there. */
  function initReveals() {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".reveal, .stagger"));
    if (!targets.length) return;

    if (reduced) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var queued = false;

    function sweep() {
      queued = false;
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      // No measurable viewport (offscreen render, thumbnail capture, collapsed
      // frame): fail toward visible rather than leaving the page blank.
      var limit = vh > 0 ? vh * 0.94 : Infinity;
      for (var i = targets.length - 1; i >= 0; i--) {
        if (targets[i].getBoundingClientRect().top < limit) {
          targets[i].classList.add("is-in");
          targets.splice(i, 1);
        }
      }
      if (!targets.length) {
        window.removeEventListener("scroll", request);
        window.removeEventListener("resize", request);
        window.removeEventListener("hashchange", request);
      }
    }

    function request() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(sweep);
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.addEventListener("hashchange", request);
    window.addEventListener("load", request);
    sweep();
  }

  /* ---------- 2. nav scroll-spy --------------------------------------- */
  function initSpy() {
    var links = document.querySelectorAll(".nav__links a[href^='#']");
    if (!links.length) return;

    var map = {};
    var sections = [];
    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      sections.push(section);
    });
    if (!sections.length) return;

    function setCurrent(id) {
      Array.prototype.forEach.call(links, function (link) {
        link.setAttribute("aria-current", link === map[id] ? "true" : "false");
      });
    }

    if (!("IntersectionObserver" in window)) return;

    var visible = {};
    var navH = parseInt(getComputedStyle(root).getPropertyValue("--nav-h"), 10) || 58;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      // the last section still crossing the band under the nav wins
      for (var i = sections.length - 1; i >= 0; i--) {
        if (visible[sections[i].id]) { setCurrent(sections[i].id); return; }
      }
    }, { rootMargin: "-" + (navH + 4) + "px 0px -62% 0px", threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 3. theme toggle ----------------------------------------- */
  function initTheme() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;

    function label() {
      var explicit = root.getAttribute("data-theme");
      var dark = explicit
        ? explicit === "dark"
        : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
    }

    try {
      var saved = localStorage.getItem("kp-theme");
      if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
    } catch (e) { /* storage blocked — fall back to the OS setting */ }

    label();

    btn.addEventListener("click", function () {
      var explicit = root.getAttribute("data-theme");
      var dark = explicit
        ? explicit === "dark"
        : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("kp-theme", next); } catch (e) { /* non-fatal */ }
      label();
    });
  }

  /* ---------- 4. email ------------------------------------------------- */
  /* Held base64-encoded so address-harvesting crawlers get nothing useful;
     the no-JS fallback in the markup stays human-readable. */
  function initEmail() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-e]"), function (el) {
      var addr;
      try { addr = atob(el.getAttribute("data-e")); } catch (e) { return; }
      var out = el.querySelector("[data-e-text]");
      if (out) out.textContent = addr;
      if (el.tagName === "A") el.setAttribute("href", "mailto:" + addr);
    });
  }

  function boot() {
    initTheme();
    initEmail();
    initReveals();
    initSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
