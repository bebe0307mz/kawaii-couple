'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface TicTacToeProps {
  onComplete: (score: number) => void
  playerEmail: string
  sessionCode: string
  isPlayer1: boolean   // player1 = X = moves first
  opponentName?: string
}

type Cell = 'X' | 'O' | null

const WINNING_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],          // diagonals
]

function checkResult(board: Cell[]): 'X' | 'O' | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  if (board.every((c) => c !== null)) return 'draw'
  return null
}

function getWinCells(board: Cell[]): number[] {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return [a, b, c]
  }
  return []
}

const TOTAL_ROUNDS = 3

export default function TicTacToe({ onComplete, playerEmail, sessionCode, isPlayer1, opponentName }: TicTacToeProps) {
  const mySymbol: Cell = isPlayer1 ? 'X' : 'O'
  const oppSymbol: Cell = isPlayer1 ? 'O' : 'X'
  const oppLabel = opponentName || 'Babe'

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null)
  const [phase, setPhase] = useState<'playing' | 'roundOver' | 'done'>('playing')
  const [gameOver, setGameOver] = useState(false)

  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const roundRef = useRef(1)
  const boardRef = useRef<Cell[]>(Array(9).fill(null))
  const xIsNextRef = useRef(true)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const roundOverRef = useRef(false)

  const endGame = useCallback(() => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(scoreRef.current)
  }, [onComplete])

  const resolveRound = useCallback((newBoard: Cell[]) => {
    if (roundOverRef.current) return
    const result = checkResult(newBoard)
    if (!result) return
    roundOverRef.current = true

    let myResult: 'win' | 'lose' | 'draw'
    if (result === 'draw') {
      myResult = 'draw'
    } else if (result === mySymbol) {
      myResult = 'win'
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else {
      myResult = 'lose'
    }
    setRoundResult(myResult)
    setPhase('roundOver')

    setTimeout(() => {
      if (gameOverRef.current) return
      const next = roundRef.current + 1
      roundRef.current = next
      if (next > TOTAL_ROUNDS) {
        setPhase('done')
        endGame()
      } else {
        setCurrentRound(next)
        const fresh: Cell[] = Array(9).fill(null)
        boardRef.current = fresh
        xIsNextRef.current = true
        setBoard(fresh)
        setXIsNext(true)
        setRoundResult(null)
        setPhase('playing')
        roundOverRef.current = false
      }
    }, 2200)
  }, [mySymbol, endGame])

  // Subscribe to opponent moves
  useEffect(() => {
    const channel = supabase
      .channel(`ttt:${sessionCode}`)
      .on('broadcast', { event: 'ttt_move' }, (payload) => {
        const p = payload.payload as { player_email: string; cell: number; round: number }
        if (p.player_email === playerEmail) return
        if (p.round !== roundRef.current) return

        const newBoard = [...boardRef.current]
        newBoard[p.cell] = oppSymbol
        boardRef.current = newBoard
        xIsNextRef.current = !xIsNextRef.current
        setBoard([...newBoard])
        setXIsNext(xIsNextRef.current)
        resolveRound(newBoard)
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [sessionCode, playerEmail, oppSymbol, resolveRound])

  async function handleCellClick(cellIndex: number) {
    if (gameOverRef.current || roundOverRef.current || phase !== 'playing') return
    if (boardRef.current[cellIndex] !== null) return

    const isMyTurn =
      (mySymbol === 'X' && xIsNextRef.current) ||
      (mySymbol === 'O' && !xIsNextRef.current)
    if (!isMyTurn) return

    const newBoard = [...boardRef.current]
    newBoard[cellIndex] = mySymbol
    boardRef.current = newBoard
    xIsNextRef.current = !xIsNextRef.current
    setBoard([...newBoard])
    setXIsNext(xIsNextRef.current)

    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'ttt_move',
        payload: { player_email: playerEmail, cell: cellIndex, round: roundRef.current },
      })
    }

    resolveRound(newBoard)
  }

  const isMyTurn =
    phase === 'playing' &&
    !gameOver &&
    ((mySymbol === 'X' && xIsNext) || (mySymbol === 'O' && !xIsNext))

  const winCells = phase === 'roundOver' ? getWinCells(board) : []

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Tic Tac Toe ❌⭕</div>
          <div className="font-bold text-lg text-[#FF69B4]">
            You = {mySymbol === 'X' ? '❌ X' : '⭕ O'} &nbsp;&bull;&nbsp; {score} win{score !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-base text-[#FF1493]">{currentRound}/{TOTAL_ROUNDS}</div>
          <div className="text-xs font-semibold text-gray-500">rounds</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${((currentRound - 1) / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 bg-gradient-to-b from-pink-50 to-pink-100 border-t-2 border-[#FF69B4]">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">{score >= 2 ? '🏆' : score === 1 ? '💕' : '🤝'}</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Done!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score}/{TOTAL_ROUNDS} wins</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            {/* Turn / result status */}
            <div className="min-h-[20px] text-center">
              {phase === 'roundOver' ? (
                <p className={`pixel-font text-xs ${
                  roundResult === 'win' ? 'text-green-500' :
                  roundResult === 'lose' ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {roundResult === 'win'
                    ? 'You win this round! ♡'
                    : roundResult === 'lose'
                    ? `${oppLabel} wins this round~`
                    : 'Draw! ★'}
                </p>
              ) : (
                <p className={`pixel-font text-xs ${isMyTurn ? 'text-[#FF1493]' : 'text-[#C084FC]'}`}>
                  {isMyTurn ? 'Your turn~ tap a square! ♡' : `${oppLabel} is thinking... ♡`}
                </p>
              )}
            </div>

            {/* Board */}
            <div
              className="grid gap-2 p-2 bg-white border-2 border-black"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                boxShadow: '4px 4px 0px #1a1a1a',
              }}
            >
              {board.map((cell, i) => {
                const isWinCell = winCells.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => handleCellClick(i)}
                    onTouchStart={(e) => { e.preventDefault(); handleCellClick(i) }}
                    style={{
                      width: 80,
                      height: 80,
                      background: isWinCell ? '#FFB6C1' : cell ? '#FF69B4' : isMyTurn ? '#FFF0F5' : '#fff',
                      border: '3px solid #1a1a1a',
                      boxShadow: cell ? 'inset -2px -2px 0 rgba(0,0,0,0.15)' : 'none',
                      fontSize: '2rem',
                      cursor: !cell && isMyTurn && phase === 'playing' ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}
                  >
                    {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
                  </button>
                )
              })}
            </div>

            <div className="text-xs font-semibold text-gray-400 text-center">
              You {mySymbol === 'X' ? '❌' : '⭕'} &nbsp;vs&nbsp; {oppLabel} {mySymbol === 'X' ? '⭕' : '❌'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
