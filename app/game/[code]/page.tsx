'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calcWinner, GAME_NAMES, GAME_EMOJIS, selectGamesForSession } from '@/lib/gameUtils'
import HeartTap from '@/components/games/HeartTap'
import LoveMemory from '@/components/games/LoveMemory'
import ReflexDuel from '@/components/games/ReflexDuel'
import WordScramble from '@/components/games/WordScramble'
import KawaiiQuiz from '@/components/games/KawaiiQuiz'
import TargetPop from '@/components/games/TargetPop'
import MathRace from '@/components/games/MathRace'
import ColorStroop from '@/components/games/ColorStroop'
import SakuraCatch from '@/components/games/SakuraCatch'
import EmojiDecode from '@/components/games/EmojiDecode'
import SimonMemory from '@/components/games/SimonMemory'
import TypeRace from '@/components/games/TypeRace'
import RockPaperSakura from '@/components/games/RockPaperSakura'
import StarCatcher from '@/components/games/StarCatcher'
import NumberRush from '@/components/games/NumberRush'
import KoiCatch from '@/components/games/KoiCatch'
import BalloonPop from '@/components/games/BalloonPop'
import SushiSwipe from '@/components/games/SushiSwipe'
import LuckySpin from '@/components/games/LuckySpin'
import LightningTile from '@/components/games/LightningTile'
import BellRace from '@/components/games/BellRace'
import CatWhack from '@/components/games/CatWhack'
import DangoStack from '@/components/games/DangoStack'
import MochiSmash from '@/components/games/MochiSmash'
import DartToss from '@/components/games/DartToss'
import OddOneOut from '@/components/games/OddOneOut'
import NumberSequence from '@/components/games/NumberSequence'
import ColorMatch from '@/components/games/ColorMatch'
import SlidePuzzle from '@/components/games/SlidePuzzle'
import QuickCount from '@/components/games/QuickCount'
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
  const [opponentName, setOpponentName] = useState('Player')
  const [myName, setMyName] = useState('You')
  const [selectedGames, setSelectedGames] = useState<number[]>([0, 1, 2, 3, 4])

  // Refs for stale-closure-safe access in realtime handlers and advanceGameWithRefs
  const myGameScoreRef = useRef<number | null>(null)
  const opponentGameScoreRef = useRef<number | null>(null)
  const currentGameRef = useRef(0)
  const gameScoresRef = useRef<GameScore[]>([])
  const sessionRef = useRef<GameSession | null>(null)
  const playerRoleRef = useRef<'player1' | 'player2' | null>(null)
  const myScoreRef = useRef(0)
  const opponentScoreRef = useRef(0)
  const userRef = useRef<User | null>(null)
  const waitingRef = useRef(false)
  const advancingRef = useRef(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Sync refs whenever state changes
  useEffect(() => { myGameScoreRef.current = myGameScore }, [myGameScore])
  useEffect(() => { opponentGameScoreRef.current = opponentGameScore }, [opponentGameScore])
  useEffect(() => { currentGameRef.current = currentGame }, [currentGame])
  useEffect(() => { gameScoresRef.current = gameScores }, [gameScores])
  useEffect(() => { sessionRef.current = session }, [session])
  useEffect(() => { playerRoleRef.current = playerRole }, [playerRole])
  useEffect(() => { myScoreRef.current = myScore }, [myScore])
  useEffect(() => { opponentScoreRef.current = opponentScore }, [opponentScore])
  useEffect(() => { userRef.current = user }, [user])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }
      setUser(user)
      userRef.current = user

      const derivedMyName = user.user_metadata?.username || user.email?.split('@')[0] || 'You'
      setMyName(derivedMyName)

      const res = await fetch(`/api/sessions/${code}`)
      const data = await res.json()
      if (!data.session) {
        router.replace('/dashboard')
        return
      }

      const sess: GameSession = data.session
      setSession(sess)
      sessionRef.current = sess

      if (sess.player1_id === user.id) {
        setPlayerRole('player1')
        playerRoleRef.current = 'player1'
        setOpponentName(sess.player2_username || sess.player2_email?.split('@')[0] || 'Player')
      } else {
        setPlayerRole('player2')
        playerRoleRef.current = 'player2'
        setOpponentName(sess.player1_username || sess.player1_email?.split('@')[0] || 'Player')
      }

      const initialMyScore = sess.player1_id === user.id ? sess.player1_score : sess.player2_score
      const initialOppScore = sess.player1_id === user.id ? sess.player2_score : sess.player1_score
      setMyScore(initialMyScore)
      setOpponentScore(initialOppScore)
      myScoreRef.current = initialMyScore
      opponentScoreRef.current = initialOppScore

      const initialGame = sess.current_game || 0
      setCurrentGame(initialGame)
      currentGameRef.current = initialGame

      const initialScores = sess.game_scores || []
      setGameScores(initialScores)
      gameScoresRef.current = initialScores

      setSelectedGames(selectGamesForSession(code))
      setLoading(false)
    }
    init()
  }, [code, router])

  // Realtime subscription - subscribe ONCE, store in ref
  useEffect(() => {
    if (!user || !playerRole) return

    const channel = supabase
      .channel(`game:${code}`)
      .on('broadcast', { event: 'game_score' }, (payload) => {
        const p = payload.payload as { player_email: string; game: number; score: number }
        if (p.player_email !== userRef.current?.email) {
          setOpponentGameScore(p.score)
          opponentGameScoreRef.current = p.score
        }
      })
      .on('broadcast', { event: 'game_ready' }, (payload) => {
        const p = payload.payload as { player_email: string; game: number }
        if (p.player_email === userRef.current?.email) return
        if (p.game !== currentGameRef.current) return
        if (advancingRef.current) return
        if (waitingRef.current) {
          advanceGameWithRefs()
        }
      })
      .on('broadcast', { event: 'player_info' }, (payload) => {
        const p = payload.payload as { player_email: string; username: string }
        if (p.player_email !== userRef.current?.email) {
          setOpponentName(p.username)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const u = userRef.current
          const name = u?.user_metadata?.username || u?.email?.split('@')[0] || 'Player'
          await channel.send({
            type: 'broadcast',
            event: 'player_info',
            payload: { player_email: u?.email, username: name },
          })
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, playerRole, code])

  // Polling fallback during results phase - check DB if opponent score is missing
  useEffect(() => {
    if (phase !== 'results' || opponentGameScore !== null) return
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${code}`)
        const data = await res.json()
        if (!data.session) return
        const sess: GameSession = data.session
        // Check if session advanced (player1 already wrote the next game state)
        if (sess.current_game !== undefined && sess.current_game > currentGameRef.current) {
          // Session already moved on - the scores must have been submitted
          // Read scores from game_scores array
          const scores: GameScore[] = sess.game_scores || []
          const roundScore = scores.find((s) => s.game === currentGameRef.current)
          if (roundScore) {
            const oppScore = playerRoleRef.current === 'player1' ? roundScore.player2 : roundScore.player1
            setOpponentGameScore(oppScore)
            opponentGameScoreRef.current = oppScore
          }
        }
      } catch {
        // ignore poll errors
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [phase, opponentGameScore, code])

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
    const role = playerRoleRef.current
    const sess = sessionRef.current
    const u = userRef.current
    const cg = currentGameRef.current
    if (!u || !role || !sess) return
    setMyGameScore(score)
    myGameScoreRef.current = score
    setPhase('results')

    // Broadcast score via the persistent channel ref
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'game_score',
        payload: { player_email: u.email, game: cg, score },
      })
    }
    // Do NOT set waitingRef.current here - user must click "Next Game" explicitly
  }, [])

  function advanceGameWithRefs() {
    if (advancingRef.current) return
    advancingRef.current = true
    waitingRef.current = false

    const role = playerRoleRef.current
    const sess = sessionRef.current
    const u = userRef.current
    const myS = myGameScoreRef.current ?? 0
    const oppS = opponentGameScoreRef.current ?? 0
    const cg = currentGameRef.current
    const scores = gameScoresRef.current

    if (!u || !role || !sess) {
      advancingRef.current = false
      return
    }

    // Compute round winner
    const p1Score = role === 'player1' ? myS : oppS
    const p2Score = role === 'player2' ? myS : oppS
    const roundWinner = calcWinner(p1Score, p2Score)

    const newGameScore: GameScore = {
      game: cg,
      player1: p1Score,
      player2: p2Score,
      winner: roundWinner,
    }
    const newGameScores = [...scores, newGameScore]
    setGameScores(newGameScores)
    gameScoresRef.current = newGameScores

    // Update totals
    let newP1Total = sess.player1_score
    let newP2Total = sess.player2_score
    if (roundWinner === 'player1') newP1Total += 1
    else if (roundWinner === 'player2') newP2Total += 1

    const nextGame = cg + 1

    // Update DB (player1 does this to avoid race condition)
    if (role === 'player1') {
      fetch(`/api/sessions/${code}`, {
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
    const newMyScore = role === 'player1' ? newP1Total : newP2Total
    const newOppScore = role === 'player1' ? newP2Total : newP1Total
    setMyScore(newMyScore)
    setOpponentScore(newOppScore)
    myScoreRef.current = newMyScore
    opponentScoreRef.current = newOppScore

    setMyGameScore(null)
    myGameScoreRef.current = null
    setOpponentGameScore(null)
    opponentGameScoreRef.current = null

    const newCurrentGame = nextGame
    setCurrentGame(newCurrentGame)
    currentGameRef.current = newCurrentGame

    setPhase('countdown')

    setTimeout(() => { advancingRef.current = false }, 500)
  }

  async function handleNextGame() {
    const u = userRef.current
    if (!u) return
    // Broadcast ready via persistent channel
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'game_ready',
        payload: { player_email: u.email, game: currentGameRef.current },
      })
    }

    // If we already have opponent score, advance now
    if (opponentGameScoreRef.current !== null) {
      advanceGameWithRefs()
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

  const oppLabel = opponentName

  const roundWinnerLabel = (() => {
    if (myGameScore === null || opponentGameScore === null) return null
    const myS = myGameScore
    const oppS = opponentGameScore
    if (myS > oppS) return 'you'
    if (oppS > myS) return 'opponent'
    return 'tie'
  })()

  // Get the actual game index (0-14) for the current slot
  const gameIndex = selectedGames[currentGame] ?? currentGame

  function renderGame() {
    const email = user?.email || ''
    switch (gameIndex) {
      case 0:
        return <HeartTap onComplete={handleGameComplete} playerEmail={email} />
      case 1:
        return <LoveMemory onComplete={handleGameComplete} playerEmail={email} />
      case 2:
        return <ReflexDuel onComplete={handleGameComplete} playerEmail={email} />
      case 3:
        return <WordScramble onComplete={handleGameComplete} playerEmail={email} sessionCode={code} />
      case 4:
        return <KawaiiQuiz onComplete={handleGameComplete} playerEmail={email} />
      case 5:
        return <TargetPop onComplete={handleGameComplete} playerEmail={email} />
      case 6:
        return <MathRace onComplete={handleGameComplete} playerEmail={email} />
      case 7:
        return <ColorStroop onComplete={handleGameComplete} playerEmail={email} />
      case 8:
        return <SakuraCatch onComplete={handleGameComplete} playerEmail={email} />
      case 9:
        return <EmojiDecode onComplete={handleGameComplete} playerEmail={email} />
      case 10:
        return <SimonMemory onComplete={handleGameComplete} playerEmail={email} />
      case 11:
        return <TypeRace onComplete={handleGameComplete} playerEmail={email} />
      case 12:
        return <RockPaperSakura onComplete={handleGameComplete} playerEmail={email} sessionCode={code} opponentName={oppLabel} />
      case 13:
        return <StarCatcher onComplete={handleGameComplete} playerEmail={email} />
      case 14:
        return <NumberRush onComplete={handleGameComplete} playerEmail={email} />
      case 15:
        return <KoiCatch onComplete={handleGameComplete} playerEmail={email} />
      case 16:
        return <BalloonPop onComplete={handleGameComplete} playerEmail={email} />
      case 17:
        return <SushiSwipe onComplete={handleGameComplete} playerEmail={email} />
      case 18:
        return <LuckySpin onComplete={handleGameComplete} playerEmail={email} />
      case 19:
        return <LightningTile onComplete={handleGameComplete} playerEmail={email} />
      case 20:
        return <BellRace onComplete={handleGameComplete} playerEmail={email} />
      case 21:
        return <CatWhack onComplete={handleGameComplete} playerEmail={email} />
      case 22:
        return <DangoStack onComplete={handleGameComplete} playerEmail={email} />
      case 23:
        return <MochiSmash onComplete={handleGameComplete} playerEmail={email} />
      case 24:
        return <DartToss onComplete={handleGameComplete} playerEmail={email} />
      case 25:
        return <OddOneOut onComplete={handleGameComplete} playerEmail={email} />
      case 26:
        return <NumberSequence onComplete={handleGameComplete} playerEmail={email} />
      case 27:
        return <ColorMatch onComplete={handleGameComplete} playerEmail={email} />
      case 28:
        return <SlidePuzzle onComplete={handleGameComplete} playerEmail={email} />
      case 29:
        return <QuickCount onComplete={handleGameComplete} playerEmail={email} />
      default:
        return <HeartTap onComplete={handleGameComplete} playerEmail={email} />
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <div className="countdown-overlay z-50">
          <div className="text-center">
            <div className="pixel-font text-xs text-white mb-4">
              {GAME_EMOJIS[gameIndex]} Game {currentGame + 1}/5: {GAME_NAMES[gameIndex]}
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
            <div className="font-bold text-xs text-gray-500 truncate max-w-[80px]">{myName}</div>
            <div className="pixel-font text-xl text-[#FF69B4]">{myScore}</div>
          </div>

          <div className="text-center px-2">
            <div className="pixel-font text-xs text-gray-500">
              Game {currentGame + 1}/5
            </div>
            <div className="text-xl">{GAME_EMOJIS[gameIndex]}</div>
            <div className="pixel-font text-xs text-[#FF1493]">
              {GAME_NAMES[gameIndex]}
            </div>
          </div>

          <div className="text-center">
            <div className="pixel-font text-xs text-[#C084FC] truncate max-w-[80px]">{(oppLabel || 'PLAYER').toString().toUpperCase()}</div>
            <div className="pixel-font text-xl text-[#C084FC]">{opponentScore}</div>
          </div>
        </div>

        {/* Game progress dots - always 5 */}
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
        {phase === 'playing' && renderGame()}

        {phase === 'results' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 gap-4">
            <div className="text-5xl">{GAME_EMOJIS[gameIndex]}</div>
            <h2 className="pixel-font text-sm text-[#FF1493]">
              Game {currentGame + 1} Results
            </h2>

            <div className="flex gap-6 justify-center">
              <div className="card-pixel p-4 text-center">
                <div className="font-bold text-xs text-gray-500 mb-1">{myName}</div>
                <div className="pixel-font text-xl text-[#FF69B4]">{myGameScore ?? '...'}</div>
              </div>
              <div className="flex items-center text-2xl">vs</div>
              <div className="card-pixel-lavender p-4 text-center">
                <div className="font-bold text-xs text-gray-500 mb-1 truncate max-w-[100px]">{oppLabel || 'Player'}</div>
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
                  <p className="pixel-font text-xs text-[#C084FC]">{oppLabel || 'Player'} wins this round~ (◕_◕)</p>
                )}
              </div>
            )}

            {opponentGameScore === null ? (
              <p className="font-semibold text-gray-500">
                Waiting for {oppLabel || 'Player'}<span className="loading-dots"></span> ♡
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
