'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface LightningTileProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45
const GRID = 16

export default function LightningTile({ onComplete, playerEmail: _playerEmail }: LightningTileProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [activeTile, setActiveTile] = useState<number>(-1)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const activeRef = useRef(-1)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(scoreRef.current)
  }, [onComplete])

  const lightUp = useCallback(() => {
    if (gameOverRef.current) return
    let next = Math.floor(Math.random() * GRID)
    if (next === activeRef.current) next = (next + 1) % GRID
    activeRef.current = next
    setActiveTile(next)
  }, [])

  useEffect(() => {
    lightUp()
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
    // Auto-rotate if no tap within ~1.5s
    const rotate = setInterval(() => {
      if (gameOverRef.current) return
      lightUp()
    }, 1600)
    return () => {
      clearInterval(interval)
      clearInterval(rotate)
    }
  }, [endGame, lightUp])

  function handleTap(idx: number) {
    if (gameOverRef.current) return
    if (idx === activeRef.current) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      lightUp()
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 1)
      setScore(scoreRef.current)
    }
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Lightning Tile ⚡</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">⚡</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pts</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-w-xs w-full">
            {Array.from({ length: GRID }, (_, i) => (
              <button
                key={i}
                onClick={() => handleTap(i)}
                onTouchStart={(e) => { e.preventDefault(); handleTap(i) }}
                style={{
                  aspectRatio: '1 / 1',
                  background: i === activeTile ? '#FF1493' : '#FFE4F0',
                  border: '3px solid #1a1a1a',
                  boxShadow: '3px 3px 0px #1a1a1a',
                  fontSize: 22,
                  transition: 'background 0.08s',
                }}
              >
                {i === activeTile ? '⚡' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Tap the ⚡ tile as fast as you can! Wrong = -1 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
