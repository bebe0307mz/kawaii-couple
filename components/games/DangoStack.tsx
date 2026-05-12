'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface DangoStackProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Dango {
  id: number
  laneIsLeft: boolean
  y: number
  speed: number
}

const GAME_DURATION = 45

export default function DangoStack({ onComplete, playerEmail: _playerEmail }: DangoStackProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [dangos, setDangos] = useState<Dango[]>([])
  const [catcherLeft, setCatcherLeft] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const idRef = useRef(0)
  const catcherRef = useRef(true)
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
        if (prev <= 1) {
          clearInterval(interval)
          endGame()
          return 0
        }
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
          laneIsLeft: Math.random() < 0.5,
          y: -40,
          speed: 90 + Math.random() * 60,
        },
      ])
    }, 1100)
    return () => clearInterval(spawn)
  }, [])

  useEffect(() => {
    let frame: number
    let last = 0
    function loop(ts: number) {
      if (gameOverRef.current) return
      const dt = last ? (ts - last) / 1000 : 0.016
      last = ts
      const areaH = areaRef.current?.clientHeight || 400
      const catcherY = areaH - 60
      setDangos((prev) => {
        const next: Dango[] = []
        for (const d of prev) {
          const newY = d.y + d.speed * dt
          if (newY > catcherY && newY < catcherY + 30) {
            if (d.laneIsLeft === catcherRef.current) {
              scoreRef.current += 1
              setScore(scoreRef.current)
              continue // caught, remove
            }
          }
          if (newY > areaH + 40) continue // missed off screen
          next.push({ ...d, y: newY })
        }
        return next
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  function moveCatcher(left: boolean) {
    if (gameOverRef.current) return
    catcherRef.current = left
    setCatcherLeft(left)
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
        className="relative flex-1 overflow-hidden border-t-2 border-[#FF69B4] select-none"
        style={{ minHeight: 320, background: 'linear-gradient(to bottom, #FFF0F5, #FFE4F0)' }}
      >
        {!gameOver && dangos.map((d) => (
          <div
            key={d.id}
            style={{
              position: 'absolute',
              left: d.laneIsLeft ? '25%' : '75%',
              top: d.y,
              transform: 'translateX(-50%)',
              fontSize: 36,
            }}
          >
            🍡
          </div>
        ))}

        {!gameOver && (
          <div
            style={{
              position: 'absolute',
              left: catcherLeft ? '25%' : '75%',
              bottom: 20,
              transform: 'translateX(-50%)',
              fontSize: 44,
              transition: 'left 0.15s',
            }}
          >
            🥣
          </div>
        )}

        {!gameOver && (
          <>
            <button
              onClick={() => moveCatcher(true)}
              onTouchStart={(e) => { e.preventDefault(); moveCatcher(true) }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                background: 'transparent',
                border: 'none',
              }}
              aria-label="Move left"
            />
            <button
              onClick={() => moveCatcher(false)}
              onTouchStart={(e) => { e.preventDefault(); moveCatcher(false) }}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                background: 'transparent',
                border: 'none',
              }}
              aria-label="Move right"
            />
          </>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-100/80">
            <div className="text-5xl mb-3">🍡</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} caught</div>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Tap left/right to slide the catcher 🥣 (◕‿◕)
        </p>
      </div>
    </div>
  )
}
