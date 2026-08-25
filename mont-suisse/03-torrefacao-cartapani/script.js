/* MONT SUISSE · 03 TORREFAÇÃO — sem bibliotecas */
(function () {
  'use strict';
  var semAnim = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* TODO cliente: cada recheio merece a sua foto; hoje quatro se revezam. */
  var FOTOS = ['img/cookie-recheio.webp', 'img/cookie-papel.webp', 'img/cookie-calda.webp', 'img/cookies-choco.webp'];
  var ALTS = [
    'Cookie partido ao meio mostrando o recheio escorrendo',
    'Cookie recheado sobre papel-manteiga amassado',
    'Calda escorrendo sobre cookies empilhados',
    'Cookies com pedaços de chocolate espalhados sobre superfície clara'
  ];
  var SABORES = [
    ['Clássico Belga','Chocolate belga 54% · sal em floco · massa de manteiga'],
    ['Biscoff','Recheio de speculoos · borda crocante · canela discreta'],
    ['Nutella','Creme de avelã · centro que escorre no corte'],
    ['Dark Laka','Meio amargo por fora · Laka derretida por dentro'],
    ['Ruby','Chocolate ruby · acidez natural de frutas vermelhas'],
    ['Nozes, Laka e Leite','Noz crocante · dois chocolates na mesma massa'],
    ['Kinder Bueno','Wafer e avelã · chocolate ao leite'],
    ['Triplo Chocolate','Branco · ao leite · meio amargo'],
    ['Snickers','Amendoim torrado · caramelo salgado'],
    ["S'mores",'Marshmallow tostado · biscoito amanteigado'],
    ['Red Velvet','Cacau suave · recheio de cream cheese'],
    ['Ferrero','Avelã inteira · wafer · chocolate ao leite'],
    ['Pistache','Creme de pistache siciliano · sem corante']
  ];

  var raiz = $('#fichaLista');
  if (raiz) SABORES.forEach(function (s, i) {
    var n = String(i + 1).padStart(2, '0');
    var d = document.createElement('div');
    d.className = 'ficha__l';
    d.innerHTML =
      '<h3 style="margin:0"><button class="ficha__bt" type="button" aria-expanded="false" aria-controls="p' + n + '">' +
        '<span>' + n + '</span><span class="nm"></span><span class="ac">[ Provar ]</span>' +
      '</button></h3>' +
      '<div class="ficha__cx"><div class="ficha__in"><div class="ficha__pan" id="p' + n + '" role="region">' +
        '<div><p class="ficha__gr"></p><p class="ficha__d"></p></div>' +
        '<figure class="ficha__f"><img loading="lazy" decoding="async" width="1200" height="800"></figure>' +
      '</div></div></div>';
    $('.nm', d).textContent = s[0];
    $('.ficha__gr', d).textContent = s[0];
    $('.ficha__d', d).textContent = s[1];
    var img = $('img', d);
    img.setAttribute('src', FOTOS[i % FOTOS.length]);   /* são só 4 arquivos: o cache resolve */
    img.alt = ALTS[i % ALTS.length];
    $('button', d).setAttribute('aria-label', s[0] + ' — ver a ficha');
    raiz.appendChild(d);
  });

  var linhas = $$('.ficha__l');
  linhas.forEach(function (l) {
    var bt = $('.ficha__bt', l);
    bt.addEventListener('click', function () {
      var abrir = !l.classList.contains('on');
      linhas.forEach(function (o) {
        o.classList.remove('on');
        $('.ficha__bt', o).setAttribute('aria-expanded', 'false');
        $('.ficha__bt .ac', o).textContent = '[ Provar ]';
      });
      if (abrir) {
        l.classList.add('on');
        bt.setAttribute('aria-expanded', 'true');
        $('.ac', bt).textContent = '[ Fechar ]';
      }
    });
  });

  /* ---- topo + gaveta ---- */
  var topo = $('#topo'), bt = $('#menuBt'), gav = $('#gaveta');
  function fechar() {
    if (!gav || !gav.classList.contains('on')) return;
    gav.classList.remove('on'); bt.setAttribute('aria-expanded', 'false');
    bt.textContent = '[ Menu ]'; document.body.style.overflow = '';
  }
  if (bt && gav) {
    bt.addEventListener('click', function () {
      var on = gav.classList.toggle('on');
      bt.setAttribute('aria-expanded', String(on));
      bt.textContent = on ? '[ Fechar ]' : '[ Menu ]';
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

  var alvos = $$('[data-rv]');
  if ('IntersectionObserver' in window && !semAnim) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
    alvos.forEach(function (e) { obs.observe(e); });
  } else { alvos.forEach(function (e) { e.classList.add('vis'); }); }

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
