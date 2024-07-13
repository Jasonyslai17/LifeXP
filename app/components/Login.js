'use client';

import { signIn, useSession } from "next-auth/react";
import Link from 'next/link';
import styles from './Login.module.css';

export default function Login({ buttonText = "Level up now", isInAppBrowser = false }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (session) {
    return <p></p>;
  }

  const handleSignIn = () => {
    if (isInAppBrowser) {
      alert("For the best experience, please open this link in your device's default web browser.");
    } else {
      signIn("google");
    }
  };

  return (
    <div className={styles.loggedOut}>
      <button onClick={handleSignIn} className={styles.signInButton}>
        {buttonText}
      </button>
      {isInAppBrowser && (
        <p className={styles.warning}>
          Note: Sign-in may not work in this browser. Please open in your default browser for the best experience.
        </p>
      )}
    </div>
  );
}