/*
 * As artes de disco da Refuge Series 15. Uma por set, todas tiradas do Figma:
 *   anel     · vinil preto, selo Cal com o anel de símbolos (pôster 4829)
 *   reticula · vinil fumê, selo em retícula (image_reticula)
 *   raiox    · vinil preto, selo com o parafuso em raio X (post 4827)
 *   cinza    · vinil cinza com o anel de símbolos no próprio sulco (frame 01)
 *   areia    · vinil Areia Clara, selo Fundação com o símbolo
 * Um DiscFace só desenha qualquer uma delas: prato, mini disco e capa usam o mesmo.
 */
import type { CSSProperties, ReactNode } from 'react'
import { Mark, Wordmark } from '@/brand/logos'
import { cn } from '@/lib/utils'

export type DiscArt = {
  id: string
  name: string
  /** cor do vinil */
  disc: string
  /** cor dos sulcos, em "r g b" */
  groove: string
  /** fundo da capa no cover flow */
  sleeve: string
  sleeveInk: string
  label: (mini: boolean) => ReactNode
  /** desenho no próprio vinil, fora do selo */
  surface?: (mini: boolean) => ReactNode
}

function Ring({ className, size = '19%', top = '5%', n = 8 }: { className?: string; size?: string; top?: string; n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="absolute inset-0" style={{ transform: `rotate(${(i * 360) / n}deg)` }}>
          <Mark title="" className={cn('absolute left-1/2 -translate-x-1/2', className)} style={{ width: size, top }} />
        </div>
      ))}
    </>
  )
}

const hole = <div className="absolute left-1/2 top-1/2 size-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fundacao shadow-[inset_0_1px_2px_rgb(255_255_255/0.2)]" />

const caption = (text: string, cls = 'text-fundacao/70') => (mini: boolean) =>
  mini ? null : (
    <span className={cn('label-mono absolute bottom-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[clamp(5px,1.4vw,8px)]', cls)}>{text}</span>
  )

export const ARTS: DiscArt[] = [
  {
    id: 'anel',
    name: 'Anel',
    disc: '#0d0d0d',
    groove: '255 255 255',
    sleeve: '#dcd8ce',
    sleeveInk: '#0d0d0d',
    label: (mini) => (
      <div className="absolute inset-0 rounded-full bg-cal">
        <Ring className="text-fundacao" />
        {!mini && <Wordmark title="" className="absolute left-1/2 top-[33%] w-[34%] -translate-x-1/2 text-fundacao/80" />}
        {caption('Series 15 · A1')(mini)}
        {hole}
      </div>
    ),
  },
  {
    id: 'reticula',
    name: 'Retícula',
    disc: '#22201d',
    groove: '255 255 255',
    sleeve: '#0d0d0d',
    sleeveInk: '#f2eee3',
    label: (mini) => (
      <div className="absolute inset-0 overflow-hidden rounded-full bg-superficie">
        {/* a retícula cresce do centro pra borda, como a foto rasterizada das peças */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, #0d0d0d 0 38%, transparent 41%) 0 0 / 8% 8%',
            maskImage: 'radial-gradient(circle, transparent 0 22%, black 70%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 0 22%, black 70%)',
            transform: 'rotate(45deg) scale(1.2)',
          }}
        />
        {!mini && <Mark title="" className="absolute left-1/2 top-[30%] w-[30%] -translate-x-1/2 text-fundacao" />}
        {caption('Series 15 · A2', 'text-fundacao')(mini)}
        {hole}
      </div>
    ),
  },
  {
    id: 'raiox',
    name: 'Raio X',
    disc: '#0d0d0d',
    groove: '255 255 255',
    sleeve: '#f1f0ec',
    sleeveInk: '#0d0d0d',
    label: (mini) => (
      <div className="absolute inset-0 overflow-hidden rounded-full bg-[#fbfbf9]">
        <img
          src="/brand/screw-xray.webp"
          alt=""
          draggable={false}
          className="absolute inset-[-8%] size-[116%] max-w-none rotate-[28deg] object-contain mix-blend-multiply"
        />
        {!mini && <Mark title="" className="absolute left-[14%] top-[40%] w-[22%] text-fundacao" />}
        {caption('A3', 'text-fundacao')(mini)}
        {hole}
      </div>
    ),
  },
  {
    id: 'cinza',
    name: 'Cinza 01',
    disc: '#575757',
    groove: '0 0 0',
    sleeve: '#1b1b1b',
    sleeveInk: '#e8e8e8',
    surface: () => <Ring className="text-[#e8e8e8]" size="22%" top="7%" />,
    label: (mini) => (
      <div className="absolute inset-0 rounded-full bg-[#575757] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.25),0_0_0_1px_rgb(255_255_255/0.06)]">
        {!mini && <Wordmark title="" className="absolute left-1/2 top-[30%] w-[50%] -translate-x-1/2 text-[#e8e8e8]" />}
        <div className="absolute left-1/2 top-1/2 size-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1b1b1b]" />
      </div>
    ),
  },
  {
    id: 'areia',
    name: 'Areia',
    disc: '#eae9d6',
    groove: '13 13 13',
    sleeve: '#706c64',
    sleeveInk: '#f2eee3',
    label: (mini) => (
      <div className="absolute inset-0 rounded-full bg-fundacao">
        <Mark title="" className="absolute left-1/2 top-[20%] w-[46%] -translate-x-1/2 text-sinal" />
        {caption('Lado B · B2', 'text-sinal/70')(mini)}
        <div className="absolute left-1/2 top-1/2 size-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-superficie" />
      </div>
    ),
  },
]

/** o disco inteiro: vinil + sulcos + desenho de superfície + selo */
export function DiscFace({ art, mini = false, className, style }: { art: DiscArt; mini?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn('grooves absolute inset-0 rounded-full', className)}
      style={{ '--disc': art.disc, '--groove': art.groove, ...style } as CSSProperties}
    >
      {art.surface?.(mini)}
      <div className={cn('absolute', mini ? 'inset-[30%]' : 'inset-[31%]')}>{art.label(mini)}</div>
    </div>
  )
}
