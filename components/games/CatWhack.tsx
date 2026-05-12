'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CatWhackProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45
const HOLES = 9

export default function CatWhack({ onComplete, playerEmail: _playerEmail }: CatWhackProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [activeHoles, setActiveHoles] = useState<Set<number>>(new Set())
  const [whacked, setWhacked] = useState<Set<number>>(new Set())
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)

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
    const popInterval = setInterval(() => {
      if (gameOverRef.current) return
      const idx = Math.floor(Math.random() * HOLES)
      setActiveHoles((prev) => {
        if (prev.has(idx)) return prev
        const next = new Set(prev)
        next.add(idx)
        return next
      })
      // Hide after 900ms
      setTimeout(() => {
        setActiveHoles((prev) => {
          if (!prev.has(idx)) return prev
          const next = new Set(prev)
          next.delete(idx)
          return next
        })
        setWhacked((prev) => {
          if (!prev.has(idx)) return prev
          const next = new Set(prev)
          next.delete(idx)
          return next
        })
      }, 900)
    }, 600)
    return () => clearInterval(popInterval)
  }, [])

  function handleWhack(idx: number) {
    if (gameOverRef.current) return
    if (!activeHoles.has(idx) || whacked.has(idx)) return
    setWhacked((prev) => {
      const next = new Set(prev)
      next.add(idx)
      return next
    })
    scoreRef.current += 1
    setScore(scoreRef.current)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Cat Whack 🐾</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} whacks</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🐾</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} whacks</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-w-xs w-full">
            {Array.from({ length: HOLES }, (_, i) => {
              const isUp = activeHoles.has(i)
              const isHit = whacked.has(i)
              return (
                <button
                  key={i}
                  onClick={() => handleWhack(i)}
                  onTouchStart={(e) => { e.preventDefault(); handleWhack(i) }}
                  style={{
                    aspectRatio: '1 / 1',
                    background: '#8B5A2B',
                    border: '3px solid #1a1a1a',
                    borderRadius: '50%',
                    boxShadow: 'inset 0 -6px 10px rgba(0,0,0,0.3)',
                    fontSize: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isUp ? (isHit ? '💥' : '🐱') : ''}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Whack the cats before they hide! 🐾 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
