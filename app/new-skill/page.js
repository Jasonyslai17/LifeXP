'use client';

import { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { useRouter } from 'next/navigation';
import EmojiPicker from '../components/EmojiPicker';
import styles from './NewSkill.module.css';
import Link from 'next/link';

export default function NewSkill() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const { addSkill } = useGlobalState();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && icon) {
      await addSkill({ name, icon });
      router.push('/');
    }
  };

  return (
    <div className={styles.newSkillPage}>
      <h1>Create a New Skill</h1>
      <form onSubmit={handleSubmit} className={styles.newSkillForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="skillName">Skill Name</label>
          <input
            id="skillName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter skill name"
            required
          />
        </div>
        <div className={styles.emojiPickerContainer}>
          <label>Choose an Emoji</label>
          <EmojiPicker onSelect={setIcon} selectedEmoji={icon} />
        </div>
        <button type="submit" className={styles.submitButton} disabled={!name || !icon}>
          Create Skill
        </button>
      </form>
      <Link href="/" className={styles.backButton}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}