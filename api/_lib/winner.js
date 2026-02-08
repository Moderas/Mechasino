import { getMechaStrength } from './mechas.js';
import { getMechaStats, setMechaStats } from './redis.js';
import { checkAndAwardBadges } from './badges.js';

export async function checkAndResolveRound(state, force = false) {
  const { round, players } = state;
  if (!round || round.status !== 'betting') return false;

  const activePlayers = players.filter(
    (p) => Date.now() - p.lastSeen < 60000
  );

  const totalDecided =
    Object.keys(round.bets).length + round.passes.length;

  const deadlineExpired = round.deadline && Date.now() >= round.deadline;

  if (!force && !deadlineExpired && totalDecided < activePlayers.length) return false;

  // Resolve round
  round.status = 'revealing';
  const strengths = round.mechas.map((m) => getMechaStrength(m.name));
  const totalStrength = strengths.reduce((sum, s) => sum + s, 0);
  const roll = Math.random() * totalStrength;
  let cumulative = 0;
  let winnerIndex = 0;
  for (let i = 0; i < strengths.length; i++) {
    cumulative += strengths[i];
    if (roll < cumulative) {
      winnerIndex = i;
      break;
    }
  }
  round.winnerIndex = winnerIndex;

  const bettorIds = Object.keys(round.bets);
  const totalPot = bettorIds.length * round.wager;

  const winnerPlayerIds = bettorIds.filter(
    (id) => round.bets[id] === winnerIndex
  );

  const payouts = {};

  // Update stats for all bettors
  for (const id of bettorIds) {
    const player = players.find((p) => p.id === id);
    if (player) {
      player.totalWagers = (player.totalWagers || 0) + 1;
      player.totalCreditsWagered = (player.totalCreditsWagered || 0) + round.wager;
    }
  }

  if (winnerPlayerIds.length > 0) {
    // Winners split the pot
    const share = Math.floor(totalPot / winnerPlayerIds.length);
    for (const id of winnerPlayerIds) {
      payouts[id] = share;
      const player = players.find((p) => p.id === id);
      if (player) {
        player.credits += share;
        player.wins = (player.wins || 0) + 1;
        player.totalCreditsWon = (player.totalCreditsWon || 0) + share;
      }
    }
  }
  // Losers keep their loss — no refund

  // Check and award badges for all bettors
  for (const id of bettorIds) {
    const player = players.find((p) => p.id === id);
    if (player) checkAndAwardBadges(player, round);
  }

  round.results = { winnerIndex, payouts };
  round.status = 'results';
  round.resolvedAt = Date.now();

  // Record mecha appearance/win stats
  const mechaStats = await getMechaStats();
  for (let i = 0; i < round.mechas.length; i++) {
    const name = round.mechas[i].name;
    if (!mechaStats[name]) mechaStats[name] = { a: 0, w: 0 };
    mechaStats[name].a++;
    if (i === winnerIndex) mechaStats[name].w++;
  }
  await setMechaStats(mechaStats);

  return true;
}
