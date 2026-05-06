import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.disclaimer}>
          <strong>Disclaimer:</strong> This is an unofficial fan application and university project. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V. This application is not affiliated with, endorsed by, or sponsored by Formula 1, the FIA, or Google. E-commerce functionality is simulated for educational purposes using the <span style={{ whiteSpace: 'nowrap' }}><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/250px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" style={{ height: '1em', verticalAlign: 'middle', margin: '0 2px' }} /><sup style={{ fontSize: '0.7em' }}>&reg;</sup></span> test environment. No real payments are processed.
        </p>
        <div className={styles.footerLinks}>
          <span>&copy; {new Date().getFullYear()} OneF1</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
