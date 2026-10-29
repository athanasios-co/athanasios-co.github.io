/* Subtle homepage motion. Animates only transform (translate/rotate) and opacity,
   each entrance runs once. Does nothing when the visitor prefers reduced motion. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('js-motion')) return;

  /* Smooth, quick scroll for same-page links (#section, #client-…) */
  function targetY(el) {
    var y = el.getBoundingClientRect().top + window.scrollY;
    if (el.id.indexOf('client-') === 0) {            /* centre a client card on its visible part */
      var last = el.querySelector('.client-tile') && el.querySelector('.client-tile').lastElementChild;
      if (last) {
        var bottom = last.getBoundingClientRect().bottom + window.scrollY + 16;
        return Math.max(0, (y + bottom) / 2 - window.innerHeight / 2);
      }
    }
    return Math.max(0, y - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0));
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href*="#"]');
    if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    ev.preventDefault();
    var from = window.scrollY, to = targetY(el), dist = to - from;
    var dur = Math.min(650, 300 + Math.abs(dist) * 0.12), t0 = null;   /* 0.3–0.65s depending on distance */
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, from + dist * e);
      if (p < 1) { requestAnimationFrame(step); return; }
      if (location.hash !== url.hash) {               /* update the address (keeps the card highlight) without a jump */
        location.hash = url.hash;
        window.scrollTo(0, to);
      }
    }
    requestAnimationFrame(step);
  });

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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    targets.forEach(function (el) { io.observe(el); });
    /* cards appear early (above); the icon drawing starts once the first card is fully on screen */
    var ioDraw = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.parentElement.classList.add('is-drawn'); ioDraw.unobserve(e.target); }
      });
    }, { threshold: 1 });
    document.querySelectorAll('.features > .icon-wrap:first-child').forEach(function (el) { ioDraw.observe(el); });
  } else {
    targets.forEach(reveal);
    document.querySelectorAll('.features').forEach(function (el) { el.classList.add('is-drawn'); });
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
