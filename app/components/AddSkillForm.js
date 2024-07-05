'use client';

import { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import EmojiPicker from './EmojiPicker';
import Button from './Button';
import styles from './AddSkillForm.module.css';

export default function AddSkillForm({ onCancel }) {
  const { addSkill } = useGlobalState();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AddSkillForm state before adding skill:", state);
    if (!name.trim()) {
      setError('Please enter a skill name');
      return;
    }
    if (!icon) {
      setError('Please select an emoji for the skill');
      return;
    }
    try {
      await addSkill({ name, icon });
      onCancel(); // Close the form after successful addition
    } catch (err) {
      setError('Failed to add skill. Please try again.');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setIcon(emoji);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Add New Skill</h2>
      {error && <div className={styles.error}>{error}</div>}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Skill name"
        className={styles.input}
      />
      <div className={styles.emojiPickerContainer}>
        <label>Choose an emoji for your skill:</label>
        <EmojiPicker onSelect={handleEmojiSelect} />
      </div>
      {icon && (
        <div className={styles.selectedEmoji}>
          Selected Emoji: <span>{icon}</span>
        </div>
      )}
      <div className={styles.buttonContainer}>
        <Button type="submit">Add Skill</Button>
        <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
      </div>
    </form>
  );
}