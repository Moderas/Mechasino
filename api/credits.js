import { getState, setState } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }

  const state = await getState();

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return res.status(400).json({ error: 'Player not found' });
  }

  player.credits += 1000;
  player.poopCount += 1;

  await setState(state);
  return res.status(200).json({ ok: true, credits: player.credits, poopCount: player.poopCount });
}
