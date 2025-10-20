import { Server, Socket } from 'socket.io';
import { getRoomByCode, getPlayersByRoomId } from '../db/queries.js';

interface RoomSocket extends Socket {
  roomCode?: string;
  playerId?: string;
}

export function setupSockets(io: Server) {
  io.on('connection', (socket: RoomSocket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join room
    socket.on('room:join', async (data: { code: string; player_id: string }) => {
      try {
        const { code, player_id } = data;
        socket.roomCode = code;
        socket.playerId = player_id;

        socket.join(`room:${code}`);
        console.log(`📍 Player ${player_id} joined room ${code}`);

        // Broadcast to others in room
        io.to(`room:${code}`).emit('room:player-joined', {
          player_id,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('room:leave', () => {
      if (socket.roomCode) {
        socket.leave(`room:${socket.roomCode}`);
        io.to(`room:${socket.roomCode}`).emit('room:player-left', {
          player_id: socket.playerId,
          timestamp: new Date(),
        });
        console.log(`📍 Player ${socket.playerId} left room ${socket.roomCode}`);
      }
    });

    // Update room state
    socket.on('room:update', (data) => {
      if (socket.roomCode) {
        io.to(`room:${socket.roomCode}`).emit('room:updated', data);
        console.log(`🔄 Room ${socket.roomCode} updated:`, data);
      }
    });

    // Player ready
    socket.on('player:ready', (data: { room_code: string; player_id: string; is_ready: boolean }) => {
      if (socket.roomCode) {
        io.to(`room:${socket.roomCode}`).emit('player:status-changed', data);
        console.log(`👤 Player ${data.player_id} ready status:`, data.is_ready);
      }
    });

    // Game phase change
    socket.on('game:phase', (data) => {
      if (socket.roomCode) {
        io.to(`room:${socket.roomCode}`).emit('game:phase-changed', data);
        console.log(`🎮 Game phase changed in ${socket.roomCode}:`, data.status);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.roomCode && socket.playerId) {
        io.to(`room:${socket.roomCode}`).emit('room:player-left', {
          player_id: socket.playerId,
          timestamp: new Date(),
        });
        console.log(`❌ Player ${socket.playerId} disconnected from room ${socket.roomCode}`);
      }
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
}
