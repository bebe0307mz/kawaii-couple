CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  player1_id UUID,
  player1_email TEXT,
  player2_id UUID,
  player2_email TEXT,
  status TEXT DEFAULT 'waiting',
  current_game INTEGER DEFAULT 0,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  game_scores JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert game sessions" ON game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game sessions" ON game_sessions FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL,
  player_id UUID,
  player_email TEXT,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read game events" ON game_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert game events" ON game_events FOR INSERT WITH CHECK (true);
