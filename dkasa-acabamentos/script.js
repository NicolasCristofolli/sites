/* =========================================================
   DKASA ACABAMENTOS — comportamento
   Sem bibliotecas: IntersectionObserver + transições CSS.
   ========================================================= */
(function () {
  'use strict';

  var raiz     = document.documentElement;
  var semAnim  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $        = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$       = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* sessionStorage pode lançar em file:// e em janelas anônimas — uma exceção
     de armazenamento não pode derrubar o resto do script */
  var guarda = {
    ler:    function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    gravar: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  var NOMES = {
    grafite:   'Grafite Fosco',
    cromo:     'Cromo Polido',
    dourado:   'Dourado Escovado',
    champanhe: 'Champanhe'
  };

  /* ---------- 1. cortina de abertura / transição de página ---------- */

  var cortina = $('#cortina');

  function abrirCortina() {
    if (!cortina) return;
    if (semAnim || guarda.ler('dkasa-abertura')) {
      cortina.classList.add('fora');
      return;
    }
    var marca = $('.cortina__m', cortina);
    setTimeout(function () { if (marca) marca.classList.add('on'); }, 120);

    var pronto = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var teto   = new Promise(function (r) { setTimeout(r, 2600); });

    Promise.race([pronto, teto]).then(function () {
      setTimeout(function () {
        cortina.classList.add('sai');
        setTimeout(function () {
          cortina.classList.add('fora');
          guarda.gravar('dkasa-abertura', '1');
        }, 1050);
      }, 620);
    });
  }

  function transicaoDeSaida(url) {
    if (semAnim || !cortina) { window.location.href = url; return; }
    cortina.classList.remove('fora', 'sai');
    cortina.classList.add('entra');
    /* força reflow para a classe .entra valer antes de .fecha */
    void cortina.offsetWidth;
    cortina.classList.add('fecha');
    setTimeout(function () { window.location.href = url; }, 560);
  }

  $$('a[data-rota]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var url = a.getAttribute('href');
      if (!url || url.charAt(0) === '#' || a.target === '_blank') return;
      e.preventDefault();
      fecharGaveta();
      transicaoDeSaida(url);
    });
  });

  /* ---------- 2. topo + gaveta mobile ---------- */

  var topo       = $('#topo');
  var hamburguer = $('#hamburguer');
  var gaveta     = $('#gaveta');

  function fecharGaveta() {
    if (!gaveta || !gaveta.classList.contains('aberta')) return;
    gaveta.classList.remove('aberta');
    hamburguer.setAttribute('aria-expanded', 'false');
    hamburguer.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
  }

  if (hamburguer && gaveta) {
    hamburguer.addEventListener('click', function () {
      var aberta = gaveta.classList.toggle('aberta');
      hamburguer.setAttribute('aria-expanded', String(aberta));
      hamburguer.setAttribute('aria-label', aberta ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = aberta ? 'hidden' : '';
      if (aberta) { var p = $('a', gaveta); if (p) p.focus(); }
    });
    $$('a', gaveta).forEach(function (a) { a.addEventListener('click', fecharGaveta); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gaveta.classList.contains('aberta')) { fecharGaveta(); hamburguer.focus(); }
    });
  }

  /* ---------- 3. régua de acabamentos (elemento de assinatura) ---------- */

  var imagens = $$('[data-acab-img]');
  var rotulo  = $('#nome-acabamento');
  var rodape  = $('#rodape-acabamento');

  function aplicarAcabamento(chave) {
    if (!NOMES[chave]) return;
    raiz.setAttribute('data-acab', chave);
    imagens.forEach(function (img) {
      var ativa = img.getAttribute('data-acab-img') === chave;
      if (ativa && !img.getAttribute('src') && img.getAttribute('data-src')) {
        img.setAttribute('src', img.getAttribute('data-src'));
      }
      img.classList.toggle('ativa', ativa);
    });
    if (rotulo) rotulo.textContent = NOMES[chave];
    if (rodape) rodape.textContent = NOMES[chave];
    guarda.gravar('dkasa-acabamento', chave);
  }

  $$('input[name="acabamento"]').forEach(function (input) {
    input.addEventListener('change', function () { aplicarAcabamento(input.value); });
  });

  /* mantém a escolha entre index.html e produtos.html */
  var salvo = guarda.ler('dkasa-acabamento');
  if (salvo && NOMES[salvo]) {
    var alvo = $('input[name="acabamento"][value="' + salvo + '"]');
    if (alvo) { alvo.checked = true; }
    aplicarAcabamento(salvo);
  }

  /* as outras chapas só baixam depois que a página já está de pé */
  function preCarregarAcabamentos() {
    imagens.forEach(function (img) {
      if (!img.getAttribute('src') && img.getAttribute('data-src')) {
        img.setAttribute('src', img.getAttribute('data-src'));
      }
    });
  }

  /* ---------- 4. revelações ---------- */

  var alvos = $$('[data-rv]');
  if ('IntersectionObserver' in window && !semAnim) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('vis');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    alvos.forEach(function (el) { obs.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('vis'); });
  }

  /* o H1 tem revelação própria (linhas em máscara) */
  var h1 = $('.capa__t');
  function revelarCapa() {
    if (h1) h1.classList.add('vis');
    var quadro = $('.quadro');
    if (quadro) quadro.classList.add('vis');
  }

  /* ---------- 5. topo fixo + fio da espinha ---------- */

  var fios = $$('[data-fio]');
  var pendente = false;

  function aoRolar() {
    if (topo) topo.classList.toggle('fixo', window.scrollY > 24);

    var vh = window.innerHeight;
    fios.forEach(function (fio) {
      var secao = fio.closest('section');
      if (!secao) return;
      var r = secao.getBoundingClientRect();
      var p = (vh * 0.9 - r.top) / Math.max(r.height, 1);
      p = Math.max(0, Math.min(1, p));
      fio.style.setProperty('--fio', (p * 100).toFixed(2) + '%');
    });
    pendente = false;
  }

  function agendar() {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(aoRolar);
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);

  /* ---------- 6. início ---------- */

  var ano = $('#ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  abrirCortina();
  agendar();
  setTimeout(revelarCapa, semAnim ? 0 : (guarda.ler('dkasa-abertura') ? 120 : 1500));

  window.addEventListener('load', function () {
    var ocioso = window.requestIdleCallback || function (fn) { return setTimeout(fn, 900); };
    ocioso(preCarregarAcabamentos);
    agendar();
  });
})();
