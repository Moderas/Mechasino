export const BADGE_DEFS = [
  { id: 'first-win', emoji: '⭐', name: 'First Victory', description: 'Win your very first round' },
  { id: 'streak-2', emoji: '2️⃣', name: 'Two in a row', description: 'Win two rounds in a row' },
  { id: 'streak-3', emoji: '3️⃣', name: 'Three in a row', description: 'Win three rounds in a row' },
  { id: 'streak-4', emoji: '4️⃣', name: 'Four in a row', description: 'Win four rounds in a row' },
  { id: 'streak-5', emoji: '5️⃣', name: 'Five in a row', description: 'Win five rounds in a row' },
  { id: 'games-100', emoji: '💯', name: '100 games', description: 'Wagered 100 times' },
  { id: 'credits-10k', emoji: '🤑', name: 'Get money', description: 'Have 10,000 credits' },
  { id: 'credits-50k', emoji: '💰', name: 'Get stacks', description: 'Have 50,000 credits' },
  { id: 'same-slot-3', emoji: '📜', name: 'Standardized test', description: 'Bet on the same slot three times in a row' },
  { id: 'same-mecha', emoji: '🤖', name: "That's my guy", description: 'Bet on the same mecha twice' },
  { id: 'big-spender', emoji: '🎰', name: 'Big Spender', description: 'Place a 500 credit wager' },
];

export function checkAndAwardBadges(player, round) {
  const betIndex = round.bets[player.id];
  if (betIndex === undefined) return;

  if (!player.badges) player.badges = [];
  if (player.winStreak === undefined) player.winStreak = 0;
  if (!player.lastBetSlots) player.lastBetSlots = [];
  if (!player.betMechaNames) player.betMechaNames = [];

  const won = betIndex === round.winnerIndex;
  const mechaName = round.mechas[betIndex].name;

  // Update win streak
  if (won) {
    player.winStreak += 1;
  } else {
    player.winStreak = 0;
  }

  // Update last bet slots (keep last 3)
  player.lastBetSlots.push(betIndex);
  if (player.lastBetSlots.length > 3) {
    player.lastBetSlots = player.lastBetSlots.slice(-3);
  }

  // Check for repeat mecha name before adding
  const alreadyBetOnThisMecha = player.betMechaNames.includes(mechaName);
  if (!alreadyBetOnThisMecha) {
    player.betMechaNames.push(mechaName);
  }

  function award(badgeId) {
    if (!player.badges.includes(badgeId)) {
      player.badges.push(badgeId);
    }
  }

  // First Victory
  if (player.wins >= 1) award('first-win');

  // Win streak badges
  if (player.winStreak >= 2) award('streak-2');
  if (player.winStreak >= 3) award('streak-3');
  if (player.winStreak >= 4) award('streak-4');
  if (player.winStreak >= 5) award('streak-5');

  // 100 games
  if (player.totalWagers >= 100) award('games-100');

  // Credit-based badges
  if (player.credits >= 10000) award('credits-10k');
  if (player.credits >= 50000) award('credits-50k');

  // Standardized test: same slot 3 times in a row
  if (
    player.lastBetSlots.length === 3 &&
    player.lastBetSlots[0] === player.lastBetSlots[1] &&
    player.lastBetSlots[1] === player.lastBetSlots[2]
  ) {
    award('same-slot-3');
  }

  // That's my guy: same mecha name twice
  if (alreadyBetOnThisMecha) award('same-mecha');

  // Big Spender: 500 credit wager
  if (round.wager === 500) award('big-spender');
}
