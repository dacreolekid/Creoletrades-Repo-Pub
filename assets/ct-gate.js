/* Wolf Chart gate. Intercepts the $9.99 STACKED: Wolf subscribe link only.
   Must never block the affiliate link or any other tier.

   NOTE for future editors: this relies on click/auxclick bubbling to document.
   Do not call stopPropagation() on clicks inside the checkout link's ancestors.
   Known tradeoff: on a browser without Element.closest (IE11) the gate no-ops
   and the link proceeds unprotected. Accepted knowingly. */
(function () {
  'use strict';

  var WOLF_SUB = 'subscribe=1424116688441454592';
  var AFFILIATE = 'https://thewolfchart.com/?via=creoletrades';
  var FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
  var lastTrigger = null;
  var modal = null;
  var isolated = [];

  function build() {
    var el = document.createElement('div');
    el.className = 'ct-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'ct-gate-title');
    el.hidden = true;
    el.innerHTML =
      '<div class="ct-shell ct-modal-card"><div class="ct-core" style="padding:36px 34px;position:relative;">'
      + '<button type="button" class="ct-ghost" data-gate="close" aria-label="Close"'
      + ' style="position:absolute;top:14px;right:14px;width:36px;height:36px;padding:0;'
      + 'justify-content:center;font-style:normal;line-height:1;">&times;</button>'
      + '<h2 id="ct-gate-title" style="font-size:26px;margin-bottom:12px;padding-right:44px;">'
      + 'Do you already have Wolf Chart 2.1?</h2>'
      + '<p style="font-size:14px;color:var(--ct-text-2);line-height:1.75;margin-bottom:26px;">'
      + 'STACKED: Wolf is built around the Wolf Chart. The $9.99/mo is for traders who already own it.</p>'
      + '<div style="display:flex;flex-direction:column;gap:10px;">'
      + '<button type="button" class="ct-cta" data-gate="yes">Yes, I own it'
      + '<span class="ct-cta-ico"></span></button>'
      + '<button type="button" class="ct-ghost" data-gate="no">No, not yet</button>'
      + '<button type="button" class="ct-ghost" data-gate="what">What is Wolf Chart 2.1?</button>'
      + '</div>'
      + '<p style="font-size:12px;color:var(--ct-muted-2);font-style:italic;margin-top:20px;line-height:1.6;">'
      + 'Subscribe to the chart through my link and your Wolf server access is included free.</p>'
      + '</div></div>';
    document.body.appendChild(el);
    return el;
  }

  /* Hide the rest of the page from assistive tech while the dialog is open. */
  function isolate(on) {
    var kids, i;
    if (on) {
      isolated = [];
      kids = document.body.children;
      for (i = 0; i < kids.length; i++) {
        if (kids[i] === modal) continue;
        isolated.push([kids[i], kids[i].getAttribute('aria-hidden')]);
        kids[i].setAttribute('aria-hidden', 'true');
      }
    } else {
      for (i = 0; i < isolated.length; i++) {
        if (isolated[i][1] === null) isolated[i][0].removeAttribute('aria-hidden');
        else isolated[i][0].setAttribute('aria-hidden', isolated[i][1]);
      }
      isolated = [];
    }
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    isolate(false);
    /* The trigger may have been removed from the DOM by a re-render. */
    if (lastTrigger && lastTrigger.focus && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  function open(href) {
    if (!modal) modal = build();
    modal.hidden = false;
    modal.setAttribute('data-target', href);
    isolate(true);
    var first = modal.querySelector('[data-gate="yes"]');
    if (first) first.focus();
  }

  function onChoice(choice, href) {
    if (choice === 'close') { close(); return; }
    close();
    if (choice === 'yes') { window.location.href = href; return; }
    if (choice === 'no') { window.location.href = AFFILIATE; return; }
    window.location.href = '/join#wolf-chart';
  }

  function onPointer(e) {
    if (!e.target || !e.target.closest) return;

    var gateBtn = e.target.closest('[data-gate]');
    if (gateBtn && modal && !modal.hidden) {
      e.preventDefault();
      onChoice(gateBtn.getAttribute('data-gate'), modal.getAttribute('data-target'));
      return;
    }

    if (modal && !modal.hidden && e.target === modal) { close(); return; }

    var a = e.target.closest('a[href]');
    if (!a) return;
    /* Links marked data-gate-skip have already confirmed ownership through
       another flow (the tier chooser). Do not ask the same question twice. */
    if (a.getAttribute('data-gate-skip') !== null) return;
    if (a.getAttribute('href').indexOf(WOLF_SUB) === -1) return;
    e.preventDefault();
    lastTrigger = a;
    open(a.getAttribute('href'));
  }

  document.addEventListener('click', onPointer);
  /* Middle-click fires auxclick, not click. Without this the gate is bypassed. */
  document.addEventListener('auxclick', function (e) { if (e.button === 1) onPointer(e); });

  document.addEventListener('keydown', function (e) {
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var f = modal.querySelectorAll(FOCUSABLE);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    /* Focus escaped the dialog (e.g. after a backdrop click). Pull it back. */
    if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
