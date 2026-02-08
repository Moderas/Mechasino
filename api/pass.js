import { getState, setState } from './_lib/redis.js';
import { checkAndResolveRound } from './_lib/winner.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }

    const state = await getState();

    if (!state.round || state.round.status !== 'betting') {
      return res.status(400).json({ error: 'No active betting round' });
    }

    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return res.status(400).json({ error: 'Player not found' });
    }

    if (state.round.bets[playerId] !== undefined) {
      return res.status(400).json({ error: 'Already placed a bet' });
    }

    if (state.round.passes.includes(playerId)) {
      return res.status(400).json({ error: 'Already passed' });
    }

    state.round.passes.push(playerId);

    // Start 10s countdown on first decision
    if (!state.round.deadline) {
      state.round.deadline = Date.now() + 10000;
    }

    await checkAndResolveRound(state);

    await setState(state);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
