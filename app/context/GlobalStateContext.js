'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { calculateLevel } from '../utils/levelCalculation';

console.log("Firestore instance in GlobalStateContext:", db);

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
  LOG_TIME: 'LOG_TIME',
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
          lastUpdated: action.payload.lastUpdated
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
          level: calculateLevel(state.user.xp + action.payload.xpReward),
          lastUpdated: action.payload.lastUpdated
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
    case ActionTypes.LOG_TIME:
      return {
        ...state,
        skills: state.skills.map(skill =>
          skill.id === action.payload.skillId
            ? {
                ...skill,
                xp: skill.xp + action.payload.hours,
                logEntries: [
                  ...(skill.logEntries || []),
                  {
                    date: action.payload.lastUpdated,
                    hours: action.payload.hours,
                    notes: action.payload.notes
                  }
                ]
              }
            : skill
        ),
        user: {
          ...state.user,
          xp: state.user.xp + action.payload.hours,
          level: calculateLevel(state.user.xp + action.payload.hours),
          lastUpdated: action.payload.lastUpdated
        }
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
    console.log("Full session object:", session);
    console.log("GlobalStateProvider: Session status changed:", status);

    if (status === "authenticated" && session?.user?.email) {
      console.log("GlobalStateProvider: Authenticated session detected");
      initializeUser(session.user);
    } else if (status === "unauthenticated") {
      console.log("GlobalStateProvider: User is not authenticated");
      dispatch({ type: ActionTypes.SET_INITIAL_STATE, payload: { user: null, skills: [], quests: [], loading: false } });
    }
  }, [status, session]);

  const initializeUser = async (sessionUser) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      console.log("Full sessionUser object:", sessionUser);
      const userId = sessionUser.email; // Use email as a unique identifier
      console.log("User ID (email) from session:", userId);

      // Sign in anonymously to Firebase
      const auth = getAuth();
      await signInAnonymously(auth);
      console.log("Firebase auth state:", auth.currentUser);
      
      const userDocRef = doc(db, "users", userId);
      console.log("GlobalStateProvider: Attempting to fetch user document");
      console.log("Attempting to fetch user document for:", userId);
      const userDoc = await getDoc(userDocRef);
      console.log("User document exists:", userDoc.exists());

      let userData;
      if (!userDoc.exists()) {
        console.log("GlobalStateProvider: User document doesn't exist, creating new user data");
        userData = {
          id: userId,
          name: sessionUser.name,
          email: sessionUser.email,
          xp: 0,
          level: 1,
          streak: 0,
          lastUpdated: new Date().toISOString(),
          profilePicture: sessionUser.image,
          username: sessionUser.email.split('@')[0] // Create a default username
        };
        await setDoc(userDocRef, userData);
      } else {
        console.log("GlobalStateProvider: User document exists, fetching data");
        userData = userDoc.data();
        // Update profile picture if it has changed
        if (userData.profilePicture !== sessionUser.image) {
          await updateDoc(userDocRef, { 
            profilePicture: sessionUser.image,
            lastUpdated: new Date().toISOString()
          });
          userData.profilePicture = sessionUser.image;
          userData.lastUpdated = new Date().toISOString();
        }
      }

      dispatch({ type: ActionTypes.SET_USER, payload: userData });

      console.log("GlobalStateProvider: Fetching skills");
      const skillsCollection = collection(db, `users/${userId}/skills`);
      const skillsSnapshot = await getDocs(skillsCollection);
      const skills = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: ActionTypes.SET_SKILLS, payload: skills });

      console.log("GlobalStateProvider: Fetching quests");
      const questsCollection = collection(db, `users/${userId}/quests`);
      const questsSnapshot = await getDocs(questsCollection);
      const quests = questsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: ActionTypes.SET_QUESTS, payload: quests });

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      console.log("GlobalStateProvider: User initialized successfully");
    } catch (error) {
      console.error("GlobalStateProvider: Error initializing user:", error);
      console.error("GlobalStateProvider: Error details:", error.code, error.message);
      console.error("GlobalStateProvider: Full error object:", JSON.stringify(error, null, 2));
      if (error.stack) console.error("Error stack:", error.stack);
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
        userId: state.user.email,
        xp: 0,
        level: 1,
        streak: 0,
        lastUpdated: new Date().toISOString(),
        logEntries: []
      };
      const skillDocRef = doc(collection(db, `users/${state.user.email}/skills`));
      await setDoc(skillDocRef, skillData);
      dispatch({ type: ActionTypes.ADD_SKILL, payload: { ...skillData, id: skillDocRef.id } });
    } catch (error) {
      console.error("GlobalStateProvider: Error adding skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateSkill = async (skillId, updates) => {
    try {
      const skillDocRef = doc(db, `users/${state.user.email}/skills`, skillId);
      await updateDoc(skillDocRef, updates);
      dispatch({ 
        type: ActionTypes.UPDATE_SKILL, 
        payload: { id: skillId, ...updates } 
      });
    } catch (error) {
      console.error("GlobalStateProvider: Error updating skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateSkillXp = async (skillId, hours, notes) => {
    try {
      const skillDocRef = doc(db, `users/${state.user.email}/skills`, skillId);
      const skillDoc = await getDoc(skillDocRef);
      if (!skillDoc.exists()) {
        throw new Error("Skill not found");
      }
      const skill = skillDoc.data();
      const newXp = skill.xp + hours;
      const now = new Date().toISOString();
      const updatedSkill = { 
        ...skill, 
        xp: newXp, 
        lastUpdated: now,
        logEntries: [
          ...(skill.logEntries || []),
          {
            date: now,
            hours,
            notes
          }
        ]
      };
      await updateDoc(skillDocRef, updatedSkill);
      
      dispatch({ 
        type: ActionTypes.LOG_TIME, 
        payload: { skillId, hours, notes, lastUpdated: now }
      });
      
      // Update user XP and lastUpdated
      const userDocRef = doc(db, "users", state.user.email);
      const newUserXp = state.user.xp + hours;
      const newUserLevel = calculateLevel(newUserXp);
      await updateDoc(userDocRef, { xp: newUserXp, level: newUserLevel, lastUpdated: now });
      dispatch({ 
        type: ActionTypes.UPDATE_USER_XP, 
        payload: { newXp: newUserXp, newLevel: newUserLevel, lastUpdated: now }
      });
    } catch (error) {
      console.error("GlobalStateProvider: Error logging time:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const removeSkill = async (skillId) => {
    try {
      const skillDocRef = doc(db, `users/${state.user.email}/skills`, skillId);
      await deleteDoc(skillDocRef);
      dispatch({ type: ActionTypes.REMOVE_SKILL, payload: skillId });
    } catch (error) {
      console.error("GlobalStateProvider: Error removing skill:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const addQuest = async (newQuest) => {
    try {
      if (!state.user) {
        throw new Error("User not authenticated");
      }
      const questDocRef = doc(collection(db, `users/${state.user.email}/quests`));
      await setDoc(questDocRef, newQuest);
      dispatch({ type: ActionTypes.ADD_QUEST, payload: { ...newQuest, id: questDocRef.id } });
    } catch (error) {
      console.error("GlobalStateProvider: Error adding quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateQuest = async (questId, updates) => {
    try {
      const questDocRef = doc(db, `users/${state.user.email}/quests`, questId);
      await updateDoc(questDocRef, updates);
      dispatch({ 
        type: ActionTypes.UPDATE_QUEST, 
        payload: { id: questId, ...updates } 
      });
    } catch (error) {
      console.error("GlobalStateProvider: Error updating quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const completeQuest = async (questId) => {
    try {
      const questDocRef = doc(db, `users/${state.user.email}/quests`, questId);
      const questDoc = await getDoc(questDocRef);
      if (!questDoc.exists()) {
        throw new Error("Quest not found");
      }
      const quest = questDoc.data();
      const now = new Date().toISOString();
      await updateDoc(questDocRef, { completed: true, completedAt: now });
      
      // Update user XP and lastUpdated
      const userDocRef = doc(db, "users", state.user.email);
      const newUserXp = state.user.xp + quest.xpReward;
      const newUserLevel = calculateLevel(newUserXp);
      await updateDoc(userDocRef, { xp: newUserXp, level: newUserLevel, lastUpdated: now });
      
      dispatch({ 
        type: ActionTypes.COMPLETE_QUEST, 
        payload: { id: questId, xpReward: quest.xpReward, lastUpdated: now }
      });
    } catch (error) {
      console.error("GlobalStateProvider: Error completing quest:", error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const removeQuest = async (questId) => {
    try {
      const questDocRef = doc(db, `users/${state.user.email}/quests`, questId);
      await deleteDoc(questDocRef);
      dispatch({ type: ActionTypes.REMOVE_QUEST, payload: questId });
    } catch (error) {
      console.error("GlobalStateProvider: Error removing quest:", error);
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