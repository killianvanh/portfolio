/* ================================================================
   HAMZI Sàrl — script commun (4 pages)
   Chaque module se désactive si ses éléments sont absents.
   ================================================================ */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- préloader (une fois par session) ---------- */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  if (reduceMotion || sessionStorage.getItem('hz-seen')) {
    loader.remove();
    document.body.classList.remove('loading');
    return;
  }
  sessionStorage.setItem('hz-seen', '1');
  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.remove('loading');
    setTimeout(() => loader.remove(), 900);
  }, 1450);
})();

/* ---------- transitions de pages (wipe) ---------- */
(function () {
  const wipe = document.getElementById('wipe');
  if (!wipe) return;
  /* arrivée : si on vient d'une page interne, on révèle */
  if (sessionStorage.getItem('hz-nav')) {
    sessionStorage.removeItem('hz-nav');
    wipe.classList.add('in');
    setTimeout(() => wipe.classList.remove('in'), 800);
  }
  if (reduceMotion) return;
  /* départ : wipe avant navigation interne */
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!/\.html(#.*)?$/.test(href) || a.target === '_blank') return;
    e.preventDefault();
    sessionStorage.setItem('hz-nav', '1');
    wipe.classList.add('out');
    setTimeout(() => { location.href = href; }, 430);
  });
})();

/* ---------- nav : état actif selon la page ---------- */
(function () {
  const here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav a, .mobile-menu a.mlink').forEach(a => {
    const href = a.getAttribute('href');
    if (href === here) a.classList.add('active');
  });
})();

/* ---------- header + barre de progression ---------- */
const header = document.getElementById('header');
const progress = document.getElementById('progress');
addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', scrollY > 24);
  if (progress) {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  }
}, { passive: true });

/* ---------- boutons magnétiques ---------- */
(function () {
  if (reduceMotion || !matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll('.btn-blue, .btn-white, .btn-glass').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ---------- tilt 3D léger sur les cartes ---------- */
(function () {
  if (reduceMotion || !matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll('.svc-card, .hstat, .pres-extra article').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - .5;
      const dy = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 5).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ---------- parallaxe hero landing (le mot glisse derrière le bâtiment) ---------- */
(function () {
  const hero = document.querySelector('.hero');
  const heroTitles = document.querySelectorAll('.hero-title');
  if (!hero || !heroTitles.length) return;
  let mx = 0, targetMx = 0, ticking = false;
  function renderHero() {
    ticking = false;
    const sy = Math.min(scrollY, hero.offsetHeight);
    mx += (targetMx - mx) * .08;
    const t = `translate(calc(-50% + ${mx.toFixed(1)}px), ${(sy * .30).toFixed(1)}px)`;
    heroTitles.forEach(el => { el.style.transform = t; });
    if (Math.abs(targetMx - mx) > .2) requestTick();
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(renderHero); } }
  if (reduceMotion) return;
  addEventListener('scroll', requestTick, { passive: true });
  if (matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('mousemove', e => {
      targetMx = ((e.clientX / innerWidth) - .5) * -16;
      requestTick();
    });
    hero.addEventListener('mouseleave', () => { targetMx = 0; requestTick(); });
  }
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
  }
  burger.addEventListener('click', () => setMenu(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
})();

/* ---------- titres révélés mot à mot ---------- */
function splitWords(el) {
  let n = 0;
  [...el.childNodes].forEach(node => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(tk => {
        if (/^\s+$/.test(tk) || tk === '') { frag.append(tk); return; }
        const w = document.createElement('span'); w.className = 'hw';
        const i = document.createElement('i'); i.textContent = tk;
        i.style.setProperty('--d', Math.min(n * 70, 700) + 'ms'); n++;
        w.append(i); frag.append(w);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === 1 && node.tagName !== 'BR') {
      const w = document.createElement('span'); w.className = 'hw';
      const i = document.createElement('i');
      node.replaceWith(w); i.append(node); w.append(i);
      i.style.setProperty('--d', Math.min(n * 70, 700) + 'ms'); n++;
    }
  });
}
if (!reduceMotion) {
  document.querySelectorAll('h2').forEach(h => {
    splitWords(h);
    if (!h.closest('.reveal')) h.classList.add('reveal');
  });
  const phh = document.querySelector('.page-hero h1');
  if (phh) { splitWords(phh); setTimeout(() => phh.classList.add('words-in'), 450); }
}

/* ---------- reveal on scroll + cascade dans les grilles ---------- */
document.querySelectorAll('.footer-grid > div').forEach(d => d.classList.add('reveal'));
['.svc-cards', '.tmo-grid', '.gal-grid', '.comp-list', '.accroche .wrap', '.strip', '.pres-extra', '.svc-rows', '.method-grid', '.chips-zone', '.proj-grid', '.footer-grid'].forEach(sel => {
  document.querySelectorAll(sel).forEach(group => {
    [...group.children].forEach((el, i) => {
      if (el.classList.contains('reveal')) el.style.transitionDelay = Math.min(i * 90, 420) + 'ms';
    });
  });
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- accroche : texte révélé mot à mot au scroll ---------- */
(function () {
  const paras = document.querySelectorAll('.accroche p');
  if (!paras.length || reduceMotion) return;
  paras.forEach(p => {
    [...p.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(tk => {
          if (/^\s+$/.test(tk) || tk === '') { frag.append(tk); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = tk;
          frag.append(s);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1) {
        node.classList.add('w');
      }
    });
  });
  const words = [...document.querySelectorAll('.accroche .w')];
  function litWords() {
    const vh = innerHeight;
    words.forEach(w => {
      const r = w.getBoundingClientRect();
      w.classList.toggle('lit', r.top < vh * .72);
    });
  }
  addEventListener('scroll', () => requestAnimationFrame(litWords), { passive: true });
  litWords();
})();

/* ---------- méthode : segment ambre qui se dessine le long des étapes ---------- */
(function () {
  const track = document.querySelector('.method-track');
  if (!track) return;
  const mio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) { track.style.setProperty('--mp', '1'); mio.unobserve(track); }
    });
  }, { threshold: .4 });
  mio.observe(track);
})();

/* ---------- compteurs animés ---------- */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const cio = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      cio.unobserve(entry.target);
      const el = entry.target;
      const end = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = end + suffix; return; }
      const t0 = performance.now(), dur = 1300;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .6 });
  counters.forEach(el => cio.observe(el));
})();

/* ---------- sliders avant / après ---------- */
document.querySelectorAll('[data-ba]').forEach(ba => {
  const afterWrap = ba.querySelector('.after-wrap');
  const handle = ba.querySelector('.handle');
  let pos = 50, hinted = false;
  function render() {
    afterWrap.style.clipPath = `inset(0 0 0 ${pos}%)`;
    handle.style.left = pos + '%';
    ba.setAttribute('aria-valuenow', Math.round(pos));
  }
  function setFromX(clientX) {
    hinted = true;
    const r = ba.getBoundingClientRect();
    pos = Math.min(100, Math.max(0, (clientX - r.left) / r.width * 100));
    render();
  }
  ba.addEventListener('pointerdown', e => {
    ba.setPointerCapture(e.pointerId);
    setFromX(e.clientX);
    const move = ev => setFromX(ev.clientX);
    const up = () => { ba.removeEventListener('pointermove', move); ba.removeEventListener('pointerup', up); };
    ba.addEventListener('pointermove', move);
    ba.addEventListener('pointerup', up);
  });
  ba.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { hinted = true; pos = Math.max(0, pos - 5); render(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { hinted = true; pos = Math.min(100, pos + 5); render(); e.preventDefault(); }
  });
  render();
  /* transition d'entrée : le slider s'ouvre de l'avant vers l'après */
  if (!reduceMotion) {
    pos = 100; render();
    const hintIo = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        hintIo.unobserve(ba);
        if (hinted) return;
        const t0 = performance.now(), dur = 1400, from = 100, to = 50;
        (function open(now) {
          if (hinted) return;
          const p = Math.min((now - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          pos = from + (to - from) * e;
          render();
          if (p < 1) requestAnimationFrame(open);
        })(t0);
      });
    }, { threshold: .45 });
    hintIo.observe(ba);
  }
});

/* ---------- parallaxe douce sur les photos de sections ---------- */
(function () {
  if (reduceMotion) return;
  const els = document.querySelectorAll('.svc-row .im img, .pres-figure .ph-main, .page-hero img.bg');
  if (!els.length) return;
  els.forEach(img => {
    if (!img.classList.contains('bg')) img.style.transition = 'none';
  });
  let ticking = false;
  function plx() {
    ticking = false;
    const vh = innerHeight;
    els.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const c = (r.top + r.height / 2 - vh / 2) / vh;     /* -0.5 .. 0.5 env. */
      const isBg = img.classList.contains('bg');
      const amp = isBg ? 34 : 20;
      const y = (-c * amp).toFixed(1);
      img.style.transform = isBg ? `translateY(${y}px)` : `translateY(${y}px) scale(1.07)`;
    });
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(plx); } }, { passive: true });
  plx();
})();

/* ---------- formulaire devis multi-étapes ---------- */
(function () {
  const form = document.getElementById('devisForm');
  if (!form) return;
  const steps = [...form.querySelectorAll('.fstep')];
  const segs = [...form.querySelectorAll('.seg')];
  const stepLabel = document.getElementById('stepLabel');
  const btnNext = document.getElementById('btnNext');
  const btnBack = document.getElementById('btnBack');
  const fnav = document.getElementById('fnav');
  let current = 1;
  const TOTAL = 4;

  function showStep(n) {
    current = n;
    steps.forEach(s => s.classList.toggle('active', +s.dataset.step === n));
    segs.forEach((s, i) => {
      s.classList.toggle('done', i + 1 < n);
      s.classList.toggle('curr', i + 1 === n);
    });
    stepLabel.textContent = `Étape ${n} sur ${TOTAL}`;
    btnBack.hidden = n === 1;
    btnNext.innerHTML = n === TOTAL
      ? 'Envoyer votre demande <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>'
      : 'Continuer <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  }

  function validateStep(n) {
    if (n === 1) {
      const ok = !!form.querySelector('input[name="type"]:checked');
      document.getElementById('typeErr').style.display = ok ? 'none' : 'block';
      return ok;
    }
    if (n === 4) {
      let ok = true;
      const checks = {
        nom: v => v.trim().length >= 2,
        tel: v => /^[+0-9 ().\/-]{7,20}$/.test(v.trim()),
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      };
      for (const [name, test] of Object.entries(checks)) {
        const field = form.querySelector(`[data-f="${name}"]`);
        const input = field.querySelector('input');
        const valid = test(input.value);
        field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      }
      return ok;
    }
    return true;
  }

  btnNext.addEventListener('click', () => {
    if (!validateStep(current)) return;
    if (current < TOTAL) { showStep(current + 1); return; }
    submitDevis();
  });
  btnBack.addEventListener('click', () => { if (current > 1) showStep(current - 1); });

  function submitDevis() {
    const get = name => { const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; };
    const type = get('type');
    const piece = get('piece') || 'Non précisé';
    const surface = document.getElementById('surface').value;
    const photo = document.getElementById('photo').files[0];
    const nom = document.getElementById('nom').value.trim();
    const tel = document.getElementById('tel').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const body =
`Bonjour,

Je souhaite recevoir un devis gratuit.

— Type de travaux : ${type}
— Pièce / surface : ${piece}${surface ? ` (~${surface} m²)` : ''}
— Photo : ${photo ? photo.name + ' (jointe à cet email)' : 'aucune'}

— Nom : ${nom}
— Téléphone : ${tel}
— Email : ${email}
${message ? `
Message :
${message}
` : ''}
Envoyé depuis le site hamzi.ch`;

    location.href = `mailto:contact@hamzi.ch?subject=${encodeURIComponent('Demande de devis — ' + type)}&body=${encodeURIComponent(body)}`;

    steps.forEach(s => s.classList.remove('active'));
    fnav.style.display = 'none';
    stepLabel.textContent = 'Demande envoyée';
    segs.forEach(s => s.classList.add('done'));
    document.getElementById('photoReminder').style.display = photo ? 'block' : 'none';
    document.getElementById('formSuccess').classList.add('show');
  }

  /* upload */
  const uploadZone = document.getElementById('uploadZone');
  const photoInput = document.getElementById('photo');
  const fileName = document.getElementById('fileName');
  photoInput.addEventListener('change', () => {
    fileName.textContent = photoInput.files[0] ? '📎 ' + photoInput.files[0].name : '';
  });
  ['dragover', 'dragenter'].forEach(ev => uploadZone.addEventListener(ev, e => { e.preventDefault(); uploadZone.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev => uploadZone.addEventListener(ev, e => { e.preventDefault(); uploadZone.classList.remove('drag'); }));
  uploadZone.addEventListener('drop', e => {
    if (e.dataTransfer.files.length) { photoInput.files = e.dataTransfer.files; photoInput.dispatchEvent(new Event('change')); }
  });
})();

/* ---------- année footer ---------- */
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- carte Leaflet, marqueur Hamzi ---------- */
const HAMZI_POS = [46.42384, 6.25160];
function initMap() {
  const el = document.getElementById('leafletMap');
  if (!el) return;
  if (!window.L) {
    el.outerHTML = '<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=6.2416%2C46.4188%2C6.2616%2C46.4288&layer=mapnik&marker=46.42384%2C6.25160" title="Plan d\'accès — Hamzi Sàrl, Route de l\'Etraz 16, 1267 Vich" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>';
    return;
  }
  const map = L.map(el, { scrollWheelZoom: false }).setView(HAMZI_POS, 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const pin = L.divIcon({
    className: 'hz-pin',
    html: '<svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#5B7BD0" stroke="#F4F7FC" stroke-width="1.1" d="M12 1.8a7.2 7.2 0 0 0-7.2 7.2c0 5.4 7.2 13.2 7.2 13.2s7.2-7.8 7.2-13.2A7.2 7.2 0 0 0 12 1.8z"/><circle cx="12" cy="9" r="2.7" fill="#F4F7FC"/></svg>',
    iconSize: [44, 44], iconAnchor: [22, 42], popupAnchor: [0, -38]
  });
  L.marker(HAMZI_POS, { icon: pin, title: 'Hamzi Sàrl' }).addTo(map)
    .bindPopup('<b>Hamzi Sàrl</b><br>Route de l\'Etraz 16, 1267 Vich')
    .openPopup();
}
if (document.readyState === 'complete') initMap();
else window.addEventListener('load', initMap);
