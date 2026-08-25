/* KM 42 — interações brutalistas */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Terminal de diagnóstico (typing) ---------- */
  const out = document.getElementById("terminal-out");
  const linhas = [
    "$ ./km42_diagnostico.sh --completo",
    "> conectando scanner OBD-II .......... OK",
    "> lendo módulos: motor, freio, airbag  OK",
    "> checklist 62 pontos ................ OK",
    "> fotografando evidências ............ OK",
    "> gerando laudo por escrito .......... OK",
    "",
    "RESULTADO: nenhum serviço será feito sem a sua autorização.",
  ];

  if (out) {
    if (reduceMotion) {
      out.textContent = linhas.join("\n");
    } else {
      let li = 0, ci = 0, buffer = "";
      const digitar = () => {
        if (li >= linhas.length) return;
        const linha = linhas[li];
        if (ci < linha.length) {
          buffer += linha[ci++];
          out.textContent = buffer;
          setTimeout(digitar, 18 + Math.random() * 30);
        } else {
          buffer += "\n";
          li++; ci = 0;
          setTimeout(digitar, li === linhas.length - 1 ? 500 : 180);
        }
      };
      setTimeout(digitar, 900);
    }
  }

  if (reduceMotion || typeof gsap === "undefined") {
    document.querySelectorAll(".hero__title-row > span").forEach((el) => (el.style.transform = "none"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  const lenis = new Lenis({ lerp: 0.11 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { offset: -90, duration: 1.2 });
    });
  });

  /* ---------- Hero: linhas sobem ---------- */
  gsap.to(".hero__title-row > span", {
    y: 0,
    duration: 1.1,
    stagger: 0.14,
    ease: "power4.out",
    delay: 0.15,
  });
  gsap.from(".hero__tag, .terminal", {
    opacity: 0,
    y: 30,
    duration: 0.9,
    stagger: 0.25,
    delay: 0.6,
    ease: "power3.out",
  });

  /* ---------- Marquee inclinado: velocidade ligada ao scroll ---------- */
  const track = document.getElementById("skew-track");
  if (track) {
    let x = 0;
    let velocidade = 1.2;
    let boostAlvo = 0, boost = 0;

    lenis.on("scroll", ({ velocity }) => {
      boostAlvo = Math.min(Math.abs(velocity) * 0.4, 14);
    });

    gsap.ticker.add(() => {
      boost += (boostAlvo - boost) * 0.08;
      boostAlvo *= 0.94;
      x -= velocidade + boost;
      const metade = track.scrollWidth / 2;
      if (metade > 0 && -x >= metade) x += metade;
      track.style.transform = `translateX(${x}px)`;
    });
  }

  /* ---------- Blocos: entrada dura (brutalista — sem fade suave) ---------- */
  gsap.utils.toArray(".ferramenta").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 26,
      duration: 0.35,
      ease: "steps(4)",
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });

  gsap.utils.toArray(".etapa").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      x: -34,
      duration: 0.4,
      ease: "steps(5)",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  gsap.utils.toArray(".section-title, .section-sub, .box__grid").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.45,
      ease: "steps(6)",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* ---------- Contadores ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const fim = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: fim,
      duration: 1.4,
      ease: "steps(24)",
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  /* ---------- Footer: entra com scrub ---------- */
  gsap.from(".footer__giant", {
    yPercent: 40,
    ease: "none",
    scrollTrigger: {
      trigger: ".footer",
      start: "top 95%",
      end: "top 55%",
      scrub: 0.8,
    },
  });

  /* ---------- Glitch rápido no logo a cada 6s ---------- */
  const logo = document.querySelector(".nav__logo");
  if (logo) {
    setInterval(() => {
      gsap.fromTo(
        logo,
        { x: -2, skewX: 8 },
        { x: 0, skewX: 0, duration: 0.28, ease: "steps(3)" }
      );
    }, 6000);
  }
})();
