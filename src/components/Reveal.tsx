import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'

/* entrada de dobra: sobe de dentro do próprio corte, uma vez, quando entra na tela */
export function Reveal({ delay = 0, y = 28, children, ...p }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
      {...p}
    >
      {children}
    </motion.div>
  )
}

/* título que sobe linha por linha de dentro da máscara.
   O gatilho fica no contêiner: a linha começa fora do próprio corte e nunca "entraria" na tela sozinha. */
export function LineUp({ lines, className }: { lines: string[]; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={className}
      initial={reduce ? false : 'hide'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ staggerChildren: 0.08 }}
      style={{ display: 'block' }}
    >
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            variants={{ hide: { y: '110%' }, show: { y: 0 } }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
