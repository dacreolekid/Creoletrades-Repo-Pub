/* Three-question tier chooser.
   HARD RULE: a non-owner of Wolf Chart is NEVER routed to the $9.99 link. */
(function () {
  'use strict';

  var WOLF_SUB = 'https://mee6.xyz/en/m/tradingroux?subscribe=1424116688441454592';
  var AFFILIATE = 'https://thewolfchart.com/?via=creoletrades';
  var DISCORD = 'https://discord.gg/bRr7uP7Jbd';
  var MASTERY = 'https://mee6.xyz/en/m/tradingroux?subscribe=1471656319198171136';
  var SILVER = 'https://mee6.xyz/en/m/tradingroux?subscribe=1486852171617148928';

  var OUT = {
    free: { key: 'free', title: 'Start free in the Roux', href: DISCORD,
      cta: 'Join free',
      why: 'Get the daily bias, the Friday Confirmation live, and the full STACK Method education before you spend anything.' },
    wolfOwner: { key: 'wolfOwner', title: 'STACKED: Wolf, $9.99/mo', href: WOLF_SUB,
      cta: 'Subscribe to Wolf',
      why: 'You already own Wolf Chart 2.1, so the $9.99 tier is the right one. It adds the walkthroughs and confirmation training built around the chart.' },
    wolfNeedsChart: { key: 'wolfNeedsChart', title: 'Get Wolf Chart 2.1 first', href: AFFILIATE,
      cta: 'Get Wolf Chart 2.1',
      why: 'The Wolf tier is built around the chart, so buying it without the tool leaves you with lessons you cannot follow. Subscribe through this link and your Wolf server access is included free.' },
    silver: { key: 'silver', title: 'Mastery Silver, from $99', href: SILVER,
      cta: 'Book a session',
      why: 'A single 60 minute session with Que plus a week of Mastery access. The cheapest way to get real coaching before committing to the full tier.' },
    mastery: { key: 'mastery', title: 'STACKED: Mastery', href: MASTERY,
      cta: 'Join Mastery',
      why: 'Full trade plans, options guidance across all five zones, and one-on-one sessions with Que.' }
  };

  function recommend(a) {
    if (a.want === 'coaching') return a.stage === 'new' ? OUT.silver : OUT.mastery;
    if (a.want === 'plans') return OUT.mastery;
    if (a.want === 'learn') {
      if (a.stage === 'new') return OUT.free;
      return a.owns === 'yes' ? OUT.wolfOwner : OUT.wolfNeedsChart;
    }
    return OUT.free;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mount(root) {
    if (!root) return;
    if (root.getAttribute('data-ct-mounted')) return;
    root.setAttribute('data-ct-mounted', '1');
    var answers = { owns: null, want: null, stage: null };
    var qs = [
      { key: 'owns', q: 'Do you already have Wolf Chart 2.1?',
        opts: [['yes', 'Yes'], ['no', 'No'], ['what', 'What is that?']] },
      { key: 'want', q: 'What do you want most right now?',
        opts: [['learn', 'Learn to read charts'], ['plans', 'Full trade plans'], ['coaching', 'One-on-one coaching']] },
      { key: 'stage', q: 'Where are you starting from?',
        opts: [['new', 'Brand new'], ['inconsistent', 'Trading, but inconsistent'], ['exp', 'Experienced, want an edge']] }
    ];
    var i = 0;

    /* Focus the new heading after a user action so keyboard and screen-reader
       users land on the new question instead of being dropped at the top of
       the page. Focus alone announces it; an aria-live region as well would
       double-announce, so we deliberately use only focus. */
    function paint(html, moveFocus) {
      root.innerHTML = html;
      if (!moveFocus) return;
      var h = root.querySelector('h3');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }

    function drawQ(moveFocus) {
      var q = qs[i];
      paint('<div class="ct-core" style="padding:38px 36px;">'
        + '<div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;'
        + 'color:var(--ct-muted-2);margin-bottom:14px;">Question ' + (i + 1) + ' of 3</div>'
        + '<h3 style="font-size:26px;margin-bottom:24px;">' + esc(q.q) + '</h3>'
        + '<div style="display:flex;flex-direction:column;gap:10px;">'
        + q.opts.map(function (o) {
            return '<button type="button" class="ct-ghost" data-val="' + esc(o[0]) + '">'
              + esc(o[1]) + '</button>';
          }).join('')
        + '</div></div>', moveFocus);
    }

    function drawResult(moveFocus) {
      var r = recommend(answers);
      paint('<div class="ct-core ct-core-gold" style="padding:38px 36px;">'
        + '<span class="ct-pill">Your next step</span>'
        + '<h3 style="font-size:30px;margin:16px 0 12px;">' + esc(r.title) + '</h3>'
        + '<p style="font-size:15px;color:var(--ct-text-2);line-height:1.8;margin-bottom:26px;">'
        + esc(r.why) + '</p>'
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">'
        + '<a class="ct-cta" data-rec="' + esc(r.key) + '"'
        + (r.key === 'wolfOwner' ? ' data-gate-skip="1"' : '')
        + ' href="' + esc(r.href) + '">'
        + esc(r.cta) + '<span class="ct-cta-ico"></span></a>'
        + '<button type="button" class="ct-ghost" data-restart="1">Start over</button>'
        + '</div>'
        + '<p style="font-size:12px;color:var(--ct-muted-2);font-style:italic;margin-top:22px;">'
        + 'Not ready? <a href="' + esc(DISCORD) + '">Start free instead</a>.</p>'
        + '</div>', moveFocus);
    }

    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('[data-restart]')) {
        i = 0; answers = { owns: null, want: null, stage: null }; drawQ(true); return;
      }
      var hit = t.closest('[data-val]');
      if (!hit) return;
      answers[qs[i].key] = hit.getAttribute('data-val');
      i += 1;
      if (i < qs.length) drawQ(true); else drawResult(true);
    });

    drawQ(false);
  }

  window.CTChooser = { recommend: recommend, mount: mount };

  if (document.readyState !== 'loading') mount(document.getElementById('ct-chooser'));
  else document.addEventListener('DOMContentLoaded', function () {
    mount(document.getElementById('ct-chooser'));
  });
})();
