'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SlidePuzzleProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 90
const SIZE = 3
const SCRAMBLE_MOVES = 12 // lighter scramble = easier to solve in time

function newBoard(): number[] {
  // 0 = empty. Use 1..8 plus 0 for blank.
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 0]
  let blank = 8
  let prevBlank = -1
  // Random scramble via legal moves to keep solvable.
  // Avoid undoing the previous move so the scramble actually moves tiles around.
  for (let i = 0; i < SCRAMBLE_MOVES; i++) {
    const neighbors = neighborsOf(blank).filter((n) => n !== prevBlank)
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)]
    ;[arr[blank], arr[pick]] = [arr[pick], arr[blank]]
    prevBlank = blank
    blank = pick
  }
  return arr
}

function neighborsOf(idx: number): number[] {
  const r = Math.floor(idx / SIZE)
  const c = idx % SIZE
  const out: number[] = []
  if (r > 0) out.push(idx - SIZE)
  if (r < SIZE - 1) out.push(idx + SIZE)
  if (c > 0) out.push(idx - 1)
  if (c < SIZE - 1) out.push(idx + 1)
  return out
}

function isSolved(b: number[]) {
  for (let i = 0; i < b.length - 1; i++) if (b[i] !== i + 1) return false
  return b[b.length - 1] === 0
}

export default function SlidePuzzle({ onComplete, playerEmail: _playerEmail }: SlidePuzzleProps) {
  const [board, setBoard] = useState<number[]>(() => newBoard())
  const [moves, setMoves] = useState(0)
  const [solvedCount, setSolvedCount] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)

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

  function handleTap(idx: number) {
    if (gameOverRef.current) return
    const blankIdx = board.indexOf(0)
    const ns = neighborsOf(blankIdx)
    if (!ns.includes(idx)) return
    const next = [...board]
    ;[next[blankIdx], next[idx]] = [next[idx], next[blankIdx]]
    const newMoves = moves + 1
    setMoves(newMoves)
    setBoard(next)
    if (isSolved(next)) {
      // Points: more for fewer moves. Min ~20 moves. Cap at 30 - newMoves, min 5.
      const pts = Math.max(5, 35 - newMoves)
      scoreRef.current += pts
      setScore(scoreRef.current)
      setSolvedCount((c) => c + 1)
      // Reset to new puzzle
      setTimeout(() => {
        if (gameOverRef.current) return
        setBoard(newBoard())
        setMoves(0)
      }, 600)
    }
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Slide Puzzle 🧩</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} pts</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🧩</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} pts</div>
            <p className="text-sm font-semibold text-gray-600 mt-1">{solvedCount} solved</p>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between w-full max-w-xs px-2">
              <span className="pixel-font text-xs text-[#FF1493]">Moves: {moves}</span>
              <span className="pixel-font text-xs text-[#C084FC]">Solved: {solvedCount}</span>
            </div>
            <div
              className="grid gap-2 p-2 bg-white border-2 border-black"
              style={{
                gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
                boxShadow: '4px 4px 0px #1a1a1a',
                width: 280,
              }}
            >
              {board.map((val, i) => (
                <button
                  key={i}
                  onClick={() => handleTap(i)}
                  onTouchStart={(e) => { e.preventDefault(); handleTap(i) }}
                  disabled={val === 0}
                  style={{
                    aspectRatio: '1 / 1',
                    background: val === 0 ? '#FFE4F0' : '#FF69B4',
                    border: '3px solid #1a1a1a',
                    boxShadow: val === 0 ? 'none' : 'inset -3px -3px 0 rgba(0,0,0,0.2)',
                    color: 'white',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 18,
                  }}
                >
                  {val === 0 ? '' : val}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Slide tiles to order 1-8! Fewer moves = more points (◕‿◕)
        </p>
      </div>
    </div>
  )
}
