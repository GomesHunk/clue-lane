import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type Room = {
  id: string;
  code: string;
  host_id: string;
  max_players: number;
  rounds: number;
  clue_time: number;
  game_mode: string;
  custom_themes?: string[];
  current_round: number;
  status: string;
  current_theme?: string;
  created_at: string;
  updated_at: string;
};

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

let socket: Socket | null = null;

export function useRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const response = await fetch(`${API_URL}/api/rooms/${roomCode}`);
        if (!response.ok) {
          throw new Error('Sala não encontrada');
        }
        const data = await response.json();
        setRoom(data.room);
        setPlayers(data.players);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar sala');
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();

    // Connect to Socket.IO
    if (!socket) {
      socket = io(API_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    // Join room via Socket.IO
    if (socket?.connected) {
      socket.emit('room:join', { code: roomCode, player_id: 'temp' });
    }

    // Listen to real-time updates
    const handlePlayerJoined = () => {
      fetchRoom(); // Refetch to get updated players
    };

    const handlePlayerLeft = () => {
      fetchRoom();
    };

    const handleRoomUpdated = (data: any) => {
      setRoom((prev) => (prev ? { ...prev, ...data } : null));
    };

    socket?.on('room:player-joined', handlePlayerJoined);
    socket?.on('room:player-left', handlePlayerLeft);
    socket?.on('room:updated', handleRoomUpdated);

    return () => {
      socket?.off('room:player-joined', handlePlayerJoined);
      socket?.off('room:player-left', handlePlayerLeft);
      socket?.off('room:updated', handleRoomUpdated);
      socket?.emit('room:leave');
    };
  }, [roomCode]);

  return { room, players, loading, error, socket };
}
