/* NORTE — interações noir */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  const lenis = new Lenis({ lerp: 0.09 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { offset: -40, duration: 1.3 });
    });
  });

  /* ---------- Hero: camadas entram + parallax de mouse ---------- */
  gsap.from(".hero__line", {
    opacity: 0,
    y: 80,
    duration: 1.4,
    stagger: 0.15,
    ease: "power4.out",
    delay: 0.2,
  });
  gsap.from(".hero__sub, .hero__foot", {
    opacity: 0,
    y: 30,
    duration: 1,
    stagger: 0.2,
    delay: 0.9,
    ease: "power3.out",
  });

  if (window.matchMedia("(hover: hover)").matches) {
    const stack = document.querySelector(".hero__stack");
    const camadas = document.querySelectorAll(".hero__line");
    window.addEventListener("mousemove", (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      camadas.forEach((c) => {
        const d = parseFloat(c.dataset.depth || 0.5);
        gsap.to(c, {
          x: nx * 18 * d,
          y: ny * 12 * d,
          duration: 1.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    });
    void stack;
  }

  /* ---------- Títulos split (por linha simples) ---------- */
  gsap.utils.toArray(".split-reveal").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 60,
      skewY: 2,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ---------- Índices e blocos ---------- */
  gsap.utils.toArray(".index, .oficio__cols, .casa__dados, .footer__row").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* ---------- Contadores ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const fim = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: fim,
      duration: 1.6,
      ease: "power2.out",
      snap: { v: 1 },
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  /* ---------- Serviços: entrada em cascata ---------- */
  gsap.from(".servico", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out",
    scrollTrigger: { trigger: ".servicos__lista", start: "top 85%" },
  });

  /* ---------- Cadeiras: tilt 3D no hover ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateY: px * 10,
          rotateX: -py * 10,
          transformPerspective: 700,
          duration: 0.5,
          ease: "power2.out",
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
      });
    });

    /* ---------- Links magnéticos ---------- */
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.3,
          y: (e.clientY - r.top - r.height / 2) * 0.3,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- Cadeiras: entrada ---------- */
  gsap.from(".cadeira", {
    opacity: 0,
    y: 60,
    duration: 1,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: { trigger: ".cadeiras__grid", start: "top 85%" },
  });

  /* ---------- Footer gigante ---------- */
  gsap.from(".footer__giant", {
    yPercent: 50,
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
