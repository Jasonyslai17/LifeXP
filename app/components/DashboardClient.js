'use client';

import { useGlobalState } from '../context/GlobalStateContext';
import SkillCard from './SkillCard';
import styles from './DashboardClient.module.css';

export default function DashboardClient() {
  const { state } = useGlobalState();

  if (state.loading) {
    return <div>Loading dashboard...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.skillsGrid}>
        {state.skills && state.skills.length > 0 ? (
          state.skills.map((skill) => (
            <SkillCard key={skill.id} {...skill} />
          ))
        ) : (
          <div className={styles.noSkills}>No skills added yet. Start by adding a new skill!</div>
        )}
      </div>
    </div>
  );
}