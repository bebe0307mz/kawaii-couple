'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SakuraPetals from '@/components/SakuraPetals'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [partnerCode, setPartnerCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }
      // Redirect to setup if no username yet
      if (!user.user_metadata?.username) {
        router.replace('/setup')
        return
      }
      setUser(user)
      setLoading(false)
    }
    loadUser()
  }, [router])

  async function handleCreateSession() {
    if (!user) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1_id: user.id,
          player1_email: user.email,
          player1_username: user.user_metadata?.username || user.email?.split('@')[0],
        }),
      })
      const data = await res.json()
      if (data.session) {
        setInviteCode(data.session.code)
      } else {
        setError(data.error || 'Failed to create session')
      }
    } catch {
      setError('Failed to create session')
    }
    setCreating(false)
  }

  async function handleCopyCode() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleJoinSession() {
    if (!user || !partnerCode.trim()) return
    const code = partnerCode.trim().toUpperCase()
    setJoining(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${code}`)
      const data = await res.json()

      if (!data.session) {
        setError('Session not found! Check the code~ ♡')
        setJoining(false)
        return
      }

      const session = data.session
      if (session.status !== 'waiting') {
        setError('This game already started~ (◕_◕)')
        setJoining(false)
        return
      }

      if (session.player1_id === user.id) {
        router.push(`/lobby/${code}`)
        return
      }

      const patchRes = await fetch(`/api/sessions/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player2_id: user.id,
          player2_email: user.email,
          player2_username: user.user_metadata?.username || user.email?.split('@')[0],
          status: 'playing',
        }),
      })

      if (patchRes.ok) {
        router.push(`/lobby/${code}`)
      } else {
        setError('Failed to join session')
      }
    } catch {
      setError('Failed to join session')
    }
    setJoining(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

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

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">Kawaii Couple</Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#FF69B4] hidden sm:block pixel-font">{user?.user_metadata?.username}</span>
          <button onClick={handleSignOut} className="btn-pixel btn-pixel-white text-xs py-2 px-3">
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-4 py-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌸</div>
          <h1 className="pixel-font text-sm md:text-base text-[#FF1493] mb-2">
            Hello, {user?.user_metadata?.username}~ ♡
          </h1>
          <p className="font-semibold text-[#C084FC]">(◕‿◕)✿ Ready to play?</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 p-3 text-red-600 text-sm font-bold rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Create new game */}
        <div className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-4">Create a Game ✿</h2>

          {!inviteCode ? (
            <div className="text-center">
              <p className="font-semibold text-gray-600 mb-4">
                Generate an invite code and share it with your babe~ ♡
              </p>
              <button
                onClick={handleCreateSession}
                disabled={creating}
                className="btn-pixel"
              >
                {creating ? 'Creating ♡...' : '🌸 Create Game'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-semibold text-gray-600 mb-3">Your Invite Code ♡</p>
              <div className="card-pixel p-6 mb-4 inline-block">
                <div className="pixel-font text-2xl md:text-3xl text-[#FF1493] tracking-widest">
                  {inviteCode}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={handleCopyCode} className="btn-pixel">
                  {copied ? '✓ Copied!' : '💝 Copy Code'}
                </button>
                <Link href={`/lobby/${inviteCode}`} className="btn-pixel btn-pixel-lavender">
                  Go to Lobby 🌸
                </Link>
              </div>
              <p className="text-sm text-gray-500 font-semibold mt-3">
                Share this code with your partner~ ♡
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-0.5 bg-pink-200"></div>
          <span className="text-[#FF69B4] font-bold">- OR -</span>
          <div className="flex-1 h-0.5 bg-pink-200"></div>
        </div>

        {/* Join game */}
        <div className="card-pixel-lavender p-6">
          <h2 className="pixel-font text-xs text-[#C084FC] mb-4">Join a Game ♡</h2>
          <p className="font-semibold text-gray-600 mb-4">
            Got a code from your babe? Enter it here~ (◡‿◡✿)
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. MOMO42)"
              maxLength={6}
              className="input-pixel flex-1 uppercase tracking-widest"
            />
            <button
              onClick={handleJoinSession}
              disabled={joining || !partnerCode.trim()}
              className="btn-pixel btn-pixel-lavender whitespace-nowrap"
            >
              {joining ? 'Joining...' : 'Join Game 🌸'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
