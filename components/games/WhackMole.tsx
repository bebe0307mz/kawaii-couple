'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface WhackMoleProps {
  onComplete: (score: number) => void
  playerEmail: string
}

type HoleContent = 'empty' | 'mole' | 'heart' | 'flower'

interface HoleState {
  content: HoleContent
  id: number
}

const GAME_DURATION = 45
const GRID_SIZE = 9

export default function WhackMole({ onComplete, playerEmail }: WhackMoleProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [holes, setHoles] = useState<HoleState[]>(
    Array.from({ length: GRID_SIZE }, (_, i) => ({ content: 'empty', id: i }))
  )
  const [gameOver, setGameOver] = useState(false)
  const [whacked, setWhacked] = useState<number | null>(null)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const popTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    // Clear all timers
    popTimersRef.current.forEach((t) => clearTimeout(t))
    popTimersRef.current.clear()
    onComplete(scoreRef.current)
  }, [onComplete])

  // Timer
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

  // Character spawner - frequency increases over time
  useEffect(() => {
    let elapsed = 0

    const schedule = () => {
      if (gameOverRef.current) return
      const baseInterval = Math.max(600, 1500 - elapsed * 15)
      elapsed += baseInterval

      const timeout = setTimeout(() => {
        if (gameOverRef.current) return

        setHoles((prev) => {
          const emptyIndices = prev
            .map((h, i) => (h.content === 'empty' ? i : -1))
            .filter((i) => i !== -1)
          if (emptyIndices.length === 0) {
            schedule()
            return prev
          }

          const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
          const rand = Math.random()
          const content: HoleContent = rand < 0.08 ? 'heart' : rand < 0.18 ? 'flower' : 'mole'

          const next = [...prev]
          next[idx] = { ...next[idx], content }

          // Auto-hide after 1.2s
          const hideTimer = setTimeout(() => {
            if (gameOverRef.current) return
            setHoles((h) => {
              const updated = [...h]
              if (updated[idx].content === content) {
                updated[idx] = { ...updated[idx], content: 'empty' }
              }
              return updated
            })
          }, 1200)

          popTimersRef.current.set(idx, hideTimer)

          return next
        })

        schedule()
      }, baseInterval)

      popTimersRef.current.set(-1, timeout)
    }

    schedule()

    return () => {
      popTimersRef.current.forEach((t) => clearTimeout(t))
      popTimersRef.current.clear()
    }
  }, [])

  function whackHole(idx: number) {
    if (gameOverRef.current) return
    const hole = holes[idx]
    if (hole.content === 'empty') return

    // Clear auto-hide timer for this hole
    const existing = popTimersRef.current.get(idx)
    if (existing) clearTimeout(existing)

    const content = hole.content
    let delta = 0
    if (content === 'mole') delta = 1
    else if (content === 'heart') delta = 3
    else if (content === 'flower') delta = -1

    const newScore = Math.max(0, scoreRef.current + delta)
    scoreRef.current = newScore
    setScore(newScore)

    setWhacked(idx)
    setTimeout(() => setWhacked((w) => (w === idx ? null : w)), 300)

    setHoles((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], content: 'empty' }
      return next
    })
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  function getEmoji(content: HoleContent) {
    if (content === 'mole') return '🐹'
    if (content === 'heart') return '💝'
    if (content === 'flower') return '🌸'
    return ''
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Whack a Mole 🔨</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} pts</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-3">
        {/* 3x3 grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {holes.map((hole, idx) => (
            <button
              key={hole.id}
              className="relative flex items-center justify-center rounded-2xl border-4 border-black"
              style={{
                aspectRatio: '1',
                background: hole.content !== 'empty'
                  ? '#FFE4F0'
                  : '#D4A96A',
                boxShadow: whacked === idx
                  ? '0 0 12px #FF69B4 inset'
                  : 'inset 0 -6px 0 rgba(0,0,0,0.25)',
                transform: whacked === idx ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.1s, background 0.1s',
                cursor: hole.content !== 'empty' ? 'pointer' : 'default',
              }}
              onClick={() => whackHole(idx)}
              onTouchStart={(e) => { e.preventDefault(); whackHole(idx) }}
            >
              {/* Hole */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '15%',
                  right: '15%',
                  height: '40%',
                  borderRadius: '50% 50% 0 0',
                  background: '#7C5230',
                }}
              />
              {/* Character */}
              {hole.content !== 'empty' && (
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    fontSize: 36,
                    animation: 'popUp 0.15s ease-out',
                  }}
                >
                  {getEmoji(hole.content)}
                </div>
              )}

              <style>{`
                @keyframes popUp {
                  from { transform: translateY(16px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
              `}</style>
            </button>
          ))}
        </div>

        {gameOver && (
          <div className="card-pixel p-4 text-center">
            <div className="text-4xl mb-2">🔨</div>
            <div className="pixel-font text-sm text-[#FF1493]">Time Up!</div>
            <div className="font-bold text-2xl text-[#FF69B4]">{score} pts</div>
            <p className="text-xs font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          🐹 +1 | 💝 +3 | 🌸 trap! -1
        </p>
      </div>
    </div>
  )
}
