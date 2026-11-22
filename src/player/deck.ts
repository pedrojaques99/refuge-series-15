/*
 * O toca-discos. Uma única fonte de verdade fora do React:
 *   angle (graus) e speed (1 = 33⅓ rpm) como MotionValues, lidos direto pelo
 *   disco, pelo mini disco e pelo leitor de pitch sem re-render.
 * Física: motor puxa a velocidade pra 1 quando tocando; solto, o prato desacelera
 * por atrito; no arrasto, o disco segue o dedo e a velocidade vem do gesto.
 * Áudio: dois buffers em loop (frente e reverso); o rate segue |speed| e o
 * sinal escolhe qual soa. É isso que faz o scratch soar como scratch.
 */
import { motionValue } from 'motion/react'
import { TRACKS } from '../content'
import { crackle, renderGroove, reversed } from './synth'

/** tempos do braço da agulha, casados com a transição em Vinyl.tsx (1100ms) */
const NEEDLE_DROP_MS = 950
const NEEDLE_MOVE_MS = 700

export const NOMINAL_DEG_S = (100 / 3 / 60) * 360 // 33⅓ rpm = 200°/s

type Listener = () => void

class Deck {
  angle = motionValue(0)
  speed = motionValue(0)
  playing = false
  dragging = false
  muted = false
  track = 0
  /** pitch fader, em % (−8 a +8, como num toca-discos de DJ) */
  pitch = 0
  ready = false

  private listeners = new Set<Listener>()
  private ctx?: AudioContext
  private master?: GainNode
  private filter?: BiquadFilterNode
  private fwd?: { src: AudioBufferSourceNode; gain: GainNode }
  private rev?: { src: AudioBufferSourceNode; gain: GainNode }
  private hiss?: GainNode
  private cache = new Map<number, [AudioBuffer, AudioBuffer]>()
  private vel = 0 // graus por segundo
  private last = 0
  private raf = 0
  private reduce = false
  /** instante (performance.now) em que a agulha encosta no vinil; antes disso, silêncio */
  private needleAt = Infinity

  constructor() {
    if (typeof window === 'undefined') return
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => void this.listeners.delete(fn)
  }
  private emit() {
    for (const fn of this.listeners) fn()
  }

  /** precisa vir de um gesto: política de autoplay */
  private async ensureAudio() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      return
    }
    const ctx = new AudioContext({ latencyHint: 'interactive' })
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.9
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 18000
    this.filter.connect(this.master).connect(ctx.destination)

    const h = ctx.createBufferSource()
    h.buffer = crackle(ctx)
    h.loop = true
    this.hiss = ctx.createGain()
    this.hiss.gain.value = 0
    h.connect(this.hiss).connect(this.master)
    h.start()

    await this.load(this.track)
  }

  private async buffers(i: number) {
    let pair = this.cache.get(i)
    if (!pair) {
      const b = await renderGroove(TRACKS[i].groove, this.ctx!.sampleRate)
      pair = [b, reversed(this.ctx!, b)]
      this.cache.set(i, pair)
    }
    return pair
  }

  private async load(i: number) {
    const ctx = this.ctx!
    const [b, r] = await this.buffers(i)
    const now = ctx.currentTime
    for (const old of [this.fwd, this.rev]) {
      if (!old) continue
      old.gain.gain.setTargetAtTime(0, now, 0.03)
      old.src.stop(now + 0.2)
    }
    const mk = (buf: AudioBuffer) => {
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      const gain = ctx.createGain()
      gain.gain.value = 0
      src.connect(gain).connect(this.filter!)
      src.start(now, 0)
      return { src, gain }
    }
    this.fwd = mk(b)
    this.rev = mk(r)
    this.ready = true
    this.emit()
  }

  async toggle() {
    await this.setPlaying(!this.playing)
  }

  async setPlaying(on: boolean) {
    this.playing = on
    // o braço leva ~1,1 s pra pousar (Vinyl.tsx): o som entra quando a agulha toca o sulco
    this.needleAt = on ? performance.now() + (this.reduce ? 0 : NEEDLE_DROP_MS) : Infinity
    this.emit()
    if (on) await this.ensureAudio()
    this.vibrate(on ? [6, 40, 6] : 10)
  }

  async selectTrack(i: number) {
    if (i === this.track && this.playing) return
    this.track = i
    this.emit()
    // a agulha levanta e pousa no sulco da faixa nova: silêncio no trajeto
    this.vel *= 0.35
    if (this.playing) this.needleAt = performance.now() + (this.reduce ? 0 : NEEDLE_MOVE_MS)
    await this.setPlaying(true)
    if (this.ctx) await this.load(i)
  }

  /** põe o disco no prato sem soltar a agulha (escolha na caixa de discos) */
  async cue(i: number) {
    if (i === this.track) return
    if (this.playing) return this.selectTrack(i)
    this.track = i
    this.emit()
    if (this.ctx) await this.load(i)
  }

  setPitch(p: number) {
    this.pitch = Math.max(-8, Math.min(8, p))
    this.emit()
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05)
    this.emit()
  }

  /* ---------- gesto ---------- */
  private lastTick = 0
  beginDrag() {
    this.dragging = true
    void this.ensureAudio()
  }
  /** delta em graus desde o último evento, dt em segundos */
  dragBy(delta: number, dt: number) {
    this.angle.set(this.angle.get() + delta)
    const v = delta / Math.max(dt, 1 / 240)
    this.vel = this.vel * 0.55 + v * 0.45
    // tique tátil a cada 30° riscados
    const a = Math.floor(this.angle.get() / 30)
    if (a !== this.lastTick) {
      this.lastTick = a
      this.vibrate(4)
    }
  }
  endDrag() {
    this.dragging = false
  }
  /** rolagem da página empurra o prato de leve */
  nudge(px: number) {
    if (this.reduce) return
    this.vel += Math.max(-260, Math.min(260, px * 3))
  }

  private vibrate(p: number | number[]) {
    try {
      navigator.vibrate?.(p)
    } catch {
      /* sem vibração neste aparelho */
    }
  }

  /* ---------- física + áudio, um quadro por vez ---------- */
  private loop(t: number) {
    const dt = this.last ? Math.min((t - this.last) / 1000, 0.05) : 0
    this.last = t
    if (!this.dragging) {
      if (this.playing) {
        const k = 1 - Math.exp(-dt * 5.5) // motor: ~0,5 s pra chegar em 33⅓
        this.vel += (NOMINAL_DEG_S * (1 + this.pitch / 100) - this.vel) * k
      } else {
        this.vel *= Math.exp(-dt * 1.4) // prato solto, desacelera no atrito
        if (Math.abs(this.vel) < 0.5) this.vel = 0
      }
      if (this.vel !== 0) this.angle.set(this.angle.get() + this.vel * dt)
    } else {
      this.vel *= Math.exp(-dt * 9) // dedo parado = disco parado
    }
    const s = this.vel / NOMINAL_DEG_S
    this.speed.set(s)
    this.audio(s)
    this.raf = requestAnimationFrame(this.loop)
  }

  private audio(s: number) {
    if (!this.ctx || !this.fwd || !this.rev || !this.filter || !this.hiss) return
    const now = this.ctx.currentTime
    const mag = Math.min(Math.abs(s), 3)
    // só soa com a agulha no disco: braço levantado = silêncio, mesmo girando ou riscando
    const needle = this.playing && performance.now() >= this.needleAt
    const level = needle ? Math.min(1, mag * 3) : 0
    const rate = Math.max(0.02, mag)
    const tc = this.dragging ? 0.012 : 0.04
    this.fwd.src.playbackRate.setTargetAtTime(rate, now, tc)
    this.rev.src.playbackRate.setTargetAtTime(rate, now, tc)
    this.fwd.gain.gain.setTargetAtTime(s >= 0 ? level : 0, now, 0.01)
    this.rev.gain.gain.setTargetAtTime(s < 0 ? level : 0, now, 0.01)
    // devagar = abafado, como o vinil de verdade perdendo agudo
    this.filter.frequency.setTargetAtTime(400 + Math.min(mag, 1) ** 2 * 17600, now, 0.03)
    this.hiss.gain.setTargetAtTime(needle ? 0.05 : 0, now, needle ? 0.08 : 0.02)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    void this.ctx?.close()
  }
}

export const deck = new Deck()
