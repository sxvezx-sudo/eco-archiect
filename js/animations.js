/* ─────────────────────────────────────────────────────────────────
   Eco Architect — Animation System
   Requires: GSAP 3, ScrollTrigger, CustomEase, ScrollToPlugin
   Load order: components.js → main.js → gsap → … → animations.js
   ───────────────────────────────────────────────────────────────── */

(function () {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger, CustomEase, ScrollToPlugin);
    CustomEase.create('ea', 'M0,0 C0.16,1 0.3,1 1,1'); // fast attack, no overshoot

    /* ADJUST: scroll animation ──────────────────────────────────────────────── */
    var DUR      = 1;   // element fade-in duration (s)
    var STAGGER  = 0.001 ; // delay between staggered elements (s)
    var Y_OFFSET = 25 ;    // starting y offset in px

    /* ADJUST: page transition overlay ──────────────────────────────────────── */
    var OVL_IN  = 0.25;  // overlay fade-in on exit (s)
    var OVL_OUT = 0.25; // overlay fade-out on entry (s)

    /* ADJUST: project card scroll trigger ───────────────────────────────────── */
    var CARD_DUR     = 0.5;  // card fade-in duration (s)
    var CARD_STAGGER = 0.001; // delay between cards (s)

    /* ADJUST: magnetic button ───────────────────────────────────────────────── */
    var MAG_PULL  = 0.15; // cursor pull strength (0 = none, 1 = full follow)
    var MAG_SCALE = 0.95; // scale on press

    // Elements animated in reading order (top-to-bottom, left-to-right via DOM order)
    /* ADJUST: which elements animate ───────────────────────────────────────── */
    var SEL = [
        '.page h1', '.page h2', '.page h3',
        '.page p', '.page li',
        '.page img', '.page figure', '.page a', 
        '.page .eyebrow', '.page .award-row', 
        '.page .btn', '.page .spec-row',
        '.page .stat-item', '.page .gallery__item',
    ].join(', ');

    // ── Detect navigation type ────────────────────────────────────────────────
    var navEntry  = performance.getEntriesByType('navigation')[0];
    var isRefresh = navEntry ? navEntry.type === 'reload' : false;

    // Overlay lives in HTML at opacity: 1 (CSS default) — no flash possible
    var overlay = document.querySelector('.page-overlay');

    // ── Utilities (run on all navigation types) ───────────────────────────────

    // Exit: fade overlay in, then navigate
    function setupExitHandler() {
        document.addEventListener('click', function (e) {
            var a = e.target.closest('a[href]');
            if (!a) return;
            var href = a.getAttribute('href');
            if (!href || href[0] === '#' || /^(https?:|mailto:|tel:)/.test(href)) return;
            e.preventDefault();
            gsap.to(overlay, {
                opacity:  1,
                duration: OVL_IN, /* ADJUST: overlay fade-in on exit */
                ease:     'power2.in',
                onComplete: function () { window.location.href = href; },
            });
        });
    }

    // Smooth anchor scroll using ScrollToPlugin
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 80 }, /* ADJUST: anchor scroll offset */
                    duration: 0.75,
                    ease: 'power2.inOut',
                });
            });
        });
    }

    // Magnetic press effect on .btn elements
    function setupMagneticButtons() {
        document.querySelectorAll('a.btn, button.btn').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                gsap.to(btn, {
                    x:        (e.clientX - r.left - r.width  / 2) * MAG_PULL, /* ADJUST: pull strength */
                    y:        (e.clientY - r.top  - r.height / 2) * MAG_PULL,
                    scale:    MAG_SCALE, /* ADJUST: press scale */
                    duration: 0.2,
                    ease:     'power2.out',
                });
            });
            btn.addEventListener('mouseleave', function () {
                gsap.to(btn, {
                    x: 0, y: 0, scale: 1,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.4)', /* ADJUST: spring-back easing */
                });
            });
        });
    }

    // ── Refresh: fade overlay out quickly, skip element stagger ─────────────
    if (isRefresh) {
        if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.out' }); /* ADJUST: refresh fade-out speed */
        setupExitHandler();
        setupSmoothScroll();
        setupMagneticButtons();
        return;
    }

    // ── 1. Scroll-triggered fade in — set up immediately for below-fold els ───
    // Called before intro starts so fast scrollers don't see stuck invisible content
    function setupScrollTriggers(els) {
        if (!els.length) return;
        ScrollTrigger.batch(els, {
            onEnter: function (batch) {
                gsap.to(batch, {
                    opacity: 1, y: 0,
                    duration: DUR,     /* ADJUST: scroll element fade duration */
                    stagger:  STAGGER, /* ADJUST: stagger between batch items */
                    ease:     'ea',
                    clearProps: 'transform,opacity',
                });
            },
            start: 'top 105%', /* ADJUST: trigger point (distance from bottom of viewport) */
            once:  true,
        });
    }

    function setupCardTriggers(els) {
        if (!els.length) return;
        ScrollTrigger.batch(els, {
            onEnter: function (batch) {
                gsap.to(batch, {
                    opacity: 1, y: 0,
                    duration: CARD_DUR,     /* ADJUST: card fade-in duration */
                    stagger:  CARD_STAGGER, /* ADJUST: delay between cards */
                    ease:     'ea',
                    clearProps: 'transform,opacity',
                });
            },
            start: 'top 105%',
            once:  true,
        });
    }

    // ── Overlay fade + page intro stagger ────────────────────────────────────
    function init() {
        // Pre-hide now — cards are in the DOM, overlay covers any flash
        gsap.set(SEL, { opacity: 0, y: Y_OFFSET }); /* ADJUST: starting y-offset */

        var vh    = window.innerHeight;
        var all   = Array.from(document.querySelectorAll(SEL));
        var above = all.filter(function (el) { return el.getBoundingClientRect().top < vh; });
        var below = all.filter(function (el) { return el.getBoundingClientRect().top >= vh; });
        var belowCards = below.filter(function (el) { return el.classList.contains('proj-card'); });
        var belowRest  = below.filter(function (el) { return !el.classList.contains('proj-card'); });

        // Activate scroll triggers for below-fold elements right away so
        // fast scrollers during the intro don't see stuck invisible content
        setupScrollTriggers(belowRest);
        setupCardTriggers(belowCards);

        var tl = gsap.timeline();

        // Overlay always starts at opacity: 1 (CSS) — fade it out on every load
        if (overlay) {
            tl.to(overlay, {
                opacity:  0,
                duration: OVL_OUT, /* ADJUST: overlay fade-out on page load */
                ease:     'power2.out',
            });
        }

        // Stagger first-screenful elements in, reading order (= DOM order)
        if (above.length) {
            tl.to(above, {
                opacity:  1,
                y:        0,
                duration: DUR,     /* ADJUST: intro element fade duration */
                stagger:  STAGGER, /* ADJUST: intro stagger delay */
                ease:     'ea',
                clearProps: 'transform,opacity',
            }, '<0.08');
        }
    }

    // Wait for components.js to finish injecting cards before running intro.
    // The black overlay hides any flash during this window.
    if (window.__componentsReady) {
        init();
    } else {
        document.addEventListener('components:ready', init, { once: true });
    }

    setupExitHandler();
    setupSmoothScroll();
    setupMagneticButtons();

})();
