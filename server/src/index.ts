import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, query } from './db/client.js';
import { runMigrations } from './db/migrate.js';
import apiRoutes from './routes/api.js';
import { setupSockets } from './sockets/handlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api', apiRoutes);

// Socket.IO handlers
setupSockets(io);

// Start server
async function start() {
  try {
    console.log('🔌 Testing database connection...');
    const result = await query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);

    console.log('🔄 Running migrations...');
    await runMigrations();

    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📡 WebSocket enabled for real-time updates`);
      console.log(`✨ Ready to accept connections!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

start();
