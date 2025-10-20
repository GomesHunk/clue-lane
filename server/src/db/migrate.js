import { query } from './index.js';

const schema = `
-- Tabela de Salas
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 8,
  rounds INTEGER NOT NULL DEFAULT 5,
  clue_time INTEGER NOT NULL DEFAULT 60,
  game_mode TEXT NOT NULL DEFAULT 'classic' CHECK (game_mode IN ('classic', 'easy', 'chaos')),
  current_round INTEGER NOT NULL DEFAULT 0,
  current_theme TEXT,
  custom_themes TEXT[],
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'briefing', 'clues', 'discussion', 'reveal', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Jogadores
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  secret_number INTEGER,
  clue TEXT,
  position INTEGER,
  score INTEGER NOT NULL DEFAULT 0,
  is_spectator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, device_id)
);

-- Tabela de Resultados das Rodadas
CREATE TABLE IF NOT EXISTS round_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  theme TEXT NOT NULL,
  was_correct BOOLEAN NOT NULL,
  mistakes INTEGER NOT NULL DEFAULT 0,
  completion_time INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, round_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_device_id ON players(device_id);
CREATE INDEX IF NOT EXISTS idx_round_results_room_id ON round_results(room_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_round_results_updated_at BEFORE UPDATE ON round_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

export const runMigrations = async () => {
  try {
    console.log('Running migrations...');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await query(statement);
    }

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};
