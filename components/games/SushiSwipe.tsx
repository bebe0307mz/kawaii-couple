'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SushiSwipeProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45
const PLATE_COLORS = [
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Purple', hex: '#C084FC' },
  { name: 'Yellow', hex: '#FBBF24' },
]
const SUSHI_EMOJIS = ['🍣', '🍱', '🍙', '🍤']

function pickRound() {
  const idx = Math.floor(Math.random() * PLATE_COLORS.length)
  return {
    sushi: SUSHI_EMOJIS[Math.floor(Math.random() * SUSHI_EMOJIS.length)],
    plateIdx: idx,
  }
}

export default function SushiSwipe({ onComplete, playerEmail: _playerEmail }: SushiSwipeProps) {
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

  function handlePick(plateIdx: number) {
    if (gameOverRef.current || lockRef.current) return
    lockRef.current = true
    const correct = plateIdx === round.plateIdx
    if (correct) {
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
    }, 350)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100
  const targetPlate = PLATE_COLORS[round.plateIdx]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Sushi Swipe 🥢</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} matched</div>
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

      <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-5xl mb-3">🥢</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} matched</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div className={`card-pixel p-6 text-center transition-colors ${
              feedback === 'good' ? 'bg-green-50' : feedback === 'bad' ? 'bg-red-50' : 'bg-white'
            }`}>
              <div className="text-6xl mb-2">{round.sushi}</div>
              <div
                className="inline-block w-10 h-10 rounded-full border-2 border-black"
                style={{ background: targetPlate.hex }}
              />
              <div className="pixel-font text-xs text-[#FF1493] mt-2">{targetPlate.name} plate</div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {PLATE_COLORS.map((plate, i) => (
                <button
                  key={plate.name}
                  onClick={() => handlePick(i)}
                  onTouchStart={(e) => { e.preventDefault(); handlePick(i) }}
                  className="btn-pixel py-4"
                  style={{
                    background: plate.hex,
                    color: 'white',
                  }}
                >
                  <div className="text-2xl">🍽️</div>
                  <div className="text-[10px]">{plate.name}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Match each sushi to its plate! (◕‿◕)
        </p>
      </div>
    </div>
  )
}
