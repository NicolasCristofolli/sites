/* ATELIÊ ORAL — precisão suíça em movimento */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof gsap === "undefined") {
    document.querySelectorAll(".mask > span").forEach((el) => (el.style.transform = "none"));
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
      lenis.scrollTo(alvo, { offset: -70, duration: 1.3 });
    });
  });

  /* ---------- Barra de progresso ---------- */
  gsap.to("#progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
    },
  });

  /* ---------- Cursor customizado ---------- */
  const cursor = document.getElementById("cursor");
  const temHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursor && temHover) {
    const setX = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power2.out" });
    const setY = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power2.out" });
    window.addEventListener("mousemove", (e) => {
      setX(e.clientX);
      setY(e.clientY);
    });
    document.querySelectorAll("a, [data-hover], .equip").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- Hero ---------- */
  gsap.to(".mask > span", {
    y: 0,
    duration: 1.2,
    stagger: 0.14,
    ease: "power4.out",
    delay: 0.15,
  });
  gsap.from(".hero__coord, .hero__desc, .hero__specs", {
    opacity: 0,
    y: 26,
    duration: 0.9,
    stagger: 0.15,
    delay: 0.75,
    ease: "power3.out",
  });

  /* ---------- Preview do parque técnico segue o mouse ---------- */
  const preview = document.getElementById("parque-preview");
  const letra = document.getElementById("preview-letra");
  const lista = document.getElementById("parque-lista");

  if (preview && lista && temHover) {
    const px = gsap.quickTo(preview, "x", { duration: 0.35, ease: "power3.out" });
    const py = gsap.quickTo(preview, "y", { duration: 0.35, ease: "power3.out" });

    lista.addEventListener("mousemove", (e) => {
      px(e.clientX + 30);
      py(e.clientY);
    });
    lista.querySelectorAll(".equip").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        letra.textContent = item.dataset.visual;
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" });
      });
    });
    lista.addEventListener("mouseleave", () => {
      gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.in" });
    });
  }

  /* ---------- Contadores ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const fim = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: fim,
      duration: 1.5,
      ease: "power2.out",
      snap: { v: 1 },
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  /* ---------- Linha do protocolo preenche no scroll ---------- */
  gsap.to("#linha-fill", {
    height: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: ".protocolo__trilha",
      start: "top 70%",
      end: "bottom 55%",
      scrub: 0.5,
    },
  });

  gsap.utils.toArray(".passo").forEach((p) => {
    gsap.from(p, {
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: p, start: "top 82%" },
    });
  });

  /* ---------- Reveals ---------- */
  gsap.utils.toArray(".idx, .precisao__head h2, .precisao__body, .parque__head, .protocolo__head h2, .clinica__card, .footer__row").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 34,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.from(".equip", {
    opacity: 0,
    y: 24,
    duration: 0.6,
    stagger: 0.09,
    ease: "power2.out",
    scrollTrigger: { trigger: ".parque__lista", start: "top 85%" },
  });

  /* ---------- Footer ---------- */
  gsap.from(".footer__giant", {
    yPercent: 45,
    opacity: 0,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".footer",
      start: "top 93%",
      end: "top 60%",
      scrub: 1,
    },
  });
})();
