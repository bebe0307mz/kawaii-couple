'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface LuckySpinProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45
const ICONS = ['🍓', '🌸', '⭐', '💝', '🍡', '🐰']

type Phase = 'spinning' | 'result'

export default function LuckySpin({ onComplete, playerEmail: _playerEmail }: LuckySpinProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [reels, setReels] = useState<number[]>([0, 0, 0])
  const [phase, setPhase] = useState<Phase>('spinning')
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    if (tickRef.current) clearInterval(tickRef.current)
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

  const startSpin = useCallback(() => {
    if (gameOverRef.current) return
    setPhase('spinning')
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setReels([
        Math.floor(Math.random() * ICONS.length),
        Math.floor(Math.random() * ICONS.length),
        Math.floor(Math.random() * ICONS.length),
      ])
    }, 80)
  }, [])

  useEffect(() => {
    startSpin()
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [startSpin])

  function handleStop() {
    if (gameOverRef.current || phase !== 'spinning') return
    if (tickRef.current) clearInterval(tickRef.current)
    setPhase('result')
    // Use current reels state via callback
    setReels((current) => {
      const allMatch = current[0] === current[1] && current[1] === current[2]
      const twoMatch = !allMatch && (
        current[0] === current[1] || current[1] === current[2] || current[0] === current[2]
      )
      if (allMatch) scoreRef.current += 3
      else if (twoMatch) scoreRef.current += 1
      setScore(scoreRef.current)
      return current
    })
    setTimeout(() => {
      if (!gameOverRef.current) startSpin()
    }, 700)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Lucky Spin 🎰</div>
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

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🎰</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pts</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div className="card-pixel p-4 flex gap-2">
              {reels.map((idx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center bg-white border-2 border-black"
                  style={{
                    width: 70,
                    height: 90,
                    fontSize: 48,
                    boxShadow: '3px 3px 0px #1a1a1a',
                  }}
                >
                  {ICONS[idx]}
                </div>
              ))}
            </div>

            {phase === 'result' && (
              <div className="pixel-font text-xs text-[#FF1493]">
                {reels[0] === reels[1] && reels[1] === reels[2]
                  ? 'JACKPOT! +3 ♡'
                  : (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2])
                    ? 'Match! +1 ♡'
                    : 'Try again~'}
              </div>
            )}

            <button
              onClick={handleStop}
              onTouchStart={(e) => { e.preventDefault(); handleStop() }}
              disabled={phase !== 'spinning'}
              className="btn-pixel text-lg"
              style={{ opacity: phase === 'spinning' ? 1 : 0.5 }}
            >
              STOP!
            </button>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Tap STOP to match! 3 in a row = jackpot (◕‿◕)
        </p>
      </div>
    </div>
  )
}
