'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface DangoStackProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Dango {
  id: number
  laneX: number   // 0-100 percent of game area width
  y: number
  speed: number
}

const GAME_DURATION = 45
const CATCH_RADIUS_PX = 55  // pixel tolerance for catch

export default function DangoStack({ onComplete, playerEmail: _playerEmail }: DangoStackProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [dangos, setDangos] = useState<Dango[]>([])
  const [bowlX, setBowlX] = useState(50)  // percent 0-100
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const idRef = useRef(0)
  const bowlXRef = useRef(50)   // percent
  const areaRef = useRef<HTMLDivElement>(null)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(scoreRef.current)
  }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); endGame(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [endGame])

  useEffect(() => {
    const spawn = setInterval(() => {
      if (gameOverRef.current) return
      const id = ++idRef.current
      setDangos((prev) => [
        ...prev,
        {
          id,
          laneX: 10 + Math.random() * 80,   // 10..90%
          y: -40,
          speed: 100 + Math.random() * 70,
        },
      ])
    }, 900)
    return () => clearInterval(spawn)
  }, [])

  // Animation loop
  useEffect(() => {
    let frame: number
    let last = 0
    function loop(ts: number) {
      if (gameOverRef.current) return
      const dt = last ? (ts - last) / 1000 : 0.016
      last = ts
      const area = areaRef.current
      if (!area) { frame = requestAnimationFrame(loop); return }
      const areaH = area.clientHeight
      const areaW = area.clientWidth
      const catcherY = areaH - 55
      const bowlPx = (bowlXRef.current / 100) * areaW

      setDangos((prev) => {
        const next: Dango[] = []
        for (const d of prev) {
          const newY = d.y + d.speed * dt
          const dangoPx = (d.laneX / 100) * areaW
          if (newY > catcherY - 10 && newY < catcherY + 40) {
            if (Math.abs(dangoPx - bowlPx) < CATCH_RADIUS_PX) {
              scoreRef.current += 1
              setScore(scoreRef.current)
              continue  // caught!
            }
          }
          if (newY > areaH + 40) continue  // missed
          next.push({ ...d, y: newY })
        }
        return next
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  function handlePointerMove(clientX: number) {
    const area = areaRef.current
    if (!area || gameOverRef.current) return
    const rect = area.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100))
    bowlXRef.current = pct
    setBowlX(pct)
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Dango Stack 🍡</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} caught</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">left</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div
        ref={areaRef}
        className="relative flex-1 overflow-hidden border-t-2 border-[#FF69B4] select-none touch-none"
        style={{ minHeight: 320, background: 'linear-gradient(to bottom, #1a0a2e, #2d1b4e)' }}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => { e.preventDefault(); handlePointerMove(e.touches[0].clientX) }}
        onTouchStart={(e) => { e.preventDefault(); handlePointerMove(e.touches[0].clientX) }}
      >
        {/* Stars background */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 12}%`,
            top: `${5 + (i % 3) * 20}%`,
            fontSize: 8,
            opacity: 0.4,
            color: 'white',
          }}>★</div>
        ))}

        {!gameOver && dangos.map((d) => (
          <div
            key={d.id}
            style={{
              position: 'absolute',
              left: `${d.laneX}%`,
              top: d.y,
              transform: 'translateX(-50%)',
              fontSize: 34,
              filter: 'drop-shadow(0 0 6px #FF69B4)',
            }}
          >
            🍡
          </div>
        ))}

        {!gameOver && (
          <div
            style={{
              position: 'absolute',
              left: `${bowlX}%`,
              bottom: 16,
              transform: 'translateX(-50%)',
              fontSize: 48,
              transition: 'left 0.04s linear',
              filter: 'drop-shadow(0 0 8px #FF1493)',
            }}
          >
            🥣
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(26,10,46,0.85)' }}>
            <div className="text-5xl mb-3">🍡</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} caught</div>
            <p className="text-sm font-semibold text-[#C084FC] mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Slide your finger to catch the dango! 🥣 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
