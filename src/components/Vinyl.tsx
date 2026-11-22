import { useRef } from 'react'
import { motion, useTransform } from 'motion/react'
import { deck } from '@/player/deck'
import { useDeck } from '@/player/useDeck'
import { Mark, Wordmark } from '@/brand/logos'
import { cn } from '@/lib/utils'

/* braço da agulha, no espaço 0..100 do disco: pivô fora do canto, agulha no sulco */
const PIVOT = { x: 96, y: 4 }
const ARM_REST = -22
const armAngle = (track: number) => 1 + track * 2.6

function Tonearm({ playing, track }: { playing: boolean; track: number }) {
  const deg = playing ? armAngle(track) : ARM_REST
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-[0_6px_8px_rgb(0_0_0/0.35)]"
      aria-hidden
    >
      <circle cx={PIVOT.x} cy={PIVOT.y} r="6.2" fill="#706c64" />
      <circle cx={PIVOT.x} cy={PIVOT.y} r="3.4" fill="#0d0d0d" />
      <g
        style={{
          transform: `rotate(${deg}deg)`,
          transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`,
          transformBox: 'view-box',
          transition: 'transform 1100ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* contrapeso */}
        <rect x={PIVOT.x - 2.4} y={PIVOT.y - 13} width="4.8" height="8" rx="1" fill="#0d0d0d" />
        {/* haste */}
        <path d={`M ${PIVOT.x} ${PIVOT.y} L 74 80`} stroke="#f1f0ec" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 74 80 L 72 88" stroke="#f1f0ec" strokeWidth="1.6" strokeLinecap="round" />
        {/* cápsula */}
        <rect x="68.6" y="85.2" width="6.4" height="5.2" rx="0.8" transform="rotate(14 72 88)" fill="#0d0d0d" stroke="#706c64" strokeWidth="0.5" />
      </g>
    </svg>
  )
}

function Label() {
  return (
    <div className="absolute inset-[31%] rounded-full bg-cal shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 45}deg)` }}>
          <Mark title="" className="absolute left-1/2 top-[5%] w-[19%] -translate-x-1/2 text-fundacao" />
        </div>
      ))}
      <Wordmark title="" className="absolute left-1/2 top-[33%] w-[34%] -translate-x-1/2 text-fundacao/80" />
      {/* furo do eixo */}
      <div className="absolute left-1/2 top-1/2 size-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fundacao shadow-[inset_0_1px_2px_rgb(255_255_255/0.2)]" />
      <span className="label-mono absolute bottom-[27%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[clamp(5px,1.5vw,8px)] text-fundacao/70">
        Series 15 · 33⅓
      </span>
    </div>
  )
}

export function Vinyl({ className }: { className?: string }) {
  const { playing, track } = useDeck()
  const rotate = useTransform(deck.angle, (a) => a % 360)
  const g = useRef<{ x: number; y: number; cx: number; cy: number; a: number; t: number; moved: number; on: boolean } | null>(null)

  const angleAt = (x: number, y: number, cx: number, cy: number) => (Math.atan2(y - cy, x - cx) * 180) / Math.PI

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    g.current = { x: e.clientX, y: e.clientY, cx, cy, a: angleAt(e.clientX, e.clientY, cx, cy), t: e.timeStamp, moved: 0, on: false }
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = g.current
    if (!s) return
    const a = angleAt(e.clientX, e.clientY, s.cx, s.cy)
    let d = a - s.a
    if (d > 180) d -= 360
    if (d < -180) d += 360
    s.moved += Math.hypot(e.clientX - s.x, e.clientY - s.y)
    s.x = e.clientX
    s.y = e.clientY
    if (!s.on && s.moved > 6) {
      s.on = true
      e.currentTarget.setPointerCapture(e.pointerId)
      deck.beginDrag()
    }
    if (s.on) deck.dragBy(d, (e.timeStamp - s.t) / 1000)
    s.a = a
    s.t = e.timeStamp
  }
  const onUp = () => {
    const s = g.current
    g.current = null
    if (!s) return
    if (s.on) deck.endDrag()
    else void deck.toggle()
  }
  const onCancel = () => {
    if (g.current?.on) deck.endDrag()
    g.current = null
  }

  return (
    <div className={cn('relative aspect-square select-none', className)}>
      {/* sombra de contato com o pôster */}
      <div className="absolute inset-[3%] translate-y-[3%] rounded-full bg-black/45 blur-2xl" aria-hidden />
      <div
        role="button"
        tabIndex={0}
        aria-pressed={playing}
        aria-label={playing ? 'Pausar o disco' : 'Tocar o disco. Arraste em volta pra riscar'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            void deck.toggle()
          }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') deck.nudge(e.key === 'ArrowLeft' ? -60 : 60)
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        className="absolute inset-0 cursor-grab rounded-full [touch-action:pan-y] active:cursor-grabbing"
      >
        <motion.div style={{ rotate }} className="grooves absolute inset-0 rounded-full shadow-[0_0_0_1px_rgb(0_0_0/0.6)]">
          <Label />
        </motion.div>
        <div className="sheen pointer-events-none absolute inset-0 rounded-full" aria-hidden />
      </div>
      <Tonearm playing={playing} track={track} />
    </div>
  )
}

/** o mesmo disco, pequeno, no dock */
export function MiniDisc({ className }: { className?: string }) {
  const rotate = useTransform(deck.angle, (a) => a % 360)
  return (
    <motion.div style={{ rotate }} className={cn('grooves relative aspect-square rounded-full', className)} aria-hidden>
      <div className="absolute inset-[30%] rounded-full bg-cal">
        <Mark title="" className="absolute left-1/2 top-[22%] w-[58%] -translate-x-1/2 text-fundacao" />
        <div className="absolute left-1/2 top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fundacao" />
      </div>
    </motion.div>
  )
}
