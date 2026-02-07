import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';
import MechaCard from './MechaCard.jsx';
import PlayerCard from './PlayerCard.jsx';
import WinnerReveal from './WinnerReveal.jsx';

export default function GameBoard() {
  const { gameState, playerId, placeBet, passRound, error } = useGame();
  const [confirmIndex, setConfirmIndex] = useState(null);

  const round = gameState?.round;
  if (!round) return null;

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const hasBet = round.bets && playerId in round.bets;
  const hasPassed = round.passes?.includes(playerId);
  const hasDecided = hasBet || hasPassed;
  const isBetting = round.status === 'betting';
  const canBet = isBetting && !hasDecided && currentPlayer && currentPlayer.credits >= round.wager;

  const totalBettors = Object.keys(round.bets).length;
  const totalPot = totalBettors * round.wager;

  const starter = gameState.players.find((p) => p.id === round.starterId);

  // Show reveal animation or results
  if (round.status === 'revealing' || round.status === 'results') {
    return (
      <div className="max-w-4xl mx-auto">
        <WinnerReveal />

        {/* Player list at bottom */}
        <div className="mt-6">
          <div className="space-y-2">
            {gameState.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === playerId}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleBetClick = (index) => {
    if (!canBet) return;
    if (confirmIndex === index) {
      placeBet(index);
      setConfirmIndex(null);
    } else {
      setConfirmIndex(index);
    }
  };

  // Bet counts for results
  const betCounts = [0, 0, 0, 0];
  if (round.results) {
    for (const mechaIdx of Object.values(round.bets)) {
      betCounts[mechaIdx]++;
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Round info bar */}
      <div className="clip-corners bg-bg-card border-glow-cyan p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-xs uppercase tracking-wider">Wager</span>
          <span
            className="text-accent-gold font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {round.wager} CR
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-xs uppercase tracking-wider">Pot</span>
          <span
            className="text-accent-gold font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {totalPot.toLocaleString()} CR
          </span>
        </div>
        <div className="text-text-muted text-xs">
          Started by <span className="text-accent-cyan">{starter?.name || '???'}</span>
        </div>
      </div>

      {/* Confirm banner */}
      {confirmIndex !== null && canBet && (
        <div className="clip-corners bg-accent-cyan/10 border border-accent-cyan/40 p-3 mb-4 text-center animate-fade-in">
          <p className="text-accent-cyan text-sm">
            Deploy <span className="font-bold">{round.mechas[confirmIndex].name}</span>?
          </p>
          <p className="text-text-muted text-xs mt-1">Click again to confirm. Wager: {round.wager} CR</p>
        </div>
      )}

      {/* Mecha grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {round.mechas.map((mecha, i) => (
          <MechaCard
            key={i}
            mecha={mecha}
            index={i}
            onBet={handleBetClick}
            canBet={canBet}
            isWinner={round.results?.winnerIndex === i}
            betCount={round.results ? betCounts[i] : undefined}
            showResults={!!round.results}
            playerBetIndex={hasBet ? round.bets[playerId] : null}
          />
        ))}
      </div>

      {/* Action bar */}
      {isBetting && (
        <div className="flex items-center gap-3">
          {!hasDecided ? (
            <>
              {currentPlayer && currentPlayer.credits < round.wager && (
                <p className="text-accent-magenta text-xs flex-1">
                  Insufficient credits to wager ({currentPlayer.credits.toLocaleString()} CR)
                </p>
              )}
              <button
                onClick={passRound}
                className="btn-cyber btn-cyber-magenta clip-corners ml-auto"
              >
                PASS
              </button>
            </>
          ) : (
            <div className="w-full text-center">
              <span className="text-text-muted text-sm animate-pulse-glow">
                {hasBet ? 'Wager locked in. Waiting for other pilots...' : 'Passed. Waiting for other pilots...'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Player list */}
      <div className="mt-4 space-y-2">
        {gameState.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === playerId}
          />
        ))}
      </div>

      {error && (
        <p className="text-accent-magenta text-sm text-center mt-4">{error}</p>
      )}
    </div>
  );
}
