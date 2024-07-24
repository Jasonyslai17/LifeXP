'use client';

import Leaderboard from '../components/Leaderboard';
import styles from './Social.module.css';

export default function SocialPage() {
  return (
    <div className={styles.socialPage}>
      <h1>Social</h1>
      <Leaderboard />
    </div>
  );
}