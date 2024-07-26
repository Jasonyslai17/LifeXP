import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import styles from './Leaderboard.module.css';

const TIME_PERIODS = ['24h', '7d', '30d', 'All time'];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { state } = useGlobalState();
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('All time');

  useEffect(() => {
    async function fetchLeaderboard() {
      if (leaderboardData[timePeriod]) {
        return; // Data already loaded for this time period
      }

      setLoading(true);
      setError(null);

      try {
        const usersRef = collection(db, 'users');
        let q = query(usersRef, orderBy('xp', 'desc'), limit(4));

        if (timePeriod !== 'All time') {
          const date = new Date();
          if (timePeriod === '24h') date.setHours(date.getHours() - 24);
          if (timePeriod === '7d') date.setDate(date.getDate() - 7);
          if (timePeriod === '30d') date.setDate(date.getDate() - 30);
          q = query(usersRef, where('lastUpdated', '>=', date.toISOString()), orderBy('lastUpdated', 'desc'), orderBy('xp', 'desc'), limit(4));
        }

        const querySnapshot = await getDocs(q);
        const newLeaderboardData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          xp: doc.data().xp
        }));

        setLeaderboardData(prevData => ({
          ...prevData,
          [timePeriod]: newLeaderboardData
        }));
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timePeriod]);

  const currentLeaderboard = leaderboardData[timePeriod] || [];

  return (
    <div className={styles.leaderboard}>
      <h2>Leaderboard</h2>
      <div className={styles.timePeriods}>
        {TIME_PERIODS.map(period => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`${styles.timeButton} ${timePeriod === period ? styles.active : ''}`}
          >
            {period}
          </button>
        ))}
      </div>
      <div className={`${styles.leaderboardContent} ${loading ? styles.loading : ''}`}>
        {currentLeaderboard.length > 0 ? (
          <ul className={styles.leaderList}>
            {currentLeaderboard.map((user, index) => (
              <li key={user.id} className={styles.leaderboardItem}>
                <span className={styles.rank}>{MEDALS[index] || index + 1}</span>
                <span className={styles.name}>{user.name}</span>
                <span className={styles.xp}>{user.xp} XP</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data available for this time period.</p>
        )}
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}