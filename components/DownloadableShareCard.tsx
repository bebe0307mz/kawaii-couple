'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  myName: string
  oppName: string
  myScore: number
  oppScore: number
  outcome: 'win' | 'tie' | 'loss'
}

const W = 1080
const H = 1350 // 4:5 portrait, IG-friendly

function drawCard(
  ctx: CanvasRenderingContext2D,
  { myName, oppName, myScore, oppScore, outcome }: Props,
) {
  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#FFE4F0')
  bg.addColorStop(1, '#FFD1E8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Sakura petals (decorative dots)
  ctx.fillStyle = 'rgba(255, 105, 180, 0.15)'
  for (let i = 0; i < 20; i++) {
    const x = (i * 173) % W
    const y = (i * 257) % H
    ctx.beginPath()
    ctx.arc(x, y, 18 + (i % 3) * 8, 0, Math.PI * 2)
    ctx.fill()
  }

  // Card body
  const cardX = 80
  const cardY = 120
  const cardW = W - 160
  const cardH = H - 240
  ctx.shadowColor = 'rgba(255, 20, 147, 0.18)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(cardX, cardY, cardW, cardH)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Card border (pixel style)
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 6
  ctx.strokeRect(cardX, cardY, cardW, cardH)
  ctx.fillStyle = '#FF69B4'
  ctx.fillRect(cardX + 12, cardY + cardH, cardW, 12)
  ctx.fillRect(cardX + cardW, cardY + 12, 12, cardH)

  // Header emoji
  const headerEmoji = outcome === 'win' ? '🏆' : outcome === 'tie' ? '🤝' : '💕'
  ctx.font = '160px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(headerEmoji, W / 2, cardY + 200)

  // Headline
  const headline =
    outcome === 'win'
      ? `${myName} wins! 👑`
      : outcome === 'tie'
      ? "It's a tie ♡"
      : `${oppName} wins today`
  ctx.fillStyle = '#FF1493'
  ctx.font = 'bold 64px system-ui, -apple-system, sans-serif'
  wrapText(ctx, headline, W / 2, cardY + 300, cardW - 80, 72)

  // Subheading
  ctx.fillStyle = '#C084FC'
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.fillText('Kawaii Couple', W / 2, cardY + 400)

  // Score showdown
  const scoreY = cardY + 560
  const myX = cardX + cardW * 0.28
  const oppX = cardX + cardW * 0.72

  ctx.fillStyle = '#FF69B4'
  ctx.font = 'bold 180px system-ui, sans-serif'
  ctx.fillText(String(myScore), myX, scoreY)
  ctx.fillStyle = '#C084FC'
  ctx.fillText(String(oppScore), oppX, scoreY)

  ctx.fillStyle = '#666'
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.fillText(myName, myX, scoreY + 60)
  ctx.fillText(oppName, oppX, scoreY + 60)

  // VS divider
  ctx.fillStyle = '#FF1493'
  ctx.font = 'bold 56px system-ui, sans-serif'
  ctx.fillText('vs', W / 2, scoreY - 30)

  // Hearts row
  ctx.font = '64px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  const hearts = ['💝', '🌸', '✿', '♡', '★', '✿', '🌸', '💝']
  const heartY = cardY + cardH - 200
  hearts.forEach((h, i) => {
    ctx.fillText(h, cardX + 80 + i * ((cardW - 160) / (hearts.length - 1)), heartY)
  })

  // Footer
  ctx.fillStyle = '#FF1493'
  ctx.font = 'bold 40px system-ui, sans-serif'
  ctx.fillText('kawaiicouple.roastlabai.com', W / 2, cardY + cardH - 80)
  ctx.fillStyle = '#999'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText('30 free kawaii couple mini games', W / 2, cardY + cardH - 30)
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i]
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY)
      line = words[i]
      curY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, curY)
}

export default function DownloadableShareCard(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCard(ctx, props)
    setPreviewUrl(canvas.toDataURL('image/png'))
  }, [props])

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `kawaii-couple-${props.outcome}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function handleShareImage() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `kawaii-couple.png`, { type: 'image/png' })
      type NavShare = Navigator & {
        canShare?: (data: ShareData) => boolean
        share?: (data: ShareData) => Promise<void>
      }
      const nav = navigator as NavShare
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: 'Kawaii Couple', text: 'Beat me?' })
          return
        } catch {
          /* user cancelled, fall through to download */
        }
      }
      handleDownload()
    }, 'image/png')
  }

  return (
    <div className="card-pixel p-5 text-center">
      <p className="pixel-font text-sm text-[#FF1493] mb-3">Save your result card ♡</p>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {previewUrl && (
        <div className="mb-4">
          <img
            src={previewUrl}
            alt="Result card preview"
            className="mx-auto rounded shadow-md"
            style={{ maxWidth: 240, border: '3px solid #1a1a1a' }}
          />
        </div>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={handleShareImage} className="btn-pixel text-xs py-2 px-4">
          📲 Share image
        </button>
        <button onClick={handleDownload} className="btn-pixel btn-pixel-lavender text-xs py-2 px-4">
          ⬇️ Download
        </button>
      </div>
    </div>
  )
}
