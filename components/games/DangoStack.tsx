'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface DangoStackProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Dango {
  id: number
  x: number // percent across area, 0-100
  y: number // px from top
  speed: number
}

const GAME_DURATION = 45
const CATCH_RADIUS_PCT = 10 // half-width of the catcher's catching zone in % of area width
const CATCH_BAND_PX = 36 // vertical catch zone height

export default function DangoStack({ onComplete, playerEmail: _playerEmail }: DangoStackProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [dangos, setDangos] = useState<Dango[]>([])
  const [catcherX, setCatcherX] = useState(50)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const idRef = useRef(0)
  const catcherRef = useRef(50)
  const areaRef = useRef<HTMLDivElement>(null)
  const pointerActiveRef = useRef(false)

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

  useEffect(() => {
    const spawn = setInterval(() => {
      if (gameOverRef.current) return
      const id = ++idRef.current
      setDangos((prev) => [
        ...prev,
        {
          id,
          x: 10 + Math.random() * 80,
          y: -40,
          speed: 110 + Math.random() * 70,
        },
      ])
    }, 900)
    return () => clearInterval(spawn)
  }, [])

  useEffect(() => {
    let frame: number
    let last = 0
    function loop(ts: number) {
      if (gameOverRef.current) return
      const dt = last ? (ts - last) / 1000 : 0.016
      last = ts
      const areaH = areaRef.current?.clientHeight || 400
      const catcherY = areaH - 60
      setDangos((prev) => {
        const next: Dango[] = []
        for (const d of prev) {
          const newY = d.y + d.speed * dt
          if (newY > catcherY && newY < catcherY + CATCH_BAND_PX) {
            if (Math.abs(d.x - catcherRef.current) < CATCH_RADIUS_PCT) {
              scoreRef.current += 1
              setScore(scoreRef.current)
              continue
            }
          }
          if (newY > areaH + 40) continue
          next.push({ ...d, y: newY })
        }
        return next
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  function setCatcherFromClientX(clientX: number) {
    const rect = areaRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    const clamped = Math.max(0, Math.min(100, pct))
    catcherRef.current = clamped
    setCatcherX(clamped)
  }

  function onPointerDown(e: React.PointerEvent) {
    if (gameOverRef.current) return
    pointerActiveRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setCatcherFromClientX(e.clientX)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!pointerActiveRef.current) return
    setCatcherFromClientX(e.clientX)
  }
  function onPointerUp(e: React.PointerEvent) {
    pointerActiveRef.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameOverRef.current) return
      if (e.key === 'ArrowLeft') {
        const next = Math.max(0, catcherRef.current - 6)
        catcherRef.current = next
        setCatcherX(next)
      } else if (e.key === 'ArrowRight') {
        const next = Math.min(100, catcherRef.current + 6)
        catcherRef.current = next
        setCatcherX(next)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Dango Stack 🍡</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} caught</div>
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
        className="relative flex-1 overflow-hidden border-t-2 border-[#FF69B4] select-none touch-none"
        style={{ minHeight: 320, background: 'linear-gradient(to bottom, #FFF0F5, #FFE4F0)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {!gameOver && dangos.map((d) => (
          <div
            key={d.id}
            style={{
              position: 'absolute',
              left: `${d.x}%`,
              top: d.y,
              transform: 'translateX(-50%)',
              fontSize: 36,
              pointerEvents: 'none',
            }}
          >
            🍡
          </div>
        ))}

        {!gameOver && (
          <div
            style={{
              position: 'absolute',
              left: `${catcherX}%`,
              bottom: 20,
              transform: 'translateX(-50%)',
              fontSize: 48,
              transition: 'left 60ms linear',
              pointerEvents: 'none',
            }}
          >
            🥣
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🍡</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} caught</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Drag left/right to slide the bowl 🥣 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
