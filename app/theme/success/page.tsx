'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SakuraPetals from '@/components/SakuraPetals'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Mark theme pack as purchased in localStorage
    localStorage.setItem('kawaii_theme_pack', 'true')
    // Redirect to dashboard after 4s
    const t = setTimeout(() => router.push('/dashboard'), 4000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <SakuraPetals />
      <div className="relative z-10">
        <div className="text-7xl mb-6 bounce-kawaii">🎨</div>
        <h1 className="pixel-font text-sm text-[#FF1493] mb-4">Theme Pack Unlocked!</h1>
        <p className="font-bold text-xl text-[#C084FC] mb-2">Thank you, bestie~ ♡</p>
        <p className="font-semibold text-gray-500 mb-8">
          All 5 themes are now yours forever 🌸<br/>
          Pick your favourite in the dashboard!
        </p>
        <Link href="/dashboard" className="btn-pixel">
          Go pick a theme 🌙
        </Link>
        <p className="text-xs text-gray-400 mt-4">Redirecting automatically in 4s...</p>
      </div>
    </div>
  )
}

export default function ThemeSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-5xl">🌸</div></div>}>
      <SuccessContent />
    </Suspense>
  )
}
