/* SofáNovo — landing de conversão */

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

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- Contadores ----------
const counters = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / 1500, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("pt-BR");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counters.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => counters.observe(el));

// ---------- Formulário de orçamento ----------
document.getElementById("quoteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("quoteOk").hidden = false;
  e.target.querySelectorAll("input").forEach((i) => (i.value = ""));
});
