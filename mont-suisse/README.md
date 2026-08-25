# Mont Suisse — quatro propostas

Quatro sites completos e independentes. Cada pasta abre com dois cliques no
`index.html` (HTML/CSS/JS puros, sem build, sem dependência de biblioteca).

```
01-vitrine-palazzo/      leitura do palazzosogni.com
02-balcao-lillipilli/    leitura do lillipillipatisserie.com
03-torrefacao-cartapani/ leitura do cartapani.it
04-mont-suisse/          a síntese das três
_assets/                 banco de imagens comum (não é publicado)
```

## O que os quatro têm em comum

O que decide a identidade não são as referências: são as **fotos da loja**.
Armário verde-sálvia, parede marfim, latão no vidro da vitrine, carvalho claro
no piso e um logotipo de moldura oval rendilhada. O verde do armário aparece nos
quatro — é o que faz os quatro serem *Mont Suisse* e não quatro padarias quaisquer.

**Endereço real, geocodificado:** Aldeia do Papai Noel — Rua Bela Vista, 353,
Centro, Gramado / RS, 95670-000 (`-29.3773601, -50.8665441`). O mapa usa
coordenada fixa, nunca busca por nome: quando o Google não resolve a busca,
o *embed* abre no mapa-múndi.

Os treze sabores vivem numa **lista única** dentro do `script.js` de cada site.
Editar lá muda o cardápio inteiro da página.

## As quatro propostas

| | Paleta | Tipografia | Elemento de assinatura |
|---|---|---|---|
| **01 Vitrine** | marfim `#F4EFE6` · alpino `#8FA6AE` · armário `#5C6B58` · ouro `#B08C4F` · nogueira `#4A3D2E` | Marcellus + Karla | **A cartela de sabores** — medalhão oval rendilhado; ao escolher um nome, o cookie troca e a moldura se redesenha traço a traço |
| **02 Balcão** | creme `#F6F1E4` · verde `#4E6350` · sálvia `#A8B79A` · framboesa `#B8546B` · cacau `#3B2E26` | Instrument Serif + Figtree | **Monte a sua travessa** — morango e sorvete desenhados em SVG caem sobre a foto. Tem ainda o **cardápio central**: um cookie no meio, treze sabores percorridos pela rolagem, papel de parede toile e doze desenhos de ingrediente |
| **03 Torrefação** | areia `#E8DAC8` · massa `#F7EFE4` · tinta `#5E5644` · tan `#C7AD98` · verde `#66755F` | EB Garamond + Space Mono | **A ficha de fornada** — treze linhas de fio; abrir uma faz o nome explodir em serifada gigante tom-sobre-tom |
| **04 Mont Suisse** | marfim `#F5EFE3` · vitrine `#55694F` · sálvia `#AFBCA4` · latão `#B08A45` · nogueira `#3F3328` | Fraunces (*wonk*) + Hanken Grotesk | **A vitrine de vidro** — o balcão de latão da loja; arrastar percorre a prateleira e o cookie do meio sobe e assina o nome |

O 03 usa fio fino e grade rígida de propósito: é a citação do Cartapani, não um
padrão meu. Nos outros três não há régua de jornal.

## Verificado (não presumido)

Os quatro, em 1440 px, 390 px e 320 px, e também em `file://`:
um `<h1>` por página, hierarquia sem saltos, `alt` em todas as imagens, nenhuma
imagem quebrada, zero *overflow* horizontal, anel de foco visível em todos os
pontos de tabulação, JSON-LD válido e `prefers-reduced-motion` desligando cortina,
revelações e esteiras.

**Contraste:** todos os pares de texto pequeno passam de 4,5:1. Em cada paleta as
cores de *traço e fundo* são separadas das de *texto* — o latão e a sálvia são
bonitos como moldura e reprovam como legenda, então existem `--latao-txt`,
`--ouro-txt`, `--sage-txt`, `--verde-txt`, `--framboesa-txt`.

## Pendências do cliente

Marcadas com `<!-- TODO cliente -->` no HTML de cada site.

| O quê | Onde |
|---|---|
| **Foto de cada um dos 13 sabores** | hoje 4 a 5 fotos se revezam nas listas — é a pendência mais visível. No site 02 o cardápio central pede **recorte em PNG com fundo transparente**, um por sabor, para o cookie flutuar sobre o papel de parede |
| Número da loja dentro da Aldeia | `#onde`, rodapé e JSON-LD |
| Horários reais | `#onde` e JSON-LD (hoje: todos os dias, 10h–20h) |
| @ do Instagram | hoje `@montsuisse`, a confirmar |
| Domínio final | `canonical` e `og:url` |
| Descrição dos recheios | escritas por mim a partir do nome; conferir com a cozinha |

As fotos da loja (`loja-balcao`, `loja-cafe`, `loja-vitrine`) são suas. As fotos de
produto vêm do Unsplash e servem de direção de arte — troque por fotografia
própria antes de publicar.
