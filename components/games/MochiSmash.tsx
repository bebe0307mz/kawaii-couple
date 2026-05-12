'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface MochiSmashProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 30
const TAPS_PER_MOCHI = 8
const MOCHI_EMOJIS = ['🍡', '🥮', '🍘']

export default function MochiSmash({ onComplete, playerEmail: _playerEmail }: MochiSmashProps) {
  const [smashes, setSmashes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [meter, setMeter] = useState(0)
  const [mochiIdx, setMochiIdx] = useState(0)
  const [shake, setShake] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const smashRef = useRef(0)
  const meterRef = useRef(0)
  const gameOverRef = useRef(false)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(smashRef.current)
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

  function handleSmash() {
    if (gameOverRef.current) return
    setShake(true)
    setTimeout(() => setShake(false), 80)
    meterRef.current += 1
    if (meterRef.current >= TAPS_PER_MOCHI) {
      smashRef.current += 1
      setSmashes(smashRef.current)
      meterRef.current = 0
      setMeter(0)
      setMochiIdx(Math.floor(Math.random() * MOCHI_EMOJIS.length))
    } else {
      setMeter(meterRef.current)
    }
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100
  const meterPct = (meter / TAPS_PER_MOCHI) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Mochi Smash 🪅</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{smashes} smashed</div>
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
            <div className="text-5xl mb-3">🪅</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{smashes} smashed</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 96,
                transform: shake ? 'scale(0.9) rotate(-3deg)' : 'scale(1)',
                transition: 'transform 0.08s',
              }}
            >
              {MOCHI_EMOJIS[mochiIdx]}
            </div>

            <div className="w-full max-w-xs">
              <div className="progress-pixel" style={{ height: 14 }}>
                <div className="progress-fill" style={{ width: `${meterPct}%` }} />
              </div>
              <p className="pixel-font text-[10px] text-[#FF1493] text-center mt-1">
                Smash Meter
              </p>
            </div>

            <button
              onClick={handleSmash}
              onTouchStart={(e) => { e.preventDefault(); handleSmash() }}
              className="btn-pixel text-xl"
              style={{ padding: '20px 48px' }}
            >
              SMASH!
            </button>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Rapid-tap SMASH! to break each mochi! 🪅 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
