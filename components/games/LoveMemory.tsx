'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const EMOJIS = ['💝', '💕', '🌸', '🍡', '🦋', '🎀', '🌈', '⭐']

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

interface LoveMemoryProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 180

function shuffleCards(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS]
  const shuffled = pairs.sort(() => Math.random() - 0.5)
  return shuffled.map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }))
}

export default function LoveMemory({ onComplete, playerEmail }: LoveMemoryProps) {
  const [cards, setCards] = useState<Card[]>(() => shuffleCards())
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [startTime] = useState(Date.now())
  const gameOverRef = useRef(false)
  const matchedRef = useRef(0)

  const handleComplete = useCallback(
    (pairs: number) => {
      if (gameOverRef.current) return
      gameOverRef.current = true
      setGameOver(true)
      onComplete(pairs)
    },
    [onComplete]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleComplete(matchedRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [handleComplete])

  function handleFlip(id: number) {
    if (gameOver) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.flipped || card.matched) return
    if (flipped.length >= 2) return

    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    )

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [first, second] = newFlipped
      const c1 = cards.find((c) => c.id === first)!
      const c2 = cards.find((c) => c.id === second)!

      if (c1.emoji === c2.emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second
                ? { ...c, matched: true, flipped: true }
                : c
            )
          )
          const newMatched = matched + 1
          matchedRef.current = newMatched
          setMatched(newMatched)
          setFlipped([])
          if (newMatched === EMOJIS.length) {
            const elapsed = (Date.now() - startTime) / 1000
            const timeBonus = Math.max(0, Math.floor((GAME_DURATION - elapsed) / 10))
            handleComplete(EMOJIS.length + timeBonus)
          }
        }, 400)
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second
                ? { ...c, flipped: false }
                : c
            )
          )
          setFlipped([])
        }, 900)
      }
    }
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Love Memory 🃏</div>
          <div className="font-bold text-sm text-[#FF69B4]">
            {matched}/{EMOJIS.length} pairs - {moves} moves
          </div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-base text-[#FF1493]">
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="progress-pixel mx-4 mb-3">
        <div
          className="progress-fill"
          style={{ width: `${(matched / EMOJIS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-start justify-center px-2 pt-2 pb-4 overflow-auto">
        {gameOver && matched < EMOJIS.length ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🃏</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-2xl text-[#FF69B4]">{matched} pairs</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : matched === EMOJIS.length ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Complete!</div>
            <div className="font-bold text-2xl text-[#FF69B4]">All pairs found!</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <div
            className="grid gap-2 w-full"
            style={{ gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: 400 }}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                className={`memory-card aspect-square relative ${card.flipped || card.matched ? 'flipped' : ''}`}
                disabled={card.matched || card.flipped}
              >
                <div className="memory-card-inner">
                  {/* Front face - hidden */}
                  <div className="memory-card-front card-pixel rounded text-2xl cursor-pointer hover:bg-pink-50">
                    <span className="text-[#FF69B4]">✿</span>
                  </div>
                  {/* Back face - emoji */}
                  <div
                    className={`memory-card-back rounded text-2xl border-3 border-black ${
                      card.matched
                        ? 'bg-pink-100 border-[#FF69B4]'
                        : 'bg-white border-black'
                    }`}
                    style={{
                      border: `3px solid ${card.matched ? '#FF69B4' : '#1a1a1a'}`,
                    }}
                  >
                    {card.emoji}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
