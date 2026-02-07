export default function MechaCard({
  mecha,
  index,
  onBet,
  canBet,
  isWinner,
  isCycleHighlight,
  betCount,
  showResults,
  playerBetIndex,
}) {
  const isPlayerPick = playerBetIndex === index;

  return (
    <div
      onClick={() => canBet && onBet(index)}
      className={`clip-corners bg-bg-card p-4 border transition-all duration-300 ${
        canBet
          ? 'cursor-pointer hover:bg-bg-card-hover hover:border-accent-cyan/60 hover:glow-cyan'
          : ''
      } ${
        isWinner
          ? 'animate-winner border-accent-gold'
          : isCycleHighlight
          ? 'animate-cycle border-accent-cyan'
          : isPlayerPick && !showResults
          ? 'border-accent-cyan/70 glow-cyan'
          : 'border-white/10'
      }`}
    >
      {/* Mecha designation header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className={`font-bold text-sm leading-tight ${
            isWinner ? 'text-accent-gold text-glow-gold' : 'text-accent-cyan'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {mecha.name}
        </h3>
        <span className="shrink-0 text-[10px] text-text-muted bg-white/5 px-1.5 py-0.5 border border-white/10">
          #{index + 1}
        </span>
      </div>

      {/* Spec sheet */}
      <div className="space-y-1.5">
        {mecha.descriptors.map((desc, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="text-accent-magenta shrink-0 mt-0.5">{'>'}</span>
            <span className="text-text-primary/80">{desc}</span>
          </div>
        ))}
      </div>

      {/* Result info */}
      {showResults && (
        <div className="mt-3 pt-2 border-t border-white/10">
          {isWinner && (
            <span
              className="text-accent-gold text-xs font-bold tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              VICTORIOUS
            </span>
          )}
          {betCount !== undefined && (
            <span className="text-text-muted text-xs ml-2">
              {betCount} bet{betCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Player's pick indicator */}
      {isPlayerPick && !showResults && (
        <div className="mt-2 text-center">
          <span className="text-accent-cyan text-[10px] uppercase tracking-widest animate-pulse-glow">
            Your Pick
          </span>
        </div>
      )}
    </div>
  );
}
