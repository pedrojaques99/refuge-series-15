import type { Groove } from './player/synth'

export const EVENT = {
  name: 'Refuge Series 15',
  /** 15 de dezembro de 2026, 23h em São Paulo */
  startsAt: '2026-12-15T23:00:00-03:00',
  endsAt: '2026-12-16T08:00:00-03:00',
  dateLabel: '15. 12. 2026',
  hours: '23h às 08h',
  weekday: 'Terça',
} as const

/** texto do frame "Frame 4825" do Figma da marca */
export const MANIFESTO =
  'A vida moderna parece cada vez mais acelerada e caótica, com pouco tempo para um respiro. Mas em meio à cidade, nós criamos um espaço seguro para cultivarmos um momento de presença, como um suspiro dentre o frenesi. A Refuge nasce para mostrar que nós podemos encontrar abrigo mesmo nos momentos e lugares mais inesperados.'

export type Track = {
  side: 'A' | 'B'
  n: number
  artist: string
  time: string
  groove: Groove
}

export const TRACKS: Track[] = [
  {
    side: 'A', n: 1, artist: 'Lexie', time: '23:00',
    groove: { bpm: 122, root: 33, bass: [0, null, null, 0, null, null, 12, null, 0, null, null, 0, null, 10, null, null], stab: [6], grit: 0.1 },
  },
  {
    side: 'A', n: 2, artist: 'Gultto', time: '00:30',
    groove: { bpm: 126, root: 31, bass: [0, null, 0, null, 7, null, 0, null, 0, null, 0, 12, 7, null, 0, null], stab: [3, 11], grit: 0.4 },
  },
  {
    side: 'A', n: 3, artist: 'Dani Yamamoto', time: '02:00',
    groove: { bpm: 129, root: 36, bass: [null, null, 0, 0, null, null, 0, 3, null, null, 0, 0, null, null, 7, 5], stab: [14], grit: 0.55 },
  },
  {
    side: 'B', n: 1, artist: 'Chisari', time: '03:30',
    groove: { bpm: 133, root: 29, bass: [0, 0, null, 0, 0, null, 0, 0, null, 0, 0, null, 12, 0, null, 10], stab: [2, 10], grit: 0.8 },
  },
  {
    side: 'B', n: 2, artist: 'Luiza Lauz', time: '05:30',
    groove: { bpm: 124, root: 34, bass: [0, null, null, null, 7, null, null, null, 0, null, 3, null, 7, null, 10, null], stab: [0, 8], grit: 0.3 },
  },
]
