import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export type GameSession = {
  id: string
  code: string
  player1_id: string | null
  player1_email: string | null
  player2_id: string | null
  player2_email: string | null
  status: 'waiting' | 'playing' | 'finished'
  current_game: number
  player1_score: number
  player2_score: number
  game_scores: GameScore[]
  created_at: string
  updated_at: string
}

export type GameScore = {
  game: number
  player1: number
  player2: number
  winner: 'player1' | 'player2' | 'tie'
}

export type GameEvent = {
  id: string
  session_code: string
  player_id: string | null
  player_email: string | null
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}
