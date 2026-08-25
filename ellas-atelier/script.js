/* ═══════════════════════════════════════════════════════════
   ELLAS — script.js
   Lenis (rolagem suave) + GSAP/ScrollTrigger (revelações lentas,
   parallax por camada e troca de tema da nav).
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var okGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  window.__ellas = true;

  if (!okGSAP || reduced) { fallback(); return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  /* ── Lenis ───────────────────────────────────────────────── */
  var lenis = new Lenis({
    duration: 1.3,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    touchMultiplier: 1.7
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* ── Split de linhas (preserva <em> para os seletores do CSS) ── */
  function wrapWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) { if (n.nodeValue.trim()) nodes.push(n); }

    nodes.forEach(function (node) {
      var italic = !!(node.parentElement && node.parentElement.closest('em'));
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (chunk) {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement(italic ? 'em' : 'span');
        w.className = 'w';
        w.textContent = chunk;
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });

    Array.prototype.forEach.call(el.querySelectorAll('em'), function (em) {
      if (!em.classList.contains('w')) {
        while (em.firstChild) em.parentNode.insertBefore(em.firstChild, em);
        em.parentNode.removeChild(em);
      }
    });
  }

  function splitLines(el) {
    if (!el.dataset.orig) el.dataset.orig = el.innerHTML;
    el.innerHTML = el.dataset.orig;
    wrapWords(el);

    var words = Array.prototype.slice.call(el.querySelectorAll('.w'));
    if (!words.length) return [];

    var lines = [], cur = null, last = null;
    words.forEach(function (w) {
      var top = Math.round(w.offsetTop);
      if (last === null || Math.abs(top - last) > 4) { cur = []; lines.push(cur); last = top; }
      cur.push(w);
    });

    el.innerHTML = '';
    var inners = [];
    lines.forEach(function (group) {
      var line = document.createElement('span'); line.className = 'line';
      var inner = document.createElement('span'); inner.className = 'line__inner';
      group.forEach(function (w, i) {
        if (i) inner.appendChild(document.createTextNode(' '));
        w.style.display = 'inline';
        inner.appendChild(w);
      });
      inner.appendChild(document.createTextNode(' '));
      line.appendChild(inner);
      el.appendChild(line);
      inners.push(inner);
    });
    return inners;
  }

  var lineEls = Array.prototype.slice.call(document.querySelectorAll('[data-lines]'));
  var heroTitle = document.querySelector('.hero__title');

  function buildLines() {
    lineEls.forEach(function (el) {
      var inners = splitLines(el);
      el._inners = inners;
      /* y:0 anula o translateY(105%) herdado do CSS — sem isso o yPercent
         do GSAP soma ao valor lido e a linha nunca volta ao lugar. */
      gsap.set(inners, { y: 0, yPercent: 105 });
      if (el === heroTitle) return;
      gsap.to(inners, {
        yPercent: 0, duration: 1.6, stagger: 0.085, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  }
  buildLines();

  /* ── fade-up ─────────────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-anim]'), function (el) {
    if (el.closest('.hero')) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.4,
      delay: parseFloat(el.dataset.delay || 0), ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* ── camadas flutuantes: entrada + deriva em velocidades diferentes ── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-float]'), function (el) {
    var img = el.querySelector('img');
    var speed = parseFloat(el.dataset.speed || 0.1);
    var cover = el.matches('.det__media, .hero__media');

    if (img && !cover) {
      gsap.to(img, {
        opacity: 1, scale: 1, duration: 1.7, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    }

    var mover = cover ? img : el;
    var dist = cover ? 7 : Math.abs(speed) * 100;
    gsap.fromTo(mover,
      { yPercent: speed > 0 ? -dist : dist },
      {
        yPercent: speed > 0 ? dist : -dist, ease: 'none',
        scrollTrigger: { trigger: cover ? el.parentNode : el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
  });

  /* ── Hero: escala lenta da imagem + saída do título ──────── */
  var hero = document.querySelector('.hero');
  var heroImg = document.querySelector('.hero__media img');
  if (hero && heroImg) {
    gsap.fromTo(heroImg, { yPercent: -4 }, {
      yPercent: 6, scale: 1.06, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__type', {
      yPercent: -18, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ── Nav: tema claro/escuro + esconder ao descer ─────────── */
  var nav = document.getElementById('nav');
  Array.prototype.forEach.call(document.querySelectorAll('[data-nav="dark"]'), function (sec) {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 60px', end: 'bottom 60px',
      onEnter: function () { nav.classList.add('is-dark'); },
      onEnterBack: function () { nav.classList.add('is-dark'); },
      onLeave: function () { nav.classList.remove('is-dark'); },
      onLeaveBack: function () { nav.classList.remove('is-dark'); }
    });
  });

  var lastY = 0;
  lenis.on('scroll', function (e) {
    var y = e.scroll;
    nav.classList.toggle('is-solid', y > 60 && !nav.classList.contains('is-dark'));
    if (!document.body.classList.contains('nav-open')) {
      nav.classList.toggle('is-up', y > lastY && y > 480);
    }
    lastY = y;
  });

  /* ── Menu ────────────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function toggleMenu(open) {
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', String(!open));
    open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', function () { toggleMenu(!document.body.classList.contains('nav-open')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) toggleMenu(false);
  });

  /* ── Âncoras ─────────────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (document.body.classList.contains('nav-open')) toggleMenu(false);
      lenis.scrollTo(t, { offset: 0, duration: 1.7 });
    });
  });

  /* ── Acordeão ────────────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('.qa'), function (qa) {
    var btn = qa.querySelector('.qa__q');
    var panel = qa.querySelector('.qa__a');
    btn.addEventListener('click', function () {
      var open = qa.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      gsap.to(panel, {
        height: open ? 'auto' : 0,
        duration: 0.75, ease: 'expo.out',
        onComplete: function () { ScrollTrigger.refresh(); }
      });
    });
  });

  /* ── Cursor + magnetismo ─────────────────────────────────── */
  if (fine) {
    var cursor = document.getElementById('cursor');
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    var cs = gsap.quickTo(cursor, 'scale', { duration: 0.4, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); });
    Array.prototype.forEach.call(document.querySelectorAll('a, button'), function (el) {
      el.addEventListener('mouseenter', function () { cs(3.4); });
      el.addEventListener('mouseleave', function () { cs(1); });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-magnetic]'), function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1,0.45)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1,0.45)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ── Abertura ────────────────────────────────────────────── */
  var pre = document.getElementById('pre');
  var opened = false;

  function open() {
    if (opened) return;
    opened = true;
    var tl = gsap.timeline();

    tl.set(document.body, { opacity: 1 })
      .fromTo('.pre__word', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' })
      .to('.pre__rule i', { scaleX: 1, duration: 1.15, ease: 'power2.inOut' }, 0.2)
      .to('.pre__word', { opacity: 0, y: -12, duration: 0.6, ease: 'power2.in' }, '+=0.05')
      .to(pre, {
        yPercent: -100, duration: 1.2, ease: 'expo.inOut',
        onComplete: function () { pre.style.display = 'none'; }
      }, '-=0.25');

    tl.fromTo(heroImg, { scale: 1.16 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, '-=1.05');

    if (heroTitle && heroTitle._inners) {
      tl.to(heroTitle._inners, { yPercent: 0, duration: 1.7, stagger: 0.1, ease: 'expo.out' }, '-=2.05');
    }
    tl.to('.hero__foot [data-anim]', { opacity: 1, y: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out' }, '-=1.5')
      .fromTo('.cue', { opacity: 0 }, { opacity: 1, duration: 1 }, '<');

    ScrollTrigger.refresh();
  }

  window.addEventListener('load', open);
  setTimeout(open, 2800);

  /* ── Resize: refaz as linhas sem perder o estado ─────────── */
  var lastW = window.innerWidth, rz;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (Math.abs(window.innerWidth - lastW) < 60) { ScrollTrigger.refresh(); return; }
      lastW = window.innerWidth;
      lineEls.forEach(function (el) {
        var seen = el.getBoundingClientRect().top < window.innerHeight;
        var inners = splitLines(el);
        el._inners = inners;
        gsap.set(inners, { y: 0, yPercent: seen ? 0 : 105 });
        if (!seen) {
          gsap.to(inners, {
            yPercent: 0, duration: 1.6, stagger: 0.085, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 86%', once: true }
          });
        }
      });
      ScrollTrigger.refresh();
    }, 250);
  });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ── Sem GSAP / movimento reduzido ───────────────────────── */
  function fallback() {
    root.classList.add('no-motion');
    document.body.style.opacity = 1;
    var p = document.getElementById('pre');
    if (p) p.style.display = 'none';

    var b = document.getElementById('burger'), m = document.getElementById('menu');
    if (b && m) {
      b.addEventListener('click', function () {
        var open = !document.body.classList.contains('nav-open');
        document.body.classList.toggle('nav-open', open);
        b.setAttribute('aria-expanded', String(open));
        m.setAttribute('aria-hidden', String(!open));
      });
      Array.prototype.forEach.call(m.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.qa'), function (qa) {
      var btn = qa.querySelector('.qa__q');
      btn.addEventListener('click', function () {
        var open = qa.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
    var y = document.getElementById('ano');
    if (y) y.textContent = new Date().getFullYear();
  }
})();
