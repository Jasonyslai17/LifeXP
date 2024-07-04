// components/QuestCreationForm.js
import { useState } from 'react';
import EmojiPicker from './EmojiPicker';
import styles from './QuestCreationForm.module.css';

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

export default function QuestCreationForm({ onAddQuest }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [difficulty, setDifficulty] = useState('C');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuest = {
      title,
      description,
      icon,
      difficulty,
      xpReward: XP_REWARDS[difficulty],
      completed: false,
      createdAt: new Date().toISOString()
    };
    onAddQuest(newQuest);
    // Reset form
    setTitle('');
    setDescription('');
    setIcon('');
    setDifficulty('C');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.questForm}>
      <h2>Create a New Quest</h2>
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
  );
}