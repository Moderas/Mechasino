import { GameProvider } from './context/GameContext.jsx';
import { useGame } from './context/GameContext.jsx';
import PlayerRegistration from './components/PlayerRegistration.jsx';
import Lobby from './components/Lobby.jsx';
import BadgeToast from './components/BadgeToast.jsx';

function AppContent() {
  const { playerId } = useGame();

  if (!playerId) {
    return <PlayerRegistration />;
  }

  return <Lobby />;
}

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-bg-primary p-4">
        <header className="text-center mb-6">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-widest text-glow-cyan"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            MECHASINO
          </h1>
        </header>
        <AppContent />
      </div>
      <BadgeToast />
    </GameProvider>
  );
}
