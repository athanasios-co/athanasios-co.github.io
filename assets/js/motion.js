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
  var targets = document.querySelectorAll('.cta, .features, .client-grid');
  var reveal = function (el) { el.classList.add('is-in'); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(reveal);
  }

  /* 4. blob drift + 8. phone tilt: small scroll-linked offsets */
  var blobs = document.querySelectorAll('.blobbed:not(.hero-blob)');
  var band = document.querySelector('.client-band');
  var ticking = false;
  var clamp = function (v, m) { return Math.max(-m, Math.min(m, v)); };

  function update() {
    ticking = false;
    var vh = window.innerHeight, mid = vh / 2;
    blobs.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = (r.top + r.height / 2) - mid;          /* distance from screen centre */
      el.style.setProperty('--drift', clamp(-d * 0.06, 25).toFixed(1) + 'px');
    });
    if (band) {
      var b = band.getBoundingClientRect();
      if (b.bottom > 0 && b.top < vh) {
        var t = ((b.top + b.height / 2) - mid) / vh;  /* about -1..1 */
        band.style.setProperty('--tilt', clamp(t * 5, 4).toFixed(2) + 'deg');
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
