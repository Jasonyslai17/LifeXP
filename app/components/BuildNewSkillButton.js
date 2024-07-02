// components/BuildNewSkillButton.js
import styles from './BuildNewSkillButton.module.css';
import Button from './Button';

export default function BuildNewSkillButton({ onClick }) {
  return (
    <Button onClick={onClick} className={styles.buildButton}>
      <span className={styles.icon}>+</span>
      BUILD A NEW SKILL
    </Button>
  );
}

