import styles from "./page.module.css";
import Dashboard from "@/components/Dashboard";
import Chatbot from "@/components/Chatbot";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className={styles.container}>
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
