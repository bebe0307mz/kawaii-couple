ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS player1_username TEXT;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS player2_username TEXT;
