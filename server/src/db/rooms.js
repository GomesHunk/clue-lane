import { query } from '../db/index.js';

export const createRoom = async (roomData) => {
  const { code, hostId, maxPlayers, rounds, clueTime, gameMode, customThemes } = roomData;
  
  const result = await query(
    `INSERT INTO rooms (code, host_id, max_players, rounds, clue_time, game_mode, custom_themes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'lobby')
     RETURNING id, code, host_id, status, created_at`,
    [code, hostId, maxPlayers, rounds, clueTime, gameMode, customThemes]
  );
  
  return result.rows[0];
};

export const getRoomByCode = async (code) => {
  const result = await query(
    `SELECT * FROM rooms WHERE code = $1`,
    [code]
  );
  
  return result.rows[0];
};

export const updateRoomStatus = async (roomId, status) => {
  const result = await query(
    `UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *`,
    [status, roomId]
  );
  
  return result.rows[0];
};

export const updateRoomRound = async (roomId, roundNumber, theme) => {
  const result = await query(
    `UPDATE rooms SET current_round = $1, current_theme = $2 WHERE id = $3 RETURNING *`,
    [roundNumber, theme, roomId]
  );
  
  return result.rows[0];
};

export const deleteRoom = async (roomId) => {
  await query(`DELETE FROM rooms WHERE id = $1`, [roomId]);
};
