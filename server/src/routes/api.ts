import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createRoom,
  getRoomByCode,
  getPlayersByRoomId,
  createPlayer,
  updateRoom,
  updatePlayer,
  deletePlayer,
  createRoundResult,
  deleteRoom,
} from '../db/queries.js';

const router = Router();

// POST /api/rooms - Create a room
router.post('/rooms', async (req: Request, res: Response) => {
  try {
    const {
      code,
      host_id,
      host_name,
      max_players,
      rounds,
      clue_time,
      game_mode,
      custom_themes,
      device_id,
    } = req.body;

    if (!code || !host_id || !host_name || !device_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create room
    const room = await createRoom({
      code,
      host_id,
      max_players: max_players || 8,
      rounds: rounds || 5,
      clue_time: clue_time || 60,
      game_mode: game_mode || 'classic',
      custom_themes,
    });

    // Create host as player
    const player = await createPlayer({
      room_id: room.id,
      name: host_name,
      is_host: true,
      device_id,
    });

    res.status(201).json({ room, player });
  } catch (error: any) {
    console.error('Error creating room:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/rooms/:code - Get room and players
router.get('/rooms/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const room = await getRoomByCode(code);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const players = await getPlayersByRoomId(room.id);

    res.json({ room, players });
  } catch (error: any) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/players - Join a room
router.post('/players', async (req: Request, res: Response) => {
  try {
    const { room_id, name, device_id, secret_number } = req.body;

    if (!room_id || !name || !device_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const player = await createPlayer({
      room_id,
      name,
      device_id,
      is_host: false,
      secret_number,
    });

    res.status(201).json(player);
  } catch (error: any) {
    console.error('Error creating player:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/players/:id - Update player
router.put('/players/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await updatePlayer(id, req.body);

    res.json(player);
  } catch (error: any) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/players/:id - Delete player
router.delete('/players/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deletePlayer(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/rooms/:id - Update room
router.put('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await updateRoom(id, req.body);
    res.json(room);
  } catch (error: any) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/rooms/:id - Delete room
router.delete('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteRoom(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/round-results - Create round result
router.post('/round-results', async (req: Request, res: Response) => {
  try {
    const result = await createRoundResult(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating round result:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
