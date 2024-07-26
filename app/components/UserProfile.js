'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useGlobalState } from '../context/GlobalStateContext';
import styles from './UserProfile.module.css';
import ProgressBar from './ProgressBar';
import AnimatedNumber from './AnimatedNumber';
import Confetti from 'react-confetti';
import { getMaxXpForLevel, calculateLevel, getXpInCurrentLevel } from '../utils/levelCalculation';

export default function UserProfile() {
  const { data: session } = useSession();
  const { state } = useGlobalState();
  const { user } = state;
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevLevel, setPrevLevel] = useState(null);

  useEffect(() => {
    if (user) {
      const currentLevel = calculateLevel(user.xp);
      if (prevLevel !== null && currentLevel > prevLevel) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setPrevLevel(currentLevel);
    }
  }, [user, prevLevel]);

  if (!user) {
    return null;
  }

  const { name, xp } = user;
  const level = calculateLevel(xp);
  const xpInCurrentLevel = getXpInCurrentLevel(xp);
  const xpRequiredForNextLevel = getMaxXpForLevel(level) - getMaxXpForLevel(level - 1);

  return (
    <div className={styles.profile}>
      {showConfetti && <Confetti />}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img src={session?.user?.image || '/default-avatar.png'} alt={name} className={styles.avatar} />
          <h2>{name}</h2>
        </div>
        <div className={styles.levelDisplay}>
          <span className={styles.levelNumber}>
            <AnimatedNumber number={level} key={level} />
          </span>
          <span className={styles.levelText}>LVL</span>
        </div>
      </div>
      <div className={styles.progressContainer}>
        <ProgressBar current={xpInCurrentLevel} max={xpRequiredForNextLevel} />
        <div className={styles.xpInfo}>
          <span className={styles.xpCurrent}>{xpInCurrentLevel} / {xpRequiredForNextLevel} XP</span>
          <span className={styles.totalXp}>Total XP: {xp}</span>
        </div>
      </div>
    </div>
  );
}