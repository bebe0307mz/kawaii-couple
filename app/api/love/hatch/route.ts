import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getRandomPet, EGG_COIN_COST } from '@/lib/pets'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 })

    const supabase = createServerSupabaseClient()

    const { data: loveData } = await supabase
      .from('user_love_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!loveData || loveData.coins < EGG_COIN_COST) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 })
    }

    const pet = getRandomPet()

    // Save pet
    await supabase.from('user_pets').insert({ user_id: userId, pet_id: pet.id })

    // Deduct coins, reset egg_ready
    const newCoins = loveData.coins - EGG_COIN_COST
    await supabase.from('user_love_data').update({
      coins: newCoins,
      egg_ready: newCoins >= EGG_COIN_COST,
    }).eq('user_id', userId)

    return NextResponse.json({ pet, newCoins })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
