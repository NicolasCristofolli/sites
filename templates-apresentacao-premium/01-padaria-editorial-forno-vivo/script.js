/* FORNO VIVO — interações */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Relógio ao vivo ---------- */
  const relogio = document.getElementById("relogio");
  const tick = () => {
    const agora = new Date();
    relogio.textContent = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  tick();
  setInterval(tick, 15000);

  if (reduceMotion || typeof gsap === "undefined") {
    // Sem GSAP (CDN offline) ou com motion reduzido: garante que nada fique oculto
    document.querySelectorAll(".hero__word > span").forEach((el) => (el.style.transform = "none"));
    document.querySelectorAll(".reveal-line").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Âncoras internas via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { offset: -60, duration: 1.4 });
    });
  });

  /* ---------- Hero: entrada ---------- */
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.to(".hero__word > span", {
    y: 0,
    duration: 1.2,
    stagger: 0.12,
    delay: 0.2,
  }).to(
    ".reveal-line",
    { opacity: 1, y: 0, duration: 1, stagger: 0.15 },
    "-=0.7"
  );

  /* ---------- Manifesto: palavras acendem no scroll ---------- */
  const manifesto = document.getElementById("manifesto-texto");
  if (manifesto) {
    const palavras = manifesto.textContent.trim().split(/\s+/);
    manifesto.innerHTML = palavras
      .map((p) => `<span class="palavra">${p}</span>`)
      .join(" ");

    gsap.to(manifesto.querySelectorAll(".palavra"), {
      opacity: 1,
      stagger: 0.06,
      ease: "none",
      scrollTrigger: {
        trigger: manifesto,
        start: "top 80%",
        end: "bottom 45%",
        scrub: 0.6,
      },
    });
  }

  /* ---------- Steps: entrada alternada ---------- */
  gsap.utils.toArray(".step").forEach((step, i) => {
    gsap.from(step, {
      opacity: 0,
      x: i % 2 === 0 ? -60 : 60,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: step, start: "top 85%" },
    });
  });

  /* ---------- Contadores ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const fim = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: fim,
      duration: 1.8,
      ease: "power2.out",
      snap: { v: 1 },
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- Fornadas: stagger ---------- */
  gsap.from(".fornada", {
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.08,
    ease: "power2.out",
    scrollTrigger: { trigger: ".fornadas__lista", start: "top 85%" },
  });

  /* ---------- Seções genéricas ---------- */
  gsap.utils.toArray(".section-index, .processo__title, .fornadas__title, .casa__texto, .casa__info, .numeros__grid").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* ---------- Footer gigante: sobe com o scroll ---------- */
  gsap.from(".footer__giant", {
    yPercent: 60,
    opacity: 0,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".footer",
      start: "top 90%",
      end: "top 50%",
      scrub: 1,
    },
  });

  /* ---------- Efeito magnético ---------- */
  const magnetize = (el, forca) => {
    let raf = null;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        gsap.to(el, { x: dx * forca, y: dy * forca, duration: 0.4, ease: "power2.out" });
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  };

  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => magnetize(el, 0.25));
    document.querySelectorAll("[data-magnetic-strong]").forEach((el) => magnetize(el, 0.45));
  }
})();
