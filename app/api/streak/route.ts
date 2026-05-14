import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Read a user's current streak. Resets to 0 in the response if they
// skipped a day, but does not mutate the DB until they next ping.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_played_date')
      .eq('user_id', userId)
      .maybeSingle()

    if (!data) {
      return NextResponse.json({ current_streak: 0, longest_streak: 0, last_played_date: null })
    }

    const today = new Date().toISOString().slice(0, 10)
    const y = new Date()
    y.setUTCDate(y.getUTCDate() - 1)
    const yesterday = y.toISOString().slice(0, 10)

    // If their last play wasn't today or yesterday, their streak is functionally broken.
    // We still report the stored value with a 'broken' flag so the UI can show "play today to start a new streak!"
    const last = data.last_played_date as string | null
    const broken = last !== today && last !== yesterday

    return NextResponse.json({
      current_streak: broken ? 0 : data.current_streak,
      longest_streak: data.longest_streak,
      last_played_date: last,
      played_today: last === today,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
