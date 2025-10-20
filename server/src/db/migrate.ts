import { query } from './client.js';

const migrations = [
  {
    name: '001_init_schema',
    up: `
      -- ROOMS
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        host_id TEXT NOT NULL,
        max_players INTEGER NOT NULL DEFAULT 8,
        rounds INTEGER NOT NULL DEFAULT 5,
        clue_time INTEGER NOT NULL DEFAULT 60,
        game_mode TEXT NOT NULL DEFAULT 'classic' CHECK (game_mode IN ('classic', 'easy', 'chaos')),
        current_round INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'briefing', 'clues', 'discussion', 'reveal', 'finished')),
        custom_themes TEXT[],
        current_theme TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- PLAYERS
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        is_host BOOLEAN NOT NULL DEFAULT false,
        is_ready BOOLEAN NOT NULL DEFAULT false,
        secret_number INTEGER,
        clue TEXT,
        position INTEGER,
        score INTEGER NOT NULL DEFAULT 0,
        is_spectator BOOLEAN NOT NULL DEFAULT false,
        device_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(room_id, device_id)
      );

      -- ROUND_RESULTS
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

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
      CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
      CREATE INDEX IF NOT EXISTS idx_players_room_device ON players(room_id, device_id);
      CREATE INDEX IF NOT EXISTS idx_round_results_room_id ON round_results(room_id);

      -- FUNCTION: updated_at trigger
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- TRIGGERS
      DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
      CREATE TRIGGER update_rooms_updated_at
      BEFORE UPDATE ON rooms
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_players_updated_at ON players;
      CREATE TRIGGER update_players_updated_at
      BEFORE UPDATE ON players
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

      -- MIGRATIONS TABLE
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT now()
      );
    `,
  },
];

export async function runMigrations() {
  console.log('🚀 Starting migrations...');
  
  try {
    for (const migration of migrations) {
      const result = await query(
        'SELECT * FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`✓ Running migration: ${migration.name}`);
        await query(migration.up);
        await query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`✅ Migration ${migration.name} completed`);
      } else {
        console.log(`⏭️  Skipping migration: ${migration.name} (already ran)`);
      }
    }
    console.log('✨ All migrations completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
