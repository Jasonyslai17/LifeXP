'use client';

import { useState, useEffect } from 'react';
import styles from './AnimatedNumber.module.css';

export default function AnimatedNumber({ number, duration = 2000 }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), duration);
    return () => clearTimeout(timer);
  }, [number, duration]);

  return (
    <span className={`${styles.animatedNumber} ${isAnimating ? styles.animate : ''}`}>
      {number}
    </span>
  );
}