import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MiniDisc } from './Vinyl'
import { MagneticCta } from '@/components/ui/magnetic-cta'
import { deck } from '@/player/deck'
import { useDeck } from '@/player/useDeck'
import { TRACKS } from '@/content'
import { loadPass, type Pass } from '@/pass'
import { EASE_DRAWER } from '@/lib/motion'

function useInView(id: string, rootMargin = '0px') {
  const [on, setOn] = useState(false)
  useEffect(() => {
    // a seção pode estar num chunk preguiçoso: espera ela existir antes de observar
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin })
    let t = 0
    const attach = () => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
      else t = window.setTimeout(attach, 250)
    }
    attach()
    return () => {
      clearTimeout(t)
      io.disconnect()
    }
  }, [id, rootMargin])
  return on
}

/* toca-discos de bolso + CTA: o disco segue com você enquanto rola */
export function Dock() {
  const { playing, track, muted } = useDeck()
  const heroVisible = useInView('topo', '0px 0px -55% 0px')
  const listVisible = useInView('lista', '0px 0px -30% 0px')
  const [pass, setPass] = useState<Pass | null>(loadPass)

  useEffect(() => {
    const on = (e: Event) => setPass((e as CustomEvent<Pass | null>).detail)
    window.addEventListener('refuge:pass', on)
    return () => window.removeEventListener('refuge:pass', on)
  }, [])

  // a rolagem empurra o prato: rolar é mexer no disco
  useEffect(() => {
    let y = window.scrollY
    const on = () => {
      const d = window.scrollY - y
      y = window.scrollY
      deck.nudge(d)
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const t = TRACKS[track]
  const show = !heroVisible

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: '140%' }}
          animate={{ y: 0 }}
          exit={{ y: '140%' }}
          transition={{ duration: 0.55, ease: EASE_DRAWER }}
          className="dark fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto flex max-w-[560px] items-center gap-3 rounded-full border border-white/10 bg-fundacao/85 p-1.5 pr-1.5 text-foreground shadow-[0_10px_40px_rgb(0_0_0/0.5)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => void deck.toggle()}
              aria-label={playing ? 'Pausar o disco' : 'Tocar o disco'}
              aria-pressed={playing}
              className="relative size-11 shrink-0 rounded-full"
            >
              <MiniDisc className="size-11" />
            </button>
            <button
              type="button"
              onClick={() => deck.setMuted(!muted)}
              className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
              aria-label={muted ? 'Ligar o som' : 'Desligar o som'}
            >
              <span className="label-mono truncate text-[10px] text-muted-foreground">
                {playing ? `${t.side}${t.n} · ${t.groove.bpm} bpm` : 'Disco parado'}
                {muted && playing ? ' · mudo' : ''}
              </span>
              <span className="truncate text-sm font-medium tracking-[-0.01em]">{playing ? t.artist : 'Toque o disco'}</span>
            </button>
            <AnimatePresence mode="popLayout" initial={false}>
              {!listVisible && (
                <motion.div
                  key={pass?.confirmed ? 'ok' : 'cta'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <MagneticCta
                    onClick={() => document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-11 px-5"
                    field={40}
                    pull={6}
                  >
                    {pass?.confirmed ? `Ingresso ${pass.no}` : 'Entrar na lista'}
                  </MagneticCta>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
