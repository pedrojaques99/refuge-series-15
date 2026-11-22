import { useSyncExternalStore } from 'react'
import { deck } from './deck'

type Snap = { playing: boolean; track: number; muted: boolean; ready: boolean; pitch: number }

let snap: Snap = { playing: false, track: 0, muted: false, ready: false, pitch: 0 }
const read = (): Snap => {
  const { playing, track, muted, ready, pitch } = deck
  if (playing !== snap.playing || track !== snap.track || muted !== snap.muted || ready !== snap.ready || pitch !== snap.pitch) {
    snap = { playing, track, muted, ready, pitch }
  }
  return snap
}

/** estado discreto do toca-discos (tocando, faixa, mudo); ângulo e velocidade ficam em MotionValues */
export function useDeck() {
  return useSyncExternalStore((fn) => deck.subscribe(fn), read, read)
}
