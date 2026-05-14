import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { COINS_PER_SESSION, EGG_COIN_COST } from '@/lib/pets'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    // Get or create user love data
    const { data: existing } = await supabase
      .from('user_love_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!existing) {
      // First time - create record
      await supabase.from('user_love_data').insert({
        user_id: userId,
        coins: COINS_PER_SESSION,
        streak_days: 1,
        last_play_date: today,
        egg_ready: COINS_PER_SESSION >= EGG_COIN_COST,
      })
      return NextResponse.json({ coins: COINS_PER_SESSION, streak: 1, eggReady: false, alreadyAwarded: false })
    }

    // Already played today?
    if (existing.last_play_date === today) {
      return NextResponse.json({
        coins: existing.coins,
        streak: existing.streak_days,
        eggReady: existing.egg_ready,
        alreadyAwarded: true,
      })
    }

    // Check if consecutive day
    const lastDate = existing.last_play_date ? new Date(existing.last_play_date) : null
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = lastDate && lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]

    const newStreak = isConsecutive ? existing.streak_days + 1 : 1
    const newCoins = existing.coins + COINS_PER_SESSION
    const eggReady = newCoins >= EGG_COIN_COST

    await supabase.from('user_love_data').update({
      coins: newCoins,
      streak_days: newStreak,
      last_play_date: today,
      egg_ready: eggReady,
    }).eq('user_id', userId)

    return NextResponse.json({ coins: newCoins, streak: newStreak, eggReady, alreadyAwarded: false })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
