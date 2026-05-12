'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { GAME_NAMES, GAME_EMOJIS } from '@/lib/gameUtils'
import SakuraPetals from '@/components/SakuraPetals'
import type { User } from '@supabase/supabase-js'
import type { GameSession, GameScore } from '@/lib/supabase'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string

  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null)
  const confettiRef = useRef(false)

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
      } else {
        setPlayerRole('player2')
      }

      setLoading(false)
    }
    init()
  }, [code, router])

  // Confetti
  useEffect(() => {
    if (!session || confettiRef.current) return
    confettiRef.current = true

    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default
      const end = Date.now() + 4000
      const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#E6CCFF', '#C084FC', '#FFD700']

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    })
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="pixel-font text-sm text-[#FF69B4]">Loading<span className="loading-dots"></span></p>
      </div>
    )
  }

  if (!session) return null

  const p1Score = session.player1_score
  const p2Score = session.player2_score
  const winnerName =
    p1Score > p2Score
      ? (session.player1_username || session.player1_email?.split('@')[0])
      : p2Score > p1Score
      ? (session.player2_username || session.player2_email?.split('@')[0])
      : null

  const isTie = p1Score === p2Score
  const isWinner =
    (playerRole === 'player1' && p1Score > p2Score) ||
    (playerRole === 'player2' && p2Score > p1Score)

  const myEmail = playerRole === 'player1' ? session.player1_email : session.player2_email
  const opponentEmail = playerRole === 'player1' ? session.player2_email : session.player1_email
  const myTotal = playerRole === 'player1' ? p1Score : p2Score
  const oppTotal = playerRole === 'player1' ? p2Score : p1Score

  const scores: GameScore[] = Array.isArray(session.game_scores) ? session.game_scores : []

  return (
    <div className="relative min-h-screen">
      <SakuraPetals />

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">Kawaii Couple</Link>
      </nav>

      <div className="relative z-10 px-4 py-6 max-w-2xl mx-auto text-center">
        {/* Winner announcement */}
        <div className="mb-8">
          <div className="text-6xl mb-4 bounce-kawaii">
            {isTie ? '🤝' : isWinner ? '🏆' : '💕'}
          </div>

          {isTie ? (
            <>
              <h1 className="pixel-font text-sm md:text-base text-[#FF1493] mb-3 leading-relaxed">
                It's a Tie! ★
              </h1>
              <p className="font-bold text-xl text-[#C084FC]">
                You're equally matched~ (◕‿◕)✿
              </p>
            </>
          ) : isWinner ? (
            <>
              <h1 className="pixel-font text-sm md:text-base text-[#FF1493] mb-3 leading-relaxed">
                You Win Today! ♡
              </h1>
              <p className="font-bold text-xl text-[#C084FC]">
                👑 Congratulations, champion! (◠‿◠)✿
              </p>
            </>
          ) : (
            <>
              <h1 className="pixel-font text-sm md:text-base text-[#FF1493] mb-3 leading-relaxed">
                🏆 {winnerName} Wins! 👑
              </h1>
              <p className="font-bold text-xl text-[#C084FC]">
                Better luck next time~ ♡ (◡‿◡✿)
              </p>
            </>
          )}
        </div>

        {/* Score summary */}
        <div className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-4">Final Score</h2>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="font-bold text-sm text-gray-500 mb-1">You</div>
              <div className="pixel-font text-3xl text-[#FF69B4]">{myTotal}</div>
              <div className="text-xs font-bold text-gray-400">games won</div>
            </div>
            <div className="flex items-center text-3xl">vs</div>
            <div className="text-center">
              <div className="font-bold text-sm text-gray-500 mb-1">Babe</div>
              <div className="pixel-font text-3xl text-[#C084FC]">{oppTotal}</div>
              <div className="text-xs font-bold text-gray-400">games won</div>
            </div>
          </div>
        </div>

        {/* Game by game breakdown */}
        <div className="card-pixel p-5 mb-6 text-left">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-4">Game Breakdown ✿</h2>
          <div className="space-y-3">
            {GAME_NAMES.map((name, i) => {
              const gs = scores.find((s) => s.game === i)
              const myGS = playerRole === 'player1' ? gs?.player1 : gs?.player2
              const oppGS = playerRole === 'player1' ? gs?.player2 : gs?.player1
              const gameWinner = gs?.winner
              const iWon =
                (playerRole === 'player1' && gameWinner === 'player1') ||
                (playerRole === 'player2' && gameWinner === 'player2')
              const isTieGame = gameWinner === 'tie'

              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-pink-100 last:border-0">
                  <span className="text-xl w-8">{GAME_EMOJIS[i]}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-700">{name}</div>
                    {gs ? (
                      <div className="text-xs text-gray-500 font-semibold">
                        You: {myGS ?? 0} | Babe: {oppGS ?? 0}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Not played</div>
                    )}
                  </div>
                  <div className={`pixel-font text-xs ${
                    isTieGame ? 'text-gray-500' : iWon ? 'text-[#FF1493]' : 'text-[#C084FC]'
                  }`}>
                    {gs ? (isTieGame ? 'TIE' : iWon ? 'WIN' : 'LOSS') : '-'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/dashboard" className="btn-pixel">
            Play Again 🌸
          </Link>
          <Link href="/" className="btn-pixel btn-pixel-lavender">
            Back Home ✿
          </Link>
        </div>

        {/* Ko-fi prompt */}
        <div className="card-pixel p-6 text-center">
          <p className="font-bold text-gray-700 mb-2">Love Kawaii Couple? ♡</p>
          <p className="text-sm font-semibold text-gray-500 mb-4">
            Buy us a coffee~ (◡‿◡✿)
          </p>
          <a
            href="https://ko-fi.com/roastlabai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pixel"
          >
            ☕ Support on Ko-fi
          </a>
        </div>

        {/* AdSense placeholder */}
        <div className="mt-8">
          {/* AdSense slot */}
          <div className="w-full h-24 bg-pink-50 border-2 border-dashed border-pink-200 rounded flex items-center justify-center text-pink-300 text-sm font-semibold">
            Advertisement
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center py-8">
        <p className="font-semibold text-gray-400">Kawaii Couple by Roast Lab AI 🌸</p>
      </footer>
    </div>
  )
}
