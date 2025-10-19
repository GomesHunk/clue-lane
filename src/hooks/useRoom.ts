import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Room = Database['public']['Tables']['rooms']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

export function useRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let roomChannel: ReturnType<typeof supabase.channel> | null = null;
    let playersChannel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchRoom() {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (error) {
        setError('Sala não encontrada');
        setLoading(false);
        return;
      }

      setRoom(data);
    }

    async function fetchPlayers() {
      if (!room) return;

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      setPlayers(data || []);
      setLoading(false);
    }

    fetchRoom();

    // Subscribe to room changes
    roomChannel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRoom(payload.new as Room);
          } else if (payload.eventType === 'DELETE') {
            setError('Sala foi encerrada');
          }
        }
      )
      .subscribe();

    if (room) {
      fetchPlayers();

      // Subscribe to players changes
      playersChannel = supabase
        .channel(`players:${room.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'players',
            filter: `room_id=eq.${room.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setPlayers(prev => [...prev, payload.new as Player]);
            } else if (payload.eventType === 'UPDATE') {
              setPlayers(prev =>
                prev.map(p => (p.id === payload.new.id ? payload.new as Player : p))
              );
            } else if (payload.eventType === 'DELETE') {
              setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }

    return () => {
      roomChannel?.unsubscribe();
      playersChannel?.unsubscribe();
    };
  }, [roomCode, room?.id]);

  return { room, players, loading, error };
}
