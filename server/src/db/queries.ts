import { query } from '../db/client.js';
import { v4 as uuidv4 } from 'uuid';

export async function createRoom(data: {
  code: string;
  host_id: string;
  max_players: number;
  rounds: number;
  clue_time: number;
  game_mode: string;
  custom_themes?: string[];
}) {
  const { code, host_id, max_players, rounds, clue_time, game_mode, custom_themes } = data;

  try {
    const result = await query(
      `INSERT INTO rooms (code, host_id, max_players, rounds, clue_time, game_mode, custom_themes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, code, host_id, max_players, rounds, clue_time, game_mode, custom_themes, status, current_round, created_at`,
      [code, host_id, max_players, rounds, clue_time, game_mode, custom_themes || null, 'lobby']
    );

    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error(`Sala com código ${code} já existe`);
    }
    throw error;
  }
}

export async function getRoomByCode(code: string) {
  const result = await query(
    'SELECT * FROM rooms WHERE code = $1',
    [code]
  );
  return result.rows[0] || null;
}

export async function updateRoom(id: string, data: any) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  const result = await query(
    `UPDATE rooms SET ${setClause} WHERE id = $${keys.length + 1}
     RETURNING *`,
    [...values, id]
  );

  return result.rows[0];
}

export async function createPlayer(data: {
  room_id: string;
  name: string;
  is_host: boolean;
  device_id: string;
  secret_number?: number;
}) {
  const { room_id, name, is_host, device_id, secret_number } = data;

  try {
    const result = await query(
      `INSERT INTO players (room_id, name, is_host, device_id, secret_number, is_ready)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, room_id, name, is_host, device_id, score, is_ready, created_at`,
      [room_id, name, is_host, device_id, secret_number || null, is_host]
    );

    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('Player já existe nessa sala');
    }
    throw error;
  }
}

export async function getPlayersByRoomId(room_id: string) {
  const result = await query(
    'SELECT * FROM players WHERE room_id = $1 ORDER BY created_at ASC',
    [room_id]
  );
  return result.rows;
}

export async function updatePlayer(id: string, data: any) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  const result = await query(
    `UPDATE players SET ${setClause} WHERE id = $${keys.length + 1}
     RETURNING *`,
    [...values, id]
  );

  return result.rows[0];
}

export async function deletePlayer(id: string) {
  await query('DELETE FROM players WHERE id = $1', [id]);
}

export async function createRoundResult(data: {
  room_id: string;
  round_number: number;
  theme: string;
  was_correct: boolean;
  mistakes: number;
  completion_time?: number;
}) {
  const result = await query(
    `INSERT INTO round_results (room_id, round_number, theme, was_correct, mistakes, completion_time)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.room_id, data.round_number, data.theme, data.was_correct, data.mistakes, data.completion_time || null]
  );

  return result.rows[0];
}

export async function deleteRoom(id: string) {
  await query('DELETE FROM rooms WHERE id = $1', [id]);
}
