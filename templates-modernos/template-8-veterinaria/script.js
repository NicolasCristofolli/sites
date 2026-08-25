/* Pata & Cia — interações leves e divertidas */

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

// ---------- Reveal on scroll (com stagger por seção) ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      // pequeno atraso em cascata entre irmãos visíveis
      const siblings = [...e.target.parentElement.querySelectorAll(".reveal")];
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = `${Math.min(idx * 70, 350)}ms`;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- Patinhas no clique (confete de 🐾) ----------
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduced) {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      for (let i = 0; i < 6; i++) {
        const paw = document.createElement("span");
        paw.textContent = "🐾";
        paw.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          font-size: ${12 + Math.random() * 14}px;
          pointer-events: none;
          z-index: 999;
          transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.9s;
        `;
        document.body.appendChild(paw);
        requestAnimationFrame(() => {
          const angle = Math.random() * Math.PI * 2;
          const dist = 40 + Math.random() * 70;
          paw.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 30}px) rotate(${(Math.random() - 0.5) * 90}deg)`;
          paw.style.opacity = "0";
        });
        setTimeout(() => paw.remove(), 950);
      }
    });
  });
}
