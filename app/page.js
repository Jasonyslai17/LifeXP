import Image from "next/image";
import styles from "./page.module.css";
import Link from 'next/link'
import '../firebase/config';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>hello world</h1>
      <Link href="/posts">check out some posts</Link>
    </main>
  );
}
