'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ColorFlashProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TOTAL_ROUNDS = 10
const OPTION_TIMEOUT = 4000

interface ColorDef {
  name: string
  hex: string
}

const COLORS: ColorDef[] = [
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Teal', hex: '#14B8A6' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeOptions(correct: ColorDef): ColorDef[] {
  const others = shuffle(COLORS.filter((c) => c.name !== correct.name)).slice(0, 3)
  return shuffle([correct, ...others])
}

export default function ColorFlash({ onComplete, playerEmail }: ColorFlashProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<'flash' | 'question' | 'feedback' | 'done'>('flash')
  const [flashColor] = useState<ColorDef[]>(
    () => Array.from({ length: TOTAL_ROUNDS }, () => COLORS[Math.floor(Math.random() * COLORS.length)])
  )
  const [options, setOptions] = useState<ColorDef[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const roundRef = useRef(0)
  const gameOverRef = useRef(false)

  const endGame = useCallback((finalScore: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  const startRound = useCallback((r: number) => {
    if (gameOverRef.current) return
    setOptions(makeOptions(flashColor[r]))
    setSelected(null)
    setPhase('flash')

    // Show color for 500ms then show question
    setTimeout(() => {
      if (!gameOverRef.current) setPhase('question')
    }, 500)
  }, [flashColor])

  useEffect(() => {
    startRound(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto timeout for question phase
  useEffect(() => {
    if (phase !== 'question') return
    const t = setTimeout(() => {
      if (phase === 'question') handleAnswer(null)
    }, OPTION_TIMEOUT)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round])

  function handleAnswer(choice: ColorDef | null) {
    if (phase !== 'question' || gameOverRef.current) return
    const correct = choice?.name === flashColor[round].name
    const pts = correct ? 1 : 0
    const newScore = scoreRef.current + pts
    scoreRef.current = newScore
    setScore(newScore)
    setSelected(choice?.name ?? '__timeout__')
    setPhase('feedback')

    setTimeout(() => {
      const nextRound = roundRef.current + 1
      roundRef.current = nextRound

      if (nextRound >= TOTAL_ROUNDS) {
        endGame(newScore)
      } else {
        setRound(nextRound)
        startRound(nextRound)
      }
    }, 700)
  }

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🌈</div>
        <div className="pixel-font text-base text-[#FF1493]">Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/{TOTAL_ROUNDS}</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  const current = flashColor[round]

  return (
    <div className="flex flex-col h-full">
      {/* Flash screen */}
      {phase === 'flash' && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: current.hex }}
        >
          <div className="pixel-font text-white text-2xl" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
            Remember this! ✨
          </div>
        </div>
      )}

      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Color Flash 🌈</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{round + 1}/{TOTAL_ROUNDS}</div>
          <div className="text-xs font-semibold text-gray-500">round</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        <div className="card-pixel p-4 text-center" style={{ background: '#FFF0F5' }}>
          <p className="pixel-font text-sm text-[#FF1493]">What color just flashed?</p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {options.map((opt) => {
            let border = '3px solid black'
            let opacity = 1
            if (selected !== null) {
              if (opt.name === current.name) border = '4px solid #22C55E'
              else if (opt.name === selected) border = '4px solid #EF4444'
              else opacity = 0.5
            }
            return (
              <button
                key={opt.name}
                className="btn-pixel py-5 text-sm font-bold"
                style={{
                  background: opt.hex,
                  color: 'white',
                  border,
                  opacity,
                  textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
                }}
                onClick={() => handleAnswer(opt)}
                onTouchStart={(e) => { e.preventDefault(); handleAnswer(opt) }}
                disabled={selected !== null}
              >
                {opt.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
