'use client'

import { useState, useEffect, useRef } from 'react'

// 3 kawaii chiptune melodies (note frequencies in Hz, duration in ms)
const SONGS = [
  {
    name: 'Sakura Dream',
    tempo: 140,
    notes: [
      [523, 150], [659, 150], [784, 150], [880, 300], [0, 100],
      [784, 150], [659, 150], [523, 150], [440, 300], [0, 100],
      [392, 150], [523, 150], [659, 150], [784, 300], [0, 100],
      [880, 150], [784, 150], [659, 150], [523, 400], [0, 200],
      [659, 150], [784, 150], [880, 150], [1047, 300], [0, 100],
      [880, 150], [784, 150], [659, 150], [523, 300], [0, 100],
      [440, 150], [523, 150], [659, 150], [784, 300], [0, 100],
      [523, 600], [0, 200],
    ] as [number, number][],
  },
  {
    name: 'Dango Dance',
    tempo: 160,
    notes: [
      [523, 100], [0, 50], [523, 100], [0, 50], [659, 200], [0, 50],
      [784, 100], [0, 50], [784, 100], [0, 50], [880, 200], [0, 100],
      [784, 100], [659, 100], [523, 100], [440, 200], [0, 100],
      [392, 100], [440, 100], [523, 300], [0, 200],
      [698, 100], [0, 50], [698, 100], [0, 50], [784, 200], [0, 50],
      [880, 100], [0, 50], [1047, 200], [0, 100],
      [880, 100], [784, 100], [698, 100], [659, 200], [0, 100],
      [523, 400], [0, 200],
    ] as [number, number][],
  },
  {
    name: 'Kawaii Rush',
    tempo: 180,
    notes: [
      [880, 100], [784, 100], [659, 100], [523, 100],
      [440, 100], [523, 100], [659, 100], [784, 100],
      [880, 200], [0, 100], [880, 100], [0, 50],
      [1047, 200], [880, 200], [784, 200],
      [659, 100], [523, 100], [440, 100], [392, 100],
      [440, 200], [523, 200], [659, 200],
      [784, 100], [880, 100], [784, 100], [659, 100],
      [523, 400], [0, 200],
    ] as [number, number][],
  },
]

// Accept old props shape (seed, active) OR new shape (autoplay) so both call-sites work
interface BGMPlayerProps {
  autoplay?: boolean
  // legacy props - accepted but ignored (player manages its own state now)
  seed?: number
  active?: boolean
}

export default function BGMPlayer({ autoplay: _autoplay = false }: BGMPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [songIdx, setSongIdx] = useState(0)
  const [volume, setVolume] = useState(0.15)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const playingRef = useRef(false)

  function getCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
      const gain = audioCtxRef.current.createGain()
      gain.gain.value = volume
      gain.connect(audioCtxRef.current.destination)
      gainRef.current = gain
    }
    return audioCtxRef.current
  }

  function playNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
    if (freq === 0) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration / 1000 - 0.01)
    osc.connect(gain)
    gain.connect(gainRef.current || ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + duration / 1000)
  }

  function stopAll() {
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current)
    loopTimeoutRef.current = null
  }

  function playSong(idx: number) {
    stopAll()
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const song = SONGS[idx % SONGS.length]
    let time = ctx.currentTime + 0.1
    let totalMs = 0
    for (const [freq, dur] of song.notes) {
      playNote(ctx, freq, time, dur)
      time += dur / 1000
      totalMs += dur
    }
    // Loop
    loopTimeoutRef.current = setTimeout(() => {
      if (playingRef.current) playSong(idx)
    }, totalMs + 100)
  }

  function togglePlay() {
    if (playing) {
      stopAll()
      setPlaying(false)
      playingRef.current = false
    } else {
      setPlaying(true)
      playingRef.current = true
      playSong(songIdx)
    }
  }

  function nextSong() {
    const next = (songIdx + 1) % SONGS.length
    setSongIdx(next)
    if (playing) {
      stopAll()
      playingRef.current = true
      playSong(next)
    }
  }

  function handleVolume(v: number) {
    setVolume(v)
    if (gainRef.current) gainRef.current.gain.value = v
  }

  useEffect(() => {
    return () => {
      stopAll()
      audioCtxRef.current?.close()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 100,
      background: 'rgba(26,10,46,0.9)',
      border: '2px solid #FF69B4',
      borderRadius: 12,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: '0 0 12px rgba(255,105,180,0.4)',
    }}>
      <button
        onClick={togglePlay}
        style={{
          background: playing ? '#FF1493' : '#FF69B4',
          border: 'none',
          borderRadius: 8,
          padding: '4px 10px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
      >
        {playing ? '⏸' : '♪'}
      </button>
      {playing && (
        <button
          onClick={nextSong}
          style={{
            background: 'transparent',
            border: '1px solid #FF69B4',
            borderRadius: 6,
            padding: '2px 8px',
            color: '#FF69B4',
            fontSize: '0.7rem',
            cursor: 'pointer',
          }}
        >
          ⏭
        </button>
      )}
      <input
        type="range"
        min={0}
        max={0.4}
        step={0.01}
        value={volume}
        onChange={(e) => handleVolume(parseFloat(e.target.value))}
        style={{ width: 48, accentColor: '#FF69B4' }}
      />
      <span style={{ color: '#FF69B4', fontSize: '0.6rem', maxWidth: 70, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {playing ? `♪ ${SONGS[songIdx].name}` : 'BGM'}
      </span>
    </div>
  )
}
