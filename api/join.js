import { randomUUID } from 'node:crypto';
import { getState, setState } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const cleanName = name.trim().slice(0, 20);
    const state = await getState();

    // Reconnect existing player with the same callsign
    const existing = state.players.find((p) => p.name === cleanName);
    if (existing) {
      existing.lastSeen = Date.now();
      await setState(state);
      return res.status(200).json({ playerId: existing.id });
    }

    if (state.players.length >= 8) {
      return res.status(400).json({ error: 'Lobby is full (max 8 players)' });
    }

    const playerId = randomUUID();
    state.players.push({
      id: playerId,
      name: cleanName,
      credits: 5000,
      poopCount: 0,
      lastSeen: Date.now(),
      totalWagers: 0,
      wins: 0,
      totalCreditsWagered: 0,
      totalCreditsWon: 0,
      badges: [],
      winStreak: 0,
      lastBetSlots: [],
      betMechaNames: [],
    });

    await setState(state);
    return res.status(200).json({ playerId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
