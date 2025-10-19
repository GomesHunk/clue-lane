-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 8,
  rounds INTEGER NOT NULL DEFAULT 5,
  clue_time INTEGER NOT NULL DEFAULT 60,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('classic', 'easy', 'chaos')),
  current_round INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'briefing', 'clues', 'discussion', 'reveal', 'finished')),
  custom_themes TEXT[],
  current_theme TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
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

-- Create round_results table
CREATE TABLE public.round_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  theme TEXT NOT NULL,
  was_correct BOOLEAN NOT NULL,
  mistakes INTEGER NOT NULL DEFAULT 0,
  completion_time INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, round_number)
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (public read, host can update)
CREATE POLICY "Rooms are viewable by everyone"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create a room"
  ON public.rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Host can update their room"
  ON public.rooms FOR UPDATE
  USING (true);

CREATE POLICY "Host can delete their room"
  ON public.rooms FOR DELETE
  USING (true);

-- RLS Policies for players (public read, own player can update)
CREATE POLICY "Players are viewable by everyone"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join as a player"
  ON public.players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own data"
  ON public.players FOR UPDATE
  USING (true);

CREATE POLICY "Players can delete themselves"
  ON public.players FOR DELETE
  USING (true);

-- RLS Policies for round_results (public read)
CREATE POLICY "Round results are viewable by everyone"
  ON public.round_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create round results"
  ON public.round_results FOR INSERT
  WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.round_results;