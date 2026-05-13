'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SakuraPetals from '@/components/SakuraPetals'

function AuthForm() {
  const searchParams = useSearchParams()
  const joinCode = searchParams.get('code') || ''

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (joinCode) {
      sessionStorage.setItem('pendingJoinCode', joinCode)
    }
  }, [joinCode])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || cooldown > 0) return
    setLoading(true)
    setError('')

    const callbackUrl = joinCode
      ? `${window.location.origin}/auth/callback?joinCode=${joinCode}`
      : `${window.location.origin}/auth/callback`

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    })

    if (err) {
      const msg = err.message.toLowerCase()
      if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('exceeded')) {
        setError('Magic link already on the way~ check your inbox (and spam folder). Try again in a minute if it doesn\'t arrive ♡')
        setCooldown(60)
      } else if (msg.includes('invalid email')) {
        setError('Hmm, that email looks wrong~ check it and try again!')
      } else {
        setError(err.message)
      }
    } else {
      setSent(true)
      setCooldown(60)
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <SakuraPetals />

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">
          Kawaii Couple
        </Link>
      </nav>

      {joinCode && (
        <div className="relative z-10 mx-auto mt-4 px-4 w-full max-w-md">
          <div className="card-pixel-lavender p-3 flex items-center gap-3">
            <span className="text-xl">🌸</span>
            <div>
              <p className="font-bold text-xs text-[#C084FC]">Invite code ready</p>
              <p className="font-semibold text-xs text-gray-600">
                Sign in to join game <span className="pixel-font text-[#FF1493]">{joinCode}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        <div className="card-pixel p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">💌</div>
          <h1 className="pixel-font text-sm md:text-base text-[#FF1493] mb-2">
            Login
          </h1>
          <p className="font-semibold text-[#C084FC] mb-6 text-lg">
            (◕‿◕)✿
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="text-left">
                <label className="block font-bold text-sm text-gray-700 mb-2">
                  Enter your email, bestie~ ♡
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-pixel w-full"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 p-3 text-red-600 text-sm font-bold rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="btn-pixel w-full mt-2"
              >
                {loading
                  ? 'Sending ♡...'
                  : cooldown > 0
                  ? `Wait ${cooldown}s before resending ♡`
                  : '✉️ Send Magic Link'}
              </button>

              <p className="text-xs text-gray-500 font-semibold mt-2">
                No password needed! We email you a magic link~ ✿
              </p>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl bounce-kawaii">✉️</div>
              <h2 className="pixel-font text-xs text-[#FF1493]">
                Check your inbox!
              </h2>
              <p className="font-semibold text-gray-600">
                We sent a magic link to{' '}
                <span className="text-[#FF69B4] font-bold">{email}</span>
              </p>
              <p className="text-lg text-[#C084FC] font-bold">(◕‿◕)</p>
              <p className="text-sm text-gray-500 font-semibold">
                Click the link in your email to continue~ ♡
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn-pixel-white btn-pixel text-xs mt-2"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 text-center py-4">
        <p className="text-sm font-semibold text-gray-400">
          Kawaii Couple by Roast Lab AI 🌸
        </p>
      </footer>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF0F5' }}>
        <div className="text-5xl">🌸</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
