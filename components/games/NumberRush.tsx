'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface NumberRushProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GRID_SIZE = 25
const TIME_LIMIT = 90000 // ms

function shuffleGrid(): number[] {
  const nums = Array.from({ length: GRID_SIZE }, (_, i) => i + 1)
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[nums[i], nums[j]] = [nums[j], nums[i]]
  }
  return nums
}

export default function NumberRush({ onComplete, playerEmail }: NumberRushProps) {
  const [grid] = useState<number[]>(() => shuffleGrid())
  const [found, setFound] = useState<Set<number>>(new Set())
  const [next, setNext] = useState(1)
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [flash, setFlash] = useState<{ num: number; correct: boolean } | null>(null)
  const gameOverRef = useRef(false)
  const nextRef = useRef(1)
  const startTimeRef = useRef(0)

  const endGame = useCallback((reachedNext: number, elapsedMs: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)

    let sc: number
    if (reachedNext > GRID_SIZE) {
      // Finished! score = 10000 - elapsed, min 0
      sc = Math.max(0, 10000 - elapsedMs)
    } else {
      // Score = highest number reached
      sc = reachedNext - 1
    }
    onComplete(sc)
  }, [onComplete])

  // Timer when started
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => {
      const el = Date.now() - startTimeRef.current
      setElapsed(el)
      if (el >= TIME_LIMIT) {
        clearInterval(interval)
        endGame(nextRef.current, el)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [started, endGame])

  function handleClick(num: number) {
    if (gameOver) return

    if (!started) {
      const now = Date.now()
      setStarted(true)
      setStartTime(now)
      startTimeRef.current = now
    }

    if (num === nextRef.current) {
      setFlash({ num, correct: true })
      const newFound = new Set(found)
      newFound.add(num)
      setFound(newFound)
      nextRef.current += 1
      setNext(nextRef.current)

      setTimeout(() => setFlash(null), 200)

      if (nextRef.current > GRID_SIZE) {
        const el = Date.now() - startTimeRef.current
        setElapsed(el)
        endGame(nextRef.current, el)
      }
    } else {
      setFlash({ num, correct: false })
      setTimeout(() => setFlash(null), 300)
    }
  }

  const timeLeftSec = Math.max(0, Math.ceil((TIME_LIMIT - elapsed) / 1000))
  const progress = (elapsed / TIME_LIMIT) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Number Rush 🔢</div>
          <div className="font-bold text-lg text-[#FF69B4]">
            Find: {next <= GRID_SIZE ? next : 'Done!'}
          </div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">
            {started ? `${timeLeftSec}s` : 'Ready'}
          </div>
          <div className="text-xs font-semibold text-gray-500">
            {next - 1}/{GRID_SIZE} done
          </div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-2">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🔢</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">
              {next > GRID_SIZE ? 'Finished!' : 'Time Up!'}
            </div>
            <div className="font-bold text-2xl text-[#FF69B4]">
              {next > GRID_SIZE
                ? `${(elapsed / 1000).toFixed(2)}s`
                : `Reached ${next - 1}`}
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            {!started && (
              <p className="text-xs font-bold text-[#FF69B4] mb-2 bounce-kawaii">
                Click 1, then 2, then 3... in order! ♡
              </p>
            )}
            <div
              className="grid gap-1 w-full max-w-xs"
              style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
            >
              {grid.map((num) => {
                const isDone = found.has(num)
                const isFlashCorrect = flash?.num === num && flash.correct
                const isFlashWrong = flash?.num === num && !flash.correct

                return (
                  <button
                    key={num}
                    onClick={() => handleClick(num)}
                    onTouchStart={(e) => { e.preventDefault(); handleClick(num) }}
                    style={{
                      aspectRatio: '1',
                      background: isDone
                        ? '#FFB6C1'
                        : isFlashCorrect
                        ? '#22C55E'
                        : isFlashWrong
                        ? '#EF4444'
                        : 'white',
                      border: '2px solid #1a1a1a',
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.65rem',
                      cursor: isDone ? 'default' : 'pointer',
                      opacity: isDone ? 0.4 : 1,
                      color: isDone ? '#FF69B4' : '#1a1a1a',
                      transition: 'background 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    {isDone ? '' : num}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
