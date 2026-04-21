import styles from "./page.module.css";
import Dashboard from "@/components/Dashboard";
import Chatbot from "@/components/Chatbot";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.f1}>F1</span> AI Companion
        </div>
        <nav className={styles.nav}>
          <a href="#dashboard" className={styles.navLink}>Dashboard</a>
          <a href="#chat" className={styles.navLink}>AI Chat</a>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
        </nav>
      </header>
      
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Unlock the Power of Formula 1 Data</h1>
          <p className={styles.subtitle}>
            Experience real-time insights, predictive analytics, and natural language queries using our advanced AI models and the Jolpica API.
          </p>
        </section>
        
        <Dashboard />
        
        <Chatbot />
      </main>
    </div>
  );
}
