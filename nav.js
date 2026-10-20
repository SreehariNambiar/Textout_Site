/* ============================================================
   Textout:) — Navigation bar (MARKUP)
   ============================================================ */
(function () {
  'use strict';

  var raw  = window.location.pathname.replace(/\/index\.html$/, '');
  var path = raw.replace(/\/+$/, '') || '/';
  var isHome = (path === '/');

  var active =
    path === '/'                    ? 'home'     :
    /^\/features(\/|$)/.test(path)  ? 'features' :
    /^\/events(\/|$)/.test(path)    ? 'events'   :
    /^\/access(\/|$)/.test(path)    ? 'access'   :
    /^\/support(\/|$)/.test(path)   ? 'support'  :
    /^\/privacy(\/|$)/.test(path)   ? 'privacy'  : '';

  var homeHref = isHome ? '#home'     : '/#home';
  var featHref = isHome ? '#features' : '/#features';

  /* Line icons for the mobile menu (24x24, stroke = currentColor) */
  var ICONS = {
    home:     '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1v-9"/>',
    features: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    events:   '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    early:    '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    support:  '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 1.9"/><path d="M12 17h.01"/>',
    privacy:  '<path d="M12 3 5 6v5.5c0 4.4 2.9 7.6 7 9.5 4.1-1.9 7-5.1 7-9.5V6z"/><path d="m9.5 12 2 2 3.5-4"/>'
  };

  function icon(name) {
    if (!name || !ICONS[name]) return '';
    return '<span class="nav-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      ICONS[name] + '</svg></span>';
  }

  function a(href, label, opts) {
    opts = opts || {};
    var cls = [];
    if (opts.early)  cls.push('nav-early');
    if (opts.cta)    cls.push('nav-cta-mobile');
    if (opts.active) cls.push('active');
    var attr = '';
    if (cls.length)  attr += ' class="' + cls.join(' ') + '"';
    if (opts.active) attr += ' aria-current="page"';
    return '<a href="' + href + '"' + attr + '>' +
      icon(opts.icon) + '<span class="nav-label">' + label + '</span></a>';
  }

  var HEADER =
    '<header class="nav" id="nav">' +
      '<div class="wrap nav-inner">' +
        '<a class="brand" href="/">' +
          '<img class="brand-owl" src="/assets/owl.png" alt="">' +
          '<img class="brand-logo" src="/assets/logo.png" alt="Textout:)">' +
        '</a>' +
        '<nav class="nav-links" id="navLinks">' +
          a(homeHref, 'Home',     { active: active === 'home', icon: 'home' }) +
          a(featHref, 'Features', { active: active === 'features', icon: 'features' }) +
          a('/events', 'Events',  { active: active === 'events', icon: 'events' }) +
          a('/access',  'Early access', { early: true, active: active === 'access', icon: 'early' }) +
          a('/support', 'Support',      { active: active === 'support', icon: 'support' }) +
          a('/privacy', 'Privacy',      { active: active === 'privacy', icon: 'privacy' }) +
          a('/access',  'Get the app',  { cta: true }) +
        '</nav>' +
        '<a class="btn btn-primary btn-sm" href="/access">Get the app</a>' +
        '<button class="nav-toggle" id="navToggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</header>';

  var FLOAT =
    '<a class="early-float" id="earlyFloat" href="/access" aria-label="Early access" aria-hidden="true">' +
      '<span class="early-float__dot" aria-hidden="true"></span>' +
      '<span class="early-float__text">Early access</span>' +
      '<span class="early-float__arrow" aria-hidden="true">→</span>' +
    '</a>';

  function inject() {
    var slot = document.querySelector('[data-navbar]');
    if (slot) slot.outerHTML = HEADER;
    else if (document.body) document.body.insertAdjacentHTML('afterbegin', HEADER);

    if (document.body) document.body.insertAdjacentHTML('beforeend', FLOAT);
  }

  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();