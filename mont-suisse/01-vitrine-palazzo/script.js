/* MONT SUISSE · 01 VITRINE — sem bibliotecas */
(function () {
  'use strict';
  var raiz = document.documentElement;
  var semAnim = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ---- os treze sabores: fonte única de verdade ---- */
  /* TODO cliente: cada sabor merece a sua própria foto; hoje quatro fotos se revezam. */
  var SABORES = [
    ['Clássico Belga',      'Chocolate belga 54% e sal em floco.',            0],
    ['Biscoff',             'Recheio de speculoos, borda crocante.',          1],
    ['Nutella',             'Creme de avelã que escorre no primeiro corte.',  2],
    ['Dark Laka',           'Meio amargo por fora, Laka derretida por dentro.',3],
    ['Ruby',                'Chocolate ruby, acidez natural de frutas vermelhas.',0],
    ['Nozes, Laka e Leite', 'Noz crocante entre dois chocolates.',            1],
    ['Kinder Bueno',        'Wafer e avelã, ao leite, do jeito que você lembra.',2],
    ['Triplo Chocolate',    'Branco, ao leite e meio amargo na mesma massa.',  3],
    ['Snickers',            'Amendoim torrado e caramelo salgado.',           0],
    ["S'mores",             'Marshmallow tostado sobre biscoito amanteigado.',1],
    ['Red Velvet',          'Cacau suave com recheio de cream cheese.',        2],
    ['Ferrero',             'Avelã inteira, wafer e chocolate ao leite.',      3],
    ['Pistache',            'Creme de pistache siciliano, sem corante.',       3]
  ];

  var lista = $('#listaSabores'), nome = $('#sabNome'), desc = $('#sabDesc');
  var fotos = $$('#medFoto img'), aro = $('#aro');
  var atual = -1;

  /* perímetro da elipse do aro (Ramanujan) para o traçado */
  var PERIM = (function () {
    if (!aro) return 0;
    var a = +aro.getAttribute('rx'), b = +aro.getAttribute('ry');
    return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  })();

  function escolher(i, tracar) {
    if (i === atual) return;
    atual = i;
    var s = SABORES[i];
    nome.textContent = s[0];
    desc.textContent = s[1];

    fotos.forEach(function (img, k) {
      var on = k === s[2];
      if (on && !img.getAttribute('src') && img.getAttribute('data-src')) {
        img.setAttribute('src', img.getAttribute('data-src'));
      }
      img.classList.toggle('on', on);
    });

    $$('button', lista).forEach(function (b, k) {
      b.setAttribute('aria-pressed', String(k === i));
    });

    /* a moldura se redesenha — a assinatura do site */
    if (aro && tracar && !semAnim) {
      aro.style.transition = 'none';
      aro.style.strokeDasharray = PERIM;
      aro.style.strokeDashoffset = PERIM;
      void aro.getBoundingClientRect();
      aro.style.transition = 'stroke-dashoffset 1.05s cubic-bezier(.65,0,.35,1)';
      aro.style.strokeDashoffset = '0';
    }
  }

  SABORES.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', String(i === 0));
    b.innerHTML = '<i>' + String(i + 1).padStart(2, '0') + '</i><b></b>';
    $('b', b).textContent = s[0];
    b.addEventListener('click', function () { escolher(i, true); });
    b.addEventListener('mouseenter', function () { escolher(i, true); });
    lista.appendChild(b);
  });
  escolher(0, false);

  /* ---- abertura ---- */
  var cortina = $('#cortina');
  (function abrir() {
    if (!cortina) return;
    if (semAnim || sessionGet('ms01')) { cortina.classList.add('sai'); return; }
    var p = $('.placa', cortina);
    setTimeout(function () { if (p) p.classList.add('on'); }, 130);
    var pronto = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([pronto, new Promise(function (r) { setTimeout(r, 2400); })]).then(function () {
      setTimeout(function () { cortina.classList.add('sai'); sessionSet('ms01', '1'); }, 700);
    });
  })();
  function sessionGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

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
  var pend = false;
  function rolou() { if (topo) topo.classList.toggle('fixo', scrollY > 20); pend = false; }
  addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(rolou); } }, { passive: true });
  rolou();

  /* ---- revelações ---- */
  var alvos = $$('[data-rv]');
  if ('IntersectionObserver' in window && !semAnim) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
    alvos.forEach(function (e) { obs.observe(e); });
  } else { alvos.forEach(function (e) { e.classList.add('vis'); }); }
  setTimeout(function () { var c = $('#capa'); if (c) c.classList.add('vis'); }, 60);

  /* as outras fotos do medalhão entram depois que a página está de pé */
  addEventListener('load', function () {
    (window.requestIdleCallback || function (f) { return setTimeout(f, 800); })(function () {
      fotos.forEach(function (img) {
        if (!img.getAttribute('src') && img.getAttribute('data-src')) img.setAttribute('src', img.getAttribute('data-src'));
      });
    });
  });

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
