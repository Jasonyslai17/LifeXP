import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <img src="/LifeXp.png" alt="LifeXP" className={styles.appIcon} />
      <ul>
        <li>
          <Link href="/">
            <span className={styles.icon}>📊</span> Dashboard
          </Link>
        </li>
        <li>
          <Link href="/quests">
            <span className={styles.icon}>🎯</span> Quests
          </Link>
        </li>
        <li>
          <Link href="/profile">
            <span className={styles.icon}>👤</span> Profile
          </Link>
        </li>
        <li>
          <a href="https://insigh.to/b/lifexp" className={styles.feedbackLink}>
            <span className={styles.icon}>💬</span> Feedback?
          </a>
        </li>
      </ul>
    </nav>
  );
}