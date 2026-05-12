'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ReflexDuelProps {
  onComplete: (score: number) => void
  playerEmail: string
}

type Phase = 'waiting' | 'ready' | 'flash' | 'clicked' | 'toosoon' | 'done'

const TOTAL_ROUNDS = 5

export default function ReflexDuel({ onComplete, playerEmail }: ReflexDuelProps) {
  const [phase, setPhase] = useState<Phase>('waiting')
  const [round, setRound] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [flashStart, setFlashStart] = useState(0)
  const [lastReaction, setLastReaction] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleComplete = useCallback(
    (allTimes: number[]) => {
      if (gameOver) return
      setGameOver(true)
      // Score = inverse average time (faster = higher score), scaled
      const avg = allTimes.reduce((a, b) => a + b, 0) / allTimes.length
      // Convert to a 0-1000 score where 200ms = 1000, 1000ms = 200
      const score = Math.max(0, Math.round(1200 - avg))
      onComplete(score)
    },
    [gameOver, onComplete]
  )

  function startRound() {
    setPhase('ready')
    setLastReaction(null)
    const delay = 1500 + Math.random() * 3000
    timerRef.current = setTimeout(() => {
      setPhase('flash')
      setFlashStart(Date.now())
      // Auto-fail after 3 seconds
      timerRef.current = setTimeout(() => {
        setPhase('waiting')
        setTimes((prev) => {
          const newTimes = [...prev, 3000]
          if (newTimes.length >= TOTAL_ROUNDS) {
            handleComplete(newTimes)
          }
          return newTimes
        })
        setRound((r) => r + 1)
      }, 3000)
    }, delay)
  }

  function handleClick() {
    if (phase === 'ready') {
      // Too soon
      if (timerRef.current) clearTimeout(timerRef.current)
      setPhase('toosoon')
      setTimeout(() => {
        const newTimes = [...times, 3000]
        setTimes(newTimes)
        setRound((r) => r + 1)
        if (newTimes.length >= TOTAL_ROUNDS) {
          handleComplete(newTimes)
        } else {
          setPhase('waiting')
        }
      }, 1500)
      return
    }

    if (phase !== 'flash') return
    if (timerRef.current) clearTimeout(timerRef.current)
    const rt = Date.now() - flashStart
    setLastReaction(rt)
    setPhase('clicked')
    const newTimes = [...times, rt]
    setTimes(newTimes)
    setRound((r) => r + 1)

    setTimeout(() => {
      if (newTimes.length >= TOTAL_ROUNDS) {
        handleComplete(newTimes)
      } else {
        setPhase('waiting')
      }
    }, 1200)
  }

  const avg = times.length > 0
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : null

  const bgColor =
    phase === 'flash' ? '#FF1493' :
    phase === 'toosoon' ? '#FCD34D' :
    phase === 'clicked' ? '#86EFAC' :
    '#FFF0F5'

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Reflex Duel ⚡</div>
          <div className="font-bold text-sm text-[#FF69B4]">
            Round {Math.min(round + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
          </div>
        </div>
        <div className="text-right">
          {avg !== null && (
            <div>
              <div className="pixel-font text-xs text-gray-500">Avg</div>
              <div className="font-bold text-lg text-[#FF69B4]">{avg}ms</div>
            </div>
          )}
        </div>
      </div>

      {/* Reaction times */}
      <div className="px-4 flex gap-2 mb-3">
        {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-8 border-2 border-black flex items-center justify-center text-xs font-bold"
            style={{
              background: times[i] !== undefined
                ? times[i] < 500 ? '#86EFAC' : times[i] < 1000 ? '#FCD34D' : '#FCA5A5'
                : '#FFE4F0',
            }}
          >
            {times[i] !== undefined ? `${times[i]}` : '-'}
          </div>
        ))}
      </div>

      {/* Game area */}
      <button
        className="flex-1 flex flex-col items-center justify-center transition-colors duration-100 border-t-2 border-[#FF69B4] cursor-pointer"
        style={{ background: bgColor, minHeight: 250 }}
        onClick={handleClick}
        onTouchStart={(e) => { e.preventDefault(); handleClick() }}
      >
        {gameOver ? (
          <div className="text-center px-4">
            <div className="text-5xl mb-3">⚡</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Done!</div>
            <div className="font-bold text-2xl text-[#FF69B4]">{avg}ms avg</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting~ ♡</p>
          </div>
        ) : phase === 'waiting' ? (
          <div className="text-center px-4">
            <div className="text-5xl mb-4">⏳</div>
            <p className="pixel-font text-xs text-[#FF1493] mb-4">
              Round {round + 1}/{TOTAL_ROUNDS}
            </p>
            <button
              onClick={startRound}
              className="btn-pixel"
            >
              Start Round
            </button>
          </div>
        ) : phase === 'ready' ? (
          <div className="text-center px-4">
            <div className="text-5xl mb-4 bounce-kawaii">👀</div>
            <p className="pixel-font text-xs text-[#FF1493]">Get ready<span className="loading-dots"></span></p>
            <p className="font-semibold text-gray-600 mt-2">Wait for the pink flash!</p>
          </div>
        ) : phase === 'flash' ? (
          <div className="text-center px-4">
            <div className="text-5xl mb-4">💥</div>
            <p className="pixel-font text-2xl text-white" style={{ textShadow: '3px 3px 0 #FF1493' }}>
              CLICK NOW!
            </p>
          </div>
        ) : phase === 'toosoon' ? (
          <div className="text-center px-4">
            <div className="text-5xl mb-4">😅</div>
            <p className="pixel-font text-base text-[#FF1493]">Too soon!</p>
            <p className="font-semibold text-gray-600 mt-2">Wait for the flash~ (◕_◕)</p>
          </div>
        ) : (
          <div className="text-center px-4">
            <div className="text-5xl mb-3">⚡</div>
            <p className="pixel-font text-base text-green-700">
              {lastReaction}ms!
            </p>
            <p className="font-semibold text-gray-600 mt-2">
              {lastReaction !== null && lastReaction < 300 ? 'Super fast! (◕‿◕)' :
               lastReaction !== null && lastReaction < 600 ? 'Nice! ✿' : 'Keep practicing~ ♡'}
            </p>
          </div>
        )}
      </button>
    </div>
  )
}
