'use client'

import { useState } from 'react'

type Props = {
  title: string
  body: string
  shareText: string
  shareUrl: string
  cta?: string
}

export default function ShareCard({ title, body, shareText, shareUrl, cta = 'Share with a friend' }: Props) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  async function handleShare() {
    setError(false)
    const payload = { title: 'Kawaii Couple', text: shareText, url: shareUrl }
    type Nav = Navigator & { share?: (data: ShareData) => Promise<void> }
    const nav = typeof navigator !== 'undefined' ? (navigator as Nav) : null

    if (nav?.share) {
      try {
        await nav.share(payload)
        return
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError(true)
    }
  }

  function shareOnX() {
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(u, '_blank', 'noopener,noreferrer')
  }

  function shareOnWhatsApp() {
    const u = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
    window.open(u, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="card-pixel p-6 text-center">
      <p className="pixel-font text-sm text-[#FF1493] mb-2">{title}</p>
      <p className="text-sm font-semibold text-gray-600 mb-4">{body}</p>
      <button onClick={handleShare} className="btn-pixel w-full mb-3">
        {copied ? 'Link copied ♡' : cta + ' 💕'}
      </button>
      <div className="flex gap-3 justify-center">
        <button onClick={shareOnX} className="btn-pixel btn-pixel-white text-xs py-2 px-4">𝕏 Share</button>
        <button onClick={shareOnWhatsApp} className="btn-pixel btn-pixel-white text-xs py-2 px-4">WhatsApp</button>
      </div>
      {error && <p className="text-xs text-red-400 mt-3 font-semibold">Could not share. Long press the link instead.</p>}
    </div>
  )
}
