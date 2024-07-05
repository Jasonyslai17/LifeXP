'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import styles from './LevelUpFeedback.module.css';

export default function LevelUpFeedback({ level }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.levelUpOverlay}>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.1}
      />
      <div className={styles.levelUpMessage}>
        <h2>Level Up!</h2>
        <p>You&apos;ve reached level {level}</p>
      </div>
    </div>
  );
}