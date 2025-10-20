import express from 'express';
import { createRoom, getRoomByCode, updateRoomStatus, updateRoomRound } from '../db/rooms.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/rooms - Criar nova sala
router.post('/', async (req, res) => {
  try {
    const { code, hostName, maxPlayers, rounds, clueTime, gameMode, customThemes } = req.body;

    if (!code || !hostName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hostId = uuidv4();
    
    const room = await createRoom({
      code,
      hostId,
      maxPlayers: parseInt(maxPlayers) || 8,
      rounds: parseInt(rounds) || 5,
      clueTime: parseInt(clueTime) || 60,
      gameMode: gameMode || 'classic',
      customThemes: customThemes && customThemes.length > 0 ? customThemes : null,
    });

    res.status(201).json({ room, hostId });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms/:code - Obter sala por código
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const room = await getRoomByCode(code.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/rooms/:id/status - Atualizar status da sala
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const room = await updateRoomStatus(id, status);
    res.json(room);
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/rooms/:id/round - Atualizar rodada
router.put('/:id/round', async (req, res) => {
  try {
    const { id } = req.params;
    const { roundNumber, theme } = req.body;

    if (roundNumber === undefined || !theme) {
      return res.status(400).json({ error: 'Round number and theme are required' });
    }

    const room = await updateRoomRound(id, roundNumber, theme);
    res.json(room);
  } catch (error) {
    console.error('Error updating room round:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
