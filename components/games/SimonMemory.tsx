'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SimonMemoryProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const COLORS = [
  { name: 'Pink', bg: '#FF69B4', active: '#FF1493', text: 'white' },
  { name: 'Purple', bg: '#C084FC', active: '#9333EA', text: 'white' },
  { name: 'Blue', bg: '#60A5FA', active: '#2563EB', text: 'white' },
  { name: 'Yellow', bg: '#FDE68A', active: '#F59E0B', text: '#1a1a1a' },
]

const MAX_ROUNDS = 10
const TOTAL_TIME = 180

type Phase = 'show' | 'input' | 'done' | 'wrong' | 'correct'

export default function SimonMemory({ onComplete, playerEmail }: SimonMemoryProps) {
  const [round, setRound] = useState(0)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('show')
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const roundRef = useRef(0)

  const endGame = useCallback((score: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(score)
  }, [onComplete])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          endGame(scoreRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [endGame])

  // Start game - show first sequence
  useEffect(() => {
    startRound(1, [Math.floor(Math.random() * 4)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startRound(roundNum: number, seq: number[]) {
    roundRef.current = roundNum
    setRound(roundNum)
    setSequence(seq)
    setPlayerInput([])
    setPhase('show')

    // Show sequence with delays
    let delay = 600
    seq.forEach((colorIdx, i) => {
      setTimeout(() => {
        setActiveIdx(colorIdx)
        setTimeout(() => setActiveIdx(null), 400)
      }, delay + i * 700)
    })
    setTimeout(() => {
      setPhase('input')
    }, delay + seq.length * 700 + 300)
  }

  function handlePress(colorIdx: number) {
    if (phase !== 'input' || gameOver) return

    const newInput = [...playerInput, colorIdx]
    setPlayerInput(newInput)
    setActiveIdx(colorIdx)
    setTimeout(() => setActiveIdx(null), 200)

    const pos = newInput.length - 1
    if (newInput[pos] !== sequence[pos]) {
      // Wrong
      setPhase('wrong')
      setTimeout(() => endGame(scoreRef.current), 1000)
      return
    }

    if (newInput.length === sequence.length) {
      // Round complete!
      scoreRef.current += 1
      setPhase('correct')
      const nextRound = roundRef.current + 1
      if (nextRound > MAX_ROUNDS) {
        setTimeout(() => endGame(scoreRef.current), 800)
      } else {
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)]
        setTimeout(() => startRound(nextRound, nextSeq), 1000)
      }
    }
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Simon Says 🎵</div>
          <div className="font-bold text-lg text-[#FF69B4]">Round {round}/{MAX_ROUNDS}</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-base text-[#FF1493]">{mins}:{secs.toString().padStart(2, '0')}</div>
          <div className="text-xs font-semibold text-gray-500">left</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🎵</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">
              {phase === 'wrong' ? 'Game Over!' : 'Complete!'}
            </div>
            <div className="font-bold text-3xl text-[#FF69B4]">{scoreRef.current} rounds</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              {phase === 'show' && (
                <p className="pixel-font text-xs text-[#FF1493]">Watch the sequence!</p>
              )}
              {phase === 'input' && (
                <p className="pixel-font text-xs text-[#C084FC]">
                  Repeat it! ({playerInput.length}/{sequence.length})
                </p>
              )}
              {phase === 'correct' && (
                <p className="pixel-font text-xs text-green-500">Correct! ♡</p>
              )}
              {phase === 'wrong' && (
                <p className="pixel-font text-xs text-red-500">Wrong! Game over~</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {COLORS.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => handlePress(idx)}
                  onTouchStart={(e) => { e.preventDefault(); handlePress(idx) }}
                  disabled={phase !== 'input'}
                  style={{
                    background: activeIdx === idx ? color.active : color.bg,
                    color: color.text,
                    border: '3px solid #1a1a1a',
                    boxShadow: activeIdx === idx ? '1px 1px 0px #1a1a1a' : '4px 4px 0px #1a1a1a',
                    transform: activeIdx === idx ? 'translate(3px, 3px)' : 'none',
                    transition: 'all 0.1s',
                    padding: '24px 16px',
                    fontSize: '0.7rem',
                    fontFamily: "'Press Start 2P', monospace",
                    cursor: phase === 'input' ? 'pointer' : 'default',
                    opacity: phase === 'show' ? 0.7 : 1,
                    userSelect: 'none',
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
