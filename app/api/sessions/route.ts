import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { generateGameCode } from '@/lib/gameUtils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { player1_id, player1_email, player1_username } = body

    if (!player1_id || !player1_email) {
      return NextResponse.json({ error: 'Missing player info' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const code = generateGameCode()

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        code,
        player1_id,
        player1_email,
        player1_username,
        status: 'waiting',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
