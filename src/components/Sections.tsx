import { Marquee } from '@/components/ui/marquee'
import { Countdown } from '@/components/ui/countdown'
import { Mark, Wordmark } from '@/brand/logos'
import { Stacked } from '@/brand/stacked'
import { EVENT } from '@/content'

const sep = <Mark title="" className="h-[0.7em] w-auto" />

export function Band() {
  return (
    <div className="dark overflow-hidden bg-background py-3 text-foreground">
      <Marquee
        items={['Refuge Series 15', sep, EVENT.dateLabel, sep, EVENT.hours, sep, 'Entrada por lista', sep]}
        gap={28}
        speed={30}
        scroll="boost"
        pauseOnHover={false}
        className="label-mono text-[13px]"
      />
    </div>
  )
}

export function Clock() {
  return (
    <section id="relogio" className="dark relative isolate overflow-hidden bg-background px-4 py-28 text-foreground sm:px-8">
      <img
        src="/brand/screw-poster.webp"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 -z-10 size-full object-cover opacity-35"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/40 to-background" aria-hidden />
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-8 text-center">
        <p className="label-mono text-muted-foreground">A pista abre em</p>
        <Countdown
          target={EVENT.startsAt}
          label="A pista da Refuge Series 15 abre em"
          completeLabel="Pista aberta"
          className="w-full [&_.text-apoio]:font-mono [&_.text-apoio]:text-[10px] [&_.text-apoio]:uppercase [&_.text-apoio]:tracking-[0.14em]"
        />
        <p className="label-mono text-foreground/70">
          {EVENT.weekday}, 15 de dezembro · {EVENT.hours}
        </p>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer id="rodape" className="dark bg-background px-4 pb-32 pt-20 text-foreground sm:px-8">
      <div className="mx-auto flex max-w-[560px] flex-col gap-12">
        <Stacked className="w-full text-estrutura" />
        <div className="grid grid-cols-2 gap-6 label-mono leading-[1.6] text-muted-foreground">
          <p>
            Refuge® Series 15
            <br />
            {EVENT.dateLabel}
            <br />
            {EVENT.hours}
          </p>
          <p className="text-right">
            <a href="#topo" className="text-foreground underline underline-offset-4">
              Voltar ao disco ↑
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-5">
          <Wordmark className="h-3 w-auto self-start text-foreground/60" />
          <p className="label-mono text-[10px] leading-[1.6] text-muted-foreground">
            Evento fictício · seus dados ficam só no seu navegador
          </p>
        </div>
      </div>
    </footer>
  )
}
