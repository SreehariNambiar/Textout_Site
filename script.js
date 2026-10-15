/* ============================================================
   Textout:) — landing interactions
   ============================================================ */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav shadow on scroll ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScroll();

  /* ---------- Auto-tag for reveal via [data-stagger] ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (parent) {
    var step = parseFloat(parent.getAttribute('data-stagger')) || 0.08;
    Array.prototype.forEach.call(parent.children, function (child, i) {
      child.classList.add('reveal');
      child.style.setProperty('--d', (i * step) + 's');
    });
  });

  /* ---------- Intersection observer for reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal, .trio').forEach(function (el) {
    io.observe(el);
  });

  /* ---------- Trio fan-out on load ---------- */
  window.addEventListener('load', function () {
    document.querySelectorAll('.hero .trio').forEach(function (t) {
      setTimeout(function () { t.classList.add('in'); }, 250);
    });
  });

  /* ============================================================
     KINETIC RIBBON — clone the row so the loop is seamless
     ============================================================ */
  function initRibbon() {
    var row = document.querySelector('.ribbon-row');
    if (!row) return;
    var track = row.parentElement;
    if (!track) return;

    var rowWidth = row.offsetWidth;
    if (!rowWidth) return;

    var minTrackWidth = window.innerWidth * 2;
    var copies = Math.max(2, Math.ceil(minTrackWidth / rowWidth) * 2);

    for (var i = 1; i < copies; i++) {
      var clone = row.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }

    var uniqueWidth = rowWidth * (copies / 2);
    track.style.animationDuration = (uniqueWidth / 55).toFixed(1) + 's';
  }

  if (document.readyState === 'complete') {
    initRibbon();
  } else {
    window.addEventListener('load', initRibbon);
  }

  /* ---------- Parallax on phone columns ---------- */
  var cols = document.querySelectorAll('.phone-col');
  var ticking = false;

  function parallax() {
    var vh = window.innerHeight;
    cols.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var off = (r.top + r.height / 2 - vh / 2) / vh;
      var clamped = Math.max(-1, Math.min(1, off));
      c.style.setProperty('--py', (clamped * -22) + 'px');
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    onScroll();
    if (!reduce && !ticking) {
      ticking = true;
      requestAnimationFrame(parallax);
    }
  }, { passive: true });

  if (!reduce) parallax();

  /* ============================================================
     HERO — randomize floating chatter positions
     ============================================================ */
  (function randomizeFloatingChatters() {
    var stage = document.querySelector('.hero-visual');
    if (!stage) return;
    var cards = Array.prototype.slice.call(stage.querySelectorAll('.float-chatter'));
    if (cards.length === 0) return;

    var WIDE   = [ { top: '0%', left: '-16%' }, { top: '6%', right: '-18%' } ];
    var NARROW = [ { top: '0%', left: '0%'   }, { top: '6%', right: '0%'   } ];
    var TURN = 6;
    var narrowMq = window.matchMedia('(max-width: 980px)');

    function place() {
      var slots = narrowMq.matches ? NARROW : WIDE;
      cards.forEach(function (card, idx) {
        var z = slots[idx % slots.length];
        card.style.top    = z.top    || 'auto';
        card.style.bottom = z.bottom || 'auto';
        card.style.left   = z.left   || 'auto';
        card.style.right  = z.right  || 'auto';
      });
    }

    cards.forEach(function (card, idx) {
      var side = idx % 2;
      var turn = Math.floor(idx / 2);
      card.classList.add(side === 0 ? 'is-left' : 'is-right');

      if (reduce) {
        if (turn > 0) { card.style.display = 'none'; return; }
        card.style.opacity = '1';
        card.classList.add('is-in');
        return;
      }

      card.style.setProperty('--d', (turn * TURN + side * (TURN / 2)) + 's');
      card.classList.add('is-in');
    });

    place();
    if (narrowMq.addEventListener) narrowMq.addEventListener('change', place);
    else if (narrowMq.addListener) narrowMq.addListener(place);
  })();

  /* ============================================================
     FLOATING CHATTERS — scale down with the column on small screens
     ============================================================ */
  (function scaleFloatingChatters() {
    var stages = Array.prototype.slice.call(document.querySelectorAll('.hero-visual, .resonance-stage'));
    if (!stages.length) return;
    var DESIGN_W = 540;

    function fit(el) {
      var s = Math.max(0.46, Math.min(1, el.clientWidth / DESIGN_W));
      el.style.setProperty('--fs', s.toFixed(3));
    }
    stages.forEach(fit);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { fit(e.target); }); });
      stages.forEach(function (el) { ro.observe(el); });
    } else {
      window.addEventListener('resize', function () { stages.forEach(fit); });
    }
  })();

  /* ============================================================
     NAV — mobile menu
     ============================================================ */
  (function () {
    var navEl = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    if (!navEl || !toggle) return;

    function setOpen(open) {
      navEl.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    }
    toggle.addEventListener('click', function () { setOpen(!navEl.classList.contains('open')); });
    navEl.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('click', function (e) {
      if (!navEl.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  })();

  /* ============================================================
     NAV ACTIVE-STATE
     ============================================================ */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a')
  );

  var sectionLinks = navLinks.filter(function (a) {
    var href = a.getAttribute('href') || '';
    return href.charAt(0) === '#' && href.length > 1;
  });

  function setActive(link) {
    navLinks.forEach(function (a) { a.classList.remove('active'); });
    if (link) link.classList.add('active');
  }

  sectionLinks.forEach(function (a) {
    a.addEventListener('click', function () { setActive(a); });
  });

  var homeLink = document.querySelector('.nav-links a[href="#home"]');
  if (homeLink) {
    homeLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  }

  if (sectionLinks.length && 'IntersectionObserver' in window) {
    var spyMap = new Map();
    sectionLinks.forEach(function (a) {
      var id = (a.getAttribute('href') || '').slice(1);
      var el = document.getElementById(id);
      if (el) spyMap.set(el, a);
    });

    var visible = new Set();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });

      var chosen = null;
      var chosenTop = Infinity;
      visible.forEach(function (el) {
        var top = el.getBoundingClientRect().top;
        if (top < chosenTop) { chosenTop = top; chosen = el; }
      });
      if (chosen) setActive(spyMap.get(chosen));
    }, {
      threshold: 0,
      rootMargin: '-30% 0px -55% 0px'
    });

    spyMap.forEach(function (_link, el) { spy.observe(el); });
  }

  if (location.hash) {
    var initial = sectionLinks.filter(function (a) {
      return a.getAttribute('href') === location.hash;
    })[0];
    if (initial) setActive(initial);
  }

  /* ============================================================
     FLOATING EARLY-ACCESS TAB
     Shows the sticky right-edge tab when no .early-cta is on
     screen AND the user has scrolled past the hero. Hides it
     again when the hero or closing button scrolls into view.
     Only activates on pages that contain an .early-cta.
     ============================================================ */
  (function floatingEarlyAccess() {
    var floatEl = document.getElementById('earlyFloat');
    if (!floatEl) return;

    var sources = document.querySelectorAll('.early-cta');
    if (!sources.length) {
      // Page has no early-access source button — hide the tab entirely.
      floatEl.remove();
      return;
    }

    var visibleSources = new Set();
    var SCROLL_THRESHOLD = 200;

    function apply() {
      var scrolled = window.scrollY > SCROLL_THRESHOLD;
      var noneVisible = visibleSources.size === 0;
      var show = scrolled && noneVisible;

      floatEl.classList.toggle('is-visible', show);
      floatEl.setAttribute('aria-hidden', show ? 'false' : 'true');
      // Remove from tab order when hidden so keyboard users skip it.
      if (show) floatEl.removeAttribute('tabindex');
      else floatEl.setAttribute('tabindex', '-1');
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) visibleSources.add(e.target);
          else visibleSources.delete(e.target);
        });
        apply();
      }, { threshold: 0.4 });
      sources.forEach(function (el) { obs.observe(el); });
    }

    window.addEventListener('scroll', apply, { passive: true });
    window.addEventListener('resize', apply);
    apply();
  })();

  /* ============================================================
     LIVE CHATTER DEMO — cycler
     ============================================================ */
  var svgUrl = function (svg) {
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  };

  var CONFETTI_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>
    <rect width='400' height='300' fill='%23e0d0f5'/>
    <circle cx='40'  cy='40'  r='8' fill='%23ff3d71'/>
    <circle cx='120' cy='70'  r='6' fill='%23ffd93d'/>
    <circle cx='200' cy='30'  r='9' fill='%23a78bfa'/>
    <circle cx='280' cy='80'  r='7' fill='%234ade80'/>
    <circle cx='350' cy='50'  r='8' fill='%23fb923c'/>
    <circle cx='70'  cy='140' r='7' fill='%23f472b6'/>
    <circle cx='160' cy='180' r='6' fill='%23facc15'/>
    <circle cx='250' cy='150' r='9' fill='%23c084fc'/>
    <circle cx='330' cy='200' r='8' fill='%2386efac'/>
    <circle cx='60'  cy='250' r='7' fill='%23fb7185'/>
    <circle cx='180' cy='260' r='9' fill='%23fbbf24'/>
    <circle cx='300' cy='270' r='6' fill='%23a78bfa'/>
    <rect x='90'  y='100' width='12' height='12' fill='%23f472b6' transform='rotate(30 96 106)'/>
    <rect x='220' y='110' width='10' height='10' fill='%23facc15' transform='rotate(-20 225 115)'/>
    <rect x='140' y='220' width='11' height='11' fill='%234ade80' transform='rotate(45 145 225)'/>
  </svg>`;

  var GRAFFITI_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'>
    <rect width='400' height='300' fill='%23002b4d'/>
    <path d='M-20 200 Q100 100 200 180 T420 120' stroke='%23ff3d71' stroke-width='28' fill='none' opacity='.75' stroke-linecap='round'/>
    <path d='M-20 250 Q150 150 250 220 T420 180' stroke='%23ffd93d' stroke-width='22' fill='none' opacity='.7'  stroke-linecap='round'/>
    <path d='M20 50  Q120 150 220 80  T420 60'  stroke='%23a78bfa' stroke-width='20' fill='none' opacity='.75' stroke-linecap='round'/>
    <path d='M50 130 Q150 50  300 150'         stroke='%234ade80' stroke-width='18' fill='none' opacity='.65' stroke-linecap='round'/>
    <circle cx='100' cy='100' r='20' fill='%23fb923c' opacity='.55'/>
    <circle cx='320' cy='220' r='28' fill='%23f472b6' opacity='.55'/>
  </svg>`;

  var FIREWORKS_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'>
    <rect width='400' height='300' fill='%230d0a1f'/>
    <g stroke='%23ff3d71' stroke-width='2' fill='none' opacity='.9' stroke-linecap='round'>
      <line x1='100' y1='80' x2='100' y2='30'/>
      <line x1='100' y1='80' x2='140' y2='50'/>
      <line x1='100' y1='80' x2='60'  y2='50'/>
      <line x1='100' y1='80' x2='140' y2='110'/>
      <line x1='100' y1='80' x2='60'  y2='110'/>
    </g>
    <g stroke='%23ffd93d' stroke-width='2' fill='none' opacity='.9' stroke-linecap='round'>
      <line x1='300' y1='140' x2='300' y2='90'/>
      <line x1='300' y1='140' x2='340' y2='110'/>
      <line x1='300' y1='140' x2='260' y2='110'/>
      <line x1='300' y1='140' x2='340' y2='170'/>
      <line x1='300' y1='140' x2='260' y2='170'/>
    </g>
    <g stroke='%23a78bfa' stroke-width='2' fill='none' opacity='.9' stroke-linecap='round'>
      <line x1='200' y1='220' x2='200' y2='170'/>
      <line x1='200' y1='220' x2='240' y2='190'/>
      <line x1='200' y1='220' x2='160' y2='190'/>
      <line x1='200' y1='220' x2='240' y2='250'/>
      <line x1='200' y1='220' x2='160' y2='250'/>
    </g>
  </svg>`;

  (function initDemoCycler() {
    var demo = document.getElementById('demoChatter');
    if (!demo) return;

    var avatar   = document.getElementById('demoAvatar');
    var username = document.getElementById('demoUsername');
    var audience = document.getElementById('demoAudience');
    var message  = document.getElementById('demoMessage');
    var likeEl   = document.getElementById('demoLikeCount');
    var resoEl   = document.getElementById('demoResoCount');
    var shortEl  = document.getElementById('demoShorttime');
    var stampEl  = document.getElementById('demoStamp');
    var mediaEl  = document.getElementById('demoMedia');
    var mediaImg = document.getElementById('demoMediaImg');
    var stageEl  = demo.parentElement;

    if (!avatar || !username || !audience || !message) return;

    var states = [
      {
        bg: '#1c1c1e', fg: '#ffffff',
        border: 'rgba(255,255,255,.5)', glow: 'transparent',
        img: null, imgOpacity: 0,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'A', a1: '#ffb347', a2: '#ff6a00',
        username: '@aarav',
        audience: 'everyone',
        message: `Sunset at the pier was <b class="tag">#unreal</b> today.`,
        likes: 24, reso: 6,
        short: '2m', stamp: 'Oct 12, 2026 at 2:42 PM',
      },
      {
        bg: '#3a2a12', fg: '#ffb347',
        border: 'rgba(255,179,71,.65)', glow: 'rgba(255,179,71,.55)',
        img: null, imgOpacity: 0,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'R', a1: '#ff6b8a', a2: '#ff2d55',
        username: '@rhea',
        audience: 'everyone',
        message: `Golden hour at the Taj Mahal. Worth the 5am alarm. <b class="tag">#tajmahal</b>`,
        media: { src: '/assets/chatter-taj-mahal.jpg', alt: 'The Taj Mahal glowing at sunset', pos: '50% 35%' },
        likes: 63, reso: 15,
        short: '4m', stamp: 'Oct 12, 2026 at 2:38 PM',
      },
      {
        bg: '#f6e6d8', fg: '#ff4d79',
        border: 'rgba(255,77,121,.65)', glow: 'rgba(255,77,121,.55)',
        img: 'url("/assets/chatter-birthday.png")',
        imgOpacity: 1,
        imgSize: 'contain', imgPos: 'center',
        scrim: '#fff5e6', scrimOpacity: 0.30,
        avatar: 'R', a1: '#ff6b8a', a2: '#ff2d55',
        username: '@rhea',
        audience: 'friends',
        message: `Happy birthday, Maya! 🎂🎈 Hope your day is as bright as you are.`,
        likes: 87, reso: 24,
        short: '5m', stamp: 'Oct 12, 2026 at 2:37 PM',
      },
      {
        bg: '#5a2fa8', fg: '#c8a2c8',
        border: 'rgba(255,255,255,.6)', glow: 'rgba(200,162,200,.65)',
        img: svgUrl(CONFETTI_SVG),
        imgOpacity: 0.65,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'M', a1: '#c8a2c8', a2: '#7048a8',
        username: '@meera',
        audience: 'everyone',
        message: `Happy 10th anniversary to my parents. 💕 Ten years and still going strong.`,
        likes: 156, reso: 42,
        short: '18m', stamp: 'Oct 12, 2026 at 2:24 PM',
      },
      {
        bg: '#7048a8', fg: '#ffe27a',
        border: 'rgba(255,226,122,.65)', glow: 'rgba(255,226,122,.5)',
        img: null, imgOpacity: 0,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'A', a1: '#ffffff', a2: '#ffd9c2',
        username: '@arjun',
        audience: 'friends',
        message: `Evening walk at the Red Fort. Every wall has a story. <b class="tag">#redfort</b>`,
        media: { src: '/assets/chatter-red-fort.jpg', alt: 'Visitors walking along the red sandstone walls of the Red Fort', pos: '50% 45%' },
        likes: 41, reso: 12,
        short: '11m', stamp: 'Oct 12, 2026 at 2:31 PM',
      },
      {
        bg: '#0d3b66', fg: '#00bbff',
        border: 'rgba(95,212,255,.65)', glow: 'rgba(0,187,255,.65)',
        img: svgUrl(GRAFFITI_SVG),
        imgOpacity: 0.65,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'K', a1: '#00c2a8', a2: '#0080ff',
        username: '@kabir',
        audience: 'Sunrise Runners',
        message: `Anyone up for a 7am run? <b class="mention">@zoya</b> <b class="tag">#juhu</b>`,
        likes: 12, reso: 4,
        short: '26m', stamp: 'Oct 12, 2026 at 2:16 PM',
      },
      {
        bg: '#4a1a0a', fg: '#ff7a1a',
        border: 'rgba(255,180,100,.65)', glow: 'rgba(255,122,26,.7)',
        img: null, imgOpacity: 0,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'N', a1: '#ffd93d', a2: '#ff7a1a',
        username: '@nisha',
        audience: 'everyone',
        message: `Rangoli done, diyas lit. Happy Diwali, everyone! 🪔 <b class="tag">#diwali</b>`,
        media: { src: '/assets/chatter-diwali.jpg', alt: 'A colourful Diwali rangoli surrounded by lit diyas', pos: '50% 50%' },
        likes: 98, reso: 27,
        short: '19m', stamp: 'Oct 12, 2026 at 2:23 PM',
      },
      {
        bg: '#4a1a0a', fg: '#ff7a1a',
        border: 'rgba(255,180,100,.65)', glow: 'rgba(255,122,26,.7)',
        img: svgUrl(FIREWORKS_SVG),
        imgOpacity: 0.65,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'Z', a1: '#ff5c8a', a2: '#ff2d55',
        username: '@zoya',
        audience: 'Rooftop Movie Night',
        message: `Bringing the projector. Rooftop at 7 — see you all there.`,
        likes: 33, reso: 9,
        short: '1h', stamp: 'Oct 12, 2026 at 1:35 PM',
      },
      {
        bg: '#00596b', fg: '#00bbff',
        border: 'rgba(95,212,255,.55)', glow: 'rgba(0,187,255,.5)',
        img: null, imgOpacity: 0,
        imgSize: 'cover', imgPos: 'center',
        scrim: '#000000', scrimOpacity: 0,
        avatar: 'L', a1: '#00c2a8', a2: '#0057ff',
        username: '@leo',
        audience: 'Kochi Photographers',
        message: `Golden hour at the harbour was unreal. <b class="tag">#kochi</b>`,
        likes: 56, reso: 18,
        short: '2h', stamp: 'Oct 12, 2026 at 12:30 PM',
      },
    ];

    var mode = 'text';
    var pool = states.filter(function (st) { return !st.media; });
    var i = 0;
    var first = true;
    var timer = null;

    function tallestCardHeight() {
      var clone = demo.cloneNode(true);
      clone.removeAttribute('id');
      Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function (el) { el.removeAttribute('id'); });
      clone.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;transition:none;width:' + demo.offsetWidth + 'px;';
      stageEl.appendChild(clone);
      var msg = clone.querySelector('.demo-chatter__body p');
      var med = clone.querySelector('.demo-chatter__media');
      var max = 0;
      pool.forEach(function (st) {
        if (msg) msg.innerHTML = st.message;
        if (med) med.hidden = !st.media;
        max = Math.max(max, clone.offsetHeight);
      });
      stageEl.removeChild(clone);
      return max;
    }

    function syncStageHeight() {
      if (!stageEl) return;
      var h = tallestCardHeight();
      stageEl.style.height = (h + 24) + 'px';
    }

    function applyState() {
      var s = pool[i];

      demo.style.setProperty('--demo-bg', s.bg);
      demo.style.setProperty('--demo-fg', s.fg);
      demo.style.setProperty('--demo-border', s.border);
      demo.style.setProperty('--demo-glow', s.glow);
      demo.classList.toggle('is-custom', s.glow !== 'transparent');

      demo.style.setProperty('--demo-bg-size', s.imgSize || 'cover');
      demo.style.setProperty('--demo-bg-pos',  s.imgPos  || 'center');

      var nextImg = s.img || 'none';
      if (first) {
        demo.style.setProperty('--demo-bg-img', nextImg);
        demo.style.setProperty('--demo-bg-img-opacity', String(s.imgOpacity || 0));
        demo.style.setProperty('--demo-scrim', s.scrim || '#000000');
        demo.style.setProperty('--demo-scrim-opacity', String(s.scrimOpacity || 0));
      } else {
        demo.style.setProperty('--demo-bg-img-opacity', '0');
        demo.style.setProperty('--demo-scrim-opacity', '0');
        setTimeout(function () {
          demo.style.setProperty('--demo-bg-img', nextImg);
          demo.style.setProperty('--demo-bg-img-opacity', String(s.imgOpacity || 0));
          demo.style.setProperty('--demo-scrim', s.scrim || '#000000');
          demo.style.setProperty('--demo-scrim-opacity', String(s.scrimOpacity || 0));
        }, 400);
      }
      first = false;

      avatar.textContent = s.avatar;
      avatar.style.setProperty('--a1', s.a1);
      avatar.style.setProperty('--a2', s.a2);

      username.textContent = s.username;
      audience.textContent = s.audience;
      message.innerHTML = s.message;

      if (likeEl)  likeEl.textContent  = s.likes;
      if (resoEl)  resoEl.textContent  = s.reso;
      if (shortEl) shortEl.textContent = s.short;
      if (stampEl) stampEl.textContent = s.stamp;

      if (mediaEl && mediaImg) {
        if (s.media) {
          mediaImg.src = s.media.src;
          mediaImg.alt = s.media.alt || '';
          mediaImg.style.objectPosition = s.media.pos || '50% 40%';
          mediaEl.hidden = false;
        } else {
          mediaEl.hidden = true;
        }
      }

      i = (i + 1) % pool.length;
    }

    applyState();

    syncStageHeight();
    window.addEventListener('resize', syncStageHeight);
    window.addEventListener('load', syncStageHeight);

    function startTimer() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(applyState, 5000);
    }
    startTimer();

    var toggleBtns = document.querySelectorAll('.demo-toggle__btn');
    Array.prototype.forEach.call(toggleBtns, function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-mode');
        if (next === mode) return;
        mode = next;
        pool = states.filter(function (st) { return mode === 'photo' ? !!st.media : !st.media; });
        i = 0;
        Array.prototype.forEach.call(toggleBtns, function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        applyState();
        syncStageHeight();
        startTimer();
      });
    });
  })();

  /* ============================================================
     LIVE CHATTER DEMO — options menu
     ============================================================ */
  (function initDemoMenu() {
    var more = document.getElementById('demoMore');
    var menu = document.getElementById('demoMenu');
    if (!more || !menu) return;

    function open()  { menu.hidden = false; more.setAttribute('aria-expanded', 'true'); }
    function close() { menu.hidden = true;  more.setAttribute('aria-expanded', 'false'); }
    function toggle() { if (menu.hidden) open(); else close(); }

    more.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener('click', function (e) {
      if (menu.hidden) return;
      if (menu.contains(e.target) || more.contains(e.target)) return;
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) close();
    });

    menu.querySelectorAll('button[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        close();
      });
    });
  })();

  /* ============================================================
     LIVE CHATTER DEMO — touch tooltips
     ============================================================ */
  (function initTouchTips() {
    if (!('ontouchstart' in window)) return;

    var tips = document.querySelectorAll('[data-tip]');
    tips.forEach(function (el) {
      el.addEventListener('touchstart', function () {
        document.querySelectorAll('[data-tip].tip-active').forEach(function (x) {
          x.classList.remove('tip-active');
        });
        el.classList.add('tip-active');
      }, { passive: true });

      el.addEventListener('touchend', function () {
        setTimeout(function () { el.classList.remove('tip-active'); }, 1200);
      }, { passive: true });

      el.addEventListener('touchcancel', function () {
        el.classList.remove('tip-active');
      }, { passive: true });
    });

    document.addEventListener('touchstart', function (e) {
      if (e.target.closest('[data-tip]')) return;
      document.querySelectorAll('[data-tip].tip-active').forEach(function (x) {
        x.classList.remove('tip-active');
      });
    }, { passive: true });
  })();

  /* ============================================================
     "COMING SOON" STORE BADGES -> early access page
     ============================================================ */
  (function soonBadgesGoToAccess() {
    var ACCESS_URL = '/access';

    function soonBadge(node) {
      var el = node && node.closest ? node.closest('.store, .is-soon, [data-soon]') : null;
      if (!el) return null;
      if (el.classList.contains('is-soon') || el.hasAttribute('data-soon')) return el;
      return /coming\s*soon/i.test(el.textContent || '') ? el : null;
    }

    document.querySelectorAll('.store').forEach(function (el) {
      if (!soonBadge(el)) return;
      el.classList.add('is-soon');
      if (el.tagName === 'A') el.setAttribute('href', ACCESS_URL);
      else { el.setAttribute('role', 'link'); el.setAttribute('tabindex', '0'); }
      el.setAttribute('title', 'Coming soon: join early access');
    });

    document.addEventListener('click', function (e) {
      var el = soonBadge(e.target);
      if (!el) return;
      e.preventDefault();
      location.href = ACCESS_URL;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = soonBadge(e.target);
      if (!el || el.tagName === 'A') return;
      e.preventDefault();
      location.href = ACCESS_URL;
    });
  })();

})();