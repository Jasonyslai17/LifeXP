'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalState } from '../../context/GlobalStateContext';
import EmojiPicker from '../../components/EmojiPicker';
import styles from './EditSkill.module.css';

export default function EditSkillPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const { state, updateSkill } = useGlobalState();
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const skill = state.skills.find(s => s.id === id);

  useEffect(() => {
    if (skill) {
      setEditName(skill.name);
      setEditIcon(skill.icon);
    }
  }, [skill]);

  if (!skill) {
    return <div>Skill not found</div>;
  }

  const handleSave = async () => {
    await updateSkill(id, { name: editName, icon: editIcon });
    router.push(`/skills/${id}`);
  };

  return (
    <div className={styles.editSkillPage}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Back
      </button>
      <h1>Edit Skill</h1>
      <div className={styles.form}>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className={styles.input}
          placeholder="Skill Name"
        />
        <EmojiPicker onSelect={setEditIcon} selectedEmoji={editIcon} />
        <button onClick={handleSave} className={styles.saveButton}>Save</button>
      </div>
    </div>
  );
}