'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface StarCatcherProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface FallingItem {
  id: number
  x: number
  y: number
  type: 'star' | 'heart' | 'bomb'
  speed: number
  alive: boolean
}

const GAME_DURATION = 45

export default function StarCatcher({ onComplete, playerEmail }: StarCatcherProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [items, setItems] = useState<FallingItem[]>([])
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const itemIdRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const spawnTimerRef = useRef(0)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    cancelAnimationFrame(animFrameRef.current)
    onComplete(scoreRef.current)
  }, [onComplete])

  // Timer
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

  // Game loop
  useEffect(() => {
    function loop(timestamp: number) {
      if (gameOverRef.current) return
      const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0.016
      lastTimeRef.current = timestamp
      spawnTimerRef.current += dt

      if (spawnTimerRef.current > 0.8) {
        spawnTimerRef.current = 0
        const rand = Math.random()
        const type: 'star' | 'heart' | 'bomb' = rand < 0.6 ? 'star' : rand < 0.8 ? 'heart' : 'bomb'
        const id = ++itemIdRef.current
        setItems((prev) => [
          ...prev,
          {
            id,
            x: 5 + Math.random() * 88,
            y: -5,
            type,
            speed: 80 + Math.random() * 100,
            alive: true,
          },
        ])
      }

      setItems((prev) =>
        prev
          .map((item) => ({ ...item, y: item.y + item.speed * dt }))
          .filter((item) => item.y < 110 && item.alive)
      )

      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  function handleTap(id: number, type: 'star' | 'heart' | 'bomb', e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    if (gameOver) return
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (type === 'star') {
      scoreRef.current += 1
    } else if (type === 'heart') {
      scoreRef.current += 3
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 2)
    }
    setScore(scoreRef.current)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Star Catcher 🌟</div>
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

      <div
        className="relative flex-1 bg-gradient-to-b from-purple-50 to-pink-100 overflow-hidden border-t-2 border-[#FF69B4]"
        style={{ minHeight: 300 }}
      >
        {!gameOver && items.map((item) => (
          <button
            key={item.id}
            onClick={(e) => handleTap(item.id, item.type, e)}
            onTouchStart={(e) => { e.preventDefault(); handleTap(item.id, item.type, e) }}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: item.type === 'heart' ? 32 : 28,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              userSelect: 'none',
              padding: 8,
              lineHeight: 1,
            }}
          >
            {item.type === 'star' ? '⭐' : item.type === 'heart' ? '💝' : '💣'}
          </button>
        ))}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🌟</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pts</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          ⭐+1 | 💝+3 | 💣-2 - Tap fast!
        </p>
      </div>
    </div>
  )
}
