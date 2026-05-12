'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface RockPaperSakuraProps {
  onComplete: (score: number) => void
  playerEmail: string
  sessionCode: string
}

type Choice = 'rock' | 'paper' | 'sakura' | null

const CHOICES: Array<{ id: Choice; label: string; emoji: string }> = [
  { id: 'rock', label: 'Rock', emoji: '🪨' },
  { id: 'paper', label: 'Paper', emoji: '📄' },
  { id: 'sakura', label: 'Sakura', emoji: '🌸' },
]

const TOTAL_ROUNDS = 5
const ROUND_TIME = 5

function getRoundResult(mine: Choice, opponent: Choice): 'win' | 'lose' | 'tie' {
  if (!mine || !opponent) return 'lose'
  if (mine === opponent) return 'tie'
  if (
    (mine === 'rock' && opponent === 'sakura') ||
    (mine === 'paper' && opponent === 'rock') ||
    (mine === 'sakura' && opponent === 'paper')
  ) return 'win'
  return 'lose'
}

export default function RockPaperSakura({ onComplete, playerEmail, sessionCode }: RockPaperSakuraProps) {
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [myChoice, setMyChoice] = useState<Choice>(null)
  const [opponentChoice, setOpponentChoice] = useState<Choice>(null)
  const [roundTimer, setRoundTimer] = useState(ROUND_TIME)
  const [phase, setPhase] = useState<'choosing' | 'reveal' | 'done'>('choosing')
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'tie' | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const roundRef = useRef(1)
  const myChoiceRef = useRef<Choice>(null)
  const opponentChoiceRef = useRef<Choice>(null)
  const gameOverRef = useRef(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const revealedRef = useRef(false)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(scoreRef.current)
  }, [onComplete])

  const revealRound = useCallback((mine: Choice, opp: Choice) => {
    if (revealedRef.current) return
    revealedRef.current = true

    const result = getRoundResult(mine, opp)
    if (result === 'win') {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
    setRoundResult(result)
    setPhase('reveal')
    setMyChoice(mine)
    setOpponentChoice(opp)

    setTimeout(() => {
      const nextRound = roundRef.current + 1
      roundRef.current = nextRound
      if (nextRound > TOTAL_ROUNDS) {
        endGame()
      } else {
        setRound(nextRound)
        setMyChoice(null)
        setOpponentChoice(null)
        myChoiceRef.current = null
        opponentChoiceRef.current = null
        setRoundResult(null)
        setRoundTimer(ROUND_TIME)
        setPhase('choosing')
        revealedRef.current = false
      }
    }, 2000)
  }, [endGame])

  // Subscribe to opponent choices
  useEffect(() => {
    const channel = supabase
      .channel(`rps:${sessionCode}`)
      .on('broadcast', { event: 'rps_choice' }, (payload) => {
        const p = payload.payload as { player_email: string; round: number; choice: Choice }
        if (p.player_email !== playerEmail && p.round === roundRef.current) {
          opponentChoiceRef.current = p.choice
          setOpponentChoice(p.choice)
          // If I already chose, reveal now
          if (myChoiceRef.current !== null) {
            revealRound(myChoiceRef.current, p.choice)
          }
        }
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [sessionCode, playerEmail, revealRound])

  // Round timer
  useEffect(() => {
    if (phase !== 'choosing' || gameOver) return
    revealedRef.current = false
    setRoundTimer(ROUND_TIME)
    const interval = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Auto-lose if no choice
          const mine = myChoiceRef.current || null
          const opp = opponentChoiceRef.current || null
          if (!revealedRef.current) {
            revealRound(mine, opp)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, phase, gameOver])

  async function handleChoose(choice: Choice) {
    if (phase !== 'choosing' || myChoiceRef.current !== null || gameOver) return
    myChoiceRef.current = choice
    setMyChoice(choice)

    // Broadcast
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'rps_choice',
        payload: { player_email: playerEmail, round: roundRef.current, choice },
      })
    }

    // If opponent already chose, reveal
    if (opponentChoiceRef.current !== null) {
      revealRound(choice, opponentChoiceRef.current)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Rock Paper Sakura ✂️</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} wins</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{roundTimer}s</div>
          <div className="text-xs font-semibold text-gray-500">Round {round}/{TOTAL_ROUNDS}</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">✂️</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Done!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score}/5 wins</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            {phase === 'reveal' && (
              <div className="card-pixel p-4 text-center w-full max-w-xs">
                <div className="flex justify-around mb-3">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-500 mb-1">You</div>
                    <div className="text-4xl">{CHOICES.find(c => c.id === myChoice)?.emoji || '?'}</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-400 flex items-center">vs</div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-500 mb-1">Babe</div>
                    <div className="text-4xl">{CHOICES.find(c => c.id === opponentChoice)?.emoji || '?'}</div>
                  </div>
                </div>
                <div className={`pixel-font text-xs ${
                  roundResult === 'win' ? 'text-green-500' :
                  roundResult === 'lose' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {roundResult === 'win' ? 'You win! ♡' :
                   roundResult === 'lose' ? 'Babe wins~' : 'Tie! ★'}
                </div>
              </div>
            )}

            {phase === 'choosing' && (
              <>
                <p className="pixel-font text-xs text-[#FF1493]">
                  Choose now! {myChoice ? `You picked ${CHOICES.find(c => c.id === myChoice)?.emoji}` : ''}
                </p>
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                  {CHOICES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleChoose(c.id)}
                      onTouchStart={(e) => { e.preventDefault(); handleChoose(c.id) }}
                      className="btn-pixel flex flex-col items-center py-4 gap-1"
                      style={{
                        opacity: myChoice && myChoice !== c.id ? 0.5 : 1,
                        background: myChoice === c.id ? '#FF1493' : '#FF69B4',
                        fontSize: '0.6rem',
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="text-xs font-semibold text-gray-400">
              🌸 beats 📄 | 📄 beats 🪨 | 🪨 beats 🌸
            </div>
          </>
        )}
      </div>
    </div>
  )
}
