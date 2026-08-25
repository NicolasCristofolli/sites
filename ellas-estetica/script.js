/* ============================================================
   ELLAS · script.js
   Lenis (smooth scroll) + GSAP/ScrollTrigger (revelações lentas)
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Sinaliza para o fallback do <head> que o JS assumiu o controle. */
  window.__ellasReady = true;

  /* Sem GSAP (CDN bloqueado) ou com movimento reduzido: mostra tudo. */
  if (!hasGSAP || reduced) {
    root.classList.add('no-motion');
    document.body.style.opacity = 1;
    var l = document.getElementById('loader');
    if (l) l.style.display = 'none';
    basicUI();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  /* ---------------------------------------------------------
     1. LENIS — smooth scroll acoplado ao ticker do GSAP
     --------------------------------------------------------- */
  var lenis = new Lenis({
    duration: 1.25,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    touchMultiplier: 1.6
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* ---------------------------------------------------------
     2. SPLIT DE LINHAS  (mantém <em> para os seletores do CSS)
     --------------------------------------------------------- */
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

    /* <em> originais viram invisíveis (os filhos já são <em>) */
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

    var lines = [], current = null, lastTop = null;
    words.forEach(function (w) {
      var top = Math.round(w.offsetTop);
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        current = [];
        lines.push(current);
        lastTop = top;
      }
      current.push(w);
    });

    el.innerHTML = '';
    var inners = [];
    lines.forEach(function (group) {
      var line = document.createElement('span');
      line.className = 'line';
      var inner = document.createElement('span');
      inner.className = 'line__inner';
      group.forEach(function (w, i) {
        if (i) inner.appendChild(document.createTextNode(' '));
        w.style.display = 'inline';
        inner.appendChild(w);
      });
      line.appendChild(inner);
      el.appendChild(line);
      inners.push(inner);
    });
    return inners;
  }

  /* ---------------------------------------------------------
     3. REVELAÇÕES
     --------------------------------------------------------- */
  var lineTargets = Array.prototype.slice.call(document.querySelectorAll('[data-lines]'));
  var heroTitle = document.querySelector('.hero__title');

  function buildLines() {
    lineTargets.forEach(function (el) {
      var inners = splitLines(el);
      el._inners = inners;
      /* y:0 zera o translateY(105%) que veio do CSS — sem isso o yPercent
         do GSAP soma ao valor herdado e a linha nunca volta ao lugar. */
      gsap.set(inners, { y: 0, yPercent: 105 });
      if (el === heroTitle) return;

      gsap.to(inners, {
        yPercent: 0,
        duration: 1.5,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
  }
  buildLines();

  /* fade-up genérico */
  Array.prototype.forEach.call(document.querySelectorAll('[data-anim="fade"]'), function (el) {
    if (el.closest('.hero')) return; /* o hero entra pela timeline de intro */
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      delay: parseFloat(el.dataset.delay || 0),
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* revelação de imagem por clip-path + escala */
  Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
    var media = el.querySelector('.media');
    var img = el.querySelector('img');
    if (!media) return;
    var delay = parseFloat(el.dataset.delay || 0);
    if (el.closest('.hero')) return;

    var tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      delay: delay
    });
    tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out' })
      .to(img, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
  });

  /* zoom suave no hover dos cards (GSAP, para não conflitar com a revelação) */
  if (fine) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-card]'), function (card) {
      var img = card.querySelector('img');
      if (!img) return;
      var zoom = gsap.quickTo(img, 'scale', { duration: 1.1, ease: 'power3.out' });
      card.addEventListener('mouseenter', function () { zoom(1.05); });
      card.addEventListener('mouseleave', function () { zoom(1); });
    });
  }

  /* parallax suave */
  Array.prototype.forEach.call(document.querySelectorAll('[data-parallax]'), function (el) {
    var amount = parseFloat(el.dataset.parallax) || 0.1;
    gsap.fromTo(el.querySelector('img'),
      { yPercent: -amount * 50 },
      {
        yPercent: amount * 50,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
  });

  /* ---------------------------------------------------------
     4. INTRO (loader → hero)
     --------------------------------------------------------- */
  var loader = document.getElementById('loader');

  var introDone = false;
  function intro() {
    if (introDone) return;
    introDone = true;
    var tl = gsap.timeline();

    tl.set(document.body, { opacity: 1 })
      .fromTo('.loader__mark, .loader__sub',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out' })
      .to('.loader__bar i', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.25)
      .to('.loader__inner', { opacity: 0, y: -14, duration: 0.7, ease: 'power2.in' }, '+=0.1')
      .to(loader, {
        yPercent: -100, duration: 1.15, ease: 'expo.inOut',
        onComplete: function () { loader.style.display = 'none'; }
      }, '-=0.2');

    /* hero */
    tl.to('.hero .eyebrow', { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, '-=0.75');

    if (heroTitle && heroTitle._inners) {
      tl.to(heroTitle._inners, { yPercent: 0, duration: 1.6, stagger: 0.1, ease: 'expo.out' }, '-=1.05');
    }

    tl.to('.hero__lead, .hero__actions', { opacity: 1, y: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out' }, '-=1.2')
      .to('.hero__figure .media', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out' }, '-=1.5')
      .to('.hero__figure img', { scale: 1, duration: 1.9, ease: 'expo.out' }, '<')
      .to('.hero__figureSmall .media', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out' }, '-=1.25')
      .to('.hero__figureSmall img', { scale: 1, duration: 1.7, ease: 'expo.out' }, '<')
      .to('.hero__bottom', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, '-=1.1');

    ScrollTrigger.refresh();
  }

  gsap.set('.hero__bottom', { opacity: 0, y: 20 });
  window.addEventListener('load', intro);
  /* rede de segurança caso o evento load demore demais */
  setTimeout(intro, 2600);

  /* ---------------------------------------------------------
     5. NAV — encolhe, esconde ao descer, volta ao subir
     --------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var lastY = 0;
  lenis.on('scroll', function (e) {
    var y = e.scroll;
    nav.classList.toggle('is-stuck', y > 40);
    if (!document.body.classList.contains('menu-open')) {
      nav.classList.toggle('is-hidden', y > lastY && y > 420);
    }
    lastY = y;
  });

  /* ---------------------------------------------------------
     6. MENU MOBILE
     --------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function toggleMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', function () {
    toggleMenu(!document.body.classList.contains('menu-open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) toggleMenu(false);
  });

  /* ---------------------------------------------------------
     7. ÂNCORAS via Lenis
     --------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (document.body.classList.contains('menu-open')) toggleMenu(false);
      lenis.scrollTo(target, { offset: -10, duration: 1.6 });
    });
  });

  /* ---------------------------------------------------------
     8. CURSOR + MAGNETISMO (só em ponteiro fino)
     --------------------------------------------------------- */
  if (fine) {
    var cursor = document.getElementById('cursor');
    var dotX = gsap.quickTo('.cursor__dot', 'x', { duration: 0.18, ease: 'power3' });
    var dotY = gsap.quickTo('.cursor__dot', 'y', { duration: 0.18, ease: 'power3' });
    var ringX = gsap.quickTo('.cursor__ring', 'x', { duration: 0.55, ease: 'power3' });
    var ringY = gsap.quickTo('.cursor__ring', 'y', { duration: 0.55, ease: 'power3' });

    window.addEventListener('mousemove', function (e) {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });

    Array.prototype.forEach.call(document.querySelectorAll('a, button, [data-card]'), function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-magnetic]'), function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,0.4)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,0.4)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.42);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------------------------------------------------------
     9. DEPOIMENTOS
     --------------------------------------------------------- */
  var voices = Array.prototype.slice.call(document.querySelectorAll('.voice'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.voices__dots button'));
  if (voices.length > 1) {
    var index = 0, timer;

    gsap.set(voices, { opacity: 0, y: 16 });
    gsap.set(voices[0], { opacity: 1, y: 0 });

    function go(next) {
      if (next === index) return;
      gsap.to(voices[index], { opacity: 0, y: -14, duration: 0.8, ease: 'power2.inOut' });
      gsap.fromTo(voices[next], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: 0.15 });
      voices[index].classList.remove('is-active');
      voices[next].classList.add('is-active');
      if (dots[index]) dots[index].classList.remove('is-active');
      if (dots[next]) dots[next].classList.add('is-active');
      index = next;
    }
    function cycle() { timer = setInterval(function () { go((index + 1) % voices.length); }, 6200); }
    function restart() { clearInterval(timer); cycle(); }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { go(i); restart(); });
    });
    cycle();
  }

  /* ---------------------------------------------------------
     10. RESIZE — re-divide as linhas sem perder o estado
     --------------------------------------------------------- */
  var lastW = window.innerWidth, rz;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (Math.abs(window.innerWidth - lastW) < 60) { ScrollTrigger.refresh(); return; }
      lastW = window.innerWidth;
      lineTargets.forEach(function (el) {
        var visible = el.getBoundingClientRect().top < window.innerHeight;
        var inners = splitLines(el);
        el._inners = inners;
        gsap.set(inners, { y: 0, yPercent: visible ? 0 : 105 });
        if (!visible) {
          gsap.to(inners, {
            yPercent: 0, duration: 1.5, stagger: 0.09, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          });
        }
      });
      ScrollTrigger.refresh();
    }, 260);
  });

  /* ---------------------------------------------------------
     11. MISC
     --------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     UI mínima quando não há GSAP / movimento reduzido
     --------------------------------------------------------- */
  function basicUI() {
    var b = document.getElementById('burger');
    var m = document.getElementById('menu');
    if (b && m) {
      b.addEventListener('click', function () {
        var open = !document.body.classList.contains('menu-open');
        document.body.classList.toggle('menu-open', open);
        b.setAttribute('aria-expanded', String(open));
        m.setAttribute('aria-hidden', String(!open));
      });
      Array.prototype.forEach.call(m.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
      });
    }
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }
})();
