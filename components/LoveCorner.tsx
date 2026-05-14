'use client'

import { useState, useEffect, useCallback } from 'react'
import PetCard from './PetCard'
import { EGG_COIN_COST, type Pet } from '@/lib/pets'

interface LoveCornerProps {
  userId: string
}

interface LoveData {
  coins: number
  streak_days: number
  egg_ready: boolean
}

interface UserPet extends Pet {
  hatched_at: string
  recordId: string
}

export default function LoveCorner({ userId }: LoveCornerProps) {
  const [loveData, setLoveData] = useState<LoveData>({ coins: 0, streak_days: 0, egg_ready: false })
  const [pets, setPets] = useState<UserPet[]>([])
  const [hatching, setHatching] = useState(false)
  const [newPet, setNewPet] = useState<Pet | null>(null)
  const [showCollection, setShowCollection] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/love/data?userId=${userId}`)
    const data = await res.json()
    setLoveData(data.loveData)
    setPets(data.pets || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { loadData() }, [loadData])

  async function hatchEgg() {
    if (hatching || !loveData.egg_ready) return
    setHatching(true)
    const res = await fetch('/api/love/hatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (data.pet) {
      setNewPet(data.pet)
      setLoveData((prev) => ({ ...prev, coins: data.newCoins, egg_ready: data.newCoins >= EGG_COIN_COST }))
      await loadData()
    }
    setHatching(false)
  }

  const progress = Math.min(100, (loveData.coins / EGG_COIN_COST) * 100)
  const daysLeft = Math.max(0, 3 - loveData.streak_days)

  if (loading) return null

  return (
    <div className="card-pixel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="pixel-font text-xs text-[#FF1493] mb-1">Love Corner 🥚</h2>
          <div className="flex items-center gap-2">
            <span className="text-lg">🪙</span>
            <span className="font-bold text-xl text-[#FF69B4]">{loveData.coins}</span>
            <span className="text-xs text-gray-500 font-semibold">/ {EGG_COIN_COST} coins</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl">🔥</div>
          <div className="pixel-font text-xs text-[#FF1493]">{loveData.streak_days} day{loveData.streak_days !== 1 ? 's' : ''}</div>
          <div className="text-xs text-gray-400 font-semibold">streak</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-pixel mb-3">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {loveData.egg_ready ? (
        <div className="text-center">
          {newPet ? (
            <div className="flex flex-col items-center gap-3">
              <p className="pixel-font text-xs text-[#FF1493]">You hatched!</p>
              <div className="flex justify-center">
                <PetCard pet={newPet} isNew />
              </div>
              <button
                onClick={() => setNewPet(null)}
                className="btn-pixel text-xs"
              >
                Yay! ♡
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="text-6xl cursor-pointer bounce-kawaii"
                onClick={hatchEgg}
                style={{ filter: 'drop-shadow(0 0 12px #FF69B4)' }}
              >
                🥚
              </div>
              <p className="text-xs font-bold text-[#FF1493]">Your egg is ready!</p>
              <button
                onClick={hatchEgg}
                disabled={hatching}
                className="btn-pixel"
              >
                {hatching ? 'Hatching~ ♡' : '✨ Hatch Now!'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-500">
            {daysLeft > 0
              ? `Play ${daysLeft} more day${daysLeft !== 1 ? 's' : ''} in a row to hatch your egg~ 🥚`
              : `${EGG_COIN_COST - loveData.coins} coins to go!`}
          </p>
        </div>
      )}

      {/* Collection */}
      {pets.length > 0 && (
        <div className="mt-4 border-t border-pink-100 pt-4">
          <button
            onClick={() => setShowCollection(!showCollection)}
            className="w-full text-left flex items-center justify-between"
          >
            <span className="pixel-font text-xs text-[#FF1493]">
              Your Pets ({pets.length}/10) ✿
            </span>
            <span className="text-xs text-gray-400">{showCollection ? '▲' : '▼'}</span>
          </button>
          {showCollection && (
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {pets.map((pet) => (
                <PetCard key={pet.recordId} pet={pet} hatchedAt={pet.hatched_at} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
