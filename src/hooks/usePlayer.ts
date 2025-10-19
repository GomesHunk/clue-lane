import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateDeviceId } from '@/lib/gameUtils';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

export function usePlayer(roomId: string | undefined) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [deviceId] = useState(generateDeviceId());

  useEffect(() => {
    if (!roomId) return;

    async function fetchPlayer() {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .eq('device_id', deviceId)
        .single();

      if (data) {
        setPlayer(data);
      }
    }

    fetchPlayer();

    // Subscribe to player changes
    const channel = supabase
      .channel(`player:${roomId}:${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedPlayer = payload.new as Player;
            if (updatedPlayer.device_id === deviceId) {
              setPlayer(updatedPlayer);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, deviceId]);

  return { player, deviceId };
}
