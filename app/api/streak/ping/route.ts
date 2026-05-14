import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Bump the user's daily streak. Idempotent within a single UTC day.
export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)

    const { data: existing } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_played_date')
      .eq('user_id', userId)
      .maybeSingle()

    let current_streak = 1
    let longest_streak = 1
    if (existing) {
      const last = existing.last_played_date as string | null
      if (last === today) {
        return NextResponse.json({
          current_streak: existing.current_streak,
          longest_streak: existing.longest_streak,
          last_played_date: last,
          bumped: false,
        })
      }
      // Yesterday?
      const y = new Date()
      y.setUTCDate(y.getUTCDate() - 1)
      const yesterday = y.toISOString().slice(0, 10)
      current_streak = last === yesterday ? existing.current_streak + 1 : 1
      longest_streak = Math.max(existing.longest_streak, current_streak)
    }

    const { error } = await supabase
      .from('user_streaks')
      .upsert(
        {
          user_id: userId,
          current_streak,
          longest_streak,
          last_played_date: today,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    if (error) throw error

    return NextResponse.json({
      current_streak,
      longest_streak,
      last_played_date: today,
      bumped: true,
    })
  } catch (e) {
    console.error('streak ping error', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
