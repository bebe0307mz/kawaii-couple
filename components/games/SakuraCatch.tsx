'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SakuraCatchProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface FallingItem {
  id: number
  x: number
  y: number
  speed: number
  type: 'petal' | 'bomb'
}

const GAME_DURATION = 45
const BASKET_WIDTH = 80
const ITEM_SIZE = 40

export default function SakuraCatch({ onComplete, playerEmail }: SakuraCatchProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [basketX, setBasketX] = useState(50) // percentage
  const [items, setItems] = useState<FallingItem[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameAreaHeight, setGameAreaHeight] = useState(400)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const basketXRef = useRef(50)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const itemIdRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (gameAreaRef.current) {
      setGameAreaHeight(gameAreaRef.current.clientHeight)
    }
  }, [])

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    cancelAnimationFrame(animFrameRef.current)
    onComplete(scoreRef.current)
  }, [onComplete])

  // Game loop
  useEffect(() => {
    let spawnTimer = 0

    function loop(timestamp: number) {
      if (gameOverRef.current) return
      const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0.016
      lastTimeRef.current = timestamp
      spawnTimer += dt

      if (spawnTimer > 1.2) {
        spawnTimer = 0
        const isBomb = Math.random() < 0.25
        const id = ++itemIdRef.current
        setItems((prev) => [
          ...prev,
          {
            id,
            x: 5 + Math.random() * 90,
            y: 0,
            speed: 60 + Math.random() * 80,
            type: isBomb ? 'bomb' : 'petal',
          },
        ])
      }

      const areaHeight = gameAreaRef.current?.clientHeight || 400
      const areaWidth = gameAreaRef.current?.clientWidth || 300

      setItems((prev) => {
        const updated = prev
          .map((item) => ({ ...item, y: item.y + item.speed * dt }))
          .filter((item) => {
            // Check collision with basket
            const basketPx = (basketXRef.current / 100) * areaWidth
            const itemPx = (item.x / 100) * areaWidth
            const dist = Math.abs(itemPx - basketPx)
            const basketTop = areaHeight - 60
            if (item.y > basketTop && item.y < basketTop + 50 && dist < BASKET_WIDTH / 2 + ITEM_SIZE / 2) {
              // Caught!
              if (item.type === 'petal') {
                scoreRef.current += 1
              } else {
                scoreRef.current = Math.max(0, scoreRef.current - 2)
              }
              setScore(scoreRef.current)
              return false
            }
            return item.y < areaHeight + 50
          })
        return updated
      })

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

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

  // Touch/click controls
  function handleAreaInteraction(e: React.TouchEvent | React.MouseEvent) {
    if (gameOver) return
    const target = gameAreaRef.current
    if (!target) return
    const rect = target.getBoundingClientRect()
    let clientX: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
    } else {
      clientX = (e as React.MouseEvent).clientX
    }
    const relX = ((clientX - rect.left) / rect.width) * 100
    const clamped = Math.max(5, Math.min(95, relX))
    basketXRef.current = clamped
    setBasketX(clamped)
  }

  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameOver) return
      if (e.key === 'ArrowLeft') {
        basketXRef.current = Math.max(5, basketXRef.current - 8)
        setBasketX(basketXRef.current)
      } else if (e.key === 'ArrowRight') {
        basketXRef.current = Math.min(95, basketXRef.current + 8)
        setBasketX(basketXRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameOver])

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Sakura Catch 🌸</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} petals</div>
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
        ref={gameAreaRef}
        className="relative flex-1 bg-gradient-to-b from-pink-50 to-pink-100 overflow-hidden border-t-2 border-[#FF69B4] select-none"
        style={{ minHeight: 300 }}
        onMouseMove={handleAreaInteraction}
        onTouchMove={(e) => { e.preventDefault(); handleAreaInteraction(e) }}
        onTouchStart={(e) => { e.preventDefault(); handleAreaInteraction(e) }}
      >
        {!gameOver && items.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: item.y,
              transform: 'translate(-50%, -50%)',
              fontSize: 28,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {item.type === 'petal' ? '🌸' : '💣'}
          </div>
        ))}

        {/* Basket */}
        {!gameOver && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: `${basketX}%`,
              transform: 'translateX(-50%)',
              fontSize: 36,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            🧺
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🌸</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} petals</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Move the basket to catch 🌸 petals! Avoid 💣 bombs!
        </p>
      </div>
    </div>
  )
}
