import { useGame } from '../context/GameContext.jsx';

const BADGE_EMOJIS = {
  'first-win': '⭐',
  'streak-2': '2️⃣',
  'streak-3': '3️⃣',
  'streak-4': '4️⃣',
  'streak-5': '5️⃣',
  'games-100': '💯',
  'credits-10k': '🤑',
  'credits-50k': '💰',
  'same-slot-3': '📜',
  'same-mecha': '🤖',
  'big-spender': '🎰',
};

export default function PlayerCard({ player, isCurrentPlayer }) {
  const { getCredits, gameState, playerId } = useGame();

  const round = gameState?.round;
  const hasBet = round?.bets && player.id in round.bets;
  const hasPassed = round?.passes?.includes(player.id);
  const isActive = Date.now() - player.lastSeen < 60000;

  let statusLabel = null;
  if (round?.status === 'betting') {
    if (hasBet) statusLabel = 'LOCKED IN';
    else if (hasPassed) statusLabel = 'PASSED';
  }

  return (
    <div
      className={`clip-corners bg-bg-card p-3 border transition-all ${
        isCurrentPlayer
          ? 'border-accent-cyan/50 glow-cyan'
          : 'border-white/5'
      } ${!isActive ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-sm truncate ${
                isCurrentPlayer ? 'text-accent-cyan' : 'text-text-primary'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {player.name}
            </span>
            {isCurrentPlayer && (
              <span className="text-[10px] text-accent-cyan/60 uppercase tracking-wider">
                you
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-accent-gold text-xs font-bold">
              {player.credits.toLocaleString()} CR
            </span>
            {player.poopCount > 0 && (
              <span className="text-xs" title={`Used poop button ${player.poopCount} time(s)`}>
                {'💩'.repeat(Math.min(player.poopCount, 10))}
              </span>
            )}
            {player.badges?.length > 0 && (
              <span className="text-xs" title={`${player.badges.length} badge(s)`}>
                {player.badges.map((id) => BADGE_EMOJIS[id] || '?').join('')}
              </span>
            )}
          </div>
          {(player.totalWagers || 0) > 0 && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] text-text-muted">
              <span>{player.totalWagers}W</span>
              <span className="text-white/20">|</span>
              <span>{player.wins || 0}✓</span>
              <span className="text-white/20">|</span>
              <span className={
                ((player.wins || 0) / player.totalWagers) * 100 >= 50
                  ? 'text-accent-cyan'
                  : 'text-accent-magenta'
              }>
                {Math.round(((player.wins || 0) / player.totalWagers) * 100)}%
              </span>
              <span className="text-white/20">|</span>
              <span>{(player.totalCreditsWagered || 0).toLocaleString()} bet</span>
              <span className="text-white/20">|</span>
              <span className="text-accent-gold">{(player.totalCreditsWon || 0).toLocaleString()} won</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusLabel && (
            <span
              className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${
                hasBet
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                  : 'bg-text-muted/15 text-text-muted border border-text-muted/30'
              }`}
            >
              {statusLabel}
            </span>
          )}

          {isCurrentPlayer && (
            <button
              onClick={getCredits}
              className="btn-cyber btn-cyber-gold text-[10px] px-2 py-1"
              title="Get +1000 credits (shame!)"
            >
              💩 +1K
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
