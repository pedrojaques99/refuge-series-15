import { useSyncExternalStore } from 'react'
import { deck } from './deck'

type Snap = { playing: boolean; track: number; muted: boolean; ready: boolean }

let snap: Snap = { playing: false, track: 0, muted: false, ready: false }
const read = (): Snap => {
  const { playing, track, muted, ready } = deck
  if (playing !== snap.playing || track !== snap.track || muted !== snap.muted || ready !== snap.ready) {
    snap = { playing, track, muted, ready }
  }
  return snap
}

/** estado discreto do toca-discos (tocando, faixa, mudo); ângulo e velocidade ficam em MotionValues */
export function useDeck() {
  return useSyncExternalStore((fn) => deck.subscribe(fn), read, read)
}
