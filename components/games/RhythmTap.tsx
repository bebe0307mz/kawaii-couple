'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface RhythmTapProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const BEAT_INTERVAL = 600 // ms - 100 BPM
const TOTAL_BEATS = 16
const PERFECT_MS = 80
const GOOD_MS = 160
const OK_MS = 300

type FeedbackLabel = 'Perfect!' | 'Good' | 'Ok' | 'Miss' | ''

export default function RhythmTap({ onComplete, playerEmail }: RhythmTapProps) {
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [beat, setBeat] = useState(0)
  const [score, setScore] = useState(0)
  const [pulsing, setPulsing] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackLabel>('')
  const [gameOver, setGameOver] = useState(false)

  const beatRef = useRef(0)
  const scoreRef = useRef(0)
  const beatTimeRef = useRef(0)
  const gameOverRef = useRef(false)
  const tappedRef = useRef(false)

  const endGame = useCallback((finalScore: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase('playing')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  // Beat loop
  useEffect(() => {
    if (phase !== 'playing') return

    const interval = setInterval(() => {
      if (gameOverRef.current) return

      const nextBeat = beatRef.current + 1
      beatRef.current = nextBeat
      setBeat(nextBeat)
      beatTimeRef.current = performance.now()
      tappedRef.current = false

      // Visual pulse
      setPulsing(true)
      setTimeout(() => setPulsing(false), 150)

      if (nextBeat >= TOTAL_BEATS) {
        // Final beat - end after it
        setTimeout(() => {
          endGame(scoreRef.current)
        }, BEAT_INTERVAL)
      }
    }, BEAT_INTERVAL)

    return () => clearInterval(interval)
  }, [phase, endGame])

  function handleTap() {
    if (phase !== 'playing' || gameOverRef.current || tappedRef.current) return
    tappedRef.current = true

    const diff = Math.abs(performance.now() - beatTimeRef.current)
    let pts = 0
    let fb: FeedbackLabel = 'Miss'

    if (diff <= PERFECT_MS) {
      pts = 3
      fb = 'Perfect!'
    } else if (diff <= GOOD_MS) {
      pts = 2
      fb = 'Good'
    } else if (diff <= OK_MS) {
      pts = 1
      fb = 'Ok'
    }

    const newScore = scoreRef.current + pts
    scoreRef.current = newScore
    setScore(newScore)
    setFeedback(fb)
    setTimeout(() => setFeedback(''), 500)
  }

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🎵</div>
        <div className="pixel-font text-base text-[#FF1493]">Rhythm Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/48</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  if (phase === 'countdown') {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-6">
        <div className="text-5xl">🎵</div>
        <div className="pixel-font text-xl text-[#FF1493]">Get Ready!</div>
        <div className="pixel-font text-7xl text-[#FF69B4]">{countdown || 'GO!'}</div>
        <div className="text-xs font-semibold text-gray-500">Tap on each beat - 100 BPM!</div>
      </div>
    )
  }

  const feedbackColor = feedback === 'Perfect!' ? '#22C55E'
    : feedback === 'Good' ? '#3B82F6'
      : feedback === 'Ok' ? '#FBBF24'
        : '#EF4444'

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Rhythm Tap 🎵</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score}/48</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{beat}/{TOTAL_BEATS}</div>
          <div className="text-xs font-semibold text-gray-500">beats</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${(beat / TOTAL_BEATS) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {/* Metronome visual */}
        <div
          style={{
            width: pulsing ? 130 : 90,
            height: pulsing ? 130 : 90,
            borderRadius: '50%',
            background: pulsing ? '#FF1493' : '#FFB6C1',
            border: '4px solid black',
            transition: 'all 0.1s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: pulsing ? '0 0 24px #FF69B4' : '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: pulsing ? 48 : 36 }}>🎵</span>
        </div>

        {/* Feedback */}
        <div
          className="pixel-font text-xl"
          style={{
            color: feedbackColor,
            minHeight: 32,
            transition: 'color 0.1s',
          }}
        >
          {feedback}
        </div>

        {/* Big tap button */}
        <button
          className="btn-pixel text-2xl py-8 px-16"
          style={{
            background: '#FF69B4',
            color: 'white',
            minWidth: 240,
            boxShadow: '0 4px 0 #CC0066',
          }}
          onClick={handleTap}
          onTouchStart={(e) => { e.preventDefault(); handleTap() }}
        >
          TAP! 🎵
        </button>

        <p className="text-xs font-semibold text-gray-400 text-center">
          Tap when the circle pulses! Perfect within 80ms~
        </p>
      </div>
    </div>
  )
}
