/* ============================================================
   Textout:) — Contact page
   Saves contact messages to Supabase (table: contact_messages).
   Plain fetch against the REST API, nothing to install.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- CONFIG: same anon key as early-access.js --------------------
     Supabase dashboard > Project Settings > API > "anon public" key.
     Row Level Security protects the table; the policy only allows inserts.   */
  var SUPABASE_URL      = 'https://ixnfdzkbpezsdvormutu.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bmZkemticGV6c2R2b3JtdXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTc1OTEsImV4cCI6MjA2NDM3MzU5MX0.0orXcX-Y8nHaVKIXfpePSVKBXzkkniGi4h6EBOuqWLQ';
  var TABLE             = 'contact_messages';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var form = document.getElementById('ctForm');
  if (!form) return;
  var nameEl  = document.getElementById('ctName');
  var email   = document.getElementById('ctEmail');
  var message = document.getElementById('ctMessage');
  var count   = document.getElementById('ctCount');
  var submit  = document.getElementById('ctSubmit');
  var msg     = document.getElementById('ctMsg');
  var done    = document.getElementById('ctDone');
  var doneTitle = document.getElementById('ctDoneTitle');
  var doneText  = document.getElementById('ctDoneText');

  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var MIN_MESSAGE = 10;

  function setMsg(text, ok) {
    msg.textContent = text || '';
    msg.classList.toggle('is-ok', !!ok);
  }

  function showDone(title, text) {
    doneTitle.textContent = title;
    doneText.textContent = text;
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }

  function invalid(el, text) {
    el.setAttribute('aria-invalid', 'true');
    setMsg(text);
    el.focus();
  }

  // clear errors as the user fixes them
  [nameEl, email, message].forEach(function (el) {
    el.addEventListener('input', function () {
      el.removeAttribute('aria-invalid');
      setMsg('');
    });
  });
  message.addEventListener('input', function () {
    count.textContent = message.value.length + ' / 2000';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var topicEl = form.querySelector('input[name="topic"]:checked');
    var topic   = topicEl ? topicEl.value : 'other';
    var name    = nameEl.value.trim();
    var address = email.value.trim().toLowerCase();
    var text    = message.value.trim();

    // 1. Validate
    if (!name) { return invalid(nameEl, 'Please tell us your name.'); }
    if (!EMAIL_RE.test(address) || address.length > 254) {
      return invalid(email, 'Enter a valid email address, like you@example.com.');
    }
    if (text.length < MIN_MESSAGE) {
      return invalid(message, 'Please write at least ' + MIN_MESSAGE + ' characters so we can help.');
    }

    // 2. Bots fill the hidden field; pretend it worked and drop it
    if (form.elements.company && form.elements.company.value) {
      showDone('Message sent', "Thanks for getting in touch. We'll reply by email.");
      return;
    }

    if (SUPABASE_ANON_KEY.indexOf('YOUR_') === 0) {
      console.error('[contact] Add your Supabase anon key to contact.js');
      setMsg('The contact form is not connected yet. Please email pixeleratech@gmail.com instead.');
      return;
    }

    // 3. Save
    submit.disabled = true;
    submit.textContent = 'Sending...';
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
      body: JSON.stringify({ name: name, email: address, topic: topic, message: text })
    })
    .then(function (res) {
      if (res.ok) {
        showDone('Message sent', "Thanks, " + name.split(' ')[0] + ". We'll reply to " + address + ' soon.');
        return;
      }
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (body && /too many/i.test(body.message || '')) {
          setMsg('A lot of messages are coming in. Wait a moment and try again.');
        } else {
          console.error('[contact] Supabase error', res.status, body);
          setMsg('Something went wrong and your message was not sent. Please try again.');
        }
      });
    })
    .catch(function (err) {
      console.error('[contact] Network error', err);
      setMsg('Could not reach the server. Check your connection and try again.');
    })
    .then(function () {
      submit.disabled = false;
      submit.textContent = 'Send message';
    });
  });
})();