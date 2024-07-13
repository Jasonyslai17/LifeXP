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

function isInAppBrowser() {
  if (typeof window === 'undefined') return false; // Server-side check
  const standaloneMode = window.navigator.standalone;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const safari = /safari/.test(userAgent);
  const ios = /iphone|ipod|ipad/.test(userAgent);

  if (ios) {
    if (!standaloneMode && !safari) {
      return true;
    }
  } else if (userAgent.includes('wv')) {
    return true;
  }
  
  return false;
}

export default function Home() {
  const { data: session, status } = useSession();
  const { state } = useGlobalState();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isInAppBrowserState, setIsInAppBrowserState] = useState(false);

  useEffect(() => {
    setIsFirstLoad(false);
    setIsInAppBrowserState(isInAppBrowser());
    console.log("First load effect triggered");
  }, []);

  useEffect(() => {
    console.log("Auth state changed:");
    console.log("Page state:", state);
    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("Is first load:", isFirstLoad);
    console.log("Is in-app browser:", isInAppBrowserState);
  }, [state, status, session, isFirstLoad, isInAppBrowserState]);

  if (status === "loading" || state.loading) {
    console.log("Rendering loading state");
    return <div className={styles.loading}>Loading...</div>;
  }

  if (state.error) {
    console.log("Rendering error state:", state.error);
    return <div className={styles.error}>Error: {state.error}</div>;
  }

  if (status === "authenticated" && session && !state.user) {
    console.log("Session is authenticated but state.user is not set");
    return <div className={styles.loading}>Initializing user data...</div>;
  }

  if (isFirstLoad || status === "unauthenticated" || !state.user) {
    console.log("Rendering landing page");
    return (
      <div className={styles.landingPage}>
        <Navbar />
        <main className={styles.mainContent}>
          {isInAppBrowserState && (
            <div className={styles.warning}>
              For the best experience, please open this link in your device's default web browser.
            </div>
          )}
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1 className={styles.headline}>
                Level Up in Real Life.
              </h1>
              <p className={styles.subheadline}>
                Gamify your personal growth.
                Grow your skills and make it addictive.
              </p>
              <Login buttonText="Level up now" className={styles.loginButton} isInAppBrowser={isInAppBrowserState} />
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
    console.log("Rendering authenticated user page");
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

  console.log("Rendering unexpected state message");
  return <div className={styles.error}>Unexpected state. Please try logging out and in again.</div>;
}