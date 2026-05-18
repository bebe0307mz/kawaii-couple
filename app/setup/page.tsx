'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SakuraPetals from '@/components/SakuraPetals'

export default function SetupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  function nextRouteAfterSetup() {
    if (typeof window === 'undefined') return '/dashboard'
    const joinCode = sessionStorage.getItem('pendingJoinCode')
    if (joinCode) {
      sessionStorage.removeItem('pendingJoinCode')
      return `/dashboard?code=${joinCode}`
    }
    return '/dashboard'
  }

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }
      // Already has username, skip setup (preserve pending joinCode if any)
      if (user.user_metadata?.username) {
        router.replace(nextRouteAfterSetup())
        return
      }
      setChecking(false)
    }
    checkAuth()
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    setUsername(val)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.length < 3) {
      setError('At least 3 characters~ ♡')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({
      data: { username },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.replace(nextRouteAfterSetup())
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF0F5' }}>
        <div className="text-5xl">🌸</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <SakuraPetals />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        <div className="card-pixel p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="pixel-font text-sm text-[#FF1493] mb-2">
            Pick Your Name!
          </h1>
          <p className="font-semibold text-[#C084FC] mb-2 text-lg">(◕‿◕)✿</p>
          <p className="text-sm font-semibold text-gray-500 mb-6">
            3-10 characters - this is how your babe sees you in game~ ♡
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={handleChange}
                placeholder="MOMO"
                maxLength={10}
                autoFocus
                className="input-pixel w-full text-center tracking-widest text-xl uppercase"
                style={{ letterSpacing: '0.3em' }}
              />
              <div className="flex justify-between mt-1 px-1">
                <span className="text-xs text-gray-400 font-semibold">A-Z, 0-9 only</span>
                <span className={`text-xs font-bold ${username.length === 10 ? 'text-[#FF1493]' : 'text-gray-400'}`}>
                  {username.length}/10
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 p-3 text-red-600 text-sm font-bold rounded">
                {error}
              </div>
            )}

            {username.length >= 3 && (
              <div className="card-pixel p-3 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1">Preview</p>
                <p className="pixel-font text-base text-[#FF1493]">{username}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">that's you~ ♡</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || username.length < 3}
              className="btn-pixel w-full mt-2"
            >
              {loading ? 'Saving ♡...' : "Let's Go! 🌸"}
            </button>
          </form>
        </div>
      </div>

      <footer className="relative z-10 text-center py-4">
        <p className="text-sm font-semibold text-gray-400">Kawaii Couple by Roast Lab AI 🌸</p>
      </footer>
    </div>
  )
}
