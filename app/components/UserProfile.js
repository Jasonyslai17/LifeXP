'use client';

import { useGlobalState } from '../context/GlobalStateContext';
import styles from './UserProfile.module.css';
import ProgressBar from './ProgressBar';
import { getMaxXpForLevel, calculateLevel } from '../utils/levelCalculation';

export default function UserProfile() {
  const { state } = useGlobalState();
  const { user } = state;

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  const currentLevel = user.level;
  const currentLevelThreshold = getMaxXpForLevel(currentLevel - 1);
  const nextLevelThreshold = user.maxXp;
  const xpInCurrentLevel = user.xp - currentLevelThreshold;
  const xpRequiredForNextLevel = nextLevelThreshold - currentLevelThreshold;

  return (
    <div className={styles.profile}>
      <div className={styles.avatar}></div>
      <div className={styles.info}>
        <h2>{user.name}</h2>
        <ProgressBar current={xpInCurrentLevel} max={xpRequiredForNextLevel} />
        <div className={styles.xpInfo}>
          <span>{xpInCurrentLevel} / {xpRequiredForNextLevel} XP</span>
        </div>
        <div className={styles.levelInfo}>
          <span>Level {currentLevel}</span>
          <br></br>
          <span>{currentLevelThreshold} XP → {nextLevelThreshold} XP</span>
        </div>
      </div>
    </div>
  );
}