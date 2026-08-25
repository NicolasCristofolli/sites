/* ═══════════════════════════════════════════════════════════════
   BUNNY BEAR LANGUAGE IMMERSION — camada de movimento
   GSAP + ScrollTrigger + Lenis
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const HAS_GSAP  = typeof window.gsap !== 'undefined';
  const HAS_ST    = HAS_GSAP && typeof window.ScrollTrigger !== 'undefined';
  const HAS_LENIS = typeof window.Lenis !== 'undefined';
  const REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE      = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* Toca uma vez e permanece. Deliberadamente NÃO usamos `once: true`: um
     ScrollTrigger morto não é reposto por ScrollTrigger.refresh(), que reverte
     tweens `fromTo` ao estado inicial e os deixa presos lá. */
  const PLAY_ONCE = 'play none none none';

  /* revelações registradas, para restaurar depois de um refresh */
  const revealTweens = [];

  function reveal(target, from, to) {
    to.onComplete = function () { this.__played = true; };
    const tw = gsap.fromTo(target, from, to);
    revealTweens.push(tw);
    return tw;
  }
  function track(tl) {
    tl.eventCallback('onComplete', function () { this.__played = true; });
    revealTweens.push(tl);
    return tl;
  }

  /* ─────────────────────────────────────────────
     0 · Rede de segurança
     ───────────────────────────────────────────── */
  function unlockAll() {
    document.documentElement.classList.remove('js');
    $$('[data-rev], .ln > i').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    $$('.shot-clip').forEach(el => { el.style.clipPath = 'none'; });
    $$('.circled svg path, .loop-svg path').forEach(el => {
      el.style.strokeDasharray = 'none'; el.style.strokeDashoffset = '0';
    });
  }

  /* ─────────────────────────────────────────────
     1 · Preloader
     ───────────────────────────────────────────── */
  const pre = $('#pre'), preBar = $('#preBar');
  let booted = false;

  function boot() {
    if (booted) return;
    booted = true;
    if (preBar) preBar.style.width = '100%';
    document.body.classList.add('ready');
    setTimeout(() => { if (pre) pre.style.display = 'none'; }, 1350);
    start();
  }

  /* Só medimos o layout depois que fontes e imagens assentaram: assim os
     ScrollTriggers nascem nas posições certas e nenhum refresh tardio
     precisa desfazer animações já tocadas. */
  function pageSettled() {
    const loaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(r => window.addEventListener('load', r, { once: true }));
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    return Promise.race([Promise.all([loaded, fonts]), new Promise(r => setTimeout(r, 4800))]);
  }

  (function loading() {
    if (!pre) { pageSettled().then(boot); return; }
    let n = 0, settled = false;
    pageSettled().then(() => { settled = true; });
    const tick = () => {
      if (booted) return;
      const ceiling = settled ? 100 : 92;
      n = Math.min(ceiling, n + (n < 70 ? 3 + Math.random() * 8 : 1 + Math.random() * 2.6));
      if (preBar) preBar.style.width = n + '%';
      if (n < 100) setTimeout(tick, 55 + Math.random() * 70);
      else setTimeout(boot, 280);
    };
    setTimeout(tick, 200);
    setTimeout(boot, 7000); // trava de segurança
  })();

  /* ─────────────────────────────────────────────
     2 · Motor
     ───────────────────────────────────────────── */
  function start() {
    const yr = $('#yr');
    if (yr) yr.textContent = new Date().getFullYear();

    ui();

    if (!HAS_GSAP || !HAS_ST || REDUCED) { unlockAll(); return; }

    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out' });

    smoothScroll();
    lineReveals();
    fadeReveals();
    photoReveals();
    drawings();
    floaters();
    counters();
    ticker();
    peekPreview();
    scrollSpy();
    magnets();
    cursor();

    ScrollTrigger.refresh();

    ScrollTrigger.addEventListener('refresh', () => {
      revealTweens.forEach(t => {
        if (t.__played) { t.progress(1, true); return; }
        const st = t.scrollTrigger;
        if (st && st.progress > 0 && t.progress() === 0) t.play();
      });
    });
  }

  /* ─────────────────────────────────────────────
     3 · Lenis ↔ GSAP
     ───────────────────────────────────────────── */
  let lenis = null;

  function smoothScroll() {
    if (!HAS_LENIS) { $$('a[href^="#"]').forEach(a => a.addEventListener('click', closeDrawer)); return; }

    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6, syncTouch: false
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeDrawer();
        lenis.scrollTo(target, { offset: -74, duration: 1.4 });
      });
    });
  }

  /* ─────────────────────────────────────────────
     4 · Títulos, linha a linha
     ───────────────────────────────────────────── */
  function lineReveals() {
    $$('.ln').forEach(line => {
      const inner = line.querySelector('i');
      if (!inner) return;
      /* `y: 0` nos dois lados é obrigatório. O estado pré-GSAP é
         translateY(105%); ao ler esse transform o GSAP converte para `y` em
         PIXELS e passaria a animar só o `yPercent` por cima — a linha
         terminaria deslocada e invisível para sempre. */
      reveal(inner,
        { yPercent: 105, y: 0 },
        {
          yPercent: 0, y: 0, duration: 1.15, ease: 'expo.out',
          delay: lineDelay(line),
          scrollTrigger: { trigger: line, start: 'top 92%', toggleActions: PLAY_ONCE }
        }
      );
    });
  }

  function lineDelay(line) {
    const sib = Array.from(line.parentElement.children).filter(el => el.classList.contains('ln'));
    return Math.max(0, sib.indexOf(line)) * 0.085;
  }

  /* ─────────────────────────────────────────────
     5 · Revelações simples, com cascata em grupos
     ───────────────────────────────────────────── */
  const GROUPS = '.mani-stats, .day-list, .turma-grid, .mes-list, .notes, .tickets, .doors';

  function fadeReveals() {
    $$('[data-rev]').forEach(el => {
      const group = el.parentElement && el.parentElement.matches(GROUPS) ? el.parentElement : null;
      const i = group ? Array.from(group.children).indexOf(el) : 0;
      reveal(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: i * 0.085,
          scrollTrigger: { trigger: group || el, start: 'top 90%', toggleActions: PLAY_ONCE }
        }
      );
    });
  }

  /* ─────────────────────────────────────────────
     6 · Fotos: cortina + zoom-out
     ───────────────────────────────────────────── */
  function photoReveals() {
    $$('[data-rev-img]').forEach(fig => {
      const clip = fig.querySelector('.shot-clip');
      const img  = fig.querySelector('img');
      if (!clip) return;
      const tl = track(gsap.timeline({
        scrollTrigger: { trigger: fig, start: 'top 86%', toggleActions: PLAY_ONCE }
      }));
      tl.fromTo(clip, { clipPath: 'inset(0% 0% 100% 0%)' },
                      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' });
      // `scale` não conflita com o `y` usado no parallax
      if (img) tl.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.08);
    });
  }

  /* ─────────────────────────────────────────────
     7 · Traços desenhados à mão
     ───────────────────────────────────────────── */
  function drawings() {
    const circled = $('.circled svg path');
    if (circled) {
      reveal(circled, { strokeDashoffset: 900 }, {
        strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', delay: .75,
        scrollTrigger: { trigger: '.circled', start: 'top 95%', toggleActions: PLAY_ONCE }
      });
    }
    const loop = $$('.loop-svg path');
    if (loop.length) {
      reveal(loop, { strokeDashoffset: 400 }, {
        strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .12,
        scrollTrigger: { trigger: '.loop-mid', start: 'top 88%', toggleActions: PLAY_ONCE }
      });
    }
  }

  /* ─────────────────────────────────────────────
     8 · Flutuação das polaroids (parallax leve)
     ───────────────────────────────────────────── */
  function floaters() {
    gsap.matchMedia().add('(min-width: 721px)', () => {
      $$('[data-float]').forEach((el, i) => {
        const amt = parseFloat(el.dataset.float) || 0.1;
        gsap.to(el, {
          y: () => amt * -170,
          rotation: (i % 2 ? 1.6 : -1.8),
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') || el,
            start: 'top bottom', end: 'bottom top', scrub: 1.1
          }
        });
      });
    });
  }

  /* ─────────────────────────────────────────────
     9 · Contadores
     ───────────────────────────────────────────── */
  function counters() {
    $$('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: PLAY_ONCE },
        onUpdate() { el.textContent = Math.round(obj.v) + suffix; },
        onComplete() { el.textContent = target + suffix; }
      });
    });
  }

  /* ─────────────────────────────────────────────
     10 · Faixa infinita reagindo à velocidade do scroll
     ───────────────────────────────────────────── */
  function ticker() {
    const track = $('#ticker');
    if (!track) return;

    const loopW = () => track.scrollWidth / 3;
    const tween = gsap.to(track, {
      x: () => -loopW(), duration: 26, ease: 'none', repeat: -1,
      modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % loopW()) }
    });

    let current = 1, idle;
    ScrollTrigger.create({
      onUpdate(self) {
        current = self.direction * (1 + Math.min(Math.abs(self.getVelocity()) / 900, 5));
        gsap.to(tween, { timeScale: current, duration: .5, overwrite: true });
      }
    });
    window.addEventListener('scroll', () => {
      clearTimeout(idle);
      idle = setTimeout(() => gsap.to(tween, { timeScale: Math.sign(current) || 1, duration: .9 }), 180);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     11 · Preview flutuante no índice da Box
     ───────────────────────────────────────────── */
  function peekPreview() {
    if (!FINE) return;
    const peek = $('#peek'), img = $('#peekImg'), rows = $$('.idx-row');
    if (!peek || !img || !rows.length) return;

    // tudo pelo GSAP: a CSS não escreve transform no .peek, então não brigam
    gsap.set(peek, { xPercent: -50, yPercent: -50, scale: .86, rotate: -6, opacity: 0 });
    const xTo = gsap.quickTo(peek, 'x', { duration: .7, ease: 'power3' });
    const yTo = gsap.quickTo(peek, 'y', { duration: .7, ease: 'power3' });

    rows.forEach(row => {
      row.addEventListener('mouseenter', e => {
        if (img.src !== row.dataset.img) img.src = row.dataset.img;
        xTo(e.clientX, e.clientX); yTo(e.clientY, e.clientY);
        gsap.to(peek, { opacity: 1, scale: 1, rotate: -3, duration: .5, ease: 'power3.out' });
      });
      row.addEventListener('mouseleave', () => {
        gsap.to(peek, { opacity: 0, scale: .9, rotate: -6, duration: .32 });
      });
      row.addEventListener('mousemove', e => { xTo(e.clientX); yTo(e.clientY); });
    });
  }

  /* ─────────────────────────────────────────────
     12 · Link ativo no menu
     ───────────────────────────────────────────── */
  function scrollSpy() {
    $$('.nav-links a[href^="#"]').forEach(link => {
      const sec = document.querySelector(link.getAttribute('href'));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 45%', end: 'bottom 45%',
        onToggle(self) { link.classList.toggle('on', self.isActive); }
      });
    });
  }

  /* ─────────────────────────────────────────────
     13 · Botões magnéticos + cursor
     ───────────────────────────────────────────── */
  function magnets() {
    if (!FINE) return;
    $$('[data-magnet]').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: .55, ease: 'elastic.out(1, .45)' });
      const yTo = gsap.quickTo(el, 'y', { duration: .55, ease: 'elastic.out(1, .45)' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .3);
        yTo((e.clientY - (r.top + r.height / 2)) * .4);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  function cursor() {
    if (!FINE) return;
    const c = $('#cursor');
    if (!c) return;
    const xTo = gsap.quickTo(c, 'x', { duration: .32, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: .32, ease: 'power3' });
    window.addEventListener('mousemove', e => {
      c.classList.add('on'); xTo(e.clientX); yTo(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', () => c.classList.remove('on'));
    $$('a, button, .pola, .card, .teacher').forEach(el => {
      el.addEventListener('mouseenter', () => c.classList.add('grow'));
      el.addEventListener('mouseleave', () => c.classList.remove('grow'));
    });
  }

  /* ─────────────────────────────────────────────
     14 · Interface: nav, menu, acordeão
     ───────────────────────────────────────────── */
  const drawer = $('#drawer'), burger = $('#burger');

  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }

  function ui() {
    const nav = $('#nav');
    if (nav) {
      let last = window.scrollY;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('stuck', y > 40);
        if (y > 520 && y > last + 6) nav.classList.add('hide');
        else if (y < last - 6 || y < 200) nav.classList.remove('hide');
        last = y;
      }, { passive: true });
    }

    if (burger && drawer) {
      burger.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        drawer.setAttribute('aria-hidden', String(!open));
        if (lenis) open ? lenis.stop() : lenis.start();
      });
      $$('a', drawer).forEach(a => a.addEventListener('click', closeDrawer));
      window.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    }

    $$('.acc-item').forEach(item => {
      const btn = item.querySelector('.acc-q'), body = item.querySelector('.acc-a');
      if (!btn || !body) return;
      btn.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.acc-item.open').forEach(other => {
          if (other === item) return;
          other.classList.remove('open');
          const oq = other.querySelector('.acc-q');
          if (oq) oq.setAttribute('aria-expanded', 'false');
          collapse(other.querySelector('.acc-a'));
        });
        item.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
        open ? collapse(body) : expand(body);
      });
    });
  }

  function expand(el) {
    if (!el) return;
    if (HAS_GSAP && !REDUCED) {
      gsap.to(el, { height: el.scrollHeight, duration: .6, ease: 'power3.inOut',
        onComplete() { el.style.height = 'auto'; if (HAS_ST) ScrollTrigger.refresh(); } });
    } else { el.style.height = 'auto'; }
  }
  function collapse(el) {
    if (!el) return;
    if (HAS_GSAP && !REDUCED) {
      gsap.to(el, { height: 0, duration: .46, ease: 'power3.inOut',
        onComplete() { if (HAS_ST) ScrollTrigger.refresh(); } });
    } else { el.style.height = '0px'; }
  }

  /* se um <script> de CDN falhar, libera o conteúdo mesmo assim */
  window.addEventListener('error', e => {
    if (e.target && e.target.tagName === 'SCRIPT') { unlockAll(); boot(); }
  }, true);

})();
