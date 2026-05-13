'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TargetPopProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Target {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  emoji: string
  born: number
  popping: boolean
}

const GAME_DURATION = 45
const MAX_TARGETS = 12
const TTL = 1800  // ms before auto-disappear
const EMOJIS = ['🌸', '🍡', '💕', '⭐', '🎀', '🌈', '🦋', '💝', '🍰', '🎵']

export default function TargetPop({ onComplete, playerEmail: _playerEmail }: TargetPopProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [targets, setTargets] = useState<Target[]>([])
  const [gameOver, setGameOver] = useState(false)
  const targetIdRef = useRef(0)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const areaRef = useRef<HTMLDivElement>(null)

  const spawnTarget = useCallback(() => {
    if (gameOverRef.current) return
    setTargets((prev) => {
      if (prev.length >= MAX_TARGETS) return prev
      const id = ++targetIdRef.current
      const size = 44 + Math.random() * 32
      const speed = 30 + Math.random() * 50
      const angle = Math.random() * Math.PI * 2
      return [
        ...prev,
        {
          id,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 75,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          born: Date.now(),
          popping: false,
        },
      ]
    })
  }, [])

  // Animation loop for moving targets
  useEffect(() => {
    let frame: number
    let last = 0
    function loop(ts: number) {
      if (gameOverRef.current) return
      const dt = last ? (ts - last) / 1000 : 0.016
      last = ts
      const now = Date.now()
      setTargets((prev) => {
        return prev
          .filter((t) => !t.popping || now - t.born < TTL + 300)
          .map((t) => {
            if (t.popping) return t
            // Auto-disappear if TTL exceeded (start popping animation)
            if (now - t.born > TTL) return { ...t, popping: true }
            let nx = t.x + t.vx * dt
            let ny = t.y + t.vy * dt
            let nvx = t.vx
            let nvy = t.vy
            // Bounce off walls (in percent units, area is 100x100)
            const halfW = (t.size / 2 / (areaRef.current?.clientWidth || 360)) * 100
            const halfH = (t.size / 2 / (areaRef.current?.clientHeight || 400)) * 100
            if (nx < halfW) { nx = halfW; nvx = Math.abs(nvx) }
            if (nx > 100 - halfW) { nx = 100 - halfW; nvx = -Math.abs(nvx) }
            if (ny < halfH) { ny = halfH; nvy = Math.abs(nvy) }
            if (ny > 100 - halfH) { ny = 100 - halfH; nvy = -Math.abs(nvy) }
            return { ...t, x: nx, y: ny, vx: nvx, vy: nvy }
          })
          .filter((t) => !t.popping || now - t.born < TTL + 250)
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const spawnInterval = setInterval(spawnTarget, 600)
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(spawnInterval)
          clearInterval(countdownInterval)
          if (!gameOverRef.current) {
            gameOverRef.current = true
            setGameOver(true)
            onComplete(scoreRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    // Spawn initial burst
    for (let i = 0; i < 6; i++) setTimeout(spawnTarget, i * 200)
    return () => {
      clearInterval(spawnInterval)
      clearInterval(countdownInterval)
    }
  }, [spawnTarget, onComplete])

  function handlePop(id: number) {
    if (gameOver) return
    setTargets((prev) => prev.map((t) => t.id === id ? { ...t, popping: true } : t))
    setTimeout(() => setTargets((prev) => prev.filter((t) => t.id !== id)), 200)
    scoreRef.current += 1
    setScore(scoreRef.current)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Target Pop 🌸</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} pops</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">left</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div
        ref={areaRef}
        className="relative flex-1 overflow-hidden border-t-2 border-[#FF69B4]"
        style={{ minHeight: 300, background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a2a4e 100%)' }}
      >
        {!gameOver && targets.map((target) => {
          const age = Date.now() - target.born
          const lifePct = Math.min(1, age / TTL)
          // Pulse animation: scale up then down as TTL approaches
          const urgency = lifePct > 0.7 ? 1 + Math.sin(Date.now() / 100) * 0.08 : 1
          return (
            <button
              key={target.id}
              onClick={() => handlePop(target.id)}
              onTouchStart={(e) => { e.preventDefault(); handlePop(target.id) }}
              style={{
                position: 'absolute',
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: target.size,
                height: target.size,
                transform: `translate(-50%, -50%) scale(${target.popping ? 1.5 : urgency})`,
                transition: target.popping ? 'transform 0.15s, opacity 0.15s' : 'none',
                opacity: target.popping ? 0 : Math.max(0.3, 1 - lifePct * 0.5),
                background: `radial-gradient(circle, rgba(255,105,180,0.9) 0%, rgba(192,132,252,0.8) 100%)`,
                border: `2px solid rgba(255,255,255,0.6)`,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: target.size * 0.45,
                userSelect: 'none',
                boxShadow: `0 0 ${10 + lifePct * 20}px rgba(255,105,180,${0.8 - lifePct * 0.5})`,
              }}
            >
              {target.emoji}
            </button>
          )
        })}

        {!gameOver && targets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#FF69B4] font-bold text-lg bounce-kawaii">Get ready! 🌸</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(26,10,46,0.85)' }}>
            <div className="text-5xl mb-3">🌸</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pops</div>
            <p className="text-sm font-semibold text-[#C084FC] mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Tap the kawaii targets before they disappear! ✿
        </p>
      </div>
    </div>
  )
}
