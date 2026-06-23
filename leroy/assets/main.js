/* ================================================================
   Philippe Le Roy Architectes — script commun (site multi-pages)
   Léger : ni GSAP ni Lenis. Reveals via IntersectionObserver, transition
   de page "wipe", aucun position:fixed piloté -> aucun écran blanc.
   ================================================================ */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- préloader (une fois par session) ---------- */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  if (reduceMotion || sessionStorage.getItem('lr-seen')) {
    loader.remove(); document.body.classList.remove('loading'); return;
  }
  sessionStorage.setItem('lr-seen', '1');
  setTimeout(function () {
    loader.classList.add('done');
    document.body.classList.remove('loading');
    setTimeout(function () { loader.remove(); }, 900);
  }, 1450);
})();

/* ---------- transition de page (wipe) ---------- */
(function () {
  const wipe = document.getElementById('wipe');
  if (!wipe) return;
  if (sessionStorage.getItem('lr-nav')) {           // arrivée depuis une page interne
    sessionStorage.removeItem('lr-nav');
    wipe.classList.add('in');
    setTimeout(function () { wipe.classList.remove('in'); }, 800);
  }
  if (reduceMotion) return;
  document.addEventListener('click', function (e) {  // départ : voile avant navigation
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!/\.html(#.*)?$/.test(href) || a.target === '_blank' || a.hasAttribute('data-no-wipe')) return;
    e.preventDefault();
    sessionStorage.setItem('lr-nav', '1');
    wipe.classList.add('out');
    setTimeout(function () { location.href = href; }, 430);
  });
})();

/* ---------- nav : état actif selon la page ---------- */
(function () {
  const here = (location.pathname.split('/').pop() || 'index.html') || 'index.html';
  document.querySelectorAll('.nav a, .mobile-menu a.mlink').forEach(function (a) {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === here) a.classList.add('active');
  });
})();

/* ---------- header + barre de progression ---------- */
(function () {
  const header = document.getElementById('header');
  const progress = document.getElementById('progress');
  addEventListener('scroll', function () {
    if (header) header.classList.toggle('scrolled', scrollY > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    }
  }, { passive: true });
})();

/* ---------- boutons magnétiques ---------- */
(function () {
  if (reduceMotion || !matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll('.btn-blue, .btn-glass, .btn-white').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = 'translate(' + (dx * 9).toFixed(1) + 'px,' + (dy * 7).toFixed(1) + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
})();

/* ---------- menu mobile ---------- */
(function () {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('mobileClose');
  if (!burger || !menu) return;
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { (closeBtn || menu).focus(); } else { burger.focus(); }
  }
  burger.addEventListener('click', function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
})();

/* ---------- titres révélés mot à mot ---------- */
function splitWords(el) {
  var n = 0;
  [].slice.call(el.childNodes).forEach(function (node) {
    if (node.nodeType === 3) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (tk) {
        if (/^\s+$/.test(tk) || tk === '') { frag.append(tk); return; }
        var w = document.createElement('span'); w.className = 'hw';
        var i = document.createElement('i'); i.textContent = tk;
        i.style.setProperty('--d', Math.min(n * 70, 700) + 'ms'); n++;
        w.append(i); frag.append(w);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === 1 && node.tagName !== 'BR') {
      var w2 = document.createElement('span'); w2.className = 'hw';
      var i2 = document.createElement('i');
      node.replaceWith(w2); i2.append(node); w2.append(i2);
      i2.style.setProperty('--d', Math.min(n * 70, 700) + 'ms'); n++;
    }
  });
}
if (!reduceMotion) {
  document.querySelectorAll('h2').forEach(function (h) {
    splitWords(h);
    if (!h.closest('.reveal')) h.classList.add('reveal');
  });
}

/* ---------- reveal au scroll ---------- */
var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

/* ---------- compteurs animés ---------- */
(function () {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      cio.unobserve(entry.target);
      var el = entry.target, end = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = end + suffix; return; }
      var t0 = performance.now(), dur = 1300;
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .6 });
  counters.forEach(function (el) { cio.observe(el); });
})();

/* ---------- année footer ---------- */
(function () { var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); })();

/* ---------- filet : révèle au scroll même si l'IO n'a pas pris ---------- */
(function () {
  function rv() {
    var vh = innerHeight;
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in');
    });
  }
  addEventListener('scroll', function () { requestAnimationFrame(rv); }, { passive: true });
  addEventListener('load', rv); rv();
})();
