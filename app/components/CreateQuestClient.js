'use client';

import { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import EmojiPicker from './EmojiPicker';
import styles from './CreateQuestClient.module.css';
import { useRouter } from 'next/navigation';

const DIFFICULTY_RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];
const XP_REWARDS = {
  'E': 5,
  'D': 10,
  'C': 20,
  'B': 35,
  'A': 50,
  'S': 75,
  'SS': 100
};

export default function CreateQuestClient() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [difficulty, setDifficulty] = useState('C');
  const { state, addQuest } = useGlobalState();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state?.user) {
      console.error("User not authenticated");
      return;
    }
    const newQuest = {
      title,
      description,
      icon,
      difficulty,
      xpReward: XP_REWARDS[difficulty],
      completed: false,
      userId: state.user.id,
      createdAt: new Date().toISOString()
    };
    try {
      await addQuest(newQuest);
      router.push('/quests');
    } catch (error) {
      console.error("Failed to create quest:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className={styles.createQuestPage}>
      <h1>Create a New Quest</h1>
      <form onSubmit={handleSubmit} className={styles.questForm}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Icon:</label>
          <EmojiPicker onSelect={setIcon} selectedEmoji={icon} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {DIFFICULTY_RANKS.map(rank => (
              <option key={rank} value={rank}>
                {rank} ({XP_REWARDS[rank]} XP)
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>Create Quest</button>
      </form>
    </div>
  );
}