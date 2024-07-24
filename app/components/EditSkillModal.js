import React from 'react';
import styles from './EditSkillModal.module.css';
import EmojiPicker from './EmojiPicker';

export default function EditSkillModal({ skill, onSave, onCancel }) {
  const [editName, setEditName] = React.useState(skill.name);
  const [editIcon, setEditIcon] = React.useState(skill.icon);

  const handleSave = () => {
    onSave({ name: editName, icon: editIcon });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edit Skill</h2>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className={styles.input}
          placeholder="Skill Name"
        />
        <EmojiPicker onSelect={setEditIcon} selectedEmoji={editIcon} />
        <div className={styles.buttonContainer}>
          <button onClick={handleSave} className={styles.saveButton}>Save</button>
          <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
        </div>
      </div>
    </div>
  );
}