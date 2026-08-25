/* TORRA — interações quentinhas */

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

// ---------- Reveal on scroll com stagger ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.querySelectorAll(".reveal")];
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = `${Math.min(idx * 90, 360)}ms`;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- Adicionar café (toast) ----------
const toast = document.getElementById("toast");
let toastTimer = null;

document.querySelectorAll(".add").forEach((btn) => {
  btn.addEventListener("click", () => {
    toast.textContent = `☕ "${btn.dataset.name}" foi pro carrinho`;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  });
});

// ---------- Parallax leve no sol ----------
const sun = document.querySelector(".sun");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (sun && !reduced) {
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      sun.style.transform = `translateY(${y * 0.18}px)`;
    }
  }, { passive: true });
}
