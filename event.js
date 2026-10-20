/* Textout:) — public event page (textout.in/event/<share_id>) */
(function () {
  // ── fill these two in (same values you use in contact.js / early-access.js) ──
  var SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
  var SUPABASE_KEY = 'YOUR-ANON-OR-PUBLISHABLE-KEY';

  var STORE_IOS = 'https://testflight.apple.com/join/efDcTRTD';
  var STORE_ANDROID = 'https://play.google.com/store/apps/details?id=com.sreehari.chattering';

  var root = document.getElementById('eventRoot');
  if (!root) return;

  /* ---------- helpers ---------- */
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clear() { while (root.firstChild) root.removeChild(root.firstChild); }
  function httpsUrl(u) { return typeof u === 'string' && /^https:\/\//i.test(u) ? u : null; }

  function setMeta(title, desc) {
    document.title = title;
    var m = document.querySelector('meta[name="description"]');
    if (m && desc) m.setAttribute('content', desc);
  }

  function getShareId() {
    var m = location.pathname.match(/^\/event\/([A-Za-z0-9]{6,32})\/?$/);
    if (m) return m[1];
    var q = new URLSearchParams(location.search).get('id');
    return q && /^[A-Za-z0-9]{6,32}$/.test(q) ? q : null;
  }

  var ICON_GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  var ICON_APPLE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/></svg>';

  function tag(cls, iconSvg, text) {
    var t = h('span', 'ev-tag ' + cls);
    if (iconSvg) { var i = h('span'); i.innerHTML = iconSvg; t.appendChild(i.firstChild); } // static icon strings only
    t.appendChild(document.createTextNode(text));
    return t;
  }

  function storeButton(href, svg, small, strong) {
    var a = h('a', 'store-tag');
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    var s = h('span'); s.innerHTML = svg; a.appendChild(s.firstChild);
    var txt = h('span');
    txt.appendChild(h('small', null, small));
    txt.appendChild(h('strong', null, strong));
    a.appendChild(txt);
    return a;
  }

  function cta() {
    var box = h('div', 'ev-cta');
    box.appendChild(h('h2', null, 'Join this event on Textout:)'));
    box.appendChild(h('p', null, 'Get the app to join the event, chat with everyone and share the moment.'));
    var row = h('div', 'store-row');
    row.appendChild(storeButton(STORE_IOS, ICON_APPLE, 'Early testers', 'iPhone'));
    row.appendChild(storeButton(STORE_ANDROID, ICON_PLAY, 'Get it on', 'Google Play'));
    box.appendChild(row);
    return box;
  }

  /* ---------- states ---------- */
  function showLoading() {
    clear();
    var s = h('div', 'ev-state');
    s.appendChild(h('div', 'ev-spin'));
    s.appendChild(h('p', null, 'Loading event…'));
    root.appendChild(s);
  }

  function showMessage(title, msg) {
    clear();
    var s = h('div', 'ev-state');
    s.appendChild(h('h1', null, title));
    s.appendChild(h('p', null, msg));
    var a = h('a', 'btn btn-primary', 'Go to Textout:)');
    a.href = '/';
    s.appendChild(a);
    root.appendChild(s);
  }

  /* ---------- formatting ---------- */
  function fmt(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return {
      date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
      d: d
    };
  }

  function money(price, currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(price);
    } catch (e) {
      return (currency ? currency + ' ' : '') + price;
    }
  }

  function card(label) {
    var c = h('div', 'ev-card');
    c.appendChild(h('div', 'ev-label', label));
    return c;
  }

  function dateRow(k, f) {
    var r = h('div', 'ev-row');
    r.appendChild(h('span', 'ev-row-k', k));
    var v = h('span', 'ev-row-v');
    if (f) { v.appendChild(document.createTextNode(f.date + ' · ' + f.time)); }
    else { v.appendChild(document.createTextNode('—')); }
    r.appendChild(v);
    return r;
  }

  /* ---------- event page ---------- */
  function showEvent(e) {
    clear();
    var start = fmt(e.start_time), end = fmt(e.end_time);
    var ended = end && end.d.getTime() < Date.now();

    setMeta((e.title || 'Event') + ' | Textout:)',
      (e.host_username ? '@' + e.host_username + ' invited you. ' : '') + (e.description || 'Join this event on Textout:)').slice(0, 160));

    // cover
    var cover = h('div', 'ev-cover');
    var pic = httpsUrl(e.event_picture_url);
    if (pic) {
      var img = h('img', 'ev-cover-img');
      img.src = pic; img.alt = e.title || 'Event cover'; img.decoding = 'async';
      cover.appendChild(img);
    } else {
      var ph = h('div', 'ev-cover-ph');
      var ow = h('img'); ow.src = '/assets/owl.png'; ow.alt = '';
      ph.appendChild(ow); cover.appendChild(ph);
    }
    cover.appendChild(tag('ev-tag--l', null, ended ? 'Ended' : "You're invited"));
    cover.appendChild(tag('ev-tag--r', ICON_GLOBE, 'Public'));
    root.appendChild(cover);

    // title + host
    root.appendChild(h('h1', 'ev-title', e.title || 'Untitled event'));

    var host = h('div', 'ev-host');
    var av = httpsUrl(e.host_avatar_url);
    if (av) {
      var ai = h('img', 'ev-avatar'); ai.src = av; ai.alt = '';
      host.appendChild(ai);
    } else {
      host.appendChild(h('span', 'ev-avatar', (e.host_username || '?').charAt(0).toUpperCase()));
    }
    var ht = h('span');
    ht.appendChild(h('b', null, '@' + (e.host_username || 'someone')));
    ht.appendChild(document.createTextNode(' invited you'));
    host.appendChild(ht);
    root.appendChild(host);

    // price / capacity chips
    var chips = h('div', 'ev-chips');
    if (e.price != null) chips.appendChild(h('span', 'ev-chip', Number(e.price) > 0 ? money(e.price, e.currency) : 'Free'));
    if (e.capacity != null) chips.appendChild(h('span', 'ev-chip', e.capacity + ' spots'));
    if (chips.childNodes.length) root.appendChild(chips);

    // when
    var when = card('When');
    when.appendChild(dateRow('Starts', start));
    when.appendChild(dateRow('Ends', end));
    root.appendChild(when);
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) root.appendChild(h('p', 'ev-tz', 'Times shown in your local time (' + tz.replace(/_/g, ' ') + ')'));
    } catch (err) { /* ignore */ }

    // where
    var sub = [e.city, e.country].filter(Boolean).join(', ');
    if (e.location_details || sub) {
      var where = card('Where');
      if (e.location_details) where.appendChild(h('div', 'ev-place', e.location_details));
      if (sub) where.appendChild(h('div', e.location_details ? 'ev-place-sub' : 'ev-place', sub));
      var q = [e.location_details, e.city, e.country].filter(Boolean).join(', ');
      var map = h('a', 'ev-map', 'Open in Maps →');
      map.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
      map.target = '_blank'; map.rel = 'noopener';
      where.appendChild(map);
      root.appendChild(where);
    }

    // about
    if (e.description) {
      var about = card('About');
      about.appendChild(h('p', 'ev-about', e.description));
      root.appendChild(about);
    }

    root.appendChild(cta());
  }

  /* ---------- load ---------- */
  var isEventPath = /^\/event(\/|$)/.test(location.pathname);
  var id = getShareId();

  if (!id) {
    if (isEventPath) showMessage("This event isn't available", 'The link may be incorrect or the event is private.');
    else showMessage('Page not found', "We couldn't find the page you were looking for.");
    return;
  }

  showLoading();

  var headers = { 'Content-Type': 'application/json', apikey: SUPABASE_KEY };
  if (SUPABASE_KEY.indexOf('eyJ') === 0) headers.Authorization = 'Bearer ' + SUPABASE_KEY; // legacy anon JWT only

  fetch(SUPABASE_URL + '/rest/v1/rpc/get_public_event_by_share_id', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ p_share_id: id })
  })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (rows) {
      var e = rows && rows[0];
      if (!e) {
        showMessage("This event isn't available", 'The link may be incorrect, or the event is private or has been removed.');
        return;
      }
      showEvent(e);
    })
    .catch(function () {
      showMessage("Couldn't load this event", 'Please check your connection and try again.');
    });
})();