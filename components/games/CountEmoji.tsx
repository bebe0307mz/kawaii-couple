'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CountEmojiProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const EMOJIS = ['🌸', '🍡', '⭐', '💝', '🎀', '🦋', '🍰', '🌈']
const TOTAL_ROUNDS = 5
const ROUND_TIME = 8

interface Round {
  items: string[]
  target: string
  count: number
}

function makeRound(): Round {
  const target = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const targetCount = 8 + Math.floor(Math.random() * 8) // 8-15
  const total = 20 + Math.floor(Math.random() * 16) // 20-35
  const items: string[] = []

  for (let i = 0; i < targetCount; i++) items.push(target)
  const others = EMOJIS.filter((e) => e !== target)
  while (items.length < total) {
    items.push(others[Math.floor(Math.random() * others.length)])
  }

  // Shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }

  return { items, target, count: targetCount }
}

export default function CountEmoji({ onComplete, playerEmail }: CountEmojiProps) {
  const [rounds] = useState<Round[]>(() => Array.from({ length: TOTAL_ROUNDS }, makeRound))
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [revealed, setRevealed] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)

  const endGame = useCallback((finalScore: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  const reveal = useCallback((userAnswer: number, curRound: number) => {
    if (revealed) return
    setRevealed(true)
    const correct = rounds[curRound].count
    const diff = Math.abs(userAnswer - correct)
    const pts = diff === 0 ? 2 : diff === 1 ? 1 : 0
    const newScore = scoreRef.current + pts
    scoreRef.current = newScore
    setScore(newScore)

    setTimeout(() => {
      const next = curRound + 1
      if (next >= TOTAL_ROUNDS) {
        endGame(newScore)
      } else {
        setCurrent(next)
        setAnswer(0)
        setTimeLeft(ROUND_TIME)
        setRevealed(false)
      }
    }, 1200)
  }, [revealed, rounds, endGame])

  // Timer
  useEffect(() => {
    if (revealed || gameOver) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          reveal(answer, current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [current, revealed, gameOver, reveal, answer])

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🔢</div>
        <div className="pixel-font text-base text-[#FF1493]">Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/10</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  const round = rounds[current]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Count the Emoji 🔢</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} pts</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">{current + 1}/{TOTAL_ROUNDS}</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${(current / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-3 overflow-auto">
        <div className="card-pixel p-3 mb-3 text-center" style={{ background: '#FFF0F5' }}>
          <span className="pixel-font text-sm text-[#FF1493]">How many </span>
          <span className="text-2xl">{round.target}</span>
          <span className="pixel-font text-sm text-[#FF1493]"> are there?</span>
        </div>

        {/* Emoji grid */}
        <div className="flex flex-wrap gap-1 justify-center mb-3 flex-1 content-start overflow-auto">
          {round.items.map((emoji, i) => (
            <span key={i} style={{ fontSize: 22, lineHeight: 1.3 }}>{emoji}</span>
          ))}
        </div>

        {/* Answer input */}
        <div className="flex items-center justify-center gap-4 pb-3">
          <button
            className="btn-pixel text-xl px-5 py-3"
            style={{ background: '#EF4444', color: 'white' }}
            onClick={() => setAnswer((a) => Math.max(0, a - 1))}
            onTouchStart={(e) => { e.preventDefault(); setAnswer((a) => Math.max(0, a - 1)) }}
            disabled={revealed}
          >
            -
          </button>
          <div className="card-pixel px-6 py-3 text-center min-w-[80px]">
            <div className="pixel-font text-3xl text-[#FF1493]">{answer}</div>
          </div>
          <button
            className="btn-pixel text-xl px-5 py-3"
            style={{ background: '#22C55E', color: 'white' }}
            onClick={() => setAnswer((a) => a + 1)}
            onTouchStart={(e) => { e.preventDefault(); setAnswer((a) => a + 1) }}
            disabled={revealed}
          >
            +
          </button>
        </div>

        {!revealed && (
          <button
            className="btn-pixel py-3 mb-3 w-full"
            onClick={() => reveal(answer, current)}
            onTouchStart={(e) => { e.preventDefault(); reveal(answer, current) }}
          >
            Submit Answer
          </button>
        )}

        {revealed && (
          <div
            className="card-pixel p-3 text-center mb-3"
            style={{
              background: Math.abs(answer - round.count) === 0
                ? '#DCFCE7'
                : Math.abs(answer - round.count) === 1
                  ? '#FEF9C3'
                  : '#FEE2E2',
            }}
          >
            <div className="pixel-font text-sm">
              {Math.abs(answer - round.count) === 0
                ? 'Perfect! +2 ♡'
                : Math.abs(answer - round.count) === 1
                  ? 'Close! +1 ✨'
                  : `Nope! Answer: ${round.count}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
