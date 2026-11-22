# Refuge® Series 15 · Landing mobile-first

Evento (fictício): **Refuge Series 15**, 15.12.2026, 23h às 08h.

## Marca (fonte: Figma `Refs Landing Page`, node 16946:428)

| Item | Valor |
|---|---|
| Símbolo | ᴴE (`simbolo efeito`), traço rústico, ® |
| Wordmark | REFUGE em letra cortada (`Union`), horizontal e vertical |
| Display | Special Gothic Expanded One |
| Texto / rótulo | Geist, Geist Mono (grade "REFUGE SERIES") |
| 01 Fundação | `#0D0D0D` |
| 02 Estrutura | `#706C64` |
| 03 Sinal | `#F2EEE3` |
| 04 Superfície | `#DCD8CE` |
| 05 Cal | `#F1F0EC` |
| 06 Areia Clara | `#EAE9D6` |
| Dispositivos | vinil preto com selo claro e anel de símbolos, retícula, foto de pista crua, parafuso em raio X (único verde) |
| Lineup das peças | Chisari, Dani Yamamoto, Gultto, Lexie, Luiza Lauz |
| Manifesto | texto real do frame 4825 |

## Stack (leve)

Vite + React + TS + Tailwind v4. Peças do registry `@visant`:
`ticket-stub` (RSVP por rasgar o canhoto), `countdown`, `magnetic-cta`, `marquee`, `shader-halftone`.
Custom só o que não existe: o **vinil** (física de giro + scratch + som sintetizado por Web Audio, sem arquivo de áudio).

## Dobras

1. **Hero/deck**: vinil gigante; arrastar = scratch, tocar = play/pause, braço da agulha. Data em display.
2. **Marquee** REFUGE SERIES.
3. **Manifesto** + foto em retícula (lupa no cursor).
4. **Tracklist** lado A/B = lineup; tocar uma faixa move a agulha.
5. **Countdown** até 15.12 23h (America/Sao_Paulo).
6. **RSVP**: nome + e-mail → rasgar o canhoto → ingresso numerado (localStorage).
7. Rodapé: wordmark gigante.

CTA fixo "Garantir lugar" some quando o RSVP está na tela.

## Entrega

- [x] carga inicial 148 KB JS gz (resto em chunk preguiçoso), imagens WebP
- [x] reduced-motion respeitado, áudio só após gesto
- [x] screenshot mobile verificado (CDP 390x844 + fluxo da lista)
- [ ] repo público no GitHub
- [ ] deploy Vercel CLI (prod)
