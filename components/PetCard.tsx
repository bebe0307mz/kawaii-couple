'use client'

import { Pet, RARITY_COLORS, RARITY_LABELS } from '@/lib/pets'

interface PetCardProps {
  pet: Pet
  isNew?: boolean
  hatchedAt?: string
}

export default function PetCard({ pet, isNew, hatchedAt }: PetCardProps) {
  const rarityColor = RARITY_COLORS[pet.rarity]
  const label = RARITY_LABELS[pet.rarity]

  return (
    <div
      className={`relative rounded-2xl p-4 text-center border-2 ${isNew ? 'bounce-kawaii' : ''}`}
      style={{
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        borderColor: rarityColor,
        boxShadow: pet.rarity === 'legendary' ? `0 0 20px ${rarityColor}80` : `0 2px 8px ${rarityColor}40`,
        minWidth: 120,
        maxWidth: 140,
      }}
    >
      <div className={`bg-gradient-to-br ${pet.bgGradient} rounded-xl p-3 mb-2`}>
        <div style={{ fontSize: 48 }}>{pet.emoji}</div>
      </div>
      <div
        className="pixel-font text-xs mb-1 truncate"
        style={{ color: rarityColor, fontSize: '0.55rem' }}
      >
        {label}
      </div>
      <div className="font-bold text-xs text-gray-700 leading-tight">{pet.name}</div>
      {hatchedAt && (
        <div className="text-xs text-gray-400 mt-1" style={{ fontSize: '0.6rem' }}>
          {new Date(hatchedAt).toLocaleDateString()}
        </div>
      )}
      {isNew && (
        <div
          className="absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: '#FF1493', color: 'white', fontSize: '0.6rem' }}
        >
          NEW!
        </div>
      )}
    </div>
  )
}
