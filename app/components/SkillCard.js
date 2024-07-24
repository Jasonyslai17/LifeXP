'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalState } from '../context/GlobalStateContext';
import styles from './SkillCard.module.css';
import ProgressBar from './ProgressBar';
import Button from './Button';
import { calculateLevel, getMaxXpForLevel } from '../utils/levelCalculation';
import AnimatedNumber from './AnimatedNumber';
import Confetti from 'react-confetti';

export default function SkillCard({ id, name, icon }) {
  const router = useRouter();
  const { state } = useGlobalState();
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevLevel, setPrevLevel] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  const skill = state.skills.find(s => s.id === id);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (skill) {
      const currentLevel = calculateLevel(skill.xp);
      if (prevLevel !== null && currentLevel > prevLevel) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setPrevLevel(currentLevel);
    }
  }, [skill, prevLevel]);

  if (!skill) {
    return <div>Loading skill data...</div>;
  }

  const { xp, streak } = skill;
  const level = calculateLevel(xp);
  const xpForCurrentLevel = getMaxXpForLevel(level - 1);
  const xpRequiredForNextLevel = getMaxXpForLevel(level);

  const handleCardClick = () => {
    router.push(`/skills/${id}`);
  };

  const handleAddTime = (e) => {
    e.stopPropagation(); // Prevent the card click event from firing
    router.push(`/skills/${id}/log`);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <div className={styles.nameAndStreak}>
          <h3>{name}</h3>
          <span className={styles.streak}>🔥 {streak} </span>
        </div>
      </div>
      <div className={styles.levelDisplay}>
        <span className={styles.level}>Level <AnimatedNumber number={level} key={level} /></span>
      </div>
      <div className={styles.progressContainer}>
        <span className={styles.xpCurrent}>{xpForCurrentLevel} XP</span>
        <ProgressBar current={xp - xpForCurrentLevel} max={xpRequiredForNextLevel - xpForCurrentLevel} />
        <span className={styles.xpRequired}>{xpRequiredForNextLevel} XP</span>
      </div>
      <div className={styles.footer}>
        <Button 
          variant="secondary" 
          onClick={handleAddTime}
        >
          +
        </Button>
      </div>
    </div>
  );
}