/* MONT SUISSE · 02 BALCÃO — sem bibliotecas */
(function () {
  'use strict';
  var semAnim = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ---- abertura ---- */
  var guarda = {
    ler: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    gravar: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  (function abrir() {
    var a = $('#abertura');
    if (!a) return;
    if (semAnim || guarda.ler('ms02')) { a.classList.add('fora'); return; }
    requestAnimationFrame(function () { a.classList.add('pinta', 'on'); });
    var pronto = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([pronto, new Promise(function (r) { setTimeout(r, 2400); })]).then(function () {
      setTimeout(function () {
        a.classList.add('sai');
        guarda.gravar('ms02', '1');
        setTimeout(function () { a.classList.add('fora'); }, 1100);
      }, 900);
    });
  })();

  /* ---- CARDÁPIO: o cookie no centro, um sabor por vez ----
     Passa de lado (setas, teclado, arrasto, roda horizontal) — nunca sequestra
     a rolagem vertical, para quem não quiser ver os treze poder seguir em frente.
     Os treze vivem no <ol class="card__lista"> do HTML: texto real, indexável e
     útil sem JS. O palco só lê de lá. */
  (function cardapio() {
    var lista = $('#cardLista'), linha = $('#cPalcoLinha');
    if (!lista || !linha) return;
    var itens = $$('li', lista);
    if (!itens.length) return;

    var dados = itens.map(function (li) {
      return { nome: $('b', li).textContent, ing: li.getAttribute('data-ing'),
               nota: li.getAttribute('data-nota'), g1: li.getAttribute('data-g1'), g2: li.getAttribute('data-g2') };
    });

    var elNome = $('#cNome'), elCont = $('#cCont'), elIng = $('#cIng'),
        elNota = $('#cNota'), elBarra = $('#cBarra'), cookie = $('#cCookie'), pulo = $('#cPulo'),
        u1 = $('#cU1'), u2 = $('#cU2'), g1 = $('#cG1'), g2 = $('#cG2');
    var fotos = $$('.ck', pulo);
    var atual = -1, geracao = 0, seguindoMouse = false;

    function mostrar(i) {
      if (i === atual) return;
      atual = i;
      var d = dados[i];
      elNome.textContent = d.nome;
      elCont.textContent = String(i + 1).padStart(2, '0') + ' / ' + dados.length;
      elIng.textContent = d.ing;
      elNota.textContent = d.nota;
      elBarra.style.width = ((i + 1) / dados.length * 100).toFixed(1) + '%';

      /* TODO cliente: um recorte por sabor. Por enquanto os dois se revezam. */
      var qual = i % fotos.length;
      fotos.forEach(function (f, k) { f.classList.toggle('on', k === qual); });

      /* trocas rápidas se atropelam: sem marcar geração, o timeout de um sabor
         antigo chega depois e sobrescreve o glifo do atual. */
      geracao++;
      var g = geracao;
      [[g1, u1, d.g1], [g2, u2, d.g2]].forEach(function (par) {
        par[0].classList.remove('on');
        setTimeout(function () {
          if (g !== geracao) return;
          par[1].setAttribute('href', '#' + par[2]);
          par[0].classList.add('on');
        }, semAnim ? 0 : 170);
      });

      if (!semAnim && pulo) {
        pulo.classList.remove('salta');
        void pulo.offsetWidth;
        pulo.classList.add('salta');
      }
    }

    function passo(d) { mostrar((atual + d + dados.length) % dados.length); }

    $('#cAnt').addEventListener('click', function () { passo(-1); });
    $('#cProx').addEventListener('click', function () { passo(1); });

    linha.setAttribute('tabindex', '0');
    linha.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); passo(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); passo(-1); }
    });

    /* arrasto do polegar e do mouse */
    var x0 = null;
    linha.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button === 0) x0 = e.clientX; });
    linha.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) passo(dx < 0 ? 1 : -1);
    });
    linha.addEventListener('pointercancel', function () { x0 = null; });

    /* roda/trackpad na horizontal: o gesto que o cliente pediu */
    var travaRoda = 0;
    linha.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) < 18 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      var agora = Date.now();
      if (agora - travaRoda < 420) return;
      travaRoda = agora;
      e.preventDefault();
      passo(e.deltaX > 0 ? 1 : -1);
    }, { passive: false });

    /* inclinação pelo cursor: o volume que faz o cookie parecer solto da parede */
    if (cookie && !semAnim && matchMedia('(hover:hover) and (pointer:fine)').matches) {
      var palco = $('.card__palco');
      palco.addEventListener('pointermove', function (e) {
        var r = palco.getBoundingClientRect();
        seguindoMouse = true;
        cookie.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 16).toFixed(2) + 'deg');
        cookie.style.setProperty('--rx', (7 - ((e.clientY - r.top) / r.height - .5) * 12).toFixed(2) + 'deg');
      });
      palco.addEventListener('pointerleave', function () {
        seguindoMouse = false;
        cookie.style.setProperty('--rx', '7deg');
        cookie.style.setProperty('--ry', '-5deg');
      });
    }

    /* as gravuras deslizam devagar conforme a seção atravessa a tela */
    var gravuras = $$('.gr'), FATOR = [-40, 28, 34, -26], secao = $('#cardapio'), pend = false;
    function paralaxe() {
      if (!semAnim && gravuras.length) {
        var r = secao.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
        gravuras.forEach(function (gr, i) {
          gr.style.setProperty('--py', ((p - .5) * (FATOR[i % FATOR.length] || 30)).toFixed(1) + 'px');
        });
      }
      pend = false;
    }
    addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(paralaxe); } }, { passive: true });

    mostrar(0); paralaxe();
  })();

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

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
