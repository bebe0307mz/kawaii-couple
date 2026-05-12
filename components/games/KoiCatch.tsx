'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface KoiCatchProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface FallingItem {
  id: number
  left: number
  duration: number
  isBomb: boolean
}

const GAME_DURATION = 45

export default function KoiCatch({ onComplete, playerEmail: _playerEmail }: KoiCatchProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [items, setItems] = useState<FallingItem[]>([])
  const [gameOver, setGameOver] = useState(false)
  const idRef = useRef(0)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)

  const spawn = useCallback(() => {
    if (gameOverRef.current) return
    const id = ++idRef.current
    const isBomb = Math.random() < 0.22
    setItems((prev) => [
      ...prev,
      {
        id,
        left: 5 + Math.random() * 85,
        duration: 3 + Math.random() * 2,
        isBomb,
      },
    ])
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }, 5500)
  }, [])

  useEffect(() => {
    const spawnInterval = setInterval(spawn, 650)
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(spawnInterval)
          clearInterval(countdown)
          gameOverRef.current = true
          setGameOver(true)
          onComplete(scoreRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      clearInterval(spawnInterval)
      clearInterval(countdown)
    }
  }, [spawn, onComplete])

  function handleTap(id: number, isBomb: boolean) {
    if (gameOverRef.current) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    scoreRef.current += isBomb ? -1 : 1
    if (scoreRef.current < 0) scoreRef.current = 0
    setScore(scoreRef.current)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Koi Catch 🐟</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} koi</div>
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
        className="relative flex-1 bg-gradient-to-b from-pink-50 to-pink-100 overflow-hidden border-t-2 border-[#FF69B4]"
        style={{ minHeight: 300 }}
      >
        {!gameOver && items.map((item) => (
          <button
            key={item.id}
            className="heart-falling select-none"
            style={{
              left: `${item.left}%`,
              animationDuration: `${item.duration}s`,
            }}
            onClick={() => handleTap(item.id, item.isBomb)}
            onTouchStart={(e) => {
              e.preventDefault()
              handleTap(item.id, item.isBomb)
            }}
          >
            {item.isBomb ? '💣' : '🐟'}
          </button>
        ))}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🐟</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} koi</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}

        {!gameOver && items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#FF69B4] font-bold text-lg bounce-kawaii">Catch the koi! 🐟</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Tap 🐟 to catch, avoid 💣 bombs! (◕‿◕)
        </p>
      </div>
    </div>
  )
}
