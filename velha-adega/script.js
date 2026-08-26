/* ════════════════════════════════════════════════════════════
   VELHA LAJE — movimento
   Regra da casa: pouco, lento e reversível. Nada pisca.
   ════════════════════════════════════════════════════════════ */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (!hasGSAP || reduced) document.documentElement.classList.add("no-gsap");

/* ---------- véu de entrada ---------- */
const veil = document.getElementById("veil");
const liftVeil = () => veil.classList.add("is-gone");
window.addEventListener("load", () => setTimeout(liftVeil, reduced ? 0 : 900));
setTimeout(liftVeil, 3200); // rede de segurança se algum asset travar

/* ---------- menu ---------- */
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const setMenu = (open) => {
  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Fechar" : "Menu";
};
menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* ---------- cabeçalho encorpa depois da abertura ---------- */
const head = document.getElementById("head");
const onScroll = () => head.classList.toggle("is-stuck", window.scrollY > window.innerHeight * 0.6);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- acervo: cada ficha abre a sua ---------- */
document.querySelectorAll(".wine__more").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wine = btn.closest(".wine");
    const open = !wine.classList.contains("is-open");
    wine.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Fechar" : "Descobrir";
    if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 760);
  });
});

document.getElementById("ano").textContent = new Date().getFullYear();

/* ---------- curador: a tira vira carrossel quando sobra foto ---------- */
/* enquanto tudo couber na largura, as setas somem e nada muda de aparência */
document.querySelectorAll("[data-strip]").forEach((strip) => {
  const gallery = strip.closest(".curator__gallery");
  const prev = gallery.querySelector("[data-strip-prev]");
  const next = gallery.querySelector("[data-strip-next]");

  // o passo é uma foto: mede a real, porque muda com a largura da tela
  const step = () => {
    const first = strip.querySelector("figure");
    if (!first) return strip.clientWidth;
    const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const sync = () => {
    const overflow = strip.scrollWidth - strip.clientWidth;
    gallery.classList.toggle("is-static", overflow < 4);
    prev.disabled = strip.scrollLeft < 4;
    next.disabled = strip.scrollLeft > overflow - 4;
  };

  prev.addEventListener("click", () => strip.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => strip.scrollBy({ left: step(), behavior: "smooth" }));

  // setas do teclado quando a tira está em foco
  strip.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    strip.scrollBy({ left: e.key === "ArrowRight" ? step() : -step(), behavior: "smooth" });
  });

  strip.addEventListener("scroll", sync, { passive: true });
  new ResizeObserver(sync).observe(strip);
  new MutationObserver(sync).observe(strip, { childList: true }); // foto nova entra e as setas acordam
  strip.querySelectorAll("img").forEach((img) => img.addEventListener("load", sync));
  sync();
});

/* ════════ daqui para baixo, só com GSAP ════════ */
if (hasGSAP && !reduced) {
  gsap.registerPlugin(ScrollTrigger);

  /* rolagem macia */
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.5, smoothWheel: true, wheelMultiplier: 0.85 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.9 });
      });
    });
  }

  /* ---------- abertura: o título sobe do escuro ---------- */
  gsap.to("[data-open]", {
    opacity: 1,
    y: 0,
    duration: 1.8,
    ease: "power2.out",
    stagger: 0.18,
    delay: 1.15,
    startAt: { opacity: 0, y: 40 },
  });

  /* ---------- 02 · A CASA: a soleira se abre ----------
     Um único ScrollTrigger dirige tudo pela progressão, sem
     fromTo empilhado — assim um refresh() nunca desfaz o estado. */
  const place = document.querySelector(".place");
  const door = document.querySelector(".place__door");
  const deeper = document.querySelector(".place__deeper");
  const stage = document.querySelector(".place__stage");
  const before = document.querySelector(".place__before");
  const inside = document.querySelector(".place__inside");

  if (place && door) {
    // fração inicial da moldura, em relação ao palco
    const start = () => (window.innerWidth <= 760 ? { w: 0.56, h: 0.44 } : { w: 0.24, h: 0.66 });
    let from = start();
    let box = { w: 0, h: 0 };
    const measure = () => {
      const r = stage.getBoundingClientRect();
      box = { w: r.width, h: r.height };
    };
    measure();

    // power2.in: a moldura demora a abrir. Assim a escada — que tem só 576px de
    // origem — nunca é exibida grande, e quando a tela enche já é a cave no quadro.
    const easeIn = gsap.parseEase("power2.in");
    const easeIO = gsap.parseEase("power2.inOut");
    const easeOut = gsap.parseEase("power2.out");
    const stairs = door.querySelector("img");

    const draw = (p) => {
      const e = easeIn(gsap.utils.clamp(0, 1, p / 0.82));
      const w0 = box.w * from.w;
      const h0 = box.h * from.h;
      // px inteiros: fração de pixel na moldura borra a imagem inteira
      door.style.width = `${Math.round(w0 + (box.w - w0) * e)}px`;
      door.style.height = `${Math.round(h0 + (box.h - h0) * e)}px`;

      // DESCER: o enquadramento desce a escada enquanto a imagem se aproxima da
      // lâmpada e do rack de garrafas. Zoom curto de propósito — não há pixel
      // sobrando na origem para ampliar mais que isso.
      const z = easeOut(gsap.utils.clamp(0, 1, p / 0.5));
      stairs.style.objectPosition = `center ${46 + 34 * z}%`;
      stairs.style.transform = `scale(${1 + 0.2 * z})`;

      // a cave chega cedo, ainda com a moldura pequena, e é ela que assume a tela
      // cheia. Cortina em vez de crossfade — sobrepor as duas vira dupla exposição.
      if (deeper) {
        const t = gsap.utils.clamp(0, 1, (p - 0.24) / 0.18);
        const te = easeIO(t);
        deeper.style.opacity = "1";
        deeper.style.clipPath = `inset(${(1 - te) * 100}% 0 0 0)`;
        deeper.style.transform = `scale(${1.06 - 0.06 * easeOut(t)})`;
        // coberta a escada, para de desenhá-la — a partir daqui ela só seria
        // uma imagem de 576px esticada atrás de outra
        stairs.style.visibility = t >= 1 ? "hidden" : "visible";
        stage.classList.toggle("is-deep", p > 0.46);
      }
      before.style.opacity = String(gsap.utils.clamp(0, 1, 1 - p / 0.3));
      inside.style.opacity = String(gsap.utils.clamp(0, 1, (p - 0.76) / 0.18));
      inside.style.transform = `translateY(${gsap.utils.clamp(0, 30, (0.97 - p) * 90)}px)`;
    };

    ScrollTrigger.create({
      trigger: place,
      start: "top top",
      end: "bottom bottom",
      pin: ".place__stage",
      pinSpacing: false,
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        from = start();
        measure();
        draw(self.progress);
      },
      onUpdate: (self) => draw(self.progress),
    });
    draw(0);
  }

  /* ---------- revelações discretas ---------- */
  gsap.utils.toArray("[data-rise]").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.6,
      ease: "power2.out",
      startAt: { opacity: 0, y: 34 },
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  /* títulos e blocos de texto entram na mesma cadência */
  gsap.utils.toArray(".sec-head, .rite__intro, .curator__text, .find__info, .find__map, .wine__body, .crown__type").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: "power2.out",
      startAt: { opacity: 0, y: 26 },
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- paralaxe contido na galeria ---------- */
  gsap.utils.toArray(".gal__i--b, .gal__i--c, .gal__i--f, .gal__i--g").forEach((el, i) => {
    gsap.to(el.querySelector(".plate"), {
      yPercent: i % 2 ? 6 : -6, // yPercent, nunca transform em % pelo CSS
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 },
    });
  });

  /* ---------- as garrafas do acervo respiram ---------- */
  gsap.utils.toArray(".wine__shot img").forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.1, yPercent: -3 },
      {
        scale: 1,
        yPercent: 3,
        ease: "none",
        scrollTrigger: { trigger: img.closest(".wine"), start: "top bottom", end: "bottom top", scrub: 1.2 },
      }
    );
  });
  gsap.utils.toArray(".wine__shot").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      duration: 1.6,
      ease: "power2.out",
      startAt: { opacity: 0 },
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- o Cristal se aproxima devagar ---------- */
  const crown = document.querySelector(".crown");
  if (crown) {
    gsap.fromTo(
      crown.querySelector(".crown__shot img"),
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 2.4,
        ease: "power2.out",
        scrollTrigger: { trigger: crown, start: "top 72%", once: true },
      }
    );
    gsap.fromTo(
      crown.querySelector(".crown__glow"),
      { opacity: 0, scale: 0.7 },
      {
        opacity: 1,
        scale: 1,
        duration: 3.2,
        ease: "power2.out",
        scrollTrigger: { trigger: crown, start: "top 72%", once: true },
      }
    );
  }

  /* ---------- a rota do mapa se desenha ---------- */
  /* um traço "cobridor" da cor do fundo se recolhe por cima da rota
     pontilhada — preserva o tracejado em qualquer direção de rolagem */
  const route = document.getElementById("mapRoute");
  if (route) {
    const len = route.getTotalLength();
    const cover = route.cloneNode();
    cover.removeAttribute("id");
    cover.setAttribute("fill", "none"); // sem isto o clone herda fill preto e vira uma cunha
    cover.setAttribute("stroke", "#0b0908");
    cover.setAttribute("stroke-width", "5");
    cover.setAttribute("stroke-dasharray", `${len} ${len}`);
    cover.setAttribute("stroke-dashoffset", "0");
    route.after(cover);
    gsap.to(cover, {
      strokeDashoffset: -len,
      ease: "none",
      scrollTrigger: { trigger: ".find__map", start: "top 85%", end: "top 30%", scrub: 1 },
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
