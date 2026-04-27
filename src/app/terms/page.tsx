import styles from "../page.module.css";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <main className={styles.main} style={{ paddingTop: '5rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px' }}>
          <h1 className={styles.title} style={{ marginBottom: '2rem' }}>Terms of Service</h1>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--f1-red)', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              By accessing and using OneF1, you agree to be bound by these terms. This is a fan-made application and is intended for informational and entertainment purposes only.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--f1-red)', marginBottom: '1rem' }}>2. Unofficial Application</h2>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              You acknowledge that this application is not affiliated with, endorsed by, or sponsored by Formula 1, the FIA, or any racing teams. All Formula 1 trademarks are the property of their respective owners.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--f1-red)', marginBottom: '1rem' }}>3. AI Content</h2>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              The AI Assistant provides information based on processed data. While we strive for accuracy, the AI can sometimes provide incorrect or outdated information. Use the information at your own discretion.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--f1-red)', marginBottom: '1rem' }}>4. User Accounts</h2>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              You are responsible for maintaining the confidentiality of your account and password. We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Link href="/" className={styles.backButton}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.disclaimer}>
            <strong>Disclaimer:</strong> This is an unofficial fan application. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V.
          </p>
        </div>
      </footer>
    </div>
  );
}
