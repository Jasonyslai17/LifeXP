'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { calculateLevel, calculateXpForNextLevel, getMaxXpForLevel } from '../utils/levelCalculation';

// Initial state
const initialState = {
  user: null,
  skills: [],
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
  REMOVE_SKILL: 'REMOVE_SKILL',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
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
          skill.id === action.payload.id 
            ? { 
                ...skill, 
                xp: action.payload.newXp, 
                level: action.payload.newLevel, 
                maxXp: action.payload.newMaxXp,
                streak: action.payload.newStreak,
                lastUpdated: action.payload.lastUpdated
              } 
            : skill
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
    case ActionTypes.REMOVE_SKILL:
      return {
        ...state,
        skills: state.skills.filter(skill => skill.id !== action.payload)
      };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Create context
const GlobalStateContext = createContext();

// Provider component
export function GlobalStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initializeUser = async () => {
      console.log("Initializing user...");
      
      // Simulate user authentication (replace with actual auth logic later)
      const userId = 'user123';
      const userDocRef = doc(db, 'users', userId);
      
      try {
        const userDoc = await getDoc(userDocRef);
        let userData;
        if (!userDoc.exists()) {
          console.log("User document doesn't exist, creating new user...");
          userData = { 
            id: userId, 
            name: 'Jason Lai', 
            xp: 0, 
            level: 1, 
            maxXp: getMaxXpForLevel(1) 
          };
          await setDoc(userDocRef, userData);
          console.log("New user created:", userData);
        } else {
          console.log("User document exists, fetching data...");
          userData = userDoc.data();
          console.log("User data fetched:", userData);
        }

        // Fetch skills
        const skillsQuery = query(collection(db, 'skills'), where('userId', '==', userId));
        const skillsSnapshot = await getDocs(skillsQuery);
        const skills = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Skills loaded:", skills);

        // Set initial state with both user and skills data
        dispatch({ 
          type: ActionTypes.SET_INITIAL_STATE, 
          payload: { user: userData, skills: skills }
        });

      } catch (error) {
        console.error("Error initializing user:", error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    };

    initializeUser();
  }, []);

  console.log("Current state:", state);

  const addSkill = async (newSkill) => {
    try {
      const skillRef = doc(collection(db, 'skills'));
      const skillData = { 
        ...newSkill, 
        userId: state.user.id,
        xp: 0,
        level: 1,
        maxXp: getMaxXpForLevel(1),
        streak: 0,
        lastUpdated: Timestamp.now()
      };
      await setDoc(skillRef, skillData);
      dispatch({ type: ActionTypes.ADD_SKILL, payload: { id: skillRef.id, ...skillData } });
    } catch (error) {
      console.error("Error adding skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateSkill = async (skillId, updates) => {
    try {
      await updateDoc(doc(db, 'skills', skillId), updates);
      dispatch({ type: ActionTypes.UPDATE_SKILL, payload: { id: skillId, ...updates } });
    } catch (error) {
      console.error("Error updating skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateSkillXp = async (skillId, xpGained) => {
    try {
      const skill = state.skills.find(s => s.id === skillId);
      if (!skill) throw new Error("Skill not found");
      
      const newXp = skill.xp + xpGained;
      const newLevel = calculateLevel(newXp);
      const newMaxXp = getMaxXpForLevel(newLevel);
      
      const now = Timestamp.now();
      const lastUpdated = skill.lastUpdated ? skill.lastUpdated.toDate() : null;
      
      // Check if the last update was on a different day
      const isNewDay = lastUpdated ? now.toDate().toDateString() !== lastUpdated.toDateString() : true;
      
      const newStreak = isNewDay ? (skill.streak || 0) + 1 : skill.streak || 0;
      
      await updateDoc(doc(db, 'skills', skillId), { 
        xp: newXp, 
        level: newLevel,
        maxXp: newMaxXp,
        streak: newStreak,
        lastUpdated: now
      });
      
      dispatch({ 
        type: ActionTypes.UPDATE_SKILL_XP, 
        payload: { 
          id: skillId, 
          newXp, 
          newLevel, 
          newMaxXp, 
          newStreak, 
          lastUpdated: now 
        }
      });
      
      // Update user's total XP
      await updateUserXp(xpGained);
    } catch (error) {
      console.error("Error updating skill XP:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateUserXp = async (xpGained) => {
    if (!state.user) {
      console.error("User not initialized");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', state.user.id);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }

      const currentXp = userDoc.data().xp || 0;
      const newXp = currentXp + xpGained;
      const newLevel = calculateLevel(newXp);
      const newMaxXp = getMaxXpForLevel(newLevel);
      
      await updateDoc(userDocRef, { 
        xp: newXp,
        level: newLevel,
        maxXp: newMaxXp
      });
      
      dispatch({ 
        type: ActionTypes.UPDATE_USER_XP, 
        payload: { newXp, newLevel, newMaxXp } 
      });
    } catch (error) {
      console.error("Error updating user XP:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeSkill = async (skillId) => {
    try {
      await deleteDoc(doc(db, 'skills', skillId));
      dispatch({ type: ActionTypes.REMOVE_SKILL, payload: skillId });
    } catch (error) {
      console.error("Error removing skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  return (
    <GlobalStateContext.Provider value={{ 
      state, 
      dispatch, 
      addSkill, 
      updateSkill, 
      updateSkillXp, 
      updateUserXp, 
      removeSkill 
    }}>
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