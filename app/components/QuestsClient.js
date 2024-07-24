// components/QuestsClient.js
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
  const [sortDirection, setSortDirection] = useState('asc');
  const router = useRouter();

  const activeQuests = useMemo(() => state.quests.filter(quest => !quest.completed), [state.quests]);
  const completedQuests = useMemo(() => state.quests.filter(quest => quest.completed), [state.quests]);

  const sortQuests = useCallback((quests) => {
    return [...quests].sort((a, b) => {
      const indexA = DIFFICULTY_ORDER.indexOf(a.difficulty);
      const indexB = DIFFICULTY_ORDER.indexOf(b.difficulty);
      return sortDirection === 'asc' ? indexA - indexB : indexB - indexA;
    });
  }, [sortDirection]);

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

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
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
      <button onClick={toggleSortDirection} className={styles.sortButton}>
        Sort: {sortDirection === 'asc' ? 'Easy to Hard' : 'Hard to Easy'}
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