/* MONT SUISSE · 04 — a síntese. Sem bibliotecas. */
(function () {
  'use strict';
  var semAnim = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* TODO cliente: cada recheio merece a sua foto; hoje cinco se revezam. */
  var FOTOS = [
    ['img/cookie-recheio.webp', 'Cookie partido ao meio mostrando o recheio escorrendo'],
    ['img/cookie-papel.webp',   'Cookie recheado sobre papel-manteiga amassado'],
    ['img/cookies-choco.webp',  'Cookies com pedaços de chocolate sobre superfície clara'],
    ['img/cookie-unico.webp',   'Cookie de chocolate visto de perto sobre fundo neutro'],
    ['img/pistache.webp',       'Doces de pistache sobre mesa clara']
  ];
  var SABORES = [
    ['Clássico Belga','Chocolate belga 54% e sal em floco'],
    ['Biscoff','Recheio de speculoos, borda crocante'],
    ['Nutella','Creme de avelã que escorre no corte'],
    ['Dark Laka','Meio amargo por fora, Laka por dentro'],
    ['Ruby','Chocolate ruby e frutas vermelhas'],
    ['Nozes, Laka e Leite','Noz crocante entre dois chocolates'],
    ['Kinder Bueno','Wafer e avelã, ao leite'],
    ['Triplo Chocolate','Branco, ao leite e meio amargo'],
    ['Snickers','Amendoim torrado e caramelo salgado'],
    ["S'mores",'Marshmallow tostado sobre biscoito'],
    ['Red Velvet','Cacau suave com cream cheese'],
    ['Ferrero','Avelã inteira, wafer e chocolate'],
    ['Pistache','Creme de pistache siciliano']
  ];

  /* ---- ASSINATURA: a vitrine de vidro ---- */
  var prat = $('#prateleira'), nome = $('#vtNome'), desc = $('#vtDesc');
  if (prat) {
    SABORES.forEach(function (s, i) {
      var f = FOTOS[i % FOTOS.length];
      var li = document.createElement('li');
      li.className = 'pc';
      li.innerHTML = '<figure><img loading="lazy" decoding="async" width="600" height="600"></figure><b></b>';
      var img = $('img', li);
      img.src = f[0]; img.alt = f[1] + ' — ' + s[0];
      $('b', li).textContent = s[0];
      prat.appendChild(li);
    });

    var pecas = $$('.pc', prat);
    var atual = -1, pend = false;

    function centralizar() {
      var cx = prat.getBoundingClientRect().left + prat.clientWidth / 2;
      var melhor = 0, dist = Infinity;
      pecas.forEach(function (p, i) {
        var r = p.getBoundingClientRect();
        var d = Math.abs(r.left + r.width / 2 - cx);
        if (d < dist) { dist = d; melhor = i; }
      });
      if (melhor !== atual) {
        atual = melhor;
        pecas.forEach(function (p, i) { p.classList.toggle('centro', i === melhor); });
        if (nome) nome.textContent = SABORES[melhor][0];
        if (desc) desc.textContent = SABORES[melhor][1];
      }
      pend = false;
    }
    prat.addEventListener('scroll', function () {
      if (!pend) { pend = true; requestAnimationFrame(centralizar); }
    }, { passive: true });
    addEventListener('resize', centralizar);

    /* teclado: setas andam pela prateleira */
    prat.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var alvo = Math.max(0, Math.min(pecas.length - 1, atual + d));
      pecas[alvo].scrollIntoView({ behavior: semAnim ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    });

    addEventListener('load', centralizar);
    setTimeout(centralizar, 300);
  }

  /* ---- topo + gaveta ---- */
  var topo = $('#topo'), bt = $('#menuBt'), gav = $('#gaveta');
  function fechar() {
    if (!gav || !gav.classList.contains('on')) return;
    gav.classList.remove('on'); bt.setAttribute('aria-expanded', 'false');
    bt.setAttribute('aria-label', 'Abrir menu'); document.body.style.overflow = '';
  }
  if (bt && gav) {
    bt.addEventListener('click', function () {
      var on = gav.classList.toggle('on');
      bt.setAttribute('aria-expanded', String(on));
      bt.setAttribute('aria-label', on ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = on ? 'hidden' : '';
      if (on) { var a = $('a', gav); if (a) a.focus(); }
    });
    $$('a', gav).forEach(function (a) { a.addEventListener('click', fechar); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gav.classList.contains('on')) { fechar(); bt.focus(); }
    });
  }
  var p2 = false;
  function rolou() { if (topo) topo.classList.toggle('fixo', scrollY > 20); p2 = false; }
  addEventListener('scroll', function () { if (!p2) { p2 = true; requestAnimationFrame(rolou); } }, { passive: true });
  rolou();

  var alvos = $$('[data-rv]');
  if ('IntersectionObserver' in window && !semAnim) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
    alvos.forEach(function (e) { obs.observe(e); });
  } else { alvos.forEach(function (e) { e.classList.add('vis'); }); }

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
