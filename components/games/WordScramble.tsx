'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { KAWAII_WORDS, scrambleWord } from '@/lib/gameUtils'
import { supabase } from '@/lib/supabase'

interface WordScrambleProps {
  onComplete: (score: number) => void
  playerEmail: string
  sessionCode: string
}

const TOTAL_WORDS = 5
const GAME_DURATION = 120

export default function WordScramble({ onComplete, playerEmail, sessionCode }: WordScrambleProps) {
  const [wordList] = useState(() => {
    const shuffled = [...KAWAII_WORDS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, TOTAL_WORDS).map((w) => ({
      word: w,
      scrambled: scrambleWord(w),
    }))
  })
  const [currentIdx, setCurrentIdx] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [opponentAnswered, setOpponentAnswered] = useState(false)
  const scoreRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleComplete = useCallback(
    (finalScore: number) => {
      if (gameOver) return
      setGameOver(true)
      onComplete(finalScore)
    },
    [gameOver, onComplete]
  )

  // Listen for opponent answers
  useEffect(() => {
    const channel = supabase
      .channel(`word:${sessionCode}`)
      .on('broadcast', { event: 'word_answer' }, (payload) => {
        if (payload.payload?.player_email !== playerEmail) {
          setOpponentAnswered(true)
          setTimeout(() => setOpponentAnswered(false), 1500)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionCode, playerEmail])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleComplete(scoreRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [handleComplete])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (gameOver || currentIdx >= TOTAL_WORDS) return

    const answer = input.trim().toUpperCase()
    const correct = wordList[currentIdx].word

    // Broadcast answer
    const channel = supabase.channel(`word:${sessionCode}`)
    await channel.send({
      type: 'broadcast',
      event: 'word_answer',
      payload: { player_email: playerEmail, word: correct, correct: answer === correct },
    })

    if (answer === correct) {
      setFeedback('correct')
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else {
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      setInput('')
      if (currentIdx + 1 >= TOTAL_WORDS) {
        handleComplete(scoreRef.current)
      } else {
        setCurrentIdx((i) => i + 1)
        inputRef.current?.focus()
      }
    }, 800)
  }

  const current = wordList[currentIdx]
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Word Scramble 🔤</div>
          <div className="font-bold text-sm text-[#FF69B4]">
            Word {Math.min(currentIdx + 1, TOTAL_WORDS)}/{TOTAL_WORDS} - Score: {score}
          </div>
        </div>
        <div className="pixel-font text-base text-[#FF1493]">
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="progress-pixel mx-4 mb-4">
        <div
          className="progress-fill"
          style={{ width: `${(currentIdx / TOTAL_WORDS) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {gameOver || currentIdx >= TOTAL_WORDS ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🔤</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Done!</div>
            <div className="font-bold text-2xl text-[#FF69B4]">{score}/{TOTAL_WORDS} correct</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            {opponentAnswered && (
              <div className="card-pixel p-2 px-4 bg-yellow-50 text-center">
                <p className="text-xs font-bold text-yellow-600">Your babe answered! ⚡</p>
              </div>
            )}

            <div className="text-center">
              <p className="font-bold text-gray-500 text-sm mb-2">Unscramble this word:</p>
              <div className="card-pixel p-4 mb-4">
                <div className="pixel-font text-2xl md:text-3xl text-[#FF1493] tracking-widest">
                  {current?.scrambled}
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-400">
                Hint: It's a kawaii Japanese word~ ♡
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="Type the word..."
                className={`input-pixel w-full text-center uppercase tracking-widest text-lg ${
                  feedback === 'correct' ? 'bg-green-50 border-green-400' :
                  feedback === 'wrong' ? 'bg-red-50 border-red-400' : ''
                }`}
                autoComplete="off"
                autoFocus
              />
              {feedback === 'correct' && (
                <div className="text-center text-green-600 font-bold">Correct! ✓ ♡</div>
              )}
              {feedback === 'wrong' && (
                <div className="text-center text-red-500 font-bold">
                  Wrong~ The answer was: {current?.word}
                </div>
              )}
              <button type="submit" className="btn-pixel w-full" disabled={!input.trim()}>
                Submit ✿
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
