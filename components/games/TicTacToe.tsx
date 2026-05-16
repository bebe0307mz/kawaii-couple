'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TicTacToeProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 60
type Cell = 'X' | 'O' | null
const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
]

function winner(board: Cell[]): Cell | 'tie' | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]
    }
  }
  if (board.every((c) => c !== null)) return 'tie'
  return null
}

// Simple AI: win > block > center > corner > random
function aiMove(board: Cell[]): number {
  const empties = board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0)
  // try to win
  for (const i of empties) {
    const next = [...board]
    next[i] = 'O'
    if (winner(next) === 'O') return i
  }
  // block player
  for (const i of empties) {
    const next = [...board]
    next[i] = 'X'
    if (winner(next) === 'X') return i
  }
  // center
  if (board[4] === null) return 4
  // a corner
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null)
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  // random remaining
  return empties[Math.floor(Math.random() * empties.length)]
}

export default function TicTacToe({ onComplete, playerEmail: _playerEmail }: TicTacToeProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [turn, setTurn] = useState<'X' | 'O'>('X')
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [ties, setTies] = useState(0)
  const [roundResult, setRoundResult] = useState<'win' | 'loss' | 'tie' | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const winsRef = useRef(0)
  const gameOverRef = useRef(false)
  const lockRef = useRef(false)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(winsRef.current)
  }, [onComplete])

  // Timer
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

  const startRound = useCallback(() => {
    if (gameOverRef.current) return
    setBoard(Array(9).fill(null))
    setTurn('X')
    setRoundResult(null)
    lockRef.current = false
  }, [])

  function handleTap(idx: number) {
    if (gameOverRef.current || lockRef.current) return
    if (turn !== 'X' || board[idx] !== null) return

    const next = [...board]
    next[idx] = 'X'
    setBoard(next)
    const w = winner(next)
    if (w === 'X') {
      lockRef.current = true
      winsRef.current += 1
      setWins(winsRef.current)
      setRoundResult('win')
      setTimeout(startRound, 1100)
      return
    }
    if (w === 'tie') {
      lockRef.current = true
      setTies((t) => t + 1)
      setRoundResult('tie')
      setTimeout(startRound, 1100)
      return
    }
    setTurn('O')
  }

  // AI plays on its turn
  useEffect(() => {
    if (gameOverRef.current || lockRef.current) return
    if (turn !== 'O') return
    const t = setTimeout(() => {
      if (gameOverRef.current || lockRef.current) return
      const move = aiMove(board)
      const next = [...board]
      next[move] = 'O'
      setBoard(next)
      const w = winner(next)
      if (w === 'O') {
        lockRef.current = true
        setLosses((l) => l + 1)
        setRoundResult('loss')
        setTimeout(startRound, 1100)
      } else if (w === 'tie') {
        lockRef.current = true
        setTies((t) => t + 1)
        setRoundResult('tie')
        setTimeout(startRound, 1100)
      } else {
        setTurn('X')
      }
    }, 400)
    return () => clearTimeout(t)
  }, [turn, board, startRound])

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Tic Tac Toe ❌⭕</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{wins} wins</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-3 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">❌⭕</div>
            <div className="pixel-font text-base text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{wins} wins</div>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              {losses} losses · {ties} ties
            </p>
            <p className="text-sm font-semibold text-gray-600 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between w-full max-w-xs px-2">
              <span className="pixel-font text-xs text-[#FF1493]">You: {wins}</span>
              <span className="pixel-font text-xs text-[#C084FC]">AI: {losses}</span>
              <span className="pixel-font text-xs text-gray-500">Tie: {ties}</span>
            </div>

            <div
              className="grid gap-2 p-2 bg-white border-2 border-black"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                boxShadow: '4px 4px 0px #1a1a1a',
                width: 280,
              }}
            >
              {board.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => handleTap(i)}
                  onTouchStart={(e) => { e.preventDefault(); handleTap(i) }}
                  disabled={cell !== null || turn !== 'X' || lockRef.current}
                  style={{
                    aspectRatio: '1 / 1',
                    background: cell === null ? '#FFE4F0' : cell === 'X' ? '#FF69B4' : '#C084FC',
                    border: '3px solid #1a1a1a',
                    color: 'white',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 32,
                  }}
                >
                  {cell || ''}
                </button>
              ))}
            </div>

            <p
              className="pixel-font text-xs h-5 mt-1"
              style={{
                color:
                  roundResult === 'win'
                    ? '#22C55E'
                    : roundResult === 'loss'
                    ? '#EF4444'
                    : roundResult === 'tie'
                    ? '#6B7280'
                    : turn === 'X'
                    ? '#FF1493'
                    : '#C084FC',
              }}
            >
              {roundResult === 'win'
                ? 'you win this round! ✨'
                : roundResult === 'loss'
                ? 'AI got it~ next round!'
                : roundResult === 'tie'
                ? "tie~ try again!"
                : turn === 'X'
                ? 'your turn — place ❌'
                : 'AI is thinking...'}
            </p>
          </>
        )}
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-xs font-semibold text-gray-500">
          Beat the AI as many times as you can in 60s! ❌⭕ (◕‿◕)
        </p>
      </div>
    </div>
  )
}
