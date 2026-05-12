'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calcWinner, GAME_NAMES, GAME_EMOJIS } from '@/lib/gameUtils'
import HeartTap from '@/components/games/HeartTap'
import LoveMemory from '@/components/games/LoveMemory'
import ReflexDuel from '@/components/games/ReflexDuel'
import WordScramble from '@/components/games/WordScramble'
import KawaiiQuiz from '@/components/games/KawaiiQuiz'
import type { User } from '@supabase/supabase-js'
import type { GameSession, GameScore } from '@/lib/supabase'

type GamePhase = 'countdown' | 'playing' | 'results'

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string

  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentGame, setCurrentGame] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null)
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [myGameScore, setMyGameScore] = useState<number | null>(null)
  const [opponentGameScore, setOpponentGameScore] = useState<number | null>(null)
  const [gameScores, setGameScores] = useState<GameScore[]>([])
  const [opponentEmail, setOpponentEmail] = useState('')
  const waitingRef = useRef(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }
      setUser(user)

      const res = await fetch(`/api/sessions/${code}`)
      const data = await res.json()
      if (!data.session) {
        router.replace('/dashboard')
        return
      }

      const sess: GameSession = data.session
      setSession(sess)

      if (sess.player1_id === user.id) {
        setPlayerRole('player1')
        setOpponentEmail(sess.player2_email || '')
      } else {
        setPlayerRole('player2')
        setOpponentEmail(sess.player1_email || '')
      }

      setMyScore(sess.player1_id === user.id ? sess.player1_score : sess.player2_score)
      setOpponentScore(sess.player1_id === user.id ? sess.player2_score : sess.player1_score)
      setCurrentGame(sess.current_game || 0)
      setGameScores(sess.game_scores || [])
      setLoading(false)
    }
    init()
  }, [code, router])

  // Realtime subscription for game events
  useEffect(() => {
    if (!user || !playerRole) return

    const channel = supabase
      .channel(`game:${code}`)
      .on('broadcast', { event: 'game_score' }, (payload) => {
        const p = payload.payload as { player_email: string; game: number; score: number }
        if (p.player_email !== user.email) {
          setOpponentGameScore(p.score)
        }
      })
      .on('broadcast', { event: 'game_ready' }, (payload) => {
        const p = payload.payload as { player_email: string; game: number }
        if (p.player_email !== user.email) {
          // Opponent is ready for next game
          if (waitingRef.current) {
            advanceGame()
          }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, playerRole, code])

  // Countdown logic
  useEffect(() => {
    if (phase !== 'countdown') return
    setCountdown(3)
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
  }, [phase, currentGame])

  const handleGameComplete = useCallback(async (score: number) => {
    if (!user || !playerRole || !session) return
    setMyGameScore(score)
    setPhase('results')

    // Broadcast score
    const channel = supabase.channel(`game:${code}`)
    await channel.send({
      type: 'broadcast',
      event: 'game_score',
      payload: { player_email: user.email, game: currentGame, score },
    })

    // Update session score
    const newMyTotal = myScore + 1  // Will be computed from game winner

    // Wait for opponent score then update DB
    waitingRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, playerRole, session, code, currentGame, myScore])

  async function advanceGame() {
    if (!user || !playerRole || !session) return
    waitingRef.current = false

    // Compute round winner
    const p1Score = playerRole === 'player1' ? myGameScore ?? 0 : opponentGameScore ?? 0
    const p2Score = playerRole === 'player2' ? myGameScore ?? 0 : opponentGameScore ?? 0
    const roundWinner = calcWinner(p1Score, p2Score)

    const newGameScore: GameScore = {
      game: currentGame,
      player1: p1Score,
      player2: p2Score,
      winner: roundWinner,
    }
    const newGameScores = [...gameScores, newGameScore]
    setGameScores(newGameScores)

    // Update totals
    let newP1Total = session.player1_score
    let newP2Total = session.player2_score
    if (roundWinner === 'player1') newP1Total += 1
    else if (roundWinner === 'player2') newP2Total += 1

    const nextGame = currentGame + 1

    // Update DB (player1 does this to avoid race condition)
    if (playerRole === 'player1') {
      await fetch(`/api/sessions/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_game: nextGame,
          player1_score: newP1Total,
          player2_score: newP2Total,
          game_scores: newGameScores,
          status: nextGame >= 5 ? 'finished' : 'playing',
        }),
      })
    }

    if (nextGame >= 5) {
      router.push(`/results/${code}`)
      return
    }

    // Update local state
    if (playerRole === 'player1') {
      setMyScore(newP1Total)
      setOpponentScore(newP2Total)
    } else {
      setMyScore(newP2Total)
      setOpponentScore(newP1Total)
    }

    setMyGameScore(null)
    setOpponentGameScore(null)
    setCurrentGame(nextGame)
    setPhase('countdown')
  }

  async function handleNextGame() {
    if (!user) return
    // Broadcast ready
    const channel = supabase.channel(`game:${code}`)
    await channel.send({
      type: 'broadcast',
      event: 'game_ready',
      payload: { player_email: user.email, game: currentGame },
    })

    // If we already have opponent score, advance now
    if (opponentGameScore !== null) {
      await advanceGame()
    } else {
      waitingRef.current = true
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="pixel-font text-sm text-[#FF69B4]">Loading<span className="loading-dots"></span></p>
      </div>
    )
  }

  const myLabel = playerRole === 'player1' ? session?.player1_email?.split('@')[0] : session?.player2_email?.split('@')[0]
  const oppLabel = opponentEmail.split('@')[0]

  const roundWinnerLabel = (() => {
    if (myGameScore === null || opponentGameScore === null) return null
    const myS = myGameScore
    const oppS = opponentGameScore
    if (myS > oppS) return 'you'
    if (oppS > myS) return 'opponent'
    return 'tie'
  })()

  return (
    <div className="relative min-h-screen flex flex-col" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <div className="countdown-overlay z-50">
          <div className="text-center">
            <div className="pixel-font text-xs text-white mb-4">
              {GAME_EMOJIS[currentGame]} Game {currentGame + 1}/5: {GAME_NAMES[currentGame]}
            </div>
            <div className="countdown-number">{countdown || 'GO!'}</div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b-3 border-[#FF69B4] px-4 py-3" style={{ borderBottomWidth: 3, borderColor: '#FF69B4' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-center">
            <div className="pixel-font text-xs text-[#FF1493]">YOU</div>
            <div className="font-bold text-xs text-gray-500 truncate max-w-[80px]">{myLabel}</div>
            <div className="pixel-font text-xl text-[#FF69B4]">{myScore}</div>
          </div>

          <div className="text-center px-2">
            <div className="pixel-font text-xs text-gray-500">
              Game {currentGame + 1}/5
            </div>
            <div className="text-xl">{GAME_EMOJIS[currentGame]}</div>
            <div className="pixel-font text-xs text-[#FF1493]">
              {GAME_NAMES[currentGame]}
            </div>
          </div>

          <div className="text-center">
            <div className="pixel-font text-xs text-[#C084FC]">BAE</div>
            <div className="font-bold text-xs text-gray-500 truncate max-w-[80px]">{oppLabel}</div>
            <div className="pixel-font text-xl text-[#C084FC]">{opponentScore}</div>
          </div>
        </div>

        {/* Game progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full border-2 border-black"
              style={{
                background: i < currentGame ? '#FF69B4' : i === currentGame ? '#FF1493' : '#FFE4F0',
              }}
            />
          ))}
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        {phase === 'playing' && (
          <>
            {currentGame === 0 && (
              <HeartTap onComplete={handleGameComplete} playerEmail={user?.email || ''} />
            )}
            {currentGame === 1 && (
              <LoveMemory onComplete={handleGameComplete} playerEmail={user?.email || ''} />
            )}
            {currentGame === 2 && (
              <ReflexDuel onComplete={handleGameComplete} playerEmail={user?.email || ''} />
            )}
            {currentGame === 3 && (
              <WordScramble
                onComplete={handleGameComplete}
                playerEmail={user?.email || ''}
                sessionCode={code}
              />
            )}
            {currentGame === 4 && (
              <KawaiiQuiz onComplete={handleGameComplete} playerEmail={user?.email || ''} />
            )}
          </>
        )}

        {phase === 'results' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 gap-4">
            <div className="text-5xl">{GAME_EMOJIS[currentGame]}</div>
            <h2 className="pixel-font text-sm text-[#FF1493]">
              Game {currentGame + 1} Results
            </h2>

            <div className="flex gap-6 justify-center">
              <div className="card-pixel p-4 text-center">
                <div className="font-bold text-xs text-gray-500 mb-1">You</div>
                <div className="pixel-font text-xl text-[#FF69B4]">{myGameScore ?? '...'}</div>
              </div>
              <div className="flex items-center text-2xl">vs</div>
              <div className="card-pixel-lavender p-4 text-center">
                <div className="font-bold text-xs text-gray-500 mb-1">Bae</div>
                <div className="pixel-font text-xl text-[#C084FC]">{opponentGameScore ?? '...'}</div>
              </div>
            </div>

            {roundWinnerLabel && (
              <div className="card-pixel p-4 w-full max-w-xs">
                {roundWinnerLabel === 'tie' ? (
                  <p className="pixel-font text-xs text-gray-600">Tie! ★</p>
                ) : roundWinnerLabel === 'you' ? (
                  <p className="pixel-font text-xs text-[#FF1493]">You win this round! ♡</p>
                ) : (
                  <p className="pixel-font text-xs text-[#C084FC]">Bae wins this round~ (◕_◕)</p>
                )}
              </div>
            )}

            {opponentGameScore === null ? (
              <p className="font-semibold text-gray-500">
                Waiting for bae<span className="loading-dots"></span> ♡
              </p>
            ) : (
              <button onClick={handleNextGame} className="btn-pixel">
                {currentGame < 4 ? `Next Game 🌸` : 'See Results 🏆'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
