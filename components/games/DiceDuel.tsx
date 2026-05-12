'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface DiceDuelProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const TOTAL_ROUNDS = 5
const REVEAL_DELAY = 2000
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default function DiceDuel({ onComplete, playerEmail }: DiceDuelProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [myRoll, setMyRoll] = useState<number | null>(null)
  const [oppRoll, setOppRoll] = useState<number | null>(null)
  const [phase, setPhase] = useState<'rolling' | 'reveal' | 'done'>('rolling')
  const [shaking, setShaking] = useState(false)
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

  function rollDice() {
    if (phase !== 'rolling' || gameOver) return

    setShaking(true)
    setTimeout(() => {
      setShaking(false)
      const me = Math.floor(Math.random() * 6) + 1
      const opp = Math.floor(Math.random() * 6) + 1
      setMyRoll(me)
      setOppRoll(opp)
      setPhase('reveal')

      const pts = me > opp ? 2 : me === opp ? 1 : 0
      const newScore = scoreRef.current + pts
      scoreRef.current = newScore
      setScore(newScore)

      setTimeout(() => {
        const nextRound = roundRef.current + 1
        roundRef.current = nextRound

        if (nextRound >= TOTAL_ROUNDS) {
          endGame(newScore)
          return
        }

        setRound(nextRound)
        setMyRoll(null)
        setOppRoll(null)
        setPhase('rolling')
      }, REVEAL_DELAY)
    }, 600)
  }

  const resultText = myRoll !== null && oppRoll !== null
    ? myRoll > oppRoll ? 'You Win! ♡ +2'
      : myRoll === oppRoll ? 'Tie! ★ +1'
        : 'Opponent Wins~ +0'
    : null

  const resultColor = myRoll !== null && oppRoll !== null
    ? myRoll > oppRoll ? '#22C55E'
      : myRoll === oppRoll ? '#FBBF24'
        : '#EF4444'
    : '#FF69B4'

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🎲</div>
        <div className="pixel-font text-base text-[#FF1493]">Duel Over!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/10</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Dice Duel 🎲</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {/* Dice display */}
        <div className="flex gap-8 items-center">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-400 mb-2 pixel-font">YOU</div>
            <div
              className="card-pixel p-4 text-center"
              style={{
                background: '#FFF0F5',
                minWidth: 90,
                minHeight: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: shaking ? 'shake 0.5s ease-in-out' : 'none',
              }}
            >
              <div style={{ fontSize: 56 }}>
                {myRoll ? DICE_FACES[myRoll - 1] : shaking ? '🎲' : '🎲'}
              </div>
            </div>
          </div>

          <div className="pixel-font text-2xl text-[#FF69B4]">VS</div>

          <div className="text-center">
            <div className="text-xs font-semibold text-gray-400 mb-2 pixel-font">BABE</div>
            <div
              className="card-pixel p-4 text-center"
              style={{
                background: '#F3E8FF',
                minWidth: 90,
                minHeight: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 56 }}>
                {oppRoll ? DICE_FACES[oppRoll - 1] : '❓'}
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {resultText && (
          <div
            className="card-pixel px-6 py-3 text-center"
            style={{ background: resultColor + '22', borderColor: resultColor }}
          >
            <div className="pixel-font text-sm" style={{ color: resultColor }}>
              {resultText}
            </div>
          </div>
        )}

        {/* Roll button */}
        {phase === 'rolling' && !shaking && (
          <button
            className="btn-pixel text-xl py-5 px-12"
            style={{ background: '#FF69B4', color: 'white' }}
            onClick={rollDice}
            onTouchStart={(e) => { e.preventDefault(); rollDice() }}
          >
            Roll Dice! 🎲
          </button>
        )}

        {shaking && (
          <div className="pixel-font text-lg text-[#FF69B4]">Rolling... 🎲</div>
        )}

        {phase === 'reveal' && (
          <div className="pixel-font text-xs text-gray-400">Next round coming~</div>
        )}

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(-6px) rotate(-8deg); }
            50% { transform: translateX(6px) rotate(8deg); }
            75% { transform: translateX(-4px) rotate(-4deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
