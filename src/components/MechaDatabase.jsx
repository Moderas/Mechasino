import { useState, useEffect } from 'react';

export default function MechaDatabase({ onBack }) {
  const [stats, setStats] = useState(null);
  const [sortBy, setSortBy] = useState('a');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mecha-stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center text-text-muted animate-pulse-glow py-20">
        <p style={{ fontFamily: 'var(--font-display)' }}>LOADING DATABASE...</p>
      </div>
    );
  }

  const entries = stats
    ? Object.entries(stats).map(([name, s]) => ({
        name,
        a: s.a,
        w: s.w,
        pct: s.a > 0 ? Math.round((s.w / s.a) * 100) : 0,
      }))
    : [];

  entries.sort((a, b) => {
    if (sortBy === 'a') return b.a - a.a;
    if (sortBy === 'w') return b.w - a.w;
    if (sortBy === 'pct') return b.pct - a.pct || b.a - a.a;
    return b.a - a.a;
  });

  const SortButton = ({ field, label }) => (
    <button
      onClick={() => setSortBy(field)}
      className={`text-[10px] uppercase tracking-wider ${
        sortBy === field ? 'text-accent-cyan' : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {label} {sortBy === field ? '▼' : ''}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold text-accent-cyan tracking-wider"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          MECHA DATABASE
        </h2>
        <button
          onClick={onBack}
          className="btn-cyber btn-cyber-magenta clip-corners text-[10px] px-3 py-1"
        >
          BACK
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="clip-corners bg-bg-card border border-white/10 p-8 text-center">
          <p className="text-text-muted">NO DATA YET</p>
          <p className="text-text-muted text-xs mt-2">Play some rounds to populate the database.</p>
        </div>
      ) : (
        <div className="clip-corners bg-bg-card border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 px-3 py-2 border-b border-white/10 bg-white/5">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Mecha</span>
            <SortButton field="a" label="Apps" />
            <SortButton field="w" label="Wins" />
            <SortButton field="pct" label="Win%" />
          </div>

          {/* Rows */}
          <div className="max-h-[60vh] overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.name}
                className="grid grid-cols-[1fr_60px_60px_60px] gap-2 px-3 py-1.5 border-b border-white/5 hover:bg-white/5"
              >
                <span
                  className="text-xs text-text-primary truncate"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {entry.name}
                </span>
                <span className="text-xs text-text-muted text-center">{entry.a}</span>
                <span className="text-xs text-text-muted text-center">{entry.w}</span>
                <span
                  className={`text-xs text-center ${
                    entry.pct >= 40
                      ? 'text-accent-gold'
                      : entry.pct >= 25
                        ? 'text-accent-cyan'
                        : 'text-text-muted'
                  }`}
                >
                  {entry.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-white/10 bg-white/5">
            <span className="text-[10px] text-text-muted">
              {entries.length} mecha{entries.length !== 1 ? 's' : ''} recorded
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
