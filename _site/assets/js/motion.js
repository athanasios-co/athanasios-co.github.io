/* Subtle homepage motion. Animates only transform (translate/rotate) and opacity,
   each entrance runs once. Does nothing when the visitor prefers reduced motion. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('js-motion')) return;

  /* 6. icons draw: normalise each path length to 1 so CSS can draw it */
  document.querySelectorAll('.features .heroicon path').forEach(function (p) {
    p.setAttribute('pathLength', '1');
  });

  /* 7. client tabs: give each a stagger index */
  document.querySelectorAll('.client-grid > li').forEach(function (li, i) {
    li.style.setProperty('--deal-i', i);
  });

  /* Entrances (3, 5, 6, 7, 9): add .is-in once, then stop watching */
  var targets = document.querySelectorAll('.cta, .client-grid');
  var reveal = function (el) { el.classList.add('is-in'); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    targets.forEach(function (el) { io.observe(el); });
    /* icon cards wait until the whole row is on screen, so the drawing is seen from the start */
    var ioCards = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        /* need 85% of the row visible, or as much as fits on a short phone screen */
        var need = Math.min(0.85, (window.innerHeight * 0.7) / e.boundingClientRect.height);
        if (e.isIntersecting && e.intersectionRatio >= need) { reveal(e.target); ioCards.unobserve(e.target); }
      });
    }, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .85, .9, 1] });
    document.querySelectorAll('.features').forEach(function (el) { ioCards.observe(el); });
  } else {
    targets.forEach(reveal);
    document.querySelectorAll('.features').forEach(reveal);
  }

  /* 4. blob drift: small scroll-linked offset */
  /* plain brick blobs only, none in the KPI section (blurred glass is costly to move) */
  var blobs = Array.prototype.filter.call(
    document.querySelectorAll('.blobbed.style-brick:not(.hero-blob)'),
    function (el) { return !el.closest('.bleed-host'); });
  if (!blobs.length) return;
  var ticking = false;
  var clamp = function (v, m) { return Math.max(-m, Math.min(m, v)); };

  function update() {
    ticking = false;
    var vh = window.innerHeight, mid = vh / 2;
    blobs.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = (r.top + r.height / 2) - mid;          /* distance from screen centre */
      el.style.setProperty('--drift', clamp(-d * 0.14, 55).toFixed(1) + 'px');
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
