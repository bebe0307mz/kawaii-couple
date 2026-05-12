'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface BalloonPopProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Balloon {
  id: number
  x: number
  y: number
  size: number
  color: string
  speed: number
}

const GAME_DURATION = 45
const MAX_BALLOONS = 8
const SPAWN_INTERVAL = 900

const BALLOON_COLORS = [
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Purple', hex: '#C084FC' },
  { name: 'Blue', hex: '#60A5FA' },
  { name: 'Yellow', hex: '#FBBF24' },
  { name: 'Red', hex: '#F87171' },
  { name: 'Green', hex: '#34D399' },
]

export default function BalloonPop({ onComplete, playerEmail: _playerEmail }: BalloonPopProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [targetIdx, setTargetIdx] = useState(0)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const idRef = useRef(0)
  const areaRef = useRef<HTMLDivElement>(null)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(scoreRef.current)
  }, [onComplete])

  // Pick a starting target color
  useEffect(() => {
    setTargetIdx(Math.floor(Math.random() * BALLOON_COLORS.length))
  }, [])

  // Rotate target every ~7s
  useEffect(() => {
    const i = setInterval(() => {
      if (gameOverRef.current) return
      setTargetIdx((prev) => {
        let next = Math.floor(Math.random() * BALLOON_COLORS.length)
        if (next === prev) next = (next + 1) % BALLOON_COLORS.length
        return next
      })
    }, 7000)
    return () => clearInterval(i)
  }, [])

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
    let frame: number
    let last = 0
    function loop(ts: number) {
      if (gameOverRef.current) return
      const dt = last ? (ts - last) / 1000 : 0.016
      last = ts
      setBalloons((prev) => prev
        .map((b) => ({ ...b, y: b.y - b.speed * dt }))
        .filter((b) => b.y > -100))
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOverRef.current) return
      setBalloons((prev) => {
        if (prev.length >= MAX_BALLOONS) return prev
        const id = ++idRef.current
        const size = 48 + Math.random() * 24
        const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
        return [
          ...prev,
          {
            id,
            x: 8 + Math.random() * 80,
            y: (areaRef.current?.clientHeight || 400) + 20,
            size,
            color: color.hex,
            speed: 55 + Math.random() * 50,
          },
        ]
      })
    }, SPAWN_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  function popBalloon(id: number, color: string) {
    if (gameOverRef.current) return
    setBalloons((prev) => prev.filter((b) => b.id !== id))
    const target = BALLOON_COLORS[targetIdx]
    if (color === target.hex) {
      scoreRef.current += 1
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 1)
    }
    setScore(scoreRef.current)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100
  const target = BALLOON_COLORS[targetIdx]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Balloon Pop 🎈</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} popped</div>
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

      <div className="px-4 pb-2 flex items-center justify-center gap-2">
        <span className="text-xs font-semibold text-gray-600">Pop only:</span>
        <span
          className="inline-block w-6 h-6 rounded-full border-2 border-black"
          style={{ background: target.hex }}
        />
        <span className="pixel-font text-xs text-[#FF1493]">{target.name}</span>
      </div>

      <div
        ref={areaRef}
        className="relative flex-1 overflow-hidden border-t-2 border-[#FF69B4] select-none"
        style={{ minHeight: 300, background: 'linear-gradient(to bottom, #FFF0F5, #FFE4F0)' }}
      >
        {!gameOver && balloons.map((b) => (
          <button
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: b.y,
              width: b.size,
              height: b.size,
              borderRadius: '50%',
              background: b.color,
              border: '3px solid rgba(0,0,0,0.15)',
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              fontSize: b.size * 0.45,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10,
            }}
            onClick={(e) => { e.stopPropagation(); popBalloon(b.id, b.color) }}
            onTouchStart={(e) => { e.preventDefault(); popBalloon(b.id, b.color) }}
          >
            🎈
          </button>
        ))}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🎈</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} popped</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Pop only the {target.name} balloons! Wrong color = -1 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
