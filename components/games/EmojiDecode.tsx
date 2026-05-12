'use client'

import { useState, useEffect, useRef } from 'react'

interface EmojiDecodeProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Question {
  emoji: string
  answer: string
  choices: string[]
}

const TOTAL_QUESTIONS = 15
const PICK_COUNT = 8
const TIME_LIMIT = 180

const ALL_QUESTIONS: Question[] = [
  { emoji: '🌹❤️', answer: 'I love you', choices: ['I love you', 'Red flowers', 'Good morning', 'Be my friend'] },
  { emoji: '😴💤', answer: 'Go to sleep', choices: ['Go to sleep', 'Boring', 'Dream big', 'Night shift'] },
  { emoji: '🎂🎉🎈', answer: 'Happy Birthday!', choices: ['Happy Birthday!', 'Party time', 'Celebration', 'Weekend fun'] },
  { emoji: '💔😢', answer: 'Heartbroken', choices: ['Heartbroken', 'Raining', 'Sad movie', 'Missing you'] },
  { emoji: '🍕🍔🍟', answer: 'Fast food', choices: ['Fast food', 'Junk food', 'Cheat day', 'Hungry'] },
  { emoji: '☀️😎👌', answer: 'Sunny vibes', choices: ['Sunny vibes', 'Cool day', 'Hot summer', 'Beach day'] },
  { emoji: '📚😫', answer: 'Studying is hard', choices: ['Studying is hard', 'Book club', 'Library', 'Reading sucks'] },
  { emoji: '🏃💨', answer: 'Running late', choices: ['Running late', 'Fast runner', 'Windy day', 'Speed run'] },
  { emoji: '🎵🎤🎶', answer: 'Karaoke time!', choices: ['Karaoke time!', 'Music class', 'Concert', 'Singing'] },
  { emoji: '💻😤', answer: 'Tech problems', choices: ['Tech problems', 'Hard work', 'Gaming rage', 'Coding'] },
  { emoji: '🌙⭐😍', answer: 'Starry night', choices: ['Starry night', 'So beautiful', 'Wish upon a star', 'Night sky'] },
  { emoji: '🍜🥢😋', answer: 'Delicious noodles', choices: ['Delicious noodles', 'Japanese food', 'Hungry', 'Ramen date'] },
  { emoji: '💃🕺✨', answer: 'Dance party!', choices: ['Dance party!', 'Date night', 'Showtime', 'Disco'] },
  { emoji: '🐱💕', answer: 'Cat lover', choices: ['Cat lover', 'Cute kitty', 'Pet me', 'Meow'] },
  { emoji: '🌸🍡🎎', answer: 'Japanese culture', choices: ['Japanese culture', 'Spring festival', 'Cherry blossom', 'Sakura season'] },
]

function pickQuestions(): Question[] {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, PICK_COUNT)
}

export default function EmojiDecode({ onComplete, playerEmail }: EmojiDecodeProps) {
  const [questions] = useState<Question[]>(() => pickQuestions())
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const answeredRef = useRef(false)

  const endGame = () => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    onComplete(scoreRef.current)
  }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAnswer(choice: string) {
    if (answeredRef.current || gameOver) return
    answeredRef.current = true
    setSelectedAnswer(choice)
    const correct = choice === questions[current].answer
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
    setTimeout(() => {
      const nextIdx = current + 1
      if (nextIdx >= PICK_COUNT) {
        endGame()
      } else {
        setCurrent(nextIdx)
        setFeedback(null)
        setSelectedAnswer(null)
        answeredRef.current = false
      }
    }, 700)
  }

  const q = questions[current]
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const progress = (current / PICK_COUNT) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Emoji Decode 💬</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score}/{current} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-base text-[#FF1493]">{mins}:{secs.toString().padStart(2, '0')}</div>
          <div className="text-xs font-semibold text-gray-500">{current + 1}/{PICK_COUNT}</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        {gameOver ? (
          <div className="text-center">
            <div className="text-5xl mb-3">💬</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">Done!</div>
            <div className="font-bold text-3xl text-[#FF69B4]">{score}/{PICK_COUNT}</div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            <div className="card-pixel p-5 text-center w-full max-w-xs">
              <div className="text-4xl mb-2">{q.emoji}</div>
              <p className="text-xs font-semibold text-gray-500">What does this mean?</p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              {q.choices.map((choice) => {
                let extraClass = ''
                if (selectedAnswer === choice) {
                  extraClass = feedback === 'correct' ? ' !bg-green-100 !border-green-400' : ' !bg-red-100 !border-red-400'
                }
                return (
                  <button
                    key={choice}
                    onClick={() => handleAnswer(choice)}
                    onTouchStart={(e) => { e.preventDefault(); handleAnswer(choice) }}
                    className={`btn-pixel text-left px-4 py-3${extraClass}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
