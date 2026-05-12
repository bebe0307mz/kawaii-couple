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
  size: number
  color: string
  popping: boolean
}

const GAME_DURATION = 45
const MAX_TARGETS = 6
const COLORS = ['#FF69B4', '#E6CCFF', '#FF8C94', '#C084FC', '#FFB6C1', '#A78BFA']

export default function TargetPop({ onComplete, playerEmail }: TargetPopProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [targets, setTargets] = useState<Target[]>([])
  const [gameOver, setGameOver] = useState(false)
  const targetIdRef = useRef(0)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)

  const spawnTarget = useCallback(() => {
    if (gameOverRef.current) return
    setTargets((prev) => {
      if (prev.length >= MAX_TARGETS) return prev
      const id = ++targetIdRef.current
      const size = 40 + Math.random() * 40
      return [
        ...prev,
        {
          id,
          x: 5 + Math.random() * 85,
          y: 10 + Math.random() * 75,
          size,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          popping: false,
        },
      ]
    })
  }, [])

  useEffect(() => {
    const spawnInterval = setInterval(spawnTarget, 1500)
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(spawnInterval)
          clearInterval(countdownInterval)
          gameOverRef.current = true
          setGameOver(true)
          onComplete(scoreRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    // Spawn initial targets
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnTarget, i * 300)
    }
    return () => {
      clearInterval(spawnInterval)
      clearInterval(countdownInterval)
    }
  }, [spawnTarget, onComplete])

  function handlePop(id: number) {
    if (gameOver) return
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, popping: true } : t))
    )
    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== id))
    }, 200)
    scoreRef.current += 1
    setScore(scoreRef.current)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Target Pop 🎯</div>
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
        className="relative flex-1 bg-gradient-to-b from-pink-50 to-purple-50 overflow-hidden border-t-2 border-[#FF69B4]"
        style={{ minHeight: 300 }}
      >
        {!gameOver && targets.map((target) => (
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
              transform: `translate(-50%, -50%) scale(${target.popping ? 1.4 : 1})`,
              transition: 'transform 0.15s ease-out, opacity 0.15s',
              opacity: target.popping ? 0 : 1,
              background: target.color,
              border: '3px solid #1a1a1a',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: target.size * 0.4,
              userSelect: 'none',
              boxShadow: '3px 3px 0px #1a1a1a',
            }}
          >
            🎯
          </button>
        ))}

        {!gameOver && targets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#FF69B4] font-bold text-lg bounce-kawaii">Get ready! 🎯</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🎯</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pops</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Pop all the targets! Smaller ones are worth the same~ (◕‿◕)
        </p>
      </div>
    </div>
  )
}
