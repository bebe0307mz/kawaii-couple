'use client'

import { useRef } from 'react'

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

  function drawCard() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 800, H = 450
    canvas.width = W
    canvas.height = H

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#FFF0F5')
    grad.addColorStop(0.5, '#F3E8FF')
    grad.addColorStop(1, '#FFF0F5')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Decorative border
    ctx.strokeStyle = '#FF69B4'
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, W - 20, H - 20)
    ctx.strokeStyle = '#C084FC'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, W - 40, H - 40)

    // Sakura petals decoration
    const petals = ['🌸', '✿', '🌸', '✿', '🌸']
    ctx.font = '24px serif'
    petals.forEach((p, i) => {
      ctx.fillText(p, 40 + i * 60, 50)
      ctx.fillText(p, 40 + i * 60, H - 20)
    })

    // Title
    ctx.textAlign = 'center'
    ctx.font = 'bold 16px "Courier New", monospace'
    ctx.fillStyle = '#FF1493'
    ctx.fillText('KAWAII COUPLE', W / 2, 80)

    // Big emoji
    ctx.font = '64px serif'
    ctx.fillText(isTie ? '🤝' : isWinner ? '🏆' : '💕', W / 2, 170)

    // Result text
    ctx.font = 'bold 28px "Courier New", monospace'
    ctx.fillStyle = '#FF1493'
    const resultText = isTie ? "It's a Tie!" : isWinner ? `${player1Name} Wins!` : `${player2Name} Wins!`
    ctx.fillText(resultText, W / 2, 220)

    // Score
    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = '#C084FC'
    ctx.fillText(`${player1Name}  ${player1Score} vs ${player2Score}  ${player2Name}`, W / 2, 265)

    // Score big numbers
    ctx.font = 'bold 72px "Courier New", monospace'
    ctx.fillStyle = '#FF69B4'
    ctx.fillText(`${player1Score}`, W / 2 - 80, 360)
    ctx.fillStyle = '#333'
    ctx.font = 'bold 40px Arial'
    ctx.fillText('vs', W / 2, 348)
    ctx.fillStyle = '#C084FC'
    ctx.font = 'bold 72px "Courier New", monospace'
    ctx.fillText(`${player2Score}`, W / 2 + 80, 360)

    // URL
    ctx.font = '14px Arial'
    ctx.fillStyle = '#FF69B4'
    ctx.fillText('kawaiicouple.roastlabai.com', W / 2, H - 45)

    ctx.font = '12px Arial'
    ctx.fillStyle = '#C084FC'
    ctx.fillText('Play cute games with your boo~ ♡', W / 2, H - 25)
  }

  function download() {
    drawCard()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'kawaii-couple-score.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        onClick={download}
        className="btn-pixel"
        style={{ background: '#FF1493', fontSize: '0.8rem' }}
      >
        📸 Download Score Card
      </button>
    </div>
  )
}
