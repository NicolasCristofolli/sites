/* NEXO://26 — terminal vivo */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Boot sequence ----------
const boot = document.getElementById("boot");
const bootLog = document.getElementById("bootLog");
const bootLines = [
  "[ok] iniciando nexo_kernel v26.0.1 ...",
  "[ok] montando /dev/palco0",
  "[ok] carregando 42 talks na memória",
  "[ok] handshake com 1200 participantes",
  "[warn] café: nível crítico — reabastecendo",
  "<b>[ok] sistema pronto. bem-vinde à rede._</b>",
];

function runBoot() {
  if (reduced || sessionStorage.getItem("nexo-booted")) {
    boot.classList.add("done");
    return;
  }
  let i = 0;
  const next = () => {
    if (i < bootLines.length) {
      bootLog.innerHTML += bootLines[i] + "\n";
      i++;
      setTimeout(next, 90 + Math.random() * 220);
    } else {
      setTimeout(() => {
        boot.classList.add("done");
        sessionStorage.setItem("nexo-booted", "1");
      }, 450);
    }
  };
  next();
}
runBoot();

// ---------- Menu mobile ----------
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
  burger.textContent = open ? "[x]" : "[≡]";
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.textContent = "[≡]";
  })
);

// ---------- Efeito de digitação ----------
const typedEl = document.getElementById("typed");
const phrases = [
  "3 dias · 42 talks · criptografia, ia e o futuro da rede",
  "sem gravações. sem palco de vendas. só sinal, zero ruído",
  "são paulo // 13—15 de novembro de 2026",
];

if (reduced) {
  typedEl.textContent = phrases[0];
} else {
  let pi = 0, ci = 0, deleting = false;
  const type = () => {
    const phrase = phrases[pi];
    typedEl.textContent = phrase.slice(0, ci);
    if (!deleting) {
      if (ci++ === phrase.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
      setTimeout(type, 34 + Math.random() * 40);
    } else {
      if (ci-- === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
      setTimeout(type, 14);
    }
  };
  setTimeout(type, 1800);
}

// ---------- Countdown ----------
const target = new Date("2026-11-13T09:00:00-03:00").getTime();
const pad = (n, l = 2) => String(Math.max(n, 0)).padStart(l, "0");
const $ = (id) => document.getElementById(id);

function tickCountdown() {
  const diff = Math.max(target - Date.now(), 0);
  const s = Math.floor(diff / 1000);
  $("cd-d").textContent = pad(Math.floor(s / 86400), 3);
  $("cd-h").textContent = pad(Math.floor((s % 86400) / 3600));
  $("cd-m").textContent = pad(Math.floor((s % 3600) / 60));
  $("cd-s").textContent = pad(s % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

// ---------- Glitch aleatório no título ----------
const heroTitle = document.querySelector(".hero__title");
if (!reduced && heroTitle) {
  setInterval(() => {
    heroTitle.classList.add("glitching");
    setTimeout(() => heroTitle.classList.remove("glitching"), 260);
  }, 3800);
}

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
