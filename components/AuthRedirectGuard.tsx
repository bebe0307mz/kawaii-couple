'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Magic-link emails sometimes land on '/' because the Supabase project's
// Site URL is set to the root. When that happens, the URL carries a Supabase
// auth code (PKCE) as ?code=... or tokens in #access_token=. Catch either
// and forward to /auth/callback so the existing handler can complete sign-in.
export default function AuthRedirectGuard() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const search = window.location.search
    const hash = window.location.hash

    const params = new URLSearchParams(search)
    const code = params.get('code')
    const hasImplicitToken = hash.includes('access_token=') || hash.includes('refresh_token=')

    // Supabase PKCE codes are long (UUID-ish). Game codes in this app are 6
    // chars uppercase. Guard against false positives by only forwarding when
    // it doesn't look like a game code.
    const looksLikeSupabaseCode = code && code.length > 10

    if (looksLikeSupabaseCode || hasImplicitToken) {
      const target = looksLikeSupabaseCode
        ? `/auth/callback?code=${encodeURIComponent(code!)}`
        : `/auth/callback${hash}`
      router.replace(target)
    }
  }, [router])

  return null
}
