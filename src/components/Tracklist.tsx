import { motion, AnimatePresence } from 'motion/react'
import { TRACKS } from '@/content'
import { deck } from '@/player/deck'
import { useDeck } from '@/player/useDeck'
import { MiniDisc } from './Vinyl'
import { cn } from '@/lib/utils'
import { LineUp, Reveal } from './Reveal'

/* contracapa: o lineup é a tracklist, e cada faixa toca o groove daquele set */
export function Tracklist() {
  const { track, playing } = useDeck()

  return (
    <section id="lineup" className="bg-cal px-4 py-24 text-fundacao sm:px-8">
      <div className="mx-auto flex max-w-[560px] flex-col gap-10">
        <header className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(2rem,10vw,3.4rem)] leading-[0.95] tracking-[-0.04em]">
            <LineUp lines={['Lado A', 'Lado B']} />
          </h2>
          <p className="label-mono max-w-[18ch] text-right leading-[1.5] text-fundacao/60">
            Cinco sets, das 23h às 08h. Toque numa faixa.
          </p>
        </header>

        <ol className="flex flex-col">
          {TRACKS.map((t, i) => {
            const on = playing && track === i
            const sideStart = i === 0 || TRACKS[i - 1].side !== t.side
            return (
              <li key={t.artist}>
              <Reveal delay={Math.min(i * 0.06, 0.3)} y={18}>
                {sideStart && (
                  <p className="label-mono border-b border-fundacao pb-2 pt-6 text-fundacao/60">Lado {t.side}</p>
                )}
                <button
                  type="button"
                  onClick={() => (on ? void deck.setPlaying(false) : void deck.selectTrack(i))}
                  aria-pressed={on}
                  className={cn(
                    'group relative grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-fundacao/15 py-4 text-left',
                    'transition-colors duration-200 hover:bg-fundacao/[0.04] active:bg-fundacao/[0.08]',
                  )}
                >
                  <span className="label-mono tabular-nums text-fundacao/50">
                    {t.side}
                    {t.n}
                  </span>
                  <span className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={cn(
                        'truncate text-[clamp(1.25rem,5.6vw,1.75rem)] font-medium tracking-[-0.03em] transition-transform duration-300 ease-out',
                        on ? 'translate-x-1' : 'group-hover:translate-x-1',
                      )}
                    >
                      {t.artist}
                    </span>
                    <AnimatePresence>
                      {on && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                          className="size-6 shrink-0"
                        >
                          <MiniDisc className="size-6" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className="label-mono flex flex-col items-end gap-1 tabular-nums">
                    <span>{t.time}</span>
                    <span className="text-fundacao/45">{t.groove.bpm} bpm</span>
                  </span>
                  {/* barra de progresso do set: só um traço que respira no tempo do bpm */}
                  {on && (
                    <span
                      aria-hidden
                      className="absolute bottom-[-1px] left-0 h-px w-full origin-left bg-fundacao"
                      style={{ animation: `beat ${60 / t.groove.bpm}s ease-out infinite` }}
                    />
                  )}
                </button>
              </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
