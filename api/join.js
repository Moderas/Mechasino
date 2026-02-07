import { getState, setState } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const cleanName = name.trim().slice(0, 20);
  const state = await getState();

  if (state.players.length >= 8) {
    return res.status(400).json({ error: 'Lobby is full (max 8 players)' });
  }

  const playerId = crypto.randomUUID();
  state.players.push({
    id: playerId,
    name: cleanName,
    credits: 5000,
    poopCount: 0,
    lastSeen: Date.now(),
  });

  await setState(state);
  return res.status(200).json({ playerId });
}
