'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface DartTossProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45

export default function DartToss({ onComplete, playerEmail: _playerEmail }: DartTossProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [bullX, setBullX] = useState(50)
  const [bullY, setBullY] = useState(50)
  const [lastHit, setLastHit] = useState<{ pts: number; x: number; y: number } | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const bullRef = useRef({ x: 50, y: 50 })
  const targetRef = useRef({ x: 50, y: 50 })

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(scoreRef.current)
  }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [endGame])

  // Pick a new target periodically
  useEffect(() => {
    const interval = setInterval(() => {
      targetRef.current = { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 }
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // Move bullseye toward target smoothly
  useEffect(() => {
    let frame: number
    let last = 0
    function loop(ts: number) {
      if (gameOverRef.current) return
      const dt = last ? (ts - last) / 1000 : 0.016
      last = ts
      const speed = 35 // %/sec
      const dx = targetRef.current.x - bullRef.current.x
      const dy = targetRef.current.y - bullRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0.5) {
        bullRef.current.x += (dx / dist) * speed * dt
        bullRef.current.y += (dy / dist) * speed * dt
      }
      setBullX(bullRef.current.x)
      setBullY(bullRef.current.y)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  function handleThrow() {
    if (gameOverRef.current) return
    // Crosshair is fixed at center (50,50). Bullseye is at bullRef.
    const dx = bullRef.current.x - 50
    const dy = bullRef.current.y - 50
    const dist = Math.sqrt(dx * dx + dy * dy)
    let pts = 0
    if (dist < 5) pts = 3
    else if (dist < 12) pts = 2
    else if (dist < 22) pts = 1
    scoreRef.current += pts
    setScore(scoreRef.current)
    setLastHit({ pts, x: bullRef.current.x, y: bullRef.current.y })
    setTimeout(() => setLastHit(null), 500)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Dart Toss 🎯</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} pts</div>
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

      <div className="relative flex-1 bg-gradient-to-b from-pink-50 to-pink-100 overflow-hidden border-t-2 border-[#FF69B4] select-none"
        style={{ minHeight: 300 }}
      >
        {!gameOver && (
          <>
            {/* Crosshair (fixed center) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '3px dashed rgba(0,0,0,0.4)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                background: '#1a1a1a',
                pointerEvents: 'none',
              }}
            />

            {/* Moving bullseye */}
            <div
              style={{
                position: 'absolute',
                left: `${bullX}%`,
                top: `${bullY}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: 56,
                pointerEvents: 'none',
              }}
            >
              🎯
            </div>

            {lastHit && (
              <div
                style={{
                  position: 'absolute',
                  left: `${lastHit.x}%`,
                  top: `${lastHit.y}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
                className="pixel-font text-lg text-[#FF1493]"
              >
                +{lastHit.pts}
              </div>
            )}

            <button
              onClick={handleThrow}
              onTouchStart={(e) => { e.preventDefault(); handleThrow() }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
                border: 'none',
              }}
              aria-label="Throw dart"
            />
          </>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🎯</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pts</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Tap when 🎯 aligns with crosshair! Center=3, ring=2, outer=1 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
