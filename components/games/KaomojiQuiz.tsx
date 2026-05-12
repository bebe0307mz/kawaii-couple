'use client'

import { useState, useEffect, useCallback } from 'react'

interface KaomojiQuizProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Question {
  kaomoji: string
  options: string[]
  answer: number
}

const ALL_QUESTIONS: Question[] = [
  { kaomoji: '(◕‿◕)', options: ['Happy', 'Sad', 'Angry', 'Surprised'], answer: 0 },
  { kaomoji: '(╥_╥)', options: ['Happy', 'Crying', 'Sleepy', 'Confused'], answer: 1 },
  { kaomoji: '(ง •̀_•́)ง', options: ['Relaxed', 'Fighting/Determined', 'Bored', 'Shy'], answer: 1 },
  { kaomoji: '(≧◡≦)', options: ['Super Happy', 'Angry', 'Scared', 'Confused'], answer: 0 },
  { kaomoji: '(¬_¬)', options: ['Suspicious/Side-eye', 'Happy', 'Excited', 'Sleepy'], answer: 0 },
  { kaomoji: "(´-ω-｀)", options: ['Sad/Gloomy', 'Excited', 'Angry', 'Happy'], answer: 0 },
  { kaomoji: '(☆▽☆)', options: ['Starstruck/Amazed', 'Bored', 'Crying', 'Angry'], answer: 0 },
  { kaomoji: "(o´∀｀o)", options: ['Excited/Happy', 'Scared', 'Sleepy', 'Confused'], answer: 0 },
  { kaomoji: '(-_-)zzz', options: ['Sleepy/Sleeping', 'Dancing', 'Angry', 'Happy'], answer: 0 },
  { kaomoji: '(ʘ‿ʘ)', options: ['Innocent/Cute', 'Angry', 'Sad', 'Excited'], answer: 0 },
  { kaomoji: '(>_<)', options: ['Frustrated/Embarrassed', 'Happy', 'Sleepy', 'Confused'], answer: 0 },
  { kaomoji: '(｡•́︿•̀｡)', options: ['Sad/Upset', 'Happy', 'Angry', 'Surprised'], answer: 0 },
  { kaomoji: '( ˘ ³˘)♥', options: ['Sending Love', 'Angry', 'Confused', 'Sleepy'], answer: 0 },
  { kaomoji: '(￣ω￣)', options: ['Smug/Satisfied', 'Crying', 'Scared', 'Hyper'], answer: 0 },
  { kaomoji: '(°ロ°)!', options: ['Shocked/Surprised', 'Happy', 'Sleepy', 'Bored'], answer: 0 },
  { kaomoji: '(づ｡◕‿‿◕｡)づ', options: ['Hugging/Cute', 'Angry', 'Sad', 'Confused'], answer: 0 },
  { kaomoji: '(¯\\_(ツ)_/¯)', options: ['Shrug/Dunno', 'Happy', 'Crying', 'Angry'], answer: 0 },
  { kaomoji: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', options: ['Celebrating/Magic', 'Sad', 'Bored', 'Angry'], answer: 0 },
  { kaomoji: 'ಠ_ಠ', options: ['Disapproval/Judging', 'Happy', 'Confused', 'Sleepy'], answer: 0 },
  { kaomoji: '(^▽^)', options: ['Cheerful/Happy', 'Angry', 'Crying', 'Shocked'], answer: 0 },
]

const TOTAL_QUESTIONS = 8

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function selectQuestions(): Question[] {
  return shuffle(ALL_QUESTIONS).slice(0, TOTAL_QUESTIONS)
}

export default function KaomojiQuiz({ onComplete, playerEmail }: KaomojiQuizProps) {
  const [questions] = useState<Question[]>(selectQuestions)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = { current: 0 }

  const endGame = useCallback((finalScore: number) => {
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  function handleAnswer(idx: number) {
    if (selected !== null || gameOver) return
    setSelected(idx)
    const correct = idx === questions[current].answer
    const newScore = score + (correct ? 1 : 0)
    setScore(newScore)

    setTimeout(() => {
      const next = current + 1
      if (next >= TOTAL_QUESTIONS) {
        endGame(newScore)
      } else {
        setCurrent(next)
        setSelected(null)
      }
    }, 900)
  }

  const progress = ((current) / TOTAL_QUESTIONS) * 100

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">😊</div>
        <div className="pixel-font text-base text-[#FF1493]">Quiz Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/{TOTAL_QUESTIONS}</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Kaomoji Quiz 😊</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{current + 1}/{TOTAL_QUESTIONS}</div>
          <div className="text-xs font-semibold text-gray-500">question</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        <div
          className="card-pixel p-6 text-center w-full max-w-sm"
          style={{ background: '#FFF0F5' }}
        >
          <p className="text-xs font-semibold text-gray-500 mb-3">What emotion is this?</p>
          <div
            className="pixel-font text-2xl text-[#FF1493] leading-relaxed"
            style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
          >
            {q.kaomoji}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {q.options.map((opt, idx) => {
            let bg = '#FF69B4'
            let textColor = 'white'
            if (selected !== null) {
              if (idx === q.answer) {
                bg = '#22C55E'
              } else if (idx === selected && selected !== q.answer) {
                bg = '#EF4444'
              } else {
                bg = '#D1D5DB'
                textColor = '#6B7280'
              }
            }
            return (
              <button
                key={idx}
                className="btn-pixel text-sm py-3"
                style={{ background: bg, color: textColor, borderColor: 'black' }}
                onClick={() => handleAnswer(idx)}
                onTouchStart={(e) => { e.preventDefault(); handleAnswer(idx) }}
                disabled={selected !== null}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
