import { useGame } from '../context/GameContext.jsx';

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
          </div>
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
