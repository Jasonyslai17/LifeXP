import React from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <img src="/LifeXP.png" alt="LifeXP Logo" className={styles.logo} />
        <span className={styles.logoText}>LifeXP</span>
      </div>
      <a href="https://insigh.to/b/lifexp" className={styles.feedbackButton}>
      💬 feedback?
      </a>
    </nav>
  );
}