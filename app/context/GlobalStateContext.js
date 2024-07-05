'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from "next-auth/react";
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
import { getAuth, onAuthStateChanged, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { db, app } from '../firebaseConfig';
import { calculateLevel, getMaxXpForLevel } from '../utils/levelCalculation';

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

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Firebase Auth state changed:", firebaseUser);
      
      if (firebaseUser && status === "authenticated") {
        console.log("Initializing user...");
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          let userData;
          if (!userDoc.exists()) {
            console.log("User document doesn't exist, creating new user...");
            userData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              xp: 0,
              level: 1,
              maxXp: getMaxXpForLevel(1),
              streak: 0,
              lastUpdated: Timestamp.now()
            };
            await setDoc(userDocRef, userData);
          } else {
            console.log("User document exists, fetching data...");
            userData = userDoc.data();
          }

          const skillsQuery = query(collection(db, 'skills'), where('userId', '==', firebaseUser.uid));
          const skillsSnapshot = await getDocs(skillsQuery);
          const skills = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const questsQuery = query(collection(db, 'quests'), where('userId', '==', firebaseUser.uid));
          const questsSnapshot = await getDocs(questsQuery);
          const quests = questsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          dispatch({ 
            type: ActionTypes.SET_INITIAL_STATE, 
            payload: { user: userData, skills: skills, quests: quests, loading: false }
          });

          console.log("User initialized successfully");
        } catch (error) {
          console.error("Error initializing user:", error);
          dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        } finally {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: ActionTypes.SET_INITIAL_STATE, payload: { user: null, skills: [], quests: [], loading: false } });
      }
    });

    return () => unsubscribe();
  }, [status, session]);

  useEffect(() => {
    console.log("Current state:", state);
  }, [state]);

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
      console.log("New skill added:", { id: skillRef.id, ...skillData });
    } catch (error) {
      console.error("Error adding skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateSkill = async (skillId, updates) => {
    try {
      const skillRef = doc(db, 'skills', skillId);
      const skillDoc = await getDoc(skillRef);
  
      if (!skillDoc.exists()) {
        throw new Error("Skill not found");
      }
  
      const currentSkill = skillDoc.data();
      const updatedSkill = { ...currentSkill, ...updates };
  
      // If XP is being updated, recalculate level and maxXp
      if ('xp' in updates) {
        updatedSkill.level = calculateLevel(updatedSkill.xp);
        updatedSkill.maxXp = getMaxXpForLevel(updatedSkill.level);
      }
  
      await updateDoc(skillRef, updatedSkill);
      
      dispatch({ 
        type: ActionTypes.UPDATE_SKILL, 
        payload: { id: skillId, ...updatedSkill } 
      });
  
      console.log(`Skill ${skillId} updated:`, updatedSkill);
    } catch (error) {
      console.error("Error updating skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateSkillXp = async (skillId, xpGained) => {
    try {
      const skill = state.skills.find(s => s.id === skillId);
      if (!skill) throw new Error("Skill not found");
      
      console.log("Current skill data:", skill);
  
      let newTotalXp = (skill.xp || 0) + xpGained;
      let newLevel = skill.level || 1;
      let xpInCurrentLevel = skill.xpInCurrentLevel || 0;
  
      // Check if we need to level up
      while (xpInCurrentLevel + xpGained >= getMaxXpForLevel(newLevel)) {
        const xpForCurrentLevel = getMaxXpForLevel(newLevel);
        xpGained -= (xpForCurrentLevel - xpInCurrentLevel);
        newLevel++;
        xpInCurrentLevel = 0;
      }
  
      xpInCurrentLevel += xpGained;
      const newMaxXp = getMaxXpForLevel(newLevel);
      
      console.log("Calculated values:", {
        newTotalXp,
        newLevel,
        newMaxXp,
        xpInCurrentLevel
      });
  
      const now = Timestamp.now();
      const lastUpdated = skill.lastUpdated ? skill.lastUpdated.toDate() : null;
      
      const isNewDay = lastUpdated ? now.toDate().toDateString() !== lastUpdated.toDateString() : true;
      
      const newStreak = isNewDay ? ((skill.streak || 0) + 1) : (skill.streak || 0);
      
      const updatedSkill = { 
        ...skill,
        xp: newTotalXp, 
        level: newLevel,
        xpInCurrentLevel: xpInCurrentLevel,
        maxXp: newMaxXp,
        streak: newStreak,
        lastUpdated: now
      };
      
      console.log("Updated skill data:", updatedSkill);
  
      await updateDoc(doc(db, 'skills', skillId), updatedSkill);
      
      dispatch({ 
        type: ActionTypes.UPDATE_SKILL_XP, 
        payload: updatedSkill
      });
      
      await updateUserXp(xpGained);
      await updateUserStreak(isNewDay);
  
      console.log(`Skill ${skillId} updated in database and state:`, updatedSkill);
      return updatedSkill;
    } catch (error) {
      console.error("Error updating skill XP:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
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

  const updateUserStreak = async (isNewDay) => {
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

      const currentStreak = userDoc.data().streak || 0;
      const newStreak = isNewDay ? currentStreak + 1 : currentStreak;
      const now = Timestamp.now();

      await updateDoc(userDocRef, { 
        streak: newStreak,
        lastUpdated: now
      });
      
      dispatch({ 
        type: ActionTypes.UPDATE_USER_STREAK, 
        payload: { streak: newStreak, lastUpdated: now } 
      });
    } catch (error) {
      console.error("Error updating user streak:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeSkill = async (skillId) => {
    try {
      await deleteDoc(doc(db, 'skills', skillId));
      dispatch({ type: ActionTypes.REMOVE_SKILL, payload: skillId });
      console.log(`Skill ${skillId} removed successfully`);
    } catch (error) {
      console.error("Error removing skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const addQuest = async (newQuest) => {
    try {
      const questRef = doc(collection(db, 'quests'));
      const questData = { 
        ...newQuest, 
        userId: state.user.id,
        createdAt: Timestamp.now()
      };
      await setDoc(questRef, questData);
      dispatch({ type: ActionTypes.ADD_QUEST, payload: { id: questRef.id, ...questData } });
      console.log("New quest added:", { id: questRef.id, ...questData });
    } catch (error) {
      console.error("Error adding quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateQuest = async (updatedQuest) => {
    try {
      const questRef = doc(db, 'quests', updatedQuest.id);
      await updateDoc(questRef, updatedQuest);
      dispatch({ type: ActionTypes.UPDATE_QUEST, payload: updatedQuest });
      console.log(`Quest ${updatedQuest.id} updated:`, updatedQuest);
    } catch (error) {
      console.error("Error updating quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeQuest = async (questId) => {
    try {
      const questRef = doc(db, 'quests', questId);
      await deleteDoc(questRef);
      dispatch({ type: ActionTypes.REMOVE_QUEST, payload: questId });
      console.log(`Quest ${questId} removed successfully`);
    } catch (error) {
      console.error("Error removing quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const completeQuest = async (questId) => {
    try {
      const questRef = doc(db, 'quests', questId);
      const questDoc = await getDoc(questRef);
  
      if (!questDoc.exists()) {
        throw new Error("Quest not found");
      }
  
      const questData = questDoc.data();
      await updateDoc(questRef, { completed: true });
  
      // Update user XP
      const userRef = doc(db, 'users', state.user.id);
      const newXp = state.user.xp + questData.xpReward;
      const newLevel = calculateLevel(newXp);
      await updateDoc(userRef, { 
        xp: newXp,
        level: newLevel
      });
  
      dispatch({ 
        type: ActionTypes.COMPLETE_QUEST, 
        payload: { id: questId, xpReward: questData.xpReward } 
      });
      console.log(`Quest ${questId} completed, user XP updated`);
    } catch (error) {
      console.error("Error completing quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
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
    updateSkillXp,
    updateUserXp,
    updateUserStreak,
    removeSkill,
    addQuest,
    updateQuest,
    removeQuest,
    completeQuest,
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