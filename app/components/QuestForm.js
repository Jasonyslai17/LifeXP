// components/QuestForm.js
import React, { useState, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import styles from './QuestForm.module.css';

const DIFFICULTY_RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];
const XP_REWARDS = {
  'E': 5, 'D': 10, 'C': 20, 'B': 35, 'A': 50, 'S': 75, 'SS': 100
};

export default function QuestForm({ quest, onSubmit, onCancel }) {
  const [title, setTitle] = useState(quest?.title || '');
  const [description, setDescription] = useState(quest?.description || '');
  const [icon, setIcon] = useState(quest?.icon || '');
  const [difficulty, setDifficulty] = useState(quest?.difficulty || 'C');

  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description);
      setIcon(quest.icon);
      setDifficulty(quest.difficulty);
    }
  }, [quest]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedQuest = {
      id: quest?.id,
      title,
      description,
      icon,
      difficulty,
      xpReward: XP_REWARDS[difficulty],
    };
    onSubmit(updatedQuest);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.questForm}>
      <h2>{quest ? 'Edit Quest' : 'Create New Quest'}</h2>
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
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {quest ? 'Update Quest' : 'Create Quest'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}