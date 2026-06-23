/* ================================================================
   Le Roy Architectes — ouverture cinématique d'un projet
   Uniquement sur projets.html. Plein écran (shared-element FLIP).
   Overlay ajouté directement au <body> (jamais dans un ancêtre transformé)
   pour que position:fixed reste collé au viewport. Aucun pin -> aucun vide.
   ================================================================ */
(function () {
  if (!document.querySelector('[data-proj]')) return;   // rien à ouvrir : on ne s'installe pas
  var body = document.body;
  var layer = document.createElement('div');
  layer.id = 'winLayer';
  layer.className = 'winlayer';
  layer.innerHTML = '<div class="win-backdrop"></div><div class="win-shell" role="dialog" aria-modal="true" aria-label="Projet"></div>';
  body.appendChild(layer);
  var shell = layer.querySelector('.win-shell');
  var isOpen = false, lastFocus = null, closeTimer = null;

  function sizeLayer() { layer.style.width = window.innerWidth + 'px'; layer.style.height = window.innerHeight + 'px'; }
  function openShell() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    sizeLayer();
    layer.style.display = 'block';
    void layer.offsetWidth; // reflow → transition
    layer.classList.add('on');
    isOpen = true;
    body.classList.add('win-locked');
  }
  function closeWin() {
    if (!isOpen) return;
    isOpen = false;
    layer.classList.remove('on');
    body.classList.remove('win-locked');
    closeTimer = setTimeout(function () {
      if (!isOpen) { layer.style.display = 'none'; layer.classList.remove('proj'); shell.innerHTML = ''; shell.className = 'win-shell'; }
    }, 520);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function focusClose() { var b = shell.querySelector('.win-close'); if (b) { try { b.focus(); } catch (e) {} } }

  /* ---- PROJET cinématique ---- */
  function openProj(id, sourceImg) {
    var list = (window.LR && window.LR.projets) || [];
    var p = null;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { p = list[i]; break; } }
    if (!p) return;
    lastFocus = document.activeElement;
    clearFlyers();
    var shots = '';
    for (var j = 1; j < p.images.length; j++) {
      shots += '<figure class="wp-shot"><img src="assets/' + p.images[j] + '" alt="' + p.title + ' — vue ' + (j + 1) + '" loading="lazy"></figure>';
    }
    shell.className = 'win-shell win-proj';
    shell.setAttribute('aria-label', p.title);
    shell.innerHTML =
      '<button class="win-close win-close-proj" aria-label="Fermer le projet">✕</button>' +
      '<div class="wp-scroll">' +
        '<figure class="wp-hero"><img src="assets/' + p.images[0] + '" alt="' + p.title + '"></figure>' +
        '<header class="wp-head">' +
          (p.tag ? '<span class="wp-tag">' + p.tag + '</span>' : '') +
          '<h2 class="wp-title">' + p.title + '</h2>' +
          '<p class="wp-meta">' + p.place + (p.year ? ' &middot; ' + p.year : '') + '</p>' +
          '<p class="wp-caption">' + p.caption + '</p>' +
        '</header>' +
        (shots ? '<div class="wp-gallery">' + shots + '</div>' : '') +
      '</div>';
    layer.classList.add('proj');
    openShell();
    flip(sourceImg, shell.querySelector('.wp-hero img'));
    focusClose();
  }

  /* shared-element : la cover de la carte se déploie vers la 1re photo plein écran.
     Filet de sécurité : l'image hero est TOUJOURS révélée (onComplete + timeout),
     jamais bloquée en opacity:0 même si l'animation ne se termine pas. */
  function clearFlyers() { var fs = document.querySelectorAll('.win-flyer'); for (var k = 0; k < fs.length; k++) fs[k].remove(); }
  function flip(fromImg, toImg) {
    function reveal() { if (toImg) toImg.style.opacity = '1'; clearFlyers(); }
    if (!fromImg || !toImg || !window.gsap) { reveal(); return; }
    var a = fromImg.getBoundingClientRect();
    if (!a.width) { reveal(); return; }
    requestAnimationFrame(function () {
      var b = toImg.getBoundingClientRect();
      if (!b.width) { reveal(); return; }
      var flyer = fromImg.cloneNode(true);
      flyer.removeAttribute('loading');
      flyer.className = 'win-flyer';
      flyer.style.cssText = 'position:fixed;z-index:60;margin:0;object-fit:cover;left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px';
      body.appendChild(flyer);
      toImg.style.opacity = '0';
      var done = false;
      function finish() { if (done) return; done = true; if (toImg) toImg.style.opacity = '1'; clearFlyers(); }
      window.gsap.to(flyer, {
        left: b.left, top: b.top, width: b.width, height: b.height, duration: 0.62, ease: 'power3.inOut',
        onComplete: finish
      });
      setTimeout(finish, 1100); // failsafe : l'image apparaît même si onComplete ne se déclenche pas
    });
  }

  /* ---- délégation d'événements ---- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var close = t.closest('.win-close');
    if (close) { e.preventDefault(); closeWin(); return; }
    if (t.classList && t.classList.contains('win-backdrop')) { closeWin(); return; }
    var pc = t.closest('[data-proj]');
    if (pc) { e.preventDefault(); openProj(pc.getAttribute('data-proj'), pc.querySelector('img')); return; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) { closeWin(); return; }
    // ouverture d'un projet au clavier (Entrée / Espace) — accessibilité
    if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) {
      var pc = e.target && e.target.closest ? e.target.closest('[data-proj]') : null;
      if (pc) { e.preventDefault(); openProj(pc.getAttribute('data-proj'), pc.querySelector('img')); }
    }
  });
  window.addEventListener('resize', function () { if (isOpen) sizeLayer(); });
})();
