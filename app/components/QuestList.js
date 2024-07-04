// components/QuestList.js
import React from 'react';
import styles from './QuestList.module.css';

const QuestList = React.memo(({ quests, onCompleteQuest, onRemoveQuest, onEditQuest, completed = false }) => {
  return (
    <div className={styles.questList}>
      {quests.length === 0 ? (
        <p>No quests available.</p>
      ) : (
        <ul>
          {quests.map(quest => (
            <li 
              key={quest.id} 
              className={`${styles.questItem} ${completed ? styles.completed : ''}`}
            >
              <div className={styles.questInfo}>
                <span className={styles.questIcon}>{quest.icon}</span>
                <div className={styles.questDetails}>
                  <h3>{quest.title}</h3>
                  <p>{quest.description}</p>
                  <span 
                    className={`${styles.questMeta} ${styles[`difficulty-${quest.difficulty}`]}`}
                  >
                    Difficulty: {quest.difficulty} | XP Reward: {quest.xpReward}
                  </span>
                </div>
              </div>
              <div className={styles.questActions}>
                {!completed && (
                  <>
                    <button 
                      onClick={() => onCompleteQuest(quest.id, quest.xpReward)}
                      className={styles.actionButton}
                      aria-label="Complete Quest"
                    >
                      ✅
                    </button>
                    <button 
                      onClick={() => onEditQuest(quest)}
                      className={styles.actionButton}
                      aria-label="Edit Quest"
                    >
                      ✏️
                    </button>
                  </>
                )}
                <button 
                  onClick={() => onRemoveQuest(quest.id)}
                  className={styles.actionButton}
                  aria-label="Remove Quest"
                >
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default QuestList;