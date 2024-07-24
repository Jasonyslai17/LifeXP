// components/Sidebar.js
import Link from 'next/link';
import Image from 'next/image';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <Link href="/" className={styles.logoContainer}>
        <Image 
          src="/LifeXP.png" 
          alt="LifeXP Logo" 
          width={40} 
          height={40}
        />
      </Link>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/quests">
            Quests
          </Link>
        </li>
        <li>
          <Link href="/profile">
            Profile
          </Link>
        </li>
        <li>
          <a href="https://insigh.to/b/lifexp" className={styles.feedbackLink}>
            Feedback?
          </a>
        </li>
      </ul>
    </nav>
  );
}