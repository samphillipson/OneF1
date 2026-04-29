import Link from 'next/link';
import { fetchCurrentStandings, fetchQualifyingResults } from '@/lib/jolpica';
import DriverCard from '@/components/DriverCard';
import styles from './page.module.css';
import globalStyles from '../page.module.css';

export const metadata = {
  title: 'Drivers - OneF1',
  description: 'Updated information about current F1 drivers, grouped by team.',
};

export default async function DriversPage() {
  const standings = await fetchCurrentStandings();
  // Fetch latest qualifying results to calculate H2H (simulated logic)
  const lastQualifying = await fetchQualifyingResults("last");

  // Group drivers by team
  const teams: Record<string, any[]> = {};
  
  standings.forEach((standing: any) => {
    const teamName = standing.Constructors[0]?.name || 'Unknown Team';
    if (!teams[teamName]) {
      teams[teamName] = [];
    }
    teams[teamName].push(standing);
  });

  const sortedTeams = Object.keys(teams).sort();

  const getQualifyingH2H = (teamName: string) => {
    if (!lastQualifying || lastQualifying.length === 0) return null;
    const teamDrivers = teams[teamName].map(s => s.Driver.driverId);
    const results = lastQualifying.filter((q: any) => teamDrivers.includes(q.Driver.driverId));
    if (results.length < 2) return null;
    
    // Simplistic H2H: Who was faster in the last session?
    const faster = parseInt(results[0].position) < parseInt(results[1].position) ? results[0] : results[1];
    return `Last Outing: ${faster.Driver.familyName} led qualifying`;
  };

  return (
    <div className={styles.container} style={{ paddingTop: '2rem' }}>
      <main className={styles.content}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" className={globalStyles.backButton}>
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className={globalStyles.title} style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Grid Breakdown</h1>
        
        {sortedTeams.map(teamName => {
          const firstDriver = teams[teamName][0];
          const constructorId = firstDriver.Constructors[0]?.constructorId;
          
          const teamColors: Record<string, string> = {
            'red_bull': '#3671C6',
            'mercedes': '#27F4D2',
            'ferrari': '#E80020',
            'mclaren': '#FF8000',
            'aston_martin': '#229971',
            'alpine': '#0093CC',
            'haas': '#B6BABD',
            'williams': '#64C4FF',
            'rb': '#6692FF',
            'sauber': '#52E252',
            'audi': '#E11B22',
            'cadillac': '#FFD700'
          };
          
          const teamColor = teamColors[constructorId] || 'var(--f1-red)';

          return (
            <section key={teamName} className={styles.teamSection}>
              <div className={styles.teamHeader}>
                <h2 className={styles.teamName}>{teamName}</h2>
                <span className={styles.h2hBadge}>{getQualifyingH2H(teamName)}</span>
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
                      teamColor={teamColor}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
