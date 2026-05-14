'use client'

import { useEffect, useState } from 'react'

type Props = { userId: string }

type StreakData = {
  current_streak: number
  longest_streak: number
  last_played_date: string | null
  played_today: boolean
}

export default function StreakCounter({ userId }: Props) {
  const [data, setData] = useState<StreakData | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch(`/api/streak?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) return
      const d = await res.json()
      if (!cancelled) setData(d)
    }
    load()
    return () => { cancelled = true }
  }, [userId])

  if (!data) return null

  const streak = data.current_streak
  const playedToday = data.played_today

  return (
    <div className="card-pixel p-4 mb-6 flex items-center gap-4">
      <div className="text-4xl shrink-0">
        {streak >= 7 ? '🔥' : '💖'}
      </div>
      <div className="flex-1">
        <div className="pixel-font text-xs text-[#FF1493] mb-1">
          {streak === 0 ? 'No streak yet' : `${streak}-day heart streak`}
        </div>
        <p className="text-xs font-semibold text-gray-500">
          {streak === 0
            ? 'Play one game today to start your streak~ ♡'
            : playedToday
            ? `Locked in for today ♡ keep it going tomorrow!`
            : 'Play a game today or lose your streak!'}
        </p>
      </div>
      {data.longest_streak > streak && data.longest_streak > 0 && (
        <div className="text-right shrink-0">
          <div className="pixel-font text-xs text-[#C084FC]">best</div>
          <div className="font-bold text-base text-[#FF69B4]">{data.longest_streak}</div>
        </div>
      )}
    </div>
  )
}
