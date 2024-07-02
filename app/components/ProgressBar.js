// ProgressBar.js
import styles from './ProgressBar.module.css';

export default function ProgressBar({ current, max, height = 10, color = '#4caf50' }) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div className={styles.progressBarContainer} style={{ height: `${height}px` }}>
      <div 
        className={styles.progressBar}
        style={{ width: `${percentage}%`, backgroundColor: color }}
      ></div>
    </div>
  );
}