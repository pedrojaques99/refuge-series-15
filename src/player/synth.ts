/*
 * Cada set do lineup vira um loop de 4 compassos, sintetizado offline uma vez
 * (OfflineAudioContext). Sem arquivo de áudio: o site continua leve.
 */
export type Groove = {
  bpm: number
  /** nota MIDI da tônica do baixo */
  root: number
  /** 16 passos; número = semitons acima da tônica, null = pausa */
  bass: (number | null)[]
  /** passos com acorde curto */
  stab: number[]
  /** 0..1, quanto de ruído/clap */
  grit: number
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

function noise(ctx: BaseAudioContext, seconds: number) {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

export async function renderGroove(g: Groove, sampleRate = 44100): Promise<AudioBuffer> {
  const beat = 60 / g.bpm
  const step = beat / 4
  const bars = 4
  const length = Math.ceil(bars * 4 * beat * sampleRate)
  const ctx = new OfflineAudioContext(2, length, sampleRate)
  const out = ctx.createDynamicsCompressor()
  out.threshold.value = -14
  out.ratio.value = 4
  out.connect(ctx.destination)
  const nb = noise(ctx, 0.5)

  for (let s = 0; s < bars * 16; s++) {
    const t = s * step
    const pos = s % 16
    const bar = Math.floor(s / 16)

    // bumbo 4x4
    if (pos % 4 === 0) {
      const o = ctx.createOscillator()
      const v = ctx.createGain()
      o.frequency.setValueAtTime(150, t)
      o.frequency.exponentialRampToValueAtTime(44, t + 0.13)
      v.gain.setValueAtTime(1, t)
      v.gain.exponentialRampToValueAtTime(0.001, t + 0.42)
      o.connect(v).connect(out)
      o.start(t)
      o.stop(t + 0.45)
    }
    // chimbal no contratempo
    if (pos % 4 === 2 || (g.grit > 0.5 && pos % 2 === 1 && Math.random() < 0.3)) {
      const n = ctx.createBufferSource()
      n.buffer = nb
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 7500
      const v = ctx.createGain()
      const amp = pos % 4 === 2 ? 0.22 : 0.08
      v.gain.setValueAtTime(amp, t)
      v.gain.exponentialRampToValueAtTime(0.001, t + (pos % 4 === 2 ? 0.07 : 0.03))
      n.connect(hp).connect(v).connect(out)
      n.start(t, Math.random() * 0.3)
      n.stop(t + 0.1)
    }
    // clap nos tempos 2 e 4
    if (g.grit > 0.2 && (pos === 4 || pos === 12)) {
      const n = ctx.createBufferSource()
      n.buffer = nb
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 1400
      bp.Q.value = 0.9
      const v = ctx.createGain()
      v.gain.setValueAtTime(0.32 * g.grit, t)
      v.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
      n.connect(bp).connect(v).connect(out)
      n.start(t)
      n.stop(t + 0.2)
    }
    // baixo
    const note = g.bass[pos]
    if (note != null) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = hz(g.root + note + (bar === 3 && pos > 11 ? 3 : 0))
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.Q.value = 6
      lp.frequency.setValueAtTime(900, t)
      lp.frequency.exponentialRampToValueAtTime(160, t + step * 0.9)
      const v = ctx.createGain()
      v.gain.setValueAtTime(0.0001, t)
      v.gain.linearRampToValueAtTime(0.2, t + 0.005)
      v.gain.exponentialRampToValueAtTime(0.001, t + step * 0.95)
      o.connect(lp).connect(v).connect(out)
      o.start(t)
      o.stop(t + step)
    }
    // acorde curto (menor, com sétima)
    if (g.stab.includes(pos) && bar % 2 === 1) {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 1800
      const v = ctx.createGain()
      v.gain.setValueAtTime(0.06, t)
      v.gain.exponentialRampToValueAtTime(0.001, t + step * 2.5)
      lp.connect(v).connect(out)
      for (const iv of [12, 15, 19, 22]) {
        const o = ctx.createOscillator()
        o.type = 'square'
        o.frequency.value = hz(g.root + iv)
        o.connect(lp)
        o.start(t)
        o.stop(t + step * 2.6)
      }
    }
  }
  return ctx.startRendering()
}

export function reversed(ctx: BaseAudioContext, b: AudioBuffer) {
  const r = ctx.createBuffer(b.numberOfChannels, b.length, b.sampleRate)
  for (let c = 0; c < b.numberOfChannels; c++) {
    const src = b.getChannelData(c)
    const dst = r.getChannelData(c)
    for (let i = 0, n = src.length; i < n; i++) dst[i] = src[n - 1 - i]
  }
  return r
}

/** chiado de agulha: ruído rosa bem baixo + estalos esparsos */
export function crackle(ctx: BaseAudioContext, seconds = 4) {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const d = b.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    last = 0.97 * last + 0.03 * (Math.random() * 2 - 1)
    d[i] = last * 0.5 + (Math.random() < 0.00018 ? (Math.random() * 2 - 1) * 0.9 : 0)
  }
  return b
}
