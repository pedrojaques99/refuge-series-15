import { useEffect, useRef, useState } from 'react'
import { CoverFlow } from '@/components/ui/cover-flow'
import { ARTS, DiscFace } from './discArt'
import { TRACKS } from '@/content'
import { deck } from '@/player/deck'
import { useDeck } from '@/player/useDeck'
import { LineUp } from './Reveal'

/* capa: o disco sai metade pra fora do envelope, como na prateleira da loja */
function Sleeve({ i }: { i: number }) {
  const art = ARTS[i]
  const t = TRACKS[i]
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ background: art.sleeve, color: art.sleeveInk }}>
      <div className="absolute left-[18%] top-[14%] aspect-square w-[92%]">
        <DiscFace art={art} />
      </div>
      {/* envelope por cima do disco */}
      <div className="absolute inset-y-0 left-0 w-[46%] shadow-[8px_0_18px_rgb(0_0_0/0.25)]" style={{ background: art.sleeve }} />
      <div className="absolute inset-0 flex flex-col justify-between p-[9%]">
        <span className="label-mono text-[9px] opacity-70">
          {t.side}
          {t.n} · {art.name}
        </span>
        <span className="max-w-[40%] font-display text-[13px] leading-[1.05] tracking-[-0.03em]">{t.artist}</span>
      </div>
    </div>
  )
}

export function Crate() {
  const { track, playing } = useDeck()
  // a prateleira acompanha o prato quando o disco muda por fora (hero, tracklist);
  // quando a troca veio dela mesma, não remonta no meio do gesto
  const mine = useRef(track)
  const [sync, setSync] = useState(0)
  useEffect(() => {
    if (track !== mine.current) {
      mine.current = track
      setSync((n) => n + 1)
    }
  }, [track])
  return (
    <section id="discos" className="dark overflow-hidden bg-background py-24 text-foreground">
      <div className="mx-auto flex max-w-[560px] flex-col gap-8 px-4 sm:px-8">
        <header className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(2rem,10vw,3.4rem)] leading-[0.95] tracking-[-0.04em]">
            <LineUp lines={['Caixa', 'de discos']} />
          </h2>
          <p className="label-mono max-w-[17ch] text-right leading-[1.5] text-muted-foreground">
            Cinco prensagens, uma por set. Arraste e escolha.
          </p>
        </header>
      </div>
      <CoverFlow
        items={ARTS.map((a, i) => ({ title: `${TRACKS[i].artist} · ${a.name}`, caption: `${TRACKS[i].side}${TRACKS[i].n}`, media: <Sleeve i={i} /> }))}
        defaultIndex={track}
        cardWidth={200}
        tilt={52}
        label="Caixa de discos"
        key={sync}
        onIndexChange={(i) => {
          mine.current = i
          void deck.cue(i)
        }}
        className="mt-4"
      />
      <p className="label-mono mt-6 text-center text-muted-foreground" aria-live="polite">
        No prato: {TRACKS[track].side}
        {TRACKS[track].n} · {ARTS[track].name}
        {playing ? ' · tocando' : ''}
      </p>
    </section>
  )
}
