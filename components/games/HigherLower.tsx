'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface HigherLowerProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TOTAL_ROUNDS = 10
const REVEAL_DELAY = 1500

export default function HigherLower({ onComplete, playerEmail }: HigherLowerProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [currentNum, setCurrentNum] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [nextNum, setNextNum] = useState<number | null>(null)
  const [phase, setPhase] = useState<'guessing' | 'reveal' | 'done'>('guessing')
  const [lastResult, setLastResult] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const roundRef = useRef(0)

  const endGame = useCallback((finalScore: number) => {
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  function handleGuess(guess: 'higher' | 'lower') {
    if (phase !== 'guessing' || gameOver) return

    const next = Math.floor(Math.random() * 100) + 1
    setNextNum(next)
    setPhase('reveal')

    const correct =
      (guess === 'higher' && next > currentNum) ||
      (guess === 'lower' && next < currentNum)

    const newScore = scoreRef.current + (correct ? 1 : 0)
    scoreRef.current = newScore
    setScore(newScore)
    setLastResult(correct)

    setTimeout(() => {
      const nextRound = roundRef.current + 1
      roundRef.current = nextRound

      if (nextRound >= TOTAL_ROUNDS) {
        setPhase('done')
        endGame(newScore)
      } else {
        setCurrentNum(next)
        setNextNum(null)
        setLastResult(null)
        setRound(nextRound)
        setPhase('guessing')
      }
    }, REVEAL_DELAY)
  }

  const progress = (round / TOTAL_ROUNDS) * 100

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">📈</div>
        <div className="pixel-font text-base text-[#FF1493]">Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/{TOTAL_ROUNDS}</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Higher or Lower 📈</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{round + 1}/{TOTAL_ROUNDS}</div>
          <div className="text-xs font-semibold text-gray-500">round</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {/* Current number display */}
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-400 mb-2 pixel-font">Current Number</div>
          <div
            className="card-pixel p-6 text-center"
            style={{ background: '#FFF0F5', minWidth: 120 }}
          >
            <div className="pixel-font text-6xl text-[#FF1493]">{currentNum}</div>
          </div>
        </div>

        {/* Reveal next number */}
        {nextNum !== null && (
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-400 mb-2 pixel-font">Next Number</div>
            <div
              className="card-pixel p-6 text-center"
              style={{
                background: lastResult ? '#DCFCE7' : '#FEE2E2',
                minWidth: 120,
              }}
            >
              <div className="pixel-font text-6xl" style={{ color: lastResult ? '#16A34A' : '#DC2626' }}>
                {nextNum}
              </div>
              <div className="pixel-font text-xs mt-2" style={{ color: lastResult ? '#16A34A' : '#DC2626' }}>
                {lastResult ? 'Correct! ♡' : 'Wrong~ (>_<)'}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {phase === 'guessing' && (
          <div className="flex gap-4 w-full max-w-xs">
            <button
              className="btn-pixel flex-1 py-5 text-xl"
              style={{ background: '#22C55E', color: 'white' }}
              onClick={() => handleGuess('higher')}
              onTouchStart={(e) => { e.preventDefault(); handleGuess('higher') }}
            >
              HIGHER ▲
            </button>
            <button
              className="btn-pixel flex-1 py-5 text-xl"
              style={{ background: '#EF4444', color: 'white' }}
              onClick={() => handleGuess('lower')}
              onTouchStart={(e) => { e.preventDefault(); handleGuess('lower') }}
            >
              LOWER ▼
            </button>
          </div>
        )}

        {phase === 'reveal' && (
          <div className="pixel-font text-sm text-gray-400">Next round coming~ ✨</div>
        )}
      </div>
    </div>
  )
}
