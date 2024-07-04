'use client';

import { useState, useEffect } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import styles from './SkillCard.module.css';
import ProgressBar from './ProgressBar';
import Button from './Button';
import { calculateLevel, getXpInCurrentLevel, getXpRequiredForNextLevel } from '../utils/levelCalculation';
import AnimatedNumber from './AnimatedNumber';
import Confetti from 'react-confetti';
import EmojiPicker from './EmojiPicker';
import ConfirmationModal from './ConfirmationModal';

export default function SkillCard({ id, name, icon }) {
  const { state, updateSkillXp, removeSkill, updateSkill } = useGlobalState();
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevLevel, setPrevLevel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editIcon, setEditIcon] = useState(icon);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  const skill = state.skills.find(s => s.id === id);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (skill) {
      const currentLevel = calculateLevel(skill.xp);
      if (prevLevel !== null && currentLevel > prevLevel) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setPrevLevel(currentLevel);
    }
  }, [skill, prevLevel]);

  if (!skill) {
    return <div>Loading skill data...</div>;
  }

  const { xp, streak } = skill;
  const level = calculateLevel(xp);
  const xpInCurrentLevel = getXpInCurrentLevel(xp);
  const xpRequiredForNextLevel = getXpRequiredForNextLevel(xp);

  const handleAddHour = async () => {
    setIsUpdating(true);
    try {
      await updateSkillXp(id, 1);
      setError(null);
    } catch (err) {
      console.error("Error adding hour:", err);
      setError("Failed to update skill. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveClick = () => {
    setShowRemoveConfirmation(true);
  };

  const handleConfirmRemove = async () => {
    try {
      await removeSkill(id);
      setShowRemoveConfirmation(false);
    } catch (err) {
      console.error("Error removing skill:", err);
      setError("Failed to remove skill. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateSkill(id, { name: editName, icon: editIcon });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating skill:", err);
      setError("Failed to update skill. Please try again.");
    }
  };

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.error}>{error}</div>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      {isEditing ? (
        <div className={styles.editMode}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className={styles.editInput}
          />
          <EmojiPicker onSelect={setEditIcon} selectedEmoji={editIcon} />
          <Button onClick={handleSaveEdit}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <span className={styles.icon}>{icon}</span>
            <div className={styles.nameAndStreak}>
              <h3>{name}</h3>
              <span className={styles.streak}>🔥 {streak} </span>
            </div>
            <button onClick={handleEdit} className={styles.editButton}>✏️</button>
            <button onClick={handleRemoveClick} className={styles.removeButton}>X</button>
          </div>
          <div className={styles.levelDisplay}>
            <span className={styles.level}>Level <AnimatedNumber number={level} key={level} /></span>
          </div>
          <div className={styles.progressContainer}>
            <span className={styles.xpCurrent}>{xpInCurrentLevel} XP</span>
            <ProgressBar current={xpInCurrentLevel} max={xpRequiredForNextLevel} />
            <span className={styles.xpRequired}>{xpRequiredForNextLevel} XP</span>
          </div>
          <div className={styles.footer}>
            <Button 
              variant="secondary" 
              onClick={handleAddHour} 
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : '+ hour'}
            </Button>
          </div>
        </>
      )}
      {showRemoveConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to remove this skill?"
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowRemoveConfirmation(false)}
        />
      )}
    </div>
  );
}