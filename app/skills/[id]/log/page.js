'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalState } from '../../../context/GlobalStateContext';
import styles from './LogTime.module.css';

export default function LogTimePage({ params }) {
  const router = useRouter();
  const { id } = params;
  const { state, updateSkillXp } = useGlobalState();
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const skill = state.skills.find(s => s.id === id);

  if (!skill) {
    return <div>Skill not found</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hoursFloat = parseFloat(hours);
    if (isNaN(hoursFloat) || hoursFloat < 0.1 || hoursFloat > 24) {
      setError('Please enter a valid number of hours between 0.1 and 24');
      return;
    }

    try {
      await updateSkillXp(id, hoursFloat, notes);
      router.push(`/skills/${id}`);
    } catch (err) {
      setError('Failed to log time. Please try again.');
    }
  };

  return (
    <div className={styles.logTimePage}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Back
      </button>
      <h1 className={styles.title}>new {skill.name} session</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="hours">Hours:</label>
          <input
            id="hours"
            type="number"
            min="0.1"
            max="24"
            step="0.1"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            className={styles.hourInput}
            placeholder= "1"
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.notesInput}
            placeholder="What did you work on?"
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.submitButton}>Log Time</button>
      </form>
    </div>
  );
}