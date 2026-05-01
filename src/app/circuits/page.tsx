import Link from 'next/link';
import { fetchRaceSchedule } from '@/lib/jolpica';
import CircuitCard from '@/components/CircuitCard';
import styles from './page.module.css';
import globalStyles from '../page.module.css';

export const metadata = {
  title: 'Circuits - OneF1',
  description: 'Explore the circuits of the current Formula 1 season.',
};

export default async function CircuitsPage() {
  // Fetch schedule which contains circuit data for each race
  const schedule = await fetchRaceSchedule();
  
  // Create a map to ensure unique circuits (in case there are multiple races at the same circuit)
  // Although rare, it handles cases like sprint weekends or double-headers
  const uniqueCircuitsMap = new Map();
  
  schedule.forEach((race: any) => {
    if (!uniqueCircuitsMap.has(race.Circuit.circuitId)) {
      uniqueCircuitsMap.set(race.Circuit.circuitId, race);
    }
  });

  const uniqueRaces = Array.from(uniqueCircuitsMap.values());

  return (
    <div className={styles.container} style={{ paddingTop: '2rem' }}>
      <main className={styles.content}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/" className={globalStyles.backButton}>
            ← Back to Dashboard
          </Link>
        </div>
        
        <h1 className={globalStyles.title} style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
          Season Circuits
        </h1>
        
        <div className={styles.grid}>
          {uniqueRaces.map((race: any) => (
            <CircuitCard
              key={race.Circuit.circuitId}
              circuit={race.Circuit}
              round={race.round}
              date={race.date}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
