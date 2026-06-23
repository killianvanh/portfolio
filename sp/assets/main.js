/* SP Ventilation — interactions maquette (V3.1 : smooth scroll + animations fluides, optimisé)
   Lenis + IntersectionObserver + 1 boucle rAF. Progressive enhancement, zéro dépendance dure. */
(function () {
  'use strict';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canMotion = !prefersReduced;
  function checkDesktop() { return window.innerWidth >= 760 && !window.matchMedia('(pointer:coarse)').matches; }
  var isDesktop = checkDesktop();

  /* ---------- Préloader ---------- */
  function hideLoader() {
    var loader = document.getElementById('loader');
    document.body.classList.remove('loading');
    if (loader) { loader.classList.add('done'); setTimeout(function () { loader.style.display = 'none'; }, 850); }
  }
  window.addEventListener('load', function () { setTimeout(hideLoader, 480); });
  setTimeout(hideLoader, 2600);

  document.addEventListener('DOMContentLoaded', function () {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Références + valeurs mises en cache (anti layout-thrash) ---------- */
    var header = document.getElementById('header');
    var progress = document.getElementById('progress');
    var hero = document.querySelector('.hero');
    var heroBase = document.querySelector('.hero-base');
    var heroTitle = document.querySelector('.hero-title');
    var bandImg = document.querySelector('.band img');
    var footMega = document.querySelector('.footer-mega');
    var track = document.getElementById('marquee');
    var sLight = document.getElementById('sentinel-light');
    var sDark = document.getElementById('sentinel-dark');
    var menu = document.getElementById('mobileMenu');
    var burger = document.getElementById('burger');
    var lenis = null;

    var vh = window.innerHeight, docH = 0, heroH = 800;
    var bandTop = 0, bandH = 0, footTop = 0, footH = 0, marqHalf = 0;
    var marqX = 0, marqBase = 0.55, marqMult = 1, marqLastY = window.scrollY, marqPaused = false;

    // duplication marquee AVANT de mesurer sa largeur
    if (track) {
      track.innerHTML = track.innerHTML + track.innerHTML;
      if (canMotion) track.style.animation = 'none'; // piloté en JS (vélocité)
    }

    function measure() {
      vh = window.innerHeight;
      docH = document.documentElement.scrollHeight - vh;
      heroH = hero ? hero.offsetHeight : 800;
      if (bandImg) { var b = bandImg.getBoundingClientRect(); bandTop = b.top + window.scrollY; bandH = b.height; }
      if (footMega) { var f = footMega.getBoundingClientRect(); footTop = f.top + window.scrollY; footH = f.height; }
      if (track) marqHalf = track.scrollWidth / 2;
    }
    measure();

    /* ---------- Header scrolled + barre de progression (scaleX, composité) ---------- */
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle('scrolled', y > 24);
      if (progress) progress.style.transform = 'scaleX(' + (docH > 0 ? Math.min(y / docH, 1) : 0) + ')';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Assignation des animations ---------- */
    function tag(sel, anim, mod) {
      [].slice.call(document.querySelectorAll(sel)).forEach(function (el, i) {
        el.setAttribute('data-anim', anim);
        el.style.setProperty('--i', mod ? (i % mod) : i);
      });
    }
    tag('.svc-card', 'float-in', 3);
    tag('.proj', 'float-in', 3);
    tag('.feat', 'float-in', 4);
    tag('.agence', 'float-in', 3);
    tag('.intro-stats .st', 'float-in', 4);
    tag('.c-item', 'float-in', 3);
    tag('.pstep', 'rise-soft', 4);
    [].slice.call(document.querySelectorAll('.svc-card .im img, .proj img, .band img')).forEach(function (el) {
      el.setAttribute('data-anim', 'focus');
    });
    [].slice.call(document.querySelectorAll('.zchip')).forEach(function (el, i) {
      el.setAttribute('data-anim', 'rise-soft'); el.style.setProperty('--i', i % 6);
    });

    /* ---------- Split-text par mots (titres + citation) ---------- */
    function splitWords(el) {
      var counter = { n: 0 };
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var words = child.textContent.split(/\s+/).filter(function (w) { return w.length; });
            if (!words.length) return;
            var frag = document.createDocumentFragment();
            words.forEach(function (w) {
              var sp = document.createElement('span'); sp.className = 'sword';
              var it = document.createElement('i'); it.textContent = w; it.style.setProperty('--si', counter.n++);
              sp.appendChild(it); frag.appendChild(sp);
              frag.appendChild(document.createTextNode(' ')); // espace réel : copier-coller + lecture écran OK
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && !child.classList.contains('sword')) {
            walk(child);
          }
        });
      })(el);
    }
    if (canMotion) {
      [].slice.call(document.querySelectorAll('.sec-head h2, .intro-grid h2, .contact-grid h2, .band blockquote'))
        .forEach(splitWords);
    }

    /* ---------- IO : reveals (one-shot) ---------- */
    var reveals = [].slice.call(document.querySelectorAll('.reveal,[data-anim],.sas,.process'));
    if (!canMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            var c = e.target.querySelector ? e.target.querySelector('[data-count]') : null;
            if (c) animateCount(c);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Compteurs ---------- */
    function animateCount(el) {
      if (el.dataset.done) return; el.dataset.done = '1';
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;
      if (prefersReduced) { el.textContent = target + suffix; return; }
      var dur = 1400, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      setTimeout(function () { el.textContent = target + suffix; }, dur + 300);
    }
    [].slice.call(document.querySelectorAll('[data-count]')).forEach(function (el) {
      setTimeout(function () { if (!el.dataset.done) animateCount(el); }, 2600);
    });

    /* ---------- Bascule de thème clair/sombre par sentinelles ---------- */
    function initTheme() {
      if (!sLight) return;
      var mid = window.innerHeight * 0.5;
      var lr = sLight.getBoundingClientRect();
      var dr = sDark ? sDark.getBoundingClientRect() : null;
      var light = lr.top < mid && !(dr && dr.top < mid);
      document.body.classList.toggle('theme-light', light);
    }
    if ('IntersectionObserver' in window && (sLight || sDark)) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var passed = e.boundingClientRect.top < window.innerHeight * 0.5;
          if (e.target === sLight) document.body.classList.toggle('theme-light', passed);
          if (e.target === sDark) {
            if (passed) document.body.classList.remove('theme-light');
            else if (sLight) document.body.classList.add('theme-light');
          }
        });
      }, { threshold: [0], rootMargin: '-50% 0px -50% 0px' });
      if (sLight) tio.observe(sLight);
      if (sDark) tio.observe(sDark);
    }
    initTheme();

    /* ---------- Menu mobile ---------- */
    var closeBtn = document.getElementById('mobileClose');
    function setMenu(open) {
      if (!menu) return;
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    }
    if (burger) burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
    if (menu) [].slice.call(menu.querySelectorAll('a')).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    /* ---------- Marquee : pause au survol (le pilotage JS court-circuite le :hover CSS) ---------- */
    if (track) {
      track.addEventListener('mouseenter', function () { marqPaused = true; });
      track.addEventListener('mouseleave', function () { marqPaused = false; });
    }

    /* ---------- Lenis (smooth scroll) ---------- */
    if (canMotion && window.Lenis) {
      try {
        lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return 1 - Math.pow(1 - t, 3); }, smoothWheel: true });
        document.documentElement.classList.add('lenis-on');
        document.documentElement.style.scrollBehavior = 'auto'; // évite le double smooth (CSS + Lenis)
      } catch (err) { lenis = null; }
    }

    /* ---------- Parallaxe + soufflerie (boucle rAF unique) ---------- */
    function parallaxTick(y) {
      if (!isDesktop) return;
      if (hero && heroTitle) {
        var hp = Math.min(Math.max(y / heroH, 0), 1);
        heroTitle.style.transform = 'translate(-50%,calc(-50% - ' + (hp * 48) + 'px))';
        heroTitle.style.opacity = '' + (1 - hp * 0.72);
        if (heroBase) heroBase.style.transform = 'translateY(' + (hp * 5) + '%) scale(1.02)';
      }
      if (bandImg && bandH) {
        var relB = ((bandTop - y) + bandH / 2 - vh / 2) / vh;
        bandImg.style.transform = 'translate3d(0,' + (relB * -7) + '%,0)';
      }
      if (footMega && footH) {
        var relF = ((footTop - y) + footH / 2 - vh / 2) / vh;
        footMega.style.transform = 'translateX(' + (relF * -3) + '%)';
      }
    }
    function resetParallax() {
      [heroTitle, heroBase, bandImg, footMega].forEach(function (el) { if (el) { el.style.transform = ''; } });
      if (heroTitle) heroTitle.style.opacity = '';
    }
    function marqueeTick(y) {
      if (!track || !marqHalf || !canMotion || marqPaused) return;
      var vel = Math.min(Math.abs(y - marqLastY) / 12, 1.6);
      marqMult += ((1 + vel) - marqMult) * 0.08;
      marqX -= marqBase * marqMult;
      if (marqX <= -marqHalf) marqX += marqHalf;
      track.style.transform = 'translate3d(' + marqX + 'px,0,0)';
      marqLastY = y;
    }
    var running = true, paraY = -1;
    function frame(t) {
      if (!running) return;
      if (lenis) lenis.raf(t);
      var y = window.scrollY;
      if (y !== paraY) { parallaxTick(y); paraY = y; }
      marqueeTick(y);
      requestAnimationFrame(frame);
    }
    if (canMotion) requestAnimationFrame(frame);
    // couper la boucle quand l'onglet n'est pas visible (batterie/CPU)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; }
      else if (canMotion && !running) { running = true; paraY = -1; marqLastY = window.scrollY; requestAnimationFrame(frame); }
    });

    /* ---------- Resize ---------- */
    window.addEventListener('resize', function () {
      isDesktop = checkDesktop();
      measure();
      if (!isDesktop) resetParallax();
    });
    // re-mesure quand tout est chargé (images = hauteurs définitives)
    window.addEventListener('load', function () { measure(); onScroll(); });

    /* ---------- Formulaire de contact ---------- */
    var form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        [].slice.call(form.querySelectorAll('[required]')).forEach(function (input) {
          var field = input.closest('.field');
          var ok = input.value.trim() !== '';
          if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
          if (field) field.classList.toggle('invalid', !ok);
          if (!ok) valid = false;
        });
        if (!valid) {
          var firstBad = form.querySelector('.field.invalid input, .field.invalid textarea, .field.invalid select');
          if (firstBad) firstBad.focus();
          return;
        }
        var success = document.getElementById('formSuccess');
        form.style.display = 'none';
        if (success) success.classList.add('show');
      });
      [].slice.call(form.querySelectorAll('input,textarea,select')).forEach(function (input) {
        input.addEventListener('input', function () {
          var field = input.closest('.field'); if (field) field.classList.remove('invalid');
        });
      });
    }

    /* ---------- Badge démo ---------- */
    var demoClose = document.getElementById('demoClose');
    if (demoClose) demoClose.addEventListener('click', function () {
      var b = document.getElementById('demoBadge'); if (b) b.style.display = 'none';
    });
  });
})();
