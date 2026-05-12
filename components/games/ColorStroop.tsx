'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ColorStroopProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TOTAL_ROUNDS = 10
const ROUND_TIME = 5

const COLOR_OPTIONS = [
  { name: 'RED', hex: '#EF4444' },
  { name: 'PINK', hex: '#FF69B4' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#22C55E' },
  { name: 'PURPLE', hex: '#A855F7' },
]

function pickRound() {
  const shuffled = [...COLOR_OPTIONS].sort(() => Math.random() - 0.5)
  // The word name
  const wordColor = shuffled[0]
  // The display color (must be different)
  let displayColor = shuffled[1]
  if (displayColor.name === wordColor.name) displayColor = shuffled[2]

  // Pick 4 button options (include display color)
  const others = COLOR_OPTIONS.filter((c) => c.name !== displayColor.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  const buttons = [displayColor, ...others].sort(() => Math.random() - 0.5)

  return { word: wordColor.name, displayColor, buttons }
}

export default function ColorStroop({ onComplete, playerEmail }: ColorStroopProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [roundData, setRoundData] = useState(() => pickRound())
  const [roundTimer, setRoundTimer] = useState(ROUND_TIME)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const roundRef = useRef(0)
  const answeredRef = useRef(false)

  const nextRound = useCallback((addPoint: boolean) => {
    if (addPoint) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
    const nextRoundNum = roundRef.current + 1
    roundRef.current = nextRoundNum
    if (nextRoundNum >= TOTAL_ROUNDS) {
      setGameOver(true)
      onComplete(scoreRef.current)
    } else {
      setRound(nextRoundNum)
      setRoundData(pickRound())
      setRoundTimer(ROUND_TIME)
      setFeedback(null)
      answeredRef.current = false
    }
  }, [onComplete])

  useEffect(() => {
    if (gameOver) return
    answeredRef.current = false
    const interval = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          if (!answeredRef.current) {
            answeredRef.current = true
            setFeedback('wrong')
            setTimeout(() => nextRound(false), 500)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, gameOver])

  function handleAnswer(colorName: string) {
    if (answeredRef.current || gameOver) return
    answeredRef.current = true

    const correct = colorName === roundData.displayColor.name
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => nextRound(correct), 500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Color Stroop 🎨</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score}/{round} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{roundTimer}s</div>
          <div className="text-xs font-semibold text-gray-500">Round {round + 1}/{TOTAL_ROUNDS}</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🎨</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Done!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score}/10 correct</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="font-bold text-sm text-gray-500 mb-3">
                Tap the COLOR the text is written in
              </p>
              <div
                className={`card-pixel p-6 text-center transition-all ${
                  feedback === 'correct' ? 'bg-green-50' :
                  feedback === 'wrong' ? 'bg-red-50' : 'bg-white'
                }`}
              >
                <div
                  className="pixel-font text-3xl"
                  style={{ color: roundData.displayColor.hex }}
                >
                  {roundData.word}
                </div>
                {feedback === 'correct' && (
                  <div className="text-green-600 font-bold text-sm mt-2">Correct! ✓</div>
                )}
                {feedback === 'wrong' && (
                  <div className="text-red-500 font-bold text-sm mt-2">Wrong!</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {roundData.buttons.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleAnswer(color.name)}
                  onTouchStart={(e) => { e.preventDefault(); handleAnswer(color.name) }}
                  className="btn-pixel py-3"
                  style={{
                    background: color.hex,
                    color: 'white',
                    boxShadow: `4px 4px 0px ${color.hex}88`,
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
