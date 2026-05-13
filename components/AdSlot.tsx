'use client'

import { useEffect } from 'react'

interface AdSlotProps {
  slot?: string
  className?: string
  height?: string
}

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID

export default function AdSlot({
  slot = '',
  className = '',
  height = 'h-24',
}: AdSlotProps) {
  useEffect(() => {
    if (!PUB_ID) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle.push({})
    } catch {
      // suppress
    }
  }, [])

  if (!PUB_ID) {
    return (
      <div
        className={`w-full ${height} bg-pink-50 border-2 border-dashed border-pink-200 rounded flex items-center justify-center text-pink-300 text-sm font-semibold ${className}`}
      >
        Advertisement
      </div>
    )
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={PUB_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
