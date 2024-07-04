import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalStateProvider } from './context/GlobalStateContext';
import SessionProvider from './components/SessionProvider';
import ClientLayout from './components/ClientLayout'; // We'll create this new component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LifeXP",
  description: "Level up your life",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <GlobalStateProvider>
            <ClientLayout>{children}</ClientLayout>
          </GlobalStateProvider>
        </SessionProvider>
      </body>
    </html>
  );
}