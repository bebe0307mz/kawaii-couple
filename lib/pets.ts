export interface Pet {
  id: number
  name: string
  emoji: string
  color: string
  bgGradient: string
  rarity: 'common' | 'rare' | 'legendary'
  description: string
}

export const PETS: Pet[] = [
  { id: 1, name: 'Cherry Blossom Cat', emoji: '🐱', color: '#FF69B4', bgGradient: 'from-pink-100 to-rose-100', rarity: 'common', description: 'Loves napping under cherry trees~' },
  { id: 2, name: 'Sakura Bunny', emoji: '🐰', color: '#FFB6C1', bgGradient: 'from-pink-50 to-pink-100', rarity: 'common', description: 'Hops through sakura petals all day~' },
  { id: 3, name: 'Honey Bear', emoji: '🐻', color: '#FFD700', bgGradient: 'from-yellow-50 to-amber-100', rarity: 'common', description: 'Sweet as honey, warm as sunshine~' },
  { id: 4, name: 'Moon Fox', emoji: '🦊', color: '#FF8C00', bgGradient: 'from-orange-50 to-amber-100', rarity: 'common', description: 'Dances with moonbeams at night~' },
  { id: 5, name: 'Bamboo Panda', emoji: '🐼', color: '#90EE90', bgGradient: 'from-green-50 to-emerald-100', rarity: 'rare', description: 'Peaceful guardian of the bamboo grove~' },
  { id: 6, name: 'Dream Butterfly', emoji: '🦋', color: '#9B59B6', bgGradient: 'from-purple-50 to-violet-100', rarity: 'rare', description: 'Carries sweet dreams on its wings~' },
  { id: 7, name: 'Petal Spirit', emoji: '🌸', color: '#FF1493', bgGradient: 'from-rose-50 to-pink-100', rarity: 'rare', description: 'Born from a thousand falling petals~' },
  { id: 8, name: 'Star Pup', emoji: '🐶', color: '#FFD700', bgGradient: 'from-yellow-50 to-yellow-100', rarity: 'rare', description: 'Wishes upon stars every night~' },
  { id: 9, name: 'Night Owl', emoji: '🦉', color: '#7B68EE', bgGradient: 'from-indigo-50 to-purple-100', rarity: 'rare', description: 'Keeper of moonlit secrets~' },
  { id: 10, name: 'Rainbow Unicorn', emoji: '🦄', color: '#FF69B4', bgGradient: 'from-pink-100 via-purple-50 to-blue-100', rarity: 'legendary', description: 'The rarest of all - a blessing upon your love~ ✨' },
]

export const RARITY_WEIGHTS = [20, 20, 20, 20, 7, 7, 7, 7, 7, 5] // pet_id 1-10, adds to 120 but we use cumulative

export function getRandomPet(): Pet {
  const weights = RARITY_WEIGHTS
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return PETS[i]
  }
  return PETS[0]
}

export const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#C084FC',
  legendary: '#FFD700',
}

export const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  legendary: '✨ Legendary',
}

export const EGG_COIN_COST = 15  // 3 days × 5 coins/day
export const COINS_PER_SESSION = 5
