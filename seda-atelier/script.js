/* ══════════════════════════════════════════════════════════════
   SEDA — movimento
   Princípio: tudo lento. Nada entra com pressa, nada salta.
   Duração base de 1.4s e um único easing em toda a página.
   ══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const doc   = document.documentElement;
  const EASE  = 'power2.out';
  const SLOW  = 1.5;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = window.gsap && window.ScrollTrigger;

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- menu (funciona com ou sem GSAP) ---------- */
  const burger = $('#burger');
  const menu   = $('#menu');
  let lenis = null;

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-x', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- saída de emergência: sem GSAP ou com movimento reduzido ---------- */
  const veil = $('#veil');
  if (!hasGSAP || reduce) {
    doc.classList.add('no-motion');
    veil.style.display = 'none';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- rolagem suave ---------- */
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.35,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // âncoras passam pelo Lenis, senão o salto nativo briga com o scrub
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: 0, duration: 1.8 });
      });
    });
  }

  /* ---------- quebra em palavras (mantém o <em> intacto) ---------- */
  const splitWords = (root) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const outer = document.createElement('span');
            outer.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(root);
    return $$('.w > span', root);
  };

  /* ---------- 01 · véu de entrada + abertura ---------- */
  const lines = $$('.open__title .line');
  lines.forEach(l => {
    const inner = document.createElement('span');
    inner.style.display = 'block';
    while (l.firstChild) inner.appendChild(l.firstChild);
    l.appendChild(inner);
    l.dataset.inner = '1';
    gsap.set(l, { opacity: 1 });
    gsap.set(inner, { yPercent: 112 });
  });

  const heroPlate = $('.open__plate');
  const heroImg   = $('.open__plate img');
  gsap.set(['.open .kick', '.open__say', '.cue'], { y: 26 });

  const intro = gsap.timeline({ delay: .25 });
  intro
    .to(veil, { opacity: 0, duration: 1.5, ease: 'power2.inOut',
                onComplete: () => veil.classList.add('is-gone') })
    .to('.open .kick', { opacity: 1, y: 0, duration: SLOW, ease: EASE }, '-=.9')
    .to($$('.open__title .line > span'), { yPercent: 0, duration: 1.8, ease: 'power3.out', stagger: .13 }, '-=1.25')
    .to(heroPlate, { clipPath: 'inset(0 0 0% 0)', duration: 2.1, ease: 'power2.inOut' }, '-=1.7')
    .to(heroImg, { scale: 1.06, duration: 2.4, ease: 'power2.out' }, '<')
    .to(['.open__say', '.cue'], { opacity: 1, y: 0, duration: SLOW, ease: EASE, stagger: .12 }, '-=1.5');

  /* ---------- 02 · aparições lentas na rolagem ---------- */
  $$('.rito--c figcaption > *').forEach(el => el.setAttribute('data-reveal', ''));

  $$('[data-reveal]').forEach(el => {
    gsap.set(el, { y: 34 });
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.6, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // os blocos de serviço sobem em cascata: rótulo → título → texto → lista
  $$('.rito__text').forEach(block => {
    const kids = Array.from(block.children);
    if (!kids.length) return;
    gsap.set(kids, { opacity: 0, y: 34 });
    gsap.to(kids, {
      opacity: 1, y: 0, duration: 1.6, ease: EASE, stagger: .14,
      scrollTrigger: { trigger: block, start: 'top 86%', once: true }
    });
  });

  const manifesto = $('[data-words]');
  if (manifesto) {
    const words = splitWords(manifesto);
    gsap.set(words, { yPercent: 105 });
    gsap.to(words, {
      opacity: 1, yPercent: 0, duration: 1.5, ease: 'power3.out', stagger: .045,
      scrollTrigger: { trigger: manifesto, start: 'top 78%', once: true }
    });
  }

  /* ---------- 03 · chapas: cortina + respiro de parallax ---------- */
  $$('[data-cover]').forEach(fig => {
    if (fig === heroPlate) return;
    const img = fig.querySelector('img');

    gsap.to(fig, {
      clipPath: 'inset(0 0 0% 0)', duration: 1.9, ease: 'power2.inOut',
      scrollTrigger: { trigger: fig, start: 'top 86%', once: true }
    });
    gsap.to(img, {
      scale: 1.08, duration: 2.2, ease: 'power2.out',
      scrollTrigger: { trigger: fig, start: 'top 86%', once: true }
    });
    // a escala de repouso (1.08) é o que dá margem para o deslocamento abaixo
    gsap.fromTo(img, { yPercent: -3.5 }, {
      yPercent: 3.5, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
    });
  });

  /* ---------- 04 · o fio entre os capítulos ---------- */
  $$('.thread span').forEach(line => {
    gsap.to(line, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: line.parentElement, start: 'top 92%', end: 'bottom 55%', scrub: .8 }
    });
  });

  /* ---------- 05 · índice lateral do ritual ---------- */
  const idx = $('.idx');
  if (idx) {
    ScrollTrigger.create({
      trigger: '.ritual',
      start: 'top 40%',
      end: 'bottom 65%',
      onToggle: self => gsap.to(idx, { opacity: self.isActive ? 1 : 0, duration: .9, ease: EASE })
    });
    // a panorâmica de ponta a ponta passa por baixo do índice: ele sai de cena
    ScrollTrigger.create({
      trigger: '#cilios', start: 'top 75%', end: 'bottom 40%',
      onToggle: self => idx.classList.toggle('is-hidden', self.isActive)
    });
    $$('.rito').forEach(rito => {
      const item = $(`.idx li[data-idx="${rito.id}"]`);
      if (!item) return;
      ScrollTrigger.create({
        trigger: rito, start: 'top 55%', end: 'bottom 45%',
        onToggle: self => item.classList.toggle('is-on', self.isActive)
      });
    });
  }

  /* ---------- 06 · a pausa ---------- */
  const pause = $('.pause');
  if (pause) {
    gsap.fromTo('.pause__plate img', { scale: 1.22 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: pause, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
    });
    gsap.fromTo('.pause__type', { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: pause, start: 'top 60%', end: 'top 5%', scrub: 1 }
    });
    gsap.to('.pause__script', {
      scale: 1.07, ease: 'none',
      scrollTrigger: { trigger: pause, start: 'top top', end: 'bottom top', scrub: 1.4 }
    });
  }

  /* ---------- 07 · cabeçalho que se recolhe ---------- */
  const head = $('#head');
  // start/end explícitos: um ScrollTrigger sem trigger só dispara onUpdate
  // dentro do próprio intervalo — 'max' faz o intervalo ser a página inteira
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      head.classList.toggle('is-solid', self.scroll() > 80);
      const down = self.direction === 1 && self.scroll() > 320 && !menu.classList.contains('is-open');
      head.classList.toggle('is-up', down);
    }
  });

  /* ---------- 08 · as fotos chegam depois: remedir ---------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  $$('img').forEach(img => {
    if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
