import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext.jsx';

export default function WinnerReveal() {
  const { gameState, playerId } = useGame();
  const round = gameState?.round;
  const [cycleIndex, setCycleIndex] = useState(0);
  const [phase, setPhase] = useState('cycling'); // 'cycling' | 'done'
  const intervalRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    if (!round?.results) return;

    const winnerIndex = round.results.winnerIndex;
    let speed = 100;
    let step = 0;
    const totalSteps = 16 + winnerIndex; // cycle through several times, land on winner

    function tick() {
      step++;
      stepRef.current = step;
      setCycleIndex(step % 4);

      if (step >= totalSteps) {
        setPhase('done');
        return;
      }

      // Slow down as we approach the end
      if (step > totalSteps - 6) {
        speed += 80;
      } else if (step > totalSteps - 10) {
        speed += 30;
      }

      intervalRef.current = setTimeout(tick, speed);
    }

    intervalRef.current = setTimeout(tick, speed);
    return () => clearTimeout(intervalRef.current);
  }, [round?.results]);

  if (!round?.results) return null;

  const { winnerIndex, payouts } = round.results;
  const players = gameState.players;
  const currentPlayerPayout = payouts[playerId] || 0;
  const playerBet = round.bets[playerId];
  const didBet = playerBet !== undefined;
  const didWin = didBet && playerBet === winnerIndex;
  const didPass = round.passes.includes(playerId);

  // Count bets per mecha
  const betCounts = [0, 0, 0, 0];
  for (const mechaIdx of Object.values(round.bets)) {
    betCounts[mechaIdx]++;
  }

  if (phase !== 'done') {
    return (
      <div className="text-center py-8 animate-fade-in">
        <h2
          className="text-2xl font-bold text-accent-cyan text-glow-cyan tracking-wider mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          DETERMINING VICTOR...
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {round.mechas.map((mecha, i) => (
            <div
              key={i}
              className={`clip-corners p-3 border transition-all duration-100 ${
                i === cycleIndex
                  ? 'bg-accent-cyan/10 border-accent-cyan glow-cyan-strong'
                  : 'bg-bg-card border-white/10'
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  i === cycleIndex ? 'text-accent-cyan' : 'text-text-muted'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {mecha.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Results view
  const winningMecha = round.mechas[winnerIndex];

  return (
    <div className="text-center py-6 animate-fade-in">
      <h2
        className="text-2xl font-bold text-accent-gold text-glow-gold tracking-wider mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        VICTORY
      </h2>

      {/* Winning mecha */}
      <div className="clip-corners-lg bg-bg-card border border-accent-gold/60 p-5 max-w-md mx-auto mb-6 glow-gold-strong">
        <h3
          className="text-lg font-bold text-accent-gold text-glow-gold mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {winningMecha.name}
        </h3>
        <div className="space-y-1">
          {winningMecha.descriptors.map((desc, i) => (
            <div key={i} className="flex items-start gap-2 text-xs justify-center">
              <span className="text-accent-magenta shrink-0">{'>'}</span>
              <span className="text-text-primary/80">{desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-text-muted text-xs">
          {betCounts[winnerIndex]} pilot{betCounts[winnerIndex] !== 1 ? 's' : ''} backed this mecha
        </div>
      </div>

      {/* Player result */}
      <div className="clip-corners bg-bg-card border border-white/10 p-4 max-w-sm mx-auto mb-4">
        {didWin ? (
          <div>
            <p className="text-accent-gold font-bold text-lg text-glow-gold">
              +{currentPlayerPayout.toLocaleString()} CR
            </p>
            <p className="text-text-muted text-xs mt-1">Your mecha was victorious!</p>
          </div>
        ) : didBet ? (
          <div>
            <p className="text-accent-magenta font-bold text-lg">
              -{round.wager.toLocaleString()} CR
            </p>
            <p className="text-text-muted text-xs mt-1">
              {betCounts[winnerIndex] === 0
                ? 'No one backed the winner - wager refunded!'
                : 'Your mecha fell in battle.'}
            </p>
            {betCounts[winnerIndex] === 0 && (
              <p className="text-accent-gold text-xs mt-1">
                +{round.wager.toLocaleString()} CR refunded
              </p>
            )}
          </div>
        ) : didPass ? (
          <div>
            <p className="text-text-muted font-bold">PASSED</p>
            <p className="text-text-muted text-xs mt-1">You sat this one out.</p>
          </div>
        ) : (
          <div>
            <p className="text-text-muted text-xs">Round complete.</p>
          </div>
        )}
      </div>

      {/* Payouts breakdown */}
      {Object.keys(payouts).length > 0 && (
        <div className="max-w-sm mx-auto">
          <h4 className="text-text-muted text-xs uppercase tracking-wider mb-2">Payouts</h4>
          <div className="space-y-1">
            {Object.entries(payouts).map(([pid, amount]) => {
              const player = players.find((p) => p.id === pid);
              return (
                <div key={pid} className="flex justify-between text-xs">
                  <span className={pid === playerId ? 'text-accent-cyan' : 'text-text-primary/70'}>
                    {player?.name || 'Unknown'}
                  </span>
                  <span className="text-accent-gold">+{amount.toLocaleString()} CR</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
