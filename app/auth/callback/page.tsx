'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')

      if (code) {
        // PKCE flow - exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.replace('/auth?error=login_failed')
        } else {
          const hasUsername = data.user?.user_metadata?.username
          router.replace(hasUsername ? '/dashboard' : '/setup')
        }
      } else {
        // Implicit flow - session already set via hash, just check
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const hasUsername = session.user?.user_metadata?.username
          router.replace(hasUsername ? '/dashboard' : '/setup')
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
