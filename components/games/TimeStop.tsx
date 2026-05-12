'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TimeStopProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TARGET = 5.00
const TOTAL_ATTEMPTS = 3

interface Attempt {
  stopped: number
  diff: number
}

export default function TimeStop({ onComplete, playerEmail }: TimeStopProps) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const startTimeRef = useRef<number>(0)
  const animFrameRef = useRef<number>(0)
  const gameOverRef = useRef(false)

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now()
    setRunning(true)
    setStarted(true)
    setElapsed(0)

    function tick() {
      const now = performance.now()
      setElapsed((now - startTimeRef.current) / 1000)
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
  }, [])

  const stopTimer = useCallback(() => {
    if (!running || gameOverRef.current) return
    cancelAnimationFrame(animFrameRef.current)
    setRunning(false)

    const stopped = (performance.now() - startTimeRef.current) / 1000
    const diff = Math.abs(stopped - TARGET)

    setAttempts((prev) => {
      const next = [...prev, { stopped, diff }]

      if (next.length >= TOTAL_ATTEMPTS) {
        gameOverRef.current = true
        setGameOver(true)
        const totalDiffMs = next.reduce((sum, a) => sum + a.diff * 1000, 0)
        const finalScore = Math.max(0, Math.round(300 - totalDiffMs))
        setScore(finalScore)
        onComplete(finalScore)
      }

      return next
    })
  }, [running, onComplete])

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  const attemptsDone = attempts.length
  const nextAttempt = attemptsDone + 1

  function handlePress(e: React.MouseEvent | React.TouchEvent) {
    if (gameOverRef.current) return
    if (!running && attemptsDone < TOTAL_ATTEMPTS) {
      startTimer()
    } else if (running) {
      stopTimer()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="pixel-font text-xs text-[#FF1493] mb-1">Time Stop ⏱️</div>
        <div className="text-xs font-semibold text-gray-500">Stop as close to 5.00s as possible!</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        {/* Digital timer display */}
        <div
          className="card-pixel p-6 text-center w-full max-w-xs"
          style={{ background: '#111', borderColor: '#FF69B4' }}
        >
          <div
            className="pixel-font text-5xl"
            style={{ color: running ? '#FF69B4' : gameOver ? '#FFB6C1' : '#22C55E', letterSpacing: 4 }}
          >
            {elapsed.toFixed(2)}
          </div>
          <div className="text-xs mt-2" style={{ color: '#FFB6C1' }}>
            TARGET: 5.00s
          </div>
        </div>

        {!gameOver && (
          <button
            className="btn-pixel text-xl py-6 px-12"
            style={{
              background: running ? '#EF4444' : '#FF69B4',
              color: 'white',
              minWidth: 220,
            }}
            onClick={handlePress}
            onTouchStart={(e) => { e.preventDefault(); handlePress(e) }}
          >
            {!started ? 'TAP TO START' : running ? 'STOP! ✋' : `Attempt ${nextAttempt}/3 - START`}
          </button>
        )}

        {/* Attempt history */}
        {attempts.length > 0 && (
          <div className="w-full max-w-xs space-y-2">
            {attempts.map((a, i) => (
              <div key={i} className="card-pixel p-3 flex justify-between items-center">
                <span className="pixel-font text-xs text-[#FF69B4]">#{i + 1}</span>
                <span className="font-bold text-sm">{a.stopped.toFixed(2)}s</span>
                <span className="text-xs font-semibold text-gray-500">
                  {a.diff < 0.1 ? 'Perfect!' : `${(a.diff).toFixed(2)}s off`}
                </span>
              </div>
            ))}
          </div>
        )}

        {gameOver && (
          <div className="card-pixel p-4 text-center w-full max-w-xs">
            <div className="pixel-font text-sm text-[#FF1493] mb-1">Score</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score}/300</div>
            <p className="text-xs font-semibold text-gray-500 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>
    </div>
  )
}
