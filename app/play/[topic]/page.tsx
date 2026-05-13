import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SakuraPetals from '@/components/SakuraPetals'
import { TOPIC_META, topicBySlug, gamesForTopic } from '@/lib/topicMeta'

export async function generateStaticParams() {
  return TOPIC_META.map((t) => ({ topic: t.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ topic: string }> },
): Promise<Metadata> {
  const { topic } = await params
  const t = topicBySlug(topic)
  if (!t) return {}
  const url = `https://kawaiicouple.roastlabai.com/play/${t.slug}`
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: url },
    openGraph: {
      title: t.title,
      description: t.description,
      url,
      siteName: 'Kawaii Couple',
      type: 'article',
      images: ['/og-image.png'],
    },
    twitter: { card: 'summary_large_image', title: t.title, description: t.description, images: ['/og-image.png'] },
  }
}

export default async function TopicPage(
  { params }: { params: Promise<{ topic: string }> },
) {
  const { topic } = await params
  const t = topicBySlug(topic)
  if (!t) notFound()

  const games = gamesForTopic(t)
  const otherTopics = TOPIC_META.filter((x) => x.slug !== t.slug)

  return (
    <div className="relative min-h-screen">
      <SakuraPetals />

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">Kawaii Couple</Link>
        <Link href="/auth" className="btn-pixel btn-pixel-white text-xs py-2 px-3">Play Free</Link>
      </nav>

      <main className="relative z-10 px-4 pt-6 pb-16 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 bounce-kawaii">💕</div>
          <h1 className="pixel-font text-base md:text-xl text-[#FF1493] mb-4 leading-relaxed">
            {t.h1}
          </h1>
          <Link href="/auth" className="btn-pixel">Start a Session 🌸</Link>
        </div>

        <section className="card-pixel p-6 mb-6">
          <p className="text-gray-700 font-semibold leading-relaxed">{t.intro}</p>
        </section>

        <section className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3">Who it is for</h2>
          <p className="text-gray-700 font-semibold leading-relaxed">{t.audience}</p>
        </section>

        <section className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3">Why it works</h2>
          <p className="text-gray-700 font-semibold leading-relaxed">{t.why}</p>
        </section>

        <section className="mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3 text-center">Featured games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {games.map((g) => (
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
          <div className="text-center mt-6">
            <Link href="/games" className="btn-pixel btn-pixel-lavender">See All 30 Games ✿</Link>
          </div>
        </section>

        <section className="card-pixel p-6 mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3">How it works</h2>
          <ol className="space-y-2 text-gray-700 font-semibold">
            <li>1. Sign in with your email - one tap, no password.</li>
            <li>2. Start a session and you get a 6-letter invite code.</li>
            <li>3. Send the code to your partner. They open the site and join.</li>
            <li>4. Both of you play 5 random kawaii mini games at the same time.</li>
            <li>5. The site tallies the score and crowns whoever wins more rounds.</li>
          </ol>
          <div className="mt-5 text-center">
            <Link href="/auth" className="btn-pixel">Try It Free 🌸</Link>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="pixel-font text-xs text-[#FF1493] mb-3 text-center">More for couples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {otherTopics.map((o) => (
              <Link
                key={o.slug}
                href={`/play/${o.slug}`}
                className="card-pixel p-3 text-center hover:scale-105 transition-transform"
              >
                <div className="font-bold text-sm text-gray-700">{o.h1}</div>
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
