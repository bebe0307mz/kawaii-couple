import type { Metadata } from 'next'
import Link from 'next/link'
import SakuraPetals from '@/components/SakuraPetals'
import { createServerSupabaseClient } from '@/lib/supabase'

type Props = {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `Join Kawaii Couple Game - ${code}`,
    description: "You've been invited to play Kawaii Couple mini games! Accept the invite and challenge your partner.",
    robots: { index: false, follow: false },
  }
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  let sessionValid = false
  let sessionStatus: string | null = null

  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase
      .from('game_sessions')
      .select('status, player1_username, player1_email')
      .eq('code', upperCode)
      .single()

    if (data) {
      sessionValid = true
      sessionStatus = data.status
    }
  } catch {
    sessionValid = false
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <SakuraPetals />

      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="pixel-font text-sm text-[#FF69B4]">
          Kawaii Couple
        </Link>
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        {sessionValid ? (
          <div className="card-pixel p-8 w-full max-w-md text-center">
            <div className="text-5xl mb-4 bounce-kawaii">🌸</div>
            <h1 className="pixel-font text-xs md:text-sm text-[#FF1493] mb-3 leading-relaxed">
              You&apos;ve been invited!
            </h1>
            <p className="font-bold text-[#C084FC] text-base mb-6">
              Play Kawaii Couple mini games together~ ♡
            </p>

            <div className="card-pixel-lavender p-5 mb-6 inline-block w-full">
              <p className="font-bold text-xs text-gray-500 mb-2">Your invite code</p>
              <div className="pixel-font text-3xl md:text-4xl text-[#FF1493] tracking-widest">
                {upperCode}
              </div>
            </div>

            {sessionStatus === 'finished' ? (
              <>
                <p className="font-semibold text-gray-500 mb-4 text-sm">
                  This game session has already finished~ ♡
                </p>
                <Link href="/auth" className="btn-pixel btn-pixel-lavender block w-full text-center">
                  Start a New Game ✿
                </Link>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-600 mb-6 text-sm">
                  {sessionStatus === 'playing'
                    ? 'Your babe already opened the game~ sign in to jump in ♡'
                    : 'Sign in to accept the invite and join the game~ ✿'}
                </p>
                <Link
                  href={`/auth?code=${upperCode}`}
                  className="btn-pixel block w-full text-center"
                >
                  Accept &amp; Play 🌸
                </Link>
                <p className="text-xs font-semibold text-gray-400 mt-4">
                  No password needed — magic link login ♡
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="card-pixel p-8 w-full max-w-md text-center">
            <div className="text-5xl mb-4">😿</div>
            <h1 className="pixel-font text-xs md:text-sm text-[#FF1493] mb-3 leading-relaxed">
              Invite not found
            </h1>
            <p className="font-semibold text-gray-600 mb-6">
              This invite code doesn&apos;t exist or has expired.
            </p>
            <div className="card-pixel p-4 mb-6 inline-block">
              <div className="pixel-font text-2xl text-gray-400 tracking-widest">
                {upperCode}
              </div>
            </div>
            <p className="font-semibold text-gray-500 text-sm mb-6">
              Ask your partner to create a new game session and share the code again~ ♡
            </p>
            <Link href="/auth" className="btn-pixel block w-full text-center">
              Go to Login 🌸
            </Link>
          </div>
        )}
      </div>

      <footer className="relative z-10 text-center py-4">
        <p className="text-sm font-semibold text-gray-400">
          Kawaii Couple by Roast Lab AI 🌸
        </p>
      </footer>
    </div>
  )
}
