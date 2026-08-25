/* Aurea — slider antes/depois e interações suaves */

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

// ---------- Slider antes/depois ----------
const compare = document.getElementById("compare");
const beforeWrap = document.getElementById("beforeWrap");
const handle = document.getElementById("handle");

function setCompare(pct) {
  const clamped = Math.max(2, Math.min(98, pct));
  beforeWrap.style.width = clamped + "%";
  handle.style.left = clamped + "%";
  compare.setAttribute("aria-valuenow", Math.round(clamped));
}

function pctFromEvent(e) {
  const r = compare.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
  return (x / r.width) * 100;
}

let dragging = false;
const start = (e) => { dragging = true; setCompare(pctFromEvent(e)); };
const move = (e) => { if (dragging) setCompare(pctFromEvent(e)); };
const end = () => { dragging = false; };

compare.addEventListener("mousedown", start);
window.addEventListener("mousemove", move);
window.addEventListener("mouseup", end);
compare.addEventListener("touchstart", start, { passive: true });
compare.addEventListener("touchmove", move, { passive: true });
compare.addEventListener("touchend", end);

// acessível por teclado
compare.addEventListener("keydown", (e) => {
  const cur = Number(compare.getAttribute("aria-valuenow"));
  if (e.key === "ArrowLeft") { setCompare(cur - 4); e.preventDefault(); }
  if (e.key === "ArrowRight") { setCompare(cur + 4); e.preventDefault(); }
});

// ---------- Formulário ----------
document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("bookingOk").hidden = false;
  e.target.querySelectorAll("input").forEach((i) => (i.value = ""));
});
