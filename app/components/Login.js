'use client';

import { signIn, useSession } from "next-auth/react";
import Link from 'next/link';
import styles from './Login.module.css';

export default function Login({ buttonText = "Level up now" }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (session) {
    return <p></p>;
  }

  return (
    <div className={styles.loggedOut}>
      <button onClick={() => signIn("google")} className={styles.signInButton}>
        <img src="/game-controller-icon.svg" alt="Game Controller" className={styles.buttonIcon} />
        {buttonText}
      </button>
    </div>
  );
}