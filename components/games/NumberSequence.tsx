'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface NumberSequenceProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45

interface Round {
  shown: number[]
  answer: number
  options: number[]
}

function pickRound(): Round {
  const type = Math.random()
  let shown: number[] = []
  let answer = 0

  if (type < 0.5) {
    // Arithmetic: start + d, +d, +d, ...
    const start = Math.floor(Math.random() * 10) + 1
    const d = Math.floor(Math.random() * 7) + 1
    shown = [start, start + d, start + 2 * d, start + 3 * d]
    answer = start + 4 * d
  } else if (type < 0.85) {
    // Geometric (double/triple small ones)
    const start = Math.floor(Math.random() * 4) + 1
    const r = Math.random() < 0.5 ? 2 : 3
    shown = [start, start * r, start * r * r, start * r * r * r]
    answer = start * r * r * r * r
  } else {
    // Squares
    const i = Math.floor(Math.random() * 3) + 2 // 2..4
    shown = [i * i, (i + 1) * (i + 1), (i + 2) * (i + 2), (i + 3) * (i + 3)]
    answer = (i + 4) * (i + 4)
  }

  // Build options
  const opts = new Set<number>([answer])
  while (opts.size < 4) {
    const delta = (Math.floor(Math.random() * 9) - 4) || 1
    const candidate = answer + delta * Math.max(1, Math.floor(answer * 0.1))
    if (candidate !== answer && candidate > 0) opts.add(candidate)
  }
  const options = Array.from(opts).sort(() => Math.random() - 0.5)
  return { shown, answer, options }
}

export default function NumberSequence({ onComplete, playerEmail: _playerEmail }: NumberSequenceProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [round, setRound] = useState<Round>(() => pickRound())
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

  function handlePick(n: number) {
    if (gameOverRef.current || lockRef.current) return
    lockRef.current = true
    if (n === round.answer) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setFeedback('good')
    } else {
      setFeedback('bad')
    }
    setTimeout(() => {
      setRound(pickRound())
      setFeedback(null)
      lockRef.current = false
    }, 450)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Number Sequence 🔢</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🔢</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} correct</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div className="card-pixel p-5 text-center">
              <div className="pixel-font text-xs text-[#FF1493] mb-3">What comes next?</div>
              <div className="font-bold text-2xl text-[#FF69B4] tracking-wider">
                {round.shown.join(', ')}, ?
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {round.options.map((n) => (
                <button
                  key={n}
                  onClick={() => handlePick(n)}
                  onTouchStart={(e) => { e.preventDefault(); handlePick(n) }}
                  className="btn-pixel py-4 text-lg"
                  style={{
                    background: feedback === 'good' && n === round.answer ? '#86EFAC'
                      : feedback === 'bad' && n === round.answer ? '#86EFAC'
                      : undefined,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Find the pattern, pick the next number! (◕‿◕)
        </p>
      </div>
    </div>
  )
}
