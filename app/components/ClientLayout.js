'use client';

import { useSession } from "next-auth/react";
import Sidebar from './Sidebar';

export default function ClientLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      {session && <Sidebar />}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}