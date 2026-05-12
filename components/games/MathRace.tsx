'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface MathRaceProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Question {
  a: number
  b: number
  op: '+' | '-' | 'x'
  answer: number
  choices: number[]
}

const GAME_DURATION = 90

function generateQuestion(): Question {
  const ops: Array<'+' | '-' | 'x'> = ['+', '-', 'x']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a: number, b: number, answer: number

  if (op === '+') {
    a = 1 + Math.floor(Math.random() * 20)
    b = 1 + Math.floor(Math.random() * 20)
    answer = a + b
  } else if (op === '-') {
    a = 1 + Math.floor(Math.random() * 20)
    b = 1 + Math.floor(Math.random() * a)
    answer = a - b
  } else {
    a = 1 + Math.floor(Math.random() * 12)
    b = 1 + Math.floor(Math.random() * 12)
    answer = a * b
  }

  // Generate 3 wrong choices
  const wrong = new Set<number>()
  while (wrong.size < 3) {
    const delta = Math.floor(Math.random() * 10) - 5
    const candidate = answer + delta
    if (candidate !== answer && candidate >= 0) {
      wrong.add(candidate)
    }
  }
  const choices = [answer, ...Array.from(wrong)].sort(() => Math.random() - 0.5)

  return { a, b, op, answer, choices }
}

export default function MathRace({ onComplete, playerEmail }: MathRaceProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [question, setQuestion] = useState<Question>(() => generateQuestion())
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const feedbackRef = useRef(false)

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

  function handleAnswer(choice: number) {
    if (gameOver || feedbackRef.current) return
    feedbackRef.current = true

    if (choice === question.answer) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setFeedback('correct')
      setTimeout(() => {
        setFeedback(null)
        setQuestion(generateQuestion())
        feedbackRef.current = false
      }, 300)
    } else {
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        feedbackRef.current = false
      }, 500)
    }
  }

  const progress = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Math Race 🔢</div>
          <div className="font-bold text-2xl text-[#FF69B4]">{score} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{mins}:{secs.toString().padStart(2, '0')}</div>
          <div className="text-xs font-semibold text-gray-500">left</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🔢</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Time Up!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score} correct</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            <div
              className={`card-pixel p-6 text-center w-full max-w-xs transition-all ${
                feedback === 'correct' ? 'bg-green-50 border-green-400' :
                feedback === 'wrong' ? 'bg-red-50 border-red-400' : ''
              }`}
            >
              <div className="pixel-font text-2xl text-[#FF1493]">
                {question.a} {question.op} {question.b} = ?
              </div>
              {feedback === 'correct' && (
                <div className="text-green-600 font-bold text-sm mt-2">Correct! ✓</div>
              )}
              {feedback === 'wrong' && (
                <div className="text-red-500 font-bold text-sm mt-2">Try again!</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {question.choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  onTouchStart={(e) => { e.preventDefault(); handleAnswer(choice) }}
                  className="btn-pixel text-lg py-4"
                  style={{ fontSize: '1.1rem' }}
                >
                  {choice}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
