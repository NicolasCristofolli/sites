/* PONTO DE TORRA — curva de torra + horizontal scroll */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof gsap === "undefined") {
    document.querySelectorAll(".linha-mask > span").forEach((el) => (el.style.transform = "none"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { offset: -50, duration: 1.4 });
    });
  });

  /* ---------- Hero ---------- */
  gsap.to(".linha-mask > span", {
    y: 0,
    duration: 1.3,
    stagger: 0.13,
    ease: "power4.out",
    delay: 0.2,
  });
  gsap.from(".hero__eyebrow, .hero__sub", {
    opacity: 0,
    y: 24,
    duration: 1,
    stagger: 0.2,
    delay: 0.8,
    ease: "power3.out",
  });

  /* ---------- Curva de torra: desenha no scroll ---------- */
  const path = document.getElementById("curva-path");
  const dot = document.getElementById("curva-dot");
  const tempOut = document.getElementById("temp-out");
  const tempoOut = document.getElementById("tempo-out");
  const faseOut = document.getElementById("fase-out");

  if (path && dot) {
    const comprimento = path.getTotalLength();
    path.style.strokeDasharray = comprimento;
    path.style.strokeDashoffset = comprimento;

    const fases = [
      { ate: 0.22, nome: "carga" },
      { ate: 0.55, nome: "secagem" },
      { ate: 0.78, nome: "maillard" },
      { ate: 0.93, nome: "1º crack" },
      { ate: 1.01, nome: "descarga" },
    ];

    const progresso = { p: 0 };
    gsap.to(progresso, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".curva__painel",
        start: "top 75%",
        end: "bottom 35%",
        scrub: 0.5,
      },
      onUpdate: () => {
        const p = progresso.p;
        path.style.strokeDashoffset = comprimento * (1 - p);

        const ponto = path.getPointAtLength(comprimento * p);
        dot.setAttribute("cx", ponto.x);
        dot.setAttribute("cy", ponto.y);

        // 20°C → 218°C
        tempOut.textContent = Math.round(20 + p * 198);

        // 0 → 12 minutos
        const totalSeg = Math.round(p * 12 * 60);
        const mm = String(Math.floor(totalSeg / 60)).padStart(2, "0");
        const ss = String(totalSeg % 60).padStart(2, "0");
        tempoOut.textContent = `${mm}:${ss}`;

        faseOut.textContent = fases.find((f) => p <= f.ate).nome;
      },
    });
  }

  /* ---------- Origens: horizontal pinada (desktop) ---------- */
  const trilho = document.getElementById("origens-trilho");
  const ehDesktop = window.matchMedia("(min-width: 641px)").matches;

  if (trilho && ehDesktop) {
    const distancia = () => trilho.scrollWidth - window.innerWidth;
    gsap.to(trilho, {
      x: () => -distancia(),
      ease: "none",
      scrollTrigger: {
        trigger: ".origens",
        start: "top top",
        end: () => `+=${distancia()}`,
        pin: ".origens__pin",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ---------- Reveals genéricos ---------- */
  gsap.utils.toArray(".kicker, .curva__head h2, .curva__head p, .metodos__title, .balcao h2, .balcao__info, .origens__head h2").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 36,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.from(".metodo", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".metodos__grid", start: "top 85%" },
  });

  gsap.from(".curva__painel", {
    opacity: 0,
    scale: 0.96,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: { trigger: ".curva__painel", start: "top 88%" },
  });

  /* ---------- Footer ---------- */
  gsap.from(".footer__giant", {
    yPercent: 55,
    opacity: 0,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".footer",
      start: "top 92%",
      end: "top 55%",
      scrub: 1,
    },
  });
})();
