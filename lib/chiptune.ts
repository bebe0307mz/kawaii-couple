// Tiny procedural chiptune player. Uses Web Audio API to generate
// looping kawaii melodies on the fly - no audio asset hosting needed.
//
// Each track is a 16-step sequence of note offsets (in semitones from a
// root frequency) plus a per-step rhythm pattern. The voice is a square
// wave with a short envelope, so it sounds 8-bit arcade by construction.

type Track = {
  name: string
  bpm: number
  rootHz: number
  // null = rest, number = semitone offset from rootHz
  notes: (number | null)[]
}

// 8 cute loops. Built from major-pentatonic / sakura-mode intervals so they
// always sound pleasant regardless of which one starts.
const TRACKS: Track[] = [
  {
    name: 'sakura-skip',
    bpm: 132,
    rootHz: 523.25, // C5
    notes: [0, 2, 4, 7, 4, 2, 0, 2, 4, 7, 9, 7, 4, 2, 0, null],
  },
  {
    name: 'mochi-bounce',
    bpm: 140,
    rootHz: 587.33, // D5
    notes: [0, 4, 7, 4, 0, 4, 7, 12, 9, 7, 4, 7, 9, 7, 4, 0],
  },
  {
    name: 'koi-stream',
    bpm: 120,
    rootHz: 493.88, // B4
    notes: [0, 2, 3, 5, 7, 5, 3, 2, 0, 2, 3, 5, 7, 8, 7, 5],
  },
  {
    name: 'lucky-spin',
    bpm: 150,
    rootHz: 659.25, // E5
    notes: [0, 5, 7, 5, 12, 7, 5, 7, 0, 5, 7, 12, 9, 7, 5, null],
  },
  {
    name: 'tea-time',
    bpm: 112,
    rootHz: 440, // A4
    notes: [0, 4, 7, 4, 0, 4, 7, 11, 12, 11, 7, 4, 7, 4, 0, null],
  },
  {
    name: 'pixel-heart',
    bpm: 138,
    rootHz: 554.37, // C#5
    notes: [0, 7, 5, 4, 2, 4, 5, 7, 12, 7, 5, 4, 2, 0, 2, 4],
  },
  {
    name: 'wagashi-waltz',
    bpm: 144,
    rootHz: 622.25, // D#5
    notes: [0, 4, 7, 12, 7, 4, 0, 4, 5, 9, 12, 9, 5, 4, 0, null],
  },
  {
    name: 'pocky-march',
    bpm: 160,
    rootHz: 466.16, // A#4
    notes: [0, 0, 7, 7, 9, 9, 7, null, 5, 5, 4, 4, 2, 2, 0, null],
  },
]

export function trackNames(): string[] {
  return TRACKS.map((t) => t.name)
}

export class ChiptunePlayer {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private currentTrackIdx = 0
  private muted = false
  private playing = false

  constructor(muted = false) {
    this.muted = muted
  }

  pickTrack(seed?: number) {
    if (typeof seed === 'number') {
      this.currentTrackIdx = ((seed % TRACKS.length) + TRACKS.length) % TRACKS.length
    } else {
      this.currentTrackIdx = Math.floor(Math.random() * TRACKS.length)
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.08
    }
  }

  isMuted() {
    return this.muted
  }

  start() {
    if (this.playing) return
    if (typeof window === 'undefined') return
    type WindowWithAudio = Window &
      typeof globalThis & { webkitAudioContext?: typeof AudioContext }
    const w = window as WindowWithAudio
    const AC = w.AudioContext || w.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = this.muted ? 0 : 0.08
    this.masterGain.connect(this.ctx.destination)
    this.playing = true
    this.scheduleLoop()
  }

  stop() {
    this.playing = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
    this.masterGain = null
  }

  private scheduleLoop() {
    if (!this.ctx || !this.masterGain || !this.playing) return
    const track = TRACKS[this.currentTrackIdx]
    const stepSec = 60 / track.bpm / 2 // eighth notes
    const now = this.ctx.currentTime
    track.notes.forEach((n, i) => {
      if (n === null) return
      const freq = track.rootHz * Math.pow(2, n / 12)
      this.playNote(freq, now + i * stepSec, stepSec * 0.85)
    })
    const totalSec = track.notes.length * stepSec
    this.timeoutId = setTimeout(() => {
      this.scheduleLoop()
    }, totalSec * 1000)
  }

  private playNote(freq: number, when: number, dur: number) {
    if (!this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = freq
    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0, when)
    env.gain.linearRampToValueAtTime(0.9, when + 0.005)
    env.gain.exponentialRampToValueAtTime(0.001, when + dur)
    osc.connect(env).connect(this.masterGain)
    osc.start(when)
    osc.stop(when + dur + 0.02)
  }
}
