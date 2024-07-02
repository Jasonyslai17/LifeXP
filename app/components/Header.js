// components/Header.js
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>LifeXP</div>
      <nav className={styles.nav}>
        {/* Add navigation items here if needed */}
      </nav>
    </header>
  );
}

