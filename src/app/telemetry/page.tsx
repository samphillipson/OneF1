import React from 'react';
import Link from 'next/link';
import TelemetryDashboard from './TelemetryDashboard';
import styles from './telemetry.module.css';

export const metadata = {
  title: 'FastF1 Telemetry | F1 Data Hub',
  description: 'In-depth F1 telemetry analysis powered by FastF1 and Python.',
};

export default function TelemetryPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className="backButton" style={{ marginBottom: '2rem', display: 'inline-block' }}>
          &larr; Back to Dashboard
        </Link>
        <h1 className={styles.title}>
          FastF1 Telemetry Analysis
        </h1>
        <p className={styles.subtitle}>
          Interactive high-fidelity data pipeline powered by Python, Pandas, and FastF1
        </p>
      </div>

      <TelemetryDashboard />
    </div>
  );
}
