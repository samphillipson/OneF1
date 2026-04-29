import { fetchRaceSchedule } from "@/lib/jolpica";
import Link from "next/link";
import styles from "./tickets.module.css";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";

import globalStyles from "../page.module.css";

export const revalidate = 3600; // Cache for 1 hour

export default async function TicketsPage() {
  let races = [];
  try {
    races = await fetchRaceSchedule();
  } catch (e) {
    console.error("Failed to fetch races for tickets page", e);
  }

  const now = new Date();
  
  // Filter for upcoming races, or show all if we want to let them see past (we'll just show upcoming for tickets)
  const upcomingRaces = races.filter((r: any) => new Date(r.date) >= now);

  return (
    <div className={styles.container} style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className={globalStyles.backButton}>
          ← Back to Dashboard
        </Link>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Upcoming Races & Tickets</h1>
        <p className={styles.subtitle}>Secure your spot at the next Grand Prix. Experience the thrill of Formula 1 live.</p>
      </header>

      {upcomingRaces.length === 0 ? (
        <div style={{ textAlign: "center", color: "#a0a0a0" }}>
          <p>No upcoming races found for this season. Check back later!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {upcomingRaces.map((race: any) => {
            const countryCodeMap: Record<string, string> = {
              "USA": "us", "United States": "us", "UK": "gb", "Great Britain": "gb",
              "Italy": "it", "Monaco": "mc", "Spain": "es", "Canada": "ca",
              "Austria": "at", "Belgium": "be", "Netherlands": "nl", "Singapore": "sg",
              "Japan": "jp", "Qatar": "qa", "UAE": "ae", "Abu Dhabi": "ae",
              "Saudi Arabia": "sa", "Bahrain": "bh", "Australia": "au", "China": "cn",
              "Azerbaijan": "az", "Hungary": "hu", "Brazil": "br", "Mexico": "mx"
            };
            const countryCode = countryCodeMap[race.Circuit.Location.country] || "un";

            return (
              <Link href={`/tickets/${race.round}`} key={race.round} className={styles.card}>
                <img 
                  src={`https://flagcdn.com/${countryCode}.svg`} 
                  alt={`${race.Circuit.Location.country} Flag`} 
                  className={styles.watermark} 
                />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                  <h2 className={styles.raceName}>{race.raceName}</h2>
                  <div className={styles.date}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    {new Date(race.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className={styles.location}>
                    <MapPin size={14} />
                    {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                  </div>
                  <div className={styles.circuit}>
                    {race.Circuit.circuitName}
                  </div>
                  
                  <div className={styles.footer}>
                    <span className={styles.roundBadge}>Round {race.round}</span>
                    <span className={styles.viewBtn}>
                      View Tickets <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
