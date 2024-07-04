'use client';

import React from 'react';
import styles from './ConfirmationModal.module.css';

export default function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p>{message}</p>
        <div className={styles.buttonContainer}>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Confirm
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}