'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TypeRaceProps {
  onComplete: (score: number) => void
  playerEmail: string
}

const SENTENCES = [
  'Sakura petals fall gently in spring',
  'I love you more than matcha latte',
  'Let us share mochi under cherry blossoms',
  'You are my favorite person in the whole world',
  'Together we make the perfect team always',
]

const GAME_DURATION = 90

function pickSentence(): string {
  return SENTENCES[Math.floor(Math.random() * SENTENCES.length)]
}

export default function TypeRace({ onComplete, playerEmail }: TypeRaceProps) {
  const [sentence] = useState(() => pickSentence())
  const [typed, setTyped] = useState('')
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [finalWpm, setFinalWpm] = useState(0)
  const gameOverRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const endGame = useCallback((typedStr: string, elapsed: number) => {
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)

    // Count correct chars
    let correct = 0
    for (let i = 0; i < Math.min(typedStr.length, sentence.length); i++) {
      if (typedStr[i] === sentence[i]) correct++
    }

    if (elapsed > 0 && typedStr.length >= sentence.length) {
      // Finished - calculate WPM
      const minutes = elapsed / 60000
      const words = sentence.split(' ').length
      const wpm = Math.round(words / minutes)
      setFinalWpm(wpm)
      onComplete(wpm)
    } else {
      // Time ran out - score is correct chars typed
      setFinalWpm(correct)
      onComplete(correct)
    }
  }, [sentence, onComplete])

  // Timer (only when started)
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          endGame(typed, Date.now() - startTime)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (gameOver) return
    const value = e.target.value

    if (!started && value.length > 0) {
      setStarted(true)
      setStartTime(Date.now())
    }

    // Only allow correct prefix
    let valid = true
    for (let i = 0; i < value.length; i++) {
      if (i >= sentence.length || value[i] !== sentence[i]) {
        valid = false
        break
      }
    }

    if (valid) {
      setTyped(value)
      if (value.length === sentence.length) {
        endGame(value, Date.now() - startTime)
      }
    } else {
      // Allow wrong chars too (but show as red)
      setTyped(value)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') return // allow backspace
  }

  // Render sentence with character-level coloring
  function renderSentence() {
    return sentence.split('').map((char, i) => {
      let color = '#9CA3AF' // not yet typed
      if (i < typed.length) {
        color = typed[i] === char ? '#22C55E' : '#EF4444'
      } else if (i === typed.length) {
        color = '#FF1493' // cursor position
      }
      return (
        <span
          key={i}
          style={{
            color,
            fontWeight: i === typed.length ? 'bold' : 'normal',
            borderBottom: i === typed.length ? '2px solid #FF1493' : 'none',
          }}
        >
          {char}
        </span>
      )
    })
  }

  const progress = started ? ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100 : 0
  const correctCount = typed.split('').filter((c, i) => c === sentence[i]).length

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="pixel-font text-xs text-[#FF1493] mb-1">Type Race ⌨️</div>
          <div className="font-bold text-lg text-[#FF69B4]">
            {gameOver ? `${finalWpm} ${typed.length >= sentence.length ? 'WPM' : 'chars'}` : `${correctCount}/${sentence.length} chars`}
          </div>
        </div>
        <div className="text-center">
          <div className="pixel-font text-lg text-[#FF1493]">{timeLeft}s</div>
          <div className="text-xs font-semibold text-gray-500">{started ? 'left' : 'ready'}</div>
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
            <div className="text-5xl mb-3">⌨️</div>
            <div className="pixel-font text-xs text-[#FF1493] mb-2">
              {typed.length >= sentence.length ? 'Finished!' : 'Time Up!'}
            </div>
            <div className="font-bold text-3xl text-[#FF69B4]">
              {finalWpm} {typed.length >= sentence.length ? 'WPM' : 'chars'}
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-2">Waiting~ ♡</p>
          </div>
        ) : (
          <>
            {!started && (
              <div className="text-center text-[#FF69B4] font-bold bounce-kawaii text-sm">
                Start typing to begin! ⌨️
              </div>
            )}

            <div className="card-pixel p-4 w-full max-w-sm text-center">
              <div style={{ fontFamily: 'monospace', fontSize: '1rem', lineHeight: 1.8, letterSpacing: '0.05em', userSelect: 'none' }}>
                {renderSentence()}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={gameOver}
              placeholder="Type here..."
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="input-pixel w-full max-w-sm text-center"
              style={{ fontSize: '0.9rem' }}
            />
          </>
        )}
      </div>
    </div>
  )
}
