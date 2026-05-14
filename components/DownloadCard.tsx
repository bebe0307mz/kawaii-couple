'use client'

import { useRef, useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface DownloadCardProps {
  player1Name: string
  player2Name: string
  player1Score: number
  player2Score: number
  isWinner: boolean
  isTie: boolean
}

export default function DownloadCard({ player1Name, player2Name, player1Score, player2Score, isWinner, isTie }: DownloadCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { theme } = useTheme()

  // Redraw preview whenever theme changes
  useEffect(() => {
    if (!showPreview || !previewRef.current) return
    drawOnCanvas(previewRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, showPreview])

  function drawOnCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 800, H = 450
    canvas.width = W
    canvas.height = H

    // Background gradient from the active theme
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, theme.colors.bg)
    grad.addColorStop(0.5, theme.colors.cardBg)
    grad.addColorStop(1, theme.colors.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Border using theme palette
    ctx.strokeStyle = theme.colors.primary
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, W - 20, H - 20)
    ctx.strokeStyle = theme.colors.accent
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, W - 40, H - 40)

    // Confetti decoration top + bottom rows using theme's confetti palette
    const dots = theme.confetti
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = dots[i % dots.length]
      ctx.beginPath()
      ctx.arc(50 + i * 75, 50, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(50 + i * 75, H - 65, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    // Theme badge top-right (emoji + theme name)
    ctx.textAlign = 'right'
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = theme.colors.primary
    ctx.fillText(`${theme.emoji} ${theme.name}`, W - 40, 50)

    // Title
    ctx.textAlign = 'center'
    ctx.font = 'bold 16px "Courier New", monospace'
    ctx.fillStyle = theme.colors.primary
    ctx.fillText('KAWAII COUPLE', W / 2, 90)

    // Big emoji
    ctx.font = '64px serif'
    ctx.fillText(isTie ? '🤝' : isWinner ? '🏆' : '💕', W / 2, 175)

    // Result text
    ctx.font = 'bold 28px "Courier New", monospace'
    ctx.fillStyle = theme.colors.primary
    const resultText = isTie ? "It's a Tie!" : isWinner ? `${player1Name} Wins!` : `${player2Name} Wins!`
    ctx.fillText(resultText, W / 2, 220)

    // Score line
    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = theme.colors.accent
    ctx.fillText(`${player1Name}  ${player1Score} vs ${player2Score}  ${player2Name}`, W / 2, 265)

    // Big score numbers in the two theme colors
    ctx.font = 'bold 72px "Courier New", monospace'
    ctx.fillStyle = theme.colors.secondary
    ctx.fillText(`${player1Score}`, W / 2 - 80, 360)
    ctx.fillStyle = theme.colors.text
    ctx.font = 'bold 40px Arial'
    ctx.fillText('vs', W / 2, 348)
    ctx.fillStyle = theme.colors.accent
    ctx.font = 'bold 72px "Courier New", monospace'
    ctx.fillText(`${player2Score}`, W / 2 + 80, 360)

    // Footer
    ctx.font = '14px Arial'
    ctx.fillStyle = theme.colors.primary
    ctx.fillText('kawaiicouple.roastlabai.com', W / 2, H - 45)

    ctx.font = '12px Arial'
    ctx.fillStyle = theme.colors.accent
    ctx.fillText('Play cute games with your boo~ ♡', W / 2, H - 25)
  }

  function drawCard() {
    if (canvasRef.current) drawOnCanvas(canvasRef.current)
  }

  function download() {
    drawCard()
    const el = canvasRef.current
    if (!el) return
    const link = document.createElement('a')
    link.download = `kawaii-couple-${theme.id}.png`
    link.href = el.toDataURL('image/png')
    link.click()
  }

  function togglePreview() {
    setShowPreview((v) => !v)
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {showPreview && (
        <div className="w-full rounded-xl overflow-hidden border-2 shadow-md" style={{ borderColor: theme.colors.primary }}>
          <canvas
            ref={previewRef}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={togglePreview}
          className="btn-pixel btn-pixel-lavender"
          style={{ fontSize: '0.75rem' }}
        >
          {showPreview ? '🙈 Hide' : `👁 Preview ${theme.emoji}`}
        </button>
        <button
          onClick={download}
          className="btn-pixel"
          style={{ background: theme.colors.primary, fontSize: '0.75rem' }}
        >
          📸 Download Card
        </button>
      </div>

      <p className="text-xs text-gray-400 font-semibold">
        {theme.emoji} {theme.name} theme applied to your card
      </p>
    </div>
  )
}
