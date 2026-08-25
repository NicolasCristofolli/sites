/* SERRA & ALMEIDA — interações */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: transparente sobre o hero, sólida depois ---------- */
  const nav = document.getElementById("nav");
  const atualizarNav = () => {
    nav.classList.toggle("is-solida", window.scrollY > window.innerHeight * 0.75);
  };
  atualizarNav();
  window.addEventListener("scroll", atualizarNav, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const menuMobile = document.getElementById("menu-mobile");
  const alternarMenu = (abrir) => {
    burger.classList.toggle("is-aberto", abrir);
    menuMobile.classList.toggle("is-aberto", abrir);
    burger.setAttribute("aria-expanded", String(abrir));
    menuMobile.setAttribute("aria-hidden", String(!abrir));
    document.body.style.overflow = abrir ? "hidden" : "";
  };
  burger.addEventListener("click", () =>
    alternarMenu(!menuMobile.classList.contains("is-aberto"))
  );
  menuMobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => alternarMenu(false))
  );

  /* ---------- Hero: carrossel de taglines ---------- */
  const frases = document.querySelectorAll(".hero__frase");
  const dots = document.querySelectorAll("#hero-dots span");
  let slideAtual = 0;

  if (frases.length > 1 && !reduceMotion) {
    setInterval(() => {
      frases[slideAtual].classList.remove("is-ativa");
      dots[slideAtual].classList.remove("is-ativo");
      slideAtual = (slideAtual + 1) % frases.length;
      frases[slideAtual].classList.add("is-ativa");
      dots[slideAtual].classList.add("is-ativo");
    }, 5200);
  }

  /* ---------- Formulário (front-end apenas) ---------- */
  const form = document.getElementById("form-contato");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nota = form.querySelector(".contato__nota");
      nota.textContent =
        "Mensagem registrada. Um dos sócios retornará em até um dia útil.";
      nota.classList.add("is-enviado");
      form.reset();
    });
  }

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
      lenis.scrollTo(alvo, { offset: -70, duration: 1.4 });
    });
  });

  /* ---------- Hero: entrada ---------- */
  gsap.from(".hero__eyebrow, .hero__slides, .hero__ctas, .hero__indicadores, .hero__rodape", {
    opacity: 0,
    y: 30,
    duration: 1.1,
    stagger: 0.15,
    ease: "power3.out",
    delay: 0.2,
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
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- Duplas: visual e conteúdo entram de lados opostos ---------- */
  gsap.utils.toArray(".dupla").forEach((sec) => {
    const visual = sec.querySelector(".dupla__visual");
    const conteudo = sec.querySelector(".dupla__conteudo");
    const invertida = sec.classList.contains("dupla--invertida");

    gsap.from(visual, {
      opacity: 0,
      x: invertida ? 60 : -60,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: sec, start: "top 78%" },
    });
    gsap.from(conteudo.children, {
      opacity: 0,
      y: 34,
      duration: 0.9,
      stagger: 0.09,
      ease: "power3.out",
      scrollTrigger: { trigger: sec, start: "top 74%" },
    });
  });

  /* ---------- Statement: parallax do fundo ---------- */
  gsap.to(".statement__fundo", {
    yPercent: 18,
    ease: "none",
    scrollTrigger: {
      trigger: ".statement",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.6,
    },
  });

  /* ---------- Reveals genéricos ---------- */
  gsap.utils.toArray(
    ".kicker, .posicionamento__titulo, .posicionamento__texto, .areas__titulo, .depoimentos__titulo, .statement__conteudo, .contato__coluna h2, .contato__dados, .contato__form"
  ).forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 36,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.from(".area", {
    opacity: 0,
    y: 34,
    duration: 0.7,
    stagger: 0.08,
    ease: "power2.out",
    scrollTrigger: { trigger: ".areas__grade", start: "top 85%" },
  });

  gsap.from(".depoimento", {
    opacity: 0,
    y: 44,
    duration: 0.9,
    stagger: 0.14,
    ease: "power3.out",
    scrollTrigger: { trigger: ".depoimentos__grade", start: "top 85%" },
  });

  /* ---------- Botões magnéticos ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.22,
          y: (e.clientY - r.top - r.height / 2) * 0.22,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1, 0.45)" });
      });
    });
  }
})();
