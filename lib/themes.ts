export interface Theme {
  id: string
  name: string
  emoji: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    bg: string
    bgGradient: string
    cardBg: string
    text: string
  }
  confetti: string[]
  preview: string // CSS gradient for preview card
}

export const THEMES: Theme[] = [
  {
    id: 'sakura',
    name: 'Sakura Garden',
    emoji: '🌸',
    description: 'Soft pink petals and dreamy blossoms',
    colors: {
      primary: '#FF1493',
      secondary: '#FF69B4',
      accent: '#C084FC',
      bg: '#FFF0F5',
      bgGradient: 'linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)',
      cardBg: '#ffffff',
      text: '#1a1a1a',
    },
    confetti: ['#FF69B4', '#FF1493', '#FFB6C1', '#E6CCFF', '#C084FC'],
    preview: 'linear-gradient(135deg, #FFB6C1, #E6CCFF)',
  },
  {
    id: 'midnight',
    name: 'Midnight Romance',
    emoji: '🌙',
    description: 'Stars and moonlight for night owls',
    colors: {
      primary: '#C084FC',
      secondary: '#A855F7',
      accent: '#FF69B4',
      bg: '#0f0a1e',
      bgGradient: 'linear-gradient(135deg, #0f0a1e 0%, #1a1040 100%)',
      cardBg: '#1e1535',
      text: '#f0e6ff',
    },
    confetti: ['#C084FC', '#A855F7', '#7C3AED', '#FF69B4', '#FFD700'],
    preview: 'linear-gradient(135deg, #1a1040, #4a1d96)',
  },
  {
    id: 'arcade',
    name: 'Retro Arcade',
    emoji: '🎮',
    description: '8-bit neon vibes and pixel energy',
    colors: {
      primary: '#00FF88',
      secondary: '#00CC66',
      accent: '#FF0088',
      bg: '#0a0a0a',
      bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #001a0a 100%)',
      cardBg: '#111111',
      text: '#00FF88',
    },
    confetti: ['#00FF88', '#FF0088', '#00CCFF', '#FFD700', '#FF6600'],
    preview: 'linear-gradient(135deg, #001a0a, #003300)',
  },
  {
    id: 'winter',
    name: 'Winter Wonderland',
    emoji: '❄️',
    description: 'Icy blue magic and snowflake dreams',
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#BAE6FD',
      bg: '#f0f9ff',
      bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      cardBg: '#ffffff',
      text: '#0c4a6e',
    },
    confetti: ['#0EA5E9', '#38BDF8', '#BAE6FD', '#ffffff', '#7DD3FC'],
    preview: 'linear-gradient(135deg, #bae6fd, #0284c7)',
  },
  {
    id: 'strawberry',
    name: 'Strawberry Pop',
    emoji: '🍓',
    description: 'Sweet, bubbly and full of energy',
    colors: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FCA5A5',
      bg: '#FFF5F5',
      bgGradient: 'linear-gradient(135deg, #FFF5F5 0%, #FEE2E2 100%)',
      cardBg: '#ffffff',
      text: '#7f1d1d',
    },
    confetti: ['#EF4444', '#F87171', '#FCA5A5', '#FF69B4', '#FFD700'],
    preview: 'linear-gradient(135deg, #fca5a5, #dc2626)',
  },
]

export const FREE_THEME_ID = 'sakura'
export const THEME_PRICE = 3.99
export const THEME_PRICE_CENTS = 399
