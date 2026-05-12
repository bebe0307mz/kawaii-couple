'use client'

import { useState, useCallback } from 'react'

interface AnimeTriviaProps {
  onComplete: (score: number) => void
  playerEmail: string
}

interface Question {
  q: string
  options: string[]
  answer: number
}

const QUESTIONS: Question[] = [
  { q: "Which anime features a boy with a rubber body?", options: ['One Piece', 'Naruto', 'Bleach', 'Dragon Ball'], answer: 0 },
  { q: "What is Pikachu's type in Pokemon?", options: ['Fire', 'Electric', 'Water', 'Normal'], answer: 1 },
  { q: "In Studio Ghibli, who created Totoro?", options: ['Hideaki Anno', 'Hayao Miyazaki', 'Makoto Shinkai', 'Satoshi Kon'], answer: 1 },
  { q: "What does 'Naruto' mean in Japanese?", options: ['Fish cake', 'Whirlpool', 'Lightning', 'Fox'], answer: 1 },
  { q: "Which show features Titan-fighting humans?", options: ['Attack on Titan', 'Tokyo Ghoul', 'Demon Slayer', 'Black Clover'], answer: 0 },
  { q: "What is Sailor Moon's real name?", options: ['Usagi Tsukino', 'Rei Hino', 'Minako Aino', 'Makoto Kino'], answer: 0 },
  { q: "In Dragon Ball Z, what level is 'over 9000'?", options: ['Power level', 'Speed', 'Intelligence', 'Ki'], answer: 0 },
  { q: "Which anime is set in Deku's world?", options: ['My Hero Academia', 'Fairy Tail', 'Sword Art Online', 'Re:Zero'], answer: 0 },
  { q: "What animal is Jiraiya's spirit animal?", options: ['Toad', 'Snake', 'Slug', 'Fox'], answer: 0 },
  { q: "Which country does anime originate from?", options: ['China', 'Korea', 'Japan', 'USA'], answer: 2 },
]

export default function AnimeTrivia({ onComplete, playerEmail }: AnimeTriviaProps) {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const endGame = useCallback((finalScore: number) => {
    setGameOver(true)
    onComplete(finalScore)
  }, [onComplete])

  function handleAnswer(idx: number) {
    if (selected !== null || gameOver) return
    setSelected(idx)
    const correct = idx === QUESTIONS[current].answer
    const newScore = score + (correct ? 1 : 0)
    setScore(newScore)

    setTimeout(() => {
      const next = current + 1
      if (next >= QUESTIONS.length) {
        endGame(newScore)
      } else {
        setCurrent(next)
        setSelected(null)
      }
    }, 900)
  }

  const progress = (current / QUESTIONS.length) * 100

  if (gameOver) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 gap-4">
        <div className="text-5xl">🏆</div>
        <div className="pixel-font text-base text-[#FF1493]">Trivia Done!</div>
        <div className="font-bold text-3xl text-[#FF69B4]">{score}/{QUESTIONS.length}</div>
        <p className="text-sm font-semibold text-gray-600">Waiting for scores~ ♡</p>
      </div>
    )
  }

  const q = QUESTIONS[current]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Anime Trivia 🏆</div>
          <div className="font-bold text-lg text-[#FF69B4]">{score} correct</div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-sm text-[#FF1493]">{current + 1}/{QUESTIONS.length}</div>
          <div className="text-xs font-semibold text-gray-500">question</div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="progress-pixel">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        <div className="card-pixel p-5 text-center w-full max-w-sm" style={{ background: '#FFF0F5' }}>
          <p className="font-bold text-sm text-[#FF1493] leading-snug">{q.q}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          {q.options.map((opt, idx) => {
            let bg = '#FF69B4'
            let textColor = 'white'
            if (selected !== null) {
              if (idx === q.answer) { bg = '#22C55E' }
              else if (idx === selected) { bg = '#EF4444' }
              else { bg = '#D1D5DB'; textColor = '#6B7280' }
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
