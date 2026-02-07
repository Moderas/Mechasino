import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

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
      dispatch({ type: 'SET_GAME_STATE', payload: data });
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

  const leaveGame = useCallback(() => {
    localStorage.removeItem('mechasino-playerId');
    dispatch({ type: 'SET_PLAYER_ID', payload: null });
    dispatch({ type: 'SET_GAME_STATE', payload: null });
  }, []);

  const value = {
    playerId: state.playerId,
    gameState: state.gameState,
    loading: state.loading,
    error: state.error,
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
