'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SakuraPetals from '@/components/SakuraPetals'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (err) {
      setError(err.message)
    } else {
      setSent(true)
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
                disabled={loading}
                className="btn-pixel w-full mt-2"
              >
                {loading ? 'Sending ♡...' : '✉️ Send Magic Link'}
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
