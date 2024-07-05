import React from 'react';
import styles from './Footer.module.css';

export default function Footer({ isVisible }) {
  if (!isVisible) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.socialIcons}>
        <a href="https://x.com/LaiYZJ" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <img src="/twitter.png" alt="" className={styles.icon} />
        </a>
        <a href="https://www.youtube.com/@Jason_lai" className={styles.socialLink} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <img src="/youtube.png" alt="" className={styles.icon} />
        </a>
      </div>
    </footer>
  );
}