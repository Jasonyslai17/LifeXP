'use client';

import { useState, useEffect } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import styles from './LoadingOverlay.module.css';

export default function LoadingOverlay() {
  const { state } = useGlobalState();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!state.loading) {
      const timer = setTimeout(() => setVisible(false), 300); // Delay to allow fade-out
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [state.loading]);

  if (!visible) return null;

  return (
    <div className={`${styles.overlay} ${!state.loading ? styles.fadeOut : ''}`}>
      <div className={styles.spinner}></div>
    </div>
  );
}