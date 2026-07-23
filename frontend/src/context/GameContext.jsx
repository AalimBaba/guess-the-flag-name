import React, { createContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  mode: 'learning', // 'learning', 'practice', 'timed', 'daily'
  difficulty: 'medium', // 'easy', 'medium', 'hard'
  answerMode: 'typing', // 'typing', 'multiple'
  roundLimit: 10, // number of rounds per game
  collectionId: 'nations', // e.g., 'nations', 'states', etc.
  xp: 0,
  level: 1,
  badges: [],
  dailyStreak: 0,
  lastPlayed: null, // ISO string
  missedFlags: [], // array of flag IDs
  favoriteFlags: [], // array of flag IDs
  dailyChallengeSeed: null, // seed for daily challenge
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_ANSWER_MODE':
      return { ...state, answerMode: action.payload };
    case 'SET_ROUND_LIMIT':
      return { ...state, roundLimit: action.payload };
    case 'SET_COLLECTION_ID':
      return { ...state, collectionId: action.payload };
    case 'ADD_XP':
      return {
        ...state,
        xp: state.xp + action.payload,
        // Level up logic: every 100 XP is a level
        level: Math.floor((state.xp + action.payload) / 100) + 1,
      };
    case 'ADD_BADGE':
      return {
        ...state,
        badges: [...new Set([...state.badges, action.payload])], // avoid duplicates
      };
    case 'SET_DAILY_STREAK':
      return { ...state, dailyStreak: action.payload };
    case 'SET_LAST_PLAYED':
      return { ...state, lastPlayed: action.payload };
    case 'ADD_MISSED_FLAG':
      return {
        ...state,
        missedFlags: [...new Set([...state.missedFlags, action.payload])],
      };
    case 'REMOVE_MISSED_FLAG':
      return {
        ...state,
        missedFlags: state.missedFlags.filter((id) => id !== action.payload),
      };
    case 'ADD_FAVORITE_FLAG':
      return {
        ...state,
        favoriteFlags: [...new Set([...state.favoriteFlags, action.payload])],
      };
    case 'REMOVE_FAVORITE_FLAG':
      return {
        ...state,
        favoriteFlags: state.favoriteFlags.filter((id) => id !== action.payload),
      };
    case 'SET_DAILY_CHALLENGE_SEED':
      return { ...state, dailyChallengeSeed: action.payload };
    case 'RESET_GAME_STATE':
      return {
        ...state,
        mode: 'learning',
        difficulty: 'medium',
        answerMode: 'typing',
        roundLimit: 10,
        collectionId: 'nations',
        xp: 0,
        level: 1,
        badges: [],
        dailyStreak: 0,
        lastPlayed: null,
        missedFlags: [],
        favoriteFlags: [],
        dailyChallengeSeed: null,
      };
    default:
      return state;
  }
}

// Persist state to localStorage
const loadState = () => {
  try {
    const serialized = localStorage.getItem('gameState');
    if (serialized === null) return undefined;
    return JSON.parse(serialized);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem('gameState', serialized);
  } catch (err) {
    console.warn('Could not save game state', err);
  }
};

// Context
const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, loadState() || initialState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Action creators
  const setMode = (mode) => dispatch({ type: 'SET_MODE', payload: mode });
  const setDifficulty = (difficulty) => dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
  const setAnswerMode = (answerMode) => dispatch({ type: 'SET_ANSWER_MODE', payload: answerMode });
  const setRoundLimit = (roundLimit) => dispatch({ type: 'SET_ROUND_LIMIT', payload: roundLimit });
  const setCollectionId = (collectionId) => dispatch({ type: 'SET_COLLECTION_ID', payload: collectionId });
  const addXP = (xp) => dispatch({ type: 'ADD_XP', payload: xp });
  const addBadge = (badge) => dispatch({ type: 'ADD_BADGE', payload: badge });
  const setDailyStreak = (streak) => dispatch({ type: 'SET_DAILY_STREAK', payload: streak });
  const setLastPlayed = (date) => dispatch({ type: 'SET_LAST_PLAYED', payload: date });
  const addMissedFlag = (flagId) => dispatch({ type: 'ADD_MISSED_FLAG', payload: flagId });
  const removeMissedFlag = (flagId) => dispatch({ type: 'REMOVE_MISSED_FLAG', payload: flagId });
  const addFavoriteFlag = (flagId) => dispatch({ type: 'ADD_FAVORITE_FLAG', payload: flagId });
  const removeFavoriteFlag = (flagId) => dispatch({ type: 'REMOVE_FAVORITE_FLAG', payload: flagId });
  const setDailyChallengeSeed = (seed) => dispatch({ type: 'SET_DAILY_CHALLENGE_SEED', payload: seed });
  const resetGameState = () => dispatch({ type: 'RESET_GAME_STATE' });

  return (
    <GameContext.Provider
      value={{
        ...state,
        setMode,
        setDifficulty,
        setAnswerMode,
        setRoundLimit,
        setCollectionId,
        addXP,
        addBadge,
        setDailyStreak,
        setLastPlayed,
        addMissedFlag,
        removeMissedFlag,
        addFavoriteFlag,
        removeFavoriteFlag,
        setDailyChallengeSeed,
        resetGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;