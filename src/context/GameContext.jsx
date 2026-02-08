import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';

const GameContext = createContext(null);

const initialState = {
  playerId: localStorage.getItem('mechasino-playerId') || null,
  gameState: null,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_ID':
      return { ...state, playerId: action.payload };
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const playerIdRef = useRef(state.playerId);
  const knownBadgesRef = useRef(new Set());
  const [badgeToastQueue, setBadgeToastQueue] = useState([]);

  useEffect(() => {
    playerIdRef.current = state.playerId;
  }, [state.playerId]);

  const fetchState = useCallback(async () => {
    const pid = playerIdRef.current;
    if (!pid) return;
    try {
      const res = await fetch(`/api/state?playerId=${pid}`);
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();
      // Detect orphaned playerId (player not found in Redis after state reset)
      if (pid && data.players && !data.players.find((p) => p.id === pid)) {
        localStorage.removeItem('mechasino-playerId');
        dispatch({ type: 'SET_PLAYER_ID', payload: null });
        dispatch({ type: 'SET_GAME_STATE', payload: null });
        return;
      }
      dispatch({ type: 'SET_GAME_STATE', payload: data });

      // Detect newly earned badges
      const currentPlayer = data.players?.find((p) => p.id === pid);
      if (currentPlayer?.badges) {
        if (knownBadgesRef.current.size === 0 && currentPlayer.badges.length > 0) {
          // Initial seed — don't toast existing badges
          currentPlayer.badges.forEach((b) => knownBadgesRef.current.add(b));
        } else {
          const newBadges = currentPlayer.badges.filter(
            (b) => !knownBadgesRef.current.has(b)
          );
          if (newBadges.length > 0) {
            newBadges.forEach((b) => knownBadgesRef.current.add(b));
            setBadgeToastQueue((prev) => [...prev, ...newBadges]);
          }
        }
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  // Polling
  useEffect(() => {
    if (!state.playerId) return;
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, [state.playerId, fetchState]);

  const joinGame = useCallback(async (name) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join');
      localStorage.setItem('mechasino-playerId', data.playerId);
      localStorage.setItem('mechasino-playerName', name);
      dispatch({ type: 'SET_PLAYER_ID', payload: data.playerId });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const startRound = useCallback(async (wager) => {
    try {
      const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerIdRef.current, wager }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start');
      await fetchState();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [fetchState]);

  const placeBet = useCallback(async (mechaIndex) => {
    try {
      const res = await fetch('/api/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerIdRef.current, mechaIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to bet');
      await fetchState();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [fetchState]);

  const passRound = useCallback(async () => {
    try {
      const res = await fetch('/api/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to pass');
      await fetchState();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [fetchState]);

  const getCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get credits');
      await fetchState();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [fetchState]);

  const dismissBadgeToast = useCallback(() => {
    setBadgeToastQueue((prev) => prev.slice(1));
  }, []);

  const leaveGame = useCallback(() => {
    localStorage.removeItem('mechasino-playerId');
    // Keep mechasino-playerName so registration pre-fills on return
    dispatch({ type: 'SET_PLAYER_ID', payload: null });
    dispatch({ type: 'SET_GAME_STATE', payload: null });
    knownBadgesRef.current = new Set();
    setBadgeToastQueue([]);
  }, []);

  const value = {
    playerId: state.playerId,
    gameState: state.gameState,
    loading: state.loading,
    error: state.error,
    badgeToastQueue,
    dismissBadgeToast,
    joinGame,
    startRound,
    placeBet,
    passRound,
    getCredits,
    leaveGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
