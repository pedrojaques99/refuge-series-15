import { useEffect, useRef } from 'react'
import { definirFader } from '@/lib/fader'
import { deck } from '@/player/deck'

definirFader()

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'visant-fader': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string
        min?: number | string
        max?: number | string
        step?: number | string
        value?: number | string
        default?: number | string
        unit?: string
      }
    }
  }
}

/* pitch de toca-discos de DJ: ±8%, duplo clique volta pro zero, arrastar o nome também muda */
export function PitchFader({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const on = (e: Event) => deck.setPitch(Number((e as CustomEvent<{ value: number }>).detail.value))
    const tick = () => {
      try {
        navigator.vibrate?.(3)
      } catch {
        /* sem vibração */
      }
    }
    el.addEventListener('valuechange', on)
    el.addEventListener('valuedetent', tick)
    return () => {
      el.removeEventListener('valuechange', on)
      el.removeEventListener('valuedetent', tick)
    }
  }, [])
  return (
    <visant-fader
      ref={ref}
      label="Tempo"
      min={-8}
      max={8}
      step={0.1}
      value={0}
      default={0}
      unit="%"
      className={className}
      style={{ '--fader-label-w': '44px', '--fader-value-w': '44px' } as React.CSSProperties}
    />
  )
}
