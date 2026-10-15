/* ============================================================
   Textout:) — Navigation bar (MARKUP)
   ------------------------------------------------------------
   Injects the site-wide <header class="nav"> and the floating
   "Early access" tab into every page.
   Load BEFORE script.js on every page:

       <link rel="stylesheet" href="/nav.css">
       <script src="/nav.js" defer></script>
       <script src="/script.js" defer></script>

   - Active link is chosen from the current URL.
   - Home page uses in-page anchors (#home / #features).
     Every other page links back to the root (/#home, /#features).
   - The floating early-access tab is shown/hidden by script.js.

   To change LINKS or markup → edit the HTML strings below.
   To change how the nav LOOKS → edit /nav.css.
   ============================================================ */
(function () {
  'use strict';

  var raw  = window.location.pathname.replace(/\/index\.html$/, '');
  var path = raw.replace(/\/+$/, '') || '/';
  var isHome = (path === '/');

  var active =
    path === '/'                    ? 'home'     :
    /^\/features(\/|$)/.test(path)  ? 'features' :
    /^\/access(\/|$)/.test(path)    ? 'access'   :
    /^\/support(\/|$)/.test(path)   ? 'support'  :
    /^\/privacy(\/|$)/.test(path)   ? 'privacy'  : '';

  var homeHref = isHome ? '#home'     : '/#home';
  var featHref = isHome ? '#features' : '/#features';

  function a(href, label, opts) {
    opts = opts || {};
    var cls = [];
    if (opts.early)  cls.push('nav-early');
    if (opts.active) cls.push('active');
    var attr = '';
    if (cls.length)  attr += ' class="' + cls.join(' ') + '"';
    if (opts.active) attr += ' aria-current="page"';
    return '<a href="' + href + '"' + attr + '>' + label + '</a>';
  }

  var HEADER =
    '<header class="nav" id="nav">' +
      '<div class="wrap nav-inner">' +
        '<a class="brand" href="/">' +
          '<img class="brand-owl" src="/assets/owl.png" alt="">' +
          '<img class="brand-logo" src="/assets/logo.png" alt="Textout:)">' +
        '</a>' +
        '<nav class="nav-links" id="navLinks">' +
          a(homeHref, 'Home',     { active: active === 'home' }) +
          a(featHref, 'Features', { active: active === 'features' }) +
          a('/access',  'Early access', { early: true, active: active === 'access' }) +
          a('/support', 'Support',      { active: active === 'support' }) +
          a('/privacy', 'Privacy',      { active: active === 'privacy' }) +
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