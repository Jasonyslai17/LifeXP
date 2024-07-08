'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { calculateLevel } from '../utils/levelCalculation';

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
    if (status === "authenticated" && session) {
      initializeUser(session.user);
    } else if (status === "unauthenticated") {
      dispatch({ type: ActionTypes.SET_INITIAL_STATE, payload: { user: null, skills: [], quests: [], loading: false } });
    }
  }, [status, session]);

  const initializeUser = async (sessionUser) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const userDocRef = doc(db, "users", sessionUser.id);
      const userDoc = await getDoc(userDocRef);

      let userData;
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        userData = {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          xp: 0,
          level: 1,
          streak: 0,
          lastUpdated: new Date().toISOString()
        };
        await setDoc(userDocRef, userData);
      }

      dispatch({ type: ActionTypes.SET_USER, payload: userData });

      // Fetch skills
      const skillsCollection = collection(db, `users/${sessionUser.id}/skills`);
      const skillsSnapshot = await getDocs(skillsCollection);
      const skills = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: ActionTypes.SET_SKILLS, payload: skills });

      // Fetch quests
      const questsCollection = collection(db, `users/${sessionUser.id}/quests`);
      const questsSnapshot = await getDocs(questsCollection);
      const quests = questsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: ActionTypes.SET_QUESTS, payload: quests });

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error("Error initializing user:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const addSkill = async (newSkill) => {
    try {
      if (!state.user) {
        throw new Error("User not authenticated");
      }
      const skillData = { 
        ...newSkill, 
        userId: state.user.id,
        xp: 0,
        level: 1,
        streak: 0,
        lastUpdated: new Date().toISOString()
      };
      const skillDocRef = doc(collection(db, `users/${state.user.id}/skills`));
      await setDoc(skillDocRef, skillData);
      dispatch({ type: ActionTypes.ADD_SKILL, payload: { ...skillData, id: skillDocRef.id } });
    } catch (error) {
      console.error("Error adding skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateSkill = async (skillId, updates) => {
    try {
      const skillDocRef = doc(db, `users/${state.user.id}/skills`, skillId);
      await updateDoc(skillDocRef, updates);
      dispatch({ 
        type: ActionTypes.UPDATE_SKILL, 
        payload: { id: skillId, ...updates } 
      });
    } catch (error) {
      console.error("Error updating skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateSkillXp = async (skillId, hoursToAdd) => {
    try {
      const skillDocRef = doc(db, `users/${state.user.id}/skills`, skillId);
      const skillDoc = await getDoc(skillDocRef);
      if (!skillDoc.exists()) {
        throw new Error("Skill not found");
      }
      const skill = skillDoc.data();
      const newXp = skill.xp + hoursToAdd;
      const updatedSkill = { ...skill, xp: newXp, id: skillId };
      await updateDoc(skillDocRef, updatedSkill);
      
      dispatch({ type: ActionTypes.UPDATE_SKILL_XP, payload: updatedSkill });
      
      // Update user XP
      const userDocRef = doc(db, "users", state.user.id);
      const newUserXp = state.user.xp + hoursToAdd;
      const newUserLevel = calculateLevel(newUserXp);
      await updateDoc(userDocRef, { xp: newUserXp, level: newUserLevel });
      dispatch({ 
        type: ActionTypes.UPDATE_USER_XP, 
        payload: { newXp: newUserXp, newLevel: newUserLevel }
      });
    } catch (error) {
      console.error("Error updating skill XP:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const removeSkill = async (skillId) => {
    try {
      const skillDocRef = doc(db, `users/${state.user.id}/skills`, skillId);
      await deleteDoc(skillDocRef);
      dispatch({ type: ActionTypes.REMOVE_SKILL, payload: skillId });
    } catch (error) {
      console.error("Error removing skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const addQuest = async (newQuest) => {
    try {
      if (!state.user) {
        throw new Error("User not authenticated");
      }
      const questDocRef = doc(collection(db, `users/${state.user.id}/quests`));
      await setDoc(questDocRef, newQuest);
      dispatch({ type: ActionTypes.ADD_QUEST, payload: { ...newQuest, id: questDocRef.id } });
    } catch (error) {
      console.error("Error adding quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateQuest = async (questId, updates) => {
    try {
      const questDocRef = doc(db, `users/${state.user.id}/quests`, questId);
      await updateDoc(questDocRef, updates);
      dispatch({ 
        type: ActionTypes.UPDATE_QUEST, 
        payload: { id: questId, ...updates } 
      });
    } catch (error) {
      console.error("Error updating quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const completeQuest = async (questId) => {
    try {
      const questDocRef = doc(db, `users/${state.user.id}/quests`, questId);
      const questDoc = await getDoc(questDocRef);
      if (!questDoc.exists()) {
        throw new Error("Quest not found");
      }
      const quest = questDoc.data();
      await updateDoc(questDocRef, { completed: true });
      
      // Update user XP
      const userDocRef = doc(db, "users", state.user.id);
      const newUserXp = state.user.xp + quest.xpReward;
      const newUserLevel = calculateLevel(newUserXp);
      await updateDoc(userDocRef, { xp: newUserXp, level: newUserLevel });
      
      dispatch({ 
        type: ActionTypes.COMPLETE_QUEST, 
        payload: { id: questId, xpReward: quest.xpReward }
      });
    } catch (error) {
      console.error("Error completing quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const removeQuest = async (questId) => {
    try {
      const questDocRef = doc(db, `users/${state.user.id}/quests`, questId);
      await deleteDoc(questDocRef);
      dispatch({ type: ActionTypes.REMOVE_QUEST, payload: questId });
    } catch (error) {
      console.error("Error removing quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const value = {
    state,
    dispatch,
    addSkill,
    updateSkill,
    removeSkill,
    updateSkillXp,
    addQuest,
    updateQuest,
    completeQuest,
    removeQuest,
    clearError
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