// components/XpOrbsAnimation.js
import React, { useEffect, useState } from 'react';
import styles from './XpOrbsAnimation.module.css';

const XpOrbsAnimation = ({ xp, onComplete }) => {
  const [orbs, setOrbs] = useState([]);

  useEffect(() => {
    const newOrbs = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 40 + 30}%`,
      animationDelay: `${Math.random() * 0.5}s`,
      animationDuration: `${1.5 + Math.random()}s`
    }));
    setOrbs(newOrbs);

    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [xp, onComplete]);

  return (
    <div className={styles.orbsContainer}>
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={styles.orb}
          style={{
            left: orb.left,
            top: orb.top,
            animationDelay: orb.animationDelay,
            animationDuration: orb.animationDuration
          }}
        >
          +{Math.floor(xp / 20)}
        </div>
      ))}
    </div>
  );
};

export default XpOrbsAnimation;