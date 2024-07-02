import React from 'react';
import styles from './EmojiPicker.module.css';

const emojis = ['🏋️', '📚', '🎨', '🎵', '💻', '🍳', '🏃', '🧘', '🎮', '🌱', '📝', '🗣️'];

export default function EmojiPicker({ onSelect }) {
  return (
    <div className={styles.emojiPicker}>
      {emojis.map((emoji, index) => (
        <button 
          key={index} 
          onClick={() => onSelect(emoji)} 
          className={styles.emojiButton}
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}