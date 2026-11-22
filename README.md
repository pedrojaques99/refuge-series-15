# Refuge® Series 15

Landing mobile-first e experimental de um evento fictício da Refuge®: **15.12.2026, 23h às 08h**.

O hero é um toca-discos de verdade: toque no vinil para tocar, arraste em volta do selo para fazer scratch.
O som é sintetizado no navegador (Web Audio) e não tem nenhum arquivo de áudio: cada set do lineup é um groove próprio,
e o pitch, o abafado e o sentido do áudio seguem a velocidade do prato.

## O que tem

- **Vinil**: física de prato (motor, atrito, inércia), scratch com áudio reverso, braço da agulha que anda por faixa, leitor de RPM/pitch ao vivo, tique tátil no Android, rolagem que empurra o disco.
- **Tracklist** Lado A / Lado B: cada faixa troca o groove (bpm e linha de baixo do set).
- **Manifesto** com leitura palavra a palavra no scroll e foto em retícula com lupa (WebGL).
- **Countdown** até a abertura da pista.
- **Lista**: nome + e-mail, depois rasgar o canhoto do ingresso para confirmar. Gera `.ics` e compartilha. Tudo fica no `localStorage`, nada vai para servidor.
- **Dock** fixo: mini disco + CTA que some quando a lista está na tela.

## Marca

Tudo vem do Figma da Refuge® (`Refs Landing Page`): símbolo, wordmark e REFUGE empilhado como vetores originais
(`src/brand/`), cartela Fundação `#0D0D0D` · Estrutura `#706C64` · Sinal `#F2EEE3` · Superfície `#DCD8CE` · Cal `#F1F0EC` · Areia Clara `#EAE9D6`,
tipografia Special Gothic Expanded One + Geist + Geist Mono, fotos de pista e o parafuso em raio X.
Tokens gerados pelo motor `@visant/brand-tokens` (AA em todos os pares), com o fundo literal da Fundação mantido.

## Stack

Vite + React 19 + TypeScript + Tailwind v4, `motion`, e peças do registry [@visant](https://ui.visantlabs.com):
`ticket-stub`, `countdown`, `magnetic-cta`, `marquee`, `shader-halftone`.

Carga inicial ~148 KB gzip (o disco); o resto da página entra num chunk preguiçoso.

```bash
npm install
npm run dev
npm run build
```

### Scripts

| Script | Pra quê |
|---|---|
| `node scripts/registry-add.mjs <peça...>` | instala peças do registry @visant sem prompt e junta o CSS delas em `src/registry.css` |
| `node scripts/cdp-shots.mjs <pasta>` | capturas reais por CDP em 390×844 com toque: hero, disco tocando, scratch e cada seção. `FLOW=rsvp` testa a lista inteira; `W=1440 H=900` para desktop. Áudio sempre mudo |
| `node scripts/probe.mjs [url]` | mede se a thread principal responde e o tempo de quadro |

---

Evento fictício. Projeto de estudo de interação.
