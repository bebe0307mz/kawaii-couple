'use client'

import { useEffect, useRef, useState } from 'react'
import { ChiptunePlayer } from '@/lib/chiptune'

type Props = {
  // changes whenever a new game starts; used to pick a fresh track
  seed: number
  // hide UI when game over so it doesn't compete with results screens
  active: boolean
}

const STORAGE_KEY = 'kc-bgm-muted'

export default function BGMPlayer({ seed, active }: Props) {
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })
  const [armed, setArmed] = useState(false)
  const playerRef = useRef<ChiptunePlayer | null>(null)

  // Web Audio requires a user gesture before playing. Arm on first tap anywhere.
  useEffect(() => {
    if (armed) return
    function onGesture() {
      setArmed(true)
    }
    window.addEventListener('pointerdown', onGesture, { once: true })
    window.addEventListener('keydown', onGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [armed])

  // Start / stop based on active + armed state
  useEffect(() => {
    if (!active || !armed) {
      playerRef.current?.stop()
      playerRef.current = null
      return
    }
    const p = new ChiptunePlayer(muted)
    p.pickTrack(seed)
    p.start()
    playerRef.current = p
    return () => {
      p.stop()
      if (playerRef.current === p) playerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, armed, seed])

  function toggleMute() {
    const next = !muted
    setMuted(next)
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    playerRef.current?.setMuted(next)
  }

  if (!active) return null

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      title={muted ? 'Unmute kawaii BGM' : 'Mute kawaii BGM'}
      className="fixed top-3 right-3 z-50 btn-pixel btn-pixel-white text-xs py-1 px-2 opacity-90 hover:opacity-100"
      style={{ minWidth: 40 }}
    >
      {muted ? '🔇' : '🎵'}
    </button>
  )
}
