'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { QUIZ_QUESTIONS } from '@/lib/gameUtils'

interface KawaiiQuizProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const GAME_DURATION = 180
const TOTAL_QUESTIONS = 10

export default function KawaiiQuiz({ onComplete, playerEmail }: KawaiiQuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const scoreRef = useRef(0)

  const handleComplete = useCallback(
    (finalScore: number) => {
      if (gameOver) return
      setGameOver(true)
      onComplete(finalScore)
    },
    [gameOver, onComplete]
  )

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleComplete])

  function handleAnswer(optionIdx: number) {
    if (selected !== null || gameOver) return
    setSelected(optionIdx)

    const q = QUIZ_QUESTIONS[currentQ]
    const correct = optionIdx === q.answer
    let newScore = score
    if (correct) {
      newScore = score + 1
      scoreRef.current = newScore
      setScore(newScore)
      setFeedback('correct')
    } else {
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      setSelected(null)
      if (currentQ + 1 >= TOTAL_QUESTIONS) {
        handleComplete(newScore)
      } else {
        setCurrentQ((q) => q + 1)
      }
    }, 1000)
  }

  const q = QUIZ_QUESTIONS[currentQ]
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const OPTION_LETTERS = ['A', 'B', 'C', 'D']

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Kawaii Quiz 🧠</div>
          <div className="font-bold text-sm text-[#FF69B4]">
            Q{currentQ + 1}/{TOTAL_QUESTIONS} - Score: {score}
          </div>
        </div>
        <div className="pixel-font text-base text-[#FF1493]">
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="progress-pixel mx-4 mb-4">
        <div
          className="progress-fill"
          style={{ width: `${(currentQ / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 gap-4 pb-4 overflow-auto">
        {gameOver || currentQ >= TOTAL_QUESTIONS ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-3">🧠</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Quiz Done!</div>
            <div className="font-bold text-2xl text-[#FF69B4]">{score}/{TOTAL_QUESTIONS} correct</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting for scores~ ♡</p>
          </div>
        ) : (
          <>
            <div className="card-pixel p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">🧠</span>
                <p className="font-bold text-gray-800 text-base leading-snug">
                  {q.question}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((option, i) => {
                let btnClass = 'card-pixel p-3 text-left flex items-center gap-3 w-full transition-all cursor-pointer'
                if (selected === i) {
                  btnClass += feedback === 'correct'
                    ? ' !bg-green-100 !border-green-500'
                    : ' !bg-red-100 !border-red-500'
                } else if (selected !== null && i === q.answer) {
                  btnClass += ' !bg-green-100 !border-green-500'
                } else {
                  btnClass += ' hover:!bg-pink-50 hover:translate-y-[-1px]'
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={btnClass}
                    disabled={selected !== null}
                  >
                    <span className="pixel-font text-xs text-[#FF69B4] w-6 flex-shrink-0">
                      {OPTION_LETTERS[i]}
                    </span>
                    <span className="font-bold text-gray-700">{option}</span>
                    {selected !== null && i === q.answer && (
                      <span className="ml-auto text-green-600 font-bold">✓</span>
                    )}
                    {selected === i && i !== q.answer && (
                      <span className="ml-auto text-red-500 font-bold">✗</span>
                    )}
                  </button>
                )
              })}
            </div>

            {feedback && (
              <div className={`text-center font-bold text-lg ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                {feedback === 'correct' ? '✓ Correct! ♡' : '✗ Wrong~ (◕_◕)'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
