'use client';

import { useState, useEffect } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import styles from './SkillCard.module.css';
import ProgressBar from './ProgressBar';
import Button from './Button';
import { getMaxXpForLevel, calculateLevel, getXpInCurrentLevel } from '../utils/levelCalculation';

export default function SkillCard({ id, name, icon }) {
  const { state, updateSkillXp, removeSkill } = useGlobalState();
  const [error, setError] = useState(null);

  // Find the current skill data from the global state
  const skill = state.skills.find(s => s.id === id);

  // If skill is not found, return null or an error message
  if (!skill) {
    return <div>Skill not found</div>;
  }

  const { xp, streak } = skill;

  const currentLevel = calculateLevel(xp);
  const currentLevelThreshold = getMaxXpForLevel(currentLevel - 1);
  const nextLevelThreshold = getMaxXpForLevel(currentLevel);
  const xpInCurrentLevel = xp - currentLevelThreshold;
  const xpRequiredForNextLevel = nextLevelThreshold - currentLevelThreshold;

  const handleAddHour = async () => {
    try {
      await updateSkillXp(id, 1); // 1 hour = 1 XP
      setError(null);
    } catch (err) {
      console.error("Error adding hour:", err);
      setError("Failed to update skill. Please try again.");
    }
  };

  const handleRemoveSkill = async () => {
    try {
      await removeSkill(id);
    } catch (err) {
      console.error("Error removing skill:", err);
      setError("Failed to remove skill. Please try again.");
    }
  };

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.error}>{error}</div>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h3>{name}</h3>
        <button onClick={handleRemoveSkill} className={styles.removeButton}>X</button>
      </div>
      <ProgressBar current={xpInCurrentLevel} max={xpRequiredForNextLevel} />
      <div className={styles.levelInfo}>
        <span>Level {currentLevel}</span>
        <br />
        <span>{xpInCurrentLevel} / {xpRequiredForNextLevel} XP</span>
        <br />
        <span>{currentLevelThreshold} XP → {nextLevelThreshold} XP</span>
      </div>
      <div className={styles.streakInfo}>
        Streak: {streak} day{streak !== 1 ? 's' : ''}
      </div>
      <div className={styles.footer}>
        <Button variant="secondary" onClick={handleAddHour}>+ hour</Button>
      </div>
    </div>
  );
}