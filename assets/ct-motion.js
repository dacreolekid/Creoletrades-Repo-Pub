/* Scroll entry via IntersectionObserver. Never a scroll listener. */
(function () {
  'use strict';
  var reduce = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;

  function reveal(n) {
    if (n.className.indexOf('ct-in') === -1) n.className += ' ct-in';
  }

  /* One shared observer for the whole page. observe() may be called many times
     (page load, then again after every results re-render), so creating a new
     observer per call would accumulate observers for the session. */
  function getObserver() {
    if (io) return io;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var i = Number(el.getAttribute('data-delay') || 0);
        el.style.animationDelay = (i * 80) + 'ms';
        reveal(el);
        io.unobserve(el);
      });
    }, { rootMargin: '0px', threshold: 0.05 });
    return io;
  }

  function observe(scope) {
    var root = scope || document;
    var nodes = root.querySelectorAll ? root.querySelectorAll('.ct-rise') : [];
    var pending = Array.prototype.filter.call(nodes, function (n) {
      return n.className.indexOf('ct-in') === -1;
    });
    if (!pending.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      pending.forEach(reveal);
      return;
    }

    var obs = getObserver();
    pending.forEach(function (n) { obs.observe(n); });
  }

  window.CTMotion = { observe: observe };

  if (document.readyState !== 'loading') observe(document);
  else document.addEventListener('DOMContentLoaded', function () { observe(document); });
})();
