import { getState, setState } from './_lib/redis.js';
import { checkAndResolveRound } from './_lib/winner.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const playerId = req.query.playerId;
    const state = await getState();

    let needsSave = false;

    // Backfill stat fields for existing players
    for (const p of state.players) {
      if (p.totalWagers === undefined) {
        p.totalWagers = 0;
        p.wins = 0;
        p.totalCreditsWagered = 0;
        p.totalCreditsWon = 0;
        needsSave = true;
      }
      if (p.badges === undefined) {
        p.badges = [];
        p.winStreak = 0;
        p.lastBetSlots = [];
        p.betMechaNames = [];
        needsSave = true;
      }
    }

    if (playerId) {
      const player = state.players.find((p) => p.id === playerId);
      if (player) {
        player.lastSeen = Date.now();
        needsSave = true;
      }
    }

    // Auto-resolve if deadline expired
    if (state.round && state.round.status === 'betting' && state.round.deadline && Date.now() >= state.round.deadline) {
      await checkAndResolveRound(state, true);
      needsSave = true;
    }

    // Auto-clear round 15 seconds after results (or immediately if resolvedAt is missing)
    if (state.round && state.round.status === 'results') {
      if (!state.round.resolvedAt || Date.now() - state.round.resolvedAt >= 15000) {
        state.round = null;
        needsSave = true;
      }
    }

    if (needsSave) {
      await setState(state);
    }

    return res.status(200).json(state);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
