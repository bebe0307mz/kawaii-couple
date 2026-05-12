'use client'

import { useEffect, useState } from 'react'

interface Petal {
  id: number
  left: string
  animationDuration: string
  animationDelay: string
  emoji: string
  size: string
}

export default function SakuraPetals() {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const emojis = ['🌸', '✿', '🌺', '🌷', '✾']
    const generated: Petal[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${6 + Math.random() * 8}s`,
      animationDelay: `${Math.random() * 10}s`,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: `${0.8 + Math.random() * 0.8}rem`,
    }))
    setPetals(generated)
  }, [])

  return (
    <div className="sakura-container">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="sakura-petal"
          style={{
            left: petal.left,
            animationDuration: petal.animationDuration,
            animationDelay: petal.animationDelay,
            fontSize: petal.size,
          }}
        >
          {petal.emoji}
        </span>
      ))}
    </div>
  )
}
