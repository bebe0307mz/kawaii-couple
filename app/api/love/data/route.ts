import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { PETS } from '@/lib/pets'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 })

    const supabase = createServerSupabaseClient()

    const [loveRes, petsRes] = await Promise.all([
      supabase.from('user_love_data').select('*').eq('user_id', userId).single(),
      supabase.from('user_pets').select('*').eq('user_id', userId).order('hatched_at', { ascending: false }),
    ])

    const pets = (petsRes.data || []).map((p) => ({ ...PETS[p.pet_id - 1], hatched_at: p.hatched_at, recordId: p.id }))

    return NextResponse.json({
      loveData: loveRes.data || { coins: 0, streak_days: 0, egg_ready: false },
      pets,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
