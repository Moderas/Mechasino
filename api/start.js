import { getState, setState } from './_lib/redis.js';
import { generateFourMechas } from './_lib/mechas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerId, wager } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }

  if (![100, 250, 500].includes(wager)) {
    return res.status(400).json({ error: 'Wager must be 100, 250, or 500' });
  }

  const state = await getState();

  if (state.round && state.round.status !== 'results') {
    return res.status(400).json({ error: 'A round is already active' });
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return res.status(400).json({ error: 'Player not found' });
  }

  if (player.credits < wager) {
    return res.status(400).json({ error: 'Not enough credits' });
  }

  const mechas = generateFourMechas();

  state.round = {
    status: 'betting',
    wager,
    mechas,
    bets: {},
    passes: [],
    starterId: playerId,
    winnerIndex: null,
    results: null,
  };

  await setState(state);
  return res.status(200).json({ ok: true });
}
