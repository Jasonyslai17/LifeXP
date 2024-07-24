'use client';

import { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import SkillCard from './SkillCard';
import BuildNewSkillButton from './BuildNewSkillButton';
import AddSkillForm from './AddSkillForm';
import styles from './DashboardClient.module.css';

export default function DashboardClient() {
  const { state, addSkill } = useGlobalState();
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const handleBuildNewSkill = () => {
    setIsAddingSkill(true);
  };

  const handleAddSkill = (newSkill) => {
    addSkill(newSkill);
    setIsAddingSkill(false);
  };

  if (state.loading) {
    return <div>Loading dashboard...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error}</div>;
  }

  return (
    <>
      <div className={styles.dashboard}>
    <div className={styles.skillsGrid}>
      {state.skills && state.skills.length > 0 ? (
        state.skills.map((skill) => (
          <SkillCard key={skill.id} {...skill} />
        ))
      ) : (
        <div></div>
      )}
    </div>
  </div>
    </>
  );
}