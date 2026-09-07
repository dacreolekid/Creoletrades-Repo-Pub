/* Renders CT_RESULTS into result cards. Used by / and /results. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function author(r) {
    return '<div style="display:flex;align-items:center;gap:11px;margin-top:auto;padding-top:14px;">'
      + '<div style="width:34px;height:34px;border-radius:9999px;border:1px solid rgba(201,168,76,.24);'
      + 'background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;'
      + 'font-size:11px;color:var(--ct-spice);">' + esc(r.initials) + '</div><div>'
      + '<div style="font-family:\'Playfair Display\',serif;font-size:14px;color:var(--ct-parch);">'
      + esc(r.member) + '</div>'
      + '<div style="font-size:11px;color:var(--ct-muted-2);font-style:italic;">' + esc(r.role) + '</div>'
      + '</div></div>';
  }

  function head(r, big) {
    if (!r.amount) {
      return r.sublabel
        ? '<div style="font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;'
          + 'color:var(--ct-muted-2);">' + esc(r.sublabel) + '</div>'
        : '';
    }
    if (big) {
      var meta = [r.percent, r.sublabel].filter(Boolean).join(' · ');
      return '<div style="font-family:\'Playfair Display\',serif;font-size:64px;font-weight:500;'
        + 'color:var(--ct-firefly);line-height:.92;letter-spacing:-.03em;">' + esc(r.amount) + '</div>'
        + (meta ? '<div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;'
            + 'color:var(--ct-muted);">' + esc(meta) + '</div>' : '');
    }
    var pct = r.percent
      ? ' <span style="font-size:14px;color:var(--ct-muted);font-style:italic;">' + esc(r.percent) + '</span>'
      : '';
    return '<div style="font-family:\'Playfair Display\',serif;font-size:34px;font-weight:500;'
      + 'color:var(--ct-firefly);line-height:1;letter-spacing:-.02em;">' + esc(r.amount) + pct + '</div>'
      + (r.sublabel ? '<div style="font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;'
          + 'color:var(--ct-muted-2);">' + esc(r.sublabel) + '</div>' : '');
  }

  function card(r, big) {
    var quoteCss = big
      ? 'font-family:\'Playfair Display\',serif;font-size:22px;font-style:italic;'
        + 'color:var(--ct-parch);line-height:1.55;'
      : 'font-size:13.5px;color:var(--ct-text-2);line-height:1.75;';
    var pad = big ? '44px 42px' : '32px 30px';
    return '<div class="ct-shell ct-rise' + (big ? ' ct-feature' : '') + '" data-tier="' + esc(r.tier) + '">'
      + '<div class="ct-core" style="padding:' + pad + ';display:flex;flex-direction:column;gap:15px;">'
      + head(r, big)
      + '<div style="' + quoteCss + '">&ldquo;' + esc(r.quote) + '&rdquo;</div>'
      + author(r) + '</div></div>';
  }

  function render(mount, opts) {
    if (!mount) return;
    opts = opts || {};
    var list = (window.CT_RESULTS || []).slice();

    if (opts.tier && opts.tier !== 'all') {
      list = list.filter(function (r) { return r.tier === opts.tier; });
    }
    if (opts.limit) {
      var feat = list.filter(function (r) { return r.featured; });
      var rest = list.filter(function (r) { return !r.featured; });
      list = feat.concat(rest).slice(0, opts.limit);
    }

    if (!list.length) {
      mount.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;'
        + 'color:var(--ct-muted);font-style:italic;">No results in this filter yet.</div>';
      return;
    }

    mount.innerHTML = list.map(function (r, i) {
      return card(r, Boolean(opts.featureFirst) && i === 0 && r.featured);
    }).join('');

    if (window.CTMotion) {
      window.CTMotion.observe(mount);
    } else {
      // Motion script missing or not yet executed. Reveal immediately rather than
      // leaving cards stranded at opacity:0 by ct.css's .js .ct-rise rule.
      var risers = mount.querySelectorAll('.ct-rise');
      Array.prototype.forEach.call(risers, function (n) { n.className += ' ct-in'; });
    }
  }

  function initFilters(scope, mount, opts) {
    if (!scope || !mount) return;
    var btns = scope.querySelectorAll('[data-filter]');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(btns, function (o) {
          o.setAttribute('aria-pressed', String(o === b));
        });
        var o = {};
        for (var k in opts) { if (Object.prototype.hasOwnProperty.call(opts, k)) o[k] = opts[k]; }
        o.tier = b.getAttribute('data-filter');
        render(mount, o);
      });
    });
  }

  window.CTResults = { render: render, initFilters: initFilters };
})();
