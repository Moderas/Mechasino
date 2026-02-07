import { useGame } from '../context/GameContext.jsx';

const WAGERS = [100, 250, 500];

export default function WagerSelector({ onClose, playerCredits }) {
  const { startRound } = useGame();

  const handleSelect = async (wager) => {
    await startRound(wager);
    onClose();
  };

  return (
    <div className="clip-corners-lg bg-bg-card p-6 border-glow-cyan animate-fade-in">
      <h3
        className="text-center text-accent-cyan font-bold tracking-wider mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        SELECT WAGER
      </h3>
      <p className="text-center text-text-muted text-xs mb-4">
        Your balance: <span className="text-accent-gold font-bold">{playerCredits.toLocaleString()} CR</span>
      </p>

      <div className="grid grid-cols-3 gap-3">
        {WAGERS.map((wager) => (
          <button
            key={wager}
            onClick={() => handleSelect(wager)}
            disabled={playerCredits < wager}
            className={`btn-cyber clip-corners py-4 text-center text-lg font-bold ${
              playerCredits >= wager
                ? 'btn-cyber-gold'
                : 'bg-white/5 border border-white/10 text-text-muted'
            }`}
          >
            {wager}
            <span className="block text-[10px] mt-1 opacity-60">CR</span>
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-4 w-full text-center text-text-muted text-sm hover:text-text-primary transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
