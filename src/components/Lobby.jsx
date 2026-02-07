import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';
import PlayerCard from './PlayerCard.jsx';
import WagerSelector from './WagerSelector.jsx';
import GameBoard from './GameBoard.jsx';

export default function Lobby() {
  const { gameState, playerId, leaveGame, error } = useGame();
  const [showWagerSelector, setShowWagerSelector] = useState(false);

  if (!gameState) {
    return (
      <div className="text-center text-text-muted animate-pulse-glow py-20">
        <p style={{ fontFamily: 'var(--font-display)' }}>ESTABLISHING UPLINK...</p>
      </div>
    );
  }

  const round = gameState.round;
  const isRoundActive = round && round.status !== 'results';

  // If round is active (betting, revealing, or results), show GameBoard
  if (round) {
    return <GameBoard />;
  }

  const currentPlayer = gameState.players.find((p) => p.id === playerId);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Player List */}
      <div className="mb-6">
        <h2
          className="text-lg font-bold text-accent-cyan tracking-wider mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          CONNECTED PILOTS ({gameState.players.length}/8)
        </h2>
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

      {/* Actions */}
      <div className="space-y-3">
        {showWagerSelector ? (
          <WagerSelector
            onClose={() => setShowWagerSelector(false)}
            playerCredits={currentPlayer?.credits || 0}
          />
        ) : (
          <button
            onClick={() => setShowWagerSelector(true)}
            disabled={isRoundActive}
            className="btn-cyber btn-cyber-cyan clip-corners w-full text-center py-3 text-lg"
          >
            START ROUND
          </button>
        )}

        <button
          onClick={leaveGame}
          className="btn-cyber btn-cyber-magenta clip-corners w-full text-center text-sm"
        >
          DISCONNECT
        </button>
      </div>

      {error && (
        <p className="text-accent-magenta text-sm text-center mt-4">{error}</p>
      )}
    </div>
  );
}
