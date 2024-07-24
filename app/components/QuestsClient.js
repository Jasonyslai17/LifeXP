'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import QuestList from './QuestList';
import UserProfile from './UserProfile';
import XpOrbsAnimation from './XpOrbsAnimation';
import QuestForm from './QuestForm';
import styles from './QuestsClient.module.css';
import { useRouter } from 'next/navigation';

const DIFFICULTY_ORDER = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];

export default function QuestsClient() {
  const { state, completeQuest, removeQuest, updateQuest } = useGlobalState();
  const [showActive, setShowActive] = useState(true);
  const [showXpOrbs, setShowXpOrbs] = useState(false);
  const [completedQuestXp, setCompletedQuestXp] = useState(0);
  const [editingQuest, setEditingQuest] = useState(null);
  const [sortType, setSortType] = useState('difficulty-asc');
  const router = useRouter();

  const activeQuests = useMemo(() => state.quests.filter(quest => !quest.completed), [state.quests]);
  const completedQuests = useMemo(() => state.quests.filter(quest => quest.completed), [state.quests]);

  const sortQuests = useCallback((quests) => {
    return [...quests].sort((a, b) => {
      switch (sortType) {
        case 'difficulty-asc':
          return DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty);
        case 'difficulty-desc':
          return DIFFICULTY_ORDER.indexOf(b.difficulty) - DIFFICULTY_ORDER.indexOf(a.difficulty);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  }, [sortType]);

  const sortedActiveQuests = useMemo(() => sortQuests(activeQuests), [activeQuests, sortQuests]);
  const sortedCompletedQuests = useMemo(() => sortQuests(completedQuests), [completedQuests, sortQuests]);

  const handleCompleteQuest = useCallback(async (questId, xpReward) => {
    setShowXpOrbs(true);
    setCompletedQuestXp(xpReward);
    
    setTimeout(async () => {
      await completeQuest(questId);
      setShowXpOrbs(false);
    }, 2500);
  }, [completeQuest]);

  const handleRemoveQuest = useCallback(async (questId) => {
    await removeQuest(questId);
  }, [removeQuest]);

  const handleEditQuest = useCallback((quest) => {
    setEditingQuest(quest);
  }, []);

  const handleUpdateQuest = useCallback(async (updatedQuest) => {
    await updateQuest(updatedQuest);
    setEditingQuest(null);
  }, [updateQuest]);

  const handleCreateQuest = useCallback(() => {
    router.push('/quests/create');
  }, [router]);

  const toggleSort = useCallback(() => {
    setSortType(prevType => {
      switch (prevType) {
        case 'difficulty-asc': return 'difficulty-desc';
        case 'difficulty-desc': return 'date-asc';
        case 'date-asc': return 'date-desc';
        case 'date-desc': return 'difficulty-asc';
        default: return 'difficulty-asc';
      }
    });
  }, []);

  return (
    <div className={styles.questsPage}>
      {showXpOrbs && (
        <XpOrbsAnimation
          xp={completedQuestXp}
          onComplete={() => setShowXpOrbs(false)}
        />
      )}
      <UserProfile />
      <h1 className={styles.pageTitle}>Quests</h1>
      <div className={styles.toggleContainer}>
        <button 
          onClick={() => setShowActive(true)} 
          className={`${styles.toggleButton} ${showActive ? styles.active : ''}`}
        >
          Active
        </button>
        <button 
          onClick={() => setShowActive(false)} 
          className={`${styles.toggleButton} ${!showActive ? styles.active : ''}`}
        >
          Completed
        </button>
      </div>
      <button onClick={toggleSort} className={styles.sortButton}>
        Sort: {
          sortType === 'difficulty-asc' ? 'Easy to Hard' :
          sortType === 'difficulty-desc' ? 'Hard to Easy' :
          sortType === 'date-asc' ? 'Oldest to Newest' :
          'Newest to Oldest'
        }
      </button>
      {editingQuest && (
        <QuestForm
          quest={editingQuest}
          onSubmit={handleUpdateQuest}
          onCancel={() => setEditingQuest(null)}
        />
      )}
      <div className={styles.questList}>
        <QuestList 
          quests={showActive ? sortedActiveQuests : sortedCompletedQuests} 
          onCompleteQuest={handleCompleteQuest} 
          onRemoveQuest={handleRemoveQuest}
          onEditQuest={handleEditQuest}
          completed={!showActive}
        />
      </div>
      <button onClick={handleCreateQuest} className={styles.createQuestButton}>
        Create Quest
      </button>
    </div>
  );
}