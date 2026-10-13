/* ============================================================
   Textout:) — Privacy & Terms page
   Highlights the jump tab for the section currently on screen.
   ============================================================ */
(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('#legalTabs a'));
  if (!tabs.length) return;

  var sections = tabs.map(function (a) {
    return document.getElementById((a.getAttribute('href') || '').slice(1));
  });

  function setActive(id) {
    tabs.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  // clicking a tab marks it right away
  tabs.forEach(function (a) {
    a.addEventListener('click', function () {
      setActive(a.getAttribute('href').slice(1));
    });
  });

  // landing on /privacy.html#terms etc.
  if (location.hash && document.querySelector('#legalTabs a[href="' + location.hash + '"]')) {
    setActive(location.hash.slice(1));
  }

  // scroll spy: the active section is the last one whose top has passed the upper third of the screen
  var ticking = false;
  function spy() {
    var line = window.innerHeight * 0.33;
    var current = sections[0];
    sections.forEach(function (s) {
      if (s && s.getBoundingClientRect().top <= line) current = s;
    });
    if (current) setActive(current.id);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(spy); }
  }, { passive: true });
})();