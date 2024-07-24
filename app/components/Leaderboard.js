import { useState, useEffect } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import styles from './Leaderboard.module.css';

const TIME_PERIODS = ['24h', '7d', '30d', 'All time'];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { state } = useGlobalState();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('All time');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
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
        const leaderboardData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          xp: doc.data().xp
        }));
        console.log(`Leaderboard data for ${timePeriod}:`, leaderboardData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timePeriod]);

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>{error}</div>;

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
      {leaderboard.length > 0 ? (
        <ul className={styles.leaderList}>
          {leaderboard.map((user, index) => (
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
  );
}