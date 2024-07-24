'use client';

import { useSession } from "next-auth/react";
import Sidebar from './Sidebar';
import styles from './ClientLayout.module.css';

export default function ClientLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.appContainer}>
      {session && <Sidebar />}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}