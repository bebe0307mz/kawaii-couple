'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface WordChainProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const ALL_LETTERS = ['S', 'B', 'C', 'M', 'F', 'L', 'T', 'P']
const TOTAL_ROUNDS = 5
const ROUND_TIME = 15

function pickLetters(): string[] {
  const shuffled = [...ALL_LETTERS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, TOTAL_ROUNDS)
}

export default function WordChain({ onComplete, playerEmail }: WordChainProps) {
  const [letters] = useState<string[]>(pickLetters)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [phase, setPhase] = useState<'playing' | 'feedback'>('playing')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const endGame = useCallback((finalScore: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  const submitRound = useCallback((word: string, roundIdx: number) => {
    if (phase !== 'playing') return
    const letter = letters[roundIdx]
    const trimmed = word.trim().toUpperCase()
    let pts = 0
    let msg = ''

    if (trimmed.length >= 3 && /^[A-Z]+$/.test(trimmed) && trimmed.startsWith(letter)) {
      pts = trimmed.length
      msg = `+${pts} pts! Great word~ ♡`
    } else if (trimmed.length === 0) {
      msg = 'Time up! No word entered.'
    } else if (!trimmed.startsWith(letter)) {
      msg = `Must start with ${letter}!`
    } else {
      msg = 'Word too short (min 3 letters)'
    }

    const newScore = scoreRef.current + pts
    scoreRef.current = newScore
    setScore(newScore)
    setFeedbackMsg(msg)
    setPhase('feedback')

    setTimeout(() => {
      const nextRound = roundIdx + 1
      if (nextRound >= TOTAL_ROUNDS) {
        endGame(newScore)
      } else {
        setRound(nextRound)
        setInput('')
        setTimeLeft(ROUND_TIME)
        setPhase('playing')
      }
    }, 1200)
  }, [phase, letters, endGame])

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || gameOver) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          submitRound(input, round)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [round, phase, gameOver, submitRound, input])

  function handleSubmit() {
    if (phase !== 'playing' || gameOver) return
    submitRound(input, round)
  }

  const progress = (round / TOTAL_ROUNDS) * 100

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🔤</div>
        <div className="pixel-font text-base text-[#FF1493]">Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score} pts</div>
        <p className="text-sm font-semibold text-gray-500 text-center">Longer words = more points!</p>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  const currentLetter = letters[round]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Word Chain 🔤</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} pts</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">{round + 1}/{TOTAL_ROUNDS}</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        <div className="card-pixel p-6 text-center" style={{ background: '#FFF0F5', minWidth: 120 }}>
          <div className="text-xs font-semibold text-gray-500 mb-2 pixel-font">Type a word starting with</div>
          <div className="pixel-font text-7xl text-[#FF1493]">{currentLetter}</div>
          <div className="text-xs text-gray-400 mt-2">Longer = more points! (min 3 letters)</div>
        </div>

        {phase === 'playing' && (
          <>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              className="card-pixel w-full max-w-xs px-4 py-3 text-center pixel-font text-xl text-[#FF1493] uppercase"
              style={{ background: '#FFF0F5', outline: 'none' }}
              placeholder={`${currentLetter}...`}
              autoFocus
              maxLength={20}
            />
            <button
              className="btn-pixel py-3 px-10 text-base"
              onClick={handleSubmit}
              onTouchStart={(e) => { e.preventDefault(); handleSubmit() }}
            >
              Submit!
            </button>
          </>
        )}

        {phase === 'feedback' && (
          <div
            className="card-pixel p-4 text-center w-full max-w-xs"
            style={{ background: feedbackMsg.includes('+') ? '#DCFCE7' : '#FEE2E2' }}
          >
            <div className="pixel-font text-sm">
              {feedbackMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
