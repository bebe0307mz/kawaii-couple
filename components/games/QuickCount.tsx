'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface QuickCountProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45
const FLASH_MS = 2500 // emojis visible long enough for human to count
const EMOJIS = ['🌸', '⭐', '💝', '🍡', '🐱', '🎈', '🐰', '🌟']

type Phase = 'flash' | 'pick' | 'feedback'

interface Round {
  emoji: string
  count: number
  positions: { x: number; y: number }[]
  options: number[]
}

function pickRound(): Round {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const count = 3 + Math.floor(Math.random() * 10) // 3..12
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    positions.push({ x: 5 + Math.random() * 85, y: 5 + Math.random() * 85 })
  }
  const opts = new Set<number>([count])
  while (opts.size < 4) {
    const delta = Math.random() < 0.5 ? -1 : 1
    const off = (Math.floor(Math.random() * 3) + 1) * delta
    const v = count + off
    if (v > 0 && v !== count) opts.add(v)
  }
  const options = Array.from(opts).sort((a, b) => a - b)
  return { emoji, count, positions, options }
}

export default function QuickCount({ onComplete, playerEmail: _playerEmail }: QuickCountProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [round, setRound] = useState<Round>(() => pickRound())
  const [phase, setPhase] = useState<Phase>('flash')
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const lockRef = useRef(false)

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

  const startRound = useCallback(() => {
    if (gameOverRef.current) return
    const r = pickRound()
    setRound(r)
    setPhase('flash')
    setFeedback(null)
    lockRef.current = false
    setTimeout(() => {
      if (gameOverRef.current) return
      setPhase('pick')
    }, FLASH_MS)
  }, [])

  useEffect(() => {
    // Initial flash timer
    const t = setTimeout(() => {
      if (gameOverRef.current) return
      setPhase('pick')
    }, FLASH_MS)
    return () => clearTimeout(t)
  }, [])

  function handlePick(n: number) {
    if (gameOverRef.current || lockRef.current || phase !== 'pick') return
    lockRef.current = true
    if (n === round.count) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setFeedback('good')
    } else {
      setFeedback('bad')
    }
    setPhase('feedback')
    setTimeout(startRound, 500)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Quick Count 📊</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} correct</div>
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

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4] overflow-hidden">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">📊</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} correct</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : phase === 'flash' ? (
          <div className="relative w-full h-full" style={{ minHeight: 280 }}>
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 0,
                right: 0,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
              className="pixel-font text-xs text-[#FF1493]"
            >
              count fast! ✿
            </div>
            {round.positions.map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  fontSize: 42,
                  transform: 'translate(-50%, -50%)',
                  lineHeight: 1,
                }}
              >
                {round.emoji}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="card-pixel p-4 text-center">
              <p className="pixel-font text-xs text-[#FF1493] mb-2">How many {round.emoji}?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {round.options.map((n) => (
                <button
                  key={n}
                  onClick={() => handlePick(n)}
                  onTouchStart={(e) => { e.preventDefault(); handlePick(n) }}
                  className="btn-pixel py-4 text-lg"
                  style={{
                    background: feedback === 'good' && n === round.count ? '#86EFAC'
                      : feedback === 'bad' && n === round.count ? '#86EFAC'
                      : undefined,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Count the emojis fast! Brief flash, then pick. (◕‿◕)
        </p>
      </div>
    </div>
  )
}
