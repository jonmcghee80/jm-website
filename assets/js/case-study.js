// Case study pages — menu, smooth scroll and scroll reveals.
// (The password check runs inline in <head> so nothing flashes before redirecting.)
(function() {
  var MOTION = {
    lenisLerp: 0.1,        // smooth scroll: lower = floatier, 1 = off
    revealThreshold: 0.15  // share of a block on screen before it fades up
  };

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = null;

  // ── Smooth scroll ──
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: MOTION.lenisLerp, smoothWheel: true, syncTouch: false });
    requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    });
  }

  // ── Menu ──
  var menuButton = document.querySelector('.menu-button');
  var menuOverlay = document.getElementById('site-menu');
  var menuClose = menuOverlay.querySelector('.menu-close');

  function setMenu(open) {
    if (open === menuOverlay.classList.contains('is-open')) return;
    if (open) alignClose();
    menuOverlay.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    (open ? menuClose : menuButton).focus({ preventScroll: true });
  }

  // the panel's × sits over the ☰ button, wherever the header puts it
  function alignClose() {
    var r = menuButton.getBoundingClientRect();
    root.style.setProperty('--menu-x', (root.clientWidth - (r.left + r.right) / 2) + 'px');
    root.style.setProperty('--menu-y', (r.top + window.scrollY + r.height / 2) + 'px');
  }
  alignClose();
  window.addEventListener('resize', alignClose);

  menuButton.addEventListener('click', function() { setMenu(true); });
  menuClose.addEventListener('click', function() { setMenu(false); });
  menuOverlay.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() { setMenu(false); });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') setMenu(false);
  });
  // the desktop panel floats over the page: a click outside it closes it
  document.addEventListener('click', function(e) {
    if (menuOverlay.classList.contains('is-open') && !menuOverlay.contains(e.target) && !menuButton.contains(e.target)) setMenu(false);
  });

  // ── Scroll reveals ──
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  var blocks = document.querySelectorAll('[data-reveal]');
  root.classList.add('motion');

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: MOTION.revealThreshold });

  blocks.forEach(function(el) { io.observe(el); });
})();
