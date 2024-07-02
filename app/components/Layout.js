import { Inter } from "next/font/google";
import "./globals.css";
import GlobalStateProviderClient from './components/GlobalStateProviderClient';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LifeXP",
  description: "Level up your life",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalStateProviderClient>
          {children}
        </GlobalStateProviderClient>
      </body>
    </html>
  );
}