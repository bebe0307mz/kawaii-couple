'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ClickZoneProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TOTAL_ROUNDS = 5
const ROUND_MAX = 3000
const ZONE_WIDTH = 0.2 // 20% of width

export default function ClickZone({ onComplete, playerEmail }: ClickZoneProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [barPos, setBarPos] = useState(0) // 0-1
  const [phase, setPhase] = useState<'playing' | 'feedback' | 'done'>('playing')
  const [feedback, setFeedback] = useState<'hit' | 'close' | 'miss' | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [zoneCenter] = useState(0.5)
  const scoreRef = useRef(0)
  const roundRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const gameOverRef = useRef(false)
  const phaseRef = useRef<'playing' | 'feedback' | 'done'>('playing')
  const barPosRef = useRef(0)
  const dirRef = useRef(1)
  const roundStartRef = useRef<number>(0)

  // Speed increases each round
  const speed = 0.3 + round * 0.1 // fraction of screen per second

  const endGame = useCallback((finalScore: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    cancelAnimationFrame(animFrameRef.current)
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  const startNextRound = useCallback(() => {
    if (gameOverRef.current) return
    roundStartRef.current = performance.now()
    phaseRef.current = 'playing'
    setPhase('playing')
  }, [])

  const handleResult = useCallback((hit: boolean, pos: number) => {
    if (phaseRef.current !== 'playing') return
    phaseRef.current = 'feedback'
    cancelAnimationFrame(animFrameRef.current)

    const dist = Math.abs(pos - zoneCenter)
    let pts = 0
    let fb: 'hit' | 'close' | 'miss' = 'miss'

    if (hit) {
      pts = 10
      fb = 'hit'
    } else if (dist < ZONE_WIDTH) {
      pts = 5
      fb = 'close'
    }

    const newScore = scoreRef.current + pts
    scoreRef.current = newScore
    setScore(newScore)
    setFeedback(fb)
    setPhase('feedback')

    setTimeout(() => {
      const nextRound = roundRef.current + 1
      roundRef.current = nextRound

      if (nextRound >= TOTAL_ROUNDS) {
        endGame(newScore)
        return
      }

      setRound(nextRound)
      setFeedback(null)
      startNextRound()
    }, 800)
  }, [zoneCenter, endGame, startNextRound])

  // Auto-miss after ROUND_MAX ms
  useEffect(() => {
    if (phase !== 'playing' || gameOver) return
    roundStartRef.current = performance.now()
    const timeout = setTimeout(() => {
      if (phaseRef.current === 'playing') {
        handleResult(false, barPosRef.current)
      }
    }, ROUND_MAX)
    return () => clearTimeout(timeout)
  }, [round, phase, gameOver, handleResult])

  // Animation loop
  useEffect(() => {
    if (phase !== 'playing' || gameOver) return
    let last = 0

    function loop(ts: number) {
      const dt = last ? (ts - last) / 1000 : 0.016
      last = ts

      barPosRef.current += dirRef.current * speed * dt
      if (barPosRef.current >= 1) {
        barPosRef.current = 1
        dirRef.current = -1
      } else if (barPosRef.current <= 0) {
        barPosRef.current = 0
        dirRef.current = 1
      }

      setBarPos(barPosRef.current)
      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [round, phase, gameOver, speed])

  function handleTap() {
    if (phaseRef.current !== 'playing' || gameOver) return
    const pos = barPosRef.current
    const dist = Math.abs(pos - zoneCenter)
    const hit = dist < ZONE_WIDTH / 2
    handleResult(hit, pos)
  }

  const zoneLeft = (zoneCenter - ZONE_WIDTH / 2) * 100
  const zoneRight = ZONE_WIDTH * 100

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🎯</div>
        <div className="pixel-font text-base text-[#FF1493]">Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/50</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Click Zone 🎯</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} pts</div>
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
        <p className="pixel-font text-xs text-gray-500 text-center">
          Tap when the bar is in the green zone!
        </p>

        {/* Bar track */}
        <div
          className="relative w-full max-w-sm rounded-lg overflow-hidden border-3 border-[#FF69B4]"
          style={{ height: 60, background: '#FFF0F5', borderWidth: 3, borderColor: '#FF69B4', borderStyle: 'solid' }}
        >
          {/* Green zone */}
          <div
            style={{
              position: 'absolute',
              left: `${zoneLeft}%`,
              width: `${zoneRight}%`,
              top: 0,
              bottom: 0,
              background: 'rgba(34,197,94,0.35)',
              borderLeft: '2px solid #16A34A',
              borderRight: '2px solid #16A34A',
            }}
          />

          {/* Moving bar */}
          {phase === 'playing' && (
            <div
              style={{
                position: 'absolute',
                left: `${barPos * 100}%`,
                top: 4,
                bottom: 4,
                width: 8,
                background: '#FF1493',
                borderRadius: 4,
                transform: 'translateX(-50%)',
                boxShadow: '0 0 8px #FF69B4',
              }}
            />
          )}

          {/* Feedback overlay */}
          {phase === 'feedback' && feedback && (
            <div
              className="absolute inset-0 flex items-center justify-center pixel-font text-base font-bold"
              style={{
                background: feedback === 'hit' ? 'rgba(34,197,94,0.8)' : feedback === 'close' ? 'rgba(251,191,36,0.8)' : 'rgba(239,68,68,0.8)',
                color: 'white',
              }}
            >
              {feedback === 'hit' ? 'HIT! +10 ♡' : feedback === 'close' ? 'Close! +5' : 'MISS!'}
            </div>
          )}
        </div>

        <button
          className="btn-pixel text-xl py-6 px-16"
          style={{ background: '#FF69B4', color: 'white', minWidth: 200 }}
          onClick={handleTap}
          onTouchStart={(e) => { e.preventDefault(); handleTap() }}
          disabled={phase !== 'playing'}
        >
          TAP! 🎯
        </button>

        <p className="text-xs font-semibold text-gray-400">
          Speed increases each round! Round {round + 1} speed: x{(1 + round * 0.33).toFixed(1)}
        </p>
      </div>
    </div>
  )
}
