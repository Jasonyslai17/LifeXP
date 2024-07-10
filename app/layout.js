import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalStateProvider } from './context/GlobalStateContext';
import SessionProvider from './components/SessionProvider';
import ClientLayout from './components/ClientLayout'; // We'll create this new component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LifeXP",
  description: "Level up your life",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest', 
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