/* LUMEN — interações glassmorphism */

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
  { threshold: 0.12 }
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
      const dur = 1600;
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counters.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => counters.observe(el));

// ---------- Tilt 3D do celular ----------
const device = document.getElementById("device");
const phone = device?.querySelector(".phone");
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (device && phone && fine && !reduced) {
  device.addEventListener("mousemove", (e) => {
    const r = device.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    phone.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`;
  });
  device.addEventListener("mouseleave", () => {
    phone.style.transform = "";
  });
}

// ---------- Aurora reage sutilmente ao mouse ----------
if (fine && !reduced) {
  const blobs = document.querySelectorAll(".aurora__blob");
  let raf = null;
  window.addEventListener("mousemove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      blobs.forEach((b, i) => {
        const f = (i + 1) * 14;
        b.style.translate = `${x * f}px ${y * f}px`;
      });
      raf = null;
    });
  });
}
