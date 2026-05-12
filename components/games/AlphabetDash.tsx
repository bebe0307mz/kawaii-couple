'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface AlphabetDashProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const GAME_LIMIT = 60000

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function AlphabetDash({ onComplete, playerEmail }: AlphabetDashProps) {
  const [displayOrder] = useState<string[]>(shuffle([...LETTERS]))
  const [nextIndex, setNextIndex] = useState(0)
  const [tapped, setTapped] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number>(0)
  const gameOverRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const endGame = useCallback((nextIdx: number, ms: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    if (timerRef.current) clearInterval(timerRef.current)

    let finalScore: number
    if (nextIdx >= 26) {
      // Completed all
      finalScore = Math.max(0, 10000 - ms)
    } else {
      finalScore = nextIdx * 30
    }
    setScore(finalScore)
    onComplete(finalScore)
  }, [onComplete])

  function startGame() {
    startTimeRef.current = performance.now()
    setStarted(true)
    timerRef.current = setInterval(() => {
      const ms = performance.now() - startTimeRef.current
      setElapsed(ms)
      if (ms >= GAME_LIMIT) {
        endGame(nextIndex, ms)
      }
    }, 100)
  }

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function handleTap(letter: string) {
    if (!started) {
      startGame()
      // Also check if tapping happens to be 'A'
    }
    if (gameOverRef.current || tapped.has(letter)) return

    const expected = LETTERS[nextIndex]
    if (letter === expected) {
      const newTapped = new Set(tapped)
      newTapped.add(letter)
      setTapped(newTapped)
      const newIdx = nextIndex + 1
      setNextIndex(newIdx)

      if (newIdx >= 26) {
        const ms = performance.now() - startTimeRef.current
        endGame(newIdx, ms)
      }
    } else {
      // Wrong - flash red
      setFlash(letter)
      setTimeout(() => setFlash(null), 300)
    }
  }

  const timeRemaining = Math.max(0, (GAME_LIMIT - elapsed) / 1000)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Alphabet Dash ⌨️</div>
          <div className="font-bold text-lg text-[#FF69B4]">
            {nextIndex < 26 ? `Next: ${LETTERS[nextIndex]}` : 'Done!'}
          </div>
        </div>
        <div className="text-center">
          {started && !gameOver && (
            <>
              <div className="pixel-font text-sm text-[#FF1493]">{timeRemaining.toFixed(1)}s</div>
              <div className="text-xs font-semibold text-gray-500">left</div>
            </>
          )}
          {!started && (
            <div className="pixel-font text-xs text-gray-400">Tap A first!</div>
          )}
        </div>
      </div>

      <div className="px-4 mb-1">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${(nextIndex / 26) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-2 overflow-auto">
        {gameOver ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl">⌨️</div>
            <div className="pixel-font text-base text-[#FF1493]">Done!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pts</div>
            <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            {!started && (
              <p className="pixel-font text-xs text-[#FF69B4] mb-3 text-center">
                Tap A, B, C... in order as fast as you can!
              </p>
            )}
            <div className="grid grid-cols-5 gap-2 w-full max-w-xs">
              {displayOrder.map((letter) => {
                const isTapped = tapped.has(letter)
                const isFlash = flash === letter
                return (
                  <button
                    key={letter}
                    className="btn-pixel text-sm font-bold py-3"
                    style={{
                      background: isTapped ? '#FF69B4' : isFlash ? '#EF4444' : '#FFF0F5',
                      color: isTapped ? 'white' : isFlash ? 'white' : '#FF1493',
                      borderColor: isTapped ? '#FF1493' : '#FFB6C1',
                      transition: 'background 0.15s',
                      opacity: isTapped ? 0.7 : 1,
                    }}
                    onClick={() => handleTap(letter)}
                    onTouchStart={(e) => { e.preventDefault(); handleTap(letter) }}
                    disabled={isTapped}
                  >
                    {isTapped ? '✓' : letter}
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
