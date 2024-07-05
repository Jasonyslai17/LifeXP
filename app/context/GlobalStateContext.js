'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from "next-auth/react";

// Initial state
const initialState = {
  user: null,
  skills: [],
  quests: [],
  loading: true,
  error: null
};

// Action types
const ActionTypes = {
  SET_INITIAL_STATE: 'SET_INITIAL_STATE',
  SET_USER: 'SET_USER',
  SET_SKILLS: 'SET_SKILLS',
  ADD_SKILL: 'ADD_SKILL',
  UPDATE_SKILL: 'UPDATE_SKILL',
  UPDATE_SKILL_XP: 'UPDATE_SKILL_XP',
  UPDATE_USER_XP: 'UPDATE_USER_XP',
  UPDATE_USER_STREAK: 'UPDATE_USER_STREAK',
  REMOVE_SKILL: 'REMOVE_SKILL',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_QUESTS: 'SET_QUESTS',
  ADD_QUEST: 'ADD_QUEST',
  COMPLETE_QUEST: 'COMPLETE_QUEST',
  UPDATE_QUEST: 'UPDATE_QUEST',
  REMOVE_QUEST: 'REMOVE_QUEST',
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_INITIAL_STATE:
      return { ...state, ...action.payload, loading: false };
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case ActionTypes.SET_SKILLS:
      return { ...state, skills: action.payload };
    case ActionTypes.ADD_SKILL:
      return { ...state, skills: [...state.skills, action.payload] };
    case ActionTypes.UPDATE_SKILL:
      return {
        ...state,
        skills: state.skills.map(skill => 
          skill.id === action.payload.id ? { ...skill, ...action.payload } : skill
        )
      };
    case ActionTypes.UPDATE_SKILL_XP:
      return {
        ...state,
        skills: state.skills.map(skill => 
          skill.id === action.payload.id ? action.payload : skill
        )
      };
    case ActionTypes.UPDATE_USER_XP:
      return {
        ...state,
        user: {
          ...state.user,
          xp: action.payload.newXp,
          level: action.payload.newLevel,
          maxXp: action.payload.newMaxXp
        }
      };
    case ActionTypes.UPDATE_USER_STREAK:
      return {
        ...state,
        user: {
          ...state.user,
          streak: action.payload.streak,
          lastUpdated: action.payload.lastUpdated
        }
      };
    case ActionTypes.REMOVE_SKILL:
      return {
        ...state,
        skills: state.skills.filter(skill => skill.id !== action.payload)
      };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.SET_QUESTS:
      return { ...state, quests: action.payload };
    case ActionTypes.ADD_QUEST:
      return { ...state, quests: [...state.quests, action.payload] };
    case ActionTypes.COMPLETE_QUEST:
      return {
        ...state,
        quests: state.quests.map(quest =>
          quest.id === action.payload.id ? { ...quest, completed: true } : quest
        ),
        user: {
          ...state.user,
          xp: state.user.xp + action.payload.xpReward,
          level: calculateLevel(state.user.xp + action.payload.xpReward)
        }
      };
    case ActionTypes.REMOVE_QUEST:
      return {
        ...state,
        quests: state.quests.filter(quest => quest.id !== action.payload)
      };
    case ActionTypes.UPDATE_QUEST:
      return {
        ...state,
        quests: state.quests.map(quest => 
          quest.id === action.payload.id ? action.payload : quest
        )
      };
    default:
      return state;
  }
}

// Create context
const GlobalStateContext = createContext();

// Provider component
export function GlobalStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);

    if (status === "authenticated" && session) {
      console.log("Initializing user...");
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        // Here we're using the session user data
        const userData = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          // You might want to fetch additional user data from your backend here
          xp: 0,
          level: 1,
          streak: 0,
          lastUpdated: new Date()
        };

        dispatch({ type: ActionTypes.SET_USER, payload: userData });

        // TODO: Fetch skills and quests from your backend API
        // For now, we'll just set empty arrays
        dispatch({ type: ActionTypes.SET_SKILLS, payload: [] });
        dispatch({ type: ActionTypes.SET_QUESTS, payload: [] });

        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        console.log("User initialized successfully");
      } catch (error) {
        console.error("Error initializing user:", error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    } else if (status === "unauthenticated") {
      dispatch({ type: ActionTypes.SET_INITIAL_STATE, payload: { user: null, skills: [], quests: [], loading: false } });
    }
  }, [status, session]);

  const addSkill = async (newSkill) => {
    try {
      if (!state.user) {
        throw new Error("User not authenticated");
      }
      // TODO: Send request to backend API to add skill
      // For now, we'll just add it to the state
      const skillData = { 
        ...newSkill, 
        id: Date.now().toString(), // temporary ID
        userId: state.user.id,
        xp: 0,
        level: 1,
        streak: 0,
        lastUpdated: new Date()
      };
      dispatch({ type: ActionTypes.ADD_SKILL, payload: skillData });
      console.log("New skill added:", skillData);
    } catch (error) {
      console.error("Error adding skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateSkill = async (skillId, updates) => {
    try {
      // TODO: Send request to backend API to update skill
      // For now, we'll just update it in the state
      dispatch({ 
        type: ActionTypes.UPDATE_SKILL, 
        payload: { id: skillId, ...updates } 
      });
      console.log(`Skill ${skillId} updated:`, updates);
    } catch (error) {
      console.error("Error updating skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeSkill = async (skillId) => {
    try {
      // TODO: Send request to backend API to remove skill
      // For now, we'll just remove it from the state
      dispatch({ type: ActionTypes.REMOVE_SKILL, payload: skillId });
      console.log(`Skill ${skillId} removed successfully`);
    } catch (error) {
      console.error("Error removing skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // TODO: Implement other methods (addQuest, updateQuest, removeQuest, etc.)

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const value = {
    state,
    dispatch,
    addSkill,
    updateSkill,
    removeSkill,
    clearError
    // TODO: Add other methods here
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

// Custom hook to use the global state
export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}