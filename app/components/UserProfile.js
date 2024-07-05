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
    console.log("UserProfile state:", state);
  }, [state]);

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
    return <div>Loading user profile...</div>;
  }

  const { name, xp, streak } = user;
  const level = calculateLevel(xp);
  const xpInCurrentLevel = getXpInCurrentLevel(xp);
  const xpRequiredForNextLevel = getMaxXpForLevel(level) - getMaxXpForLevel(level - 1);

  return (
    <div className={styles.profile}>
      {showConfetti && <Confetti />}
      <div className={styles.header}>
        <img src={session?.user?.image || '/default-avatar.png'} alt={name} className={styles.avatar} />
        <div className={styles.nameAndStreak}>
          <h2>{name}</h2>
          <span className={styles.streak}>🔥 {streak} </span>
        </div>
      </div>
      <div className={styles.levelDisplay}>
        <span className={styles.level}>Level <AnimatedNumber number={level} key={level} /></span>
      </div>
      <div className={styles.progressContainer}>
        <span className={styles.xpCurrent}>{xpInCurrentLevel} XP</span>
        <ProgressBar current={xpInCurrentLevel} max={xpRequiredForNextLevel} />
        <span className={styles.xpRequired}>{xpRequiredForNextLevel} XP</span>
      </div>
      <div className={styles.totalXp}>
        <span>Total XP: {xp}</span>
      </div>
    </div>
  );
}