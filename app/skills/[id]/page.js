'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalState } from '../../context/GlobalStateContext';
import SkillCard from '../../components/SkillCard';
import EditSkillModal from '../../components/EditSkillModal';
import styles from './SkillDetails.module.css';

export default function SkillDetailsPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const { state, removeSkill, updateSkill } = useGlobalState();
  const [sortOrder, setSortOrder] = useState('newest');
  const [showEditModal, setShowEditModal] = useState(false);

  const skill = state.skills.find(s => s.id === id);

  if (!skill) {
    return <div>Skill not found</div>;
  }

  const sortedEntries = skill.logEntries 
    ? [...skill.logEntries].sort((a, b) => {
        return sortOrder === 'newest' 
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      })
    : [];

  const handleRemoveSkill = async () => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      await removeSkill(id);
      router.push('/');
    }
  };

  const handleSaveEdit = async (updatedSkill) => {
    await updateSkill(id, updatedSkill);
    setShowEditModal(false);
  };

  return (
    <div className={styles.skillDetailsPage}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Back
      </button>
      <SkillCard {...skill} />
      <div className={styles.actions}>
        <button onClick={() => setShowEditModal(true)} className={styles.editButton}>Edit Skill</button>
        <button onClick={handleRemoveSkill} className={styles.removeButton}>Remove Skill</button>
      </div>
      <div className={styles.entriesSection}>
        <h2>Logged Entries</h2>
        <div className={styles.sortContainer}>
          <label htmlFor="sortOrder">Sort by:</label>
          <select 
            id="sortOrder"
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        {sortedEntries.length > 0 ? (
          <ul className={styles.entriesList}>
            {sortedEntries.map((entry, index) => (
              <li key={index} className={styles.entryItem}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryDate}>{new Date(entry.date).toLocaleDateString()}</span>
                  <span className={styles.entryHours}>{entry.hours} hours</span>
                </div>
                <p className={styles.entryNotes}>{entry.notes || 'No notes added'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noEntries}>No entries logged yet.</p>
        )}
      </div>
      {showEditModal && (
        <EditSkillModal
          skill={skill}
          onSave={handleSaveEdit}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}