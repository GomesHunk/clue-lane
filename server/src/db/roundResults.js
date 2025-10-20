import { query } from '../db/index.js';

export const createRoundResult = async (resultData) => {
  const { roomId, roundNumber, theme, wasCorrect, mistakes } = resultData;
  
  const result = await query(
    `INSERT INTO round_results (room_id, round_number, theme, was_correct, mistakes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [roomId, roundNumber, theme, wasCorrect, mistakes]
  );
  
  return result.rows[0];
};

export const getRoundResultsByRoomId = async (roomId) => {
  const result = await query(
    `SELECT * FROM round_results WHERE room_id = $1 ORDER BY round_number ASC`,
    [roomId]
  );
  
  return result.rows;
};
