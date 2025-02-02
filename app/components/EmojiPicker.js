import React from 'react';
import styles from './EmojiPicker.module.css';

const emojis = [
  '🏋️', '📚', '🎨', '🎵', '💻', '🍳', '🏃', '🧘', '🎮', '🌱', '📝', '🗣️',
  '🚴', '🏊', '🎭', '📷', '🎸', '🧠', '🌍', '🔬', '🎯', '🧩', '🏆', '💡',
  '🌟', '🔧', '🎨', '📊', '🌿', '🧪', '🎬', '🏐', '🧗', '🎻', '🏹', '🎲'
];

export default function EmojiPicker({ onSelect, selectedEmoji }) {
  return (
    <div className={styles.emojiPicker}>
      {emojis.map((emoji, index) => (
        <button 
          key={index} 
          onClick={() => onSelect(emoji)} 
          className={`${styles.emojiButton} ${selectedEmoji === emoji ? styles.selected : ''}`}
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}