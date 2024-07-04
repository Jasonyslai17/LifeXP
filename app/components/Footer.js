import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.socialIcons}>
        <a href="#" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
          <img src="/twitter-icon.svg" alt="Twitter" className={styles.icon} />
        </a>
        <a href="#" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
          <img src="/youtube-icon.svg" alt="YouTube" className={styles.icon} />
        </a>
      </div>
    </footer>
  );
}