'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useGlobalState } from './context/GlobalStateContext';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import DashboardClient from './components/DashboardClient';
import ExampleSkillCard from './components/ExampleSkillCard';
import Navbar from './components/Navbar';
import styles from './page.module.css';
import Link from 'next/link';
import Footer from './components/Footer';

export default function Home() {
  const { data: session, status } = useSession();
  const { state } = useGlobalState();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    setIsFirstLoad(false);
  }, []);

  useEffect(() => {
    console.log("Page state:", state);
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [state, status, session]);

  if (status === "loading" || state.loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (state.error) {
    return <div className={styles.error}>Error: {state.error}</div>;
  }

  if (isFirstLoad || status === "unauthenticated" || (!state.user && status !== "authenticated")) {
    return (
      <div className={styles.landingPage}>
        <Navbar />
        <main className={styles.mainContent}>
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1 className={styles.headline}>
                Level Up in Real Life.
              </h1>
              <p className={styles.subheadline}>
                Gamify your personal growth.
                Grow your skills and make it addictive.
              </p>
              <Login buttonText="Level up now" classname={styles.loginButton} />
            </div>
            <div className={styles.heroDemo}>
              <ExampleSkillCard />
            </div>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureEmoji}>📊</span>
              <h2>Visualize Progress</h2>
              <p>See your skills grow with intuitive progress bars and level indicators.</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureEmoji}>⛰️</span>
              <h2>Stay Motivated</h2>
              <p>Maintain streaks and earn XP to keep you engaged in your personal development.</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureEmoji}>⚔️</span>
              <h2>Customize Your Journey</h2>
              <p>Create and complete quests to accelerate your levelling up journey.</p>
            </div>
          </div>
        </main>
        <Footer isVisible={true} />
      </div>
    );
  }

  if (status === "authenticated" && state.user) {
    return (
      <div className={styles.container}>
        <Login />
        <UserProfile />
        <DashboardClient />
        <Link href="/new-skill" className={styles.newSkillLink}>
          Build a New Skill
        </Link>
      </div>
    );
  }

  // If authenticated but global state is not set, show loading
  if (status === "authenticated" && !state.user) {
    return <div className={styles.loading}>Initializing user data...</div>;
  }

  return <div className={styles.error}>Unexpected state. Please try logging out and in again.</div>;
}