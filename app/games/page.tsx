import type { Metadata } from 'next'
import Link from 'next/link'
import SakuraPetals from '@/components/SakuraPetals'
import { GAME_META } from '@/lib/gameMeta'

export const metadata: Metadata = {
  title: 'All 30 Kawaii Couple Games - Free 2 Player Browser Games',
  description: 'Browse all 30 free couple mini games. Reflex, memory, trivia, word, and brain games. Pick one, share the code, play with your partner from any device.',
  alternates: { canonical: 'https://kawaiicouple.roastlabai.com/games' },
  openGraph: {
    title: 'All 30 Kawaii Couple Games - Free 2 Player Browser Games',
    description: 'Browse all 30 free couple mini games. Pick one, share the code, play with your partner.',
    url: 'https://kawaiicouple.roastlabai.com/games',
    type: 'website',
    images: ['/og-image.png'],
  },
}

export default function GamesIndex() {
  return (
    <div className="relative min-h-screen">
      <SakuraPetals />

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">Kawaii Couple</Link>
        <Link href="/auth" className="btn-pixel btn-pixel-white text-xs py-2 px-3">Play Free</Link>
      </nav>

      <main className="relative z-10 px-4 pt-6 pb-16 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 bounce-kawaii">🌸</div>
          <h1 className="pixel-font text-lg md:text-2xl text-[#FF1493] mb-3 leading-relaxed">
            All 30 Kawaii Couple Games
          </h1>
          <p className="font-bold text-base text-[#C084FC] mb-6">
            Free, browser-based, 2 player ✿
          </p>
          <Link href="/auth" className="btn-pixel">Start Playing 🌸</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GAME_META.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="card-pixel p-4 text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-2">{g.emoji}</div>
              <div className="font-bold text-sm text-gray-700 mb-1">{g.name}</div>
              <div className="text-xs text-gray-500 font-semibold">{g.duration}</div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="relative z-10 text-center py-8 px-4">
        <p className="font-semibold text-gray-400 text-sm">Kawaii Couple - free couple mini games 🌸</p>
      </footer>
    </div>
  )
}
