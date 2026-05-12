'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ColorMatchProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 45

function hexToRgb(hex: string) {
  const v = parseInt(hex.slice(1), 16)
  return { r: (v >> 16) & 0xff, g: (v >> 8) & 0xff, b: v & 0xff }
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function jitter(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (Math.random() - 0.5) * 2 * amount,
    g + (Math.random() - 0.5) * 2 * amount,
    b + (Math.random() - 0.5) * 2 * amount,
  )
}

function pickRound() {
  const base = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
  const targetIdx = Math.floor(Math.random() * 4)
  const swatches: string[] = []
  for (let i = 0; i < 4; i++) {
    if (i === targetIdx) swatches.push(base)
    else swatches.push(jitter(base, 30 + Math.random() * 20))
  }
  return { target: base, swatches, targetIdx }
}

export default function ColorMatch({ onComplete, playerEmail: _playerEmail }: ColorMatchProps) {
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
    if (idx === round.targetIdx) {
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

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Color Match 🎨</div>
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
            <div className="text-5xl mb-3">🎨</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} correct</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="pixel-font text-xs text-[#FF1493] mb-3">Match this color!</p>
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: round.target,
                  border: '4px solid #1a1a1a',
                  boxShadow: '4px 4px 0px #1a1a1a',
                  margin: '0 auto',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {round.swatches.map((hex, i) => (
                <button
                  key={i}
                  onClick={() => handlePick(i)}
                  onTouchStart={(e) => { e.preventDefault(); handlePick(i) }}
                  style={{
                    aspectRatio: '1 / 1',
                    background: hex,
                    border: feedback === 'good' && i === round.targetIdx ? '4px solid #22C55E'
                      : feedback === 'bad' && i === round.targetIdx ? '4px solid #22C55E'
                      : '3px solid #1a1a1a',
                    boxShadow: '3px 3px 0px #1a1a1a',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Pick the swatch that matches the target! (◕‿◕)
        </p>
      </div>
    </div>
  )
}
