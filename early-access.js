/* ============================================================
   Textout:) — Early access page
   Saves waitlist signups (email + platform) to Supabase.
   Uses plain fetch against the REST API, so there is nothing to install.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- CONFIG: paste your anon key here ---------------------------
     Supabase dashboard > Project Settings > API > "anon public" key.
     The anon key is designed to be public. Row Level Security is what
     protects the table, and your waitlist policy only allows inserts.     */
  var SUPABASE_URL      = 'https://ixnfdzkbpezsdvormutu.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bmZkemticGV6c2R2b3JtdXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTc1OTEsImV4cCI6MjA2NDM3MzU5MX0.0orXcX-Y8nHaVKIXfpePSVKBXzkkniGi4h6EBOuqWLQ';
  var TABLE             = 'waitlist';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme images: local file first, Supabase URL as fallback ---- */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function useFallback() {
      var fb = img.getAttribute('data-fallback');
      if (fb && img.src.indexOf(fb) === -1) img.src = fb;
    }
    img.addEventListener('error', useFallback);
    if (img.complete && img.naturalWidth === 0) useFallback();
  });

  /* ---------- Toast: small pop-up message at the bottom of the screen ---------- */
  var toastBox = document.createElement('div');
  toastBox.className = 'ea-toasts';
  toastBox.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastBox);
  var toastTimer;
  var TOAST_ICON = { ok: '\u2713', info: 'i', error: '!' };

  function toast(text, kind) {
    kind = kind || 'info';
    toastBox.innerHTML = '';
    var t = document.createElement('div');
    t.className = 'ea-toast is-' + kind;
    var ic = document.createElement('span');
    ic.className = 'ea-toast__ic';
    ic.setAttribute('aria-hidden', 'true');
    ic.textContent = TOAST_ICON[kind] || 'i';
    var tx = document.createElement('span');
    tx.textContent = text;
    t.appendChild(ic);
    t.appendChild(tx);
    toastBox.appendChild(t);

    function hide() {
      clearTimeout(toastTimer);
      t.classList.add('is-out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
    }
    t.addEventListener('click', hide);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hide, 4200);
  }

  /* ---------- Block right-click / drag / long-press saving of images ------
     This stops casual "Save image as". It can't stop someone determined
     (dev tools, screenshots), so don't rely on it for anything secret.   */
  var PROTECTED = 'img, .ea-poster, .ea-chatter, .ea-phone';
  document.querySelectorAll('img').forEach(function (img) { img.setAttribute('draggable', 'false'); });
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest && e.target.closest(PROTECTED)) e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  /* ---------- Phone layout: scale the tile + chatter to the stage width ---------- */
  var stageEl = document.querySelector('.ea-stage');
  function fitStage() {
    if (!stageEl) return;
    var designW = parseFloat(getComputedStyle(stageEl).getPropertyValue('--ea-w')) || 640;   // 640 on phones, 900 on desktop (set in CSS)
    stageEl.style.setProperty('--ea-s', (stageEl.clientWidth / designW).toFixed(4));
  }
  fitStage();
  if ('ResizeObserver' in window && stageEl) new ResizeObserver(fitStage).observe(stageEl);
  else window.addEventListener('resize', fitStage);

  /* ---------- Founding-member counter: counts up once when seen ---------- */
  var countEl = document.getElementById('eaCount');
  if (countEl && !reduce && 'IntersectionObserver' in window) {
    var target = 1000;
    countEl.textContent = '0000';
    var countIo = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      countIo.disconnect();
      var start = null, dur = 1100;
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        countEl.textContent = String(Math.round(target * eased)).padStart(4, '0');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    countIo.observe(countEl);
  }

  /* ---------- Form ---------- */
  var form   = document.getElementById('eaForm');
  if (!form) return;
  var email  = document.getElementById('eaEmail');
  var submit = document.getElementById('eaSubmit');
  var msg    = document.getElementById('eaMsg');
  var done   = document.getElementById('eaDone');
  var doneTitle = document.getElementById('eaDoneTitle');
  var doneText  = document.getElementById('eaDoneText');

  /* Strict email check: one @, sane local part, real-looking domain with a proper ending. */
  function isValidEmail(a) {
    if (!a || a.length > 254) return false;
    var parts = a.split('@');
    if (parts.length !== 2) return false;
    var local = parts[0], domain = parts[1];
    if (!local || local.length > 64) return false;
    if (!/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+$/i.test(local)) return false;
    if (local.charAt(0) === '.' || local.charAt(local.length - 1) === '.' || local.indexOf('..') !== -1) return false;
    if (!domain || domain.length > 253) return false;
    var labels = domain.split('.');
    if (labels.length < 2) return false;
    for (var i = 0; i < labels.length; i++) {
      if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(labels[i])) return false;
    }
    return /^([a-z]{2,}|xn--[a-z0-9-]{2,})$/i.test(labels[labels.length - 1]);
  }

  /* Common typos of big email providers (none of these are real domains). */
  var DOMAIN_TYPOS = {
    'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.con': 'gmail.com',
    'gmail.cm': 'gmail.com', 'gmaill.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.comm': 'gmail.com',
    'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmail.con': 'hotmail.com',
    'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.con': 'yahoo.com',
    'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com',
    'icloud.con': 'icloud.com', 'iclod.com': 'icloud.com'
  };
  var PLATFORM_LABEL = { ios: 'iPhone', android: 'Android' };

  function setMsg(text, ok) {
    msg.textContent = text || '';
    msg.classList.toggle('is-ok', !!ok);
  }

  // inline message under the form + toast
  function notify(text, kind) {
    setMsg(text);
    toast(text, kind || 'error');
  }

  function showDone(title, text) {
    toast(title, /already/i.test(title) ? 'info' : 'ok');
    doneTitle.textContent = title;
    doneText.textContent = text;
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }

  // "Add another email": bring the form back, clear the email, keep the phone choice
  var another = document.getElementById('eaAnother');
  if (another) {
    another.addEventListener('click', function () {
      done.hidden = true;
      form.hidden = false;
      email.value = '';
      email.removeAttribute('aria-invalid');
      setMsg('');
      form.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      email.focus({ preventScroll: true });
    });
  }

  function getPlatform() {
    var checked = form.querySelector('input[name="platform"]:checked');
    return checked ? checked.value : '';
  }

  // clear errors as the user fixes them
  form.addEventListener('change', function (e) {
    if (e.target.name === 'platform') {
      form.classList.remove('is-invalid-platform');
      setMsg('');
    }
  });
  email.addEventListener('input', function () {
    email.removeAttribute('aria-invalid');
    setMsg('');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var platform = getPlatform();
    var address  = email.value.trim().toLowerCase();

    // 1. Validate
    if (!platform) {
      form.classList.add('is-invalid-platform');
      notify('Choose iPhone or Android first.');
      form.querySelector('input[name="platform"]').focus();
      return;
    }
    if (!isValidEmail(address)) {
      email.setAttribute('aria-invalid', 'true');
      notify('Enter a valid email address, like you@example.com.');
      email.focus();
      return;
    }
    var typoFix = DOMAIN_TYPOS[address.split('@')[1]];
    if (typoFix) {
      email.setAttribute('aria-invalid', 'true');
      notify('Did you mean ' + address.split('@')[0] + '@' + typoFix + '?');
      email.focus();
      return;
    }

    // 2. Bots fill the hidden field; pretend it worked and drop it
    if (form.elements.company && form.elements.company.value) {
      showDone("You're on the list", 'We\'ll email you when Textout:) opens.');
      return;
    }

    if (SUPABASE_ANON_KEY.indexOf('YOUR_') === 0) {
      console.error('[early-access] Add your Supabase anon key to early-access.js');
      notify('Signups are not connected yet. Please try again later.');
      return;
    }

    // 3. Save
    submit.disabled = true;
    submit.textContent = 'Joining...';
    setMsg('');

    // Legacy anon keys (start with "eyJ") are JWTs and also go in Authorization.
    // New publishable keys (sb_publishable_...) are not JWTs, so they go in apikey only.
    var headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'          // INSERT-only permission, so don't ask for the row back
    };
    if (SUPABASE_ANON_KEY.indexOf('eyJ') === 0) headers['Authorization'] = 'Bearer ' + SUPABASE_ANON_KEY;

    fetch(SUPABASE_URL + '/rest/v1/' + TABLE, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ email: address, platform: platform })
    })
    .then(function (res) {
      if (res.ok) {
        showDone("You're on the list",
          'We\'ll email ' + address + ' when Textout:) is ready for ' + PLATFORM_LABEL[platform] + '.');
        return;
      }
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (body && body.code === '23505') {
          showDone("You're already on the list", 'That email is saved. We\'ll write to you at launch.');
        } else if (body && /too many/i.test(body.message || '')) {
          notify('A lot of people are joining right now. Wait a moment and try again.');
        } else {
          console.error('[early-access] Supabase error', res.status, body);
          notify('Something went wrong and your email was not saved. Please try again.');
        }
      });
    })
    .catch(function (err) {
      console.error('[early-access] Network error', err);
      notify('Could not reach the server. Check your connection and try again.');
    })
    .then(function () {
      submit.disabled = false;
      submit.textContent = 'Join the waitlist';
    });
  });
})();