'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeedSortProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TOTAL_CARDS = 20
const GAME_DURATION = 90
const AUTO_ADVANCE = 1000

function makeNumbers(): number[] {
  return Array.from({ length: TOTAL_CARDS }, () => Math.floor(Math.random() * 99) + 1)
}

export default function SpeedSort({ onComplete, playerEmail }: SpeedSortProps) {
  const [numbers] = useState<number[]>(makeNumbers)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [lastResult, setLastResult] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const advancingRef = useRef(false)

  const endGame = useCallback((finalScore: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          endGame(scoreRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [endGame])

  function advance(nextIdx: number, newScore: number) {
    if (nextIdx >= TOTAL_CARDS) {
      endGame(newScore)
      return
    }
    setTimeout(() => {
      setCurrent(nextIdx)
      setLastResult(null)
      advancingRef.current = false
    }, AUTO_ADVANCE)
  }

  function handleAnswer(answer: 'odd' | 'even') {
    if (gameOver || advancingRef.current) return
    advancingRef.current = true

    const num = numbers[current]
    const correct = (answer === 'odd' && num % 2 !== 0) || (answer === 'even' && num % 2 === 0)
    const newScore = scoreRef.current + (correct ? 1 : 0)
    scoreRef.current = newScore
    setScore(newScore)
    setLastResult(correct)

    advance(current + 1, newScore)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🃏</div>
        <div className="pixel-font text-base text-[#FF1493]">Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/{TOTAL_CARDS}</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  const currentNum = numbers[current]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Speed Sort 🃏</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score}/{current} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">card {current + 1}/{TOTAL_CARDS}</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {/* Number card */}
        <div
          className="card-pixel p-8 text-center"
          style={{
            background: lastResult === null ? '#FFF0F5'
              : lastResult ? '#DCFCE7' : '#FEE2E2',
            minWidth: 140,
            transition: 'background 0.2s',
          }}
        >
          <div
            className="pixel-font text-7xl"
            style={{ color: '#FF1493' }}
          >
            {currentNum}
          </div>
          {lastResult !== null && (
            <div
              className="pixel-font text-sm mt-2"
              style={{ color: lastResult ? '#16A34A' : '#DC2626' }}
            >
              {lastResult ? 'Correct! ♡' : `Wrong~ (${currentNum % 2 === 0 ? 'Even' : 'Odd'})`}
            </div>
          )}
        </div>

        {/* ODD / EVEN buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          <button
            className="btn-pixel flex-1 py-6 text-xl"
            style={{ background: '#A855F7', color: 'white' }}
            onClick={() => handleAnswer('odd')}
            onTouchStart={(e) => { e.preventDefault(); handleAnswer('odd') }}
            disabled={advancingRef.current}
          >
            ODD
          </button>
          <button
            className="btn-pixel flex-1 py-6 text-xl"
            style={{ background: '#3B82F6', color: 'white' }}
            onClick={() => handleAnswer('even')}
            onTouchStart={(e) => { e.preventDefault(); handleAnswer('even') }}
            disabled={advancingRef.current}
          >
            EVEN
          </button>
        </div>

        <p className="text-xs font-semibold text-gray-400 text-center">
          Is it ODD or EVEN? Sort as fast as you can!
        </p>
      </div>
    </div>
  )
}
