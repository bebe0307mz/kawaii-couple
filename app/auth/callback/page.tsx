'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

function notifySignupIfNew(user: User | null | undefined) {
  if (!user?.email || !user?.id) return
  if (sessionStorage.getItem('signup_notified')) return
  sessionStorage.setItem('signup_notified', '1')
  fetch('/api/notify-signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, userId: user.id }),
  }).catch(() => {})
}

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const joinCode = searchParams.get('joinCode') || sessionStorage.getItem('pendingJoinCode') || ''
      const dashboardUrl = joinCode ? `/dashboard?code=${joinCode}` : '/dashboard'

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.replace('/auth?error=login_failed')
        } else {
          notifySignupIfNew(data.user)
          const hasUsername = data.user?.user_metadata?.username
          if (hasUsername) {
            if (joinCode) sessionStorage.removeItem('pendingJoinCode')
            router.replace(dashboardUrl)
          } else {
            // New user - keep pendingJoinCode in sessionStorage so /setup can forward it
            router.replace('/setup')
          }
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          notifySignupIfNew(session.user)
          const hasUsername = session.user?.user_metadata?.username
          if (hasUsername) {
            if (joinCode) sessionStorage.removeItem('pendingJoinCode')
            router.replace(dashboardUrl)
          } else {
            router.replace('/setup')
          }
        } else {
          router.replace('/auth')
        }
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF0F5' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">🌸</div>
        <p className="font-bold text-[#FF69B4] text-lg">Logging you in~ ♡</p>
        <p className="text-gray-400 text-sm mt-2">(◕‿◕)✿</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF0F5' }}>
        <div className="text-5xl">🌸</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
