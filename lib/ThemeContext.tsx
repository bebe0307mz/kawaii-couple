'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { THEMES, FREE_THEME_ID, type Theme } from './themes'

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

  useEffect(() => {
    const saved = localStorage.getItem('kawaii_theme')
    const hasPack = localStorage.getItem('kawaii_theme_pack') === 'true'
    if (saved && hasPack) setThemeIdState(saved)
    setHasThemePack(hasPack)
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
