'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface OddOneOutProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45

const THEMES = [
  { fit: ['🍎', '🍌', '🍓', '🍒', '🍇', '🍑', '🍊', '🍍'], odd: ['🐶', '🚗', '⭐', '🎈', '🌙', '🔔'] },
  { fit: ['🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐯', '🐸'], odd: ['🍎', '🚗', '⭐', '🎈', '🌸', '🎸'] },
  { fit: ['☀️', '☁️', '🌧️', '⛈️', '❄️', '🌪️', '🌈', '🌤️'], odd: ['🍕', '🚗', '🎮', '🎈', '🌸', '🐶'] },
  { fit: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐'], odd: ['🍕', '🚗', '🎮', '🐱', '⭐'] },
  { fit: ['🚗', '🚙', '🚕', '🚌', '🚎', '🚓', '🚑', '🚒'], odd: ['🍕', '🌸', '🎮', '🐱', '⭐'] },
  { fit: ['🍕', '🍔', '🌭', '🍟', '🌮', '🍣', '🍱', '🍜'], odd: ['🚗', '🌸', '🎮', '🐱', '⭐'] },
]

function pickRound() {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)]
  const fits: string[] = []
  const used = new Set<string>()
  while (fits.length < 3) {
    const e = theme.fit[Math.floor(Math.random() * theme.fit.length)]
    if (!used.has(e)) {
      used.add(e)
      fits.push(e)
    }
  }
  const odd = theme.odd[Math.floor(Math.random() * theme.odd.length)]
  const items = [...fits, odd]
  // Shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  const oddIdx = items.indexOf(odd)
  return { items, oddIdx }
}

export default function OddOneOut({ onComplete, playerEmail: _playerEmail }: OddOneOutProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [round, setRound] = useState(() => pickRound())
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

  function handlePick(idx: number) {
    if (gameOverRef.current || lockRef.current) return
    lockRef.current = true
    if (idx === round.oddIdx) {
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
    }, 400)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Odd One Out 🃏</div>
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
            <div className="text-5xl mb-3">🃏</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} correct</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <p className="pixel-font text-xs text-[#FF1493]">Find the odd one!</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {round.items.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handlePick(i)}
                  onTouchStart={(e) => { e.preventDefault(); handlePick(i) }}
                  className="card-pixel"
                  style={{
                    padding: '20px',
                    fontSize: 48,
                    background: feedback === 'good' && i === round.oddIdx ? '#BBF7D0'
                      : feedback === 'bad' && i === round.oddIdx ? '#BBF7D0'
                      : feedback === 'bad' ? '#FECACA'
                      : 'white',
                    transition: 'background 0.15s',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Three fit a theme, one doesn&apos;t. Find it! (◕‿◕)
        </p>
      </div>
    </div>
  )
}
