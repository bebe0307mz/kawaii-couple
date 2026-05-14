'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { THEMES, FREE_THEME_ID, type Theme } from './themes'
import { supabase } from './supabase'

interface ThemeContextValue {
  theme: Theme
  setThemeId: (id: string) => void
  hasThemePack: boolean
  setHasThemePack: (v: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[0],
  setThemeId: () => {},
  hasThemePack: false,
  setHasThemePack: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(FREE_THEME_ID)
  const [hasThemePack, setHasThemePack] = useState(false)

  // Load picked theme + local cache of pack status (fast UI)
  useEffect(() => {
    const saved = localStorage.getItem('kawaii_theme')
    const localPack = localStorage.getItem('kawaii_theme_pack') === 'true'
    if (saved) setThemeIdState(saved)
    if (localPack) setHasThemePack(true)
  }, [])

  // Authoritative source: Supabase user_metadata.theme_pack (set by Stripe webhook).
  // This lets the unlock survive a different browser, incognito, fresh device, etc.
  useEffect(() => {
    let cancelled = false

    async function syncFromUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      const remotePack = user?.user_metadata?.theme_pack === true
      if (remotePack) {
        setHasThemePack(true)
        localStorage.setItem('kawaii_theme_pack', 'true')
      }
    }
    syncFromUser()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      syncFromUser()
    })
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  function setThemeId(id: string) {
    setThemeIdState(id)
    localStorage.setItem('kawaii_theme', id)
  }

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0]

  return (
    <ThemeContext.Provider value={{ theme, setThemeId, hasThemePack, setHasThemePack }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
