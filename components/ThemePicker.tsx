'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { THEMES, FREE_THEME_ID } from '@/lib/themes'
import { useTheme } from '@/lib/ThemeContext'
import { supabase } from '@/lib/supabase'

export default function ThemePicker() {
  const { theme: activeTheme, setThemeId, hasThemePack, setHasThemePack } = useTheme()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleBuy() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/theme/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, userEmail: user?.email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function handleSelect(themeId: string) {
    if (themeId !== FREE_THEME_ID && !hasThemePack) return
    setThemeId(themeId)
  }

  return (
    <div className="card-pixel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="pixel-font text-xs text-[#FF1493]">🎨 Themes</h2>
        {!hasThemePack && (
          <span className="text-xs font-bold text-[#C084FC] bg-purple-50 px-2 py-1 rounded-full">
            $3.99 to unlock all ✨
          </span>
        )}
        {hasThemePack && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            ✓ All unlocked
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {THEMES.map((t) => {
          const isLocked = t.id !== FREE_THEME_ID && !hasThemePack
          const isActive = activeTheme.id === t.id
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="relative flex flex-col items-center gap-1"
              title={t.name}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: t.preview,
                  border: isActive ? '3px solid #FF1493' : '2px solid #e5e7eb',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  opacity: isLocked ? 0.5 : 1,
                  boxShadow: isActive ? '0 0 12px rgba(255,20,147,0.4)' : 'none',
                }}
              >
                {t.emoji}
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}>🔒</div>
                )}
              </div>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: isActive ? '#FF1493' : '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>
                {t.name.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>

      {!hasThemePack && (
        <div className="text-center">
          <p className="text-xs text-gray-500 font-semibold mb-3">
            5 kawaii themes - yours forever for just $3.99 ✨
          </p>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="btn-pixel w-full"
            style={{ background: '#FF1493' }}
          >
            {loading ? 'Loading~ ♡' : '🎨 Unlock All Themes - $3.99'}
          </button>
        </div>
      )}

      {hasThemePack && (
        <p className="text-xs text-center text-gray-400 font-semibold">
          Tap any theme to switch ✿
        </p>
      )}
    </div>
  )
}
