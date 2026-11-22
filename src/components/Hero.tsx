import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { Vinyl } from './Vinyl'
import { Mark } from '@/brand/logos'
import { deck } from '@/player/deck'
import { useDeck } from '@/player/useDeck'
import { EVENT, TRACKS } from '@/content'
import { EASE_DRAWER, EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

/* leitor de pitch do toca-discos: escreve no DOM direto, sem re-render a cada quadro */
function PitchReadout() {
  const rpm = useRef<HTMLSpanElement>(null)
  const pitch = useRef<HTMLSpanElement>(null)
  const last = useRef(0)
  useMotionValueEvent(deck.speed, 'change', (s) => {
    const now = performance.now()
    if (now - last.current < 70) return
    last.current = now
    if (rpm.current) rpm.current.textContent = (Math.abs(s) * 33.33).toFixed(1).padStart(4, '0')
    if (pitch.current) {
      const raw = deck.playing || deck.dragging ? (s - 1) * 100 : 0
      const p = Math.abs(raw) < 0.05 ? 0 : raw
      const clamped = Math.max(-99.9, Math.min(99.9, p))
      pitch.current.textContent = `${clamped >= 0 ? '+' : '−'}${Math.abs(clamped).toFixed(1)}%`
    }
  })
  return (
    <p className="label-mono flex shrink-0 gap-3 whitespace-nowrap tabular-nums text-fundacao/60" aria-hidden>
      <span>
        rpm <span ref={rpm} className="text-fundacao">00.0</span>
      </span>
      <span>
        pitch <span ref={pitch} className="text-fundacao">+0.0%</span>
      </span>
    </p>
  )
}

function Hint() {
  const { playing } = useDeck()
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (playing) {
      const id = setTimeout(() => setGone(true), 2600)
      return () => clearTimeout(id)
    }
  }, [playing])
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: gone ? 0 : 1 }}
      transition={{ delay: gone ? 0 : 1.6, duration: 0.5 }}
      className="label-mono pointer-events-none whitespace-nowrap rounded-full bg-fundacao px-3 py-2 text-sinal"
    >
      {playing ? 'arraste o disco: scratch' : 'toque no disco · com som'}
    </motion.p>
  )
}

/* a data ocupa a largura exata do pôster, como no frame do vinil */
function useFit<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return
    const fit = () => {
      el.style.fontSize = '100px'
      const w = el.scrollWidth
      if (w) el.style.fontSize = `${(box.clientWidth / w) * 100}px`
    }
    fit()
    // a fonte display só baixa quando aparece: mede de novo quando ela chegar
    void document.fonts?.load('400 100px "Special Gothic Expanded One"').then(fit)
    void document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])
  return ref
}

export function Hero() {
  const dateRef = useFit<HTMLParagraphElement>()
  const reduce = useReducedMotion()
  const { track, playing } = useDeck()
  const lineup = TRACKS.map((t) => t.artist)

  return (
    <section
      id="topo"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-superficie px-4 pb-6 pt-4 text-fundacao sm:px-8"
    >
      {/* cabeçalho do pôster: símbolo à esquerda, lineup à direita, como no frame do vinil */}
      <div className="flex items-start justify-between gap-6">
        <a href="#topo" aria-label="Refuge®" className="relative block w-[84px] shrink-0 sm:w-[112px]">
          <Mark title="Refuge®" className="w-full" />
          <span className="absolute -right-3 -top-0.5 text-[8px] font-medium">®</span>
        </a>
        <p className="max-w-[24ch] text-right text-[11px] font-medium uppercase leading-[1.25] tracking-[0.02em] sm:max-w-[22ch] sm:text-xs">
          {lineup.map((a, i) => (
            <span key={a}>
              <span className={cn('whitespace-nowrap transition-colors duration-300', playing && i === track && 'bg-fundacao text-sinal')}>{a}</span>
              {i < lineup.length - 1 ? ' & ' : ''}
            </span>
          ))}
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center pb-14 pt-6">
        <motion.div
          initial={reduce ? false : { y: '18%', opacity: 0, rotate: -40, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1.3, ease: EASE_DRAWER, delay: 0.15 }}
          className="w-[min(80vw,56svh,540px)] -translate-x-[3%]"
        >
          <Vinyl />
        </motion.div>
        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <Hint />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <PitchReadout />
          <span className="label-mono text-fundacao/60">33⅓</span>
        </div>
        <h1 className="sr-only">
          {EVENT.name}, {EVENT.weekday} {EVENT.dateLabel}, {EVENT.hours}
        </h1>
        <div aria-hidden className="overflow-hidden">
          <motion.p
            ref={dateRef}
            initial={reduce ? false : { y: '105%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.55 }}
            className="inline-block whitespace-nowrap font-display leading-[0.92] tracking-[-0.045em] text-fundacao/90"
          >
            {EVENT.dateLabel}
          </motion.p>
        </div>
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="label-mono flex justify-between border-t border-fundacao/20 pt-3 text-fundacao/70"
        >
          <span>Refuge Series 15</span>
          <span>{EVENT.weekday} · {EVENT.hours}</span>
        </motion.div>
      </div>
    </section>
  )
}
