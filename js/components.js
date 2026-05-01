(async function () {
    async function inject(selector, url) {
        const el = document.querySelector(selector);
        if (!el) return;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to load ' + url);
            el.outerHTML = await res.text();
        } catch (e) {
            console.warn('Component load failed:', e);
        }
    }

    async function injectCards() {
        const placeholders = document.querySelectorAll('[data-component="project-card"]');
        if (!placeholders.length) return;
        try {
            const res = await fetch('components/ui/project-card.html');
            if (!res.ok) throw new Error('Failed to load project-card');
            const template = (await res.text()).trim();
            placeholders.forEach(function (el) {
                const title    = el.dataset.title    || '';
                const location = el.dataset.location || '';
                const image    = el.dataset.image    || '';
                const url      = el.dataset.url      || '#';
                let html = template
                    .replace(/\{\{url\}\}/g,      url)
                    .replace(/\{\{image\}\}/g,    image)
                    .replace(/\{\{title\}\}/g,    title)
                    .replace(/\{\{location\}\}/g, location);
                const tmp = document.createElement('div');
                tmp.innerHTML = html;
                const card = tmp.firstElementChild;
                const style = el.getAttribute('style');
                if (style) card.setAttribute('style', style);
                const extraClass = el.getAttribute('class');
                if (extraClass) extraClass.trim().split(/\s+/).forEach(function (c) { card.classList.add(c); });
                el.outerHTML = card.outerHTML;
            });
        } catch (e) {
            console.warn('Card inject failed:', e);
        }
    }

    await Promise.all([
        inject('[data-component="navbar"]', 'components/navbar.html'),
        inject('[data-component="footer"]', 'components/footer.html'),
        injectCards(),
    ]);

    setActiveNav();
    initHamburger();
    initScrolledNav();
    initCardOrientations();

    // Signal animations.js that all components (including project cards) are in the DOM
    window.__componentsReady = true;
    document.dispatchEvent(new CustomEvent('components:ready'));
})();

function setActiveNav() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    /* project-detail is a child of the projects section */
    const effective = filename === 'project-detail.html' ? 'projects.html' : filename;
    document.querySelectorAll('.nav-link, .nav-overlay-link').forEach(function (link) {
        const href = (link.getAttribute('href') || '').split('/').pop();
        if (href && href !== '#' && href === effective) {
            link.classList.add('active');
        }
    });
}

function initHamburger() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.nav-hamburger');
    const overlay = document.querySelector('.nav-overlay');
    if (!hamburger || !nav) return;

    function openMenu() {
        nav.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        if (overlay) overlay.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        if (overlay) overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
        nav.classList.contains('open') ? closeMenu() : openMenu();
    });

    if (overlay) {
        overlay.querySelectorAll('.nav-overlay-link').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    }

    document.addEventListener('click', function (e) {
        if (nav.classList.contains('open') && !nav.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });
}

function initScrolledNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    function onScroll() {
        nav.classList.toggle('nav--scrolled', window.scrollY > 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initCardOrientations() {
    document.querySelectorAll('.proj-card-img img').forEach(function (img) {
        function apply() {
            img.closest('.proj-card-img').classList.toggle('is-portrait', img.naturalHeight > img.naturalWidth);
        }
        if (img.complete && img.naturalWidth) { apply(); return; }
        img.addEventListener('load', apply, { once: true });
    });
}
