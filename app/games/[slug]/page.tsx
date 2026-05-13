import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SakuraPetals from '@/components/SakuraPetals'
import { GAME_META, gameBySlug } from '@/lib/gameMeta'

export async function generateStaticParams() {
  return GAME_META.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const game = gameBySlug(slug)
  if (!game) return {}

  const title = `${game.name} - Free 2 Player Couple Game | Kawaii Couple`
  const description = `${game.tagline}. Play ${game.name} free in your browser with your partner - no download, share an invite code, results in ${game.duration}.`
  const url = `https://kawaiicouple.roastlabai.com/games/${game.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Kawaii Couple',
      type: 'article',
      images: ['/og-image.png'],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  }
}

export default async function GameLandingPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const game = gameBySlug(slug)
  if (!game) notFound()

  const related = GAME_META.filter((g) => g.slug !== game.slug).slice(0, 6)

  return (
    <div className="relative min-h-screen">
      <SakuraPetals />

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">Kawaii Couple</Link>
        <Link href="/auth" className="btn-pixel btn-pixel-white text-xs py-2 px-3">Play Free</Link>
      </nav>

      <main className="relative z-10 px-4 pt-6 pb-16 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 bounce-kawaii">{game.emoji}</div>
          <h1 className="pixel-font text-lg md:text-2xl text-[#FF1493] mb-3 leading-relaxed">
            {game.name}
          </h1>
          <p className="font-bold text-lg text-[#C084FC] mb-6">{game.tagline} ♡</p>
          <Link href="/auth" className="btn-pixel">Play {game.name} Free 🌸</Link>
        </div>

        <section className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3">About this game</h2>
          <p className="text-gray-700 font-semibold leading-relaxed">{game.description}</p>
        </section>

        <section className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3">How to play</h2>
          <p className="text-gray-700 font-semibold leading-relaxed">{game.howToPlay}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold">
            <div className="bg-pink-50 rounded p-3">
              <div className="text-gray-500">Skill tested</div>
              <div className="text-[#FF1493]">{game.skill}</div>
            </div>
            <div className="bg-purple-50 rounded p-3">
              <div className="text-gray-500">Round length</div>
              <div className="text-[#C084FC]">{game.duration}</div>
            </div>
          </div>
        </section>

        <section className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3">Why couples love it</h2>
          <p className="text-gray-700 font-semibold leading-relaxed">{game.whyFun}</p>
        </section>

        <section className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3">How to play with your partner</h2>
          <ol className="space-y-2 text-gray-700 font-semibold">
            <li>1. Sign in with your email - one tap, no password.</li>
            <li>2. Create a session and you get a 6-letter invite code.</li>
            <li>3. Send the code to your partner. They open the site and join.</li>
            <li>4. You both play 5 random kawaii mini games. {game.name} might be one of them.</li>
            <li>5. Whoever wins more rounds wins the day. ♡</li>
          </ol>
          <div className="mt-5 text-center">
            <Link href="/auth" className="btn-pixel">Start Playing 🌸</Link>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3 text-center">More kawaii games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {related.map((g) => (
              <Link
                key={g.slug}
                href={`/games/${g.slug}`}
                className="card-pixel p-3 text-center hover:scale-105 transition-transform"
              >
                <div className="text-2xl mb-1">{g.emoji}</div>
                <div className="font-bold text-xs text-gray-700">{g.name}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 text-center py-8 px-4">
        <p className="font-semibold text-gray-400 text-sm">Kawaii Couple - free couple mini games 🌸</p>
      </footer>
    </div>
  )
}
