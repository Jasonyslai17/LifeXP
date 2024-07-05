// ExampleSkillCard.js
import React, { useState, useCallback, useMemo, useRef } from 'react';
import styles from './SkillCard.module.css';
import ProgressBar from './ProgressBar';
import Button from './Button';
import AnimatedNumber from './AnimatedNumber';
import Confetti from './Confetti';
import { calculateLevel, getXpInCurrentLevel, getXpRequiredForNextLevel } from '../utils/levelCalculation';

export default function ExampleSkillCard() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const confettiRef = useRef(null);

  const level = useMemo(() => calculateLevel(xp), [xp]);
  const xpInCurrentLevel = useMemo(() => getXpInCurrentLevel(xp), [xp]);
  const xpRequiredForNextLevel = useMemo(() => getXpRequiredForNextLevel(xp), [xp]);

  const handleAddHour = useCallback(() => {
    setXp(prevXp => {
      const newXp = prevXp + 1;
      const newLevel = calculateLevel(newXp);
      if (newLevel > calculateLevel(prevXp)) {
        setTriggerConfetti(true);
        // Reset trigger after a short delay
        setTimeout(() => setTriggerConfetti(false), 100);
      }
      return newXp;
    });
    setStreak(prevStreak => prevStreak + 1);
  }, []);

  return (
    <div className={styles.card}>
      <Confetti ref={confettiRef} trigger={triggerConfetti} />
      {/* Rest of the component remains the same */}
      <div className={styles.header}>
        <span className={styles.icon}>💻</span>
        <div className={styles.nameAndStreak}>
          <h3>Coding</h3>
          <span className={styles.streak}>🔥 {streak} day streak</span>
        </div>
      </div>
      <div className={styles.levelDisplay}>
        <span className={styles.level}>Level <AnimatedNumber number={level} /></span>
      </div>
      <div className={styles.progressContainer}>
        <span className={styles.xpCurrent}>{xpInCurrentLevel} XP</span>
        <ProgressBar current={xpInCurrentLevel} max={xpRequiredForNextLevel} />
        <span className={styles.xpRequired}>{xpRequiredForNextLevel} XP</span>
      </div>
      <div className={styles.footer}>
        <Button onClick={handleAddHour}>+ hour</Button>
      </div>
    </div>
  );
}