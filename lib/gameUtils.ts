export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function calcWinner(player1Score: number, player2Score: number): 'player1' | 'player2' | 'tie' {
  if (player1Score > player2Score) return 'player1'
  if (player2Score > player1Score) return 'player2'
  return 'tie'
}

export const GAME_NAMES = [
  'Heart Tap',
  'Love Memory',
  'Reflex Duel',
  'Word Scramble',
  'Kawaii Quiz',
  'Target Pop',
  'Math Race',
  'Color Stroop',
  'Sakura Catch',
  'Emoji Decode',
  'Simon Says',
  'Type Race',
  'Rock Paper Sakura',
  'Star Catcher',
  'Number Rush',
  'Koi Catch',
  'Balloon Pop',
  'Sushi Swipe',
  'Lucky Spin',
  'Lightning Tile',
  'Bell Race',
  'Cat Whack',
  'Dango Stack',
  'Mochi Smash',
  'Dart Toss',
  'Odd One Out',
  'Number Sequence',
  'Color Match',
  'Slide Puzzle',
  'Quick Count',
]

export const GAME_EMOJIS = [
  '💝', '🃏', '⚡', '🔤', '🧠', '🎯', '🔢', '🎨', '🌸', '💬', '🎵', '⌨️', '✂️', '🌟', '🔢',
  '🐟', '🎈', '🥢', '🎰', '⚡', '🔔', '🐾', '🍡', '🪅', '🎯', '🃏', '🔢', '🎨', '🧩', '📊',
]

export function selectGamesForSession(code: string): number[] {
  // Seeded from code so both players get same 5 games
  let seed = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const games = Array.from({ length: 30 }, (_, i) => i)
  for (let i = games.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(seed) % (i + 1)
    ;[games[i], games[j]] = [games[j], games[i]]
  }
  return games.slice(0, 5)
}

export const KAWAII_WORDS = [
  'LOVE', 'CUTE', 'HEART', 'KITTY', 'PUPPY',
  'BUNNY', 'HONEY', 'TEDDY', 'CLOUD', 'SMILE',
  'ANGEL', 'HAPPY', 'SWEET', 'SUGAR', 'DAISY',
]

export function scrambleWord(word: string): string {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  const scrambled = arr.join('')
  if (scrambled === word && word.length > 1) {
    return scrambleWord(word)
  }
  return scrambled
}

export const QUIZ_QUESTIONS = [
  {
    question: "What does 'kawaii' mean in Japanese?",
    options: ['Cute', 'Happy', 'Love', 'Pretty'],
    answer: 0,
  },
  {
    question: "Which flower is Japan's national flower?",
    options: ['Rose', 'Lily', 'Sakura', 'Lotus'],
    answer: 2,
  },
  {
    question: "What is 'mochi'?",
    options: ['A dance', 'A rice cake', 'A song', 'A game'],
    answer: 1,
  },
  {
    question: "What does 'senpai' mean?",
    options: ['Student', 'Teacher', 'Upperclassman', 'Friend'],
    answer: 2,
  },
  {
    question: 'Valentine\'s Day in Japan - who gives chocolate?',
    options: ['Boys', 'Girls', 'Both', 'Parents'],
    answer: 1,
  },
  {
    question: "What is 'bento'?",
    options: ['A greeting', 'A packed lunch', 'A festival', 'A flower'],
    answer: 1,
  },
  {
    question: 'Hanami is the tradition of viewing which flower?',
    options: ['Rose', 'Tulip', 'Sakura', 'Sunflower'],
    answer: 2,
  },
  {
    question: "What does 'arigatou' mean?",
    options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
    answer: 2,
  },
  {
    question: 'What is the Japanese word for love?',
    options: ['Ai', 'Ki', 'Mi', 'Hi'],
    answer: 0,
  },
  {
    question: "What is 'matcha'?",
    options: ['A game', 'A dance', 'Green tea powder', 'A festival'],
    answer: 2,
  },
]
