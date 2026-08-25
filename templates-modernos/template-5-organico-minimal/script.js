/* Terrā — movimento calmo e contínuo */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- Smooth scroll (Lenis) ----------
let lenis = null;
if (typeof Lenis !== "undefined" && !reduced) {
  lenis = new Lenis({ lerp: 0.08 });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // âncoras passam pelo Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  });
}

// ---------- Header ao rolar ----------
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
}, { passive: true });

// ---------- Menu mobile ----------
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  })
);

// ---------- Reveals (fade + clip-path) ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.18 }
);
document.querySelectorAll("[data-fade], [data-reveal-img]").forEach((el) => io.observe(el));

// ---------- Parallax sutil na imagem fullbleed ----------
const parallaxImg = document.querySelector("[data-parallax]");
if (parallaxImg && !reduced) {
  window.addEventListener("scroll", () => {
    const r = parallaxImg.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const progress = (innerHeight - r.top) / (innerHeight + r.height); // 0 → 1
    parallaxImg.style.transform = `translateY(${(progress - 0.5) * -12}%) scale(1.15)`;
  }, { passive: true });
}

// ---------- Preview de projeto seguindo o mouse ----------
const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const list = document.getElementById("projectList");

if (preview && finePointer && !reduced) {
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let active = false;

  const loop = () => {
    // interpolação para o movimento "flutuar" atrás do cursor
    curX += (targetX - curX) * 0.12;
    curY += (targetY - curY) * 0.12;
    preview.style.transform = `translate(${curX}px, ${curY}px) scale(${active ? 1 : 0.9})`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  list.addEventListener("mousemove", (e) => {
    targetX = e.clientX + 28;
    targetY = e.clientY - preview.offsetHeight / 2;
    // mantém dentro da viewport
    targetX = Math.min(targetX, innerWidth - preview.offsetWidth - 16);
    targetY = Math.max(16, Math.min(targetY, innerHeight - preview.offsetHeight - 16));
  });

  list.querySelectorAll(".project").forEach((li) => {
    li.addEventListener("mouseenter", () => {
      previewImg.src = li.dataset.img;
      preview.classList.add("is-active");
      active = true;
    });
  });

  list.addEventListener("mouseleave", () => {
    preview.classList.remove("is-active");
    active = false;
  });
}
