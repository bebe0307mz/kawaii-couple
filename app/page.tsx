import Link from 'next/link'
import SakuraPetals from '@/components/SakuraPetals'
import { TOPIC_META } from '@/lib/topicMeta'

const GAMES = [
  {
    emoji: '💝',
    name: 'Heart Tap',
    desc: 'Tap falling hearts as fast as you can! Most taps in 60 seconds wins.',
    color: 'bg-pink-100',
  },
  {
    emoji: '🃏',
    name: 'Love Memory',
    desc: 'Match kawaii emoji pairs! Complete the board fastest to win.',
    color: 'bg-purple-100',
  },
  {
    emoji: '⚡',
    name: 'Reflex Duel',
    desc: 'Click when the screen flashes pink! Fastest reaction wins.',
    color: 'bg-yellow-100',
  },
  {
    emoji: '🔤',
    name: 'Word Scramble',
    desc: 'Unscramble cute Japanese words! Answer 5 in 2 minutes.',
    color: 'bg-green-100',
  },
  {
    emoji: '🧠',
    name: 'Kawaii Quiz',
    desc: '10 questions about kawaii culture! Most correct answers wins.',
    color: 'bg-blue-100',
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <SakuraPetals />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between gap-2 px-4 py-4 md:px-8">
        <div className="pixel-font text-sm text-[#FF69B4]">Kawaii Couple</div>
        <div className="flex gap-2">
          <a
            href="https://ko-fi.com/roastlabai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pixel btn-pixel-white text-xs py-2 px-3"
          >
            ☕ Ko-fi
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-4 pt-8 pb-16">
        <div className="bounce-kawaii text-6xl mb-6">🌸</div>

        <h1 className="pixel-font text-xl md:text-3xl text-[#FF1493] mb-4 leading-relaxed">
          Kawaii Couple
        </h1>

        <p className="font-nunito text-lg md:text-xl font-800 text-[#FF69B4] mb-2 max-w-md">
          Play 5 mini games with your babe.
        </p>
        <p className="text-xl font-bold text-[#C084FC] mb-8">
          Who wins today? (◕‿◠)✿
        </p>

        <Link href="/auth" className="btn-pixel text-sm mb-4">
          ✿ Start Playing ✿
        </Link>

        <p className="text-sm text-gray-500 font-semibold">
          No download needed - play in your browser! ♡
        </p>

        {/* Decorative row */}
        <div className="flex gap-4 mt-8 text-2xl">
          <span>💝</span><span>🌸</span><span>✿</span><span>♡</span><span>★</span><span>✿</span><span>🌸</span><span>💝</span>
        </div>

        {/* Game cards */}
        <section className="mt-12 w-full max-w-4xl">
          <h2 className="pixel-font text-base md:text-lg text-[#FF1493] mb-8">
            ★ 5 Mini Games ★
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map((game, i) => (
              <div key={i} className="card-pixel p-5 text-left hover:translate-y-[-2px] transition-transform">
                <div className="text-4xl mb-3">{game.emoji}</div>
                <div className={`inline-block px-2 py-1 text-xs font-bold rounded mb-2 ${game.color}`}>
                  Game {i + 1}
                </div>
                <h3 className="pixel-font text-xs text-[#FF1493] mb-2">{game.name}</h3>
                <p className="text-sm font-semibold text-gray-600">{game.desc}</p>
              </div>
            ))}

            {/* How to play card */}
            <div className="card-pixel-lavender p-5 text-left sm:col-span-2 lg:col-span-1">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="pixel-font text-xs text-[#C084FC] mb-3">How to Play</h3>
              <ul className="text-sm font-semibold text-gray-600 space-y-2">
                <li>♡ Login with your email</li>
                <li>♡ Share your invite code</li>
                <li>♡ Partner joins with the code</li>
                <li>♡ Play 5 games together!</li>
                <li>♡ Winner gets bragging rights</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 card-pixel p-8 max-w-md w-full">
          <p className="pixel-font text-sm text-[#FF1493] mb-4">Ready to play? ♡</p>
          <p className="font-semibold text-gray-600 mb-6">
            (◡‿◡✿) Play on your own devices, scores sync in real time!
          </p>
          <Link href="/auth" className="btn-pixel">
            🌸 Play Now 🌸
          </Link>
        </div>

        {/* Ko-fi section */}
        <div className="mt-12 text-center">
          <p className="font-semibold text-gray-600 mb-3">Love Kawaii Couple? Buy us a coffee~ ♡</p>
          <a
            href="https://ko-fi.com/roastlabai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pixel btn-pixel-lavender"
          >
            ☕ Support on Ko-fi
          </a>
        </div>
      </main>

      {/* Browse hub for SEO + discovery */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 mt-16 mb-12">
        <h2 className="pixel-font text-sm text-[#FF1493] mb-5 text-center">Browse couple games ✿</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {TOPIC_META.map((t) => (
            <Link
              key={t.slug}
              href={`/play/${t.slug}`}
              className="card-pixel p-3 text-center hover:scale-105 transition-transform"
            >
              <div className="font-bold text-sm text-gray-700">{t.h1}</div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href="/games" className="btn-pixel btn-pixel-lavender text-xs py-2 px-4">
            See all 30 games ★
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t-2 border-pink-200">
        <p className="font-semibold text-gray-500">
          Kawaii Couple by Roast Lab AI 🌸
        </p>
        <p className="text-sm text-gray-400 mt-1">(✿◠‿◠) Made with love</p>
        <div className="mt-2">
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-[#FF69B4] font-semibold">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}
