/**
 * cms-content.js
 * Fetches /_data/content.json (generated at build time by scripts/generate-data.js)
 * and renders CMS-managed content into every page.
 * Falls back gracefully to hardcoded HTML if the JSON is unavailable.
 */
(async function () {
    let data;
    try {
        const res = await fetch('/_data/content.json');
        if (!res.ok) return;
        data = await res.json();
    } catch (_) { return; }

    // Wait for navbar/footer/cards to be injected before touching the DOM
    if (window.__componentsReady) run();
    else document.addEventListener('components:ready', run);

    function run() {
        const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
        if (page === 'index' || page === '')  renderIndex();
        if (page === 'projects')              renderProjects();
        if (page === 'about')                 renderAbout();
        if (page === 'project-detail')        renderDetail();
        if (page === 'contact')               renderContactPage();
        renderFooter(); // always — footer is on every page
    }

    // ── HELPERS ────────────────────────────────────────────────────────────────

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function nl2br(s) {
        return esc(s).replace(/\n\n/g, '<br><br>').replace(/\n/g, ' ');
    }

    function publishedProjects() {
        return (data.projects || []).filter(p => p.published !== false);
    }

    // ── PROJECT CARD (mirrors components/ui/project-card.html) ────────────────

    function makeCard(p, inlineGrid) {
        const a = document.createElement('a');
        a.className = 'proj-card proj-card--vertical';
        a.href = 'project-detail.html?slug=' + encodeURIComponent(p.slug);
        if (inlineGrid) {
            a.style.gridColumn = inlineGrid.col + '/span 6';
            a.style.gridRow    = String(inlineGrid.row);
            a.style.alignSelf  = 'start';
        }
        a.innerHTML =
            '<div class="proj-card-img">' +
                '<img src="' + esc(p.main_image || '') + '" alt="' + esc(p.title || '') + '" loading="lazy">' +
            '</div>' +
            '<div class="card-name">' +
                '<div class="ico-outline" aria-hidden="true"></div>' +
                '<h3 class="card-name-text">' + esc(p.title || '') + '</h3>' +
            '</div>' +
            '<p class="card-loc">' + esc(p.location || '') + '</p>';
        return a;
    }

    function fillGrid(grid, projects, useInlineGrid) {
        if (!grid || !projects.length) return;
        grid.innerHTML = '';
        projects.forEach(function (p, i) {
            const inlineGrid = useInlineGrid
                ? { col: i % 2 === 0 ? 1 : 7, row: Math.floor(i / 2) + 1 }
                : null;
            const card = makeCard(p, inlineGrid);
            grid.appendChild(card);
        });
        if (typeof initCardOrientations === 'function') initCardOrientations();
    }

    // ── INDEX PAGE ─────────────────────────────────────────────────────────────

    function renderIndex() {
        const projects = publishedProjects().slice(0, 6);
        const grid     = document.querySelector('.projects .projects-grid');
        fillGrid(grid, projects, true);

        const countEl = document.querySelector('.proj-count');
        if (countEl) countEl.textContent = '(' + projects.length + ')';

        renderTestimonial();
        renderStats(document.querySelector('.studio--home .studio-stats'));

        const s = data.settings || {};
        if (s.about_text) {
            const p = document.querySelector('.studio--home .studio-text p');
            if (p) p.innerHTML = nl2br(s.about_text);
        }
    }

    // ── PROJECTS PAGE ──────────────────────────────────────────────────────────

    function renderProjects() {
        fillGrid(document.querySelector('.projects-grid'), publishedProjects(), false);
    }

    // ── ABOUT PAGE ─────────────────────────────────────────────────────────────

    function renderAbout() {
        renderStats(document.querySelector('.studio-stats'));
        renderAwards();
        renderTeam();
    }

    // ── STATS (shared: index + about) ──────────────────────────────────────────

    function renderStats(el) {
        const s = data.settings || {};
        const stats = [s.stat_1, s.stat_2, s.stat_3, s.stat_4].filter(Boolean);
        if (!el || !stats.length) return;
        el.innerHTML = stats.map(function (text) {
            return '<div class="stat-item eyebrow">' +
                       '<div class="ico-outline"></div>' +
                       '<span>' + esc(text) + '</span>' +
                   '</div>';
        }).join('');
    }

    // ── TESTIMONIAL ────────────────────────────────────────────────────────────

    function renderTestimonial() {
        const t = (data.testimonials || []).find(function (x) { return x.active; });
        if (!t) return;
        const section = document.querySelector('.testimonial');
        if (!section) return;

        var imgLg = section.querySelector('.test-img-lg img');
        var imgSm = section.querySelector('.test-img-sm img');
        if (imgLg && t.image_large) { imgLg.src = t.image_large; imgLg.alt = t.project_title || ''; }
        if (imgSm && t.image_small) { imgSm.src = t.image_small; imgSm.alt = ''; }

        var h3 = section.querySelector('.test-header h3');
        if (h3 && t.project_title) h3.textContent = t.project_title;

        section.querySelectorAll('.test-link-desktop, .test-link-mobile').forEach(function (a) {
            if (t.project_url) a.href = t.project_url;
        });

        var quoteEl = section.querySelector('.test-quote p:not(.test-author)');
        if (quoteEl && t.quote) quoteEl.innerHTML = nl2br(t.quote);

        var authorEl = section.querySelector('.test-author');
        if (authorEl && t.author) authorEl.textContent = t.author;

        var metaContainer = section.querySelector('.test-meta');
        if (metaContainer) {
            var rows = [
                ['ออกแบบโดย', t.meta_design],
                ['ช่างภาพ',   t.meta_photography],
                ['สถานที่',   t.meta_location],
                ['ร่วมกับ',   t.meta_collaboration],
            ].filter(function (r) { return r[1]; });
            metaContainer.innerHTML = rows.map(function (r) {
                return '<div class="meta-row">' +
                    '<span class="meta-label">' + esc(r[0]) + '</span>' +
                    '<span class="meta-val">'   + esc(r[1]) + '</span>' +
                '</div>';
            }).join('');
        }
    }

    // ── AWARDS ─────────────────────────────────────────────────────────────────

    function renderAwards() {
        var awards = data.awards || [];
        if (!awards.length) return;
        var table = document.querySelector('.awards-table');
        if (!table) return;

        var header = table.querySelector('.award-row.header');
        table.innerHTML = '';
        if (header) table.appendChild(header);

        var lastYear = null;
        awards.forEach(function (a) {
            var sameYear = a.year && a.year === lastYear;
            var row = document.createElement('div');
            row.className = 'award-row';
            row.innerHTML =
                '<div class="' + (sameYear ? 'aw-year-empty' : 'aw-year') + '">' +
                    (sameYear ? '' : esc(String(a.year || ''))) +
                '</div>' +
                '<div class="aw-name">' + esc(a.title || '') + '</div>' +
                '<div class="aw-cat">'  + esc(a.category || '') + '</div>' +
                '<div class="aw-project">' +
                    (a.project_url
                        ? '<a href="' + esc(a.project_url) + '">' + esc(a.project_name || '') + '</a>' +
                          '<img src="/assets/icon/ui/arrow/default.svg" alt="">'
                        : esc(a.project_name || '')) +
                '</div>' +
                '<div class="aw-loc">' + esc(a.location || '') + '</div>';
            if (a.year) lastYear = a.year;
            table.appendChild(row);
        });
    }

    // ── TEAM ───────────────────────────────────────────────────────────────────

    function renderTeam() {
        var members = data.team || [];
        if (!members.length) return;
        var section = document.querySelector('.team');
        if (!section) return;

        section.querySelectorAll('.member-row').forEach(function (r) { r.remove(); });

        var chunkSize = 6;
        for (var i = 0; i < members.length; i += chunkSize) {
            var chunk = members.slice(i, i + chunkSize);
            var row = document.createElement('div');
            row.className = 'member-row';
            chunk.forEach(function (m) {
                row.innerHTML +=
                    '<div class="member-card">' +
                        '<div class="member-photo">' +
                            '<img src="' + esc(m.photo || '') + '" alt="' + esc(m.name || '') + '" loading="lazy">' +
                        '</div>' +
                        '<p class="member-name">'  + esc(m.name || '')  + '</p>' +
                        '<p class="member-title">' + esc(m.role || '')  + '</p>' +
                    '</div>';
            });
            section.appendChild(row);
        }
    }

    // ── PROJECT DETAIL PAGE ────────────────────────────────────────────────────

    function renderDetail() {
        var slug    = new URLSearchParams(location.search).get('slug');
        if (!slug) return;
        var project = (data.projects || []).find(function (p) { return p.slug === slug; });
        if (!project) return;

        document.title = project.title + ' — Eco Architect Co.,Ltd.';

        // Hero image + title
        var top   = document.querySelector('.project-top');
        if (top) {
            var img = top.querySelector('.project-hero-img img');
            if (img && project.main_image) { img.src = project.main_image; img.alt = project.title; }
            var h1 = top.querySelector('h1');
            if (h1) h1.textContent = project.title || '';
        }

        // Description
        var desc = document.querySelector('.proj-desc p');
        if (desc && project.description) desc.innerHTML = nl2br(project.description);

        // Spec rows
        var specs = document.querySelector('.proj-specs');
        if (specs) {
            var specData = [
                ['Design',        project.design],
                ['Photography',   project.photography],
                ['Location',      project.location],
                ['Collaboration', project.collaboration],
                ['Year',          project.year],
                ['Type',          project.type],
            ];
            specs.innerHTML = specData
                .filter(function (r) { return r[1]; })
                .map(function (r) {
                    return '<div class="spec-row">' +
                        '<span class="spec-label">' + esc(r[0]) + '</span>' +
                        '<span class="spec-val">'   + esc(String(r[1])) + '</span>' +
                    '</div>';
                }).join('');
        }

        // Gallery
        var gallery = document.querySelector('.gallery');
        if (gallery && project.gallery && project.gallery.length) {
            gallery.innerHTML = '';
            project.gallery.forEach(function (src, idx) {
                var div = document.createElement('div');
                div.className = 'gallery__item';
                // Default orientation by position (matches existing CSS nth-child pattern)
                div.setAttribute('data-orientation', idx % 3 === 0 ? 'landscape' : 'portrait');
                var img = document.createElement('img');
                img.src     = src;
                img.alt     = project.title || '';
                img.loading = 'lazy';
                // Correct orientation once image loads
                img.addEventListener('load', function () {
                    div.setAttribute('data-orientation',
                        img.naturalHeight > img.naturalWidth ? 'portrait' : 'landscape');
                }, { once: true });
                div.appendChild(img);
                gallery.appendChild(div);
            });
        }
    }

    // ── CONTACT PAGE ───────────────────────────────────────────────────────────

    function renderContactPage() {
        var s = data.settings || {};
        var vals = document.querySelectorAll('.contact-info-val');
        var fields = [s.address, s.email, s.phone].filter(Boolean);
        vals.forEach(function (el, i) {
            if (fields[i]) el.innerHTML = nl2br(fields[i]);
        });
    }

    // ── FOOTER (every page) ────────────────────────────────────────────────────

    function renderFooter() {
        var s = data.settings || {};
        var fc = document.querySelector('.f-contact');
        if (fc) {
            var email = fc.querySelector('a.val:first-of-type');
            var phone = fc.querySelector('a.val:last-of-type');
            var addr  = fc.querySelector('a.loc-val');
            if (email && s.email)   email.textContent = s.email;
            if (phone && s.phone)   phone.textContent = s.phone;
            if (addr  && s.address) addr.textContent  = s.address;
        }
        // Social links
        if (s.instagram_url) {
            var ig = document.querySelector('.f-social a[href*="instagram"]');
            if (ig) ig.href = s.instagram_url;
        }
        if (s.facebook_url) {
            var fb = document.querySelector('.f-social a[href*="facebook"]');
            if (fb) fb.href = s.facebook_url;
        }
    }
})();
