import Link from 'next/link';
import { fetchCurrentStandings } from '@/lib/jolpica';
import DriverCard from '@/components/DriverCard';
import styles from './page.module.css';
import globalStyles from '../page.module.css';

export const metadata = {
  title: 'Drivers - OneF1',
  description: 'Updated information about current F1 drivers, grouped by team.',
};

export default async function DriversPage() {
  const standings = await fetchCurrentStandings();

  // Group drivers by team
  const teams: Record<string, any[]> = {};
  
  standings.forEach((standing: any) => {
    const teamName = standing.Constructors[0]?.name || 'Unknown Team';
    if (!teams[teamName]) {
      teams[teamName] = [];
    }
    teams[teamName].push(standing);
  });

  // Sort teams alphabetically (or could sort by constructor standings if we fetched it)
  const sortedTeams = Object.keys(teams).sort();

  return (
    <div className={styles.container} style={{ paddingTop: '2rem' }}>
      <main className={styles.content}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" className={globalStyles.backButton}>
            ← Back to Dashboard
          </Link>
        </div>
        {sortedTeams.map(teamName => (
          <section key={teamName} className={styles.teamSection}>
            <div className={styles.teamHeader}>
              <h2 className={styles.teamName}>{teamName}</h2>
            </div>
            
            <div className={styles.grid}>
              {teams[teamName].map((standing: any) => {
                const driver = standing.Driver;
                
                return (
                  <DriverCard
                    key={driver.driverId}
                    driver={driver}
                    currentPoints={standing.points}
                    currentWins={standing.wins}
                    currentPosition={standing.position}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
