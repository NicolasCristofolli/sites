/* NOCTURNE — animações cinemáticas (GSAP + ScrollTrigger + Lenis) */

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

if (!hasGSAP) document.documentElement.classList.add("no-gsap");

// ---------- Menu overlay ----------
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlayMenu");

menuBtn.addEventListener("click", () => {
  const open = overlay.classList.toggle("is-open");
  overlay.setAttribute("aria-hidden", String(!open));
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Fechar" : "Menu";
});

overlay.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.textContent = "Menu";
  })
);

// ---------- Formulário ----------
document.getElementById("subscribeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.textContent = "Obrigado ✓";
  e.target.querySelector("input").value = "";
});

// ---------- Split de texto em palavras ----------
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
  return el.querySelectorAll(".w");
}

if (hasGSAP && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger);

  // ---------- Smooth scroll (Lenis) ----------
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- Título da capa: entrada cinética ----------
  gsap.from("[data-kinetic]", {
    yPercent: 115,
    duration: 1.4,
    stagger: 0.15,
    ease: "power4.out",
    delay: 0.2,
  });

  // ---------- Parallax da imagem de capa ----------
  gsap.to("[data-parallax]", {
    yPercent: -14,
    ease: "none",
    scrollTrigger: { trigger: ".cover", start: "top top", end: "bottom top", scrub: true },
  });

  // e o título "abre" conforme rola
  gsap.to(".cover__line:first-child", {
    xPercent: -8,
    ease: "none",
    scrollTrigger: { trigger: ".cover", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".cover__line--italic", {
    xPercent: 8,
    ease: "none",
    scrollTrigger: { trigger: ".cover", start: "top top", end: "bottom top", scrub: true },
  });

  // ---------- Editorial: palavras acendem uma a uma ----------
  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, {
      onUpdate: function () {
        // marca como "lit" para transição CSS suave
      },
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "bottom 55%",
        scrub: true,
        onUpdate: (self) => {
          const n = Math.floor(self.progress * words.length);
          words.forEach((w, i) => w.classList.toggle("lit", i <= n));
        },
      },
    });
  });

  // ---------- Galeria horizontal com pin ----------
  const track = document.getElementById("galleryTrack");
  const getScroll = () => track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: () => -getScroll(),
    ease: "none",
    scrollTrigger: {
      trigger: ".gallery",
      start: "top top",
      end: () => "+=" + getScroll(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  // ---------- Reveals genéricos ----------
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });
} else {
  // Fallback sem GSAP / com movimento reduzido: tudo visível, galeria vira scroll nativo
  document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
  document.querySelectorAll(".editorial__text .w").forEach((w) => w.classList.add("lit"));
  const pin = document.querySelector(".gallery__pin");
  pin.style.overflowX = "auto";
}
