import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ShaderHalftone } from '@/components/ui/shader-halftone'
import { MANIFESTO } from '@/content'
import { Reveal } from './Reveal'

/* cada palavra acende conforme a leitura avança: o texto anda no ritmo de quem rola */
function Word({ w, i, n, p }: { w: string; i: number; n: number; p: MotionValue<number> }) {
  const start = i / n
  const opacity = useTransform(p, [start - 0.08, start + 0.02], [0.16, 1])
  return (
    <motion.span style={{ opacity }} className="inline">
      {w}{' '}
    </motion.span>
  )
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] })
  const words = MANIFESTO.split(' ')

  return (
    <section id="manifesto" className="dark relative bg-background px-4 py-24 text-foreground sm:px-8">
      <div className="mx-auto flex max-w-[560px] flex-col gap-12">
        <p className="label-mono text-muted-foreground">Manifesto · 01</p>
        <div ref={ref}>
          <p className="text-[clamp(1.5rem,6.6vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.025em]">
            {words.map((w, i) => (
              <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} />
            ))}
          </p>
        </div>

        <Reveal>
        <figure className="flex flex-col gap-3">
          <div className="relative overflow-hidden">
            <ShaderHalftone
              src="/brand/dj-beanie-ht.webp"
              alt="DJ de gorro laranja na cabine de uma edição anterior da Refuge, pista cheia atrás"
              colors={['#0d0d0d', '#dcd8ce']}
              cell={4}
              angle={45}
              contrast={30}
              className="aspect-[4/5]"
            />
          </div>
          <figcaption className="label-mono flex justify-between text-muted-foreground">
            <span>Fig. 01 · Cabine</span>
            <span>Arraste o dedo: lupa</span>
          </figcaption>
        </figure>
        </Reveal>

        <p className="max-w-[34ch] text-base leading-relaxed text-foreground/70">
          Um refúgio onde encontramos as pessoas que pensam parecido, onde podemos apreciar a arte e, principalmente,
          onde podemos vivenciar a nossa versão mais livre.
        </p>
      </div>
    </section>
  )
}
