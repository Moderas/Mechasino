import { useState } from 'react';
import { useGame } from '../context/GameContext.jsx';

export default function PlayerRegistration() {
  const { joinGame, loading, error } = useGame();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      joinGame(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="clip-corners-lg bg-bg-card p-8 w-full max-w-md glow-cyan animate-fade-in">
        <h2
          className="text-2xl font-bold text-accent-cyan text-center mb-6 tracking-wider"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          PILOT REGISTRATION
        </h2>

        <div className="w-full h-px bg-accent-cyan/30 mb-6" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-text-muted text-xs uppercase tracking-widest mb-2">
              Callsign
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Enter your callsign..."
              className="input-cyber w-full clip-corners"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="btn-cyber btn-cyber-cyan clip-corners w-full text-center"
          >
            {loading ? 'CONNECTING...' : 'ENTER THE ARENA'}
          </button>

          {error && (
            <p className="text-accent-magenta text-sm text-center">{error}</p>
          )}
        </form>

        <p className="text-text-muted text-xs text-center mt-6 opacity-60">
          Starting credits: 5,000 CR
        </p>
      </div>
    </div>
  );
}
