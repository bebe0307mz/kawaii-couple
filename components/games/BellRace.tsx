'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface BellRaceProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TOTAL_ROUNDS = 6
const TOTAL_TIME = 60

type Phase = 'wait' | 'go' | 'result' | 'false'

export default function BellRace({ onComplete, playerEmail: _playerEmail }: BellRaceProps) {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<Phase>('wait')
  const [reactionMs, setReactionMs] = useState<number | null>(null)
  const [bestMs, setBestMs] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [gameOver, setGameOver] = useState(false)
  const startTimeRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gameOverRef = useRef(false)
  const roundRef = useRef(1)
  const bestRef = useRef<number[]>([])

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // Score: lower avg ms = higher score. Cap at 1000ms reasonable max.
    const reactions = bestRef.current
    if (reactions.length === 0) {
      onComplete(0)
      return
    }
    const avg = reactions.reduce((a, b) => a + b, 0) / reactions.length
    // Score = max(0, 1000 - avg) / 10 (so 200ms = 80pts, 800ms = 20pts)
    const score = Math.max(0, Math.round((1000 - avg) / 10))
    onComplete(score)
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

  const startWait = useCallback(() => {
    if (gameOverRef.current) return
    setPhase('wait')
    const delay = 1000 + Math.random() * 2000
    timeoutRef.current = setTimeout(() => {
      if (gameOverRef.current) return
      startTimeRef.current = Date.now()
      setPhase('go')
    }, delay)
  }, [])

  useEffect(() => {
    startWait()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [startWait])

  function handleTap() {
    if (gameOverRef.current) return
    if (phase === 'wait') {
      // False start
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setPhase('false')
      setTimeout(() => {
        nextRound(null, true)
      }, 800)
      return
    }
    if (phase === 'go') {
      const ms = Date.now() - startTimeRef.current
      setReactionMs(ms)
      bestRef.current = [...bestRef.current, ms]
      setBestMs(bestRef.current)
      setPhase('result')
      setTimeout(() => nextRound(ms, false), 900)
    }
  }

  function nextRound(_ms: number | null, falseStart: boolean) {
    if (gameOverRef.current) return
    if (falseStart) {
      // Penalty: add 1000ms placeholder
      bestRef.current = [...bestRef.current, 1000]
      setBestMs(bestRef.current)
    }
    const next = roundRef.current + 1
    roundRef.current = next
    if (next > TOTAL_ROUNDS) {
      endGame()
      return
    }
    setRound(next)
    setReactionMs(null)
    startWait()
  }

  const avgMs = bestMs.length > 0 ? Math.round(bestMs.reduce((a, b) => a + b, 0) / bestMs.length) : null

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Bell Race 🔔</div>
          <div className="font-bold text-lg text-[#FF69B4]">Round {Math.min(round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">left</div>
        </div>
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center px-4 select-none"
        style={{
          background: phase === 'wait' ? '#FFE4F0'
            : phase === 'go' ? '#FFD1E8'
            : phase === 'false' ? '#FCA5A5'
            : '#FBCFE8',
          borderTop: '2px solid #FF69B4',
        }}
        onClick={handleTap}
        onTouchStart={(e) => { e.preventDefault(); handleTap() }}
      >
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🔔</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Done!</div>
            <div className="font-bold text-2xl text-[#FF69B4]">
              {avgMs !== null ? `avg ${avgMs}ms` : 'No reactions'}
            </div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <div className="text-center">
            {phase === 'wait' && (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <p className="pixel-font text-sm text-[#FF1493]">Wait for it...</p>
              </>
            )}
            {phase === 'go' && (
              <>
                <div className="text-7xl mb-4 bounce-kawaii">🔔</div>
                <p className="pixel-font text-sm text-[#FF1493]">TAP!</p>
              </>
            )}
            {phase === 'result' && reactionMs !== null && (
              <>
                <div className="text-6xl mb-4">✨</div>
                <p className="pixel-font text-lg text-[#FF1493]">{reactionMs}ms</p>
              </>
            )}
            {phase === 'false' && (
              <>
                <div className="text-6xl mb-4">❌</div>
                <p className="pixel-font text-sm text-red-600">Too soon!</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Wait for the bell 🔔, then tap fast! (◕‿◕)
        </p>
      </div>
    </div>
  )
}
