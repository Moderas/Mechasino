export function checkAndResolveRound(state) {
  const { round, players } = state;
  if (!round || round.status !== 'betting') return false;

  const activePlayers = players.filter(
    (p) => Date.now() - p.lastSeen < 60000
  );

  const totalDecided =
    Object.keys(round.bets).length + round.passes.length;

  if (totalDecided < activePlayers.length) return false;

  // All active players have decided — resolve round
  round.status = 'revealing';
  const winnerIndex = Math.floor(Math.random() * 4);
  round.winnerIndex = winnerIndex;

  const bettorIds = Object.keys(round.bets);
  const totalPot = bettorIds.length * round.wager;

  const winnerPlayerIds = bettorIds.filter(
    (id) => round.bets[id] === winnerIndex
  );

  const payouts = {};

  if (winnerPlayerIds.length > 0) {
    const share = Math.floor(totalPot / winnerPlayerIds.length);
    for (const id of winnerPlayerIds) {
      payouts[id] = share;
      const player = players.find((p) => p.id === id);
      if (player) player.credits += share;
    }
  } else {
    // No one picked the winner — refund all bettors
    for (const id of bettorIds) {
      payouts[id] = round.wager;
      const player = players.find((p) => p.id === id);
      if (player) player.credits += round.wager;
    }
  }

  round.results = { winnerIndex, payouts };
  round.status = 'results';

  return true;
}
