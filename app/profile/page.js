'use client';

import { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

export default function Profile() {
  const router = useRouter();
  const { state } = useGlobalState();
  const { user } = state;
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
  
      console.log('Account deleted');
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      // You might want to show an error message to the user here
    }
  };

  const generateXpData = () => {
    const joinDate = new Date(user.createdAt); // Assuming you have a createdAt field
    const today = new Date();
    const labels = [];
    const data = [];
    let currentDate = new Date(joinDate);
    let currentXp = 0;

    while (currentDate <= today) {
      labels.push(currentDate.toLocaleDateString());
      currentXp += Math.floor(Math.random() * 50); // Simulating random XP gain
      data.push(currentXp);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { labels, data };
  };

  const { labels, data } = generateXpData();

  const xpData = {
    labels: labels,
    datasets: [
      {
        label: 'XP',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'XP Progress Over Time',
      },
    },
  };

  return (
    <div className={styles.profilePage}>
      <h1>Profile</h1>
      <p>Hey there!</p>
      <p>You are signed in as: {user.email}</p>
      <button onClick={handleSignOut} className={styles.signOutButton}>
        Sign Out
      </button>
      <button onClick={() => setShowConfirmation(true)} className={styles.deleteButton}>
        Delete Account
      </button>

      {showConfirmation && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Are you sure you want to delete your account?</h2>
            <p>This action cannot be undone.</p>
            <button onClick={handleDeleteAccount} className={styles.confirmDelete}>
              Yes, delete my account
            </button>
            <button onClick={() => setShowConfirmation(false)} className={styles.cancelDelete}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}