/**
 * animations.js
 * James M. Byrd, Attorney at Law
 *
 * Contains three features:
 * 1. SCROLL REVEAL     - IntersectionObserver fades .reveal elements into view
 * 2. NAVBAR SCROLL BG  - Adds .scrolled class to <header> after scrolling 50px
 * 3. COUNTER ANIMATION - Animates [data-target] numbers on viewport entry
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     1. SCROLL REVEAL
  ══════════════════════════════════════════════ */
  function initScrollReveal() {
    // Guard against double-initialization
    if (window.__scrollRevealInit) return;
    window.__scrollRevealInit = true;

    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el    = entry.target;
          var delay = el.getAttribute('data-delay');

          if (delay) {
            setTimeout(function () {
              el.classList.add('revealed');
            }, parseFloat(delay) * 1000);
          } else {
            el.classList.add('revealed');
          }

          // Unobserve after reveal so it only fires once
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ══════════════════════════════════════════════
     2. NAVBAR SCROLL BACKGROUND
  ══════════════════════════════════════════════ */
  function attachNavbarScroll(header) {
    function onScroll() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Apply immediately in case the page loaded scrolled
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initNavbarScroll() {
    var header = document.querySelector('header');

    if (header) {
      // Header already in DOM
      attachNavbarScroll(header);
      return;
    }

    // Header loaded via data-include partial - wait for it
    var mutationObserver = new MutationObserver(function (mutations, obs) {
      var h = document.querySelector('header');
      if (h) {
        obs.disconnect();
        attachNavbarScroll(h);
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* ══════════════════════════════════════════════
     3. COUNTER ANIMATIONS
  ══════════════════════════════════════════════ */
  function animateCounter(el, target, duration) {
    var start     = null;
    var startVal  = 0;
    var prefix    = el.getAttribute('data-prefix') || '';
    var suffix    = el.getAttribute('data-suffix') || '';
    var decimals  = parseInt(el.getAttribute('data-decimals') || '0', 10);
    duration      = duration || 2000;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed  = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var easedVal = startVal + (target - startVal) * easeOutCubic(progress);

      el.textContent = prefix + easedVal.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-target]').forEach(function (el) {
        var target   = parseFloat(el.getAttribute('data-target'));
        var prefix   = el.getAttribute('data-prefix') || '';
        var suffix   = el.getAttribute('data-suffix') || '';
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      });
      return;
    }

    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el     = entry.target;
          var target = parseFloat(el.getAttribute('data-target'));
          if (isNaN(target)) return;
          animateCounter(el, target, 2000);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-target]').forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init() {
    initScrollReveal();
    initNavbarScroll();
    initCounters();
  }

  // Run on DOMContentLoaded; also re-run reveals after partials finish loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init scroll reveal after includes load (new .reveal elements may be injected)
  document.addEventListener('includesLoaded', function () {
    // Reset guard so new elements can be observed
    window.__scrollRevealInit = false;
    initScrollReveal();
  });

})();
