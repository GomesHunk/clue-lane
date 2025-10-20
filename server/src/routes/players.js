import express from 'express';
import { createPlayer, getPlayersByRoomId, updatePlayer, deletePlayer } from '../db/players.js';

const router = express.Router();

// POST /api/players - Criar novo jogador
router.post('/', async (req, res) => {
  try {
    const { roomId, name, deviceId, isHost } = req.body;

    if (!roomId || !name || !deviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const player = await createPlayer({
      roomId,
      name,
      deviceId,
      isHost: isHost || false,
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/players/:roomId - Obter jogadores de uma sala
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const players = await getPlayersByRoomId(roomId);

    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/players/:id - Atualizar jogador
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const player = await updatePlayer(id, updates);
    res.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/players/:id - Deletar jogador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deletePlayer(id);

    res.json({ message: 'Player deleted' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
