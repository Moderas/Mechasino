import { useEffect } from 'react';
import { useGame } from '../context/GameContext.jsx';

const BADGE_INFO = {
  'first-win':   { emoji: '⭐', name: 'First Victory', description: 'Win your very first round' },
  'streak-2':    { emoji: '2️⃣', name: 'Two in a row', description: 'Win two rounds in a row' },
  'streak-3':    { emoji: '3️⃣', name: 'Three in a row', description: 'Win three rounds in a row' },
  'streak-4':    { emoji: '4️⃣', name: 'Four in a row', description: 'Win four rounds in a row' },
  'streak-5':    { emoji: '5️⃣', name: 'Five in a row', description: 'Win five rounds in a row' },
  'games-100':   { emoji: '💯', name: '100 games', description: 'Wagered 100 times' },
  'credits-10k': { emoji: '🤑', name: 'Get money', description: 'Have 10,000 credits' },
  'credits-50k': { emoji: '💰', name: 'Get stacks', description: 'Have 50,000 credits' },
  'same-slot-3': { emoji: '📜', name: 'Standardized test', description: 'Bet on the same slot three times in a row' },
  'same-mecha':  { emoji: '🤖', name: "That's my guy", description: 'Bet on the same mecha twice' },
  'big-spender': { emoji: '🎰', name: 'Big Spender', description: 'Place a 500 credit wager' },
};

export default function BadgeToast() {
  const { badgeToastQueue, dismissBadgeToast } = useGame();

  const currentBadgeId = badgeToastQueue[0];
  const badge = currentBadgeId ? BADGE_INFO[currentBadgeId] : null;

  useEffect(() => {
    if (!currentBadgeId) return;
    const timer = setTimeout(dismissBadgeToast, 5000);
    return () => clearTimeout(timer);
  }, [currentBadgeId, dismissBadgeToast]);

  if (!badge) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="clip-corners bg-bg-card border border-accent-gold/60 glow-gold px-6 py-4 text-center min-w-[280px]">
        <div className="text-3xl mb-2">{badge.emoji}</div>
        <div
          className="text-accent-gold font-bold text-lg tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          CONGRATULATIONS
        </div>
        <div className="text-text-primary text-sm font-bold">{badge.name}</div>
        <div className="text-text-muted text-xs mt-1">{badge.description}</div>
      </div>
    </div>
  );
}
