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

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--f1-red)', marginBottom: '1rem' }}>5. Simulated E-Commerce & Payments</h2>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              All ticket purchases on this platform are strictly simulated for educational purposes as part of a university project. No real tickets are issued, and no real monetary transactions take place. Payment processing is simulated using the <span style={{ whiteSpace: 'nowrap' }}><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/250px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" style={{ height: '1.2em', verticalAlign: 'middle', margin: '0 4px' }} /><sup style={{ fontSize: '0.7em' }}>&reg;</sup></span> test environment.
            </p>
          </section>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Link href="/" className={styles.backButton}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
