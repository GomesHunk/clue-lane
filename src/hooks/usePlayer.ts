import { useState, useEffect } from 'react';
import { generateDeviceId } from '@/lib/gameUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type Player = {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  is_ready: boolean;
  secret_number?: number;
  clue?: string;
  position?: number;
  score: number;
  is_spectator: boolean;
  device_id: string;
  created_at: string;
  updated_at: string;
};

export function usePlayer(roomId: string | undefined) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [deviceId] = useState(generateDeviceId());

  useEffect(() => {
    if (!roomId) return;

    async function fetchPlayer() {
      try {
        const response = await fetch($/api/rooms/Supabase folder deleted{roomId});
        if (!response.ok) return;
        const data = await response.json();
        const currentPlayer = data.players.find((p: Player) => p.device_id === deviceId);
        if (currentPlayer) {
          setPlayer(currentPlayer);
        }
      } catch (error) {
        console.error('Error fetching player:', error);
      }
    }

    fetchPlayer();
  }, [roomId, deviceId]);

  const updatePlayer = async (updates: Partial<Player>) => {
    if (!player) return null;
    try {
      const response = await fetch($/api/players/Supabase folder deleted{player.id}, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update player');
      const updated = await response.json();
      setPlayer(updated);
      return updated;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  };

  return { player, setPlayer, deviceId, updatePlayer };
}
