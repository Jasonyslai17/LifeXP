import React from 'react';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Image src="/LifeXP.png" alt="LifeXP Logo" width={50} height={50} className={styles.logo} />
        <span className={styles.logoText}>LifeXP</span>
      </div>
      <a href="https://insigh.to/b/lifexp" className={styles.feedbackButton}>
      💬 feedback?
      </a>
    </nav>
  );
}