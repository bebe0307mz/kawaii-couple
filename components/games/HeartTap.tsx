'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Heart {
  id: number
  left: number
  duration: number
  startTime: number
}

interface HeartTapProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 60

export default function HeartTap({ onComplete, playerEmail }: HeartTapProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [hearts, setHearts] = useState<Heart[]>([])
  const [gameOver, setGameOver] = useState(false)
  const heartIdRef = useRef(0)
  const scoreRef = useRef(0)

  // Spawn hearts
  const spawnHeart = useCallback(() => {
    const id = ++heartIdRef.current
    setHearts((prev) => [
      ...prev,
      {
        id,
        left: 5 + Math.random() * 85,
        duration: 2.5 + Math.random() * 2,
        startTime: Date.now(),
      },
    ])
    // Auto-remove after animation
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id))
    }, 5000)
  }, [])

  useEffect(() => {
    const spawnInterval = setInterval(spawnHeart, 600)
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(spawnInterval)
          clearInterval(countdownInterval)
          setGameOver(true)
          onComplete(scoreRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(spawnInterval)
      clearInterval(countdownInterval)
    }
  }, [spawnHeart, onComplete])

  function handleTapHeart(id: number) {
    if (gameOver) return
    setHearts((prev) => prev.filter((h) => h.id !== id))
    scoreRef.current += 1
    setScore(scoreRef.current)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Heart Tap 💝</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} hearts</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">left</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Game area */}
      <div
        className="relative flex-1 bg-gradient-to-b from-pink-50 to-pink-100 overflow-hidden border-t-2 border-[#FF69B4]"
        style={{ minHeight: 300 }}
      >
        {!gameOver && hearts.map((heart) => (
          <button
            key={heart.id}
            className="heart-falling select-none"
            style={{
              left: `${heart.left}%`,
              animationDuration: `${heart.duration}s`,
            }}
            onClick={() => handleTapHeart(heart.id)}
            onTouchStart={(e) => {
              e.preventDefault()
              handleTapHeart(heart.id)
            }}
          >
            💝
          </button>
        ))}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">💝</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} hearts</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}

        {!gameOver && hearts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#FF69B4] font-bold text-lg bounce-kawaii">
              Tap the hearts! 💝
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Tap every 💝 as fast as you can! (◕‿◕)
        </p>
      </div>
    </div>
  )
}
