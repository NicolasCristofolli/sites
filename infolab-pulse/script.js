/* ═══════════════════════════════════════════════════════════════
   INFOLAB — PULSE · motor de experiência (v2)
   GSAP + ScrollTrigger + Lenis (CDN) · vanilla JS
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const html = document.documentElement;
  const params = new URLSearchParams(location.search);

  /* ── debug: ?only=SECTION isola uma seção ── */
  const only = params.get("only");
  if (only) {
    const alvo = only.toUpperCase();
    document.querySelectorAll("[data-section]").forEach((s) => {
      if ((s.dataset.section || "") !== alvo) s.style.display = "none";
    });
  }

  /* ── modo estático ── */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasLibs = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const showAll = reduced || !hasLibs || params.has("showall");

  /* ── sempre rodam ── */
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  const form = document.getElementById("contatoForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.querySelectorAll("input, textarea, button").forEach((el) => (el.disabled = true));
    document.getElementById("formOk").hidden = false;
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (!alvo) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(alvo, { duration: 1.4 });
      else alvo.scrollIntoView({ behavior: showAll ? "auto" : "smooth" });
    })
  );

  const nav = document.getElementById("nav");
  addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 40), { passive: true });

  /* ── carrossel do monitor (roda também sem GSAP) ── */
  const TELAS = [
    { titulo: "Comércio",  sub: "Frente de caixa com fiscal integrado: cupom autorizado, fila andando e fechamento sem surpresa." },
    { titulo: "Empresas",  sub: "Certificados digitais da equipe inteira sob controle — validade, renovação e assinatura sem correria." },
    { titulo: "Gamers",    sub: "Builds montadas sob medida: airflow calculado, FPS de verdade e upgrade planejado peça a peça." },
    { titulo: "Criadores", sub: "Seu portfólio ou loja no ar, rápido e bonito — publicado, indexado e funcionando 24 horas." },
  ];
  const telasTitle = document.getElementById("telasTitle");
  const telasSub = document.getElementById("telasSub");
  const tdots = [...document.querySelectorAll(".tdot")];
  const paineis = [...document.querySelectorAll("[data-tela-panel]")];
  let telaAtiva = 0;
  let telaTimer = null;

  function mostraTela(i, manual) {
    telaAtiva = i % TELAS.length;
    tdots.forEach((d, j) => {
      d.classList.toggle("is-on", j === telaAtiva);
      d.setAttribute("aria-selected", String(j === telaAtiva));
    });
    paineis.forEach((p, j) => p.classList.toggle("is-on", j === telaAtiva));
    telasTitle.textContent = TELAS[telaAtiva].titulo;
    telasSub.textContent = TELAS[telaAtiva].sub;
    if (!showAll && typeof gsap !== "undefined") {
      gsap.fromTo([telasTitle, telasSub], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
    }
    if (manual) agendaTela(); /* reinicia o relógio ao clicar */
  }
  function agendaTela() {
    clearInterval(telaTimer);
    if (!showAll) telaTimer = setInterval(() => mostraTela(telaAtiva + 1), 4200);
  }
  tdots.forEach((d) => d.addEventListener("click", () => mostraTela(parseInt(d.dataset.tela, 10), true)));
  agendaTela();

  let lenis = null;

  if (showAll) {
    html.classList.add("showall");
    return;
  }

  html.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);

  /* ── lenis ── */
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.05 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const isTouch = matchMedia("(pointer: coarse)").matches;
  const isNarrow = matchMedia("(max-width: 820px)").matches;

  /* ── cursor + magnetismo ── */
  if (!isTouch) {
    const cursor = document.getElementById("cursor");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const alvo = { x: pos.x, y: pos.y };
    addEventListener("mousemove", (e) => { alvo.x = e.clientX; alvo.y = e.clientY; });
    gsap.ticker.add(() => {
      pos.x += (alvo.x - pos.x) * 0.18;
      pos.y += (alvo.y - pos.y) * 0.18;
      cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    });
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-big"));
    });
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.3,
          y: (e.clientY - (r.top + r.height / 2)) * 0.3,
          duration: 0.4, ease: "power2.out",
        });
      });
      el.addEventListener("mouseleave", () =>
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" })
      );
    });
  }

  /* ── split de caracteres ── */
  function splitChars(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach((c) => {
        const s = document.createElement("span");
        s.className = "ch" + (c === " " ? " ch--sp" : "");
        s.textContent = c === " " ? " " : c;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return el.querySelectorAll(".ch");
  }

  /* ── hero: intro + palavra giratória + facetas parallax ── */
  const heroTitle = document.querySelector(".hero-h1-line[data-reveal-chars]");
  const chars = splitChars(heroTitle);

  gsap.timeline()
    .to(chars, { y: 0, duration: 1, stagger: 0.03, ease: "power4.out", delay: 0.25 })
    .to(".hero [data-reveal]", { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, "-=0.5");

  const swap = document.getElementById("swapList");
  const passos = swap.children.length - 1;
  const rolo = gsap.timeline({ repeat: -1, delay: 1.2 });
  for (let i = 1; i <= passos; i++) {
    rolo.to(swap, { yPercent: (-100 / (passos + 1)) * i, duration: 0.7, ease: "power4.inOut" }, i * 1.7);
  }
  rolo.set(swap, { yPercent: 0 });

  document.querySelectorAll(".facet-layer").forEach((layer) => {
    gsap.to(layer, {
      y: parseFloat(layer.dataset.depth) * 8,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 },
    });
  });
  gsap.to(".hero-body", {
    yPercent: -12, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: 0.6 },
  });
  gsap.to("#heroProgress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ── faixa marquee ── */
  gsap.to("[data-marquee]", { xPercent: -50, ease: "none", duration: 20, repeat: -1 });

  /* ── reveals genéricos ── */
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.closest(".hero")) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });
  document.querySelectorAll("[data-reveal-chars]").forEach((el) => {
    if (el.closest(".hero")) return;
    const c = splitChars(el);
    gsap.to(c, {
      y: 0, duration: 0.9, stagger: 0.016, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ── deck: cartas empilham, a anterior recua ── */
  const cartas = gsap.utils.toArray(".carta");
  cartas.forEach((carta, i) => {
    const grid = carta.querySelector(".carta-grid");
    if (i < cartas.length - 1) {
      gsap.to(grid, {
        scale: 0.93, opacity: 0.5, yPercent: -3,
        transformOrigin: "center top",
        ease: "none",
        scrollTrigger: { trigger: cartas[i + 1], start: "top bottom", end: "top top+=15%", scrub: 0.4 },
      });
    }
    /* a UI viva entra montando peça por peça */
    const partes = carta.querySelectorAll(".mock > *, .chip");
    gsap.from(partes, {
      opacity: 0, y: 22, duration: 0.55, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: carta, start: "top 60%" },
    });
    /* medidores enchem quando a carta assume */
    carta.querySelectorAll(".meter i").forEach((m) => {
      gsap.from(m, {
        scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power3.inOut",
        scrollTrigger: { trigger: carta, start: "top 55%" },
      });
    });
  });

  /* ── bancada: o gabinete abre e cada peça sai de dentro ── */
  const wire = document.getElementById("wireMaq");
  if (wire) {
    /* o SVG já vem desenhado explodido; data-dx/dy é o deslocamento que
       recoloca a peça dentro do gabinete, então a animação parte de fechado */
    wire.querySelectorAll(".wire-part").forEach((part) => {
      const dx = parseFloat(part.dataset.dx || "0");
      const dy = parseFloat(part.dataset.dy || "0");
      if (!dx && !dy) return; /* o chassi fica parado */
      gsap.fromTo(part,
        { x: dx, y: dy },
        {
          x: 0, y: 0, ease: "power1.inOut",
          scrollTrigger: { trigger: ".bancada-stage", start: "top 82%", end: "bottom 62%", scrub: 0.6 },
        }
      );
    });
    /* as chamadas técnicas só aparecem quando as peças já se afastaram */
    gsap.fromTo(wire.querySelectorAll(".wire-cap"),
      { opacity: 0 },
      {
        opacity: 1, ease: "none", stagger: 0.04,
        scrollTrigger: { trigger: ".bancada-stage", start: "center 76%", end: "bottom 66%", scrub: 0.6 },
      }
    );
  }

  /* ── mapa isométrico: o prédio da loja sobe e o pino cai ── */
  const isoMapa = document.getElementById("isoMapa");
  if (isoMapa) {
    gsap.from(isoMapa.querySelector(".mapa-alvo"), {
      y: 46, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".casa-mapa", start: "top 80%" },
    });
    gsap.from(isoMapa.querySelector(".mapa-pino"), {
      y: -34, opacity: 0, duration: 0.9, delay: 0.4, ease: "back.out(1.7)",
      scrollTrigger: { trigger: ".casa-mapa", start: "top 80%" },
    });
  }

  /* ── monitor: leve flutuação + tilt ── */
  const monitorWrap = document.querySelector(".monitor-wrap");
  if (monitorWrap) {
    gsap.to(".monitor", {
      y: -8, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut",
    });
    if (!isTouch) {
      monitorWrap.addEventListener("mousemove", (e) => {
        const r = monitorWrap.getBoundingClientRect();
        gsap.to(".monitor", {
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * 6,
          rotateX: -((e.clientY - r.top) / r.height - 0.5) * 4,
          transformPerspective: 900,
          duration: 0.5, ease: "power2.out",
        });
      });
      monitorWrap.addEventListener("mouseleave", () =>
        gsap.to(".monitor", { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" })
      );
    }
  }

  /* ── vitrine: túnel horizontal ── */
  const rail = document.getElementById("rail");
  const track = document.getElementById("railTrack");

  if (!isTouch && !isNarrow) {
    const distancia = () => track.scrollWidth - rail.clientWidth;
    const tween = gsap.to(track, {
      x: () => -Math.max(0, distancia()),
      ease: "none",
      scrollTrigger: {
        trigger: ".vitrine",
        start: "top top",
        end: () => "+=" + Math.max(600, distancia()),
        pin: ".vitrine-pin",
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    document.querySelectorAll("[data-shift]").forEach((img) => {
      gsap.fromTo(img, { xPercent: -6 }, {
        xPercent: 6, ease: "none",
        scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
      });
    });
  } else {
    rail.addEventListener("scroll", () => {
      const p = rail.scrollLeft / Math.max(1, track.scrollWidth - rail.clientWidth);
      document.querySelectorAll("[data-shift]").forEach((img) => {
        img.style.transform = `scale(1.12) translateX(${(p - 0.5) * 9}%)`;
      });
    }, { passive: true });
  }

  /* ── 25 anos: cubos respiram ── */
  document.querySelectorAll(".eco-svg .cube").forEach((cube, i) => {
    gsap.to(cube, {
      y: i % 2 ? 10 : -10,
      duration: 2.4 + i * 0.3,
      yoyo: true, repeat: -1, ease: "sine.inOut",
    });
  });
  gsap.to(".eco-badge", {
    y: -6, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut",
  });

  /* ── banner: leve tilt 3d ── */
  const banner = document.querySelector("[data-tilt]");
  if (banner && !isTouch) {
    banner.addEventListener("mousemove", (e) => {
      const r = banner.getBoundingClientRect();
      gsap.to(banner, {
        rotateY: ((e.clientX - r.left) / r.width - 0.5) * 5,
        rotateX: -((e.clientY - r.top) / r.height - 0.5) * 4,
        transformPerspective: 900,
        duration: 0.5, ease: "power2.out",
      });
    });
    banner.addEventListener("mouseleave", () =>
      gsap.to(banner, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" })
    );
  }

  /* ── rodapé gigante ── */
  gsap.to("[data-marquee-slow]", {
    xPercent: -22, ease: "none",
    scrollTrigger: { trigger: ".rodape", start: "top bottom", end: "bottom top", scrub: 0.8 },
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();

/* ═══════════════════════════════════════════════════════════════
   MAPA DA LOJA — Leaflet + tiles escuros CARTO
   Roda fora do IIFE do GSAP: o mapa funciona mesmo sem as libs
   de animação. Inicializa só quando a seção entra na tela.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* atenção: o bundle do Lenis também deixa um global `L`, por isso o teste
     é pelo L.map e não só pela existência da variável */
  const el = document.getElementById("mapaLoja");
  if (!el || typeof L === "undefined" || typeof L.map !== "function") return;

  const lat = parseFloat(el.dataset.lat);
  const lng = parseFloat(el.dataset.lng);
  const zoom = parseInt(el.dataset.zoom, 10) || 17;
  const rota =
    "https://www.google.com/maps/dir/?api=1&destination=R.+Jo%C3%A3o+Pessoa%2C+77+-+loja+5+-+Centro%2C+Canela+-+RS%2C+95686-050";
  const isTouch =
    "ontouchstart" in window && matchMedia("(pointer: coarse)").matches;
  const lock = document.querySelector(".casa-map-lock");

  let pronto = false;

  const montar = () => {
    if (pronto) return;
    pronto = true;

    const map = L.map(el, {
      center: [lat, lng],
      zoom,
      minZoom: 13,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: false,   // a roda continua rolando a página
      dragging: !isTouch,       // no celular só arrasta após o toque
      tap: false,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &middot; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      }
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const pino = L.divIcon({
      className: "",
      html: '<span class="pino-loja"><b></b><i></i></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -12],
    });

    L.marker([lat, lng], { icon: pino, title: "INFOLAB", keyboard: false })
      .addTo(map)
      .bindPopup(
        '<b>INFOLAB</b>R. João Pessoa, 77 — Loja 5<br>Centro · Canela/RS<br>' +
          '<a href="' + rota + '" target="_blank" rel="noopener">Traçar rota →</a>',
        { closeButton: true, offset: [0, -4] }
      );

    /* roda do mouse: só dá zoom depois de um clique dentro do mapa */
    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());

    /* celular: a trava some no primeiro toque e libera o arrasto */
    if (isTouch && lock) {
      lock.hidden = false;
      lock.addEventListener("click", () => {
        map.dragging.enable();
        map.touchZoom.enable();
        lock.hidden = true;
      });
    }

    el.classList.add("is-on");
    addEventListener("resize", () => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 250);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          montar();
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
  } else {
    montar();
  }
})();
