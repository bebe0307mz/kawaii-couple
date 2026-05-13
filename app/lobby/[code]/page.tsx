'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SakuraPetals from '@/components/SakuraPetals'
import type { User } from '@supabase/supabase-js'
import type { GameSession } from '@/lib/supabase'

export default function LobbyPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string

  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<GameSession | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${code}`)
    const data = await res.json()
    if (data.session) {
      setSession(data.session)
      return data.session as GameSession
    }
    return null
  }, [code])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }
      setUser(user)

      const sess = await loadSession()
      if (!sess) {
        setError('Session not found!')
      }
      setLoading(false)
    }
    init()
  }, [router, loadSession])

  // Realtime subscription
  useEffect(() => {
    if (!code) return

    const channel = supabase
      .channel(`lobby:${code}`)
      .on('broadcast', { event: 'player_joined' }, () => {
        loadSession()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [code, loadSession])

  // Broadcast player joined and poll session
  useEffect(() => {
    if (!user || !code) return

    const channel = supabase.channel(`lobby:${code}`)

    // Broadcast that we joined
    const timer = setTimeout(async () => {
      await channel.send({
        type: 'broadcast',
        event: 'player_joined',
        payload: { player_id: user.id, player_email: user.email },
      })
    }, 500)

    // Poll for session updates
    const pollInterval = setInterval(async () => {
      const sess = await loadSession()
      if (sess?.player2_id && sess?.player1_id) {
        clearInterval(pollInterval)
        startCountdown()
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearInterval(pollInterval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, code])

  function startCountdown() {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          router.push(`/game/${code}`)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const bothReady = !!(session?.player1_id && session?.player2_id)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="pixel-font text-sm text-[#FF69B4]">Loading<span className="loading-dots"></span></p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <SakuraPetals />

      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="text-center">
            <p className="pixel-font text-sm text-white mb-4">Both players ready!</p>
            <div className="countdown-number">{countdown}</div>
          </div>
        </div>
      )}

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/dashboard" className="pixel-font text-sm text-[#FF69B4]">Kawaii Couple</Link>
      </nav>

      <div className="relative z-10 px-4 py-8 max-w-2xl mx-auto text-center">
        {error ? (
          <div className="card-pixel p-8">
            <p className="pixel-font text-sm text-red-500 mb-4">{error}</p>
            <Link href="/dashboard" className="btn-pixel">Back to Dashboard</Link>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-4">🌸</div>
            <h1 className="pixel-font text-sm md:text-base text-[#FF1493] mb-2">
              Waiting Room
            </h1>
            <p className="font-semibold text-[#C084FC] mb-8">(◕‿◕)✿</p>

            {/* Session Code */}
            <div className="card-pixel p-6 mb-8 inline-block">
              <p className="font-bold text-gray-600 mb-2">Game Code</p>
              <div className="pixel-font text-3xl text-[#FF1493] tracking-widest mb-2">
                {code}
              </div>
              <p className="text-sm font-semibold text-gray-500">Share this with your babe~ ♡</p>
            </div>

            {/* Players */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-[#FF69B4] flex items-center justify-center text-3xl bg-pink-100 mx-auto mb-2">
                  {session?.player1_id ? '💝' : '?'}
                </div>
                <p className="pixel-font text-xs text-[#FF1493]">Player 1</p>
                {session?.player1_id && (
                  <p className="pixel-font text-xs text-[#FF69B4] mt-1">
                    {session.player1_username || session.player1_email?.split('@')[0]}
                  </p>
                )}
                {session?.player1_id && (
                  <span className="text-xs text-green-500 font-bold">Ready!</span>
                )}
              </div>

              <div className="flex items-center text-2xl text-[#FF69B4]">♡</div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#FF69B4] flex items-center justify-center text-3xl bg-pink-50 mx-auto mb-2">
                  {session?.player2_id ? '💝' : (
                    <span className="loading-dots text-2xl text-[#FF69B4]">~</span>
                  )}
                </div>
                <p className="pixel-font text-xs text-[#FF1493]">Player 2</p>
                {session?.player2_id && (
                  <p className="pixel-font text-xs text-[#C084FC] mt-1">
                    {session.player2_username || session.player2_email?.split('@')[0]}
                  </p>
                )}
                {session?.player2_id ? (
                  <span className="text-xs text-green-500 font-bold">Ready!</span>
                ) : (
                  <span className="text-xs text-[#FF69B4] font-bold flash-ready">Waiting...</span>
                )}
              </div>
            </div>

            {!bothReady ? (
              <div className="card-pixel p-6 max-w-sm mx-auto">
                <p className="font-bold text-[#FF69B4] text-lg">
                  Waiting for your babe<span className="loading-dots"></span> ♡
                </p>
                <p className="text-sm font-semibold text-gray-500 mt-2">
                  (◡‿◡✿) Share the code above!
                </p>
              </div>
            ) : (
              <div className="card-pixel p-6 max-w-sm mx-auto">
                <p className="font-bold text-[#FF69B4] text-lg bounce-kawaii">
                  Both players ready! ✿
                </p>
                <p className="text-sm font-semibold text-gray-500 mt-2">
                  Starting soon~ ♡
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
