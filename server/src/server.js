import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { runMigrations } from './db/migrate.js';
import roomsRouter from './routes/rooms.js';
import playersRouter from './routes/players.js';
import { getPlayersByRoomId } from './db/players.js';
import { getRoomByCode } from './db/rooms.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/rooms', roomsRouter);
app.use('/api/players', playersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO - Real-time events
const roomConnections = new Map(); // Rastrear conexões por sala

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Entrar numa sala
  socket.on('join-room', async (data) => {
    try {
      const { roomCode, playerId } = data;
      const room = await getRoomByCode(roomCode.toUpperCase());

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      socket.join(`room:${room.id}`);
      
      if (!roomConnections.has(room.id)) {
        roomConnections.set(room.id, new Set());
      }
      roomConnections.get(room.id).add(socket.id);

      // Notificar outros que alguém entrou
      const players = await getPlayersByRoomId(room.id);
      io.to(`room:${room.id}`).emit('players-updated', players);

      console.log(`User ${socket.id} joined room ${room.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Atualizar status do jogador
  socket.on('player-ready', async (data) => {
    try {
      const { roomId, playerId, isReady } = data;
      io.to(`room:${roomId}`).emit('player-ready', { playerId, isReady });

      const players = await getPlayersByRoomId(roomId);
      io.to(`room:${roomId}`).emit('players-updated', players);
    } catch (error) {
      console.error('Error updating player ready status:', error);
    }
  });

  // Enviar dica
  socket.on('submit-clue', (data) => {
    const { roomId, playerId, clue } = data;
    io.to(`room:${roomId}`).emit('clue-submitted', { playerId, clue });
  });

  // Mudar status da sala (ex: lobby → clues → discussion)
  socket.on('room-status-changed', (data) => {
    const { roomId, status } = data;
    io.to(`room:${roomId}`).emit('room-status-changed', { status });
  });

  // Sair da sala
  socket.on('leave-room', async (data) => {
    try {
      const { roomId } = data;
      
      if (roomConnections.has(roomId)) {
        roomConnections.get(roomId).delete(socket.id);
        if (roomConnections.get(roomId).size === 0) {
          roomConnections.delete(roomId);
        }
      }

      socket.leave(`room:${roomId}`);
      
      const players = await getPlayersByRoomId(roomId);
      io.to(`room:${roomId}`).emit('players-updated', players);

      console.log(`User ${socket.id} left room ${roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Inicializar servidor
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('✅ Database migrations completed');

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready for real-time updates`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
