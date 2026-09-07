/* Mobile nav menu. Binds the .ct-burger button (shown only <=768px, see
   ct.css) to a full-screen menu panel.

   The panel's links are CLONED from the existing .ct-nav-links anchors
   (plus the primary "Join free" CTA) at mount time, rather than hard-coded
   here, so the mobile menu can never drift out of sync with the desktop
   nav - edit the nav once, both surfaces update together.

   NOTE for future editors: the open/close/focus-trap logic below
   deliberately mirrors ct-gate.js's modal (same FOCUSABLE selector, same
   Tab-wrap logic, same restore-focus-to-trigger-on-close approach).
   Two focus-trapped overlays on the same pages with two different trap
   implementations would be its own maintenance trap - don't invent a
   second pattern here. */
(function () {
  'use strict';

  var FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

  function build(burger) {
    var navLinks = document.querySelector('.ct-nav-links');
    var cta = document.querySelector('.ct-nav-inner > .ct-cta');
    var i, anchors;

    var el = document.createElement('div');
    el.id = 'ct-menu';
    el.className = 'ct-menu';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Menu');
    el.hidden = true;

    var panel = document.createElement('div');
    panel.className = 'ct-menu-panel';

    if (navLinks) {
      anchors = navLinks.querySelectorAll('a');
      for (i = 0; i < anchors.length; i++) panel.appendChild(anchors[i].cloneNode(true));
    }
    /* Primary CTA lives outside .ct-nav-links in the markup (it sits between
       the links and the burger), so it's cloned separately. */
    if (cta) panel.appendChild(cta.cloneNode(true));

    el.appendChild(panel);
    document.body.appendChild(el);
    return el;
  }

  function mount() {
    var burger = document.querySelector('.ct-burger');
    if (!burger) return;
    if (burger.getAttribute('data-ct-nav-mounted')) return;
    burger.setAttribute('data-ct-nav-mounted', '1');

    /* Built eagerly (not lazily on first click) so aria-controls points at
       a real element from the start and #ct-menu exists, hidden, on load. */
    var menu = build(burger);

    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'ct-menu');

    function close() {
      if (menu.hidden) return;
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (burger.focus) burger.focus();
    }

    function open() {
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      var first = menu.querySelector(FOCUSABLE);
      if (first) first.focus();
    }

    burger.addEventListener('click', function () {
      if (menu.hidden) open(); else close();
    });

    document.addEventListener('click', function (e) {
      if (menu.hidden) return;
      if (!e.target || !e.target.closest) return;
      /* Backdrop click: the click landed on the overlay itself, not on
         anything inside the panel. */
      if (e.target === menu) { close(); return; }
      var a = e.target.closest('a');
      if (a && menu.contains(a)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = menu.querySelectorAll(FOCUSABLE);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      /* Focus escaped the panel (e.g. after a backdrop click). Pull it back. */
      if (!menu.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
