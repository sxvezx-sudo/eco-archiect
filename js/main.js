/* Portfolio CTA + testimonial link variant switcher (index.html only).
   Existence checks make this safe to include on all pages. */
function applyVariant() {
    var mobile = window.innerWidth <= 768;
    var ctaBrand   = document.querySelector('.portfolio-cta-brand');
    var ctaDesktop = document.querySelector('.portfolio-cta-desktop');
    var testMobile = document.querySelector('.test-link-mobile');
    var testDesktop= document.querySelector('.test-link-desktop');
    if (ctaBrand)    ctaBrand.style.display    = mobile ? 'inline-flex' : 'none';
    if (ctaDesktop)  ctaDesktop.style.display  = mobile ? 'none'        : 'inline-flex';
    if (testMobile)  testMobile.style.display  = mobile ? 'inline-flex' : 'none';
    if (testDesktop) testDesktop.style.display = mobile ? 'none'        : 'inline-flex';
}

if (document.querySelector('.portfolio-cta-brand')) {
    applyVariant();
    window.addEventListener('resize', applyVariant);
}

// Gallery image injection (project-detail.html)
document.querySelectorAll('.gallery__item[data-src]').forEach(function(item) {
    var img = document.createElement('img');
    img.src = item.dataset.src;
    img.alt = '';
    item.appendChild(img);
});
