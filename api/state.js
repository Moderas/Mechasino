import { getState, setState } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const playerId = req.query.playerId;
  const state = await getState();

  // Update lastSeen for the polling player
  if (playerId) {
    const player = state.players.find((p) => p.id === playerId);
    if (player) {
      player.lastSeen = Date.now();
      await setState(state);
    }
  }

  return res.status(200).json(state);
}
