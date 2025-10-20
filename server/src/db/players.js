import { query } from '../db/index.js';

export const createPlayer = async (playerData) => {
  const { roomId, name, deviceId, isHost = false } = playerData;
  
  const result = await query(
    `INSERT INTO players (room_id, name, device_id, is_host, is_ready)
     VALUES ($1, $2, $3, $4, false)
     RETURNING id, room_id, name, device_id, is_host, is_ready, created_at`,
    [roomId, name, deviceId, isHost]
  );
  
  return result.rows[0];
};

export const getPlayersByRoomId = async (roomId) => {
  const result = await query(
    `SELECT * FROM players WHERE room_id = $1 ORDER BY created_at ASC`,
    [roomId]
  );
  
  return result.rows;
};

export const updatePlayer = async (playerId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = $${paramCount}`);
    values.push(value);
    paramCount++;
  });

  values.push(playerId);

  const result = await query(
    `UPDATE players SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deletePlayer = async (playerId) => {
  await query(`DELETE FROM players WHERE id = $1`, [playerId]);
};

export const deletePlayersByRoomId = async (roomId) => {
  await query(`DELETE FROM players WHERE room_id = $1`, [roomId]);
};
