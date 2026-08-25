# Dkasa Acabamentos — site

HTML, CSS e JavaScript puros. Sem build, sem dependências: abra `index.html`
com dois cliques ou publique a pasta inteira em qualquer hospedagem estática.

```
index.html      Home (capa, produtos, marcas, orçamento, inspiração, sobre, localização)
produtos.html   Catálogo das cinco categorias
style.css       Sistema visual completo
script.js       Cortina, régua de acabamentos, revelações, mapa sob demanda
img/            16 imagens em WebP (1,5 MB no total) — `loja-fachada.webp` é foto do cliente
favicon.svg
```

## O sistema

**Paleta** — `--ardosia #10171A`, `--vapor #E7E4DE`, `--verde-termal #1B3335`,
`--microcimento #8C8A85`, `--tinta #14181A`. A cor de acento (`--metal`) **não é fixa**:
é o acabamento que o visitante escolhe na capa. Quatro valores de linha —
Cromo `#C3CCD1`, Grafite `#CFCEC9`, Dourado Escovado `#C79B57`, Champanhe `#D3BB9E`.

**Tipografia** — Prata (display, peso único) e Archivo (texto). Google Fonts.

**Forma** — o arco, silhueta do espelho sobre a cuba, usado como máscara no topo
das imagens.

## A régua de acabamentos

O elemento de assinatura. Quatro chapas metálicas na capa; ao escolher uma,
a foto dissolve para aquele ambiente e **todo o site se retinge** naquele metal
em 700 ms (via `@property --metal`, que torna a variável animável). A escolha
fica em `sessionStorage` e atravessa a navegação entre as duas páginas.

Para trocar as fotos: substitua `img/hero-{grafite,cromo,dourado,champanhe}.webp`.
Para mexer nas cores de cada acabamento: bloco `html[data-acab="..."]` no topo do
`style.css`.

## Pendências do cliente

Tudo abaixo está com valor provisório e marcado com `<!-- TODO cliente -->` no HTML.

| O quê | Onde |
|---|---|
| **Número** da Rua Dom Pedro II | `#localizacao`, rodapé, JSON-LD — rua/bairro/CEP vieram do cadastro da loja no Google e devem ser conferidos |
| Telefone / WhatsApp | links `tel:` e `wa.me` (5 ocorrências) |
| E-mail | `#localizacao` |
| Horários de funcionamento | `#localizacao` e JSON-LD |
| Logotipos das marcas | `#marcas` — trocar cada `.marca-slot` por um `<img>` |
| Fotos reais de portfólio | `#inspiracao` (6 imagens) e as legendas de acabamento |
| **Diferencial da loja** | 3.º parágrafo de `#sobre` — o briefing veio em branco; o texto atual é uma hipótese |
| Domínio final | `<link rel="canonical">` e `og:url` das duas páginas |
| Pin na porta exata | `.mapa iframe[src]` e o link *Traçar rota* usam a coordenada fixa `-29.3677117,-50.8108202` (Rua Dom Pedro II / Centro / CEP 95680-222). É precisa na **rua**, não na porta — com o número dá para afinar. Não use busca por nome aqui: quando o Google não resolve, o embed abre no mapa-múndi. |

As imagens são do Unsplash e servem de referência de direção de arte;
troque por fotografia própria antes de publicar.

## Acessibilidade e performance

- Um `<h1>` por página, hierarquia sem saltos, `alt` em todas as imagens.
- Contraste mínimo de 4,5:1 verificado em todos os pares de texto pequeno.
- Foco de teclado visível em todos os controles; a régua funciona com as setas.
- `prefers-reduced-motion` desliga cortina, revelações e paralaxe.
- Só a capa do acabamento padrão carrega de imediato; as outras três entram
  em `requestIdleCallback` depois do `load`. Todas as demais imagens e o mapa
  usam `loading="lazy"`.
